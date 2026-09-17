import { supabase } from '@/lib/supabase';
import { createClient as createClientRow } from '@/features/clients/api';
import { createProject } from '@/features/projects/api';
import { createCharges } from '@/features/charges/api';
import { createContract } from '@/features/contracts/api';
import { todayISO } from '@/lib/dates';

export const SAMPLE_CLIENT_NAME = 'Cliente Exemplo Ltda';

async function findSampleClientId(): Promise<string | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('id')
    .eq('name', SAMPLE_CLIENT_NAME)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function hasSampleData(): Promise<boolean> {
  return (await findSampleClientId()) !== null;
}

export async function loadSampleData(userId: string): Promise<void> {
  const existingId = await findSampleClientId();
  if (existingId) return;

  const client = await createClientRow(
    { name: SAMPLE_CLIENT_NAME, contact_name: 'Maria', status: 'ativo' },
    userId,
  );

  const project = await createProject(
    {
      client_id: client.id,
      name: 'Site Exemplo',
      billing_type: 'parcelado',
      amount: 1500,
      status: 'andamento',
    },
    userId,
  );

  await createCharges(
    [
      { project_id: project.id, description: 'Parcela 1/2', amount: 750, due_date: todayISO(), paid_at: todayISO() },
      { project_id: project.id, description: 'Parcela 2/2', amount: 750, due_date: null },
    ],
    userId,
  );

  await createContract(
    {
      client_id: client.id,
      service: 'SEO local',
      monthly_amount: 300,
      due_day: 10,
      start_date: todayISO(),
    },
    userId,
  );
}

export async function clearSampleData(): Promise<void> {
  const clientId = await findSampleClientId();
  if (!clientId) return;

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id')
    .eq('client_id', clientId);
  if (projectsError) throw projectsError;
  for (const project of projects ?? []) {
    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) throw error;
  }

  const { data: contracts, error: contractsError } = await supabase
    .from('recurring_contracts')
    .select('id')
    .eq('client_id', clientId);
  if (contractsError) throw contractsError;
  for (const contract of contracts ?? []) {
    const { error } = await supabase.from('recurring_contracts').delete().eq('id', contract.id);
    if (error) throw error;
  }

  const { error: clientError } = await supabase.from('clients').delete().eq('id', clientId);
  if (clientError) throw clientError;
}
