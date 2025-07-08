const { body, validationResult } = require('express-validator');

// Validação para login
const loginValidation = [
    body('email').isEmail().withMessage('E-mail inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
];

// Validação para registro de admin
const registerValidation = [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('tokenConvite').notEmpty().withMessage('Token de convite é obrigatório'),
];

module.exports = {
    loginValidation,
    registerValidation,
};
