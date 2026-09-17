import { supabase } from '@/lib/supabase';
import type { ChargeListItem } from '@/features/charges/api';
import type { ContractDetail } from '@/features/contracts/api';

export interface DashboardCards {
  a_receber: number;
  em_atraso: number;
  vencendo_7_dias: number;
  entradas_mes: number;
  saidas_mes: number;
  resultado_mes: number;
  receita_recorrente_mensal: number;
  mensalidades_ativas: number;
  meses_em_aberto: number;
  cobrancas_atrasadas: number;
  projetos_andamento: number;
  clientes_ativos: number;
}

export interface DashboardMonth {
  mes: number;
  projetos_avulsos: number;
  mensalidades: number;
  outras_entradas: number;
  total_entradas: number;
  saidas: number;
  resultado: number;
  acumulado: number;
}

export interface DashboardCategoria {
  categoria: string;
  valor: number;
}

export interface DashboardData {
  cards: DashboardCards;
  meses: DashboardMonth[];
  saidas_por_categoria: DashboardCategoria[];
}

export async function getDashboard(year: number): Promise<DashboardData> {
  const { data, error } = await supabase.rpc('dashboard', { p_year: year });
  if (error) throw error;
  return data as unknown as DashboardData;
}

const CHARGE_COLUMNS =
  'id, project_id, project_name, client_id, client_name, contact_name, whatsapp, description, amount, due_date, paid_at, payment_method, status, dias_atraso';

export async function listOverdueCharges(): Promise<ChargeListItem[]> {
  const { data, error } = await supabase
    .from('v_charges')
    .select(CHARGE_COLUMNS)
    .eq('status', 'atrasado')
    .order('dias_atraso', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as ChargeListItem[];
}

export async function listContractsWithOpenMonths(): Promise<ContractDetail[]> {
  const { data, error } = await supabase
    .from('v_contracts')
    .select('*')
    .gt('meses_em_aberto', 0)
    .order('valor_em_aberto', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as ContractDetail[];
}
