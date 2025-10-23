// Sistema de Quiz Educativo Adaptativo
class EducationalQuizSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.currentQuiz = null;
        this.questionHistory = [];
        this.streakCount = 0;
        this.maxStreak = 0;
        
        // Banco de perguntas por série/idade
        this.questionBank = {
            1: { // 1º ano
                matematica: [
                    { q: "Quanto é 2 + 3?", options: [5, 4, 6, 3], correct: 5, points: 10 },
                    { q: "Qual número vem depois do 7?", options: [8, 6, 9, 5], correct: 8, points: 10 },
                    { q: "Quantos dedos temos em uma mão?", options: [5, 4, 6, 10], correct: 5, points: 10 }
                ],
                portugues: [
                    { q: "Quantas letras tem a palavra 'GATO'?", options: [4, 3, 5, 2], correct: 4, points: 10 },
                    { q: "Qual é a primeira letra do alfabeto?", options: ["A", "B", "C", "D"], correct: "A", points: 10 }
                ],
                financeira: [
                    { q: "Quando você quer comprar algo, o que precisa ter?", options: ["Dinheiro", "Fome", "Sono", "Sede"], correct: "Dinheiro", points: 15 },
                    { q: "Para que serve o dinheiro?", options: ["Comprar coisas", "Comer", "Dormir", "Brincar"], correct: "Comprar coisas", points: 15 }
                ]
            },
            2: { // 2º ano
                matematica: [
                    { q: "Quanto é 15 + 7?", options: [22, 21, 23, 20], correct: 22, points: 12 },
                    { q: "Quanto é 20 - 8?", options: [12, 13, 11, 14], correct: 12, points: 12 },
                    { q: "Quantas dezenas tem o número 45?", options: [4, 5, 3, 6], correct: 4, points: 12 }
                ],
                portugues: [
                    { q: "Qual palavra está escrita corretamente?", options: ["Casa", "Caza", "Kasa", "Caça"], correct: "Casa", points: 12 },
                    { q: "Quantas sílabas tem 'Borboleta'?", options: [4, 3, 5, 2], correct: 4, points: 12 }
                ],
                financeira: [
                    { q: "Se você tem R$ 10 e gasta R$ 3, quanto sobra?", options: [7, 6, 8, 5], correct: 7, points: 18 },
                    { q: "O que é melhor fazer com o dinheiro que sobra?", options: ["Guardar", "Perder", "Esquecer", "Rasgar"], correct: "Guardar", points: 18 }
                ]
            },
            3: { // 3º ano  
                matematica: [
                    { q: "Quanto é 8 × 6?", options: [48, 46, 50, 44], correct: 48, points: 15 },
                    { q: "Quanto é 72 ÷ 8?", options: [9, 8, 10, 7], correct: 9, points: 15 },
                    { q: "Quanto é 234 + 167?", options: [401, 400, 402, 399], correct: 401, points: 15 }
                ],
                portugues: [
                    { q: "Qual é o plural de 'animal'?", options: ["Animais", "Animales", "Animals", "Animalzinhos"], correct: "Animais", points: 15 },
                    { q: "Complete: 'O menino _____ para a escola'", options: ["Foi", "Vou", "Vai", "Vamos"], correct: "Foi", points: 15 }
                ],
                financeira: [
                    { q: "Se um brinquedo custa R$ 25 e você tem R$ 20, quanto falta?", options: [5, 4, 6, 3], correct: 5, points: 20 },
                    { q: "Por que é importante economizar dinheiro?", options: ["Para o futuro", "Para gastar logo", "Para perder", "Para emprestar"], correct: "Para o futuro", points: 20 }
                ]
            },
            4: { // 4º ano
                matematica: [
                    { q: "Quanto é 125 × 4?", options: [500, 520, 480, 505], correct: 500, points: 18 },
                    { q: "Qual é a metade de 246?", options: [123, 122, 124, 121], correct: 123, points: 18 },
                    { q: "Quanto é 15% de 200?", options: [30, 25, 35, 20], correct: 30, points: 20 }
                ],
                ciencias: [
                    { q: "Quantos planetas tem o sistema solar?", options: [8, 7, 9, 10], correct: 8, points: 18 },
                    { q: "De onde vem a luz do Sol?", options: ["Reações nucleares", "Fogo", "Eletricidade", "Magia"], correct: "Reações nucleares", points: 18 }
                ],
                financeira: [
                    { q: "Se você economizar R$ 5 por semana, quanto terá em um mês?", options: [20, 15, 25, 30], correct: 20, points: 25 },
                    { q: "O que são juros?", options: ["Dinheiro extra", "Desconto", "Perda", "Troca"], correct: "Dinheiro extra", points: 25 }
                ]
            },
            5: { // 5º ano
                matematica: [
                    { q: "Quanto é 2/3 de 150?", options: [100, 90, 110, 95], correct: 100, points: 20 },
                    { q: "Se um produto custa R$ 80 e tem 25% de desconto, qual o preço final?", options: [60, 55, 65, 70], correct: 60, points: 25 },
                    { q: "Qual é o perímetro de um quadrado com lado de 8cm?", options: [32, 28, 36, 30], correct: 32, points: 20 }
                ],
                geografia: [
                    { q: "Qual é a capital do Brasil?", options: ["Brasília", "São Paulo", "Rio de Janeiro", "Salvador"], correct: "Brasília", points: 18 },
                    { q: "Em que continente fica o Brasil?", options: ["América do Sul", "América do Norte", "África", "Europa"], correct: "América do Sul", points: 18 }
                ],
                financeira: [
                    { q: "O que é uma poupança?", options: ["Conta para guardar dinheiro", "Tipo de compra", "Forma de gasto", "Tipo de empréstimo"], correct: "Conta para guardar dinheiro", points: 30 },
                    { q: "Se você investir R$ 100 e ganhar 10% ao ano, quanto terá no final?", options: [110, 105, 115, 120], correct: 110, points: 30 }
                ]
            }
        };
        
        this.motivationalMessages = {
            correct: [
                "🌟 Incrível! Você está arrasando!",
                "🎉 Perfeito! Continue assim!",
                "💡 Muito inteligente! Parabéns!",
                "🏆 Excelente resposta! Você é demais!",
                "⭐ Fantástico! Seu conhecimento está crescendo!",
                "🎯 Certinho! Você está no caminho certo!",
                "🚀 Uau! Que resposta genial!",
                "🌈 Brilhante! Continue estudando assim!"
            ],
            incorrect: [
                "💪 Não desista! Todo erro é uma oportunidade de aprender!",
                "📚 Que tal estudar um pouquinho mais? Você consegue!",
                "🌱 Está crescendo! Cada erro te deixa mais inteligente!",
                "⭐ Quase lá! Continue tentando, você é capaz!",
                "🎯 Boa tentativa! Vamos praticar mais?",
                "💫 Não tem problema errar! O importante é tentar!",
                "🔥 Persistência é a chave! Vamos continuar!",
                "🌟 Você está aprendendo! Isso é o que importa!"
            ],
            encouragement: [
                "🎓 Cada pergunta respondida te deixa mais esperto!",
                "💎 Seu esforço vale ouro! Continue assim!",
                "🏃‍♂️ Passo a passo você chegará longe!",
                "🌱 Está plantando sementes de conhecimento!",
                "🎪 Aprender pode ser divertido!",
                "🦋 Está se transformando em um pequeno gênio!"
            ]
        };
    }

    generateQuizForPlayer(player) {
        if (!player) return null;
        
        const grade = player.grade;
        const questions = this.questionBank[grade];
        
        if (!questions) {
            // Fallback para perguntas básicas
            return this.generateBasicQuiz();
        }
        
        // Selecionar categoria aleatória
        const categories = Object.keys(questions);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const categoryQuestions = questions[category];
        
        // Selecionar pergunta aleatória
        const question = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
        
        return {
            ...question,
            category,
            grade,
            id: Date.now()
        };
    }

    generateBasicQuiz() {
        const basicQuestions = [
            { q: "Quanto é 2 + 2?", options: [4, 3, 5, 6], correct: 4, points: 10, category: "matematica" },
            { q: "Quantas pernas tem um gato?", options: [4, 2, 6, 8], correct: 4, points: 10, category: "ciencias" },
            { q: "Para que serve o dinheiro?", options: ["Comprar coisas", "Comer", "Dormir", "Correr"], correct: "Comprar coisas", points: 15, category: "financeira" }
        ];
        
        const question = basicQuestions[Math.floor(Math.random() * basicQuestions.length)];
        return { ...question, grade: 1, id: Date.now() };
    }

    async showQuiz() {
        const player = window.playerProfile?.getCurrentPlayer();
        if (!player) {
            console.error('Nenhum jogador logado');
            return;
        }
        
        this.currentQuiz = this.generateQuizForPlayer(player);
        if (!this.currentQuiz) return;
        
        this.createQuizModal();
    }

    createQuizModal() {
        const modal = document.createElement('div');
        modal.id = 'educationalQuizModal';
        modal.className = 'educational-quiz-modal';
        
        const categoryEmojis = {
            matematica: '🔢',
            portugues: '📝',
            ciencias: '🔬',
            geografia: '🌍',
            historia: '📜',
            financeira: '💰'
        };
        
        const categoryIcon = categoryEmojis[this.currentQuiz.category] || '🎓';
        
        modal.innerHTML = `
            <div class="quiz-content">
                <div class="quiz-header">
                    <div class="category-badge">
                        ${categoryIcon} ${this.currentQuiz.category.charAt(0).toUpperCase() + this.currentQuiz.category.slice(1)}
                    </div>
                    <div class="streak-info">
                        🔥 Sequência: ${this.streakCount}
                    </div>
                </div>
                
                <div class="quiz-question">
                    <h3>${this.currentQuiz.q}</h3>
                </div>
                
                <div class="quiz-options">
                    ${this.currentQuiz.options.map((option, index) => `
                        <button class="quiz-option-btn" data-answer="${option}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
                
                <div class="quiz-info">
                    <div class="points-reward">🎁 +${this.currentQuiz.points} pontos</div>
                    <div class="player-level">${window.playerProfile?.getCurrentPlayer()?.grade}º ano</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelectorAll('.quiz-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.answerQuestion(e.target.dataset.answer);
            });
        });
    }

    async answerQuestion(selectedAnswer) {
        const isCorrect = selectedAnswer == this.currentQuiz.correct;
        const player = window.playerProfile?.getCurrentPlayer();
        
        // Remover modal
        const modal = document.getElementById('educationalQuizModal');
        if (modal) modal.remove();
        
        if (isCorrect) {
            this.streakCount++;
            this.maxStreak = Math.max(this.maxStreak, this.streakCount);
            
            // Calcular recompensa
            const baseReward = this.currentQuiz.points;
            const streakBonus = Math.floor(this.streakCount / 3) * 5; // Bônus a cada 3 acertos
            const totalReward = baseReward + streakBonus;
            
            // Atualizar saldo do jogador
            if (player && window.playerProfile) {
                await window.playerProfile.updatePlayerData({
                    balance: player.balance + totalReward,
                    experience: (player.experience || 0) + (totalReward / 2)
                });
            }
            
            // Atualizar jogo principal
            if (this.game) {
                this.game.balance += totalReward;
                this.game.addExperience(totalReward / 2);
                this.game.updateDisplay();
            }
            
            // Mensagem de sucesso
            this.showFeedback(true, totalReward);
            
            // Registrar acerto
            this.questionHistory.push({
                question: this.currentQuiz,
                answer: selectedAnswer,
                correct: true,
                timestamp: Date.now(),
                reward: totalReward
            });
            
        } else {
            this.streakCount = 0;
            
            // Mensagem motivacional
            this.showFeedback(false, 0);
            
            // Registrar erro
            this.questionHistory.push({
                question: this.currentQuiz,
                answer: selectedAnswer,
                correct: false,
                correctAnswer: this.currentQuiz.correct,
                timestamp: Date.now()
            });
        }
        
        // Salvar progresso
        await this.saveProgress();
    }

    showFeedback(isCorrect, reward = 0) {
        const feedbackModal = document.createElement('div');
        feedbackModal.className = 'feedback-modal';
        
        if (isCorrect) {
            const correctMsg = this.motivationalMessages.correct[Math.floor(Math.random() * this.motivationalMessages.correct.length)];
            feedbackModal.innerHTML = `
                <div class="feedback-content success">
                    <div class="feedback-icon">🎉</div>
                    <h3>Resposta Correta!</h3>
                    <p>${correctMsg}</p>
                    <div class="reward-info">
                        💰 +R$ ${reward.toFixed(2)}
                        ${this.streakCount > 1 ? `<br>🔥 Sequência: ${this.streakCount}` : ''}
                    </div>
                    <button class="continue-btn">🚀 Continuar</button>
                </div>
            `;
        } else {
            const incorrectMsg = this.motivationalMessages.incorrect[Math.floor(Math.random() * this.motivationalMessages.incorrect.length)];
            feedbackModal.innerHTML = `
                <div class="feedback-content error">
                    <div class="feedback-icon">💪</div>
                    <h3>Quase lá!</h3>
                    <p>${incorrectMsg}</p>
                    <div class="correct-answer">
                        ✅ Resposta correta: ${this.currentQuiz.correct}
                    </div>
                    <button class="continue-btn">📚 Continuar Aprendendo</button>
                </div>
            `;
        }
        
        document.body.appendChild(feedbackModal);
        
        feedbackModal.querySelector('.continue-btn').addEventListener('click', () => {
            feedbackModal.remove();
        });
        
        // Auto-remove após 5 segundos
        setTimeout(() => {
            if (feedbackModal.parentNode) {
                feedbackModal.remove();
            }
        }, 5000);
        
        // Mostrar no agente educativo também
        if (window.game?.educationalAgent) {
            const agentMessage = isCorrect ? 
                `🎉 Parabéns! Você acertou e ganhou R$ ${reward.toFixed(2)}! Continue assim que você vai longe!` :
                `💪 ${incorrectMsg} A resposta era: ${this.currentQuiz.correct}. Vamos tentar outra?`;
            
            setTimeout(() => {
                window.game.educationalAgent.addMessageToConversation(agentMessage, 'agent');
            }, 1000);
        }
    }

    async saveProgress() {
        const player = window.playerProfile?.getCurrentPlayer();
        if (!player) return;
        
        const progressData = {
            streakCount: this.streakCount,
            maxStreak: this.maxStreak,
            totalQuestions: this.questionHistory.length,
            correctAnswers: this.questionHistory.filter(q => q.correct).length,
            lastActivity: Date.now()
        };
        
        try {
            if (!player.isOffline) {
                await fetch(`/api/player/${player.id}/quiz-progress`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(progressData)
                });
            } else {
                localStorage.setItem('quizProgress', JSON.stringify(progressData));
            }
        } catch (error) {
            console.error('Erro ao salvar progresso:', error);
            localStorage.setItem('quizProgress', JSON.stringify(progressData));
        }
    }

    getPlayerStats() {
        const correct = this.questionHistory.filter(q => q.correct).length;
        const total = this.questionHistory.length;
        const accuracy = total > 0 ? (correct / total * 100).toFixed(1) : 0;
        
        return {
            totalQuestions: total,
            correctAnswers: correct,
            accuracy: accuracy,
            currentStreak: this.streakCount,
            maxStreak: this.maxStreak,
            totalRewards: this.questionHistory
                .filter(q => q.correct)
                .reduce((sum, q) => sum + (q.reward || 0), 0)
        };
    }

    showStats() {
        const stats = this.getPlayerStats();
        const player = window.playerProfile?.getCurrentPlayer();
        
        const statsModal = document.createElement('div');
        statsModal.className = 'stats-modal';
        statsModal.innerHTML = `
            <div class="stats-content">
                <div class="stats-header">
                    <h2>📊 Suas Estatísticas</h2>
                    <span class="close-stats">❌</span>
                </div>
                
                <div class="player-summary">
                    <div class="player-avatar">${window.playerProfile?.avatars.find(a => a.id === player?.avatar)?.emoji || '👤'}</div>
                    <div class="player-info">
                        <h3>${player?.name || 'Jogador'}</h3>
                        <p>${player?.age} anos • ${player?.grade}º ano</p>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-value">${stats.accuracy}%</div>
                        <div class="stat-label">Precisão</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📚</div>
                        <div class="stat-value">${stats.totalQuestions}</div>
                        <div class="stat-label">Perguntas</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${stats.correctAnswers}</div>
                        <div class="stat-label">Acertos</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-value">${stats.maxStreak}</div>
                        <div class="stat-label">Melhor Sequência</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">R$ ${stats.totalRewards.toFixed(2)}</div>
                        <div class="stat-label">Total Ganho</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${player?.level || 1}</div>
                        <div class="stat-label">Nível Atual</div>
                    </div>
                </div>
                
                <div class="encouragement-message">
                    <p>${this.motivationalMessages.encouragement[Math.floor(Math.random() * this.motivationalMessages.encouragement.length)]}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(statsModal);
        
        statsModal.querySelector('.close-stats').addEventListener('click', () => {
            statsModal.remove();
        });
    }
}

// Instância global
window.educationalQuizSystem = null;