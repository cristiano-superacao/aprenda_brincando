const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Servidor básico funcionando'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor básico rodando na porta ${PORT}`);
    console.log(`🌍 Teste: http://localhost:${PORT}/api/health`);
});