const { link } = require("../services/link");

const test = async (req, res) => {
  res.send({ message: `${process.env.SERVICE_NAME} funcionando...` });
};

const compraProdutoEtapaAlterada = async (req, res) => {
  if (req.body.ping) return res.send({ pong: true });

  const secretKey = req.headers.secretkey;

  const { appKey, appHash, event, author } = req.body;
  const { cEtapa, nCodPed } = event.cabecalho_consulta;

  if (cEtapa === process.env.ETAPA_LINK) link(secretKey, appKey, nCodPed, author);

  res.send();
};

module.exports = { test, compraProdutoEtapaAlterada };
