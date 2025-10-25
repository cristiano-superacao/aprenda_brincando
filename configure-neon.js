require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

// Script para configuração automática do Neon Database
async function setupNeonDatabase() {
    console.log('🚀 Configuração automática do Neon Database\n');
    
    // Instruções para obter a DATABASE_URL
    console.log('📋 Para configurar o banco de dados Neon:');
    console.log('');
    console.log('1. 🌐 Acesse https://neon.tech');
    console.log('2. 📧 Faça login com: cristiano.s.santos@ba.estudante.senai.br');
    console.log('3. 🔐 Use a senha: 18042016');
    console.log('4. ➕ Clique em "Create Project"');
    console.log('5. 📝 Nome do projeto: aprenda-brincando');
    console.log('6. 🌎 Região: US East (Virginia) - Recomendado');
    console.log('7. 🐘 PostgreSQL version: 15 ou superior');
    console.log('8. 📋 Após criado, vá em "Dashboard" > "Connection Details"');
    console.log('9. 🔗 Copie a "Connection String" completa');
    console.log('10. 📝 Cole a string no arquivo .env como DATABASE_URL');
    console.log('');
    
    // Verificar se DATABASE_URL já foi configurada
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('example')) {
        console.log('⚠️ DATABASE_URL ainda não configurada no arquivo .env');
        console.log('');
        console.log('💡 Exemplo de como deve ficar no .env:');
        console.log('DATABASE_URL=postgresql://username:password@ep-abc123.us-east-1.aws.neon.tech/dbname?sslmode=require');
        console.log('');
        console.log('🔄 Após configurar, execute novamente: node configure-neon.js');
        return false;
    }

    console.log('✅ DATABASE_URL encontrada, testando conexão...');
    
    try {
        // Testar conexão
        const sql = neon(process.env.DATABASE_URL);
        const result = await sql`SELECT current_timestamp as now, version()`;
        
        console.log('🔌 Conexão estabelecida com sucesso!');
        console.log(`📅 Timestamp: ${result[0].now}`);
        console.log(`🐘 Versão: ${result[0].version.split(' ')[0]}`);
        console.log('');

        // Executar configuração completa do banco
        console.log('🔨 Criando estrutura do banco de dados...');
        
        const NeonClient = require('./setup-neon.js');
        const client = new NeonClient();
        
        const success = await client.setupComplete();
        
        if (success) {
            console.log('');
            console.log('🎉 BANCO DE DADOS CONFIGURADO COM SUCESSO!');
            console.log('');
            console.log('📊 O que foi criado:');
            console.log('   ✅ Tabelas: players, rankings, transactions, game_sessions');
            console.log('   ✅ Índices para performance otimizada');
            console.log('   ✅ Funções automáticas para ranking');
            console.log('   ✅ Dados de exemplo inseridos');
            console.log('');
            console.log('🔄 Próximo passo: Deploy no Netlify');
            console.log('   Execute: npm run deploy');
            console.log('');
            console.log('🌐 Configurar variáveis no Netlify:');
            console.log('   👉 https://app.netlify.com/sites/mercadinhodocris/settings/env');
            console.log(`   📋 DATABASE_URL=${process.env.DATABASE_URL}`);
            
            return true;
        } else {
            console.log('❌ Falha na configuração do banco');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Erro na conexão:', error.message);
        console.log('');
        console.log('🔍 Possíveis soluções:');
        console.log('1. Verifique se a DATABASE_URL está correta');
        console.log('2. Confirme que o banco está ativo no painel Neon');
        console.log('3. Verifique sua conexão com internet');
        console.log('4. Tente gerar uma nova connection string no Neon');
        return false;
    }
}

// Função para criar .env se não existir
function createEnvFile() {
    const fs = require('fs');
    const envPath = '.env';
    
    if (!fs.existsSync(envPath)) {
        const envContent = `# Configuração do Banco de Dados Neon
# Substitua pela sua DATABASE_URL real obtida do painel Neon
DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require

# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações para Netlify Functions
NETLIFY_SITE_ID=mercadinhodocris
CORS_ORIGIN=https://mercadinhodocris.netlify.app
`;
        
        fs.writeFileSync(envPath, envContent);
        console.log('📝 Arquivo .env criado. Configure a DATABASE_URL e execute novamente.');
        return false;
    }
    return true;
}

// Função para atualizar DATABASE_URL no .env
function updateDatabaseUrl(newUrl) {
    const fs = require('fs');
    const envPath = '.env';
    
    try {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(
            /DATABASE_URL=.*/,
            `DATABASE_URL=${newUrl}`
        );
        fs.writeFileSync(envPath, envContent);
        console.log('✅ DATABASE_URL atualizada no arquivo .env');
        return true;
    } catch (error) {
        console.log('❌ Erro ao atualizar .env:', error.message);
        return false;
    }
}

// Menu interativo (simulado via console)
async function interactiveSetup() {
    console.log('🛠️ CONFIGURAÇÃO INTERATIVA DO NEON DATABASE\n');
    
    // Verificar .env
    if (!createEnvFile()) {
        return false;
    }
    
    // Executar configuração
    const success = await setupNeonDatabase();
    
    if (success) {
        console.log('✨ CONFIGURAÇÃO COMPLETA FINALIZADA!');
        console.log('🚀 Sistema está pronto para uso!');
    } else {
        console.log('');
        console.log('💡 INSTRUÇÕES DETALHADAS:');
        console.log('');
        console.log('Para obter sua DATABASE_URL:');
        console.log('1. Acesse https://neon.tech e faça login');
        console.log('2. Crie um novo projeto chamado "aprenda-brincando"');
        console.log('3. No dashboard do projeto, clique em "Connection Details"');
        console.log('4. Copie a "Connection String" (formato postgresql://...)');
        console.log('5. Cole no arquivo .env substituindo a linha DATABASE_URL');
        console.log('6. Execute novamente: node configure-neon.js');
    }
    
    return success;
}

// Executar se chamado diretamente
if (require.main === module) {
    interactiveSetup().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = {
    setupNeonDatabase,
    updateDatabaseUrl,
    createEnvFile
};