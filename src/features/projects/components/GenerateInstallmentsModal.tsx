import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { generateInstallments } from '@/lib/installments';
import { todayISO } from '@/lib/dates';

interface GenerateInstallmentsModalProps {
  totalAmount: number;
  isLoading?: boolean;
  onConfirm: (installments: { amount: number; dueDate: string }[]) => void;
  onCancel: () => void;
}

export function GenerateInstallmentsModal({
  totalAmount,
  isLoading,
  onConfirm,
  onCancel,
}: GenerateInstallmentsModalProps) {
  const [count, setCount] = useState(2);
  const [firstDueDate, setFirstDueDate] = useState(todayISO());
  const [intervalMonths, setIntervalMonths] = useState(1);

  const preview =
    count > 0 && firstDueDate
      ? generateInstallments({ totalAmount, count, firstDueDate, intervalMonths: intervalMonths || 1 })
      : [];

  return (
    <Modal title="Gerar parcelas" onClose={onCancel}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(preview);
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Quantidade"
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
            required
          />
          <Input
            label="1ª parcela"
            type="date"
            value={firstDueDate}
            onChange={(e) => setFirstDueDate(e.target.value)}
            required
          />
          <Input
            label="Intervalo (meses)"
            type="number"
            min={1}
            value={intervalMonths}
            onChange={(e) => setIntervalMonths(Math.max(1, Number(e.target.value)))}
            required
          />
        </div>

        {preview.length > 0 && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <ul className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
              {preview.map((item, index) => (
                <li key={index} className="flex justify-between px-3 py-2">
                  <span>
                    Parcela {index + 1}/{preview.length} · {item.dueDate.split('-').reverse().join('/')}
                  </span>
                  <span className="font-medium">
                    {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={preview.length === 0}>
            Gerar {preview.length > 0 ? preview.length : ''} parcela(s)
          </Button>
        </div>
      </form>
    </Modal>
  );
}
