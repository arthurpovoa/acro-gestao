import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

export type Settings = Database['public']['Tables']['settings']['Row'];
export type SettingsUpdate = Database['public']['Tables']['settings']['Update'];

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('settings').select('*').single();
  if (error) throw error;
  return data;
}

export async function updateSettings(userId: string, input: SettingsUpdate): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .update(input)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}
