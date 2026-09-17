import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { sanitizeDigits } from '@/lib/whatsapp';
import { clientStatusLabels, clientStatusOptions } from '../clientStatus';

export interface ClientFormDefaults {
  name?: string | null;
  contact_name?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
  source?: string | null;
  joined_at?: string | null;
  status?: string | null;
  notes?: string | null;
}

const clientFormSchema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  contact_name: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('Informe um e-mail válido.').optional().or(z.literal('')),
  city: z.string().optional(),
  source: z.string().optional(),
  joined_at: z.string().optional(),
  status: z.enum(['ativo', 'prospect', 'inativo']),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  defaultValues?: ClientFormDefaults;
  isSubmitting?: boolean;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
}

export function ClientForm({ defaultValues, isSubmitting, onSubmit, onCancel }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      contact_name: defaultValues?.contact_name ?? '',
      whatsapp: defaultValues?.whatsapp ?? '',
      email: defaultValues?.email ?? '',
      city: defaultValues?.city ?? '',
      source: defaultValues?.source ?? '',
      joined_at: defaultValues?.joined_at ?? '',
      status: (defaultValues?.status as ClientFormData['status']) ?? 'ativo',
      notes: defaultValues?.notes ?? '',
    },
  });

  const submit = handleSubmit((data) => {
    onSubmit({ ...data, whatsapp: data.whatsapp ? sanitizeDigits(data.whatsapp) : '' });
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <Input label="Nome *" error={errors.name?.message} {...register('name')} />
      <Input label="Responsável" {...register('contact_name')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="WhatsApp" placeholder="61999998888" {...register('whatsapp')} />
        <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Cidade" {...register('city')} />
        <Input label="Origem" placeholder="Indicação, Instagram..." {...register('source')} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Cliente desde" type="date" {...register('joined_at')} />
        <Select label="Status" {...register('status')}>
          {clientStatusOptions.map((status) => (
            <option key={status} value={status}>
              {clientStatusLabels[status]}
            </option>
          ))}
        </Select>
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
