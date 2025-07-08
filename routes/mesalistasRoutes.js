const express = require('express');
const router = express.Router();
const MensalistaController = require('../controllers/mensalistaController');


//rota pública
router.get('/', MensalistaController.listaMensalistasPublicos);

module.exports = router;