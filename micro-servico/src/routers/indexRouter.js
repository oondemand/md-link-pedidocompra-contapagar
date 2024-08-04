const express = require("express");
const IndexController = require("../controllers/indexController");
const router = express.Router();

router.get("/", IndexController.test);
router.post("/compra-produto/etapa-alterada", IndexController.compraProdutoEtapaAlterada);

module.exports = router;
