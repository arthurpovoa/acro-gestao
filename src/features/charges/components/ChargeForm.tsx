import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useProjectsForSelect } from '@/features/projects/hooks';
import { PaymentMethodField } from '@/features/settings/components/PaymentMethodField';

const chargeFormSchema = z.object({
  project_id: z.string().min(1, 'Selecione um projeto.'),
  description: z.string().optional(),
  amount: z
    .string()
    .min(1, 'Informe um valor.')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Informe um valor maior que zero.'),
  due_date: z.string().optional(),
  paid_at: z.string().optional(),
  payment_method: z.string().optional(),
});

export type ChargeFormData = z.infer<typeof chargeFormSchema>;

export interface ChargeFormDefaults {
  project_id?: string | null;
  description?: string | null;
  amount?: number | null;
  due_date?: string | null;
  paid_at?: string | null;
  payment_method?: string | null;
}

interface ChargeFormProps {
  defaultValues?: ChargeFormDefaults;
  fixedProjectId?: string;
  isSubmitting?: boolean;
  onSubmit: (data: ChargeFormData) => void;
  onCancel: () => void;
}

export function ChargeForm({ defaultValues, fixedProjectId, isSubmitting, onSubmit, onCancel }: ChargeFormProps) {
  const { data: projects, isLoading: isLoadingProjects } = useProjectsForSelect();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChargeFormData>({
    resolver: zodResolver(chargeFormSchema),
    defaultValues: {
      project_id: fixedProjectId ?? defaultValues?.project_id ?? '',
      description: defaultValues?.description ?? '',
      amount: defaultValues?.amount != null ? String(defaultValues.amount) : '',
      due_date: defaultValues?.due_date ?? '',
      paid_at: defaultValues?.paid_at ?? '',
      payment_method: defaultValues?.payment_method ?? '',
    },
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {fixedProjectId ? (
        <input type="hidden" {...register('project_id')} />
      ) : (
        <Select
          label="Projeto *"
          error={errors.project_id?.message}
          disabled={isLoadingProjects}
          {...register('project_id')}
        >
          <option value="">Selecione um projeto</option>
          {projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} — {project.client_name}
            </option>
          ))}
        </Select>
      )}
      <Input label="Descrição" placeholder="Ex.: 1ª parcela" {...register('description')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Valor (R$) *"
          type="number"
          step="0.01"
          min="0"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Input label="Vencimento" type="date" {...register('due_date')} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Pago em" type="date" {...register('paid_at')} />
        <PaymentMethodField {...register('payment_method')} />
      </div>
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
