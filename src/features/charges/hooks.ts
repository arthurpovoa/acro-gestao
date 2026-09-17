import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/AuthProvider';
import { getChargeStatus } from '@/lib/status';
import * as api from './api';
import type { ChargeInsert, ChargeListItem, ChargeUpdate, ListChargesParams, ListChargesResult } from './api';

export function useCharges(params: ListChargesParams) {
  return useQuery({
    queryKey: ['charges', params],
    queryFn: () => api.listCharges(params),
  });
}

export function useChargesByProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['charges', 'by-project', projectId],
    queryFn: () => api.listChargesByProject(projectId as string),
    enabled: Boolean(projectId),
  });
}

function invalidateRelated(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['charges'] });
  void queryClient.invalidateQueries({ queryKey: ['project'] });
  void queryClient.invalidateQueries({ queryKey: ['projects'] });
  void queryClient.invalidateQueries({ queryKey: ['client'] });
}

export function useCreateCharge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: Omit<ChargeInsert, 'user_id'>) => api.createCharge(input, user?.id as string),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useCreateCharges() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (inputs: Array<Omit<ChargeInsert, 'user_id'>>) => api.createCharges(inputs, user?.id as string),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useUpdateCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ChargeUpdate }) => api.updateCharge(id, input),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useDeleteCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCharge(id),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

interface MarkAsPaidVars {
  id: string;
  paidAt: string;
  paymentMethod?: string | null;
}

/**
 * Caches sob a chave 'charges' têm dois formatos: lista paginada
 * ({ items, total }, de useCharges) e lista simples (ChargeListItem[],
 * de useChargesByProject). A atualização otimista precisa reconhecer os dois.
 */
function patchChargesCache(old: unknown, patch: (item: ChargeListItem) => ChargeListItem): unknown {
  if (!old) return old;
  if (Array.isArray(old)) {
    return old.map(patch);
  }
  const cache = old as Partial<ListChargesResult>;
  if (Array.isArray(cache.items)) {
    return { ...cache, items: cache.items.map(patch) };
  }
  return old;
}

export function useMarkChargeAsPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paidAt, paymentMethod }: MarkAsPaidVars) =>
      api.updateCharge(id, { paid_at: paidAt, payment_method: paymentMethod ?? null }),
    onMutate: async ({ id, paidAt, paymentMethod }) => {
      await queryClient.cancelQueries({ queryKey: ['charges'] });
      const previous = queryClient.getQueriesData({ queryKey: ['charges'] });

      const patch = (item: ChargeListItem): ChargeListItem =>
        item.id === id
          ? {
              ...item,
              paid_at: paidAt,
              payment_method: paymentMethod ?? item.payment_method,
              status: getChargeStatus({ paid_at: paidAt, due_date: item.due_date }),
              dias_atraso: null,
            }
          : item;

      queryClient.setQueriesData({ queryKey: ['charges'] }, (old: unknown) => patchChargesCache(old, patch));

      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => invalidateRelated(queryClient),
  });
}
