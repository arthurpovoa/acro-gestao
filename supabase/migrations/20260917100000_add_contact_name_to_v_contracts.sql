-- v_contracts também precisa do nome do responsável (contact_name) para a
-- saudação da mensagem de mensalidade no WhatsApp ({nome} do modelo).
-- Coluna adicionada no final da lista (Postgres não permite reordenar
-- colunas de uma view existente com CREATE OR REPLACE VIEW).
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
  ab.valor_em_aberto,
  cl.contact_name
from public.recurring_contracts rc
join public.clients cl on cl.id = rc.client_id
left join public.v_contract_totals ct on ct.contract_id = rc.id
cross join lateral public.f_contract_aberto(rc.id) ab;

grant select on public.v_contracts to authenticated;
