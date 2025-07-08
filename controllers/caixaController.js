const pool = require('../config/db');

module.exports = {
  async getCaixaPublico(req, res) {
    try {
      // Consulta para entradas
      const entradasQuery = await pool.query(
        'SELECT COALESCE(SUM(valor), 0) AS total FROM caixa WHERE tipo = $1', 
        ['entrada']
      );
      
      // Consulta para saídas
      const saidasQuery = await pool.query(
        'SELECT COALESCE(SUM(valor), 0) AS total FROM caixa WHERE tipo = $1', 
        ['saida']
      );

      // Extração dos valores
      const entradas = parseFloat(entradasQuery.rows[0].total);
      const saidas = parseFloat(saidasQuery.rows[0].total);

      res.json({
        entradas: entradas || 0,  // Garante que será 0 se for null/undefined
        saidas: saidas || 0       // Garante que será 0 se for null/undefined
      });

    } catch (err) {
      console.error('Erro detalhado no caixaController:', err);
      res.status(500).json({ 
        error: 'Erro ao buscar dados financeiros',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
};