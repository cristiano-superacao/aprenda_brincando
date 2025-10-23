# 🛒 Mercadinho do Cristhian

Um jogo educativo multiplayer para ensinar educação financeira de forma divertida!

## 🎮 Funcionalidades

- **🌈 Layout Roxo/Rosa**: Cores atrativas e interface amigável
- **💰 Dinheiro Real**: Imagens das moedas e cédulas brasileiras
- **🛍️ Produtos Reais**: Imagens de produtos reais do mercado brasileiro
- **👥 Multiplayer**: Cristhian pode jogar com amigos em tempo real
- **📱 Mobile/Tablet**: Otimizado para dispositivos móveis
- **3️⃣ Níveis**: Fácil, Médio e Difícil
- **🏪 Mercadinho**: Tema personalizado para as crianças

## 🚀 Como Jogar

### Método 1: Teste Rápido (Recomendado)
```bash
python teste-mercadinho.py
```
Acesse: http://localhost:8000

### Método 2: Servidor Multiplayer Completo
```bash
# Terminal 1 - Servidor Multiplayer
npm run multiplayer

# Terminal 2 - Abrir navegador
# Vá para http://localhost:3002
```

### Método 3: Servidor Node.js
```bash
npm install
npm start
```
Acesse: http://localhost:3001

## 🎯 Instruções do Jogo

1. **👋 Entrar no Jogo**: Digite seu nome
2. **🎮 Multiplayer**: Clique em "Jogar Juntos" para conectar
3. **🎲 Escolher Dificuldade**: Fácil, Médio ou Difícil
4. **💵 Adicionar Dinheiro**: Arraste moedas e cédulas para sua carteira
5. **🛒 Comprar Produtos**: Arraste produtos para o carrinho
6. **👥 Jogar Junto**: Veja as compras do outro jogador em tempo real!

## 📱 Para Celular/Tablet

1. **Conecte na mesma rede WiFi**
2. **Descubra o IP da máquina**: 
   - Windows: `ipconfig`
   - Linux/Mac: `ifconfig`
3. **Acesse pelo celular**: `http://SEU_IP:8000`
4. **Cada criança usa seu dispositivo!**

## 🎮 Modo Multiplayer

- **💬 Chat**: Conversem durante o jogo
- **👀 Visualização**: Vejam as compras um do outro
- **🏆 Pontuação**: Acompanhem os pontos em tempo real
- **🔄 Sincronização**: Tudo acontece ao vivo

## 📁 Estrutura

```
Mercadinho-Cristhian-Isabele/
├── public/              # Interface do jogo
│   ├── index.html      # Página principal
│   ├── styles.css      # Cores roxo/rosa
│   ├── script.js       # Lógica do jogo
│   └── multiplayer.js  # Sistema multiplayer
├── src/                # Servidores
│   ├── server.js       # Servidor principal
│   ├── multiplayer-server.js # Servidor WebSocket
│   └── database.js     # Produtos brasileiros
└── teste-mercadinho.py # Teste rápido
```

## 🛍️ Produtos Disponíveis

### 🟢 Fácil (até R$ 3,00)
- Pão Frances, Banana, Maçã, Bombom, Chiclete, Pirulito

### 🟡 Médio (até R$ 10,00)  
- Leite, Pão de Açúcar, Refrigerante, Chocolate, Suco, Biscoito

### 🔴 Difícil (até R$ 70,00)
- Cesta de Frutas, Kit Café, Caixa Chocolates, Kit Festa, Cesta Básica

## 💰 Dinheiro Brasileiro

**Moedas**: 5¢, 10¢, 25¢, 50¢, R$1
**Cédulas**: R$2, R$5, R$10, R$20, R$50, R$100

## 🎨 Personalização

O jogo foi especialmente customizado para o Cristhian com:
- Cores roxo e rosa
- Tema de mercadinho
- Produtos brasileiros
- Interface amigável para crianças

## 🤝 Como Brincar Juntos

1. **Cristhian** abre o jogo no seu dispositivo
2. **Amigos** abrem o jogo nos seus dispositivos  
3. Todos clicam em "🎮 Jogar Juntos"
4. Digitam seus nomes
5. Começam a comprar e se divertir!

---

**Feito com 💜 especialmente para o Cristhian!**