import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/AuthProvider';
import * as api from './api';
import type { ListProjectsParams, ProjectInsert, ProjectUpdate } from './api';

export function useProjects(params: ListProjectsParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => api.listProjects(params),
  });
}

export function useProjectsForSelect() {
  return useQuery({
    queryKey: ['projects', 'select-options'],
    queryFn: api.listProjectsForSelect,
    staleTime: 5 * 60_000,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: Omit<ProjectInsert, 'user_id'>) => api.createProject(input, user?.id as string),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProjectUpdate }) => api.updateProject(id, input),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
