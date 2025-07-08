// const express = require('express');
// const cors = require('cors');
// const pool = require('./db'); // Config do PostgreSQL

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Rotas do Caixa
// app.get('/caixa', async (req, res) => {
//   try {
//     const entradas = await pool.query('SELECT SUM(valor) FROM caixa WHERE tipo = $1', ['entrada']);
//     const saidas = await pool.query('SELECT SUM(valor) FROM caixa WHERE tipo = $1', ['saida']);
//     res.json({ entradas: entradas.rows[0].sum || 0, saidas: saidas.rows[0].sum || 0 });
//   } catch (err) {
//     console.error(err.message);
//   }
// });

// // Rotas de Mensalistas
// app.get('/mensalistas', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM mensalistas');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//   }
// });

// app.listen(5000, () => console.log('Server rodando na porta 5000'));
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(routes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));