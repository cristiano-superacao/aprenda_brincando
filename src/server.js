const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initDatabase } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Inicializar banco de dados
initDatabase().then(() => {
  console.log('Banco de dados inicializado!');
}).catch(err => {
  console.error('Erro ao inicializar banco:', err);
});

// Rotas da API

// Produtos
app.get('/api/products', async (req, res) => {
  try {
    const { difficulty } = req.query;
    const products = await db.getProducts(difficulty);
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Usuários
app.post('/api/user', async (req, res) => {
  try {
    const { name } = req.body;
    const user = await db.createUser(name);
    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await db.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

app.put('/api/user/:id/balance', async (req, res) => {
  try {
    const { balance } = req.body;
    const user = await db.updateUserBalance(req.params.id, balance);
    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error);
    res.status(500).json({ error: 'Erro ao atualizar saldo' });
  }
});

app.put('/api/user/:id/level', async (req, res) => {
  try {
    const { level, points } = req.body;
    const user = await db.updateUserLevel(req.params.id, level, points);
    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar nível:', error);
    res.status(500).json({ error: 'Erro ao atualizar nível' });
  }
});

// Transações
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, type, amount, description, pointsEarned } = req.body;
    const transaction = await db.addTransaction(userId, type, amount, description, pointsEarned);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

app.get('/api/user/:id/transactions', async (req, res) => {
  try {
    const transactions = await db.getUserTransactions(req.params.id);
    res.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Estatísticas
app.get('/api/user/:id/stats', async (req, res) => {
  try {
    const stats = await db.getUserStats(req.params.id);
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Rota para servir o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Iniciar servidor
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`📱 Aprenda Brincando - Educação Financeira para Crianças`);
    console.log(`💾 Modo: ${process.env.NEON_DATABASE_URL === 'demo_mode' ? 'Demo (dados em memória)' : 'Produção'}`);
    console.log(`📂 Servindo arquivos de: ${path.join(__dirname, '../public')}`);
    console.log(`⚡ Para acessar o jogo, abra: http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Porta ${port} já está em uso. Tentando porta ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Erro ao iniciar servidor:', err);
      process.exit(1);
    }
  });

  return server;
};

// Iniciar servidor
startServer(PORT);