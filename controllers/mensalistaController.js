const pool = require('../config/db');

module.exports = {
    async listaMensalistasPublicos(req, res){
        try{
            const {rows} = await pool.query(`
                SELECT 
                id,
                COALESCE(nome, '') as nome,
                COALESCE(status_pagamento, 'pendente') as status,
                data_pagamento as "dataPagamento"
                FROM mensalistas
                ORDER BY status, nome
                `);
            res.json(rows);
        }catch(e){
            console.error(e)
            res.status(500).json({error: 'Erro ao buscas mensalistas'})
        }
    }
}