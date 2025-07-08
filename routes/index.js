const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const caixaRoutes = require('./caixaRoutes');
const CaixaController = require('../controllers/caixaController');
const { listarMensalistasPublicos } = require('../controllers/adminController');

// Rotas públicas
router.get('/mensalistas/public', listarMensalistasPublicos);
router.use('/auth', authRoutes);
// router.use('/mensalistas', mensalistasRoutes);
router.get('/caixa/public', CaixaController.getCaixaPublico);

// Rotas protegidas
router.use('/admin', adminRoutes);
router.use('/caixa', caixaRoutes);
router.use('/ocorrencias', require('./ocorrenciasRoutes'));

module.exports = router;