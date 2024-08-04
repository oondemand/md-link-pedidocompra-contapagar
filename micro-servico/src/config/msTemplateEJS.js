const axios = require("axios");

const msTemplateEJS = axios.create({
  baseURL: process.env.MS_TEMPLATE_EJS,
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = msTemplateEJS;
