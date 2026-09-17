import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { todayISO } from '@/lib/dates';
import { asStringList } from '@/features/settings/api';
import { useSettings } from '@/features/settings/hooks';
import { PaymentMethodField } from '@/features/settings/components/PaymentMethodField';
import { useDistinctCategories } from '../hooks';
import { transactionTypeLabels, transactionTypeOptions } from '../transactionStatus';

const transactionFormSchema = z.object({
  date: z.string().min(1, 'Informe a data.'),
  type: z.enum(['entrada', 'saida']),
  category: z.string().optional(),
  description: z.string().optional(),
  amount: z
    .string()
    .min(1, 'Informe o valor.')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Informe um valor maior que zero.'),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;

export interface TransactionFormDefaults {
  date?: string | null;
  type?: string | null;
  category?: string | null;
  description?: string | null;
  amount?: number | null;
  payment_method?: string | null;
  notes?: string | null;
}

interface TransactionFormProps {
  defaultValues?: TransactionFormDefaults;
  isSubmitting?: boolean;
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
}

export function TransactionForm({ defaultValues, isSubmitting, onSubmit, onCancel }: TransactionFormProps) {
  const { data: usedCategories } = useDistinctCategories();
  const { data: settings } = useSettings();
  const categories = Array.from(new Set([...asStringList(settings?.categorias), ...(usedCategories ?? [])])).sort();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      date: defaultValues?.date ?? todayISO(),
      type: (defaultValues?.type as TransactionFormData['type']) ?? 'entrada',
      category: defaultValues?.category ?? '',
      description: defaultValues?.description ?? '',
      amount: defaultValues?.amount != null ? String(defaultValues.amount) : '',
      payment_method: defaultValues?.payment_method ?? '',
      notes: defaultValues?.notes ?? '',
    },
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Data *" type="date" error={errors.date?.message} {...register('date')} />
        <Select label="Tipo" {...register('type')}>
          {transactionTypeOptions.map((option) => (
            <option key={option} value={option}>
              {transactionTypeLabels[option]}
            </option>
          ))}
        </Select>
      </div>
      <Input label="Descrição" placeholder="Ex.: Aluguel do escritório" {...register('description')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Valor (R$) *"
          type="number"
          step="0.01"
          min="0"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Input label="Categoria" placeholder="Ex.: Software, Marketing..." list="transaction-categories" {...register('category')} />
        <datalist id="transaction-categories">
          {categories.map((category) => <option key={category} value={category} />)}
        </datalist>
      </div>
      <PaymentMethodField {...register('payment_method')} />
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
