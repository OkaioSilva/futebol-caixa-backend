const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const ocorrenciasController = require('../controllers/ocorrenciasController');

router.post('/', authMiddleware, ocorrenciasController.criarOcorrencia);
router.get('/', authMiddleware, ocorrenciasController.listarOcorrencias);
router.put('/:id', authMiddleware, ocorrenciasController.editarOcorrencia);
router.delete('/:id', authMiddleware, ocorrenciasController.excluirOcorrencia);

module.exports = router;
