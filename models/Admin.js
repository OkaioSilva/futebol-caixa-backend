const pool = require('../config/db');
const Admin = {
    async findByEmail(email) {
        try {
            const result = await pool.query(
                'SELECT * FROM admins WHERE email = $1', 
                [email]
            );
            return result.rows[0];
        } catch (err) {
            console.error('Erro ao buscar admin por email:', err);
            throw err;
        }
    },

    async create({ nome, email, senha_hash }) {
        try {
            const result = await pool.query(
                `INSERT INTO admins (nome, email, senha_hash, criado_em) 
                    VALUES ($1, $2, $3, NOW()) 
                    RETURNING id, nome, email, criado_em`,
                [nome, email, senha_hash]
            );
            return result.rows[0];
        } catch (err) {
            console.error('Erro ao criar admin:', err);
            // Verifica se é erro de duplicata
            if (err.code === '23505') {
                throw new Error('Email já cadastrado');
            }
            throw err;
        }
    },

    async findById(id) {
        try {
            const result = await pool.query(
                'SELECT id, nome, email, criado_em FROM admins WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } catch (err) {
            console.error('Erro ao buscar admin por ID:', err);
            throw err;
        }
    },
    async updateSenha(id, senha_hash){
        await pool.query('UPDATE admins SET senha_hash = $1 WHERE id = $2', [senha_hash, id]);
    }
};

module.exports = Admin;