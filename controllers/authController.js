const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { sendInviteEmail, sendResetPasswordEmail } = require('../services/emailService').default;
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { gerarTokenConvite, validarTokenConvite } = require('../utils/inviteToken');

module.exports = {
  async login(req, res) {
    // Validação dos dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, senha } = req.body;
    // Em produção, não logar email
    if (process.env.NODE_ENV === 'development') {
      console.log('Tentativa de login com:', email);
    }
    
    try {
      const admin = await Admin.findByEmail(email);
      if (!admin) {
        console.log('Email não encontrado:', email);
        return res.status(404).json({ error: 'Credenciais inválidas' }); // Mensagem genérica por segurança
      }
      
      const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
      if (!senhaValida) {
        console.log('Senha inválida para:', email);
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido nas variáveis de ambiente');
      }

      const token = jwt.sign(
        { 
          id: admin.id,
          email: admin.email,
          nome: admin.nome 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '8h' } // Aumentado para melhor UX
      );

      console.log('Login bem-sucedido para:', admin.email);
      res.json({ 
        token,
        admin: {
          id: admin.id,
          nome: admin.nome,
          email: admin.email
        }
      });
      
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({ 
        error: 'Falha na autenticação',
        details: process.env.NODE_ENV === 'development' ? err.message : null
      });
    }
  },

  async enviarConvite(req, res) {
    // Apenas admins autenticados podem enviar convite
    if (!req.adminId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const { email } = req.body;
    // Validação simples de email
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }
    try {
      const tokenConvite = gerarTokenConvite();
      await sendInviteEmail(email, tokenConvite);
      res.json({ message: 'Convite enviado!' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao enviar convite' });
    }
  }, 
  async registrarAdmin(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { nome, email, senha, tokenConvite } = req.body;
    if (!validarTokenConvite(tokenConvite)) {
      return res.status(401).json({ error: 'Token de convite inválido ou expirado' });
    }
    try {
      const senhaHash = await bcrypt.hash(senha, 10);
      const admin = await Admin.create({
        nome, 
        email,
        senha_hash: senhaHash });
      res.status(201).json(admin);
    } catch (err) {
      console.error('Erro detalhado: ', err)
      res.status(500).json({ error: 'Erro ao criar admin',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  async getAdminData(req, res){
    try{
      const adminId = req.adminId;
      const admin = await Admin.findById(adminId)

      if(!admin){
        return res.status(404).json({error: 'Admin não encontrado'});
      }

      const adminData = {
        id: admin.id,
        name: admin.nome,
        email: admin.email,
        criadoEm: admin.criado_em
      }

      res.json(adminData)
    }catch(e){
      res.status(500).json({error: 'Erro ao buscar dados do admin'})
    }
  },
  async esqueciSenha(req, res) {
    const {email} = req.body;
    const admin =  await Admin.findByEmail(email);
    if(!admin) return res.status(200).json({message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'});

    const token = jwt.sign(
      {id:admin.id, email: admin.email},
      process.env.JWT_SECRET,
      {expiresIn: '1h'} // Token válido por 1 hora
    );

    const resetUrl = `${process.env.FRONTEND_URL}/redefinir-senha/${token}`;
    await sendResetPasswordEmail(admin.email, resetUrl);
    res.json({message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'});
  },

  async redefinirSenha(req, res) {
    const { token } = req.params;
    const { senha } = req.body;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const senha_hash = await bcrypt.hash(senha, 10);
      await Admin.updateSenha(decoded.id, senha_hash);
      res.json({ message: 'Senha redefinida com sucesso!' });
    } catch(err){
      res.status(400).json({Error: 'Token inválido ou expirado'});
    }
  }
};