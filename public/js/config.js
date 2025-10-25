// Configurações centralizadas do sistema
class SystemConfig {
    static get avatars() {
        return [
            {
                id: 'student1',
                name: 'Ana',
                personality: 'Exploradora',
                description: 'Curiosa e aventureira, adora descobrir coisas novas!',
                interests: ['ciência', 'natureza', 'descobertas'],
                color: '#9C27B0',
                emoji: '👧',
                price: 0,
                svgPath: 'images/avatars/student1.svg'
            },
            {
                id: 'student2',
                name: 'João',
                personality: 'Inventor',
                description: 'Criativo e engenhoso, sempre construindo algo incrível!',
                interests: ['tecnologia', 'construção', 'invenções'],
                color: '#2196F3',
                emoji: '👦',
                price: 50,
                svgPath: 'images/avatars/student2.svg'
            },
            {
                id: 'student3',
                name: 'Maria',
                personality: 'Cientista',
                description: 'Inteligente e observadora, ama experimentos e descobertas!',
                interests: ['química', 'biologia', 'experimentos'],
                color: '#4CAF50',
                emoji: '👩‍🔬',
                price: 75,
                svgPath: 'images/avatars/student3.svg'
            },
            {
                id: 'student4',
                name: 'Pedro',
                personality: 'Aventureiro',
                description: 'Corajoso e determinado, sempre pronto para novos desafios!',
                interests: ['geografia', 'história', 'aventuras'],
                color: '#FF9800',
                emoji: '🧭',
                price: 60,
                svgPath: 'images/avatars/student4.svg'
            },
            {
                id: 'student5',
                name: 'Sofia',
                personality: 'Artista',
                description: 'Criativa e sensível, expressa suas ideias através da arte!',
                interests: ['arte', 'música', 'criatividade'],
                color: '#E91E63',
                emoji: '👩‍🎨',
                price: 90,
                svgPath: 'images/avatars/student5.svg'
            },
            {
                id: 'student6',
                name: 'Lucas',
                personality: 'Atleta',
                description: 'Energético e competitivo, adora desafios físicos!',
                interests: ['esportes', 'educação física', 'competições'],
                color: '#00BCD4',
                emoji: '⚽',
                price: 70,
                svgPath: 'images/avatars/student6.svg'
            }
        ];
    }

    static get shopItems() {
        return {
            lanches: [
                { id: 'food_1', name: 'Pizza', emoji: '🍕', price: 15, category: 'lanches' },
                { id: 'food_2', name: 'Hambúrguer', emoji: '🍔', price: 12, category: 'lanches' },
                { id: 'food_3', name: 'Sorvete', emoji: '🍦', price: 8, category: 'lanches' },
                { id: 'food_4', name: 'Pipoca', emoji: '🍿', price: 5, category: 'lanches' },
                { id: 'food_5', name: 'Donut', emoji: '🍩', price: 6, category: 'lanches' }
            ],
            roupas: [
                { id: 'cloth_1', name: 'Camiseta Legal', emoji: '👕', price: 25, category: 'roupas' },
                { id: 'cloth_2', name: 'Jaqueta', emoji: '🧥', price: 45, category: 'roupas' },
                { id: 'cloth_3', name: 'Tênis', emoji: '👟', price: 60, category: 'roupas' },
                { id: 'cloth_4', name: 'Chapéu', emoji: '🎩', price: 30, category: 'roupas' },
                { id: 'cloth_5', name: 'Óculos', emoji: '🕶️', price: 35, category: 'roupas' }
            ],
            brinquedos: [
                { id: 'toy_1', name: 'Bola', emoji: '⚽', price: 20, category: 'brinquedos' },
                { id: 'toy_2', name: 'Videogame', emoji: '🎮', price: 150, category: 'brinquedos' },
                { id: 'toy_3', name: 'Livro', emoji: '📚', price: 18, category: 'brinquedos' },
                { id: 'toy_4', name: 'Puzzle', emoji: '🧩', price: 25, category: 'brinquedos' },
                { id: 'toy_5', name: 'Bicicleta', emoji: '🚲', price: 200, category: 'brinquedos' }
            ]
        };
    }

    static get gameConfig() {
        return {
            initialBalance: 50.00,
            initialLevel: 1,
            initialExperience: 0,
            maxReconnectAttempts: 3,
            reconnectDelay: 2000,
            notificationDuration: 3000,
            quizTimeLimit: 30,
            multiplayer: {
                maxPlayers: 4,
                waitingTimeout: 300000, // 5 minutes
                gameTimeout: 600000,    // 10 minutes
                minPlayers: 2
            },
            validation: {
                nameMinLength: 2,
                nameMaxLength: 30,
                minAge: 6,
                maxAge: 16,
                maxSubjectSelections: 3
            }
        };
    }

    static get apiEndpoints() {
        return {
            base: '/.netlify/functions',
            player: {
                create: '/api/player/create',
                get: '/api/player/{id}',
                update: '/api/player/{id}',
                delete: '/api/player/{id}'
            },
            ranking: {
                get: '/api/ranking/{category}',
                update: '/api/ranking/update'
            },
            websocket: {
                connect: '/websocket/connect',
                rooms: '/websocket/rooms',
                create: '/websocket/create-room',
                join: '/websocket/join-room/{id}',
                leave: '/websocket/leave-room/{id}'
            },
            health: '/api/health'
        };
    }

    static get subjects() {
        return [
            { id: 'math', name: 'Matemática', icon: '🔢', color: '#2196F3' },
            { id: 'science', name: 'Ciências', icon: '🔬', color: '#4CAF50' },
            { id: 'language', name: 'Português', icon: '📚', color: '#9C27B0' },
            { id: 'history', name: 'História', icon: '🏛️', color: '#795548' },
            { id: 'geography', name: 'Geografia', icon: '🌍', color: '#00BCD4' },
            { id: 'art', name: 'Arte', icon: '🎨', color: '#E91E63' },
            { id: 'music', name: 'Música', icon: '🎵', color: '#FF9800' },
            { id: 'sports', name: 'Esportes', icon: '⚽', color: '#FF5722' }
        ];
    }

    static get difficulties() {
        return [
            { 
                id: 'easy', 
                name: 'Fácil', 
                description: 'Perfeito para começar!',
                stars: 1,
                color: '#4CAF50'
            },
            { 
                id: 'medium', 
                name: 'Médio', 
                description: 'Um pouquinho mais desafiador',
                stars: 2,
                color: '#FF9800'
            },
            { 
                id: 'hard', 
                name: 'Difícil', 
                description: 'Para os corajosos!',
                stars: 3,
                color: '#F44336'
            }
        ];
    }

    static get gradeOptions() {
        return [
            { value: 1, label: '1º ano (Fundamental)' },
            { value: 2, label: '2º ano (Fundamental)' },
            { value: 3, label: '3º ano (Fundamental)' },
            { value: 4, label: '4º ano (Fundamental)' },
            { value: 5, label: '5º ano (Fundamental)' },
            { value: 6, label: '6º ano (Fundamental)' },
            { value: 7, label: '7º ano (Fundamental)' },
            { value: 8, label: '8º ano (Fundamental)' },
            { value: 9, label: '9º ano (Fundamental)' },
            { value: 10, label: '1º ano (Ensino Médio)' },
            { value: 11, label: '2º ano (Ensino Médio)' },
            { value: 12, label: '3º ano (Ensino Médio)' }
        ];
    }

    static get cssVariables() {
        return {
            colors: {
                primary: '#6366f1',
                secondary: '#8b5cf6',
                accent: '#f59e0b',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6'
            },
            fonts: {
                primary: '"Fredoka", "Comic Neue", sans-serif',
                secondary: '"Comic Neue", cursive'
            },
            spacing: {
                xs: '0.5rem',
                sm: '1rem',
                md: '1.5rem',
                lg: '2rem',
                xl: '3rem'
            }
        };
    }

    // Helper methods
    static getAvatarById(id) {
        return this.avatars.find(avatar => avatar.id === id);
    }

    static getSubjectById(id) {
        return this.subjects.find(subject => subject.id === id);
    }

    static getDifficultyById(id) {
        return this.difficulties.find(difficulty => difficulty.id === id);
    }

    static getGradeLabel(value) {
        const grade = this.gradeOptions.find(g => g.value === value);
        return grade ? grade.label : `${value}º ano`;
    }

    static formatPrice(price) {
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }

    static getApiUrl(endpoint, params = {}) {
        let url = this.apiEndpoints.base + endpoint;
        
        // Replace URL parameters
        Object.keys(params).forEach(key => {
            url = url.replace(`{${key}}`, params[key]);
        });
        
        return url;
    }

    static validateAge(age) {
        return age >= this.gameConfig.validation.minAge && age <= this.gameConfig.validation.maxAge;
    }

    static validateName(name) {
        const { nameMinLength, nameMaxLength } = this.gameConfig.validation;
        return name.length >= nameMinLength && name.length <= nameMaxLength && /^[a-zA-ZÀ-ÿ\s]+$/.test(name);
    }

    static getRecommendedAvatars(age) {
        if (age >= 6 && age <= 8) {
            return ['student1', 'student5', 'student6']; // Mais coloridos e divertidos
        } else if (age >= 9 && age <= 12) {
            return ['student2', 'student3', 'student4']; // Aventura e ciência
        } else {
            return this.avatars.map(avatar => avatar.id); // Todos para adolescentes
        }
    }
}

// Export for both module and global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemConfig;
} else {
    window.SystemConfig = SystemConfig;
}