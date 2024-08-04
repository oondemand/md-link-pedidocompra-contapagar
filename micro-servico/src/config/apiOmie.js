const { default: axios } = require("axios");

const apiOmie = axios.create({
  baseURL: process.env.API_OMIE,
  timeout: 10000, // tempo limite em milissegundos
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = apiOmie;
