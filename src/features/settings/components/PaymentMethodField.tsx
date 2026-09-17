import { forwardRef, type ComponentProps } from 'react';
import { Input } from '@/components/ui/Input';
import { asStringList } from '../api';
import { useSettings } from '../hooks';

type PaymentMethodFieldProps = Omit<ComponentProps<typeof Input>, 'label' | 'placeholder' | 'list'> & {
  label?: string;
  placeholder?: string;
};

export const PaymentMethodField = forwardRef<HTMLInputElement, PaymentMethodFieldProps>(
  ({ label = 'Forma de pagamento', placeholder = 'Pix, cartão...', ...props }, ref) => {
    const { data: settings } = useSettings();
    const formasPagamento = asStringList(settings?.formas_pagamento);

    return (
      <>
        <Input ref={ref} label={label} placeholder={placeholder} list="formas-pagamento" {...props} />
        <datalist id="formas-pagamento">
          {formasPagamento.map((forma) => (
            <option key={forma} value={forma} />
          ))}
        </datalist>
      </>
    );
  },
);
PaymentMethodField.displayName = 'PaymentMethodField';
