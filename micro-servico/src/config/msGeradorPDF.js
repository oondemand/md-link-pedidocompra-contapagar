const axios = require("axios");

const msGeradorPDF = axios.create({
  baseURL: process.env.MS_GERADOR_PDF,
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = msGeradorPDF;
