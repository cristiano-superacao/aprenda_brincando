// Sistema de Perfil de Jogador
class PlayerProfile {
    constructor() {
        this.currentPlayer = null;
        this.avatars = [
            { id: 1, name: 'Estudante', emoji: '👨‍🎓', price: 0 },
            { id: 2, name: 'Cientista', emoji: '👩‍🔬', price: 50 },
            { id: 3, name: 'Astronauta', emoji: '👨‍🚀', price: 100 },
            { id: 4, name: 'Artista', emoji: '👩‍🎨', price: 75 },
            { id: 5, name: 'Chef', emoji: '👨‍🍳', price: 60 },
            { id: 6, name: 'Médico', emoji: '👩‍⚕️', price: 120 },
            { id: 7, name: 'Programador', emoji: '👨‍💻', price: 90 },
            { id: 8, name: 'Professora', emoji: '👩‍🏫', price: 80 },
            { id: 9, name: 'Bombeiro', emoji: '👨‍🚒', price: 110 },
            { id: 10, name: 'Atleta', emoji: '🏃‍♀️', price: 70 }
        ];
        
        this.items = {
            lanches: [
                { id: 1, name: 'Pizza', emoji: '🍕', price: 15 },
                { id: 2, name: 'Hambúrguer', emoji: '🍔', price: 12 },
                { id: 3, name: 'Sorvete', emoji: '🍦', price: 8 },
                { id: 4, name: 'Pipoca', emoji: '🍿', price: 5 },
                { id: 5, name: 'Donut', emoji: '🍩', price: 6 }
            ],
            roupas: [
                { id: 1, name: 'Camiseta Legal', emoji: '👕', price: 25 },
                { id: 2, name: 'Jaqueta', emoji: '🧥', price: 45 },
                { id: 3, name: 'Tênis', emoji: '👟', price: 60 },
                { id: 4, name: 'Chapéu', emoji: '🎩', price: 30 },
                { id: 5, name: 'Óculos', emoji: '🕶️', price: 35 }
            ],
            brinquedos: [
                { id: 1, name: 'Bola', emoji: '⚽', price: 20 },
                { id: 2, name: 'Videogame', emoji: '🎮', price: 150 },
                { id: 3, name: 'Livro', emoji: '📚', price: 18 },
                { id: 4, name: 'Puzzle', emoji: '🧩', price: 25 },
                { id: 5, name: 'Bicicleta', emoji: '🚲', price: 200 }
            ]
        };
        
        this.init();
    }

    init() {
        this.createProfileModal();
        this.createAvatarShop();
        this.createRankingModal();
        this.setupEventListeners();
    }

    createProfileModal() {
        const modal = document.createElement('div');
        modal.id = 'profileModal';
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="profile-content">
                <div class="profile-header">
                    <h2>👋 Bem-vindo ao Mercadinho!</h2>
                    <p>Vamos criar seu perfil para jogar online!</p>
                </div>
                
                <div class="profile-form">
                    <div class="form-group">
                        <label>📝 Seu nome:</label>
                        <input type="text" id="playerName" placeholder="Digite seu nome" maxlength="20">
                    </div>
                    
                    <div class="form-group">
                        <label>🎂 Sua idade:</label>
                        <select id="playerAge">
                            <option value="">Escolha sua idade</option>
                            ${Array.from({length: 13}, (_, i) => i + 5).map(age => 
                                `<option value="${age}">${age} anos</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>🏫 Sua série:</label>
                        <select id="playerGrade">
                            <option value="">Escolha sua série</option>
                            <option value="1">1º ano</option>
                            <option value="2">2º ano</option>
                            <option value="3">3º ano</option>
                            <option value="4">4º ano</option>
                            <option value="5">5º ano</option>
                            <option value="6">6º ano</option>
                            <option value="7">7º ano</option>
                            <option value="8">8º ano</option>
                            <option value="9">9º ano</option>
                            <option value="10">1º ano (Ensino Médio)</option>
                            <option value="11">2º ano (Ensino Médio)</option>
                            <option value="12">3º ano (Ensino Médio)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>🎭 Escolha seu avatar:</label>
                        <div class="avatar-grid">
                            ${this.avatars.filter(a => a.price === 0).map(avatar => `
                                <div class="avatar-option" data-avatar="${avatar.id}">
                                    <span class="avatar-emoji">${avatar.emoji}</span>
                                    <span class="avatar-name">${avatar.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button id="createProfile" class="create-btn" disabled>🚀 Começar a Jogar!</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    createAvatarShop() {
        const shopModal = document.createElement('div');
        shopModal.id = 'avatarShop';
        shopModal.className = 'shop-modal';
        shopModal.innerHTML = `
            <div class="shop-content">
                <div class="shop-header">
                    <h2>🛍️ Loja do Avatar</h2>
                    <span class="close-shop">❌</span>
                </div>
                
                <div class="shop-tabs">
                    <button class="tab-btn active" data-tab="avatars">🎭 Avatares</button>
                    <button class="tab-btn" data-tab="lanches">🍕 Lanches</button>
                    <button class="tab-btn" data-tab="roupas">👕 Roupas</button>
                    <button class="tab-btn" data-tab="brinquedos">🎮 Brinquedos</button>
                </div>
                
                <div class="shop-items" id="shopItems">
                    <!-- Items serão carregados dinamicamente -->
                </div>
                
                <div class="player-inventory">
                    <h3>📦 Seus Itens:</h3>
                    <div id="inventoryItems"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(shopModal);
    }

    createRankingModal() {
        const rankingModal = document.createElement('div');
        rankingModal.id = 'rankingModal';
        rankingModal.className = 'ranking-modal';
        rankingModal.innerHTML = `
            <div class="ranking-content">
                <div class="ranking-header">
                    <h2>🏆 Ranking dos Melhores Investidores</h2>
                    <span class="close-ranking">❌</span>
                </div>
                
                <div class="ranking-tabs">
                    <button class="ranking-tab-btn active" data-tab="money">💰 Mais Dinheiro</button>
                    <button class="ranking-tab-btn" data-tab="level">⭐ Maior Nível</button>
                    <button class="ranking-tab-btn" data-tab="investments">📈 Melhores Investimentos</button>
                </div>
                
                <div class="ranking-list" id="rankingList">
                    <!-- Ranking será carregado dinamicamente -->
                </div>
            </div>
        `;
        
        document.body.appendChild(rankingModal);
    }

    setupEventListeners() {
        // Profile modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('avatar-option')) {
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
                this.checkProfileForm();
            }
            
            if (e.target.id === 'createProfile') {
                this.createPlayer();
            }
            
            if (e.target.classList.contains('close-shop')) {
                document.getElementById('avatarShop').style.display = 'none';
            }
            
            if (e.target.classList.contains('close-ranking')) {
                document.getElementById('rankingModal').style.display = 'none';
            }
            
            if (e.target.classList.contains('tab-btn')) {
                this.switchShopTab(e.target.dataset.tab);
            }
            
            if (e.target.classList.contains('ranking-tab-btn')) {
                this.switchRankingTab(e.target.dataset.tab);
            }
        });

        // Form validation
        ['playerName', 'playerAge', 'playerGrade'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.checkProfileForm();
            });
        });
    }

    checkProfileForm() {
        const name = document.getElementById('playerName').value.trim();
        const age = document.getElementById('playerAge').value;
        const grade = document.getElementById('playerGrade').value;
        const avatar = document.querySelector('.avatar-option.selected');
        
        const createBtn = document.getElementById('createProfile');
        if (name && age && grade && avatar) {
            createBtn.disabled = false;
            createBtn.classList.add('ready');
        } else {
            createBtn.disabled = true;
            createBtn.classList.remove('ready');
        }
    }

    async createPlayer() {
        const name = document.getElementById('playerName').value.trim();
        const age = parseInt(document.getElementById('playerAge').value);
        const grade = parseInt(document.getElementById('playerGrade').value);
        const avatarId = parseInt(document.querySelector('.avatar-option.selected').dataset.avatar);
        
        const playerData = {
            name,
            age,
            grade,
            avatar: avatarId,
            balance: 100, // Dinheiro inicial
            level: 1,
            experience: 0,
            inventory: [1], // Avatar inicial
            createdAt: new Date().toISOString()
        };

        try {
            // Salvar no servidor
            const response = await fetch('/api/player/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerData)
            });

            if (response.ok) {
                this.currentPlayer = await response.json();
                localStorage.setItem('playerId', this.currentPlayer.id);
                
                // Fechar modal e iniciar jogo
                document.getElementById('profileModal').style.display = 'none';
                this.showWelcomeMessage();
                
                // Notificar o jogo principal
                if (window.game) {
                    window.game.setPlayer(this.currentPlayer);
                }
            }
        } catch (error) {
            console.error('Erro ao criar jogador:', error);
            // Modo offline
            this.currentPlayer = { 
                ...playerData, 
                id: 'offline_' + Date.now(),
                isOffline: true 
            };
            localStorage.setItem('playerData', JSON.stringify(this.currentPlayer));
            document.getElementById('profileModal').style.display = 'none';
            this.showWelcomeMessage();
        }
    }

    async loadPlayer() {
        const playerId = localStorage.getItem('playerId');
        if (playerId) {
            try {
                const response = await fetch(`/api/player/${playerId}`);
                if (response.ok) {
                    this.currentPlayer = await response.json();
                    return true;
                }
            } catch (error) {
                console.error('Erro ao carregar jogador:', error);
            }
        }
        
        // Verificar dados offline
        const offlineData = localStorage.getItem('playerData');
        if (offlineData) {
            this.currentPlayer = JSON.parse(offlineData);
            return true;
        }
        
        return false;
    }

    showProfile() {
        if (!this.currentPlayer) {
            document.getElementById('profileModal').style.display = 'flex';
        } else {
            this.showAvatarShop();
        }
    }

    showAvatarShop() {
        document.getElementById('avatarShop').style.display = 'flex';
        this.switchShopTab('avatars');
    }

    switchShopTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Load items
        const shopItems = document.getElementById('shopItems');
        let items = [];
        
        if (tab === 'avatars') {
            items = this.avatars;
        } else {
            items = this.items[tab] || [];
        }
        
        shopItems.innerHTML = items.map(item => `
            <div class="shop-item ${this.hasItem(item.id, tab) ? 'owned' : ''}" data-item="${item.id}" data-type="${tab}">
                <div class="item-emoji">${item.emoji}</div>
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <div class="item-price">💰 ${item.price}</div>
                </div>
                <button class="buy-btn" ${this.hasItem(item.id, tab) ? 'disabled' : ''}>
                    ${this.hasItem(item.id, tab) ? '✅ Comprado' : '💳 Comprar'}
                </button>
            </div>
        `).join('');
        
        this.updateInventoryDisplay();
    }

    hasItem(itemId, type) {
        if (!this.currentPlayer) return false;
        return this.currentPlayer.inventory.includes(itemId);
    }

    updateInventoryDisplay() {
        const inventoryDiv = document.getElementById('inventoryItems');
        if (!this.currentPlayer) return;
        
        const ownedItems = [];
        
        // Adicionar avatares
        this.avatars.forEach(avatar => {
            if (this.hasItem(avatar.id, 'avatars')) {
                ownedItems.push({ ...avatar, type: 'avatar' });
            }
        });
        
        // Adicionar outros itens
        Object.keys(this.items).forEach(category => {
            this.items[category].forEach(item => {
                if (this.hasItem(item.id, category)) {
                    ownedItems.push({ ...item, type: category });
                }
            });
        });
        
        inventoryDiv.innerHTML = ownedItems.map(item => `
            <div class="inventory-item">
                <span>${item.emoji}</span>
                <span>${item.name}</span>
            </div>
        `).join('');
    }

    async showRanking() {
        document.getElementById('rankingModal').style.display = 'flex';
        this.switchRankingTab('money');
    }

    async switchRankingTab(tab) {
        document.querySelectorAll('.ranking-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        try {
            const response = await fetch(`/api/ranking/${tab}`);
            const rankings = response.ok ? await response.json() : [];
            
            this.displayRanking(rankings, tab);
        } catch (error) {
            console.error('Erro ao carregar ranking:', error);
            this.displayRanking([], tab);
        }
    }

    displayRanking(rankings, type) {
        const rankingList = document.getElementById('rankingList');
        
        if (rankings.length === 0) {
            rankingList.innerHTML = '<div class="no-ranking">📊 Ainda não há dados no ranking!</div>';
            return;
        }
        
        const medals = ['🥇', '🥈', '🥉'];
        
        rankingList.innerHTML = rankings.map((player, index) => {
            const medal = medals[index] || `${index + 1}º`;
            const avatar = this.avatars.find(a => a.id === player.avatar)?.emoji || '👤';
            
            let value = '';
            switch (type) {
                case 'money':
                    value = `💰 R$ ${player.balance.toFixed(2)}`;
                    break;
                case 'level':
                    value = `⭐ Nível ${player.level}`;
                    break;
                case 'investments':
                    value = `📈 ${player.investments || 0} investimentos`;
                    break;
            }
            
            return `
                <div class="ranking-item">
                    <div class="rank-position">${medal}</div>
                    <div class="player-avatar">${avatar}</div>
                    <div class="player-info">
                        <div class="player-name">${player.name}</div>
                        <div class="player-details">${player.age} anos • ${player.grade}º ano</div>
                    </div>
                    <div class="player-value">${value}</div>
                </div>
            `;
        }).join('');
    }

    showWelcomeMessage() {
        if (this.currentPlayer) {
            const avatar = this.avatars.find(a => a.id === this.currentPlayer.avatar);
            
            // Mostrar mensagem de boas-vindas
            if (window.game && window.game.notifications) {
                window.game.notifications.show(
                    `🎉 Bem-vindo, ${this.currentPlayer.name}! Seu avatar ${avatar.emoji} está pronto para a aventura!`,
                    'success',
                    5000
                );
            }
        }
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    async updatePlayerData(updates) {
        if (!this.currentPlayer) return;
        
        this.currentPlayer = { ...this.currentPlayer, ...updates };
        
        try {
            if (!this.currentPlayer.isOffline) {
                await fetch(`/api/player/${this.currentPlayer.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
            } else {
                localStorage.setItem('playerData', JSON.stringify(this.currentPlayer));
            }
        } catch (error) {
            console.error('Erro ao atualizar dados do jogador:', error);
            localStorage.setItem('playerData', JSON.stringify(this.currentPlayer));
        }
    }
}

// Instância global
window.playerProfile = new PlayerProfile();