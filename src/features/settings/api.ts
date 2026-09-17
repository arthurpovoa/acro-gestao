import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

export type Settings = Database['public']['Tables']['settings']['Row'];

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('settings').select('*').single();
  if (error) throw error;
  return data;
}
