const WebSocket = require('ws');

// Pool de WebSocket simples para Netlify Functions
const gameRooms = new Map();
const playerSessions = new Map();

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
        
        // Remover '.netlify/functions/websocket' do início
        const wsIndex = pathSegments.indexOf('websocket');
        if (wsIndex >= 0) {
            pathSegments.splice(0, wsIndex + 1);
        }

        const data = httpMethod === 'POST' ? JSON.parse(body) : null;

        // Roteamento baseado no método e path
        if (httpMethod === 'POST' && pathSegments[0] === 'rooms') {
            return await createRoom(data);
        }
        
        if (httpMethod === 'GET' && pathSegments[0] === 'rooms') {
            return await listRooms();
        }
        
        if (httpMethod === 'POST' && pathSegments[0] === 'rooms' && pathSegments[1] && pathSegments[2] === 'join') {
            return await joinRoom(pathSegments[1], data);
        }
        
        if (httpMethod === 'POST' && pathSegments[0] === 'rooms' && pathSegments[1] && pathSegments[2] === 'leave') {
            return await leaveRoom(pathSegments[1], data);
        }
        
        if (httpMethod === 'POST' && pathSegments[0] === 'rooms' && pathSegments[1] && pathSegments[2] === 'message') {
            return await sendMessage(pathSegments[1], data);
        }

        if (httpMethod === 'GET' && pathSegments[0] === 'rooms' && pathSegments[1]) {
            return await getRoomInfo(pathSegments[1]);
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Endpoint não encontrado' })
        };

    } catch (error) {
        console.error('Erro na função WebSocket:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
    }
};

// Função para criar sala
async function createRoom(data) {
    const { hostId, hostName, maxPlayers = 4, grade, isPrivate = false } = data;

    if (!hostId || !hostName) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID e nome do host são obrigatórios' })
        };
    }

    const roomId = generateRoomId();
    const room = {
        id: roomId,
        host: { id: hostId, name: hostName },
        players: [{ id: hostId, name: hostName, isReady: false }],
        maxPlayers,
        grade,
        isPrivate,
        gameState: 'waiting', // waiting, playing, finished
        currentQuestion: null,
        createdAt: Date.now(),
        settings: {
            timePerQuestion: 30,
            totalQuestions: 10
        }
    };

    gameRooms.set(roomId, room);
    playerSessions.set(hostId, roomId);

    return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
            success: true,
            room: {
                id: room.id,
                host: room.host,
                playerCount: room.players.length,
                maxPlayers: room.maxPlayers,
                grade: room.grade,
                isPrivate: room.isPrivate,
                gameState: room.gameState
            }
        })
    };
}

// Função para listar salas
async function listRooms() {
    const publicRooms = Array.from(gameRooms.values())
        .filter(room => !room.isPrivate && room.gameState === 'waiting')
        .map(room => ({
            id: room.id,
            host: room.host,
            playerCount: room.players.length,
            maxPlayers: room.maxPlayers,
            grade: room.grade,
            gameState: room.gameState,
            createdAt: room.createdAt
        }));

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            rooms: publicRooms
        })
    };
}

// Função para entrar em sala
async function joinRoom(roomId, data) {
    const { playerId, playerName } = data;

    if (!playerId || !playerName) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID e nome do jogador são obrigatórios' })
        };
    }

    const room = gameRooms.get(roomId);
    if (!room) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Sala não encontrada' })
        };
    }

    if (room.players.length >= room.maxPlayers) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Sala está cheia' })
        };
    }

    if (room.gameState !== 'waiting') {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Partida já iniciada' })
        };
    }

    // Verificar se jogador já está na sala
    const existingPlayer = room.players.find(p => p.id === playerId);
    if (existingPlayer) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Jogador já está na sala' })
        };
    }

    // Adicionar jogador
    room.players.push({ id: playerId, name: playerName, isReady: false });
    playerSessions.set(playerId, roomId);

    // Simular broadcast para outros jogadores (em uma implementação real seria via WebSocket)
    console.log(`Jogador ${playerName} entrou na sala ${roomId}`);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            room: {
                id: room.id,
                host: room.host,
                players: room.players,
                maxPlayers: room.maxPlayers,
                grade: room.grade,
                gameState: room.gameState,
                settings: room.settings
            }
        })
    };
}

// Função para sair da sala
async function leaveRoom(roomId, data) {
    const { playerId } = data;

    if (!playerId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID do jogador é obrigatório' })
        };
    }

    const room = gameRooms.get(roomId);
    if (!room) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Sala não encontrada' })
        };
    }

    // Remover jogador
    room.players = room.players.filter(p => p.id !== playerId);
    playerSessions.delete(playerId);

    // Se era o host e há outros jogadores, transferir host
    if (room.host.id === playerId && room.players.length > 0) {
        room.host = room.players[0];
    }

    // Se não há mais jogadores, deletar sala
    if (room.players.length === 0) {
        gameRooms.delete(roomId);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Sala fechada - nenhum jogador restante'
            })
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            room: {
                id: room.id,
                host: room.host,
                players: room.players,
                maxPlayers: room.maxPlayers,
                grade: room.grade,
                gameState: room.gameState
            }
        })
    };
}

// Função para enviar mensagem
async function sendMessage(roomId, data) {
    const { playerId, message, type = 'chat' } = data;

    if (!playerId || !message) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID do jogador e mensagem são obrigatórios' })
        };
    }

    const room = gameRooms.get(roomId);
    if (!room) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Sala não encontrada' })
        };
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Jogador não está na sala' })
        };
    }

    // Em uma implementação real, isso seria transmitido via WebSocket
    const messageData = {
        id: Date.now(),
        playerId,
        playerName: player.name,
        message,
        type,
        timestamp: Date.now()
    };

    console.log(`Mensagem na sala ${roomId}:`, messageData);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: messageData
        })
    };
}

// Função para obter informações da sala
async function getRoomInfo(roomId) {
    const room = gameRooms.get(roomId);
    if (!room) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Sala não encontrada' })
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            room: {
                id: room.id,
                host: room.host,
                players: room.players,
                maxPlayers: room.maxPlayers,
                grade: room.grade,
                isPrivate: room.isPrivate,
                gameState: room.gameState,
                currentQuestion: room.currentQuestion,
                settings: room.settings,
                createdAt: room.createdAt
            }
        })
    };
}

// Função auxiliar para gerar ID da sala
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}