import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useClientsForSelect } from '@/features/clients/hooks';
import { asStringList } from '@/features/settings/api';
import { useSettings } from '@/features/settings/hooks';
import { billingTypeLabels, projectStatusLabels, projectStatusOptions } from '../projectStatus';

const projectFormSchema = z.object({
  client_id: z.string().min(1, 'Selecione um cliente.'),
  name: z.string().min(1, 'Informe o nome do projeto.'),
  service: z.string().optional(),
  billing_type: z.enum(['unico', 'parcelado']),
  amount: z
    .string()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Informe um valor válido.'),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(['orcamento', 'andamento', 'aguardando', 'entregue', 'cancelado']),
  notes: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

export interface ProjectFormDefaults {
  client_id?: string | null;
  name?: string | null;
  service?: string | null;
  billing_type?: string | null;
  amount?: number | null;
  start_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  notes?: string | null;
}

interface ProjectFormProps {
  defaultValues?: ProjectFormDefaults;
  isSubmitting?: boolean;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
}

export function ProjectForm({ defaultValues, isSubmitting, onSubmit, onCancel }: ProjectFormProps) {
  const { data: clients, isLoading: isLoadingClients } = useClientsForSelect();
  const { data: settings } = useSettings();
  const servicosAvulsos = asStringList(settings?.servicos_avulsos);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      client_id: defaultValues?.client_id ?? '',
      name: defaultValues?.name ?? '',
      service: defaultValues?.service ?? '',
      billing_type: (defaultValues?.billing_type as ProjectFormData['billing_type']) ?? 'unico',
      amount: defaultValues?.amount != null ? String(defaultValues.amount) : '',
      start_date: defaultValues?.start_date ?? '',
      due_date: defaultValues?.due_date ?? '',
      status: (defaultValues?.status as ProjectFormData['status']) ?? 'orcamento',
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
      <Input label="Nome do projeto *" error={errors.name?.message} {...register('name')} />
      <Input label="Serviço" placeholder="Ex.: Site institucional" list="servicos-avulsos" {...register('service')} />
      <datalist id="servicos-avulsos">
        {servicosAvulsos.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Cobrança" {...register('billing_type')}>
          {(Object.keys(billingTypeLabels) as Array<keyof typeof billingTypeLabels>).map((key) => (
            <option key={key} value={key}>
              {billingTypeLabels[key]}
            </option>
          ))}
        </Select>
        <Input
          label="Valor total (R$)"
          type="number"
          step="0.01"
          min="0"
          error={errors.amount?.message}
          {...register('amount')}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Início" type="date" {...register('start_date')} />
        <Input label="Prazo de entrega" type="date" {...register('due_date')} />
      </div>
      <Select label="Status" {...register('status')}>
        {projectStatusOptions.map((status) => (
          <option key={status} value={status}>
            {projectStatusLabels[status]}
          </option>
        ))}
      </Select>
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
