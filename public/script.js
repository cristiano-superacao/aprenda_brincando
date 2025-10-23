class AprenderBrincando {
    constructor() {
        this.currentUser = null;
        this.balance = 0;
        this.level = 1;
        this.points = 0;
        this.difficulty = 'facil';
        this.products = [];
        this.cartItems = [];
        this.multiplayer = null;
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.updateDisplay();
        await this.initializeUser();
        this.setupMultiplayer();
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
                { id: 1, name: 'Chiclete', price: 0.75, emoji: '�', image_url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80', points_reward: 3 },
                { id: 2, name: 'Doce', price: 1.25, emoji: '�', image_url: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?auto=format&fit=crop&w=400&q=80', points_reward: 5 },
                { id: 3, name: 'Bombom', price: 1.50, emoji: '�', image_url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=400&q=80', points_reward: 6 },
                { id: 4, name: 'Chocolate', price: 2.50, emoji: '🍫', image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=400&q=80', points_reward: 8 },
                { id: 5, name: 'Picolé', price: 3.00, emoji: '🍦', image_url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80', points_reward: 10 },
                { id: 6, name: 'Biscoito', price: 3.50, emoji: '�', image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80', points_reward: 9 },
                { id: 7, name: 'Suco', price: 4.00, emoji: '🧃', image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80', points_reward: 12 },
                { id: 8, name: 'Bolo Fatia', price: 5.00, emoji: '🍰', image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&q=80', points_reward: 15 },
                { id: 9, name: 'Sorvete', price: 7.50, emoji: '�', image_url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=400&q=80', points_reward: 20 }
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
    }

    // Comprar produto
    async buyProduct(product) {
        if (this.balance < product.price) {
            this.showToast('💸 Saldo insuficiente!', 'error');
            return;
        }

        this.balance -= product.price;
        this.points += product.points_reward;
        
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
        if (confirm('Tem certeza que deseja recomeçar o jogo? Todo o progresso será perdido.')) {
            this.balance = 0;
            this.level = 1;
            this.points = 0;
            this.cartItems = [];
            
            await this.updateUserBalance();
            await this.updateUserLevel();
            await this.addTransaction('restart', 0, 'Jogo reiniciado');
            
            this.updateDisplay();
            this.updateCartDisplay();
            this.showToast('🔄 Jogo reiniciado!', 'success');
        }
    }

    // Atualizar display
    updateDisplay() {
        document.getElementById('balance').textContent = `R$ ${this.balance.toFixed(2)}`;
        document.getElementById('levelNumber').textContent = `Nível ${this.level}`;
        document.getElementById('points').textContent = `${this.points} Pontos`;
        
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