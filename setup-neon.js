require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

// Configuração do cliente Neon
class NeonDatabaseClient {
    constructor() {
        this.databaseUrl = process.env.DATABASE_URL;
        this.sql = null;
        
        if (this.databaseUrl) {
            this.sql = neon(this.databaseUrl);
            console.log('✅ Cliente Neon inicializado com sucesso');
        } else {
            console.log('⚠️ DATABASE_URL não encontrada. Configure primeiro.');
        }
    }

    // Testar conexão
    async testConnection() {
        try {
            if (!this.sql) throw new Error('DATABASE_URL não configurada');
            
            const result = await this.sql`SELECT current_timestamp as now, version()`;
            console.log('🔌 Conexão testada com sucesso:', {
                timestamp: result[0].now,
                version: result[0].version.split(' ')[0]
            });
            return true;
        } catch (error) {
            console.error('❌ Erro na conexão:', error.message);
            return false;
        }
    }

    // Criar todas as tabelas
    async createTables() {
        try {
            console.log('📊 Criando tabelas do banco de dados...');

            // Tabela de jogadores
            await this.sql`
                CREATE TABLE IF NOT EXISTS players (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    age INTEGER NOT NULL CHECK (age >= 4 AND age <= 18),
                    grade VARCHAR(20) NOT NULL,
                    avatar VARCHAR(50) NOT NULL,
                    balance DECIMAL(10,2) DEFAULT 50.00,
                    experience INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 1,
                    inventory JSONB DEFAULT '{}',
                    stats JSONB DEFAULT '{}',
                    multiplayer_stats JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            // Tabela de rankings
            await this.sql`
                CREATE TABLE IF NOT EXISTS rankings (
                    id SERIAL PRIMARY KEY,
                    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
                    category VARCHAR(50) NOT NULL,
                    value DECIMAL(12,2) NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(player_id, category)
                )
            `;

            // Tabela de transações
            await this.sql`
                CREATE TABLE IF NOT EXISTS transactions (
                    id SERIAL PRIMARY KEY,
                    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
                    type VARCHAR(50) NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            // Tabela de sessões de jogo
            await this.sql`
                CREATE TABLE IF NOT EXISTS game_sessions (
                    id SERIAL PRIMARY KEY,
                    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
                    game_type VARCHAR(50) NOT NULL,
                    score INTEGER DEFAULT 0,
                    duration INTEGER DEFAULT 0,
                    completed BOOLEAN DEFAULT false,
                    data JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP
                )
            `;

            // Tabela de salas multiplayer
            await this.sql`
                CREATE TABLE IF NOT EXISTS multiplayer_rooms (
                    id VARCHAR(10) PRIMARY KEY,
                    host_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
                    name VARCHAR(100),
                    max_players INTEGER DEFAULT 4,
                    current_players INTEGER DEFAULT 1,
                    grade_filter VARCHAR(20),
                    status VARCHAR(20) DEFAULT 'waiting',
                    settings JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    started_at TIMESTAMP,
                    finished_at TIMESTAMP
                )
            `;

            // Tabela de participantes das salas
            await this.sql`
                CREATE TABLE IF NOT EXISTS room_participants (
                    id SERIAL PRIMARY KEY,
                    room_id VARCHAR(10) REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
                    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
                    score INTEGER DEFAULT 0,
                    is_ready BOOLEAN DEFAULT false,
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(room_id, player_id)
                )
            `;

            console.log('✅ Todas as tabelas foram criadas com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao criar tabelas:', error.message);
            return false;
        }
    }

    // Criar índices para performance
    async createIndexes() {
        try {
            console.log('🚀 Criando índices para otimização...');

            const indexes = [
                `CREATE INDEX IF NOT EXISTS idx_players_name ON players(name)`,
                `CREATE INDEX IF NOT EXISTS idx_players_grade ON players(grade)`,
                `CREATE INDEX IF NOT EXISTS idx_players_level ON players(level)`,
                `CREATE INDEX IF NOT EXISTS idx_rankings_category ON rankings(category)`,
                `CREATE INDEX IF NOT EXISTS idx_rankings_value ON rankings(value DESC)`,
                `CREATE INDEX IF NOT EXISTS idx_rankings_player_category ON rankings(player_id, category)`,
                `CREATE INDEX IF NOT EXISTS idx_transactions_player_id ON transactions(player_id)`,
                `CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`,
                `CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON game_sessions(player_id)`,
                `CREATE INDEX IF NOT EXISTS idx_game_sessions_type ON game_sessions(game_type)`,
                `CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_status ON multiplayer_rooms(status)`,
                `CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_grade ON multiplayer_rooms(grade_filter)`,
                `CREATE INDEX IF NOT EXISTS idx_room_participants_room ON room_participants(room_id)`,
                `CREATE INDEX IF NOT EXISTS idx_room_participants_player ON room_participants(player_id)`
            ];

            for (const indexQuery of indexes) {
                await this.sql.unsafe(indexQuery);
            }

            console.log('✅ Índices criados com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao criar índices:', error.message);
            return false;
        }
    }

    // Inserir dados de exemplo
    async insertSampleData() {
        try {
            console.log('👥 Inserindo dados de exemplo...');

            // Verificar se já existem jogadores
            const existingPlayers = await this.sql`SELECT COUNT(*) as count FROM players`;
            if (existingPlayers[0].count > 0) {
                console.log('ℹ️ Já existem jogadores no banco. Pulando inserção de dados de exemplo.');
                return true;
            }

            // Inserir jogadores de exemplo
            const samplePlayers = [
                ['Ana Silva', 8, '3º Ano', 'student1', 75.50, 150, 2],
                ['João Santos', 10, '5º Ano', 'student2', 125.00, 300, 3],
                ['Maria Oliveira', 7, '2º Ano', 'student3', 60.25, 100, 1],
                ['Pedro Costa', 12, '7º Ano', 'student4', 200.00, 450, 4],
                ['Sofia Mendes', 9, '4º Ano', 'student5', 90.75, 200, 2],
                ['Lucas Ferreira', 11, '6º Ano', 'student6', 160.00, 350, 3]
            ];

            for (const player of samplePlayers) {
                const [name, age, grade, avatar, balance, experience, level] = player;
                const result = await this.sql`
                    INSERT INTO players (name, age, grade, avatar, balance, experience, level)
                    VALUES (${name}, ${age}, ${grade}, ${avatar}, ${balance}, ${experience}, ${level})
                    RETURNING id
                `;
                
                const playerId = result[0].id;

                // Criar rankings para o jogador
                await this.sql`
                    INSERT INTO rankings (player_id, category, value) VALUES 
                    (${playerId}, 'money', ${balance}),
                    (${playerId}, 'level', ${level}),
                    (${playerId}, 'investments', 0.00)
                    ON CONFLICT (player_id, category) DO NOTHING
                `;
            }

            console.log(`✅ ${samplePlayers.length} jogadores de exemplo criados!`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao inserir dados de exemplo:', error.message);
            return false;
        }
    }

    // Criar funções e triggers do banco
    async createFunctions() {
        try {
            console.log('⚙️ Criando funções e triggers...');

            // Função para atualizar ranking automaticamente
            await this.sql.unsafe(`
                CREATE OR REPLACE FUNCTION update_player_ranking()
                RETURNS TRIGGER AS $$
                BEGIN
                    -- Atualizar ranking de dinheiro
                    IF NEW.balance != OLD.balance THEN
                        INSERT INTO rankings (player_id, category, value) 
                        VALUES (NEW.id, 'money', NEW.balance)
                        ON CONFLICT (player_id, category) 
                        DO UPDATE SET value = NEW.balance, updated_at = CURRENT_TIMESTAMP;
                    END IF;
                    
                    -- Atualizar ranking de nível
                    IF NEW.level != OLD.level THEN
                        INSERT INTO rankings (player_id, category, value) 
                        VALUES (NEW.id, 'level', NEW.level)
                        ON CONFLICT (player_id, category) 
                        DO UPDATE SET value = NEW.level, updated_at = CURRENT_TIMESTAMP;
                    END IF;
                    
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `);

            // Criar trigger
            await this.sql.unsafe(`
                DROP TRIGGER IF EXISTS trigger_update_ranking ON players;
                CREATE TRIGGER trigger_update_ranking
                    AFTER UPDATE ON players
                    FOR EACH ROW
                    EXECUTE FUNCTION update_player_ranking();
            `);

            console.log('✅ Funções e triggers criados!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao criar funções:', error.message);
            return false;
        }
    }

    // Verificar status do banco
    async checkDatabaseStatus() {
        try {
            const tableCheck = await this.sql`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('players', 'rankings', 'transactions', 'game_sessions', 'multiplayer_rooms', 'room_participants')
            `;

            const playerCount = await this.sql`SELECT COUNT(*) as count FROM players`;
            const rankingCount = await this.sql`SELECT COUNT(*) as count FROM rankings`;

            console.log('📊 Status do banco de dados:');
            console.log(`   📋 Tabelas: ${tableCheck.length}/6`);
            console.log(`   👥 Jogadores: ${playerCount[0].count}`);
            console.log(`   🏆 Rankings: ${rankingCount[0].count}`);

            return {
                tables: tableCheck.length,
                players: parseInt(playerCount[0].count),
                rankings: parseInt(rankingCount[0].count)
            };
        } catch (error) {
            console.error('❌ Erro ao verificar status:', error.message);
            return null;
        }
    }

    // Configuração completa automática
    async setupComplete() {
        console.log('🚀 Iniciando configuração completa do banco de dados...\n');

        // 1. Testar conexão
        const connected = await this.testConnection();
        if (!connected) {
            console.log('❌ Não foi possível conectar. Verifique a DATABASE_URL.');
            return false;
        }

        // 2. Criar tabelas
        const tablesCreated = await this.createTables();
        if (!tablesCreated) return false;

        // 3. Criar índices
        const indexesCreated = await this.createIndexes();
        if (!indexesCreated) return false;

        // 4. Criar funções
        const functionsCreated = await this.createFunctions();
        if (!functionsCreated) return false;

        // 5. Inserir dados de exemplo
        const sampleDataInserted = await this.insertSampleData();
        if (!sampleDataInserted) return false;

        // 6. Verificar status final
        const status = await this.checkDatabaseStatus();
        
        console.log('\n🎉 CONFIGURAÇÃO COMPLETA FINALIZADA!');
        console.log('✅ Banco de dados está pronto para uso');
        console.log('✅ Todas as tabelas e índices criados');
        console.log('✅ Dados de exemplo inseridos');
        console.log('✅ Sistema multiplayer ativado');
        
        return true;
    }
}

module.exports = NeonDatabaseClient;

// Se executado diretamente
if (require.main === module) {
    const client = new NeonDatabaseClient();
    client.setupComplete().then(success => {
        if (success) {
            console.log('\n🔗 Próximo passo: Configure DATABASE_URL no Netlify');
            console.log('   👉 https://app.netlify.com/sites/mercadinhodocris/settings/env');
        }
        process.exit(success ? 0 : 1);
    });
}