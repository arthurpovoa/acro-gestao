import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

export type Contract = Database['public']['Tables']['recurring_contracts']['Row'];
export type ContractInsert = Database['public']['Tables']['recurring_contracts']['Insert'];
export type ContractUpdate = Database['public']['Tables']['recurring_contracts']['Update'];
export type ContractDetail = Database['public']['Views']['v_contracts']['Row'];

export type ContractMonthRow = Database['public']['Functions']['contract_months']['Returns'][number];

export async function listContracts(): Promise<ContractDetail[]> {
  const { data, error } = await supabase.from('v_contracts').select('*').order('client_name');
  if (error) throw error;
  return (data ?? []) as ContractDetail[];
}

export async function getContractMonths(year: number): Promise<ContractMonthRow[]> {
  const { data, error } = await supabase.rpc('contract_months', { p_year: year });
  if (error) throw error;
  return data ?? [];
}

export async function createContract(
  input: Omit<ContractInsert, 'user_id'>,
  userId: string,
): Promise<Contract> {
  const { data, error } = await supabase
    .from('recurring_contracts')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContract(id: string, input: ContractUpdate): Promise<Contract> {
  const { data, error } = await supabase
    .from('recurring_contracts')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContract(id: string): Promise<void> {
  const { error } = await supabase.from('recurring_contracts').delete().eq('id', id);
  if (error) throw error;
}

export type RecurringPayment = Database['public']['Tables']['recurring_payments']['Row'];
export type RecurringPaymentInsert = Database['public']['Tables']['recurring_payments']['Insert'];
export type RecurringPaymentUpdate = Database['public']['Tables']['recurring_payments']['Update'];

export async function listPaymentsForMonth(
  contractId: string,
  referenceMonth: string,
): Promise<RecurringPayment[]> {
  const { data, error } = await supabase
    .from('recurring_payments')
    .select('*')
    .eq('contract_id', contractId)
    .eq('reference_month', referenceMonth)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function createPayment(
  input: Omit<RecurringPaymentInsert, 'user_id'>,
  userId: string,
): Promise<RecurringPayment> {
  const { data, error } = await supabase
    .from('recurring_payments')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePayment(id: string, input: RecurringPaymentUpdate): Promise<RecurringPayment> {
  const { data, error } = await supabase
    .from('recurring_payments')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from('recurring_payments').delete().eq('id', id);
  if (error) throw error;
}
