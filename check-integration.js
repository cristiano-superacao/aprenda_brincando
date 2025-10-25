// Verificador de integrações do sistema
const fs = require('fs');
const path = require('path');

class SystemChecker {
    constructor() {
        this.results = {
            files: [],
            integrations: [],
            dependencies: [],
            overall: 'pending'
        };
    }

    // Verificar arquivos essenciais
    checkFiles() {
        console.log('📂 Verificando arquivos essenciais...\n');
        
        const essentialFiles = [
            { path: 'public/welcome.html', desc: 'Nova interface principal' },
            { path: 'public/js/config.js', desc: 'Configuração centralizada' },
            { path: 'public/js/app.js', desc: 'Controller principal' },
            { path: 'public/js/avatars.js', desc: 'Sistema de avatares' },
            { path: 'public/js/registration.js', desc: 'Sistema de registro' },
            { path: 'public/styles/main.css', desc: 'Estilos principais' },
            { path: 'public/data/mock-database.json', desc: 'Dados offline' },
            { path: 'netlify/functions/api.js', desc: 'API Functions' },
            { path: 'setup-neon.js', desc: 'Configuração Neon' },
            { path: 'configure-neon.js', desc: 'Setup automático' }
        ];

        for (const file of essentialFiles) {
            const exists = fs.existsSync(file.path);
            console.log(`${exists ? '✅' : '❌'} ${file.desc}: ${file.path}`);
            this.results.files.push({ ...file, exists });
        }

        // Verificar avatares SVG
        console.log('\n🎭 Verificando avatares SVG...');
        for (let i = 1; i <= 6; i++) {
            const avatarPath = `public/images/avatars/student${i}.svg`;
            const exists = fs.existsSync(avatarPath);
            console.log(`${exists ? '✅' : '❌'} Avatar ${i}: student${i}.svg`);
        }
    }

    // Verificar integrações
    async checkIntegrations() {
        console.log('\n🔗 Verificando integrações...\n');

        // 1. Verificar Netlify
        try {
            const response = await fetch('https://mercadinhodocris.netlify.app/welcome.html');
            const netlifyOk = response.ok;
            console.log(`${netlifyOk ? '✅' : '❌'} Netlify Deploy: ${netlifyOk ? 'Ativo' : 'Falha'}`);
            this.results.integrations.push({ name: 'Netlify', status: netlifyOk });
        } catch (error) {
            console.log('❌ Netlify Deploy: Erro de conexão');
            this.results.integrations.push({ name: 'Netlify', status: false });
        }

        // 2. Verificar API Functions
        try {
            const response = await fetch('https://mercadinhodocris.netlify.app/.netlify/functions/api/ranking/money');
            const apiOk = response.ok;
            console.log(`${apiOk ? '✅' : '❌'} API Functions: ${apiOk ? 'Funcionando' : 'Erro'}`);
            this.results.integrations.push({ name: 'API Functions', status: apiOk });
        } catch (error) {
            console.log('❌ API Functions: Erro de conexão');
            this.results.integrations.push({ name: 'API Functions', status: false });
        }

        // 3. Verificar banco Neon
        require('dotenv').config();
        const hasValidDb = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('example');
        console.log(`${hasValidDb ? '✅' : '⚠️'} Banco Neon: ${hasValidDb ? 'Configurado' : 'Pendente configuração'}`);
        this.results.integrations.push({ name: 'Neon Database', status: hasValidDb });

        // 4. Verificar GitHub
        const gitExists = fs.existsSync('.git');
        console.log(`${gitExists ? '✅' : '❌'} GitHub: ${gitExists ? 'Repositório ativo' : 'Não inicializado'}`);
        this.results.integrations.push({ name: 'GitHub', status: gitExists });
    }

    // Verificar dependências
    checkDependencies() {
        console.log('\n📦 Verificando dependências...\n');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const requiredDeps = [
                '@neondatabase/serverless',
                'dotenv',
                'express',
                'pg',
                'cors',
                'ws'
            ];

            for (const dep of requiredDeps) {
                const exists = packageJson.dependencies && packageJson.dependencies[dep];
                console.log(`${exists ? '✅' : '❌'} ${dep}: ${exists ? 'Instalado' : 'Ausente'}`);
                this.results.dependencies.push({ name: dep, exists });
            }
        } catch (error) {
            console.log('❌ Erro ao verificar package.json');
        }
    }

    // Gerar relatório final
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RELATÓRIO FINAL DE INTEGRAÇÃO');
        console.log('='.repeat(60));

        const filesOk = this.results.files.filter(f => f.exists).length;
        const totalFiles = this.results.files.length;
        const integrationsOk = this.results.integrations.filter(i => i.status).length;
        const totalIntegrations = this.results.integrations.length;
        const depsOk = this.results.dependencies.filter(d => d.exists).length;
        const totalDeps = this.results.dependencies.length;

        console.log(`\n📂 Arquivos: ${filesOk}/${totalFiles} (${Math.round(filesOk/totalFiles*100)}%)`);
        console.log(`🔗 Integrações: ${integrationsOk}/${totalIntegrations} (${Math.round(integrationsOk/totalIntegrations*100)}%)`);
        console.log(`📦 Dependências: ${depsOk}/${totalDeps} (${Math.round(depsOk/totalDeps*100)}%)`);

        const overallScore = (filesOk + integrationsOk + depsOk) / (totalFiles + totalIntegrations + totalDeps) * 100;
        
        console.log(`\n🎯 Score Geral: ${Math.round(overallScore)}%`);

        if (overallScore >= 90) {
            console.log('🎉 SISTEMA TOTALMENTE INTEGRADO!');
            this.results.overall = 'excellent';
        } else if (overallScore >= 70) {
            console.log('✅ Sistema bem integrado, pequenos ajustes necessários');
            this.results.overall = 'good';
        } else {
            console.log('⚠️ Sistema parcialmente integrado, revisão necessária');
            this.results.overall = 'needs-work';
        }

        // Instruções baseadas no status
        this.showNextSteps(overallScore);
    }

    // Mostrar próximos passos
    showNextSteps(score) {
        console.log('\n📋 PRÓXIMOS PASSOS:');

        if (score < 90) {
            console.log('\n🔧 Para finalizar a integração:');
            
            // Verificar se Neon precisa ser configurado
            if (!this.results.integrations.find(i => i.name === 'Neon Database')?.status) {
                console.log('1. Configure o banco Neon:');
                console.log('   👉 Acesse https://neon.tech');
                console.log('   👉 Login: cristiano.s.santos@ba.estudante.senai.br');
                console.log('   👉 Execute: node configure-neon.js');
            }

            console.log('2. Teste o sistema:');
            console.log('   👉 https://mercadinhodocris.netlify.app/welcome.html');
            
            console.log('3. Monitore logs:');
            console.log('   👉 https://app.netlify.com/sites/mercadinhodocris/functions');
        } else {
            console.log('\n🚀 Sistema 100% operacional!');
            console.log('👉 Acesse: https://mercadinhodocris.netlify.app/welcome.html');
            console.log('📊 Monitore: https://app.netlify.com/sites/mercadinhodocris');
        }
    }

    // Executar todas as verificações
    async run() {
        console.log('🔍 VERIFICADOR DE INTEGRAÇÃO DO SISTEMA\n');
        console.log('Aprenda Brincando - Sistema Completo\n');

        this.checkFiles();
        await this.checkIntegrations();
        this.checkDependencies();
        this.generateReport();

        return this.results;
    }
}

// Executar verificação
if (require.main === module) {
    const checker = new SystemChecker();
    checker.run().then((results) => {
        const exitCode = results.overall === 'excellent' ? 0 : 1;
        process.exit(exitCode);
    }).catch(console.error);
}

module.exports = SystemChecker;