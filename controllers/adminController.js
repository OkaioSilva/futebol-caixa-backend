const pool = require('../config/db');
const { sendInviteEmail } = require('../services/emailService');
const { gerarTokenConvite } = require('../utils/inviteToken');
const Mensalidades = require('../models/Mensalidades');

module.exports = {
    async registrarMensalista(req, res) {
        const { nome, dias_jogo, is_dp } = req.body;
        // dias_jogo deve ser 'segunda', 'quarta' ou 'segunda e quarta'
        const dias = dias_jogo || 'segunda';
        const nomeExibicao = `${nome} (${dias})`;
        const query = `
            INSERT INTO mensalistas (nome, status_pagamento, dias_jogo, is_dp) VALUES ($1, 'pendente', $2, $3) RETURNING *
        `;
        const { rows } = await pool.query(query, [nomeExibicao, dias, !!is_dp]);
        res.status(201).json(rows[0])
    },

    async atualizarPagamento(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        const dataPagamento = status === 'pago' ? new Date() : null;
        const query = `
            UPDATE mensalistas SET status_pagamento = $1, data_pagamento = $2 WHERE id = $3 RETURNING *
        `;
        const { rows } = await pool.query(query, [status, dataPagamento, id]);
        const mensalista = rows[0];
        if(status === 'pago' && !mensalista.is_dp){
            // Buscar nome do admin
            const adminResult = await pool.query('SELECT nome FROM admins WHERE id = $1', [req.adminId]);
            const adminNome = adminResult.rows[0]?.nome || 'Admin';
            // Valor proporcional ao número de dias
            let valor = 20;
            if (mensalista.dias_jogo && mensalista.dias_jogo.includes('e')) valor = 40;
            await pool.query(
                `INSERT INTO caixa (tipo, valor, descricao, admin_id) VALUES ($1, $2, $3, $4)`, 
                ['entrada', valor, `Pagamento mensalista: ${mensalista.nome} (registrado por ${adminNome})`, req.adminId]
            );
        }
        res.json(mensalista);
    },

    async registrarMovimentacao(req, res) {
        const { tipo, valor, descricao } = req.body;
        const query = `
            INSERT INTO caixa (tipo, valor, descricao, admin_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        const { rows } = await pool.query(query, [tipo, valor, descricao, req.adminId]);
        res.status(201).json(rows[0]);
    },
    async listarCaixa(req, res) {

        const query = `
        SELECT 
        id,
        tipo,
        valor,
        descricao,  
        TO_CHAR(data_criacao, 'DD/MM/YYYY HH24:MI') as data_formatada
        FROM caixa
        ORDER BY data_criacao DESC
    `;

        const { rows } = await pool.query(query);
        const entradas = await pool.query(
            'SELECT SUM(valor) FROM caixa WHERE tipo = $1', ['entrada']
        );
        const saidas = await pool.query(
            'SELECT SUM(valor) FROM caixa WHERE tipo = $1', ['saida']
        );
        res.json({
            entradas: entradas.rows[0].sum || 0,
            saidas: saidas.rows[0].sum || 0,
            movimentacoes: rows
        });
    }
    ,
    async listarMensalistas(req, res) {
        const { rows } = await pool.query(`
            SELECT id, nome, status_pagamento as status, data_pagamento as "dataPagamento", dias_jogo, is_dp
            FROM mensalistas
            ORDER BY nome`);
        res.json(rows);
    },
    async registrarVisitante(req, res) {
        console.log('DEBUG registrarVisitante req.body:', req.body);
        const { nome, valor_pago } = req.body;
        try {
            await pool.query('BEGIN');
            // Insere visitante
            const visitanteResult = await pool.query(
                `INSERT INTO visitantes (nome, valor_pago) VALUES ($1, $2) RETURNING *`,
                [nome, valor_pago]
            );
            // Registra entrada no caixa
            await pool.query(
                `INSERT INTO caixa (tipo, valor, descricao, admin_id) VALUES ($1, $2, $3, $4)`,
                ['entrada', valor_pago, `Entrada de visitante: ${nome}`, req.adminId]
            );
            await pool.query('COMMIT');
            res.status(201).json(visitanteResult.rows[0]);
        } catch (err) {
            await pool.query('ROLLBACK');
            console.error('Erro ao registrar visitante:', err);
            res.status(500).json({ error: 'Erro ao registrar visitante' });
        }
    },

    async listarVisitantes(req, res) {
        try {
            const { rows } = await pool.query(`SELECT id, nome, valor_pago, data_visita FROM visitantes ORDER BY id DESC`);
            res.json(rows);
        } catch (err) {
            console.error('Erro ao listar visitantes:', err);
            res.status(500).json({ error: 'Erro ao listar visitantes' });
        }
    },

    async listarMensalistasPublicos(req, res) {
        try {
            const { rows } = await pool.query(`
                SELECT 
                id,
                COALESCE(nome, '') as nome,
                COALESCE(status_pagamento, 'pendente') as status,
                data_pagamento as "dataPagamento"
                FROM mensalistas
                ORDER BY status, nome
            `);
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao buscar mensalistas' });
        }
    },
    async excluirMensalista(req, res) {
        try {
            const { id } = req.params;

            // Verificação mais robusta do ID
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            // Transação para segurança
            await pool.query('BEGIN');

            const result = await pool.query(
                'DELETE FROM mensalistas WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rowCount === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ error: 'Mensalista não encontrado' });
            }

            await pool.query('COMMIT');
            res.json({
                success: true,
                data: result.rows[0],
                message: 'Mensalista excluído com sucesso'
            });

        } catch (err) {
            await pool.query('ROLLBACK');
            console.error('Erro ao excluir:', err.stack);
            res.status(500).json({
                error: 'Erro interno',
                details: process.env.NODE_ENV === 'development' ? err.message : null
            });
        }
    },
    async convidarUsuario(req, res) {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'E-mail é obrigatório' });
        }
        try {
            const tokenConvite = gerarTokenConvite();
            await sendInviteEmail(email, tokenConvite);
            res.json({ success: true, message: 'Convite enviado!' });
        } catch (err) {
            console.error('Erro ao enviar convite:', err);
            res.status(500).json({ error: 'Erro ao enviar convite' });
        }
    },

    async relatorioMensal(req, res) {
        try {
            // Permite filtro por mês/ano via query params, senão traz todos
            const { mes, ano } = req.query;
            let query = 'SELECT * FROM caixa_mensal';
            const params = [];
            if (mes && ano) {
                query += ' WHERE mes = $1 AND ano = $2';
                params.push(mes, ano);
            }
            query += ' ORDER BY ano DESC, mes DESC';
            const { rows } = await pool.query(query, params);
            res.json(rows);
        } catch (err) {
            console.error('Erro ao buscar relatório mensal:', err);
            res.status(500).json({ error: 'Erro ao buscar relatório mensal' });
        }
    },

    // Gera mensalidades pendentes para todos os mensalistas no início do mês
    async gerarMensalidadesPendentes(req, res) {
        try {
            const hoje = new Date();
            const mes = hoje.getMonth() + 1;
            const ano = hoje.getFullYear();
            await Mensalidades.gerarMensalidadesPendentes(mes, ano);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Erro ao gerar mensalidades pendentes' });
        }
    },

    // Marca a mensalidade mais antiga como paga para o mensalista
    async registrarPagamentoMensalidade(req, res) {
        try {
            const { id } = req.params; // id do mensalista
            const { valor } = req.body;
            // Busca mensalidades pendentes, ordenadas da mais antiga para a mais recente
            const pendentes = await pool.query(
                'SELECT id, valor FROM mensalidades WHERE mensalista_id = $1 AND status = $2 ORDER BY ano, mes',
                [id, 'pendente']
            );
            let valorRestante = Number(valor);
            for (const mensalidade of pendentes.rows) {
                if (valorRestante >= Number(mensalidade.valor)) {
                    // Paga a mensalidade inteira
                    await pool.query(
                        'UPDATE mensalidades SET status = $1, data_pagamento = NOW() WHERE id = $2',
                        ['pago', mensalidade.id]
                    );
                    valorRestante -= Number(mensalidade.valor);
                } else {
                    // Não paga parcial, só paga se valor >= mensalidade
                    break;
                }
            }
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Erro ao registrar pagamento de mensalidade' });
        }
    },

    // Relatório mensal detalhado
    async relatorioMensalDetalhado(req, res) {
        try {
            const pendentes = await Mensalidades.listarPendentes();
            const maisDeUmAtraso = await Mensalidades.listarMaisDeUmAtraso();
            res.json({ pendentes, maisDeUmAtraso });
        } catch (err) {
            res.status(500).json({ error: 'Erro ao gerar relatório mensal detalhado' });
        }
    }
};