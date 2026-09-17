-- Excluir um projeto ou contrato deve excluir suas cobranças/pagamentos
-- junto (são registros que só existem no contexto do pai — diferente de
-- excluir um cliente, que tem vínculos com valor próprio e por isso é
-- bloqueado em vez de cascatear). Sem isso, excluir um projeto/contrato
-- com cobranças/pagamentos já lançados falhava com erro de FK (23503).
alter table public.charges
  drop constraint charges_project_id_fkey,
  add constraint charges_project_id_fkey
    foreign key (project_id) references public.projects(id) on delete cascade;

alter table public.recurring_payments
  drop constraint recurring_payments_contract_id_fkey,
  add constraint recurring_payments_contract_id_fkey
    foreign key (contract_id) references public.recurring_contracts(id) on delete cascade;
