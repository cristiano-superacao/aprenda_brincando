// Script para finalizar configuração do Neon
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🎯 FINALIZAÇÃO DA CONFIGURAÇÃO NEON\n');
console.log('📋 INSTRUÇÕES PARA OBTER A CONNECTION STRING:\n');
console.log('1. 🌐 Acesse https://neon.tech');
console.log('2. 📧 Login: cristiano.s.santos@ba.estudante.senai.br');
console.log('3. 🔐 Senha: 18042016');
console.log('4. ➕ Crie projeto "aprenda-brincando"');
console.log('5. 📋 Copie a Connection String do dashboard\n');

rl.question('🔗 Cole aqui sua CONNECTION STRING do Neon: ', (connectionString) => {
    if (!connectionString || !connectionString.startsWith('postgresql://')) {
        console.log('❌ Connection string inválida. Deve começar com "postgresql://"');
        rl.close();
        return;
    }

    // Atualizar .env
    const envContent = `# Aprenda Brincando - Configurações
DATABASE_URL=${connectionString}
NODE_ENV=production
NETLIFY_FUNCTIONS_URL=https://mercadinhodocris.netlify.app/.netlify/functions
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Arquivo .env atualizado com sucesso!\n');

    // Testar conexão
    console.log('🔍 Testando conexão com o banco...\n');
    
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(connectionString);

    sql`SELECT version()`.then(result => {
        console.log('✅ Conexão com Neon estabelecida!');
        console.log('📊 PostgreSQL Version:', result[0].version);
        console.log('\n🚀 Próximo passo: Atualizar variáveis do Netlify\n');
        console.log('Execute o comando:');
        console.log(`netlify env:set DATABASE_URL "${connectionString}"`);
        
        rl.close();
    }).catch(error => {
        console.log('❌ Erro na conexão:', error.message);
        rl.close();
    });
});

// Handle Ctrl+C
rl.on('SIGINT', () => {
    console.log('\n🛑 Configuração cancelada');
    rl.close();
});