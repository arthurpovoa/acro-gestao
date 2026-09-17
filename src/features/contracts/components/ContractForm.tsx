import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useClientsForSelect } from '@/features/clients/hooks';
import { asStringList } from '@/features/settings/api';
import { useSettings } from '@/features/settings/hooks';

const contractFormSchema = z.object({
  client_id: z.string().min(1, 'Selecione um cliente.'),
  service: z.string().optional(),
  monthly_amount: z
    .string()
    .min(1, 'Informe o valor mensal.')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Informe um valor maior que zero.'),
  due_day: z
    .string()
    .min(1, 'Informe o dia de vencimento.')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 31, 'Informe um dia entre 1 e 31.'),
  start_date: z.string().min(1, 'Informe a data de início.'),
  end_date: z.string().optional(),
  notes: z.string().optional(),
});

export type ContractFormData = z.infer<typeof contractFormSchema>;

export interface ContractFormDefaults {
  client_id?: string | null;
  service?: string | null;
  monthly_amount?: number | null;
  due_day?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
}

interface ContractFormProps {
  defaultValues?: ContractFormDefaults;
  isSubmitting?: boolean;
  onSubmit: (data: ContractFormData) => void;
  onCancel: () => void;
}

export function ContractForm({ defaultValues, isSubmitting, onSubmit, onCancel }: ContractFormProps) {
  const { data: clients, isLoading: isLoadingClients } = useClientsForSelect();
  const { data: settings } = useSettings();
  const servicosRecorrentes = asStringList(settings?.servicos_recorrentes);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      client_id: defaultValues?.client_id ?? '',
      service: defaultValues?.service ?? '',
      monthly_amount: defaultValues?.monthly_amount != null ? String(defaultValues.monthly_amount) : '',
      due_day: defaultValues?.due_day != null ? String(defaultValues.due_day) : '10',
      start_date: defaultValues?.start_date ?? '',
      end_date: defaultValues?.end_date ?? '',
      notes: defaultValues?.notes ?? '',
    },
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Select label="Cliente *" error={errors.client_id?.message} disabled={isLoadingClients} {...register('client_id')}>
        <option value="">Selecione um cliente</option>
        {clients?.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </Select>
      <Input label="Serviço" placeholder="Ex.: SEO local" list="servicos-recorrentes" {...register('service')} />
      <datalist id="servicos-recorrentes">
        {servicosRecorrentes.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Valor mensal (R$) *"
          type="number"
          step="0.01"
          min="0"
          error={errors.monthly_amount?.message}
          {...register('monthly_amount')}
        />
        <Input
          label="Dia de vencimento *"
          type="number"
          min="1"
          max="31"
          error={errors.due_day?.message}
          {...register('due_day')}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Início *" type="date" error={errors.start_date?.message} {...register('start_date')} />
        <Input label="Encerramento" type="date" {...register('end_date')} />
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
        Observações
        <textarea
          rows={3}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          {...register('notes')}
        />
      </label>
      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
