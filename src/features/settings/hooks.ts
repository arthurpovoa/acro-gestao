import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/AuthProvider';
import { getSettings, updateSettings } from './api';
import type { SettingsUpdate } from './api';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: SettingsUpdate) => updateSettings(user?.id as string, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
