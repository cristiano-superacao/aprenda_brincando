const WebSocket = require('ws');

class MultiplayerServer {
    constructor(port = 3003) {
        this.port = port;
        this.wss = null;
        this.rooms = new Map(); // roomId -> Room
        this.clients = new Map(); // ws -> ClientInfo
        
        this.startServer();
    }

    startServer() {
        this.wss = new WebSocket.Server({ port: this.port });
        
        console.log(`🎮 Servidor WebSocket multiplayer iniciado na porta ${this.port}`);
        
        this.wss.on('connection', (ws) => {
            console.log('🔌 Nova conexão WebSocket estabelecida');
            
            // Configurar ping/pong para manter conexão viva
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });
            
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(ws, message);
                } catch (error) {
                    console.error('❌ Erro ao processar mensagem:', error);
                    this.sendError(ws, 'Mensagem inválida');
                }
            });
            
            ws.on('close', () => {
                console.log('🔌 Conexão WebSocket fechada');
                this.handleDisconnect(ws);
            });
            
            ws.on('error', (error) => {
                console.error('❌ Erro WebSocket:', error);
                this.handleDisconnect(ws);
            });
            
            // Enviar confirmação de conexão
            this.send(ws, {
                type: 'connected',
                message: 'Conectado ao servidor multiplayer'
            });
        });

        // Verificar conexões mortas a cada 30 segundos
        const interval = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (!ws.isAlive) {
                    console.log('🔌 Removendo conexão morta');
                    ws.terminate();
                    return;
                }
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);

        this.wss.on('close', () => {
            clearInterval(interval);
        });
    }

    handleMessage(ws, message) {
        const { type, ...data } = message;
        
        switch (type) {
            case 'join_room':
                this.handleJoinRoom(ws, data);
                break;
                
            case 'add_money':
                this.handleAddMoney(ws, data);
                break;
                
            case 'purchase_product':
                this.handlePurchase(ws, data);
                break;
                
            case 'chat_message':
                this.handleChatMessage(ws, data);
                break;
                
            case 'restart_game':
                this.handleRestartGame(ws, data);
                break;
                
            case 'ping':
                this.send(ws, { type: 'pong' });
                break;
                
            default:
                this.sendError(ws, `Tipo de mensagem não reconhecido: ${type}`);
        }
    }

    handleJoinRoom(ws, { roomId, playerId, playerName }) {
        // Remover de sala anterior se existir
        this.handleDisconnect(ws);
        
        // Criar sala se não existir
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                id: roomId,
                players: new Map(),
                createdAt: new Date()
            });
        }
        
        const room = this.rooms.get(roomId);
        const player = {
            id: playerId,
            name: playerName,
            balance: 0,
            points: 0,
            connectedAt: new Date()
        };
        
        room.players.set(playerId, player);
        this.clients.set(ws, { playerId, roomId, playerName });
        
        console.log(`👤 Jogador ${playerName} entrou na sala ${roomId}`);
        
        // Enviar estado da sala para o novo jogador
        this.send(ws, {
            type: 'room_state',
            room: {
                id: roomId,
                players: Array.from(room.players.values())
            }
        });
        
        // Notificar outros jogadores
        this.broadcastToRoom(roomId, {
            type: 'player_joined',
            player: player
        }, playerId);
    }

    handleAddMoney(ws, { amount }) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        const room = this.rooms.get(client.roomId);
        if (!room) return;
        
        const player = room.players.get(client.playerId);
        if (!player) return;
        
        player.balance += amount;
        
        // Notificar outros jogadores
        this.broadcastToRoom(client.roomId, {
            type: 'balance_updated',
            playerId: client.playerId,
            balance: player.balance
        }, client.playerId);
    }

    handlePurchase(ws, { product }) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        const room = this.rooms.get(client.roomId);
        if (!room) return;
        
        const player = room.players.get(client.playerId);
        if (!player) return;
        
        if (player.balance >= product.price) {
            player.balance -= product.price;
            player.points += 10; // Pontos por compra
            
            // Notificar sucesso
            this.send(ws, {
                type: 'purchase_result',
                success: true,
                message: `Compra de ${product.name} realizada!`
            });
            
            // Notificar outros jogadores
            this.broadcastToRoom(client.roomId, {
                type: 'purchase_made',
                playerId: client.playerId,
                product: product,
                newBalance: player.balance,
                newPoints: player.points
            }, client.playerId);
        } else {
            this.send(ws, {
                type: 'purchase_result',
                success: false,
                message: 'Saldo insuficiente!'
            });
        }
    }

    handleChatMessage(ws, { message }) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        // Filtro básico de conteúdo
        if (!message || message.length > 100) return;
        
        this.broadcastToRoom(client.roomId, {
            type: 'chat_message',
            playerId: client.playerId,
            message: message,
            timestamp: Date.now()
        }, client.playerId);
    }

    handleRestartGame(ws) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        this.broadcastToRoom(client.roomId, {
            type: 'game_restarted',
            playerId: client.playerId
        });
    }

    handleDisconnect(ws) {
        const client = this.clients.get(ws);
        if (!client) return;
        
        const room = this.rooms.get(client.roomId);
        if (room) {
            room.players.delete(client.playerId);
            
            // Notificar outros jogadores
            this.broadcastToRoom(client.roomId, {
                type: 'player_left',
                playerId: client.playerId
            });
            
            // Remover sala se vazia
            if (room.players.size === 0) {
                this.rooms.delete(client.roomId);
                console.log(`🗑️ Sala ${client.roomId} removida (vazia)`);
            }
        }
        
        this.clients.delete(ws);
        console.log(`👋 Jogador ${client.playerName} desconectado`);
    }

    broadcastToRoom(roomId, message, excludePlayerId = null) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        this.clients.forEach((client, ws) => {
            if (client.roomId === roomId && client.playerId !== excludePlayerId) {
                this.send(ws, message);
            }
        });
    }

    send(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    sendError(ws, message) {
        this.send(ws, {
            type: 'error',
            message: message
        });
    }

    // Estatísticas do servidor
    getStats() {
        return {
            totalConnections: this.wss.clients.size,
            totalRooms: this.rooms.size,
            rooms: Array.from(this.rooms.entries()).map(([id, room]) => ({
                id,
                playerCount: room.players.size,
                players: Array.from(room.players.keys())
            }))
        };
    }
}

// Inicializar servidor se executado diretamente
if (require.main === module) {
    new MultiplayerServer();
}

module.exports = MultiplayerServer;