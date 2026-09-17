import { Card } from '@/components/ui/Card';

export default function ChargesPage() {
  return (
    <Card>
      <h1 className="text-lg font-semibold">Cobranças</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Os filtros por status e as ações "Marcar como pago" / "Cobrar no WhatsApp" chegam na
        Etapa 3.
      </p>
    </Card>
  );
}
