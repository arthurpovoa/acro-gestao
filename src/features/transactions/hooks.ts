import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/AuthProvider';
import * as api from './api';
import type { ListTransactionsParams, TransactionInsert, TransactionUpdate } from './api';

export function useTransactions(params: ListTransactionsParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.listTransactions(params),
  });
}

export function useDistinctCategories() {
  return useQuery({
    queryKey: ['transactions', 'categories'],
    queryFn: api.listDistinctCategories,
    staleTime: 60_000,
  });
}

function invalidateRelated(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['transactions'] });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: Omit<TransactionInsert, 'user_id'>) => api.createTransaction(input, user?.id as string),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionUpdate }) => api.updateTransaction(id, input),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTransaction(id),
    onSuccess: () => invalidateRelated(queryClient),
  });
}
