const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'fallback_secret';

function gerarTokenConvite() {
  const hora = new Date();
  hora.setMinutes(0, 0, 0); // Zera minutos, segundos, ms
  const base = `${SECRET}:${hora.toISOString().slice(0,13)}`; // até a hora
  return crypto.createHmac('sha256', SECRET).update(base).digest('hex').slice(0, 12); // 12 chars
}

function validarTokenConvite(token) {
  // Aceita token da hora atual ou da hora anterior (tolerância de clock)
  const agora = new Date();
  const horas = [0, -1].map(offset => {
    const h = new Date(agora);
    h.setHours(h.getHours() + offset, 0, 0, 0);
    return h;
  });
  return horas.some(h => {
    const base = `${SECRET}:${h.toISOString().slice(0,13)}`;
    const valido = crypto.createHmac('sha256', SECRET).update(base).digest('hex').slice(0, 12);
    return token === valido;
  });
}

module.exports = { gerarTokenConvite, validarTokenConvite };
