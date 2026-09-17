import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PaymentMethodField } from '@/features/settings/components/PaymentMethodField';
import { todayISO } from '@/lib/dates';

interface MarkAsPaidDialogProps {
  isLoading?: boolean;
  onConfirm: (paidAt: string, paymentMethod: string) => void;
  onCancel: () => void;
}

export function MarkAsPaidDialog({ isLoading, onConfirm, onCancel }: MarkAsPaidDialogProps) {
  const [paidAt, setPaidAt] = useState(todayISO());
  const [paymentMethod, setPaymentMethod] = useState('');

  return (
    <Modal title="Marcar como pago" onClose={onCancel}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(paidAt, paymentMethod);
        }}
      >
        <Input
          label="Data do pagamento"
          type="date"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          required
        />
        <PaymentMethodField value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Confirmar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
