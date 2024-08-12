const axios = require("axios");

const baseURL = process.env.MS_EMAIL;
const login = process.env.MS_LOGIN;
const senha = process.env.MS_SENHA;

const authHeader = `Basic ${Buffer.from(`${login}:${senha}`).toString("base64")}`;

const msEmail = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Authorization: authHeader,
  },
});

module.exports = msEmail;
