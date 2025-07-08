const express = require('express');
const router = express.Router();
const CaixaController = require('../controllers/caixaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, CaixaController.getCaixaPublico);

module.exports = router;