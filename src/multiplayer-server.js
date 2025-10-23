const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

// Configuração do servidor
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Estado do jogo multiplayer
const gameRooms = new Map();

class GameRoom {
    constructor(id) {
        this.id = id;
        this.players = new Map();
        this.gameState = {
            products: [],
            transactions: [],
            gameStarted: false,
            winner: null
        };
    }

    addPlayer(playerId, playerName, ws) {
        this.players.set(playerId, {
            id: playerId,
            name: playerName,
            balance: 0,
            cart: [],
            points: 0,
            ws: ws
        });

        // Notificar outros jogadores
        this.broadcast({
            type: 'player_joined',
            player: {
                id: playerId,
                name: playerName,
                balance: 0,
                points: 0
            }
        }, playerId);

        // Enviar estado atual para o novo jogador
        ws.send(JSON.stringify({
            type: 'room_state',
            room: this.getRoomState(),
            playerId: playerId
        }));
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.broadcast({
            type: 'player_left',
            playerId: playerId
        });
    }

    updatePlayerBalance(playerId, amount) {
        const player = this.players.get(playerId);
        if (player) {
            player.balance += amount;
            this.broadcast({
                type: 'balance_updated',
                playerId: playerId,
                balance: player.balance
            });
        }
    }

    addToPlayerCart(playerId, product) {
        const player = this.players.get(playerId);
        if (player && player.balance >= product.price) {
            player.cart.push(product);
            player.balance -= product.price;
            player.points += product.points_reward;

            this.broadcast({
                type: 'purchase_made',
                playerId: playerId,
                product: product,
                newBalance: player.balance,
                newPoints: player.points
            });

            return true;
        }
        return false;
    }

    broadcast(message, excludePlayerId = null) {
        this.players.forEach((player, playerId) => {
            if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(JSON.stringify(message));
            }
        });
    }

    getRoomState() {
        const players = Array.from(this.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            balance: p.balance,
            points: p.points,
            cartItems: p.cart.length
        }));

        return {
            id: this.id,
            players: players,
            gameState: this.gameState
        };
    }
}

// Gerenciamento de conexões WebSocket
wss.on('connection', (ws) => {
    console.log('🔌 Nova conexão WebSocket estabelecida');
    
    let currentPlayer = null;
    let currentRoom = null;

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'join_room':
                    const roomId = message.roomId || 'mercadinho-cristhian';
                    const playerName = message.playerName;
                    const playerId = message.playerId;

                    // Criar sala se não existir
                    if (!gameRooms.has(roomId)) {
                        gameRooms.set(roomId, new GameRoom(roomId));
                        console.log(`🏪 Nova sala criada: ${roomId}`);
                    }

                    currentRoom = gameRooms.get(roomId);
                    currentPlayer = playerId;
                    
                    currentRoom.addPlayer(playerId, playerName, ws);
                    console.log(`👋 ${playerName} entrou na sala ${roomId}`);
                    break;

                case 'add_money':
                    if (currentRoom && currentPlayer) {
                        currentRoom.updatePlayerBalance(currentPlayer, message.amount);
                    }
                    break;

                case 'purchase_product':
                    if (currentRoom && currentPlayer) {
                        const success = currentRoom.addToPlayerCart(currentPlayer, message.product);
                        
                        ws.send(JSON.stringify({
                            type: 'purchase_result',
                            success: success,
                            message: success ? 'Compra realizada!' : 'Dinheiro insuficiente!'
                        }));
                    }
                    break;

                case 'chat_message':
                    if (currentRoom && currentPlayer) {
                        currentRoom.broadcast({
                            type: 'chat_message',
                            playerId: currentPlayer,
                            message: message.message,
                            timestamp: Date.now()
                        }, currentPlayer);
                    }
                    break;

                case 'restart_game':
                    if (currentRoom && currentPlayer) {
                        // Reset do jogador
                        const player = currentRoom.players.get(currentPlayer);
                        if (player) {
                            player.balance = 0;
                            player.cart = [];
                            player.points = 0;
                        }

                        currentRoom.broadcast({
                            type: 'game_restarted',
                            playerId: currentPlayer
                        });
                    }
                    break;
            }
        } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Erro ao processar comando'
            }));
        }
    });

    ws.on('close', () => {
        if (currentRoom && currentPlayer) {
            currentRoom.removePlayer(currentPlayer);
            console.log(`👋 Jogador ${currentPlayer} saiu da sala`);
            
            // Remover sala se vazia
            if (currentRoom.players.size === 0) {
                gameRooms.delete(currentRoom.id);
                console.log(`🗑️ Sala ${currentRoom.id} removida (vazia)`);
            }
        }
        console.log('🔌 Conexão WebSocket fechada');
    });

    ws.on('error', (error) => {
        console.error('❌ Erro WebSocket:', error);
    });

    // Enviar confirmação de conexão
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'Conectado ao Mercadinho do Cristhian!'
    }));
});

// Rota de status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        rooms: gameRooms.size,
        totalPlayers: Array.from(gameRooms.values()).reduce((total, room) => total + room.players.size, 0)
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`🚀 Servidor Multiplayer rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

module.exports = { app, server, wss };