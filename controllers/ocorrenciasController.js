const pool = require('../config/db');

const criarOcorrencia = async (req, res) => {
    const { mensalista_id, descricao, tipo } = req.body;
    const admin_id = req.adminId;
    if (!mensalista_id || !descricao || !tipo) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO ocorrencias (mensalista_id, descricao, tipo, admin_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [mensalista_id, descricao, tipo, admin_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar ocorrência:', err);
        res.status(500).json({ error: 'Erro ao criar ocorrência.' });
    }
};

const listarOcorrencias = async (req, res) => {
    const { mensalista_id } = req.query;
    try {
        let query = `SELECT o.*, m.nome as mensalista_nome, a.nome as admin_nome FROM ocorrencias o
                    JOIN mensalistas m ON o.mensalista_id = m.id
                    JOIN admins a ON o.admin_id = a.id`;
        const params = [];
        if (mensalista_id) {
            query += ' WHERE o.mensalista_id = $1';
            params.push(mensalista_id);
        }
        query += ' ORDER BY o.data_ocorrencia DESC';
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao listar ocorrências:', err);
        res.status(500).json({ error: 'Erro ao listar ocorrências.' });
    }
};

const editarOcorrencia = async (req, res) => {
    const { id } = req.params;
    const { descricao, tipo } = req.body;
    try {
        const result = await pool.query(
            `UPDATE ocorrencias SET descricao = $1, tipo = $2 WHERE id = $3 RETURNING *`,
            [descricao, tipo, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ocorrência não encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao editar ocorrência:', err);
        res.status(500).json({ error: 'Erro ao editar ocorrência.' });
    }
};

const excluirOcorrencia = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM ocorrencias WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ocorrência não encontrada.' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Erro ao excluir ocorrência:', err);
        res.status(500).json({ error: 'Erro ao excluir ocorrência.' });
    }
};

module.exports = {
    criarOcorrencia,
    listarOcorrencias,
    editarOcorrencia,
    excluirOcorrencia
};
