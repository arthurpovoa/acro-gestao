# Acro Gestão

Aplicativo web para controle de clientes, projetos avulsos, contratos recorrentes
(mensalidades), cobranças e financeiro da Acro Web Design. Uso individual, mobile-first,
com tema claro/escuro e PWA instalável.

## Stack

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS
- React Router (rotas com `React.lazy`)
- TanStack Query
- Supabase (Postgres + Auth + RLS)
- react-hook-form + zod
- date-fns (fuso `America/Sao_Paulo`)
- Recharts (carregado sob demanda só no Painel)
- vite-plugin-pwa
- Vitest

## Rodando localmente

Pré-requisitos: Node 20+ e uma conta/projeto no [Supabase](https://supabase.com).

```bash
npm install
cp .env.example .env
```

Preencha o `.env` com os dados do seu projeto Supabase (Project Settings → API):

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Use sempre a chave `sb_publishable_...` (nunca a `service_role`/secreta) no frontend.

### Banco de dados

As migrações estão em `supabase/migrations/`. Com a [Supabase CLI](https://supabase.com/docs/guides/cli) instalada:

```bash
npx supabase login
npx supabase link --project-ref SEU-PROJECT-REF
npx supabase db push
```

O CLI vai pedir a senha do banco de dados do projeto — digite a sua senha diretamente
no prompt do terminal (ela não deve ser compartilhada ou colada em outro lugar).

Isso cria as tabelas, políticas de RLS, views (`v_charges`, `v_projects`, `v_contracts`,
`v_clients`, `contract_months`) e a função `dashboard(ano)` usadas pelo app. Cada tabela
tem RLS habilitado com política `user_id = auth.uid()`, e ao criar uma conta um registro
padrão de `settings` é criado automaticamente.

### Rodando o app

```bash
npm run dev
```

Acesse `http://localhost:5173`, crie uma conta (e-mail/senha) na tela de login e comece
a usar. Em Configurações há um botão para carregar dados de exemplo.

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # typecheck + build de produção em dist/
npm run preview    # serve o build de produção localmente
npm run lint        # oxlint
npm run test        # testes (Vitest)
```

## Testes

A lógica de negócio (status de cobranças e mensalidades, divisão de parcelas,
montagem de mensagens de WhatsApp) fica em `src/lib/` e é coberta por testes unitários:

```bash
npm run test
```

As mesmas regras de status também existem em SQL (nas views e na função `dashboard`),
então uma mudança de regra precisa ser replicada nos dois lugares.

## Deploy na Vercel

1. Suba o repositório para o GitHub (ou outro provedor suportado).
2. Na Vercel, "Add New Project" → importe o repositório. O preset "Vite" é detectado
   automaticamente (build command `npm run build`, output directory `dist`).
3. Em "Environment Variables", adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Deploy. O arquivo `vercel.json` já configura o rewrite de SPA (necessário para as
   rotas do React Router funcionarem em refresh/acesso direto a uma URL).
5. Rode as migrações do Supabase (`npx supabase db push`) apontando para o projeto de
   produção, se ainda não tiver feito.

## PWA

O app pode ser instalado como aplicativo (ícone na tela inicial, abre em tela cheia,
sem a barra de endereço do navegador):

- **Android/Chrome**: menu do navegador → "Instalar aplicativo" (ou o banner que
  aparece automaticamente).
- **iOS/Safari**: botão de compartilhar → "Adicionar à Tela de Início".

O service worker (gerado pelo `vite-plugin-pwa`) faz cache apenas dos arquivos estáticos
do app (HTML/CSS/JS/ícones) para abrir mais rápido; os dados sempre vêm do Supabase pela
rede, então o app precisa de conexão para carregar/salvar informações.
