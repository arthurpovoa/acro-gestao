import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { ProjectStatus } from './projectStatus';

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type ProjectDetail = Database['public']['Views']['v_projects']['Row'];

export const PROJECTS_PAGE_SIZE = 25;

export interface ListProjectsParams {
  page: number;
  search?: string;
  status?: ProjectStatus | 'todos';
}

export interface ProjectListItem {
  id: string;
  name: string;
  client_name: string | null;
  status: string | null;
  total_lancado: number | null;
  total_recebido: number | null;
  percentual_recebido: number | null;
}

export interface ListProjectsResult {
  items: ProjectListItem[];
  total: number;
}

export async function listProjects({ page, search, status }: ListProjectsParams): Promise<ListProjectsResult> {
  let query = supabase
    .from('v_projects')
    .select('id, name, client_name, status, total_lancado, total_recebido, percentual_recebido', {
      count: 'exact',
    })
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (status && status !== 'todos') {
    query = query.eq('status', status);
  }

  const from = (page - 1) * PROJECTS_PAGE_SIZE;
  const to = from + PROJECTS_PAGE_SIZE - 1;

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: (data ?? []) as ProjectListItem[], total: count ?? 0 };
}

export interface ProjectOption {
  id: string;
  name: string;
  client_name: string | null;
}

/** Lista enxuta para preencher o select de projeto no formulário de cobranças. */
export async function listProjectsForSelect(): Promise<ProjectOption[]> {
  const { data, error } = await supabase
    .from('v_projects')
    .select('id, name, client_name')
    .order('name')
    .limit(500);
  if (error) throw error;
  return (data ?? []) as ProjectOption[];
}

export async function getProject(id: string): Promise<ProjectDetail> {
  const { data, error } = await supabase.from('v_projects').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createProject(
  input: Omit<ProjectInsert, 'user_id'>,
  userId: string,
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, input: ProjectUpdate): Promise<Project> {
  const { data, error } = await supabase.from('projects').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}
