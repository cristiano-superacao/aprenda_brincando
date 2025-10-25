#!/usr/bin/env node

const NeonDatabaseClient = require('./setup-neon.js');
const fs = require('fs');
const path = require('path');

// Script de configuração automática completa
class AutoSetup {
    constructor() {
        this.envPath = path.join(__dirname, '.env');
        this.client = null;
    }

    // Verificar se .env existe
    checkEnvFile() {
        if (!fs.existsSync(this.envPath)) {
            console.log('📝 Arquivo .env não encontrado.');
            console.log('   Crie um arquivo .env com sua DATABASE_URL do Neon');
            console.log('   Exemplo: DATABASE_URL=postgresql://user:pass@host/db?sslmode=require');
            return false;
        }
        return true;
    }

    // Carregar e validar DATABASE_URL
    loadDatabaseUrl() {
        try {
            require('dotenv').config();
            const dbUrl = process.env.DATABASE_URL;
            
            if (!dbUrl) {
                console.log('❌ DATABASE_URL não encontrada no arquivo .env');
                return false;
            }

            if (!dbUrl.includes('postgresql://')) {
                console.log('❌ DATABASE_URL deve começar com postgresql://');
                return false;
            }

            console.log('✅ DATABASE_URL encontrada e válida');
            this.client = new NeonDatabaseClient();
            return true;
        } catch (error) {
            console.error('❌ Erro ao carregar .env:', error.message);
            return false;
        }
    }

    // Criar arquivo de configuração do Netlify
    async createNetlifyEnv() {
        try {
            const dbUrl = process.env.DATABASE_URL;
            
            const netlifyEnvContent = `# Configuração para Netlify
# Copie estas variáveis para: https://app.netlify.com/sites/mercadinhodocris/settings/env

DATABASE_URL=${dbUrl}
NODE_ENV=production
CORS_ORIGIN=https://mercadinhodocris.netlify.app
`;

            fs.writeFileSync('netlify-env.txt', netlifyEnvContent);
            console.log('📋 Arquivo netlify-env.txt criado com as variáveis para o Netlify');
            return true;
        } catch (error) {
            console.error('❌ Erro ao criar arquivo Netlify:', error.message);
            return false;
        }
    }

    // Configuração completa
    async run() {
        console.log('🚀 CONFIGURAÇÃO AUTOMÁTICA DO APRENDA BRINCANDO\n');

        // 1. Verificar arquivo .env
        if (!this.checkEnvFile()) {
            console.log('\n📝 Para continuar:');
            console.log('1. Acesse https://neon.tech');
            console.log('2. Crie conta (pode usar GitHub)');
            console.log('3. Crie projeto: aprenda-brincando');
            console.log('4. Copie a connection string');
            console.log('5. Crie arquivo .env com: DATABASE_URL=sua_string_aqui');
            console.log('6. Execute novamente: node auto-setup.js');
            return false;
        }

        // 2. Carregar DATABASE_URL
        if (!this.loadDatabaseUrl()) {
            return false;
        }

        // 3. Configurar banco de dados
        console.log('🔨 Configurando banco de dados...');
        const dbSetup = await this.client.setupComplete();
        if (!dbSetup) {
            console.log('❌ Falha na configuração do banco');
            return false;
        }

        // 4. Criar arquivo para Netlify
        await this.createNetlifyEnv();

        // 5. Instruções finais
        console.log('\n🎉 CONFIGURAÇÃO COMPLETA FINALIZADA!');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. ✅ Banco de dados configurado');
        console.log('2. 📋 Arquivo netlify-env.txt criado');
        console.log('3. 🔧 Configure no Netlify:');
        console.log('   👉 https://app.netlify.com/sites/mercadinhodocris/settings/env');
        console.log('   📋 Copie as variáveis do arquivo netlify-env.txt');
        console.log('4. 🚀 Faça redeploy: netlify deploy --prod --dir=public');
        console.log('5. 🧪 Teste: https://mercadinhodocris.netlify.app/test-config.html');

        return true;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const setup = new AutoSetup();
    setup.run().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = AutoSetup;