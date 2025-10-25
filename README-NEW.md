# 🎮 Aprenda Brincando

> Plataforma educacional infantil interativa com jogos, avatares personalizados e design responsivo

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Age Range](https://img.shields.io/badge/idade-6--16%20anos-purple.svg)

## 🌟 Sobre o Projeto

**Aprenda Brincando** é uma plataforma educacional moderna desenvolvida para crianças de 6 a 16 anos, focada em tornar o aprendizado divertido e engajante através de:

- 🎨 **Sistema de Avatares**: 6 personagens únicos com personalidades distintas
- 📚 **Jogos Educativos**: Múltiplas disciplinas e níveis de dificuldade
- 🎯 **Design Infantil**: Interface amigável com cores e animações atrativas
- 📱 **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- 👥 **Multiplayer**: Sistema de jogos colaborativos em tempo real

## 🚀 Características Principais

### 🎭 Sistema de Avatares
- **Ana (Exploradora)**: Curiosa e aventureira, ama ciências e natureza
- **João (Inventor)**: Criativo e engenhoso, focado em tecnologia
- **Maria (Cientista)**: Inteligente e observadora, especialista em experimentos
- **Pedro (Aventureiro)**: Corajoso e determinado, adora geografia e história  
- **Sofia (Artista)**: Criativa e sensível, expressiva através da arte
- **Lucas (Atleta)**: Energético e competitivo, focado em atividades físicas

### 🎮 Funcionalidades
- ✅ Fluxo de registro em 4 etapas simples
- ✅ Seleção personalizada de avatar
- ✅ Preferências de matérias e dificuldade
- ✅ Validação em tempo real dos formulários
- ✅ Animações suaves e feedback visual
- ✅ Sistema de notificações amigáveis
- ✅ Tema claro/escuro
- ✅ Suporte a acessibilidade

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com CSS Grid e Flexbox
- **JavaScript (ES6+)**: Interatividade moderna e modular
- **SVG**: Avatares vetoriais escaláveis

### Backend & Infraestrutura
- **Netlify Functions**: API serverless
- **WebSocket**: Comunicação em tempo real
- **Neon PostgreSQL**: Banco de dados gerenciado
- **Netlify**: Hospedagem e CI/CD

### Design System
- **CSS Custom Properties**: Sistema de cores dinâmico
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Otimizado para carregamento rápido

## 📁 Estrutura do Projeto

```
aprenda-brincando/
├── public/                 # Frontend estático
│   ├── welcome.html       # Página inicial com registro
│   ├── index.html         # Jogo principal
│   ├── styles/            # Arquivos CSS
│   │   ├── main.css      # Sistema de design base
│   │   ├── welcome.css   # Estilos da página inicial
│   │   ├── avatars.css   # Sistema de avatares
│   │   └── components.css # Componentes interativos
│   ├── js/               # JavaScript modular
│   │   ├── app.js        # Controlador principal
│   │   ├── welcome.js    # Lógica da página inicial
│   │   ├── avatars.js    # Gerenciamento de avatares
│   │   └── registration.js # Sistema de registro
│   └── images/           # Assets visuais
│       └── avatars/      # SVGs dos personagens
├── netlify/
│   └── functions/        # API serverless
├── src/                  # Backend Node.js
└── docs/                # Documentação
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- NPM ou Yarn
- Conta na Netlify (para deploy)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/aprenda-brincando.git
cd aprenda-brincando

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### Desenvolvimento Local
```bash
# Servidor de desenvolvimento com live reload
npm run dev

# Ou servidor estático simples
npm run serve

# Para funcionalidades multiplayer
npm run start:full
```

### Deploy para Produção
```bash
# Deploy automático via Netlify CLI
npm run deploy

# Ou conecte seu repositório ao Netlify para deploy contínuo
```

## 🎨 Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Roxo Principal | `#9C27B0` | Elementos primários |
| Azul Secundário | `#2196F3` | Tecnologia e ciência |
| Verde Sucesso | `#4CAF50` | Feedback positivo |
| Laranja Energia | `#FF9800` | Aventura e criatividade |
| Rosa Arte | `#E91E63` | Elementos artísticos |
| Ciano Esporte | `#00BCD4` | Atividades físicas |

## 📱 Responsividade

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px+
- **Large Desktop**: 1440px+

## ♿ Acessibilidade

- Navegação por teclado completa
- Suporte a leitores de tela
- Contraste adequado (WCAG AA)
- Texto redimensionável até 200%
- Foco visual claro
- Alternativas textuais para imagens

## 🚀 Acesso Rápido

### Para Testar a Nova Interface:
1. **Página de Boas-vindas**: Abra `public/welcome.html`
2. **Sistema de Avatares**: Complete o registro para ver a seleção
3. **Responsividade**: Teste em diferentes dispositivos

### URLs Importantes:
- **Desenvolvimento**: `http://localhost:8000/welcome.html`
- **Produção**: `https://mercadinhodocris.netlify.app/welcome.html`

## 🎯 Roadmap

### ✅ Versão 2.0 (Atual)
- [x] Interface infantil completamente redesenhada
- [x] Sistema de avatares com 6 personagens
- [x] Fluxo de registro em 4 etapas
- [x] Design responsivo moderno
- [x] CSS com custom properties
- [x] JavaScript modular

### 🚧 Versão 2.1 (Próxima)
- [ ] Integração completa com jogos existentes
- [ ] Sistema de progresso do usuário
- [ ] Animações avançadas
- [ ] Modo offline com Service Workers
- [ ] Testes automatizados

### 🔮 Versão 3.0 (Futuro)
- [ ] Inteligência artificial para personalização
- [ ] Realidade aumentada em jogos
- [ ] Suporte multilíngue
- [ ] App mobile nativo

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- 🌐 **Website**: [https://mercadinhodocris.netlify.app](https://mercadinhodocris.netlify.app)
- 📧 **Email**: suporte@aprendabrincando.com
- 💬 **Chat**: Disponível na plataforma
- 📋 **Issues**: [GitHub Issues](https://github.com/seu-usuario/aprenda-brincando/issues)

---

<div align="center">

**Desenvolvido com 💜 pela equipe SENAI 2025**

[🚀 Acesse a Nova Interface](https://mercadinhodocris.netlify.app/welcome.html) | [📚 Documentação](docs/) | [🐛 Reportar Bug](issues/)

</div>