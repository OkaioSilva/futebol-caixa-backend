require('dotenv/config'); // Import dotenv to load environment variables
const { createTransport } = require('nodemailer');

const transporter = createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendInviteEmail = (email, tokenConvite) => {
  console.log('[emailService] Enviando convite para:', email, 'com token:', tokenConvite);
  return transporter.sendMail({
    to: email,
    subject: 'Você foi convidado para o Sistema de Caixa!',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #2ecc71;">Convite para o Sistema de Caixa</h2>
        <p>Olá,</p>
        <p>Você foi convidado para acessar o <b>Sistema de Caixa</b> do Futebol!</p>
        <p>Para criar sua conta, acesse o sistema normalmente e utilize o seguinte <b>Token de Convite</b>:</p>
        <div style="background: #fff; border: 1px solid #2ecc71; border-radius: 4px; padding: 12px; margin: 16px 0; font-size: 1.2em; color: #2ecc71; text-align: center; font-weight: bold; letter-spacing: 2px;">${tokenConvite || '<b style=\'color:red\'>TOKEN NÃO GERADO</b>'}</div>
        <p>Copie e cole esse token no campo solicitado ao criar sua conta.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 0.9em; color: #888;">Se você não esperava este convite, apenas ignore este e-mail.</p>
      </div>
    `,
  });
};

const sendResetPasswordEmail = (email, resetUrl) => {
  return transporter.sendMail({
    to: email,
    subject: 'Redefinição de senha - Futebol Caixa',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #3498db;">Redefinição de senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Para criar uma nova senha, clique no botão abaixo:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #3498db; color: #fff; border-radius: 4px; text-decoration: none; font-weight: bold; margin: 16px 0;">Redefinir senha</a>
        <p>Se não solicitou, ignore este e-mail.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 0.9em; color: #888;">O link expira em 1 hora.</p>
      </div>
    `
  });
};

module.exports = { sendInviteEmail, sendResetPasswordEmail };