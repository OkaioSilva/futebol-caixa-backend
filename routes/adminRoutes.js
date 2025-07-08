const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
    registrarMensalista,
    atualizarMensalista,
    registrarMovimentacao,
    listarCaixa,
    listarMensalistas,
    registrarVisitante,
    atualizarPagamento,
    excluirMensalista,
    listarVisitantes,
    convidarUsuario,
    relatorioMensal,
    gerarMensalidadesPendentes,
    registrarPagamentoMensalidade,
    relatorioMensalDetalhado
} = require("../controllers/adminController");

router.post("/mensalistas", authMiddleware, registrarMensalista);
router.post("/visitantes", authMiddleware, registrarVisitante);
router.post("/caixa", authMiddleware, registrarMovimentacao);
router.post("/convidar", authMiddleware, convidarUsuario);
router.post("/mensalidades/gerar", authMiddleware, gerarMensalidadesPendentes);
router.put("/mensalistas/:id/pagamento", authMiddleware, atualizarPagamento);
router.put("/mensalistas/:id/pagar-mensalidade", authMiddleware, registrarPagamentoMensalidade);
router.get("/visitantes", authMiddleware, listarVisitantes);
router.get("/mensalistas", authMiddleware, listarMensalistas);
router.get("/caixa", authMiddleware, listarCaixa);
router.get("/caixa/relatorio-mensal", authMiddleware, relatorioMensal);
router.get("/relatorio/mensal-detalhado", authMiddleware, relatorioMensalDetalhado);
router.delete("/mensalistas/:id", authMiddleware, excluirMensalista);
router.delete("/admin/mensalistas/:id", authMiddleware, excluirMensalista);

module.exports = router;
