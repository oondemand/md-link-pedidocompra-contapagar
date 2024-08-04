const axios = require("axios");

const msAppOmie = axios.create({
  baseURL: process.env.MS_APP_OMIE,
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = msAppOmie;
