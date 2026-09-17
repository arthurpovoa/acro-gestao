import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/AuthProvider';
import { getContractMonthStatus } from '@/lib/status';
import * as api from './api';
import type {
  Contract,
  ContractInsert,
  ContractMonthRow,
  ContractUpdate,
  RecurringPaymentInsert,
  RecurringPaymentUpdate,
} from './api';

export function useContracts() {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: api.listContracts,
  });
}

export function useContractMonths(year: number) {
  return useQuery({
    queryKey: ['contract-months', year],
    queryFn: () => api.getContractMonths(year),
  });
}

function invalidateRelated(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['contracts'] });
  void queryClient.invalidateQueries({ queryKey: ['contract-months'] });
  void queryClient.invalidateQueries({ queryKey: ['payments'] });
  void queryClient.invalidateQueries({ queryKey: ['client'] });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: Omit<ContractInsert, 'user_id'>) => api.createContract(input, user?.id as string),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ContractUpdate }) => api.updateContract(id, input),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteContract(id),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function usePaymentsForMonth(contractId: string | undefined, referenceMonth: string | undefined) {
  return useQuery({
    queryKey: ['payments', contractId, referenceMonth],
    queryFn: () => api.listPaymentsForMonth(contractId as string, referenceMonth as string),
    enabled: Boolean(contractId && referenceMonth),
  });
}

export interface ContractLike {
  id: string;
  start_date: string;
  end_date: string | null;
  monthly_amount: number;
  due_day: number;
}

interface CreatePaymentVars {
  contract: ContractLike;
  referenceMonth: string;
  amount: number;
  paidAt: string | null;
  paymentMethod: string | null;
}

function patchContractMonthsCache(
  old: unknown,
  contract: ContractLike,
  referenceMonth: string,
  amountDelta: number,
): unknown {
  if (!Array.isArray(old)) return old;
  const month = Number(referenceMonth.slice(5, 7));
  return old.map((row: ContractMonthRow) => {
    if (row.contract_id !== contract.id || row.month !== month) return row;
    const valorPago = row.valor_pago + amountDelta;
    return {
      ...row,
      valor_pago: valorPago,
      status: getContractMonthStatus({
        startDate: contract.start_date,
        endDate: contract.end_date,
        monthlyAmount: contract.monthly_amount,
        valorPago,
        dueDate: row.due_date,
      }),
    };
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (vars: CreatePaymentVars) =>
      api.createPayment(
        {
          contract_id: vars.contract.id,
          reference_month: vars.referenceMonth,
          amount: vars.amount,
          paid_at: vars.paidAt,
          payment_method: vars.paymentMethod,
        } satisfies Omit<RecurringPaymentInsert, 'user_id'>,
        user?.id as string,
      ),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['contract-months'] });
      const previous = queryClient.getQueriesData({ queryKey: ['contract-months'] });
      queryClient.setQueriesData({ queryKey: ['contract-months'] }, (old: unknown) =>
        patchContractMonthsCache(old, vars.contract, vars.referenceMonth, vars.amount),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => invalidateRelated(queryClient),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RecurringPaymentUpdate }) => api.updatePayment(id, input),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePayment(id),
    onSuccess: () => invalidateRelated(queryClient),
  });
}

export type { Contract };
