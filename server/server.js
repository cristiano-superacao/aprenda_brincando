const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const MultiplayerWebSocketServer = require('./websocket-server');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Configuração do banco de dados
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://mercadinhodocris.netlify.app']
        : ['http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json());

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Função para inicializar as tabelas do banco
async function initDatabase() {
    try {
        // Tabela de jogadores
        await pool.query(`
            CREATE TABLE IF NOT EXISTS players (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                age INTEGER NOT NULL CHECK (age >= 4 AND age <= 18),
                grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 12),
                avatar VARCHAR(50) NOT NULL,
                balance DECIMAL(10,2) DEFAULT 0.00,
                experience INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                inventory JSONB DEFAULT '{}',
                stats JSONB DEFAULT '{}',
                multiplayer_stats JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de ranking
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rankings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                player_id UUID REFERENCES players(id) ON DELETE CASCADE,
                category VARCHAR(50) NOT NULL,
                value DECIMAL(15,2) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(player_id, category)
            )
        `);

        // Tabela de sessões multiplayer
        await pool.query(`
            CREATE TABLE IF NOT EXISTS multiplayer_sessions (
                id VARCHAR(10) PRIMARY KEY,
                host_id UUID REFERENCES players(id) ON DELETE CASCADE,
                settings JSONB NOT NULL,
                status VARCHAR(20) DEFAULT 'waiting',
                players JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                started_at TIMESTAMP,
                finished_at TIMESTAMP
            )
        `);

        // Tabela de resultados de jogos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS game_results (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                player_id UUID REFERENCES players(id) ON DELETE CASCADE,
                session_id VARCHAR(10) REFERENCES multiplayer_sessions(id) ON DELETE CASCADE,
                score INTEGER NOT NULL,
                correct_answers INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                avg_time DECIMAL(5,2),
                position INTEGER,
                reward DECIMAL(10,2) DEFAULT 0.00,
                played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Índices para performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_players_grade ON players(grade);
            CREATE INDEX IF NOT EXISTS idx_rankings_category_value ON rankings(category, value DESC);
            CREATE INDEX IF NOT EXISTS idx_multiplayer_sessions_status ON multiplayer_sessions(status);
            CREATE INDEX IF NOT EXISTS idx_game_results_player ON game_results(player_id);
        `);

        console.log('✅ Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
    }
}

// Rotas da API

// Criar jogador
app.post('/api/player/create', async (req, res) => {
    try {
        const { name, age, grade, avatar } = req.body;

        if (!name || !age || !grade || !avatar) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        if (age < 4 || age > 18) {
            return res.status(400).json({ error: 'Idade deve estar entre 4 e 18 anos' });
        }

        if (grade < 1 || grade > 12) {
            return res.status(400).json({ error: 'Série deve estar entre 1 e 12' });
        }

        const result = await pool.query(
            `INSERT INTO players (name, age, grade, avatar, balance, experience, level, inventory, stats, multiplayer_stats) 
             VALUES ($1, $2, $3, $4, 50.00, 0, 1, '{}', '{}', '{}') 
             RETURNING *`,
            [name, age, grade, avatar]
        );

        const player = result.rows[0];

        // Criar entradas no ranking
        await pool.query(
            `INSERT INTO rankings (player_id, category, value) VALUES 
             ($1, 'money', $2),
             ($1, 'level', $3),
             ($1, 'investments', 0.00)`,
            [player.id, player.balance, player.level]
        );

        res.status(201).json({
            success: true,
            player: {
                id: player.id,
                name: player.name,
                age: player.age,
                grade: player.grade,
                avatar: player.avatar,
                balance: parseFloat(player.balance),
                experience: player.experience,
                level: player.level,
                inventory: player.inventory,
                stats: player.stats,
                multiplayerStats: player.multiplayer_stats,
                isOffline: false
            }
        });

    } catch (error) {
        console.error('Erro ao criar jogador:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar jogador por ID
app.get('/api/player/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM players WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Jogador não encontrado' });
        }

        const player = result.rows[0];

        // Atualizar último login
        await pool.query(
            'UPDATE players SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            player: {
                id: player.id,
                name: player.name,
                age: player.age,
                grade: player.grade,
                avatar: player.avatar,
                balance: parseFloat(player.balance),
                experience: player.experience,
                level: player.level,
                inventory: player.inventory,
                stats: player.stats,
                multiplayerStats: player.multiplayer_stats,
                isOffline: false
            }
        });

    } catch (error) {
        console.error('Erro ao buscar jogador:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar dados do jogador
app.put('/api/player/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const allowedFields = ['balance', 'experience', 'level', 'inventory', 'stats', 'multiplayer_stats'];
        const updates = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                if (key === 'inventory' || key === 'stats' || key === 'multiplayer_stats') {
                    updates.push(`${key === 'multiplayer_stats' ? 'multiplayer_stats' : key} = $${paramCount}`);
                } else {
                    updates.push(`${key} = $${paramCount}`);
                }
                values.push(value);
                paramCount++;
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        const result = await pool.query(
            `UPDATE players SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            [...values, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Jogador não encontrado' });
        }

        const player = result.rows[0];

        // Atualizar ranking se necessário
        if (updateData.balance !== undefined) {
            await pool.query(
                `INSERT INTO rankings (player_id, category, value) VALUES ($1, 'money', $2)
                 ON CONFLICT (player_id, category) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
                [id, updateData.balance]
            );
        }

        if (updateData.level !== undefined) {
            await pool.query(
                `INSERT INTO rankings (player_id, category, value) VALUES ($1, 'level', $2)
                 ON CONFLICT (player_id, category) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
                [id, updateData.level]
            );
        }

        res.json({
            success: true,
            player: {
                id: player.id,
                name: player.name,
                age: player.age,
                grade: player.grade,
                avatar: player.avatar,
                balance: parseFloat(player.balance),
                experience: player.experience,
                level: player.level,
                inventory: player.inventory,
                stats: player.stats,
                multiplayerStats: player.multiplayer_stats,
                isOffline: false
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar jogador:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Ranking por categoria
app.get('/api/ranking/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 50, grade } = req.query;

        const validCategories = ['money', 'level', 'investments'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Categoria de ranking inválida' });
        }

        let query = `
            SELECT 
                r.value,
                p.id,
                p.name,
                p.age,
                p.grade,
                p.avatar,
                p.level,
                ROW_NUMBER() OVER (ORDER BY r.value DESC) as position
            FROM rankings r
            JOIN players p ON r.player_id = p.id
            WHERE r.category = $1
        `;

        const params = [category];

        if (grade) {
            query += ` AND p.grade = $${params.length + 1}`;
            params.push(grade);
        }

        query += ` ORDER BY r.value DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await pool.query(query, params);

        const ranking = result.rows.map(row => ({
            position: parseInt(row.position),
            player: {
                id: row.id,
                name: row.name,
                age: row.age,
                grade: row.grade,
                avatar: row.avatar,
                level: row.level
            },
            value: parseFloat(row.value)
        }));

        res.json({
            success: true,
            category,
            ranking
        });

    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Salvar progresso do quiz
app.post('/api/player/:id/quiz-progress', async (req, res) => {
    try {
        const { id } = req.params;
        const progressData = req.body;

        const result = await pool.query(
            `UPDATE players 
             SET stats = COALESCE(stats, '{}') || $1, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [JSON.stringify({ quizProgress: progressData }), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Jogador não encontrado' });
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Erro ao salvar progresso:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint de health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: pool.totalCount > 0 ? 'connected' : 'disconnected'
    });
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
        await initDatabase();
        
        // Inicializar WebSocket multiplayer
        new MultiplayerWebSocketServer(server);
        
        server.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🎮 WebSocket multiplayer ativo`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando servidor...');
    await pool.end();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Encerrando servidor...');
    await pool.end();
    process.exit(0);
});

startServer();