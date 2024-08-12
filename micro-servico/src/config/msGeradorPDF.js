const axios = require("axios");

const baseURL = process.env.MS_GERADOR_PDF;
const login = process.env.MS_LOGIN;
const senha = process.env.MS_SENHA;

const authHeader = `Basic ${Buffer.from(`${login}:${senha}`).toString("base64")}`;

const msGeradorPDF = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Authorization: authHeader,
  },
});

module.exports = msGeradorPDF;
