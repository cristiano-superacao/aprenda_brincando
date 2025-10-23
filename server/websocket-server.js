const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class MultiplayerWebSocketServer {
    constructor(serv
        this.wss = new WebSocket.Server({ server });
        this.sessions = new Map(); // sessionId -> session data
        this.players = new Map(); // playerId -> player connection
        this.connections = new Map(); // ws -> player data
        
        this.setupWebSocketServer();
        console.log('🎮 Servidor WebSocket multiplayer iniciado');
    }

    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            console.log('👋 Nova conexão WebSocket');
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(ws, data);
                } catch (error) {
                    console.error('Erro ao processar mensagem:', error);
                    this.sendError(ws, 'Mensagem inválida');
                }
            });
            
            ws.on('close', () => {
                this.handleDisconnection(ws);
            });
            
            ws.on('error', (error) => {
                console.error('Erro WebSocket:', error);
            });
        });
    }

    handleMessage(ws, data) {
        switch (data.type) {
            case 'authenticate':
                this.authenticatePlayer(ws, data.player);
                break;
                
            case 'createSession':
                this.createSession(ws, data.settings);
                break;
                
            case 'joinSession':
                this.joinSession(ws, data.sessionId);
                break;
                
            case 'findQuickMatch':
                this.findQuickMatch(ws, data.criteria);
                break;
                
            case 'startGame':
                this.startGame(ws);
                break;
                
            case 'answerQuestion':
                this.handleAnswer(ws, data.answer, data.timeToAnswer);
                break;
                
            case 'closeSession':
                this.closeSession(ws);
                break;
                
            default:
                this.sendError(ws, 'Tipo de mensagem desconhecido');
        }
    }

    authenticatePlayer(ws, playerData) {
        this.connections.set(ws, playerData);
        this.players.set(playerData.id, ws);
        
        console.log(`🔐 Jogador autenticado: ${playerData.name} (${playerData.id})`);
    }

    createSession(ws, settings) {
        const player = this.connections.get(ws);
        if (!player) {
            return this.sendError(ws, 'Jogador não autenticado');
        }

        const sessionId = this.generateSessionCode();
        const session = {
            id: sessionId,
            hostId: player.id,
            settings: {
                maxPlayers: settings.maxPlayers || 4,
                rounds: settings.rounds || 10,
                timePerQuestion: settings.timePerQuestion || 30,
                gradeFilter: settings.gradeFilter,
                difficulty: settings.difficulty || 'auto'
            },
            players: [this.playerToSessionFormat(player)],
            status: 'waiting',
            currentRound: 0,
            currentQuestion: null,
            answers: new Map(),
            createdAt: Date.now()
        };

        this.sessions.set(sessionId, session);
        
        this.send(ws, {
            type: 'sessionCreated',
            session: this.sessionToClientFormat(session)
        });

        console.log(`🏗️ Sessão criada: ${sessionId} por ${player.name}`);
    }

    joinSession(ws, sessionId) {
        const player = this.connections.get(ws);
        if (!player) {
            return this.sendError(ws, 'Jogador não autenticado');
        }

        const session = this.sessions.get(sessionId);
        if (!session) {
            return this.sendError(ws, 'Sessão não encontrada');
        }

        if (session.status !== 'waiting') {
            return this.sendError(ws, 'Sessão já iniciada ou finalizada');
        }

        if (session.players.length >= session.settings.maxPlayers) {
            return this.sendError(ws, 'Sessão está cheia');
        }

        // Verificar se jogador já está na sessão
        if (session.players.find(p => p.id === player.id)) {
            return this.sendError(ws, 'Você já está nesta sessão');
        }

        // Filtro por série se configurado
        if (session.settings.gradeFilter && player.grade !== session.settings.gradeFilter) {
            return this.sendError(ws, `Esta sessão é para estudantes do ${session.settings.gradeFilter}º ano`);
        }

        session.players.push(this.playerToSessionFormat(player));
        
        // Notificar todos os jogadores
        const sessionData = this.sessionToClientFormat(session);
        
        session.players.forEach(sessionPlayer => {
            const playerWs = this.players.get(sessionPlayer.id);
            if (playerWs) {
                this.send(playerWs, {
                    type: sessionPlayer.id === player.id ? 'sessionJoined' : 'playerJoined',
                    session: sessionData,
                    players: session.players,
                    newPlayer: sessionPlayer.id === player.id ? this.playerToSessionFormat(player) : undefined
                });
            }
        });

        console.log(`🚪 ${player.name} entrou na sessão ${sessionId}`);
    }

    findQuickMatch(ws, criteria) {
        const player = this.connections.get(ws);
        if (!player) {
            return this.sendError(ws, 'Jogador não autenticado');
        }

        // Procurar sessões disponíveis com critérios similares
        let availableSession = null;
        
        for (const [sessionId, session] of this.sessions) {
            if (session.status === 'waiting' && 
                session.players.length < session.settings.maxPlayers &&
                session.settings.gradeFilter === criteria.grade) {
                availableSession = session;
                break;
            }
        }

        if (availableSession) {
            // Entrar na sessão encontrada
            this.joinSession(ws, availableSession.id);
        } else {
            // Criar nova sessão para quick match
            this.createSession(ws, {
                maxPlayers: 4,
                rounds: 10,
                timePerQuestion: 30,
                gradeFilter: criteria.grade,
                difficulty: 'auto'
            });
        }
    }

    startGame(ws) {
        const player = this.connections.get(ws);
        if (!player) {
            return this.sendError(ws, 'Jogador não autenticado');
        }

        const session = this.findPlayerSession(player.id);
        if (!session) {
            return this.sendError(ws, 'Sessão não encontrada');
        }

        if (session.hostId !== player.id) {
            return this.sendError(ws, 'Apenas o host pode iniciar o jogo');
        }

        if (session.players.length < 2) {
            return this.sendError(ws, 'Mínimo 2 jogadores necessário');
        }

        session.status = 'playing';
        session.startedAt = Date.now();
        session.currentRound = 1;

        // Notificar todos os jogadores
        session.players.forEach(sessionPlayer => {
            const playerWs = this.players.get(sessionPlayer.id);
            if (playerWs) {
                this.send(playerWs, {
                    type: 'gameStarted',
                    session: this.sessionToClientFormat(session)
                });
            }
        });

        // Iniciar primeira pergunta
        setTimeout(() => {
            this.sendQuestion(session);
        }, 3000);

        console.log(`🚀 Jogo iniciado na sessão ${session.id}`);
    }

    sendQuestion(session) {
        if (session.status !== 'playing') return;

        const question = this.generateQuestion(session);
        session.currentQuestion = question;
        session.answers.clear();
        session.questionStartTime = Date.now();

        // Enviar pergunta para todos os jogadores
        session.players.forEach(sessionPlayer => {
            const playerWs = this.players.get(sessionPlayer.id);
            if (playerWs) {
                this.send(playerWs, {
                    type: 'newQuestion',
                    question: {
                        q: question.q,
                        options: question.options,
                        category: question.category,
                        points: question.points
                    },
                    round: session.currentRound,
                    maxRounds: session.settings.rounds
                });
            }
        });

        // Timer para auto-avançar
        setTimeout(() => {
            this.endQuestionRound(session);
        }, session.settings.timePerQuestion * 1000);
    }

    handleAnswer(ws, answer, timeToAnswer) {
        const player = this.connections.get(ws);
        if (!player) return;

        const session = this.findPlayerSession(player.id);
        if (!session || !session.currentQuestion) return;

        // Verificar se já respondeu
        if (session.answers.has(player.id)) return;

        const isCorrect = answer === session.currentQuestion.correct;
        const points = isCorrect ? session.currentQuestion.points : 0;

        session.answers.set(player.id, {
            playerId: player.id,
            answer: answer,
            isCorrect: isCorrect,
            timeToAnswer: timeToAnswer,
            points: points
        });

        // Atualizar score do jogador na sessão
        const sessionPlayer = session.players.find(p => p.id === player.id);
        if (sessionPlayer) {
            sessionPlayer.score = (sessionPlayer.score || 0) + points;
        }

        // Notificar outros jogadores que este jogador respondeu
        session.players.forEach(sessionPlayer => {
            if (sessionPlayer.id !== player.id) {
                const playerWs = this.players.get(sessionPlayer.id);
                if (playerWs) {
                    this.send(playerWs, {
                        type: 'playerAnswered',
                        playerId: player.id,
                        isCorrect: isCorrect,
                        timeToAnswer: timeToAnswer
                    });
                }
            }
        });

        // Se todos responderam, avançar imediatamente
        if (session.answers.size === session.players.length) {
            this.endQuestionRound(session);
        }
    }

    endQuestionRound(session) {
        if (session.status !== 'playing' || !session.currentQuestion) return;

        // Calcular resultados da rodada
        const results = session.players.map(player => {
            const answer = session.answers.get(player.id);
            return {
                id: player.id,
                name: player.name,
                avatar: player.avatar,
                isCorrect: answer ? answer.isCorrect : false,
                timeToAnswer: answer ? answer.timeToAnswer : session.settings.timePerQuestion,
                points: answer ? answer.points : 0,
                totalScore: player.score || 0
            };
        }).sort((a, b) => {
            if (a.isCorrect && !b.isCorrect) return -1;
            if (!a.isCorrect && b.isCorrect) return 1;
            if (a.isCorrect && b.isCorrect) return a.timeToAnswer - b.timeToAnswer;
            return 0;
        });

        // Enviar resultados da rodada
        session.players.forEach(sessionPlayer => {
            const playerWs = this.players.get(sessionPlayer.id);
            if (playerWs) {
                this.send(playerWs, {
                    type: 'roundResults',
                    results: results,
                    correctAnswer: session.currentQuestion.correct,
                    round: session.currentRound
                });
            }
        });

        session.currentQuestion = null;
        session.currentRound++;

        // Verificar se o jogo acabou
        if (session.currentRound > session.settings.rounds) {
            this.endGame(session);
        } else {
            // Próxima pergunta em 5 segundos
            setTimeout(() => {
                this.sendQuestion(session);
            }, 5000);
        }
    }

    endGame(session) {
        session.status = 'finished';
        session.finishedAt = Date.now();

        // Calcular resultados finais
        const finalResults = session.players
            .map((player, index) => ({
                id: player.id,
                name: player.name,
                avatar: player.avatar,
                score: player.score || 0,
                correctAnswers: this.getPlayerCorrectAnswers(session, player.id),
                avgTime: this.getPlayerAverageTime(session, player.id),
                position: 0,
                reward: 0
            }))
            .sort((a, b) => b.score - a.score)
            .map((player, index) => {
                player.position = index + 1;
                player.reward = this.calculateReward(player.position, player.score);
                return player;
            });

        // Enviar resultados finais
        session.players.forEach(sessionPlayer => {
            const playerWs = this.players.get(sessionPlayer.id);
            if (playerWs) {
                this.send(playerWs, {
                    type: 'gameFinished',
                    finalResults: finalResults,
                    sessionDuration: session.finishedAt - session.startedAt
                });
            }
        });

        console.log(`🏁 Jogo finalizado na sessão ${session.id}`);

        // Remover sessão após 5 minutos
        setTimeout(() => {
            this.sessions.delete(session.id);
        }, 5 * 60 * 1000);
    }

    closeSession(ws) {
        const player = this.connections.get(ws);
        if (!player) return;

        const session = this.findPlayerSession(player.id);
        if (!session) return;

        if (session.hostId === player.id) {
            // Host fechando - encerrar sessão
            session.players.forEach(sessionPlayer => {
                const playerWs = this.players.get(sessionPlayer.id);
                if (playerWs) {
                    this.send(playerWs, {
                        type: 'sessionClosed',
                        reason: 'Host encerrou a sessão'
                    });
                }
            });
            
            this.sessions.delete(session.id);
            console.log(`❌ Sessão ${session.id} encerrada pelo host`);
        } else {
            // Jogador saindo
            session.players = session.players.filter(p => p.id !== player.id);
            
            session.players.forEach(sessionPlayer => {
                const playerWs = this.players.get(sessionPlayer.id);
                if (playerWs) {
                    this.send(playerWs, {
                        type: 'playerLeft',
                        players: session.players,
                        leftPlayer: { id: player.id, name: player.name }
                    });
                }
            });
            
            console.log(`👋 ${player.name} saiu da sessão ${session.id}`);
        }
    }

    handleDisconnection(ws) {
        const player = this.connections.get(ws);
        if (player) {
            console.log(`👋 ${player.name} desconectou`);
            
            // Remover jogador da sessão se estiver em uma
            this.closeSession(ws);
            
            this.players.delete(player.id);
        }
        
        this.connections.delete(ws);
    }

    // Funções auxiliares
    generateSessionCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Verificar se já existe
        if (this.sessions.has(code)) {
            return this.generateSessionCode();
        }
        
        return code;
    }

    generateQuestion(session) {
        // Banco de perguntas básico - pode ser expandido
        const questions = {
            1: [
                { q: "Quanto é 2 + 3?", options: [5, 4, 6, 3], correct: 5, points: 10, category: "Matemática" },
                { q: "Qual número vem depois do 7?", options: [8, 6, 9, 5], correct: 8, points: 10, category: "Matemática" }
            ],
            2: [
                { q: "Quanto é 15 + 7?", options: [22, 21, 23, 20], correct: 22, points: 12, category: "Matemática" },
                { q: "Quanto é 20 - 8?", options: [12, 13, 11, 14], correct: 12, points: 12, category: "Matemática" }
            ],
            3: [
                { q: "Quanto é 8 × 6?", options: [48, 46, 50, 44], correct: 48, points: 15, category: "Matemática" },
                { q: "Quanto é 72 ÷ 8?", options: [9, 8, 10, 7], correct: 9, points: 15, category: "Matemática" }
            ]
        };

        const grade = session.settings.gradeFilter || 1;
        const gradeQuestions = questions[grade] || questions[1];
        
        return gradeQuestions[Math.floor(Math.random() * gradeQuestions.length)];
    }

    findPlayerSession(playerId) {
        for (const [sessionId, session] of this.sessions) {
            if (session.players.find(p => p.id === playerId)) {
                return session;
            }
        }
        return null;
    }

    playerToSessionFormat(player) {
        return {
            id: player.id,
            name: player.name,
            age: player.age,
            grade: player.grade,
            avatar: player.avatar,
            level: player.level || 1,
            score: 0
        };
    }

    sessionToClientFormat(session) {
        return {
            id: session.id,
            hostId: session.hostId,
            players: session.players,
            status: session.status,
            currentRound: session.currentRound,
            maxRounds: session.settings.rounds,
            settings: session.settings
        };
    }

    getPlayerCorrectAnswers(session, playerId) {
        // Implementar lógica para contar respostas corretas
        return 0;
    }

    getPlayerAverageTime(session, playerId) {
        // Implementar lógica para calcular tempo médio
        return 0;
    }

    calculateReward(position, score) {
        const baseReward = score * 0.1;
        const positionBonus = Math.max(0, (5 - position) * 10);
        return Math.round(baseReward + positionBonus);
    }

    send(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    sendError(ws, error) {
        this.send(ws, { type: 'error', error });
    }
}

module.exports = MultiplayerWebSocketServer;