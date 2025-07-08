const pool = require('../config/db');

const Mensalista = {
    async listar() {
    const result = await pool.query('SELECT * FROM mensalistas');
    return result.rows;
    },
};

module.exports = Mensalista;