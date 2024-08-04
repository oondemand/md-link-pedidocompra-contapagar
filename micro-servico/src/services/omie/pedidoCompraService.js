const apiOmie = require("../../config/apiOmie");

const consultar = async (appKey, appSecret, nCodPed) => {
  try {
    const body = {
      call: "ConsultarPedCompra",
      app_key: appKey,
      app_secret: appSecret,
      param: [{ nCodPed: nCodPed }],
    };

    const response = await apiOmie.post("produtos/pedidocompra/", body);
    return response.data;
  } catch (error) {
    if (error.response)
      throw (
        "Erro ao consultar produtos/pedidocompra: " + JSON.stringify(error.response.data, null, 2)
      );
    else throw "Erro ao consultar produtos/pedidocompra: " + error;
  }
};

const alterar = async (appKey, appSecret, pedido) => {
  try {
    const body = {
      call: "AlteraPedCompra",
      app_key: appKey,
      app_secret: appSecret,
      param: [pedido],
    };

    const response = await apiOmie.post("produtos/pedidocompra/", body);
    return response.data;
  } catch (error) {
    if (error.response)
      throw (
        "Erro ao alterar produtos/pedidocompra: " + JSON.stringify(error.response.data, null, 2)
      );
    else throw "Erro ao alterar produtos/pedidocompra: " + error;
  }
};

const pedidoCompraService = { consultar, alterar };
module.exports = pedidoCompraService;
