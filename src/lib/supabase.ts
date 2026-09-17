import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Configuração do Supabase ausente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env (veja .env.example).',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
