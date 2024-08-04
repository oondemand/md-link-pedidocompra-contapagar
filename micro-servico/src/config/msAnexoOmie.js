const axios = require("axios");

const msAnexoOmie = axios.create({
  baseURL: process.env.MS_ANEXO_OMIE,
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = msAnexoOmie;
