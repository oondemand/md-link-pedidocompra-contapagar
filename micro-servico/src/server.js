require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");

const logger = require("./config/logger");

const indexRouter = require("./routers/indexRouter");

let server = null;

const start = async () => {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public")));

  app.use("/", indexRouter);

  app.use((error, req, res, next) => {
    logger.error(`${error.stack}`);
    res.status(500).send("Erro interno no servidor");
  });

  const porta = process.env.PORT || 3000;
  server = app.listen(porta, () => {
    console.log(`Serviço ${process.env.SERVICE_NAME} subiu na porta ${porta}`);
  });

  return server;
};

const stop = async () => {
  if (server) await server.close();
  return true;
};

module.exports = { start, stop };
