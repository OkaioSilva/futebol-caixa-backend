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