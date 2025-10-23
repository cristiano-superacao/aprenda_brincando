class EducationalAgent {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.isActive = false;
        this.conversationHistory = [];
        this.personalityTraits = {
            friendly: true,
            encouraging: true,
            educational: true,
            playful: true
        };
        this.agentName = 'Prof. Economia';
        this.agentEmoji = '🎓';
        this.setupAgent();
    }

    setupAgent() {
        this.createAgentUI();
    }

    createAgentUI() {
        // Verificar se já existe
        if (document.getElementById('educationalAgent')) return;

        const agentContainer = document.createElement('div');
        agentContainer.id = 'educationalAgent';
        agentContainer.className = 'educational-agent';
        agentContainer.innerHTML = `
            <div class="agent-header" id="agentHeader">
                <div class="agent-info">
                    <span class="agent-avatar">${this.agentEmoji}</span>
                    <div class="agent-details">
                        <h4>${this.agentName}</h4>
                        <span class="agent-status">Assistente Educativo</span>
                    </div>
                </div>
                <div class="agent-controls">
                    <button id="toggleAgentBtn" class="toggle-agent-btn" title="Conversar com o agente">
                        💬
                    </button>
                    <button id="closeAgentBtn" class="close-agent-btn" title="Fechar agente">
                        ✖️
                    </button>
                </div>
            </div>
            <div class="agent-content" id="agentContent" style="display: none;">
                <div class="conversation-area" id="conversationArea">
                    <div class="welcome-message">
                        <p>🌟 Olá! Sou o ${this.agentName}! Estou aqui para ajudar você a aprender sobre dinheiro e fazer escolhas inteligentes!</p>
                        <p>💡 Vou conversar com você sobre suas compras e dar dicas sobre educação financeira!</p>
                    </div>
                </div>
                <div class="agent-input-area">
                    <input type="text" id="agentInput" placeholder="Digite sua pergunta..." maxlength="200">
                    <button id="sendToAgentBtn">Enviar</button>
                </div>
                <div class="quick-questions">
                    <button class="quick-btn" data-question="Por que devo economizar dinheiro?">💰 Por que economizar?</button>
                    <button class="quick-btn" data-question="Como posso gastar melhor meu dinheiro?">🤔 Como gastar bem?</button>
                    <button class="quick-btn" data-question="O que significa fazer boas escolhas?">✨ Boas escolhas</button>
                </div>
            </div>
        `;

        document.body.appendChild(agentContainer);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('toggleAgentBtn');
        const closeBtn = document.getElementById('closeAgentBtn');
        const sendBtn = document.getElementById('sendToAgentBtn');
        const agentInput = document.getElementById('agentInput');
        const quickBtns = document.querySelectorAll('.quick-btn');

        toggleBtn.addEventListener('click', () => this.toggleAgent());
        closeBtn.addEventListener('click', () => this.hideAgent());
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        agentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                agentInput.value = question;
                this.sendMessage();
            });
        });
    }

    toggleAgent() {
        const content = document.getElementById('agentContent');
        const toggleBtn = document.getElementById('toggleAgentBtn');
        
        if (this.isActive) {
            content.style.display = 'none';
            toggleBtn.innerHTML = '💬';
            toggleBtn.title = 'Conversar com o agente';
            this.isActive = false;
        } else {
            content.style.display = 'block';
            toggleBtn.innerHTML = '📖';
            toggleBtn.title = 'Minimizar conversa';
            this.isActive = true;
        }
    }

    hideAgent() {
        const agent = document.getElementById('educationalAgent');
        if (agent) {
            agent.style.display = 'none';
        }
    }

    showAgent() {
        const agent = document.getElementById('educationalAgent');
        if (agent) {
            agent.style.display = 'block';
        }
    }

    sendMessage() {
        const input = document.getElementById('agentInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessageToConversation(message, 'user');
        input.value = '';

        // Simular processamento
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessageToConversation(response, 'agent');
        }, 1000);
    }

    addMessageToConversation(message, sender) {
        const conversationArea = document.getElementById('conversationArea');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <span class="message-text">${message}</span>
                    <span class="message-sender">Você</span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <span class="message-avatar">${this.agentEmoji}</span>
                    <div class="message-body">
                        <span class="message-text">${message}</span>
                        <span class="message-sender">${this.agentName}</span>
                    </div>
                </div>
            `;
        }

        conversationArea.appendChild(messageDiv);
        conversationArea.scrollTop = conversationArea.scrollHeight;

        // Manter histórico
        this.conversationHistory.push({ message, sender, timestamp: Date.now() });
    }

    generateResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Análise contextual baseada nas compras e saldo do jogo
        const currentBalance = this.game.balance;
        const totalSpent = this.game.totalSpent || 0;
        const recentPurchases = this.getRecentPurchases();

        // Respostas baseadas em contexto
        if (message.includes('economizar') || message.includes('guardar')) {
            return this.getEconomyAdvice();
        }
        
        if (message.includes('gastar') || message.includes('comprar')) {
            return this.getSpendingAdvice(currentBalance, totalSpent);
        }
        
        if (message.includes('escolha') || message.includes('decisão')) {
            return this.getDecisionAdvice();
        }

        if (message.includes('comida') || message.includes('alimento') || message.includes('produto')) {
            return this.getFoodAdvice(recentPurchases);
        }

        if (message.includes('dinheiro') || message.includes('moeda') || message.includes('real')) {
            return this.getMoneyEducation();
        }

        // Resposta baseada em análise de compras recentes
        if (recentPurchases.length > 0) {
            return this.getContextualAdvice(recentPurchases, currentBalance);
        }

        // Resposta genérica educativa
        return this.getGeneralAdvice();
    }

    getEconomyAdvice() {
        const tips = [
            "🏦 Economizar é como plantar uma sementinha! Cada real guardado cresce e vira mais dinheiro no futuro!",
            "🎯 Quando você economiza, pode comprar coisas mais legais depois! É como juntar pecinhas para montar algo incrível!",
            "⭐ Pessoas inteligentes sempre guardam um pouquinho! Que tal separar R$ 1,00 de cada R$ 10,00 que você ganha?",
            "🌱 Economizar é um super poder! Você se prepara para emergências e realizações dos seus sonhos!"
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    getSpendingAdvice(balance, totalSpent) {
        if (balance < 5) {
            return "💡 Seu saldo está baixinho! Que tal pensar bem antes da próxima compra? Compre só o que realmente precisa!";
        } else if (totalSpent > balance * 2) {
            return "⚠️ Você já gastou bastante! Lembre-se: é importante equilibrar gastos com economia. Que tal guardar um pouquinho agora?";
        } else {
            return "✅ Você está gastando de forma equilibrada! Continue fazendo boas escolhas e sempre pense: 'Eu realmente preciso disso?'";
        }
    }

    getDecisionAdvice() {
        const advice = [
            "🤔 Antes de comprar, sempre pergunte: 'Eu realmente preciso?', 'Tenho dinheiro suficiente?' e 'Vou usar bastante?'",
            "⚖️ Boas escolhas são como uma balança: de um lado o que você quer, do outro o que você precisa!",
            "🎯 Decisões inteligentes: compare preços, pense no futuro e escolha qualidade em vez de quantidade!",
            "💎 Uma boa escolha hoje pode evitar 10 problemas amanhã! Pense sempre nas consequências!"
        ];
        return advice[Math.floor(Math.random() * advice.length)];
    }

    getFoodAdvice(recentPurchases) {
        const healthyFoods = ['banana', 'maçã', 'leite', 'pão', 'água'];
        const treatsFood = ['doce', 'refrigerante', 'jujuba', 'pipoca'];
        
        let healthyCount = 0;
        let treatCount = 0;
        
        recentPurchases.forEach(purchase => {
            const name = purchase.name.toLowerCase();
            if (healthyFoods.some(food => name.includes(food))) healthyCount++;
            if (treatsFood.some(treat => name.includes(treat))) treatCount++;
        });

        if (treatCount > healthyCount) {
            return "🍎 Que tal equilibrar suas escolhas? Doces são gostosos, mas frutas e alimentos saudáveis dão mais energia e são melhores para o seu corpo!";
        } else if (healthyCount > treatCount) {
            return "🌟 Parabéns! Você está fazendo escolhas muito saudáveis! Seu corpo agradece quando você come bem!";
        } else {
            return "⚖️ Equilíbrio é tudo! Você pode comer doces às vezes, mas sempre equilibre com frutas e alimentos nutritivos!";
        }
    }

    getMoneyEducation() {
        const lessons = [
            "💰 O dinheiro é uma ferramenta! Ele nos ajuda a trocar por coisas que precisamos ou queremos!",
            "🏪 No mercado, cada produto tem um preço. É importante sempre conferir se temos dinheiro suficiente!",
            "📊 R$ 1,00 = 100 centavos! Às vezes é melhor comprar várias coisas baratas do que uma cara!",
            "🎯 Planejamento é essencial! Antes de ir ao mercado, pense no que você realmente precisa comprar!"
        ];
        return lessons[Math.floor(Math.random() * lessons.length)];
    }

    getContextualAdvice(purchases, balance) {
        const totalValue = purchases.reduce((sum, p) => sum + (p.price || 0), 0);
        const avgPrice = totalValue / purchases.length;
        
        if (avgPrice > 3) {
            return `💸 Vi que você comprou itens mais caros recentemente! Isso está okay se você planejou. Seu saldo atual é R$ ${balance.toFixed(2)}. Que tal alternar com produtos mais baratos?`;
        } else {
            return `👏 Ótimas escolhas econômicas! Você comprou produtos com bom preço. Continue assim e sua economia vai crescer!`;
        }
    }

    getGeneralAdvice() {
        const general = [
            "🌟 Lembre-se: cada compra é uma escolha! Escolhas inteligentes hoje constroem um futuro melhor!",
            "🎓 Você está aprendendo educação financeira brincando! Isso é uma habilidade super importante para a vida!",
            "💪 Ser bom com dinheiro é como exercitar um músculo - quanto mais você pratica, mais forte fica!",
            "🏆 O segredo é equilíbrio: economizar, gastar conscientemente e sempre aprender com cada decisão!"
        ];
        return general[Math.floor(Math.random() * general.length)];
    }

    getRecentPurchases() {
        // Pegar últimas 5 compras do histórico do jogo
        if (this.game.transactions) {
            return this.game.transactions
                .filter(t => t.type === 'purchase')
                .slice(-5);
        }
        return [];
    }

    // Método chamado quando uma compra é feita
    onPurchaseMade(product) {
        if (!this.isActive) return;
        
        const advice = this.generatePurchaseAdvice(product);
        setTimeout(() => {
            this.addMessageToConversation(advice, 'agent');
        }, 2000);
    }

    generatePurchaseAdvice(product) {
        const price = product.price;
        const currentBalance = this.game.balance;
        
        if (price > 4) {
            return `🎯 Você comprou ${product.name} por R$ ${price.toFixed(2)}! Foi uma compra cara, mas se você realmente precisava, foi uma boa decisão. Sobrou R$ ${currentBalance.toFixed(2)}!`;
        } else if (price <= 1) {
            return `💰 Boa escolha! ${product.name} é barato (R$ ${price.toFixed(2)}) e você ainda tem R$ ${currentBalance.toFixed(2)}. Produtos baratos ajudam a economizar!`;
        } else {
            return `✅ ${product.name} por R$ ${price.toFixed(2)} é um preço justo! Você ainda tem R$ ${currentBalance.toFixed(2)} para outras compras. Está indo bem!`;
        }
    }

    // Método chamado quando dinheiro é adicionado
    onMoneyAdded(amount) {
        if (!this.isActive) return;
        
        setTimeout(() => {
            const advice = `💵 Você adicionou R$ ${amount.toFixed(2)}! Lembre-se: ter dinheiro é bom, mas saber usar bem é ainda melhor! Que tal planejar suas próximas compras?`;
            this.addMessageToConversation(advice, 'agent');
        }, 1500);
    }
}

// Exportar para uso global
window.EducationalAgent = EducationalAgent;