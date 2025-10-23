# Variáveis de Ambiente Necessárias para o Netlify

## Para configurar no painel do Netlify:

### 1. Banco de Dados PostgreSQL
```
DATABASE_URL=postgresql://username:password@host:port/database
```

### 2. Configurações de Produção
```
NODE_ENV=production
```

### 3. Configurações de Segurança (opcional)
```
JWT_SECRET=sua_chave_secreta_aqui
CORS_ORIGIN=https://seu-dominio-netlify.app
```

## Como configurar no Netlify:

1. Acesse seu site no painel do Netlify
2. Vá para "Site settings" > "Environment variables"
3. Adicione cada variável acima com seus respectivos valores
4. Rebuild o site após adicionar as variáveis

## Banco de Dados Recomendado:

- **Neon**: https://neon.tech (PostgreSQL gratuito)
- **Supabase**: https://supabase.com (PostgreSQL com autenticação)
- **ElephantSQL**: https://www.elephantsql.com (PostgreSQL simples)

## Exemplo de DATABASE_URL para Neon:
```
postgresql://[usuário]:[senha]@[host]/[database]?sslmode=require
```

## Importante:
- As tabelas serão criadas automaticamente na primeira execução
- Mantenha suas credenciais seguras
- Use sempre SSL em produção