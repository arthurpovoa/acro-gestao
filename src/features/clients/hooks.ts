import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/AuthProvider';
import * as api from './api';
import type { ClientInsert, ClientUpdate, ListClientsParams } from './api';

export function useClients(params: ListClientsParams) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => api.listClients(params),
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => api.getClient(id as string),
    enabled: Boolean(id),
  });
}

export function useClientProjects(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client', clientId, 'projects'],
    queryFn: () => api.listClientProjects(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useClientContracts(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client', clientId, 'contracts'],
    queryFn: () => api.listClientContracts(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useClientCharges(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client', clientId, 'charges'],
    queryFn: () => api.listClientCharges(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useClientPayments(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client', clientId, 'payments'],
    queryFn: () => api.listClientPayments(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: Omit<ClientInsert, 'user_id'>) => api.createClient(input, user?.id as string),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClientUpdate }) => api.updateClient(id, input),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
      void queryClient.invalidateQueries({ queryKey: ['client', id] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteClient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
