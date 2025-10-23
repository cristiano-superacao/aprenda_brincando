const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Verificar se está em modo demo
const isDemoMode = !process.env.NEON_DATABASE_URL || process.env.NEON_DATABASE_URL === 'demo_mode';

let sql;
if (!isDemoMode) {
  sql = neon(process.env.NEON_DATABASE_URL);
}

// Dados demo em memória
let demoData = {
  users: new Map(),
  products: new Map([
    // Produtos Fáceis - Mercadinho do Cristhian
    [1, { id: 1, name: 'Pão Frances', price: 0.50, emoji: '🍞', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', difficulty: 'facil', points_reward: 3 }],
    [2, { id: 2, name: 'Banana Prata', price: 1.20, emoji: '🍌', image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80', difficulty: 'facil', points_reward: 5 }],
    [3, { id: 3, name: 'Maçã Gala', price: 1.80, emoji: '🍎', image_url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80', difficulty: 'facil', points_reward: 6 }],
    [4, { id: 4, name: 'Bombom Chocolate', price: 2.50, emoji: '🍫', image_url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=400&q=80', difficulty: 'facil', points_reward: 8 }],
    [5, { id: 5, name: 'Chiclete', price: 1.00, emoji: '🍬', image_url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80', difficulty: 'facil', points_reward: 4 }],
    [6, { id: 6, name: 'Pirulito', price: 1.50, emoji: '🍭', image_url: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?auto=format&fit=crop&w=400&q=80', difficulty: 'facil', points_reward: 5 }],
    [19, { id: 19, name: 'Jujuba', price: 2.00, emoji: '🍬', image_url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80', difficulty: 'facil', points_reward: 6 }],
    [20, { id: 20, name: 'Laranja', price: 1.50, emoji: '🍊', image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80', difficulty: 'facil', points_reward: 5 }],
    [21, { id: 21, name: 'Uva', price: 3.50, emoji: '🍇', image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=400&q=80', difficulty: 'facil', points_reward: 9 }],
    [22, { id: 22, name: 'Pêra', price: 2.20, emoji: '🍐', image_url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=400&q=80', difficulty: 'facil', points_reward: 7 }],
    
    // Produtos Médios - Mercadinho do Cristhian
    [7, { id: 7, name: 'Leite Integral 1L', price: 4.50, emoji: '🥛', image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 12 }],
    [8, { id: 8, name: 'Pão de Açúcar', price: 3.80, emoji: '🥖', image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 10 }],
    [9, { id: 9, name: 'Refrigerante 2L', price: 6.90, emoji: '🥤', image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 18 }],
    [10, { id: 10, name: 'Chocolate Barra', price: 8.50, emoji: '🍫', image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 22 }],
    [11, { id: 11, name: 'Suco de Laranja', price: 5.20, emoji: '🧃', image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 15 }],
    [12, { id: 12, name: 'Biscoito Recheado', price: 7.80, emoji: '🍪', image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 20 }],
    [23, { id: 23, name: 'Refrigerante Lata', price: 3.50, emoji: '🥤', image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 10 }],
    [24, { id: 24, name: 'Pipoca Doce', price: 4.80, emoji: '🍿', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 12 }],
    [25, { id: 25, name: 'Pipoca Salgada', price: 4.50, emoji: '🍿', image_url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 12 }],
    [26, { id: 26, name: 'Abacaxi', price: 6.00, emoji: '🍍', image_url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 16 }],
    [27, { id: 27, name: 'Morango', price: 5.50, emoji: '🍓', image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 15 }],
    [28, { id: 28, name: 'Melancia', price: 8.00, emoji: '🍉', image_url: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?auto=format&fit=crop&w=400&q=80', difficulty: 'medio', points_reward: 20 }],
    
    // Produtos Difíceis - Mercadinho do Cristhian
    [13, { id: 13, name: 'Cesta de Frutas', price: 25.00, emoji: '🧺', image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80', difficulty: 'dificil', points_reward: 45 }],
    [14, { id: 14, name: 'Kit Café da Manhã', price: 35.50, emoji: '☕', image_url: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&w=400&q=80', difficulty: 'dificil', points_reward: 55 }],
    [15, { id: 15, name: 'Caixa de Chocolates', price: 42.90, emoji: '🍫', image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80', difficulty: 'dificil', points_reward: 65 }],
    [16, { id: 16, name: 'Kit Festa Infantil', price: 68.00, emoji: '🎉', image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80', difficulty: 'dificil', points_reward: 85 }],
    [17, { id: 17, name: 'Cesta Básica Mini', price: 55.80, emoji: '🛒', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80', difficulty: 'dificil', points_reward: 75 }],
    [18, { id: 18, name: 'Kit Lanche Escolar', price: 38.90, emoji: '🎒', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80', difficulty: 'dificil', points_reward: 60 }],
    [29, { id: 29, name: 'Pack Refrigerantes 6un', price: 18.90, emoji: '🥤', image_url: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=400&q=80', difficulty: 'dificil', points_reward: 35 }],
    [30, { id: 30, name: 'Cesta de Frutas Premium', price: 45.00, emoji: '🧺', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80', difficulty: 'dificil', points_reward: 70 }]
  ]),
  transactions: new Map(),
  userIdCounter: 1
};

// Função para inicializar o banco de dados
async function initDatabase() {
  if (isDemoMode) {
    console.log('🎮 Modo demo ativado - usando dados em memória');
    return;
  }

  try {
    // Criar tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        level INTEGER DEFAULT 1,
        points INTEGER DEFAULT 0,
        balance DECIMAL(10,2) DEFAULT 0.00,
        difficulty VARCHAR(20) DEFAULT 'facil',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar tabela de histórico de transações
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(20) NOT NULL, -- 'add_money', 'buy_product', 'level_up'
        amount DECIMAL(10,2),
        description TEXT,
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar tabela de produtos
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        emoji VARCHAR(10),
        image_url TEXT,
        difficulty VARCHAR(20) DEFAULT 'facil',
        points_reward INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Inserir produtos padrão se não existirem
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products`;
    if (existingProducts[0].count == 0) {
      await sql`
        INSERT INTO products (name, price, emoji, image_url, difficulty, points_reward) VALUES
        ('Chiclete', 0.75, '🍭', 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80', 'facil', 3),
        ('Doce', 1.25, '🍬', 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?auto=format&fit=crop&w=400&q=80', 'facil', 5),
        ('Bombom', 1.50, '🍫', 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=400&q=80', 'facil', 6),
        ('Chocolate', 2.50, '🍫', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=400&q=80', 'facil', 8),
        ('Picolé', 3.00, '🍦', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80', 'facil', 10),
        ('Biscoito', 3.50, '🍪', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80', 'facil', 9),
        ('Suco', 4.00, '🧃', 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80', 'medio', 12),
        ('Bolo Fatia', 5.00, '🍰', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&q=80', 'medio', 15),
        ('Sanduíche', 6.50, '🥪', 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?auto=format&fit=crop&w=400&q=80', 'medio', 18),
        ('Sorvete', 7.50, '🍨', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=400&q=80', 'medio', 20),
        ('Pizza Fatia', 8.00, '🍕', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80', 'medio', 22),
        ('Hambúrguer', 9.50, '�', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', 'medio', 25),
        ('Bolo Inteiro', 12.00, '🎂', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&q=80', 'dificil', 30),
        ('Combo Lanche', 15.00, '�', 'https://images.unsplash.com/photo-1541592106381-b31e96ddd481?auto=format&fit=crop&w=400&q=80', 'dificil', 35),
        ('Pizza Inteira', 18.00, '🍕', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80', 'dificil', 40),
        ('Cesta de Frutas', 20.00, '🧺', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80', 'dificil', 45),
        ('Kit Festa', 25.00, '�', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80', 'dificil', 50),
        ('Cesta Premium', 30.00, '�', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80', 'dificil', 60)
      `;
    }

    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
}

// Funções de interação com o banco
const db = {
  // Usuários
  async createUser(name) {
    if (isDemoMode) {
      const user = {
        id: demoData.userIdCounter++,
        name: name || 'Jogador',
        level: 1,
        points: 0,
        balance: 0.0,
        difficulty: 'facil',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      demoData.users.set(user.id, user);
      demoData.transactions.set(user.id, []);
      return user;
    }

    const result = await sql`
      INSERT INTO users (name) VALUES (${name})
      RETURNING *
    `;
    return result[0];
  },

  async getUser(id) {
    if (isDemoMode) {
      return demoData.users.get(parseInt(id)) || null;
    }

    const result = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    return result[0];
  },

  async updateUserBalance(id, newBalance) {
    if (isDemoMode) {
      const user = demoData.users.get(parseInt(id));
      if (user) {
        user.balance = newBalance;
        user.updated_at = new Date().toISOString();
        return user;
      }
      return null;
    }

    const result = await sql`
      UPDATE users SET balance = ${newBalance}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  async updateUserLevel(id, level, points) {
    if (isDemoMode) {
      const user = demoData.users.get(parseInt(id));
      if (user) {
        user.level = level;
        user.points = points;
        user.updated_at = new Date().toISOString();
        return user;
      }
      return null;
    }

    const result = await sql`
      UPDATE users SET level = ${level}, points = ${points}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  // Produtos
  async getProducts(difficulty = null) {
    if (isDemoMode) {
      const products = Array.from(demoData.products.values());
      if (difficulty) {
        return products.filter(p => p.difficulty === difficulty);
      }
      return products.sort((a, b) => a.price - b.price);
    }

    if (difficulty) {
      return await sql`
        SELECT * FROM products WHERE difficulty = ${difficulty}
        ORDER BY price ASC
      `;
    }
    return await sql`
      SELECT * FROM products ORDER BY price ASC
    `;
  },

  async getProduct(id) {
    if (isDemoMode) {
      return demoData.products.get(parseInt(id)) || null;
    }

    const result = await sql`
      SELECT * FROM products WHERE id = ${id}
    `;
    return result[0];
  },

  // Transações
  async addTransaction(userId, type, amount, description, pointsEarned = 0) {
    if (isDemoMode) {
      const userTransactions = demoData.transactions.get(parseInt(userId)) || [];
      const transaction = {
        id: userTransactions.length + 1,
        user_id: parseInt(userId),
        type,
        amount: amount || 0,
        description,
        points_earned: pointsEarned,
        created_at: new Date().toISOString()
      };
      userTransactions.push(transaction);
      demoData.transactions.set(parseInt(userId), userTransactions);
      return transaction;
    }

    const result = await sql`
      INSERT INTO transactions (user_id, type, amount, description, points_earned)
      VALUES (${userId}, ${type}, ${amount}, ${description}, ${pointsEarned})
      RETURNING *
    `;
    return result[0];
  },

  async getUserTransactions(userId, limit = 10) {
    if (isDemoMode) {
      const userTransactions = demoData.transactions.get(parseInt(userId)) || [];
      return userTransactions.slice(-limit).reverse();
    }

    return await sql`
      SELECT * FROM transactions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  },

  // Estatísticas
  async getUserStats(userId) {
    if (isDemoMode) {
      const userTransactions = demoData.transactions.get(parseInt(userId)) || [];
      const stats = {
        total_transactions: userTransactions.length,
        total_spent: userTransactions.filter(t => t.type === 'buy_product').reduce((sum, t) => sum + t.amount, 0),
        total_added: userTransactions.filter(t => t.type === 'add_money').reduce((sum, t) => sum + t.amount, 0),
        total_points_earned: userTransactions.reduce((sum, t) => sum + t.points_earned, 0)
      };
      return stats;
    }

    const transactions = await sql`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'buy_product' THEN amount ELSE 0 END) as total_spent,
        SUM(CASE WHEN type = 'add_money' THEN amount ELSE 0 END) as total_added,
        SUM(points_earned) as total_points_earned
      FROM transactions 
      WHERE user_id = ${userId}
    `;
    return transactions[0];
  }
};

module.exports = { db, initDatabase, sql };