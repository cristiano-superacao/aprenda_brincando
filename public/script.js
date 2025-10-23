class AprenderBrincando {
    constructor() {
        this.currentUser = null;
        this.balance = 0;
        this.initialMoney = 0;
        this.totalSpent = 0;
        this.level = 1;
        this.points = 0;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.lives = 3;
        this.maxLives = 3;
        this.difficulty = 'facil';
        this.products = [];
        this.cartItems = [];
        this.multiplayer = null;
        this.educationalAgent = null;
        this.quizActive = false;
        this.currentQuiz = null;
        this.streakCount = 0;
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.updateDisplay();
        await this.initializeUser();
        this.setupMultiplayer();
        this.setupEducationalAgent();
    }

    // Configurar agente educativo
    setupEducationalAgent() {
        if (window.EducationalAgent) {
            this.educationalAgent = new EducationalAgent(this);
            console.log('🎓 Agente educativo inicializado');
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botões de dificuldade
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                this.loadProducts();
            });
        });

        // Sistema de clique para interação (substituindo drag and drop)
        document.addEventListener('click', (e) => {
            const moneyItem = e.target.closest('.money-item');
            const productItem = e.target.closest('.product-item');
            
            if (moneyItem && !e.target.closest('#cartDropArea')) {
                const value = parseFloat(moneyItem.dataset.value);
                this.showActionModal('money', { value }, moneyItem);
            } else if (productItem && !e.target.closest('#cartDropArea')) {
                const product = {
                    id: parseInt(productItem.dataset.id),
                    name: productItem.dataset.name,
                    price: parseFloat(productItem.dataset.price),
                    image_url: productItem.dataset.image,
                    emoji: productItem.dataset.emoji,
                    points_reward: parseInt(productItem.dataset.points)
                };
                this.showActionModal('product', product, productItem);
            }
        });

        // Botões de ação
        document.getElementById('historyBtn').addEventListener('click', () => {
            this.showHistory();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('closeHistoryModal').addEventListener('click', () => {
            this.closeModal();
        });

        // Fechar modal clicando fora
        document.getElementById('historyModal').addEventListener('click', (e) => {
            if (e.target.id === 'historyModal') {
                this.closeModal();
            }
        });
    }

    // Carregar produtos do servidor
    async loadProducts() {
        try {
            const response = await fetch(`/api/products?difficulty=${this.difficulty}`);
            this.products = await response.json();
            this.renderProducts();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            // Produtos padrão em caso de erro
            this.products = [
                // Fácil
                { id: 1, name: 'Pão Frances', price: 0.50, emoji: '🍞', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', points_reward: 3 },
                { id: 2, name: 'Banana', price: 1.20, emoji: '🍌', image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80', points_reward: 5 },
                { id: 3, name: 'Maçã', price: 1.80, emoji: '🍎', image_url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80', points_reward: 6 },
                { id: 4, name: 'Bombom', price: 2.50, emoji: '🍫', image_url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=400&q=80', points_reward: 8 },
                { id: 5, name: 'Chiclete', price: 1.00, emoji: '🍬', image_url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80', points_reward: 4 },
                { id: 19, name: 'Jujuba', price: 2.00, emoji: '🍬', image_url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80', points_reward: 6 },
                { id: 20, name: 'Laranja', price: 1.50, emoji: '🍊', image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80', points_reward: 5 },
                
                // Médio
                { id: 7, name: 'Refrigerante 2L', price: 6.90, emoji: '🥤', image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80', points_reward: 18 },
                { id: 23, name: 'Refrigerante Lata', price: 3.50, emoji: '🥤', image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=400&q=80', points_reward: 10 },
                { id: 24, name: 'Pipoca Doce', price: 4.80, emoji: '🍿', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80', points_reward: 12 },
                { id: 25, name: 'Pipoca Salgada', price: 4.50, emoji: '🍿', image_url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=400&q=80', points_reward: 12 },
                { id: 27, name: 'Morango', price: 5.50, emoji: '🍓', image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80', points_reward: 15 },
                
                // Difícil
                { id: 13, name: 'Cesta de Frutas', price: 25.00, emoji: '🧺', image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80', points_reward: 45 }
            ];
            this.renderProducts();
        }
    }

    // Renderizar produtos na tela
    renderProducts() {
        const productsGrid = document.getElementById('productsContainer');
        productsGrid.innerHTML = '';

        this.products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            
            // Adicionar dados do produto como data-attributes
            productElement.dataset.id = product.id;
            productElement.dataset.name = product.name;
            productElement.dataset.price = product.price;
            productElement.dataset.image = product.image_url;
            productElement.dataset.emoji = product.emoji;
            productElement.dataset.points = product.points_reward;
            
            productElement.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" class="product-image" loading="lazy">
                <div class="product-info">
                    <span class="product-emoji">${product.emoji}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                </div>
            `;

            // Configurar clique
            productElement.style.cursor = 'pointer';
            productElement.title = `Clique para comprar ${product.name}`;

            productsGrid.appendChild(productElement);
        });
    }

    // Inicializar usuário
    async initializeUser() {
        try {
            // Tentar recuperar usuário existente ou criar novo
            const userId = localStorage.getItem('userId');
            if (userId) {
                const response = await fetch(`/api/user/${userId}`);
                if (response.ok) {
                    this.currentUser = await response.json();
                    this.balance = this.currentUser.balance;
                    this.level = this.currentUser.level;
                    this.points = this.currentUser.points;
                } else {
                    await this.createUser();
                }
            } else {
                await this.createUser();
            }
        } catch (error) {
            console.error('Erro ao inicializar usuário:', error);
            // Modo offline
            this.currentUser = { id: 'offline', name: 'Jogador', balance: 0, level: 1, points: 0 };
        }
        this.updateDisplay();
    }

    async createUser() {
        try {
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Jogador' })
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                localStorage.setItem('userId', this.currentUser.id);
                this.balance = 0;
                this.level = 1;
                this.points = 0;
            }
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
        }
    }

    // Adicionar dinheiro
    async addMoney(value) {
        // Se é o primeiro dinheiro adicionado, definir como inicial
        if (this.initialMoney === 0) {
            this.initialMoney = value;
        } else {
            this.initialMoney += value;
        }
        
        this.balance += value;
        await this.updateUserBalance();
        
        // Adicionar animação e feedback
        this.showToast(`💰 Adicionado R$ ${value.toFixed(2)}!`, 'success');
        this.addCartItem({
            type: 'money',
            value: value,
            name: `R$ ${value.toFixed(2)}`,
            emoji: '💰'
        });
        
        // Registrar transação
        await this.addTransaction('add_money', value, `Adicionado R$ ${value.toFixed(2)}`);
        
        this.updateDisplay();
        this.showMoneyLearning(value);
        
        // Notificar agente educativo
        if (this.educationalAgent) {
            this.educationalAgent.onMoneyAdded(value);
        }
    }

    // Comprar produto
    async buyProduct(product) {
        if (this.balance < product.price) {
            this.showToast('💸 Saldo insuficiente!', 'error');
            return;
        }

        this.balance -= product.price;
        this.totalSpent += product.price;
        this.points += product.points_reward;
        this.addExperience(15); // XP por compra
        
        await this.updateUserBalance();
        await this.checkLevelUp();
        
        this.showToast(`🎉 ${product.name} comprado! +${product.points_reward} pontos`, 'success');
        this.addCartItem({
            type: 'product',
            product: product,
            name: product.name,
            emoji: product.emoji,
            price: product.price
        });
        
        // Mostrar aprendizado educativo
        this.showLearningMessage(product);
        
        // Notificar agente educativo
        if (this.educationalAgent) {
            this.educationalAgent.onPurchaseMade(product);
        }
        
        // Registrar transação
        await this.addTransaction('buy_product', product.price, `Comprou ${product.name}`, product.points_reward);
        
        this.updateDisplay();
    }

    // Adicionar item ao carrinho visual
    addCartItem(item) {
        const cartItems = document.getElementById('cartItems');
        const cartDropZone = document.querySelector('.cart-drop-zone');
        
        // Esconder zona de drop se é o primeiro item
        if (this.cartItems.length === 0) {
            cartDropZone.style.display = 'none';
        }
        
        this.cartItems.push(item);
        this.updateCartDisplay();
    }

    // Remover item do carrinho
    removeCartItem(index) {
        const item = this.cartItems[index];
        
        if (item.type === 'money') {
            this.balance -= item.value;
        } else if (item.type === 'product') {
            this.balance += item.product.price;
            this.points -= item.product.points_reward;
        }
        
        this.cartItems.splice(index, 1);
        this.updateCartDisplay();
        this.updateDisplay();
        this.updateUserBalance();
    }

    // Atualizar display do carrinho
    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartDropZone = document.querySelector('.cart-drop-zone');
        
        cartItems.innerHTML = '';
        
        if (this.cartItems.length === 0) {
            cartDropZone.style.display = 'flex';
        } else {
            cartDropZone.style.display = 'none';
            this.cartItems.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <span class="product-emoji">${item.emoji}</span>
                    <p>${item.name}</p>
                    ${item.price ? `<p>R$ ${item.price.toFixed(2)}</p>` : ''}
                    <button class="remove-btn" onclick="game.removeCartItem(${index})">×</button>
                `;
                cartItems.appendChild(itemElement);
                
                // Animação de entrada
                itemElement.classList.add('bounce');
            });
        }
    }

    // Verificar subida de nível
    async checkLevelUp() {
        const newLevel = Math.floor(this.points / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            await this.updateUserLevel();
            this.showToast(`🎉 Parabéns! Você subiu para o nível ${this.level}!`, 'success');
            await this.addTransaction('level_up', 0, `Subiu para o nível ${this.level}`, 0);
        }
    }

    // Atualizar saldo do usuário no servidor
    async updateUserBalance() {
        if (!this.currentUser || this.currentUser.id === 'offline') return;
        
        try {
            await fetch(`/api/user/${this.currentUser.id}/balance`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balance: this.balance })
            });
        } catch (error) {
            console.error('Erro ao atualizar saldo:', error);
        }
    }

    // Atualizar nível do usuário no servidor
    async updateUserLevel() {
        if (!this.currentUser || this.currentUser.id === 'offline') return;
        
        try {
            await fetch(`/api/user/${this.currentUser.id}/level`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level: this.level, points: this.points })
            });
        } catch (error) {
            console.error('Erro ao atualizar nível:', error);
        }
    }

    // Adicionar transação
    async addTransaction(type, amount, description, pointsEarned = 0) {
        if (!this.currentUser || this.currentUser.id === 'offline') return;
        
        try {
            await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    type,
                    amount,
                    description,
                    pointsEarned
                })
            });
        } catch (error) {
            console.error('Erro ao registrar transação:', error);
        }
    }

    // Mostrar histórico
    async showHistory() {
        if (!this.currentUser || this.currentUser.id === 'offline') {
            this.showToast('Histórico não disponível no modo offline', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/user/${this.currentUser.id}/transactions`);
            const transactions = await response.json();
            
            const historyContent = document.getElementById('historyContent');
            if (transactions.length === 0) {
                historyContent.innerHTML = '<p>Nenhuma transação encontrada.</p>';
            } else {
                historyContent.innerHTML = transactions.map(transaction => `
                    <div class="transaction-item" style="border-bottom: 1px solid #e2e8f0; padding: 15px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${transaction.description}</strong>
                                <p style="color: #718096; font-size: 0.9rem;">
                                    ${new Date(transaction.created_at).toLocaleString('pt-BR')}
                                </p>
                            </div>
                            <div style="text-align: right;">
                                ${transaction.amount ? `<p style="color: ${transaction.type === 'add_money' ? '#48bb78' : '#e53e3e'}; font-weight: 600;">
                                    ${transaction.type === 'add_money' ? '+' : '-'}R$ ${transaction.amount.toFixed(2)}
                                </p>` : ''}
                                ${transaction.points_earned > 0 ? `<p style="color: #ed8936; font-size: 0.9rem;">+${transaction.points_earned} pontos</p>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            
            document.getElementById('historyModal').classList.add('show');
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            this.showToast('Erro ao carregar histórico', 'error');
        }
    }

    // Fechar modal
    closeModal() {
        document.getElementById('historyModal').classList.remove('show');
    }

    // Recomeçar jogo
    async restartGame() {
        if (confirm('🔄 Tem certeza que deseja recomeçar o jogo? Todo o progresso será perdido.')) {
            this.balance = 0;
            this.initialMoney = 0;
            this.totalSpent = 0;
            this.level = 1;
            this.points = 0;
            this.experience = 0;
            this.experienceToNextLevel = 100;
            this.lives = this.maxLives;
            this.streakCount = 0;
            this.cartItems = [];
            
            this.clearLearningMessages();
            
            await this.updateUserBalance();
            await this.updateUserLevel();
            await this.addTransaction('restart', 0, 'Jogo reiniciado');
            
            this.updateDisplay();
            this.updateCartDisplay();
            this.updateExperienceDisplay();
            
            this.addStackedLearningMessage('🎮 Jogo reiniciado! Boa sorte na sua nova aventura!', 'general');
            this.showToast('🔄 Jogo reiniciado com sucesso!', 'success');
            
            // Notificar multiplayer
            if (this.multiplayer && this.multiplayer.isMultiplayerConnected()) {
                this.multiplayer.notifyRestart();
            }
        }
    }

    // Atualizar display
    updateDisplay() {
        document.getElementById('balance').textContent = `R$ ${this.balance.toFixed(2)}`;
        document.getElementById('levelNumber').textContent = `Nível ${this.level}`;
        document.getElementById('points').textContent = `${this.points} Pontos`;
        
        // Atualizar estatísticas financeiras
        document.getElementById('initialMoney').textContent = `R$ ${this.initialMoney.toFixed(2)}`;
        document.getElementById('totalSpent').textContent = `R$ ${this.totalSpent.toFixed(2)}`;
        
        // Atualizar experiência e vidas
        this.updateExperienceDisplay();
        
        // Atualizar nome do nível
        const levelNames = {
            1: 'Iniciante',
            2: 'Aprendiz',
            3: 'Intermediário',
            4: 'Avançado',
            5: 'Expert',
            6: 'Mestre'
        };
        
        const levelIcons = {
            1: '🌱',
            2: '🌿',
            3: '🌳',
            4: '🏆',
            5: '👑',
            6: '💎'
        };
        
        const levelName = levelNames[Math.min(this.level, 6)] || 'Lendário';
        const levelIcon = levelIcons[Math.min(this.level, 6)] || '⭐';
        
        document.getElementById('levelName').textContent = levelName;
        document.getElementById('levelIcon').textContent = levelIcon;
    }

    // Mostrar toast
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Mostrar seleção na coluna direita
    showActionModal(type, data, element) {
        this.currentSelection = { type, data, element };
        
        if (type === 'money') {
            this.showSelectedMoney(data, element);
        } else if (type === 'product') {
            this.showSelectedProduct(data);
        }
        
        // Mostrar botões de confirmação
        document.getElementById('selectionButtons').style.display = 'flex';
        
        // Configurar botões se não estiverem configurados
        if (!this.buttonsConfigured) {
            this.setupSelectionButtons();
            this.buttonsConfigured = true;
        }
    }

    // Mostrar dinheiro selecionado
    showSelectedMoney(data, element) {
        const selectedMoney = document.getElementById('selectedMoney');
        const moneyImage = document.getElementById('selectedMoneyImage');
        const moneyValue = document.getElementById('selectedMoneyValue');
        
        moneyImage.src = element.querySelector('.money-image').src;
        moneyImage.alt = `R$ ${data.value}`;
        moneyValue.textContent = `R$ ${data.value.toFixed(2)}`;
        
        selectedMoney.style.display = 'flex';
        
        // Esconder produto se estiver selecionado
        document.getElementById('selectedProduct').style.display = 'none';
    }

    // Mostrar produto selecionado
    showSelectedProduct(data) {
        const selectedProduct = document.getElementById('selectedProduct');
        const productImage = document.getElementById('selectedProductImage');
        const productName = document.getElementById('selectedProductName');
        const productPrice = document.getElementById('selectedProductPrice');
        
        productImage.src = data.image_url;
        productImage.alt = data.name;
        productName.textContent = data.name;
        productPrice.textContent = `R$ ${data.price.toFixed(2)}`;
        
        selectedProduct.style.display = 'flex';
        
        // Esconder dinheiro se estiver selecionado
        document.getElementById('selectedMoney').style.display = 'none';
    }

    // Configurar botões de seleção
    setupSelectionButtons() {
        document.getElementById('confirmButton').addEventListener('click', () => {
            this.confirmSelection();
        });
        
        document.getElementById('cancelButton').addEventListener('click', () => {
            this.cancelSelection();
        });
    }

    // Confirmar seleção
    confirmSelection() {
        if (!this.currentSelection) return;
        
        const { type, data } = this.currentSelection;
        
        if (type === 'money') {
            this.addMoney(data.value);
            this.showToast(`💰 R$ ${data.value.toFixed(2)} adicionado ao carrinho!`);
        } else if (type === 'product') {
            this.buyProduct(data);
        }
        
        this.cancelSelection();
    }

    // Cancelar seleção
    cancelSelection() {
        this.currentSelection = null;
        document.getElementById('selectedMoney').style.display = 'none';
        document.getElementById('selectedProduct').style.display = 'none';
        document.getElementById('selectionButtons').style.display = 'none';
    }

    // Configurar multiplayer (método placeholder)
    setupMultiplayer() {
        // Multiplayer será configurado via script separado
        console.log('Multiplayer disponível');
    }

    // Mostrar aprendizado educativo
    showLearningMessage(product) {
        const learningInfo = document.getElementById('learningInfo');
        
        // Mensagens educativas baseadas no produto e preço
        const learningMessages = this.getLearningMessage(product);
        
        // Criar nova mensagem empilhada
        this.addStackedLearningMessage(learningMessages.message, 'purchase');
    }

    // Adicionar mensagem empilhada no sistema de aprendizado
    addStackedLearningMessage(message, type = 'general') {
        const learningInfo = document.getElementById('learningInfo');
        const learningText = document.getElementById('learningText');
        
        // Criar container de mensagens se não existir
        let messageStack = document.getElementById('messageStack');
        if (!messageStack) {
            messageStack = document.createElement('div');
            messageStack.id = 'messageStack';
            messageStack.className = 'message-stack';
            learningInfo.appendChild(messageStack);
            
            // Esconder texto padrão
            learningText.style.display = 'none';
        }
        
        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `stacked-message ${type}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${this.getMessageIcon(type)}</span>
                <span class="message-text">${message}</span>
                <span class="message-time">${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
            </div>
        `;
        
        // Adicionar animação de entrada
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(-20px)';
        messageStack.appendChild(messageDiv);
        
        // Animar entrada
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // Destacar o card educativo
        learningInfo.classList.add('highlight');
        setTimeout(() => {
            learningInfo.classList.remove('highlight');
        }, 1000);
        
        // Limitar a 10 mensagens para não sobrecarregar
        while (messageStack.children.length > 10) {
            messageStack.removeChild(messageStack.firstChild);
        }
    }

    // Obter ícone baseado no tipo de mensagem
    getMessageIcon(type) {
        const icons = {
            'purchase': '🛒',
            'money': '💰',
            'level': '🏆',
            'quiz': '🧠',
            'reward': '🎁',
            'general': '💡'
        };
        return icons[type] || '💡';
    }

    // Limpar mensagens de aprendizado (ao reiniciar ou mudar nível)
    clearLearningMessages() {
        const messageStack = document.getElementById('messageStack');
        const learningText = document.getElementById('learningText');
        
        if (messageStack) {
            messageStack.remove();
        }
        
        if (learningText) {
            learningText.style.display = 'block';
            learningText.textContent = 'Clique nos produtos para aprender sobre dinheiro!';
        }
    }

    // Sistema de Experiência e Níveis
    addExperience(amount) {
        this.experience += amount;
        this.checkLevelUp();
        this.updateExperienceDisplay();
    }

    checkLevelUp() {
        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.experience = 0;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
        this.lives = this.maxLives; // Restaurar vidas
        
        const reward = this.level * 5; // R$ 5 por nível
        this.balance += reward;
        
        this.clearLearningMessages();
        this.addStackedLearningMessage(
            `🏆 PARABÉNS! Você subiu para o nível ${this.level}! Ganhou R$ ${reward.toFixed(2)} de recompensa!`, 
            'level'
        );
        
        this.showToast(`🎉 Nível ${this.level} desbloqueado! +R$ ${reward.toFixed(2)}`, 'success');
        this.updateDisplay();
        this.updateExperienceDisplay();
    }

    updateExperienceDisplay() {
        const expBar = document.getElementById('experienceBar');
        const expText = document.getElementById('experienceText');
        const levelDisplay = document.getElementById('levelDisplay');
        const livesDisplay = document.getElementById('livesDisplay');
        
        if (expBar) {
            const percentage = (this.experience / this.experienceToNextLevel) * 100;
            expBar.style.width = `${percentage}%`;
        }
        
        if (expText) {
            expText.textContent = `${this.experience}/${this.experienceToNextLevel} XP`;
        }
        
        if (levelDisplay) {
            levelDisplay.textContent = `Nível ${this.level}`;
        }
        
        if (livesDisplay) {
            livesDisplay.textContent = '❤️'.repeat(this.lives) + '🤍'.repeat(this.maxLives - this.lives);
        }
    }

    // Sistema de Quiz para Ganhar Dinheiro
    startQuiz() {
        if (this.quizActive || this.lives <= 0) return;
        
        this.quizActive = true;
        this.currentQuiz = this.generateQuiz();
        this.showQuizModal();
    }

    generateQuiz() {
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

    generateMathQuiz() {
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

    generateMoneyQuiz() {
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
            }
        ];
        
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        const wrongAnswers = [
            scenario.answer + 1,
            scenario.answer - 1,
            scenario.answer * 2
        ].filter(w => w !== scenario.answer && w > 0);
        
        const options = [scenario.answer, ...wrongAnswers.slice(0, 3)].sort(() => Math.random() - 0.5);
        
        return {
            type: 'money',
            question: scenario.question,
            options: options,
            correct: scenario.answer,
            reward: scenario.reward
        };
    }

    generateRiddleQuiz() {
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

    showQuizModal() {
        const modal = document.createElement('div');
        modal.id = 'quizModal';
        modal.className = 'quiz-modal';
        modal.innerHTML = `
            <div class="quiz-content">
                <div class="quiz-header">
                    <h3>🧠 Desafio Educativo!</h3>
                    <div class="quiz-info">
                        <span>💰 Recompensa: R$ ${this.currentQuiz.reward.toFixed(2)}</span>
                        <span>❤️ Vidas: ${this.lives}</span>
                    </div>
                </div>
                <div class="quiz-question">
                    <p>${this.currentQuiz.question}</p>
                </div>
                <div class="quiz-options">
                    ${this.currentQuiz.options.map((option, index) => 
                        `<button class="quiz-option" data-answer="${option}">${option}</button>`
                    ).join('')}
                </div>
                <div class="quiz-footer">
                    <button class="quiz-close" onclick="game.closeQuiz()">❌ Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners para as opções
        modal.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.answerQuiz(e.target.dataset.answer);
            });
        });
    }

    answerQuiz(selectedAnswer) {
        const isCorrect = selectedAnswer == this.currentQuiz.correct;
        
        if (isCorrect) {
            this.streakCount++;
            const bonusReward = Math.floor(this.streakCount / 3); // Bônus a cada 3 acertos
            const totalReward = this.currentQuiz.reward + bonusReward;
            
            this.balance += totalReward;
            this.addExperience(20);
            
            this.addStackedLearningMessage(
                `✅ Correto! Você ganhou R$ ${totalReward.toFixed(2)}! Sequência: ${this.streakCount}`,
                'reward'
            );
            
            this.showToast(`🎉 Correto! +R$ ${totalReward.toFixed(2)}`, 'success');
        } else {
            this.streakCount = 0;
            this.lives--;
            
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.addStackedLearningMessage(
                    `❌ Resposta errada! Você perdeu uma vida. Resposta correta: ${this.currentQuiz.correct}`,
                    'quiz'
                );
                
                this.showToast(`💔 Errou! Vidas restantes: ${this.lives}`, 'error');
            }
        }
        
        this.closeQuiz();
        this.updateDisplay();
        this.updateExperienceDisplay();
    }

    closeQuiz() {
        const modal = document.getElementById('quizModal');
        if (modal) {
            modal.remove();
        }
        this.quizActive = false;
        this.currentQuiz = null;
    }

    gameOver() {
        this.balance = 0;
        this.lives = this.maxLives;
        this.streakCount = 0;
        this.experience = Math.floor(this.experience / 2); // Perde metade da experiência
        
        this.clearLearningMessages();
        this.addStackedLearningMessage(
            `💀 GAME OVER! Você perdeu todas as vidas e todo o dinheiro! Tente novamente!`,
            'general'
        );
        
        this.showToast('💀 Game Over! Reiniciando...', 'error');
        this.updateDisplay();
        this.updateExperienceDisplay();
    }

    // Obter mensagem educativa baseada no produto
    getLearningMessage(product) {
        const price = product.price;
        let message = '';
        
        // Mensagens baseadas no valor do produto
        if (price <= 1.00) {
            message = `💡 Produtos baratos como ${product.name} (R$ ${price.toFixed(2)}) são boas opções para economizar!`;
        } else if (price <= 3.00) {
            message = `🎯 ${product.name} custa R$ ${price.toFixed(2)}. Você pode comprar ${Math.floor(this.balance / price)} itens iguais com seu saldo atual!`;
        } else if (price <= 5.00) {
            message = `💰 Com R$ ${price.toFixed(2)}, você comprou ${product.name}. Isso é igual a ${Math.ceil(price / 0.25)} moedas de 25 centavos!`;
        } else {
            message = `🏆 ${product.name} é um item mais caro (R$ ${price.toFixed(2)}). Você planejou bem seus gastos para comprá-lo!`;
        }
        
        return { message };
    }

    // Mostrar aprendizado ao adicionar dinheiro
    showMoneyLearning(value) {
        let message = '';
        
        if (value < 1.00) {
            message = `🪙 Você adicionou ${value < 1 ? Math.round(value * 100) + ' centavos' : 'R$ ' + value.toFixed(2)}. Moedas pequenas também são importantes!`;
        } else if (value <= 10.00) {
            message = `💵 R$ ${value.toFixed(2)} foi adicionado! Você pode comprar vários produtos com esse valor.`;
        } else {
            message = `💸 R$ ${value.toFixed(2)} é muito dinheiro! Use com sabedoria e planeje suas compras.`;
        }
        
        this.addStackedLearningMessage(message, 'money');
    }
}

// Inicializar o jogo quando a página carregar
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new AprenderBrincando();
    window.game = game; // Tornar disponível globalmente
    
    // Configurar botão multiplayer
    const multiplayerBtn = document.getElementById('multiplayerBtn');
    if (multiplayerBtn) {
        let isConnected = false;
        let multiplayerManager = null;

        multiplayerBtn.addEventListener('click', () => {
            if (!isConnected) {
                const playerName = prompt('👋 Digite seu nome:') || `Jogador${Date.now()}`;
                multiplayerManager = new MultiplayerManager(game);
                multiplayerManager.connect(playerName);
                
                multiplayerBtn.innerHTML = '🔌 Conectando...';
                multiplayerBtn.disabled = true;
                
                // Atualizar botão quando conectar
                setTimeout(() => {
                    if (multiplayerManager && multiplayerManager.isMultiplayerConnected()) {
                        multiplayerBtn.innerHTML = '🔗 Conectado';
                        multiplayerBtn.disabled = false;
                        isConnected = true;
                    } else {
                        multiplayerBtn.innerHTML = '🎮 Jogar Juntos';
                        multiplayerBtn.disabled = false;
                    }
                }, 2000);
            } else {
                if (multiplayerManager) {
                    multiplayerManager.disconnect();
                }
                multiplayerBtn.innerHTML = '🎮 Jogar Juntos';
                isConnected = false;
            }
        });
    }
});