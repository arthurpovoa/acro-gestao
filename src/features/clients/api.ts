import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { ClientStatus } from './clientStatus';

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];
export type ClientDetail = Database['public']['Views']['v_clients']['Row'];

export const CLIENTS_PAGE_SIZE = 25;

export interface ListClientsParams {
  page: number;
  search?: string;
  status?: ClientStatus | 'todos';
}

export interface ListClientsResult {
  items: Array<Pick<Client, 'id' | 'name' | 'contact_name' | 'whatsapp' | 'city' | 'status'>>;
  total: number;
}

export async function listClients({ page, search, status }: ListClientsParams): Promise<ListClientsResult> {
  let query = supabase
    .from('clients')
    .select('id, name, contact_name, whatsapp, city, status', { count: 'exact' })
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (status && status !== 'todos') {
    query = query.eq('status', status);
  }

  const from = (page - 1) * CLIENTS_PAGE_SIZE;
  const to = from + CLIENTS_PAGE_SIZE - 1;

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data ?? [], total: count ?? 0 };
}

export async function getClient(id: string): Promise<ClientDetail> {
  const { data, error } = await supabase.from('v_clients').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createClient(
  input: Omit<ClientInsert, 'user_id'>,
  userId: string,
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, input: ClientUpdate): Promise<Client> {
  const { data, error } = await supabase.from('clients').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

/** Lança o erro do Postgres (código 23503) quando há vínculos — o chamador decide como tratar. */
export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}

export interface ClientProjectRow {
  id: string;
  name: string;
  status: string;
  billing_type: string;
  amount: number | null;
}

export async function listClientProjects(clientId: string): Promise<ClientProjectRow[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status, billing_type, amount')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface ClientContractRow {
  id: string;
  service: string | null;
  monthly_amount: number;
  due_day: number;
  start_date: string;
  end_date: string | null;
}

export async function listClientContracts(clientId: string): Promise<ClientContractRow[]> {
  const { data, error } = await supabase
    .from('recurring_contracts')
    .select('id, service, monthly_amount, due_day, start_date, end_date')
    .eq('client_id', clientId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface ClientChargeRow {
  id: string;
  description: string | null;
  amount: number;
  due_date: string | null;
  paid_at: string | null;
  status: string | null;
  project_name: string | null;
}

export async function listClientCharges(clientId: string): Promise<ClientChargeRow[]> {
  const { data, error } = await supabase
    .from('v_charges')
    .select('id, description, amount, due_date, paid_at, status, project_name')
    .eq('client_id', clientId)
    .order('due_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClientChargeRow[];
}

export interface ClientPaymentRow {
  id: string;
  amount: number;
  paid_at: string | null;
  reference_month: string;
  service: string | null;
}

export async function listClientPayments(clientId: string): Promise<ClientPaymentRow[]> {
  const { data: contracts, error: contractsError } = await supabase
    .from('recurring_contracts')
    .select('id, service')
    .eq('client_id', clientId);
  if (contractsError) throw contractsError;

  const contractIds = (contracts ?? []).map((c) => c.id);
  if (contractIds.length === 0) return [];

  const { data, error } = await supabase
    .from('recurring_payments')
    .select('id, amount, paid_at, reference_month, contract_id')
    .in('contract_id', contractIds)
    .order('reference_month', { ascending: false });
  if (error) throw error;

  const serviceByContract = new Map((contracts ?? []).map((c) => [c.id, c.service]));
  return (data ?? []).map((payment) => ({
    id: payment.id,
    amount: payment.amount,
    paid_at: payment.paid_at,
    reference_month: payment.reference_month,
    service: serviceByContract.get(payment.contract_id) ?? null,
  }));
}
