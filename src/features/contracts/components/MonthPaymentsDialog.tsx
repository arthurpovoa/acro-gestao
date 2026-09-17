import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/format';
import { formatDate, formatMonthYear, todayISO } from '@/lib/dates';
import {
  useCreatePayment,
  useDeletePayment,
  usePaymentsForMonth,
  useUpdatePayment,
  type ContractLike,
} from '../hooks';
import type { RecurringPayment } from '../api';

interface MonthPaymentsDialogProps {
  contract: ContractLike & { client_name: string | null; service: string | null };
  referenceMonth: string;
  onClose: () => void;
}

export function MonthPaymentsDialog({ contract, referenceMonth, onClose }: MonthPaymentsDialogProps) {
  const { showToast } = useToast();
  const { data: payments, isLoading } = usePaymentsForMonth(contract.id, referenceMonth);
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPago = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const restante = Math.max(contract.monthly_amount - totalPago, 0);

  function handleCreate(amount: number, paidAt: string, paymentMethod: string) {
    createPayment.mutate(
      { contract, referenceMonth, amount, paidAt: paidAt || null, paymentMethod: paymentMethod || null },
      {
        onSuccess: () => showToast('Pagamento registrado.', 'success'),
        onError: () => showToast('Não foi possível registrar o pagamento.'),
      },
    );
  }

  function handleUpdate(id: string, amount: number, paidAt: string, paymentMethod: string) {
    updatePayment.mutate(
      { id, input: { amount, paid_at: paidAt || null, payment_method: paymentMethod || null } },
      {
        onSuccess: () => {
          setEditingId(null);
          showToast('Pagamento atualizado.', 'success');
        },
        onError: () => showToast('Não foi possível atualizar o pagamento.'),
      },
    );
  }

  function handleDelete(id: string) {
    deletePayment.mutate(id, {
      onSuccess: () => {
        setDeletingId(null);
        showToast('Pagamento excluído.', 'success');
      },
      onError: () => showToast('Não foi possível excluir o pagamento.'),
    });
  }

  return (
    <Modal title={`${contract.service || 'Mensalidade'} — ${formatMonthYear(referenceMonth)}`} onClose={onClose}>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{contract.client_name}</p>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : payments && payments.length > 0 ? (
        <ul className="mb-4 flex flex-col gap-2">
          {payments.map((payment) =>
            editingId === payment.id ? (
              <PaymentEditRow
                key={payment.id}
                payment={payment}
                isLoading={updatePayment.isPending}
                onSave={(amount, paidAt, paymentMethod) => handleUpdate(payment.id, amount, paidAt, paymentMethod)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <li
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(payment.amount)}</p>
                  <p className="text-gray-500 dark:text-gray-400">
                    Pago em {formatDate(payment.paid_at)}
                    {payment.payment_method ? ` · ${payment.payment_method}` : ''}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(payment.id)}
                    aria-label="Editar pagamento"
                    className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <Pencil size={16} />
                  </button>
                  {deletingId === payment.id ? (
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(payment.id)}
                      isLoading={deletePayment.isPending}
                      className="px-2 py-1 text-xs"
                    >
                      Confirmar exclusão
                    </Button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingId(payment.id)}
                      aria-label="Excluir pagamento"
                      className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-status-atrasado hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </li>
            ),
          )}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Nenhum pagamento registrado neste mês.</p>
      )}

      <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Restante do mês: <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(restante)}</span>
        </p>
        <PaymentAddForm
          defaultAmount={restante > 0 ? restante : contract.monthly_amount}
          isLoading={createPayment.isPending}
          onSubmit={handleCreate}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
}

function PaymentAddForm({
  defaultAmount,
  isLoading,
  onSubmit,
  onCancel,
}: {
  defaultAmount: number;
  isLoading?: boolean;
  onSubmit: (amount: number, paidAt: string, paymentMethod: string) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(String(defaultAmount));
  const [paidAt, setPaidAt] = useState(todayISO());
  const [paymentMethod, setPaymentMethod] = useState('');

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(Number(amount), paidAt, paymentMethod);
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Input label="Pago em" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required />
        <Input
          label="Forma de pagamento"
          placeholder="Pix, cartão..."
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Fechar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Registrar pagamento
        </Button>
      </div>
    </form>
  );
}

function PaymentEditRow({
  payment,
  isLoading,
  onSave,
  onCancel,
}: {
  payment: RecurringPayment;
  isLoading?: boolean;
  onSave: (amount: number, paidAt: string, paymentMethod: string) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(String(payment.amount));
  const [paidAt, setPaidAt] = useState(payment.paid_at ?? todayISO());
  const [paymentMethod, setPaymentMethod] = useState(payment.payment_method ?? '');

  return (
    <li className="rounded-lg border border-primary/40 p-3">
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(Number(amount), paidAt, paymentMethod);
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input label="Valor (R$)" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <Input label="Pago em" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required />
          <Input
            label="Forma de pagamento"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} className="px-3 py-1.5 text-xs">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} className="px-3 py-1.5 text-xs">
            Salvar
          </Button>
        </div>
      </form>
    </li>
  );
}
