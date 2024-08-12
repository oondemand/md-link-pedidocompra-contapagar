const crypto = require("crypto");
const ejs = require("ejs");
const { format } = require("date-fns");
const { ptBR } = require("date-fns/locale");

const msAppOmie = require("../config/msAppOmie");
const msTemplateEJS = require("../config/msTemplateEJS");
const msGeradorPDF = require("../config/msGeradorPDF");
const msAnexoOmie = require("../config/msAnexoOmie");

const pedidoCompraService = require("./omie/pedidoCompraService");
const contaPagarService = require("./omie/contaPagarService");
const departamentoService = require("./omie/departamentoService");
const clienteService = require("./omie/clienteService");
const msEmail = require("../config/msEmail");

const link = async (secretKey, appKey, nCodPed, autor) => {
  console.log(`Iniciando processo de link entre pedido de compra ${nCodPed} e contas a pagar`);

  const resEmpresa = await msAppOmie.get(`app-omie?secretKey=${secretKey}&appKey=${appKey}`);
  const empresa = resEmpresa.data[0];
  if (!empresa) throw new Error("Empresa não encontrada");

  const pedido = await pedidoCompraService.consultar(empresa.appKey, empresa.appSecret, nCodPed);
  if (!pedido) throw new Error("Pedido de compra não encontrado");

  try {
    const dataAtual = format(new Date(), "dd/MM/yy HH:mm", { locale: ptBR });

    let msg = "Link para contas a pagar:\n";
    const resTemplate = await msTemplateEJS.get(
      `template?secretKey=${secretKey}&nome=pedido-de-compra`
    );
    const template = resTemplate.data[0].templateEjs;

    const departamentos = await departamentoService.listar(empresa.appKey, empresa.appSecret);
    const fornecedor = await clienteService.consultar(
      empresa.appKey,
      empresa.appSecret,
      pedido.cabecalho_consulta.nCodFor
    );

    const variaveisTemplate = { pedido, departamentos, fornecedor, autor, empresa, dataAtual };
    const renderedHtml = await ejs.render(template, variaveisTemplate);
    const pdfBuffer = await gerarPDF(secretKey, renderedHtml);

    const totalParcelas = pedido.parcelas_consulta.length;

    for (const [index, parcela] of pedido.parcelas_consulta.entries()) {
      console.log("Incluindo conta: ", index + 1, "de", totalParcelas);

      const numeroParcelaAtual = index + 1;
      const parcelaFormatada = `${String(numeroParcelaAtual).padStart(3, "0")}/${String(
        totalParcelas
      ).padStart(3, "0")}`;
      const conta = await criarConta(pedido, parcelaFormatada, parcela.dVencto, parcela.nValor);
      // console.log("Conta criada: ", JSON.stringify(conta));

      const contaIncluida = await contaPagarService.incluir(
        empresa.appKey,
        empresa.appSecret,
        conta
      );
      const id = contaIncluida.codigo_lancamento_omie;

      await incluirAnexo(
        secretKey,
        empresa.appKey,
        empresa.appSecret,
        id,
        pdfBuffer,
        pedido.cabecalho_consulta.cNumero
      );
      msg += `Conta ${id} cadastrada\n`;
      console.log(`Conta ${id} cadastrada\n`);

      await delay(3000);
    }

    console.log("Alterando etapa do pedido de compra...");
    const novaObs = msg + pedido.cabecalho_consulta.cObs;
    const pedidoNovo = pedidoAlterado(pedido.cabecalho_consulta.nCodPed, novaObs);
    pedidoCompraService.alterar(empresa.appKey, empresa.appSecret, pedidoNovo);

    await enviarEmail(pedido, fornecedor, autor);

    console.log("Processo finalizado");
  } catch (error) {
    console.log("Erro ao processar link pedido de compra para contas a pagar: ", error);

    const msg = "Erro ao processar Link: " + error;
    const novaObs = msg + pedido.cabecalho_consulta.cObs;
    const pedidoNovo = pedidoAlterado(pedido.cabecalho_consulta.nCodPed, novaObs);
    pedidoCompraService.alterar(empresa.appKey, empresa.appSecret, pedidoNovo);
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const incluirAnexo = async (secretKey, appKey, appSecret, id, arquivo, numeroPedido) => {
  console.log("Incluindo anexo...");
  try {
    const requestBody = {
      appKey,
      appSecret,
      tabela: "conta-pagar",
      id,
      nomeArquivo: `pedido-de-compra-${numeroPedido}.pdf`,
      tipoArquivo: "pdf",
      arquivo,
    };

    const response = await msAnexoOmie.post(`incluir-anexo?secretKey=${secretKey}`, requestBody);
    return response.data;
  } catch (error) {
    throw ("Erro ao incluir anexo: ", error);
  }
};

const gerarPDF = async (secretKey, html) => {
  console.log("Gerando PDF...");
  try {
    const response = await msGeradorPDF.post(
      `gerar-pdf?secretKey=${secretKey}`,
      { html },
      { responseType: "arraybuffer" }
    );
    return response.data;
  } catch (error) {
    throw new Error("Erro ao gerar PDF: " + error);
  }
};

const pedidoAlterado = (nCodPed, observacao) => {
  const pedido = {
    cabecalho_alterar: {
      nCodPed: nCodPed,
      cObs: observacao,
    },
  };
  return pedido;
};

const criarConta = async (pedido, parcela, dataVencimento, valor) => {
  let distribuicao = [];
  pedido.departamentos_consulta.map((departamento) => {
    distribuicao.push({
      cCodDep: departamento.cCodDepto,
      nPerDep: departamento.nPerc,
    });
  });

  const conta = {
    codigo_lancamento_integracao: crypto.randomUUID(),
    codigo_cliente_fornecedor: pedido.cabecalho_consulta.nCodFor,
    data_vencimento: dataVencimento,
    valor_documento: valor,
    numero_parcela: parcela,
    codigo_categoria: pedido.cabecalho_consulta.cCodCateg,
    data_previsao: dataVencimento,
    id_conta_corrente: pedido.cabecalho_consulta.nCodCC,
    data_emissao: pedido.cabecalho_consulta.dDtPrevisao,
    data_entrada: pedido.cabecalho_consulta.dDtPrevisao,
    codigo_projeto: pedido.cabecalho_consulta.nCodProj,
    observacao: pedido.cabecalho_consulta.cObs,
    numero_pedido: pedido.cabecalho_consulta.cNumero,
    aprendizado_rateio: "S",
    distribuicao,
  };
  return conta;
};

const enviarEmail = async (pedido, fornecedor, autor) => {
  const emailDestinatario = `${autor.email},${process.env.EMAIL_FINANCEIRO},fabio.anaia.aiello@gmail.com,fabio@pdvseven.com.br`;
  console.log(`Enviando emails para ${emailDestinatario}...`);

  try {
    const email = {
      remetente: {
        email: "notificacao@oondemand.com.br",
        nome: "notificação oondemand",
      },
      emailDestinatario,
      assunto: `Conta a Pagar Criada - Pedido N. ${pedido.cabecalho_consulta.cNumero}`,
      mensagem: `Compra do Fornecedor: ${fornecedor.razao_social} aprovada e gerado Conta a Pagar`,
    };

    const response = await msEmail.post("enviar-email", email);
    return response.data;
  } catch (error) {
    console.log("Erro ao enviar email: ", error);
  }
};

module.exports = { link };
