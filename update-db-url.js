// Helper para atualizar rapidamente a DATABASE_URL
const fs = require('fs');

function updateDatabaseUrl(connectionString) {
    if (!connectionString || !connectionString.includes('postgresql://')) {
        console.log('❌ Connection string inválida. Deve começar com postgresql://');
        return false;
    }

    try {
        const envPath = '.env';
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Substituir a linha DATABASE_URL
        envContent = envContent.replace(
            /DATABASE_URL=.*/,
            `DATABASE_URL=${connectionString}`
        );
        
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ DATABASE_URL atualizada com sucesso!');
        console.log('🔄 Agora execute: node configure-neon.js');
        
        return true;
    } catch (error) {
        console.log('❌ Erro ao atualizar .env:', error.message);
        return false;
    }
}

// Se executado diretamente, aceitar a URL como parâmetro
if (require.main === module) {
    const connectionString = process.argv[2];
    
    if (!connectionString) {
        console.log('📋 USO: node update-db-url.js "sua_connection_string_aqui"');
        console.log('');
        console.log('💡 Exemplo:');
        console.log('node update-db-url.js "postgresql://user:pass@ep-abc123.us-east-1.aws.neon.tech/dbname?sslmode=require"');
        process.exit(1);
    }
    
    const success = updateDatabaseUrl(connectionString);
    process.exit(success ? 0 : 1);
}

module.exports = { updateDatabaseUrl };