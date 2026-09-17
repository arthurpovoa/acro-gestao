-- ===== Helper: data de vencimento do mês (due_day ajustado ao mês) =====
create or replace function public.f_month_due_date(p_year int, p_month int, p_due_day int)
returns date
language sql
immutable
as $$
  select make_date(p_year, p_month,
    least(p_due_day, extract(day from
      (make_date(p_year, p_month, 1) + interval '1 month - 1 day'))::int)
  );
$$;

-- ===== Helper: status de um mês de contrato =====
create or replace function public.f_contract_month_status(
  p_start_date date, p_end_date date, p_monthly_amount numeric,
  p_valor_pago numeric, p_due_date date
) returns text
language sql
immutable
as $$
  select case
    when date_trunc('month', p_due_date)::date < date_trunc('month', p_start_date)::date
      or (p_end_date is not null and date_trunc('month', p_due_date)::date > date_trunc('month', p_end_date)::date)
      then 'fora_do_contrato'
    when p_valor_pago >= p_monthly_amount then 'pago'
    when p_valor_pago > 0 then 'parcial'
    when p_due_date < current_date then 'vencido'
    else 'futuro'
  end;
$$;

-- ===== RPC: contract_months(ano) — grade de mensalidades =====
create or replace function public.contract_months(p_year int)
returns table (
  contract_id uuid, month int, reference_month date,
  due_date date, valor_pago numeric(12,2), status text
)
language sql
stable
as $$
  select
    c.id, m.month, make_date(p_year, m.month, 1),
    public.f_month_due_date(p_year, m.month, c.due_day),
    coalesce(rp.total_pago, 0),
    public.f_contract_month_status(
      c.start_date, c.end_date, c.monthly_amount,
      coalesce(rp.total_pago, 0),
      public.f_month_due_date(p_year, m.month, c.due_day)
    )
  from public.recurring_contracts c
  cross join generate_series(1,12) as m(month)
  left join (
    select contract_id, reference_month, sum(amount) as total_pago
    from public.recurring_payments
    group by contract_id, reference_month
  ) rp on rp.contract_id = c.id and rp.reference_month = make_date(p_year, m.month, 1);
$$;

-- ===== Helper: meses em aberto + valor em aberto de UM contrato (todo o histórico) =====
create or replace function public.f_contract_aberto(p_contract_id uuid)
returns table (meses_em_aberto int, valor_em_aberto numeric(12,2))
language sql
stable
as $$
  with c as (select * from public.recurring_contracts where id = p_contract_id),
  meses as (
    select gs::date as mes_inicio
    from c, generate_series(
      date_trunc('month', c.start_date),
      date_trunc('month', least(current_date, coalesce(c.end_date, current_date))),
      interval '1 month'
    ) as gs
  ),
  detalhado as (
    select
      public.f_month_due_date(extract(year from m.mes_inicio)::int, extract(month from m.mes_inicio)::int, c.due_day) as due_date,
      coalesce((select sum(rp.amount) from public.recurring_payments rp
                where rp.contract_id = c.id and rp.reference_month = m.mes_inicio), 0) as valor_pago,
      c.monthly_amount
    from meses m, c
  )
  select
    count(*) filter (where due_date < current_date and valor_pago < monthly_amount)::int,
    coalesce(sum(monthly_amount - valor_pago) filter (where due_date < current_date and valor_pago < monthly_amount), 0)
  from detalhado;
$$;

-- ===== v_charges =====
create or replace view public.v_charges
with (security_invoker = true) as
select
  ch.id, ch.user_id, ch.project_id, p.name as project_name,
  p.client_id, cl.name as client_name, cl.whatsapp,
  ch.description, ch.amount, ch.due_date, ch.paid_at, ch.payment_method,
  case
    when ch.paid_at is not null then 'pago'
    when ch.due_date is null then 'sem_vencimento'
    when ch.due_date < current_date then 'atrasado'
    when ch.due_date <= current_date + 7 then 'vence_em_7_dias'
    else 'a_vencer'
  end as status,
  case when ch.paid_at is null and ch.due_date is not null and ch.due_date < current_date
    then (current_date - ch.due_date) else null end as dias_atraso
from public.charges ch
join public.projects p on p.id = ch.project_id
join public.clients cl on cl.id = p.client_id;

-- ===== v_project_totals (helper reutilizado por v_projects e v_clients) =====
create or replace view public.v_project_totals
with (security_invoker = true) as
select project_id,
  coalesce(sum(amount), 0) as total_lancado,
  coalesce(sum(amount) filter (where paid_at is not null), 0) as total_recebido
from public.charges
group by project_id;

-- ===== v_projects =====
create or replace view public.v_projects
with (security_invoker = true) as
select
  p.id, p.user_id, p.client_id, cl.name as client_name,
  p.name, p.service, p.billing_type, p.amount, p.start_date, p.due_date, p.status, p.notes,
  coalesce(t.total_lancado, 0) as total_lancado,
  coalesce(t.total_recebido, 0) as total_recebido,
  coalesce(t.total_lancado, 0) - coalesce(t.total_recebido, 0) as saldo,
  case when coalesce(t.total_lancado,0) > 0
    then round(coalesce(t.total_recebido,0) / t.total_lancado * 100, 1) else 0 end as percentual_recebido
from public.projects p
join public.clients cl on cl.id = p.client_id
left join public.v_project_totals t on t.project_id = p.id;

-- ===== v_contract_totals (helper) =====
create or replace view public.v_contract_totals
with (security_invoker = true) as
select contract_id, coalesce(sum(amount), 0) as recebido_total
from public.recurring_payments
group by contract_id;

-- ===== v_contracts =====
create or replace view public.v_contracts
with (security_invoker = true) as
select
  rc.id, rc.user_id, rc.client_id, cl.name as client_name, cl.whatsapp,
  rc.service, rc.monthly_amount, rc.due_day, rc.start_date, rc.end_date,
  case
    when rc.end_date is not null and rc.end_date < current_date then 'encerrado'
    when rc.start_date > current_date then 'a_iniciar'
    else 'ativo'
  end as situacao,
  coalesce(ct.recebido_total, 0) as recebido_total,
  ab.meses_em_aberto,
  ab.valor_em_aberto
from public.recurring_contracts rc
join public.clients cl on cl.id = rc.client_id
left join public.v_contract_totals ct on ct.contract_id = rc.id
cross join lateral public.f_contract_aberto(rc.id) ab;

-- ===== v_clients =====
create or replace view public.v_clients
with (security_invoker = true) as
select
  cl.id, cl.user_id, cl.name, cl.contact_name, cl.whatsapp, cl.email,
  cl.city, cl.source, cl.joined_at, cl.status, cl.notes,
  coalesce(pj.qtd_projetos, 0) as qtd_projetos_avulsos,
  coalesce(ct.mensalidade_ativa, false) as mensalidade_ativa,
  coalesce(pj.recebido_projetos, 0) + coalesce(ct.recebido_contratos, 0) as recebido_total,
  coalesce(pj.em_aberto_projetos, 0) + coalesce(ct.em_aberto_contratos, 0) as em_aberto
from public.clients cl
left join (
  select p.client_id,
    count(*) as qtd_projetos,
    sum(coalesce(t.total_recebido,0)) as recebido_projetos,
    sum(greatest(coalesce(t.total_lancado,0) - coalesce(t.total_recebido,0), 0)) as em_aberto_projetos
  from public.projects p
  left join public.v_project_totals t on t.project_id = p.id
  group by p.client_id
) pj on pj.client_id = cl.id
left join (
  select rc.client_id,
    bool_or(rc.end_date is null or rc.end_date >= current_date) as mensalidade_ativa,
    sum(coalesce(ct.recebido_total,0)) as recebido_contratos,
    sum(coalesce(ab.valor_em_aberto,0)) as em_aberto_contratos
  from public.recurring_contracts rc
  left join public.v_contract_totals ct on ct.contract_id = rc.id
  cross join lateral public.f_contract_aberto(rc.id) ab
  group by rc.client_id
) ct on ct.client_id = cl.id;

-- ===== dashboard(ano) =====
create or replace function public.dashboard(p_year int)
returns jsonb
language sql
stable
as $$
  with meses as (select generate_series(1,12) as mes),
  mensal as (
    select
      m.mes,
      coalesce((select sum(amount) from public.charges
        where paid_at is not null and extract(year from paid_at) = p_year and extract(month from paid_at) = m.mes), 0) as projetos_avulsos,
      coalesce((select sum(amount) from public.recurring_payments
        where extract(year from reference_month) = p_year and extract(month from reference_month) = m.mes), 0) as mensalidades,
      coalesce((select sum(amount) from public.transactions
        where type = 'entrada' and extract(year from date) = p_year and extract(month from date) = m.mes), 0) as outras_entradas,
      coalesce((select sum(amount) from public.transactions
        where type = 'saida' and extract(year from date) = p_year and extract(month from date) = m.mes), 0) as saidas
    from meses m
  ),
  mensal_calc as (
    select mes, projetos_avulsos, mensalidades, outras_entradas,
      (projetos_avulsos + mensalidades + outras_entradas) as total_entradas,
      saidas,
      (projetos_avulsos + mensalidades + outras_entradas - saidas) as resultado
    from mensal
  ),
  mensal_acumulado as (
    select *, sum(resultado) over (order by mes) as acumulado
    from mensal_calc
  ),
  categorias as (
    select coalesce(category, 'Sem categoria') as categoria, sum(amount) as valor
    from public.transactions
    where type = 'saida' and extract(year from date) = p_year
    group by coalesce(category, 'Sem categoria')
    order by valor desc
  ),
  aberto_contratos as (
    select coalesce(sum(ab.meses_em_aberto), 0) as meses_em_aberto,
      coalesce(sum(ab.valor_em_aberto), 0) as valor_em_aberto
    from public.recurring_contracts rc
    cross join lateral public.f_contract_aberto(rc.id) ab
  ),
  cards as (
    select jsonb_build_object(
      'a_receber', coalesce((select sum(amount) from public.charges where paid_at is null), 0),
      'em_atraso', coalesce((select sum(amount) from public.charges where paid_at is null and due_date < current_date), 0)
                   + (select valor_em_aberto from aberto_contratos),
      'vencendo_7_dias', coalesce((select sum(amount) from public.charges
                          where paid_at is null and due_date between current_date and current_date + 7), 0),
      'entradas_mes', coalesce((select sum(amount) from public.charges
                          where paid_at is not null and date_trunc('month', paid_at) = date_trunc('month', current_date)), 0)
                       + coalesce((select sum(amount) from public.recurring_payments
                          where date_trunc('month', reference_month) = date_trunc('month', current_date)), 0)
                       + coalesce((select sum(amount) from public.transactions
                          where type = 'entrada' and date_trunc('month', date) = date_trunc('month', current_date)), 0),
      'saidas_mes', coalesce((select sum(amount) from public.transactions
                          where type = 'saida' and date_trunc('month', date) = date_trunc('month', current_date)), 0),
      'receita_recorrente_mensal', coalesce((select sum(monthly_amount) from public.recurring_contracts
                          where start_date <= current_date and (end_date is null or end_date >= current_date)), 0),
      'mensalidades_ativas', coalesce((select count(*) from public.recurring_contracts
                          where start_date <= current_date and (end_date is null or end_date >= current_date)), 0),
      'meses_em_aberto', (select meses_em_aberto from aberto_contratos),
      'cobrancas_atrasadas', coalesce((select count(*) from public.charges where paid_at is null and due_date < current_date), 0),
      'projetos_andamento', coalesce((select count(*) from public.projects where status = 'andamento'), 0),
      'clientes_ativos', coalesce((select count(*) from public.clients where status = 'ativo'), 0)
    ) as obj
  )
  select jsonb_build_object(
    'cards', (select obj from cards) ||
      jsonb_build_object(
        'resultado_mes',
        ((select obj from cards) ->> 'entradas_mes')::numeric - ((select obj from cards) ->> 'saidas_mes')::numeric
      ),
    'meses', (select jsonb_agg(to_jsonb(mensal_acumulado) order by mes) from mensal_acumulado),
    'saidas_por_categoria', (select coalesce(jsonb_agg(to_jsonb(categorias)), '[]'::jsonb) from categorias)
  );
$$;

-- Permissões (Supabase expõe automaticamente via PostgREST; grants explícitos por clareza)
grant select on public.v_charges to authenticated;
grant select on public.v_projects to authenticated;
grant select on public.v_contracts to authenticated;
grant select on public.v_clients to authenticated;
grant execute on function public.contract_months(int) to authenticated;
grant execute on function public.dashboard(int) to authenticated;
