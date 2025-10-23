# Deploy do Aprenda Brincando para Netlify

## 🚀 Seu site está pronto para ser atualizado!

### Opção 1: Deploy Automático via GitHub (Recomendado)

1. **Acesse o painel do Netlify**: https://app.netlify.com
2. **Encontre seu site**: `mercadinhodocris` ou `https://mercadinhodocris.netlify.app`
3. **Vá para "Site settings" > "Build & deploy"**
4. **Conecte ao repositório GitHub**: `cristiano-superacao/aprenda_brincando`
5. **Configure as seguintes opções**:
   - Base directory: (deixe em branco)
   - Build command: `echo 'Static site - no build needed'`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`

### Opção 2: Deploy Manual via CLI

Se preferir fazer upload manual:

```bash
# 1. Fazer login no Netlify
npx netlify login

# 2. Conectar ao site existente
npx netlify link --name mercadinhodocris

# 3. Fazer deploy
npx netlify deploy --prod --dir=public
```

### 🔧 Variáveis de Ambiente Necessárias

Configure no painel do Netlify (Site settings > Environment variables):

```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

**Recomendações de banco de dados gratuito:**
- **Neon**: https://neon.tech
- **Supabase**: https://supabase.com  
- **ElephantSQL**: https://www.elephantsql.com

### 📁 Estrutura do Deploy

✅ **Arquivos prontos para produção:**
- `public/` - Frontend completo
- `netlify/functions/` - API serverless
- `netlify.toml` - Configuração otimizada

✅ **Funcionalidades incluídas:**
- Sistema educativo multiplayer completo
- API REST para jogadores e rankings
- Sistema de quiz adaptativo por série
- Interface responsiva moderna
- Perfis de jogador com avatares

### 🎯 Após o Deploy

1. **Teste o site**: https://mercadinhodocris.netlify.app
2. **Configure o banco de dados** (ver variáveis acima)
3. **Teste as funcionalidades multiplayer**

### 📞 Suporte

Se encontrar algum problema:
1. Verifique os logs de build no painel do Netlify
2. Confirme se as variáveis de ambiente estão configuradas
3. Teste localmente primeiro com `npx http-server public`

---

**🎉 Seu sistema educativo está pronto para produção!**