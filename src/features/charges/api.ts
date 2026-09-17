import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { ChargeStatus } from '@/lib/status';

export type Charge = Database['public']['Tables']['charges']['Row'];
export type ChargeInsert = Database['public']['Tables']['charges']['Insert'];
export type ChargeUpdate = Database['public']['Tables']['charges']['Update'];

export const CHARGES_PAGE_SIZE = 25;

export interface ChargeListItem {
  id: string;
  project_id: string | null;
  project_name: string | null;
  client_id: string | null;
  client_name: string | null;
  contact_name: string | null;
  whatsapp: string | null;
  description: string | null;
  amount: number | null;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  status: string | null;
  dias_atraso: number | null;
}

export interface ListChargesParams {
  page: number;
  search?: string;
  status?: ChargeStatus | 'todos';
  projectId?: string;
}

export interface ListChargesResult {
  items: ChargeListItem[];
  total: number;
}

const CHARGE_COLUMNS =
  'id, project_id, project_name, client_id, client_name, contact_name, whatsapp, description, amount, due_date, paid_at, payment_method, status, dias_atraso';

export async function listCharges({ page, search, status, projectId }: ListChargesParams): Promise<ListChargesResult> {
  let query = supabase
    .from('v_charges')
    .select(CHARGE_COLUMNS, { count: 'exact' })
    .order('due_date', { ascending: true, nullsFirst: false });

  if (search) {
    query = query.or(
      `description.ilike.%${search}%,project_name.ilike.%${search}%,client_name.ilike.%${search}%`,
    );
  }
  if (status && status !== 'todos') {
    query = query.eq('status', status);
  }
  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const from = (page - 1) * CHARGES_PAGE_SIZE;
  const to = from + CHARGES_PAGE_SIZE - 1;

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: (data ?? []) as ChargeListItem[], total: count ?? 0 };
}

export async function listChargesByProject(projectId: string): Promise<ChargeListItem[]> {
  const { data, error } = await supabase
    .from('v_charges')
    .select(CHARGE_COLUMNS)
    .eq('project_id', projectId)
    .order('due_date', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as ChargeListItem[];
}

export async function createCharge(input: Omit<ChargeInsert, 'user_id'>, userId: string): Promise<Charge> {
  const { data, error } = await supabase
    .from('charges')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createCharges(
  inputs: Array<Omit<ChargeInsert, 'user_id'>>,
  userId: string,
): Promise<Charge[]> {
  const { data, error } = await supabase
    .from('charges')
    .insert(inputs.map((input) => ({ ...input, user_id: userId })))
    .select();
  if (error) throw error;
  return data ?? [];
}

export async function updateCharge(id: string, input: ChargeUpdate): Promise<Charge> {
  const { data, error } = await supabase.from('charges').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCharge(id: string): Promise<void> {
  const { error } = await supabase.from('charges').delete().eq('id', id);
  if (error) throw error;
}
