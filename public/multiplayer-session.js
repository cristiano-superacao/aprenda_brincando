// Sistema de Sessões Multiplayer
class MultiplayerSession {
    constructor() {
        this.ws = null;
        this.currentSession = null;
        this.isHost = false;
        this.players = [];
        this.currentQuestion = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.sessionState = {
            id: null,
            players: [],
            currentRound: 0,
            maxRounds: 10,
            status: 'waiting', // waiting, playing, finished
            hostId: null
        };
        
        this.init();
    }

    async init() {
        // Para desenvolvimento, ativar modo offline por padrão
        localStorage.setItem('offlineMode', 'true');
        
        await this.connectWebSocket();
        this.setupEventHandlers();
    }

    async connectWebSocket() {
        try {
            // Para desenvolvimento, simular conexão offline
            if (localStorage.getItem('offlineMode') === 'true') {
                console.log('🔄 Modo offline ativado - simulando conexão');
                this.isConnected = true;
                this.simulateOfflineMode();
                return;
            }
            
            // Conectar ao WebSocket
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = process.env.NODE_ENV === 'production' 
                ? 'wss://mercadinhodocris.netlify.app/.netlify/functions/websocket'
                : 'ws://localhost:3001';
                
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('✅ Conectado ao servidor multiplayer');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.authenticatePlayer();
            };
            
            this.ws.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };
            
            this.ws.onclose = () => {
                console.log('❌ Conexão com servidor perdida');
                this.isConnected = false;
                this.attemptReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('Erro WebSocket:', error);
            };
            
        } catch (error) {
            console.error('Erro ao conectar WebSocket:', error);
            this.showConnectionError();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.connectWebSocket();
            }, 2000 * this.reconnectAttempts);
        } else {
            this.showConnectionError();
        }
    }

    authenticatePlayer() {
        const player = window.playerProfile?.getCurrentPlayer();
        if (player && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.sendMessage({
                type: 'authenticate',
                player: {
                    id: player.id,
                    name: player.name,
                    age: player.age,
                    grade: player.grade,
                    avatar: player.avatar,
                    level: player.level || 1
                }
            });
        }
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket não conectado, mensagem não enviada:', message);
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'sessionCreated':
                this.currentSession = message.session;
                this.isHost = true;
                this.sessionState = message.session;
                this.showSessionCode(message.session.id);
                break;
                
            case 'sessionJoined':
                this.currentSession = message.session;
                this.isHost = false;
                this.sessionState = message.session;
                this.updatePlayersList();
                break;
                
            case 'playerJoined':
                this.sessionState.players = message.players;
                this.updatePlayersList();
                this.showPlayerJoinedNotification(message.newPlayer);
                break;
                
            case 'playerLeft':
                this.sessionState.players = message.players;
                this.updatePlayersList();
                break;
                
            case 'gameStarted':
                this.startMultiplayerQuiz();
                break;
                
            case 'newQuestion':
                this.currentQuestion = message.question;
                this.showMultiplayerQuestion(message.question);
                break;
                
            case 'playerAnswered':
                this.showPlayerAnswer(message.playerId, message.isCorrect, message.timeToAnswer);
                break;
                
            case 'roundResults':
                this.showRoundResults(message.results);
                break;
                
            case 'gameFinished':
                this.showFinalResults(message.finalResults);
                break;
                
            case 'sessionClosed':
                this.handleSessionClosed();
                break;
                
            case 'error':
                this.showError(message.error);
                break;
        }
    }

    showMainMenu() {
        const modal = document.createElement('div');
        modal.id = 'multiplayerMainModal';
        modal.className = 'multiplayer-modal';
        
        modal.innerHTML = `
            <div class="multiplayer-content">
                <div class="multiplayer-header">
                    <h2>🎮 Jogar com Amigos</h2>
                    <span class="close-multiplayer">❌</span>
                </div>
                
                <div class="connection-status ${this.isConnected ? 'connected' : 'disconnected'}">
                    ${this.isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
                </div>
                
                <div class="multiplayer-options">
                    <button class="mp-option-btn primary" id="createSessionBtn" ${!this.isConnected ? 'disabled' : ''}>
                        <div class="btn-icon">🏗️</div>
                        <div class="btn-text">
                            <h3>Criar Sala</h3>
                            <p>Convide amigos para jogar</p>
                        </div>
                    </button>
                    
                    <button class="mp-option-btn" id="joinSessionBtn" ${!this.isConnected ? 'disabled' : ''}>
                        <div class="btn-icon">🚪</div>
                        <div class="btn-text">
                            <h3>Entrar na Sala</h3>
                            <p>Use um código de sala</p>
                        </div>
                    </button>
                    
                    <button class="mp-option-btn" id="quickMatchBtn" ${!this.isConnected ? 'disabled' : ''}>
                        <div class="btn-icon">⚡</div>
                        <div class="btn-text">
                            <h3>Partida Rápida</h3>
                            <p>Encontre jogadores da sua série</p>
                        </div>
                    </button>
                </div>
                
                ${!this.isConnected ? `
                    <div class="reconnect-section">
                        <p>Conectando ao servidor...</p>
                        <button class="reconnect-btn" id="manualReconnectBtn">🔄 Tentar Novamente</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupMainMenuEvents(modal);
    }

    setupMainMenuEvents(modal) {
        modal.querySelector('.close-multiplayer').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#createSessionBtn')?.addEventListener('click', () => {
            this.createSession();
        });
        
        modal.querySelector('#joinSessionBtn')?.addEventListener('click', () => {
            this.showJoinSessionModal();
        });
        
        modal.querySelector('#quickMatchBtn')?.addEventListener('click', () => {
            this.findQuickMatch();
        });
        
        modal.querySelector('#manualReconnectBtn')?.addEventListener('click', () => {
            this.connectWebSocket();
        });
    }

    createSession() {
        const player = window.playerProfile?.getCurrentPlayer();
        if (!player) {
            this.showError('Você precisa estar logado para criar uma sala');
            return;
        }
        
        this.sendMessage({
            type: 'createSession',
            settings: {
                maxPlayers: 4,
                rounds: 10,
                timePerQuestion: 30,
                gradeFilter: player.grade,
                difficulty: 'auto'
            }
        });
    }

    showJoinSessionModal() {
        const joinModal = document.createElement('div');
        joinModal.className = 'join-session-modal';
        
        joinModal.innerHTML = `
            <div class="join-content">
                <h3>🚪 Entrar na Sala</h3>
                <div class="input-group">
                    <label>Código da Sala:</label>
                    <input type="text" id="sessionCodeInput" placeholder="Ex: ABC123" maxlength="6">
                </div>
                <div class="join-buttons">
                    <button class="cancel-btn">Cancelar</button>
                    <button class="join-btn">Entrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(joinModal);
        
        const input = joinModal.querySelector('#sessionCodeInput');
        input.focus();
        
        joinModal.querySelector('.join-btn').addEventListener('click', () => {
            const code = input.value.trim().toUpperCase();
            if (code.length >= 4) {
                this.joinSession(code);
                joinModal.remove();
            }
        });
        
        joinModal.querySelector('.cancel-btn').addEventListener('click', () => {
            joinModal.remove();
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinModal.querySelector('.join-btn').click();
            }
        });
    }

    joinSession(sessionId) {
        const player = window.playerProfile?.getCurrentPlayer();
        if (!player) {
            this.showError('Você precisa estar logado para entrar em uma sala');
            return;
        }
        
        this.sendMessage({
            type: 'joinSession',
            sessionId: sessionId
        });
    }

    findQuickMatch() {
        const player = window.playerProfile?.getCurrentPlayer();
        if (!player) {
            this.showError('Você precisa estar logado para jogar');
            return;
        }
        
        this.sendMessage({
            type: 'findQuickMatch',
            criteria: {
                grade: player.grade,
                maxWaitTime: 30000 // 30 segundos
            }
        });
        
        this.showWaitingForMatch();
    }

    showSessionCode(sessionId) {
        const modal = document.getElementById('multiplayerMainModal');
        if (modal) modal.remove();
        
        const waitingModal = document.createElement('div');
        waitingModal.id = 'waitingRoomModal';
        waitingModal.className = 'waiting-room-modal';
        
        waitingModal.innerHTML = `
            <div class="waiting-content">
                <div class="session-info">
                    <h2>🏗️ Sala Criada!</h2>
                    <div class="session-code">
                        <p>Código da Sala:</p>
                        <div class="code-display" id="sessionCodeDisplay">${sessionId}</div>
                        <button class="copy-code-btn" id="copyCodeBtn">📋 Copiar</button>
                    </div>
                </div>
                
                <div class="players-waiting">
                    <h3>👥 Jogadores na Sala</h3>
                    <div id="playersListWaiting"></div>
                </div>
                
                <div class="host-controls">
                    <button class="start-game-btn" id="startGameBtn" disabled>🚀 Começar Jogo</button>
                    <button class="close-session-btn" id="closeSessionBtn">❌ Fechar Sala</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(waitingModal);
        this.setupWaitingRoomEvents(waitingModal);
        this.updatePlayersList();
    }

    setupWaitingRoomEvents(modal) {
        modal.querySelector('#copyCodeBtn').addEventListener('click', () => {
            const code = modal.querySelector('#sessionCodeDisplay').textContent;
            navigator.clipboard.writeText(code).then(() => {
                this.showNotification('✅ Código copiado!');
            });
        });
        
        modal.querySelector('#startGameBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        modal.querySelector('#closeSessionBtn').addEventListener('click', () => {
            this.closeSession();
        });
    }

    updatePlayersList() {
        const container = document.getElementById('playersListWaiting');
        if (!container || !this.sessionState.players) return;
        
        container.innerHTML = this.sessionState.players.map(player => `
            <div class="player-card ${player.id === this.sessionState.hostId ? 'host' : ''}">
                <div class="player-avatar">${window.playerProfile?.avatars.find(a => a.id === player.avatar)?.emoji || '👤'}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-details">${player.age} anos • ${player.grade}º ano • Nível ${player.level}</div>
                </div>
                ${player.id === this.sessionState.hostId ? '<div class="host-badge">👑 Host</div>' : ''}
            </div>
        `).join('');
        
        // Atualizar botão de iniciar
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn && this.isHost) {
            startBtn.disabled = this.sessionState.players.length < 2;
        }
    }

    startGame() {
        if (this.isHost && this.sessionState.players.length >= 2) {
            this.sendMessage({
                type: 'startGame'
            });
        }
    }

    startMultiplayerQuiz() {
        const modal = document.getElementById('waitingRoomModal');
        if (modal) modal.remove();
        
        this.showGameInterface();
    }

    showGameInterface() {
        const gameModal = document.createElement('div');
        gameModal.id = 'multiplayerGameModal';
        gameModal.className = 'multiplayer-game-modal';
        
        gameModal.innerHTML = `
            <div class="game-interface">
                <div class="game-header">
                    <div class="round-info">
                        <span id="currentRound">Rodada 1</span> / <span id="maxRounds">${this.sessionState.maxRounds}</span>
                    </div>
                    <div class="timer-container">
                        <div class="timer" id="questionTimer">30</div>
                    </div>
                </div>
                
                <div class="players-scores">
                    <div id="playersScoresList"></div>
                </div>
                
                <div class="question-container" id="questionContainer">
                    <div class="waiting-question">
                        <h3>⏳ Aguardando próxima pergunta...</h3>
                    </div>
                </div>
                
                <div class="player-answers" id="playerAnswersArea"></div>
            </div>
        `;
        
        document.body.appendChild(gameModal);
        this.updateScoresDisplay();
    }

    showMultiplayerQuestion(question) {
        const container = document.getElementById('questionContainer');
        if (!container) return;
        
        this.startQuestionTimer(30);
        
        container.innerHTML = `
            <div class="mp-question">
                <div class="question-category">${question.category}</div>
                <h3>${question.q}</h3>
                <div class="mp-options">
                    ${question.options.map((option, index) => `
                        <button class="mp-option-btn" data-answer="${option}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Event listeners para as opções
        container.querySelectorAll('.mp-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.answerMultiplayerQuestion(e.target.dataset.answer);
                // Desabilitar todos os botões após resposta
                container.querySelectorAll('.mp-option-btn').forEach(b => b.disabled = true);
                e.target.classList.add('selected');
            });
        });
    }

    answerMultiplayerQuestion(answer) {
        const timeToAnswer = 30 - parseInt(document.getElementById('questionTimer').textContent);
        
        this.sendMessage({
            type: 'answerQuestion',
            answer: answer,
            timeToAnswer: timeToAnswer
        });
    }

    startQuestionTimer(seconds) {
        const timerElement = document.getElementById('questionTimer');
        if (!timerElement) return;
        
        let timeLeft = seconds;
        timerElement.textContent = timeLeft;
        
        const timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 5) {
                timerElement.classList.add('urgent');
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                // Auto-responder se não respondeu
                const buttons = document.querySelectorAll('.mp-option-btn:not(:disabled)');
                if (buttons.length > 0) {
                    this.answerMultiplayerQuestion('');
                }
            }
        }, 1000);
    }

    showPlayerAnswer(playerId, isCorrect, timeToAnswer) {
        const answersArea = document.getElementById('playerAnswersArea');
        if (!answersArea) return;
        
        const player = this.sessionState.players.find(p => p.id === playerId);
        if (!player) return;
        
        const answerNotification = document.createElement('div');
        answerNotification.className = `player-answer-notification ${isCorrect ? 'correct' : 'incorrect'}`;
        answerNotification.innerHTML = `
            <div class="player-quick-info">
                <span class="player-avatar">${window.playerProfile?.avatars.find(a => a.id === player.avatar)?.emoji || '👤'}</span>
                <span class="player-name">${player.name}</span>
            </div>
            <div class="answer-result">
                ${isCorrect ? '✅' : '❌'} ${timeToAnswer}s
            </div>
        `;
        
        answersArea.appendChild(answerNotification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            answerNotification.remove();
        }, 3000);
    }

    showRoundResults(results) {
        const resultsModal = document.createElement('div');
        resultsModal.className = 'round-results-modal';
        
        resultsModal.innerHTML = `
            <div class="results-content">
                <h2>📊 Resultados da Rodada</h2>
                <div class="results-list">
                    ${results.map((result, index) => `
                        <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                            <div class="position">${index + 1}º</div>
                            <div class="player-info">
                                <span class="avatar">${window.playerProfile?.avatars.find(a => a.id === result.avatar)?.emoji || '👤'}</span>
                                <span class="name">${result.name}</span>
                            </div>
                            <div class="result-details">
                                ${result.isCorrect ? '✅' : '❌'} ${result.timeToAnswer || 0}s
                                <div class="points">+${result.points || 0} pts</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="continue-btn">➡️ Próxima Rodada</button>
            </div>
        `;
        
        document.body.appendChild(resultsModal);
        
        resultsModal.querySelector('.continue-btn').addEventListener('click', () => {
            resultsModal.remove();
        });
        
        // Auto-continuar após 5 segundos
        setTimeout(() => {
            if (resultsModal.parentNode) {
                resultsModal.remove();
            }
        }, 5000);
        
        this.updateScoresDisplay();
    }

    updateScoresDisplay() {
        const scoresContainer = document.getElementById('playersScoresList');
        if (!scoresContainer || !this.sessionState.players) return;
        
        // Ordenar por pontuação
        const sortedPlayers = [...this.sessionState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
        
        scoresContainer.innerHTML = sortedPlayers.map((player, index) => `
            <div class="score-item ${index === 0 ? 'first-place' : ''}">
                <div class="position">${index + 1}º</div>
                <div class="player-quick">
                    <span class="avatar">${window.playerProfile?.avatars.find(a => a.id === player.avatar)?.emoji || '👤'}</span>
                    <span class="name">${player.name}</span>
                </div>
                <div class="score">${player.score || 0} pts</div>
            </div>
        `).join('');
    }

    showFinalResults(finalResults) {
        const modal = document.getElementById('multiplayerGameModal');
        if (modal) modal.remove();
        
        const finalModal = document.createElement('div');
        finalModal.className = 'final-results-modal';
        
        finalModal.innerHTML = `
            <div class="final-content">
                <h2>🏆 Resultado Final</h2>
                
                <div class="podium">
                    ${finalResults.slice(0, 3).map((player, index) => `
                        <div class="podium-place place-${index + 1}">
                            <div class="medal">${['🥇', '🥈', '🥉'][index]}</div>
                            <div class="player-avatar">${window.playerProfile?.avatars.find(a => a.id === player.avatar)?.emoji || '👤'}</div>
                            <div class="player-name">${player.name}</div>
                            <div class="final-score">${player.score} pts</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="all-results">
                    ${finalResults.map((player, index) => `
                        <div class="final-result-item">
                            <div class="position">${index + 1}º</div>
                            <div class="player-info">
                                <span class="avatar">${window.playerProfile?.avatars.find(a => a.id === player.avatar)?.emoji || '👤'}</span>
                                <span class="name">${player.name}</span>
                            </div>
                            <div class="stats">
                                <div>📊 ${player.score} pts</div>
                                <div>✅ ${player.correctAnswers}/${this.sessionState.maxRounds}</div>
                                <div>⚡ ${player.avgTime}s média</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="final-actions">
                    <button class="play-again-btn">🔄 Jogar Novamente</button>
                    <button class="back-menu-btn">🏠 Menu Principal</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(finalModal);
        
        finalModal.querySelector('.play-again-btn').addEventListener('click', () => {
            this.startGame();
            finalModal.remove();
        });
        
        finalModal.querySelector('.back-menu-btn').addEventListener('click', () => {
            finalModal.remove();
            this.showMainMenu();
        });
        
        // Salvar resultado para o ranking
        this.saveMultiplayerResult(finalResults);
    }

    async saveMultiplayerResult(results) {
        const player = window.playerProfile?.getCurrentPlayer();
        if (!player) return;
        
        const playerResult = results.find(r => r.id === player.id);
        if (!playerResult) return;
        
        const multiplayerStats = {
            totalGames: (player.multiplayerStats?.totalGames || 0) + 1,
            wins: (player.multiplayerStats?.wins || 0) + (playerResult.position === 1 ? 1 : 0),
            totalScore: (player.multiplayerStats?.totalScore || 0) + playerResult.score,
            bestPosition: Math.min(player.multiplayerStats?.bestPosition || 999, playerResult.position),
            lastPlayed: Date.now()
        };
        
        await window.playerProfile?.updatePlayerData({
            multiplayerStats,
            balance: player.balance + playerResult.reward
        });
    }

    closeSession() {
        this.sendMessage({ type: 'closeSession' });
        this.currentSession = null;
        this.sessionState = { id: null, players: [], currentRound: 0, maxRounds: 10, status: 'waiting', hostId: null };
        
        const modal = document.getElementById('waitingRoomModal');
        if (modal) modal.remove();
    }

    handleSessionClosed() {
        this.currentSession = null;
        this.sessionState = { id: null, players: [], currentRound: 0, maxRounds: 10, status: 'waiting', hostId: null };
        
        const modals = ['waitingRoomModal', 'multiplayerGameModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) modal.remove();
        });
        
        this.showNotification('⚠️ A sessão foi encerrada');
    }

    showError(error) {
        this.showNotification(`❌ ${error}`, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `multiplayer-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showConnectionError() {
        this.showNotification('❌ Não foi possível conectar ao servidor. Ativando modo offline.', 'error');
        // Ativar modo offline automaticamente
        localStorage.setItem('offlineMode', 'true');
        this.simulateOfflineMode();
    }

    simulateOfflineMode() {
        console.log('🔄 Simulando modo offline para desenvolvimento');
        this.isConnected = true;
        
        // Simular delay de conexão
        setTimeout(() => {
            if (window.playerProfile?.getCurrentPlayer()) {
                this.authenticatePlayer();
            }
        }, 1000);
    }

    setupEventHandlers() {
        // Fechar conexão quando sair da página
        window.addEventListener('beforeunload', () => {
            if (this.ws) {
                this.ws.close();
            }
        });
    }
}

// Instância global
window.multiplayerSession = null;