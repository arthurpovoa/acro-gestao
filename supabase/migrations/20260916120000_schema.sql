-- Extensão para gen_random_uuid()
create extension if not exists pgcrypto;

-- ============ CLIENTS ============
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name text not null,
  contact_name text,
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]*$'),
  email text,
  city text,
  source text,
  joined_at date,
  status text not null default 'ativo' check (status in ('ativo','prospect','inativo')),
  notes text,
  created_at timestamptz not null default now()
);

-- ============ PROJECTS ============
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  client_id uuid not null references public.clients(id),
  name text not null,
  service text,
  billing_type text not null check (billing_type in ('unico','parcelado')),
  amount numeric(12,2),
  start_date date,
  due_date date,
  status text not null default 'orcamento'
    check (status in ('orcamento','andamento','aguardando','entregue','cancelado')),
  notes text,
  created_at timestamptz not null default now()
);

-- ============ CHARGES ============
create table public.charges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  project_id uuid not null references public.projects(id),
  description text,
  amount numeric(12,2) not null,
  due_date date,
  paid_at date,
  payment_method text,
  created_at timestamptz not null default now()
);

-- ============ RECURRING_CONTRACTS ============
create table public.recurring_contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  client_id uuid not null references public.clients(id),
  service text,
  monthly_amount numeric(12,2) not null,
  due_day int not null check (due_day between 1 and 31),
  start_date date not null,
  end_date date,
  notes text,
  created_at timestamptz not null default now()
);

-- ============ RECURRING_PAYMENTS ============
create table public.recurring_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  contract_id uuid not null references public.recurring_contracts(id),
  reference_month date not null check (extract(day from reference_month) = 1),
  amount numeric(12,2) not null,
  paid_at date,
  payment_method text,
  created_at timestamptz not null default now()
);

-- ============ TRANSACTIONS (financeiro manual) ============
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  date date not null,
  type text not null check (type in ('entrada','saida')),
  category text,
  description text,
  amount numeric(12,2) not null,
  payment_method text,
  notes text,
  created_at timestamptz not null default now()
);

-- ============ SETTINGS (uma linha por usuário) ============
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id),
  servicos_avulsos jsonb not null default '[]',
  servicos_recorrentes jsonb not null default '[]',
  categorias jsonb not null default '[]',
  formas_pagamento jsonb not null default '[]',
  msg_avulso_a_vencer text not null default
    'Olá {nome}, tudo bem? Passando para lembrar do pagamento de R$ {valor} referente a {descricao}, com vencimento em {vencimento}. Qualquer dúvida, estou à disposição!',
  msg_avulso_atrasado text not null default
    'Olá {nome}, tudo bem? Notei que o pagamento de R$ {valor} referente a {descricao}, que venceu em {vencimento}, ainda está em aberto. Consegue verificar para mim? Obrigado!',
  msg_mensalidade text not null default
    'Olá {nome}, tudo bem? Consta em aberto {meses} mensalidade(s) de {servico}, no total de R$ {valor}. Consegue verificar para mim? Obrigado!',
  created_at timestamptz not null default now()
);

-- ============ ÍNDICES ============
create index on public.clients (user_id);

create index on public.projects (user_id);
create index on public.projects (client_id);

create index on public.charges (user_id);
create index on public.charges (project_id);
create index on public.charges (due_date);
create index on public.charges (paid_at);

create index on public.recurring_contracts (user_id);
create index on public.recurring_contracts (client_id);

create index on public.recurring_payments (user_id);
create index on public.recurring_payments (contract_id);
create index on public.recurring_payments (reference_month);
create index on public.recurring_payments (paid_at);

create index on public.transactions (user_id);
create index on public.transactions (date);

create index on public.settings (user_id);

-- ============ RLS ============
do $$
declare t text;
begin
  foreach t in array array[
    'clients','projects','charges','recurring_contracts',
    'recurring_payments','transactions','settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "%1$s_select_own" on public.%1$I for select using (user_id = auth.uid())', t);
    execute format('create policy "%1$s_insert_own" on public.%1$I for insert with check (user_id = auth.uid())', t);
    execute format('create policy "%1$s_update_own" on public.%1$I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('create policy "%1$s_delete_own" on public.%1$I for delete using (user_id = auth.uid())', t);
  end loop;
end $$;

-- ============ Trigger: settings padrão ao criar usuário ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
