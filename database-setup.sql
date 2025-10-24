-- Schema completo do banco de dados para o Aprenda Brincando
-- Execute este script no seu banco PostgreSQL (Neon, Supabase, etc.)

-- Tabela de jogadores
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
);

-- Tabela de rankings
CREATE TABLE IF NOT EXISTS rankings (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    value DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, category)
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões de jogo
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
);

-- Tabela de salas multiplayer
CREATE TABLE IF NOT EXISTS multiplayer_rooms (
    id VARCHAR(10) PRIMARY KEY,
    host_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    name VARCHAR(100),
    max_players INTEGER DEFAULT 4,
    current_players INTEGER DEFAULT 1,
    grade_filter VARCHAR(20),
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, playing, finished
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);

-- Tabela de participantes das salas
CREATE TABLE IF NOT EXISTS room_participants (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(10) REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    is_ready BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, player_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_grade ON players(grade);
CREATE INDEX IF NOT EXISTS idx_players_level ON players(level);
CREATE INDEX IF NOT EXISTS idx_rankings_category ON rankings(category);
CREATE INDEX IF NOT EXISTS idx_rankings_value ON rankings(value DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_player_category ON rankings(player_id, category);
CREATE INDEX IF NOT EXISTS idx_transactions_player_id ON transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_type ON game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_status ON multiplayer_rooms(status);
CREATE INDEX IF NOT EXISTS idx_multiplayer_rooms_grade ON multiplayer_rooms(grade_filter);
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_player ON room_participants(player_id);

-- Inserir dados de exemplo (opcional)
INSERT INTO players (name, age, grade, avatar, balance, experience, level) VALUES
('Ana Silva', 8, '3º Ano', 'student1', 75.50, 150, 2),
('João Santos', 10, '5º Ano', 'student2', 125.00, 300, 3),
('Maria Oliveira', 7, '2º Ano', 'student3', 60.25, 100, 1),
('Pedro Costa', 12, '7º Ano', 'student4', 200.00, 450, 4)
ON CONFLICT DO NOTHING;

-- Inserir rankings iniciais
INSERT INTO rankings (player_id, category, value) 
SELECT id, 'money', balance FROM players 
ON CONFLICT (player_id, category) DO NOTHING;

INSERT INTO rankings (player_id, category, value) 
SELECT id, 'level', level FROM players 
ON CONFLICT (player_id, category) DO NOTHING;

INSERT INTO rankings (player_id, category, value) 
SELECT id, 'investments', 0.00 FROM players 
ON CONFLICT (player_id, category) DO NOTHING;

-- Função para atualizar ranking automaticamente
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

-- Trigger para atualizar rankings automaticamente
DROP TRIGGER IF EXISTS trigger_update_ranking ON players;
CREATE TRIGGER trigger_update_ranking
    AFTER UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_player_ranking();

-- Conceder permissões (ajuste conforme necessário)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- Verificação final
SELECT 'Banco de dados configurado com sucesso!' as status;
SELECT 'Tabelas criadas: ' || count(*) as tabelas_criadas 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('players', 'rankings', 'transactions', 'game_sessions', 'multiplayer_rooms', 'room_participants');