import { useQuery } from '@tanstack/react-query';
import * as api from './api';

export function useDashboard(year: number) {
  return useQuery({
    queryKey: ['dashboard', year],
    queryFn: () => api.getDashboard(year),
  });
}

export function useOverdueCharges() {
  return useQuery({
    queryKey: ['dashboard', 'overdue-charges'],
    queryFn: api.listOverdueCharges,
  });
}

export function useContractsWithOpenMonths() {
  return useQuery({
    queryKey: ['dashboard', 'contracts-open-months'],
    queryFn: api.listContractsWithOpenMonths,
  });
}
