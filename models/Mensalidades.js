const pool = require('../config/db');

const Mensalidades = {
    // Cria mensalidades pendentes para todos os mensalistas ativos para o mês/ano atual
    async gerarMensalidadesPendentes(mes, ano) {
        // Busca todos os mensalistas
        const mensalistas = await pool.query('SELECT id FROM mensalistas');
        for (const m of mensalistas.rows) {
            // Verifica se já existe mensalidade para o mês/ano
            const existe = await pool.query(
                'SELECT 1 FROM mensalidades WHERE mensalista_id = $1 AND mes = $2 AND ano = $3',
                [m.id, mes, ano]
            );
            if (existe.rowCount === 0) {
                await pool.query(
                    'INSERT INTO mensalidades (mensalista_id, mes, ano) VALUES ($1, $2, $3)',
                    [m.id, mes, ano]
                );
            }
        }
    },

    // Marca a mensalidade mais antiga como paga
    async registrarPagamento(mensalista_id) {
        // Busca a mensalidade mais antiga pendente
        const { rows } = await pool.query(
            'SELECT id FROM mensalidades WHERE mensalista_id = $1 AND status = $2 ORDER BY ano, mes LIMIT 1',
            [mensalista_id, 'pendente']
        );
        if (rows.length > 0) {
            await pool.query(
                'UPDATE mensalidades SET status = $1, data_pagamento = NOW() WHERE id = $2',
                ['pago', rows[0].id]
            );
        }
    },

    // Retorna mensalistas com mensalidades pendentes, quantidade e valor devido
    async listarPendentes() {
        const result = await pool.query(`
            SELECT m.id, m.nome, COUNT(ms.id) as meses_pendentes, SUM(ms.valor) as valor_devido
            FROM mensalistas m
            JOIN mensalidades ms ON ms.mensalista_id = m.id AND ms.status = 'pendente'
            GROUP BY m.id, m.nome
            ORDER BY meses_pendentes DESC, m.nome
        `);
        return result.rows;
    },

    // Retorna mensalistas com mais de uma mensalidade atrasada
    async listarMaisDeUmAtraso() {
        const result = await pool.query(`
            SELECT m.id, m.nome, COUNT(ms.id) as meses_pendentes, SUM(ms.valor) as valor_devido
            FROM mensalistas m
            JOIN mensalidades ms ON ms.mensalista_id = m.id AND ms.status = 'pendente'
            GROUP BY m.id, m.nome
            HAVING COUNT(ms.id) > 1
            ORDER BY meses_pendentes DESC, m.nome
        `);
        return result.rows;
    }
};

module.exports = Mensalidades;
