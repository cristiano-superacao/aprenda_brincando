class MultiplayerManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.ws = null;
        this.playerId = null;
        this.playerName = null;
        this.roomId = 'mercadinho-cristhian';
        this.isConnected = false;
        this.otherPlayers = new Map();
    }

    // Conectar ao servidor multiplayer
    connect(playerName) {
        if (!playerName) {
            playerName = prompt('👋 Qual é o seu nome?') || `Jogador${Date.now()}`;
        }

        this.playerName = playerName;
        this.playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            // Conectar via WebSocket
            const wsUrl = window.location.protocol === 'https:' 
                ? `wss://${window.location.host}`
                : `ws://${window.location.host.replace('8000', '3002')}`;
            
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('🔌 Conectado ao servidor multiplayer');
                this.isConnected = true;
                
                // Entrar na sala
                this.send({
                    type: 'join_room',
                    roomId: this.roomId,
                    playerId: this.playerId,
                    playerName: this.playerName
                });

                this.showMultiplayerUI();
                this.game.showToast(`Conectado como ${this.playerName}!`);
            };

            this.ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            };

            this.ws.onclose = () => {
                console.log('🔌 Conexão multiplayer perdida');
                this.isConnected = false;
                this.hideMultiplayerUI();
                this.game.showToast('Conexão multiplayer perdida', 'error');
            };

            this.ws.onerror = (error) => {
                console.error('❌ Erro WebSocket:', error);
                this.game.showToast('Erro de conexão multiplayer', 'error');
            };

        } catch (error) {
            console.error('❌ Erro ao conectar:', error);
            this.game.showToast('Servidor multiplayer indisponível', 'error');
        }
    }

    // Enviar mensagem para o servidor
    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    // Processar mensagens do servidor
    handleMessage(message) {
        switch (message.type) {
            case 'connected':
                console.log('✅ Confirmação de conexão recebida');
                break;

            case 'room_state':
                this.updateRoomState(message.room);
                break;

            case 'player_joined':
                this.addOtherPlayer(message.player);
                this.game.showToast(`${message.player.name} entrou no jogo!`);
                break;

            case 'player_left':
                this.removeOtherPlayer(message.playerId);
                break;

            case 'balance_updated':
                this.updateOtherPlayerBalance(message.playerId, message.balance);
                break;

            case 'purchase_made':
                this.handleOtherPlayerPurchase(message);
                break;

            case 'purchase_result':
                if (message.success) {
                    this.game.showToast(message.message);
                } else {
                    this.game.showToast(message.message, 'error');
                }
                break;

            case 'chat_message':
                this.showChatMessage(message);
                break;

            case 'game_restarted':
                if (message.playerId !== this.playerId) {
                    this.game.showToast('Outro jogador reiniciou o jogo');
                }
                break;

            case 'error':
                this.game.showToast(message.message, 'error');
                break;
        }
    }

    // Notificar adição de dinheiro
    notifyAddMoney(amount) {
        this.send({
            type: 'add_money',
            amount: amount
        });
    }

    // Notificar compra de produto
    notifyPurchase(product) {
        this.send({
            type: 'purchase_product',
            product: product
        });
    }

    // Enviar mensagem de chat
    sendChatMessage(message) {
        this.send({
            type: 'chat_message',
            message: message
        });
    }

    // Notificar restart do jogo
    notifyRestart() {
        this.send({
            type: 'restart_game'
        });
    }

    // Atualizar estado da sala
    updateRoomState(room) {
        room.players.forEach(player => {
            if (player.id !== this.playerId) {
                this.otherPlayers.set(player.id, player);
            }
        });
        this.updatePlayersDisplay();
    }

    // Adicionar outro jogador
    addOtherPlayer(player) {
        this.otherPlayers.set(player.id, player);
        this.updatePlayersDisplay();
    }

    // Remover outro jogador
    removeOtherPlayer(playerId) {
        const player = this.otherPlayers.get(playerId);
        if (player) {
            this.otherPlayers.delete(playerId);
            this.updatePlayersDisplay();
            this.game.showToast(`${player.name} saiu do jogo`);
        }
    }

    // Atualizar saldo de outro jogador
    updateOtherPlayerBalance(playerId, balance) {
        const player = this.otherPlayers.get(playerId);
        if (player) {
            player.balance = balance;
            this.updatePlayersDisplay();
        }
    }

    // Processar compra de outro jogador
    handleOtherPlayerPurchase(data) {
        const player = this.otherPlayers.get(data.playerId);
        if (player) {
            player.balance = data.newBalance;
            player.points = data.newPoints;
            this.updatePlayersDisplay();
            this.game.showToast(`${player.name} comprou ${data.product.name}!`);
        }
    }

    // Mostrar interface multiplayer
    showMultiplayerUI() {
        let multiplayerPanel = document.getElementById('multiplayerPanel');
        if (!multiplayerPanel) {
            multiplayerPanel = document.createElement('div');
            multiplayerPanel.id = 'multiplayerPanel';
            multiplayerPanel.className = 'multiplayer-panel';
            multiplayerPanel.innerHTML = `
                <div class="multiplayer-header">
                    <h3>🎮 Jogadores Online</h3>
                    <button id="disconnectBtn" class="disconnect-btn">Desconectar</button>
                </div>
                <div id="playersList" class="players-list"></div>
                <div class="chat-section">
                    <div id="chatMessages" class="chat-messages"></div>
                    <div class="chat-input">
                        <input type="text" id="chatInput" placeholder="Digite uma mensagem..." maxlength="100">
                        <button id="sendChatBtn">Enviar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(multiplayerPanel);

            // Event listeners
            document.getElementById('disconnectBtn').addEventListener('click', () => {
                this.disconnect();
            });

            document.getElementById('sendChatBtn').addEventListener('click', () => {
                this.sendChatFromInput();
            });

            document.getElementById('chatInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatFromInput();
                }
            });
        }
        multiplayerPanel.style.display = 'block';
    }

    // Esconder interface multiplayer
    hideMultiplayerUI() {
        const multiplayerPanel = document.getElementById('multiplayerPanel');
        if (multiplayerPanel) {
            multiplayerPanel.style.display = 'none';
        }
    }

    // Atualizar lista de jogadores
    updatePlayersDisplay() {
        const playersList = document.getElementById('playersList');
        if (!playersList) return;

        let html = `
            <div class="player-item current-player">
                <span class="player-name">🟢 ${this.playerName} (Você)</span>
                <span class="player-stats">R$ ${this.game.balance.toFixed(2)} | ${this.game.points} pts</span>
            </div>
        `;

        this.otherPlayers.forEach(player => {
            html += `
                <div class="player-item">
                    <span class="player-name">🔵 ${player.name}</span>
                    <span class="player-stats">R$ ${player.balance.toFixed(2)} | ${player.points} pts</span>
                </div>
            `;
        });

        playersList.innerHTML = html;
    }

    // Enviar mensagem do chat
    sendChatFromInput() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        if (message) {
            this.sendChatMessage(message);
            chatInput.value = '';
            
            // Mostrar própria mensagem
            this.showChatMessage({
                playerId: this.playerId,
                message: message,
                timestamp: Date.now()
            }, true);
        }
    }

    // Mostrar mensagem no chat
    showChatMessage(data, isOwn = false) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const player = isOwn ? { name: this.playerName } : this.otherPlayers.get(data.playerId);
        if (!player && !isOwn) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isOwn ? 'own-message' : 'other-message'}`;
        messageDiv.innerHTML = `
            <span class="message-author">${player.name}:</span>
            <span class="message-text">${data.message}</span>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Limitar histórico a 50 mensagens
        while (chatMessages.children.length > 50) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    }

    // Desconectar
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.isConnected = false;
        this.hideMultiplayerUI();
        this.otherPlayers.clear();
        this.game.showToast('Desconectado do multiplayer');
    }

    // Verificar se está conectado
    isMultiplayerConnected() {
        return this.isConnected;
    }
}

// Exportar para uso global
window.MultiplayerManager = MultiplayerManager;