const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginValidation, registerValidation } = require('../middlewares/validationMiddleware');

router.post('/login', loginValidation, AuthController.login);
router.post('/convite', authMiddleware, AuthController.enviarConvite);
router.post('/registro', registerValidation, AuthController.registrarAdmin);
router.get('/admin', authMiddleware, AuthController.getAdminData);

//recuperação de senha
router.post('/esqueci-senha', AuthController.esqueciSenha);
router.post('/redefinir-senha/:token', AuthController.redefinirSenha);

module.exports = router;