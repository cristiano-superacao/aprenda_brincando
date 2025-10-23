// Utilitários e Helpers Compartilhados
class GameUtils {
    // Formatação de moeda
    static formatCurrency(value) {
        return `R$ ${value.toFixed(2)}`;
    }

    // Formatação de pontos
    static formatPoints(points) {
        return `${points} Pontos`;
    }

    // Formatação de tempo
    static formatTime() {
        return new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit', 
            minute: '2-digit'
        });
    }

    // Gerar ID único
    static generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Animação suave de elementos
    static animateElement(element, animation = 'fadeIn') {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 50);
    }

    // Remover animação destacada
    static removeHighlight(element, delay = 1000) {
        element.classList.add('highlight');
        setTimeout(() => {
            element.classList.remove('highlight');
        }, delay);
    }

    // Shuffle array (para quiz)
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Validar saldo suficiente
    static hasSufficientBalance(balance, cost) {
        return balance >= cost;
    }

    // Calcular experiência necessária para próximo nível
    static calculateExpForNextLevel(currentLevel) {
        return Math.floor(100 * Math.pow(1.5, currentLevel - 1));
    }

    // Debounce para evitar cliques múltiplos
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Validar dados de entrada
    static validateInput(input, type = 'number') {
        if (type === 'number') {
            const num = parseFloat(input);
            return !isNaN(num) && num >= 0;
        }
        if (type === 'string') {
            return typeof input === 'string' && input.trim().length > 0;
        }
        return false;
    }

    // Utilitários DOM
    static getElement(id) {
        return document.getElementById(id);
    }

    static getElements(selector) {
        return document.querySelectorAll(selector);
    }

    static safeUpdateElement(id, content, property = 'textContent') {
        const element = this.getElement(id);
        if (element) {
            element[property] = content;
        }
        return element;
    }

    static addClass(element, className) {
        if (element && typeof element.classList !== 'undefined') {
            element.classList.add(className);
        }
    }

    static removeClass(element, className) {
        if (element && typeof element.classList !== 'undefined') {
            element.classList.remove(className);
        }
    }
}

// Sistema de Notificações Centralizado
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
    }

    show(message, type = 'info', duration = 3000) {
        const notification = {
            id: GameUtils.generateId(),
            message,
            type,
            timestamp: Date.now()
        };

        this.notifications.push(notification);
        this.render();

        setTimeout(() => {
            this.remove(notification.id);
        }, duration);

        return notification.id;
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    }

    remove(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.render();
    }

    render() {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Limitar número de notificações
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(-this.maxNotifications);
        }

        container.innerHTML = this.notifications.map(notification => `
            <div class="notification notification-${notification.type}" data-id="${notification.id}">
                <span class="notification-icon">${this.getIcon(notification.type)}</span>
                <span class="notification-message">${notification.message}</span>
                <button class="notification-close" onclick="window.notificationSystem.remove('${notification.id}')">×</button>
            </div>
        `).join('');
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
}

// Sistema de Quiz centralizado
class QuizManager {
    static generateQuiz() {
        const quizTypes = ['math', 'money', 'riddle'];
        const type = quizTypes[Math.floor(Math.random() * quizTypes.length)];
        
        switch (type) {
            case 'math':
                return this.generateMathQuiz();
            case 'money':
                return this.generateMoneyQuiz();
            case 'riddle':
                return this.generateRiddleQuiz();
            default:
                return this.generateMathQuiz();
        }
    }

    static generateMathQuiz() {
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        let a, b, answer;
        
        if (operation === '+') {
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
            answer = a + b;
        } else if (operation === '-') {
            a = Math.floor(Math.random() * 20) + 10;
            b = Math.floor(Math.random() * a);
            answer = a - b;
        } else { // multiplicação
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            answer = a * b;
        }
        
        const wrongAnswers = [
            answer + Math.floor(Math.random() * 5) + 1,
            answer - Math.floor(Math.random() * 5) - 1,
            answer + Math.floor(Math.random() * 10) + 5
        ].filter(w => w !== answer && w > 0);
        
        const options = [answer, ...wrongAnswers.slice(0, 3)].sort(() => Math.random() - 0.5);
        
        return {
            type: 'math',
            question: `Quanto é ${a} ${operation} ${b}?`,
            options: options,
            correct: answer,
            reward: Math.floor(Math.random() * 3) + 2 // R$ 2-4
        };
    }

    static generateMoneyQuiz() {
        const scenarios = [
            {
                question: "Se você tem R$ 10,00 e compra algo por R$ 3,50, quanto sobra?",
                answer: 6.50,
                reward: 3
            },
            {
                question: "Quantos centavos tem em R$ 2,75?",
                answer: 275,
                reward: 4
            },
            {
                question: "Se você economizar R$ 1,00 por dia, quanto terá em uma semana?",
                answer: 7.00,
                reward: 5
            },
            {
                question: "Se você tem R$ 5,00 e quer comprar algo por R$ 7,00, o que deve fazer?",
                answer: "Esperar e economizar mais",
                reward: 4
            }
        ];
        
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        let options, correct;
        
        if (typeof scenario.answer === 'number') {
            const wrongAnswers = [
                scenario.answer + 1,
                scenario.answer - 1,
                scenario.answer * 2
            ].filter(w => w !== scenario.answer && w > 0);
            
            options = [scenario.answer, ...wrongAnswers.slice(0, 3)].sort(() => Math.random() - 0.5);
            correct = scenario.answer;
        } else {
            options = [
                scenario.answer,
                "Pedir dinheiro emprestado",
                "Comprar mesmo assim",
                "Desistir para sempre"
            ].sort(() => Math.random() - 0.5);
            correct = scenario.answer;
        }
        
        return {
            type: 'money',
            question: scenario.question,
            options: options,
            correct: correct,
            reward: scenario.reward
        };
    }

    static generateRiddleQuiz() {
        const riddles = [
            {
                question: "O que você deve fazer ANTES de comprar algo?",
                options: ["Verificar se tem dinheiro", "Pedir emprestado", "Comprar mesmo assim", "Não pensar"],
                correct: "Verificar se tem dinheiro",
                reward: 3
            },
            {
                question: "Qual é a melhor forma de guardar dinheiro?",
                options: ["No cofre/banco", "No bolso", "Embaixo do colchão", "Com os amigos"],
                correct: "No cofre/banco",
                reward: 4
            },
            {
                question: "O que significa 'economizar'?",
                options: ["Guardar dinheiro", "Gastar tudo", "Dar para outros", "Perder dinheiro"],
                correct: "Guardar dinheiro",
                reward: 3
            },
            {
                question: "Quando você deve gastar dinheiro?",
                options: ["Só quando realmente precisar", "Sempre que quiser", "Nunca", "Só aos finais de semana"],
                correct: "Só quando realmente precisar",
                reward: 4
            }
        ];
        
        const riddle = riddles[Math.floor(Math.random() * riddles.length)];
        
        return {
            type: 'riddle',
            question: riddle.question,
            options: riddle.options,
            correct: riddle.correct,
            reward: riddle.reward
        };
    }

    static createQuizModal(quiz, onAnswer) {
        const modal = document.createElement('div');
        modal.id = 'quizModal';
        modal.className = 'quiz-modal';
        modal.innerHTML = `
            <div class="quiz-content">
                <div class="quiz-header">
                    <h3>🎯 Desafio do Conhecimento</h3>
                    <span class="quiz-reward">Prêmio: ${GameUtils.formatCurrency(quiz.reward)}</span>
                </div>
                <div class="quiz-question">
                    <p>${quiz.question}</p>
                </div>
                <div class="quiz-options">
                    ${quiz.options.map((option, index) => 
                        `<button class="quiz-option" data-answer="${option}">
                            ${option}
                        </button>`
                    ).join('')}
                </div>
                <div class="quiz-actions">
                    <button class="quiz-close">❌ Fechar</button>
                </div>
            </div>
        `;

        // Event listeners
        modal.querySelectorAll('.quiz-option').forEach(button => {
            button.addEventListener('click', () => {
                const answer = button.dataset.answer;
                const isCorrect = answer == quiz.correct;
                onAnswer(isCorrect, quiz.reward);
                document.body.removeChild(modal);
            });
        });

        modal.querySelector('.quiz-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        return modal;
    }
}

// Sistema de Estado Centralizado
class GameState {
    constructor() {
        this.state = {
            user: null,
            balance: 0,
            level: 1,
            points: 0,
            experience: 0,
            lives: 3,
            difficulty: 'facil',
            products: [],
            transactions: []
        };
        this.listeners = {};
    }

    // Atualizar estado
    setState(updates) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // Notificar listeners
        Object.keys(updates).forEach(key => {
            if (this.listeners[key]) {
                this.listeners[key].forEach(callback => {
                    callback(this.state[key], oldState[key]);
                });
            }
        });
    }

    // Observar mudanças no estado
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }

    // Obter estado atual
    getState(key = null) {
        return key ? this.state[key] : this.state;
    }

    // Persistir estado no localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('gameState', JSON.stringify(this.state));
        } catch (error) {
            console.error('Erro ao salvar estado:', error);
        }
    }

    // Carregar estado do localStorage
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('gameState');
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Erro ao carregar estado:', error);
        }
    }
}

// Sistema de Eventos Centralizado
class EventBus {
    constructor() {
        this.events = {};
    }

    // Registrar listener
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // Remover listener
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }

    // Emitir evento
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Erro no evento ${event}:`, error);
                }
            });
        }
    }
}

// Inicializar sistemas globais
window.gameUtils = GameUtils;
window.notificationSystem = new NotificationSystem();
window.gameState = new GameState();
window.eventBus = new EventBus();

// Carregar estado salvo
window.gameState.loadFromLocalStorage();