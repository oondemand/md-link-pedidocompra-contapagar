const express = require("express");
const { authMiddlewareSecretKey } = require("../middlewares/authMiddleware");
const IndexController = require("../controllers/indexController");
const router = express.Router();

router.get("/", IndexController.test);
router.post(
  "/compra-produto/etapa-alterada",
  authMiddlewareSecretKey,
  IndexController.compraProdutoEtapaAlterada
);

module.exports = router;
