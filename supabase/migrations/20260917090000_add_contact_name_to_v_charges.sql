-- v_charges precisa do nome do responsável (contact_name) para montar a
-- saudação das mensagens de cobrança no WhatsApp ({nome} do modelo).
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
    then (current_date - ch.due_date) else null end as dias_atraso,
  cl.contact_name
from public.charges ch
join public.projects p on p.id = ch.project_id
join public.clients cl on cl.id = p.client_id;

grant select on public.v_charges to authenticated;
