const { Pool } = require('pg');

// Configuração do banco de dados
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Headers CORS
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

exports.handler = async (event, context) => {
    // Responder a requisições OPTIONS (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { httpMethod, path, body } = event;
        const pathSegments = path.split('/').filter(segment => segment);
        
        // Remover '.netlify/functions/api' do início
        const apiIndex = pathSegments.indexOf('api');
        if (apiIndex >= 0) {
            pathSegments.splice(0, apiIndex + 1);
        }

        // Roteamento baseado no método e path
        if (httpMethod === 'POST' && pathSegments[0] === 'player' && pathSegments[1] === 'create') {
            return await createPlayer(JSON.parse(body));
        }
        
        if (httpMethod === 'GET' && pathSegments[0] === 'player' && pathSegments[1]) {
            return await getPlayer(pathSegments[1]);
        }
        
        if (httpMethod === 'PUT' && pathSegments[0] === 'player' && pathSegments[1]) {
            return await updatePlayer(pathSegments[1], JSON.parse(body));
        }
        
        if (httpMethod === 'GET' && pathSegments[0] === 'ranking' && pathSegments[1]) {
            const category = pathSegments[1];
            const { limit = 50, grade } = event.queryStringParameters || {};
            return await getRanking(category, { limit, grade });
        }

        if (httpMethod === 'GET' && pathSegments[0] === 'health') {
            return await healthCheck();
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Endpoint não encontrado' })
        };

    } catch (error) {
        console.error('Erro na função:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
    }
};

// Função para criar jogador
async function createPlayer(data) {
    const { name, age, grade, avatar } = data;

    if (!name || !age || !grade || !avatar) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Todos os campos são obrigatórios' })
        };
    }

    if (age < 4 || age > 18) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Idade deve estar entre 4 e 18 anos' })
        };
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

    return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
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
        })
    };
}

// Função para buscar jogador
async function getPlayer(id) {
    const result = await pool.query('SELECT * FROM players WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Jogador não encontrado' })
        };
    }

    const player = result.rows[0];

    // Atualizar último login
    await pool.query(
        'UPDATE players SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
    );

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
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
        })
    };
}

// Função para atualizar jogador
async function updatePlayer(id, updateData) {
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
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Nenhum campo válido para atualizar' })
        };
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await pool.query(
        `UPDATE players SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        [...values, id]
    );

    if (result.rows.length === 0) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Jogador não encontrado' })
        };
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

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
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
        })
    };
}

// Função para ranking
async function getRanking(category, options) {
    const { limit = 50, grade } = options;
    const validCategories = ['money', 'level', 'investments'];
    
    if (!validCategories.includes(category)) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Categoria de ranking inválida' })
        };
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

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            category,
            ranking
        })
    };
}

// Health check
async function healthCheck() {
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'Aprenda Brincando API'
        })
    };
}