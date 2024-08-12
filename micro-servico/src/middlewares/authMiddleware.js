const msAppOonDemand = require("../config/msOondemand");

const authMiddleware = async (req, res, next) => {
  // Obtém a secretKey dos cabeçalhos ou da query string
  const secretKey = req.headers.secretkey || req.query.secretKey;
  if (!secretKey) {
    return res.status(400).send({ message: "SecretKey é necessária" });
  }

  // Obtém as credenciais de autenticação do cabeçalho Authorization
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ message: "Cabeçalho de autenticação é necessário" });
  }

  // Decodifica as credenciais de autenticação
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
  const [login, password] = credentials.split(":");

  if (!login || !password) {
    return res.status(401).json({ message: "Credenciais de autenticação são necessárias" });
  }

  try {
    // Passa a secretKey nos headers da requisição
    const response = await msAppOonDemand.post("/login", { login, senha: password });

    if (response.status === 200) {
      req.user = response.data.usuario;
      req.headers.secretkey = secretKey;
      delete req.query.secretKey;

      next();
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor", error });
  }
};

const authMiddlewareSecretKey = async (req, res, next) => {
  // Obtém a secretKey dos cabeçalhos ou da query string
  const secretKey = req.headers.secretkey || req.query.secretKey;
  if (!secretKey) {
    return res.status(400).send({ message: "SecretKey é necessária" });
  }

  // Verifica se sistema está ativo
  const sistemaData = await msAppOonDemand.get(`sistema?app.secretKey=${secretKey}`);
  const sistema = sistemaData.data[0];

  if (!sistema) {
    throw new Error("Sistema não encontrado");
  }

  if (sistema.status !== "ativo") {
    throw new Error("Sistema inativo");
  }

  try {
    // Passa a secretKey nos headers da requisição
    req.headers.secretkey = secretKey;
    delete req.query.secretKey;

    next();
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor", error });
  }
};

module.exports = { authMiddleware, authMiddlewareSecretKey };
