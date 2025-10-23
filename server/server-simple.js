const express = require('express');
const cors = require('cors');
const http = require('http');
const MultiplayerWebSocketServer = require('./websocket-server');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://mercadinhodocris.netlify.app']
        : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());

// Rotas básicas (sem banco de dados por enquanto)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Servidor funcionando'
    });
});

// Mock de criação de jogador (temporário - sem banco)
app.post('/api/player/create', async (req, res) => {
    try {
        const { name, age, grade, avatar } = req.body;

        if (!name || !age || !grade || !avatar) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        // Criar jogador mock
        const player = {
            id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            age,
            grade,
            avatar,
            balance: 50.00,
            experience: 0,
            level: 1,
            inventory: {},
            stats: {},
            multiplayerStats: {},
            isOffline: false
        };

        res.status(201).json({
            success: true,
            player
        });

    } catch (error) {
        console.error('Erro ao criar jogador:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Mock de buscar jogador por ID
app.get('/api/player/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Mock player - em produção viria do banco
        const player = {
            id,
            name: 'Jogador Teste',
            age: 8,
            grade: 3,
            avatar: 'student1',
            balance: 150.00,
            experience: 200,
            level: 2,
            inventory: {},
            stats: {},
            multiplayerStats: {},
            isOffline: false
        };

        res.json({
            success: true,
            player
        });

    } catch (error) {
        console.error('Erro ao buscar jogador:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Mock de atualizar jogador
app.put('/api/player/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Mock de atualização
        const player = {
            id,
            ...updateData,
            isOffline: false
        };

        res.json({
            success: true,
            player
        });

    } catch (error) {
        console.error('Erro ao atualizar jogador:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Mock de ranking
app.get('/api/ranking/:category', async (req, res) => {
    try {
        const { category } = req.params;
        
        // Mock ranking data
        const mockRanking = [
            {
                position: 1,
                player: {
                    id: 'player1',
                    name: 'Ana Silva',
                    age: 9,
                    grade: 4,
                    avatar: 'student2',
                    level: 5
                },
                value: 1500.00
            },
            {
                position: 2,
                player: {
                    id: 'player2',
                    name: 'João Santos',
                    age: 8,
                    grade: 3,
                    avatar: 'student3',
                    level: 4
                },
                value: 1200.00
            },
            {
                position: 3,
                player: {
                    id: 'player3',
                    name: 'Maria Costa',
                    age: 10,
                    grade: 5,
                    avatar: 'student4',
                    level: 6
                },
                value: 1000.00
            }
        ];

        res.json({
            success: true,
            category,
            ranking: mockRanking
        });

    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rota 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Inicializar servidor
async function startServer() {
    try {
        console.log('🚀 Iniciando servidor...');
        
        // Inicializar WebSocket multiplayer
        new MultiplayerWebSocketServer(server);
        
        server.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🎮 WebSocket multiplayer ativo`);
            console.log(`📡 API endpoints disponíveis:`);
            console.log(`   GET  /api/health`);
            console.log(`   POST /api/player/create`);
            console.log(`   GET  /api/player/:id`);
            console.log(`   PUT  /api/player/:id`);
            console.log(`   GET  /api/ranking/:category`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando servidor...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Encerrando servidor...');
    process.exit(0);
});

startServer();