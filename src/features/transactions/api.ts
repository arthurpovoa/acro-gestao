import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { TransactionType } from './transactionStatus';

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export const TRANSACTIONS_PAGE_SIZE = 25;

export interface ListTransactionsParams {
  page: number;
  month?: string; // yyyy-MM, undefined = todos os meses
  type?: TransactionType | 'todos';
  category?: string;
  search?: string;
}

export interface ListTransactionsResult {
  items: Transaction[];
  total: number;
}

const TRANSACTION_COLUMNS = 'id, date, type, category, description, amount, payment_method';

export async function listTransactions({
  page,
  month,
  type,
  category,
  search,
}: ListTransactionsParams): Promise<ListTransactionsResult> {
  let query = supabase
    .from('transactions')
    .select(TRANSACTION_COLUMNS, { count: 'exact' })
    .order('date', { ascending: false });

  if (month) {
    const [year, monthNumber] = month.split('-').map(Number) as [number, number];
    const from = `${month}-01`;
    const lastDay = new Date(year, monthNumber, 0).getDate();
    const to = `${month}-${String(lastDay).padStart(2, '0')}`;
    query = query.gte('date', from).lte('date', to);
  }
  if (type && type !== 'todos') {
    query = query.eq('type', type);
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (search) {
    query = query.ilike('description', `%${search}%`);
  }

  const from = (page - 1) * TRANSACTIONS_PAGE_SIZE;
  const to = from + TRANSACTIONS_PAGE_SIZE - 1;

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: (data ?? []) as Transaction[], total: count ?? 0 };
}

export async function listDistinctCategories(): Promise<string[]> {
  const { data, error } = await supabase.from('transactions').select('category').not('category', 'is', null);
  if (error) throw error;
  const unique = new Set((data ?? []).map((row) => row.category as string).filter(Boolean));
  return Array.from(unique).sort();
}

export async function createTransaction(
  input: Omit<TransactionInsert, 'user_id'>,
  userId: string,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(id: string, input: TransactionUpdate): Promise<Transaction> {
  const { data, error } = await supabase.from('transactions').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}
