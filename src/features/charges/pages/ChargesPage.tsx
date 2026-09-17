import { useState } from 'react';
import { CheckCircle2, MessageCircle, Pencil, Plus, Receipt, Search, Trash2 } from 'lucide-react';
import { ChargeCard, IconButton } from '../components/ChargeCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { formatCurrency } from '@/lib/format';
import { formatDate } from '@/lib/dates';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { chargeStatusLabels, chargeStatusTone, type ChargeStatus } from '@/lib/status';
import { useSettings } from '@/features/settings/hooks';
import {
  useCharges,
  useCreateCharge,
  useDeleteCharge,
  useMarkChargeAsPaid,
  useUpdateCharge,
} from '../hooks';
import { CHARGES_PAGE_SIZE, type ChargeListItem } from '../api';
import { ChargeForm, type ChargeFormData } from '../components/ChargeForm';
import { MarkAsPaidDialog } from '../components/MarkAsPaidDialog';
import { buildChargeWhatsAppMessage } from '../message';

type StatusFilter = 'todos' | ChargeStatus;

const filterOptions: { key: StatusFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'atrasado', label: 'Atrasado' },
  { key: 'vence_em_7_dias', label: 'Vence em 7 dias' },
  { key: 'a_vencer', label: 'A vencer' },
  { key: 'pago', label: 'Pago' },
  { key: 'sem_vencimento', label: 'Sem vencimento' },
];

export default function ChargesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ChargeListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChargeListItem | null>(null);
  const [payTarget, setPayTarget] = useState<ChargeListItem | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { showToast } = useToast();
  const { data: settings } = useSettings();

  const { data, isLoading, isFetching } = useCharges({
    page,
    search: debouncedSearch || undefined,
    status,
  });

  const createCharge = useCreateCharge();
  const updateCharge = useUpdateCharge();
  const deleteCharge = useDeleteCharge();
  const markAsPaid = useMarkChargeAsPaid();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  function updateFilters(next: Partial<{ search: string; status: StatusFilter }>) {
    if (next.search !== undefined) setSearch(next.search);
    if (next.status !== undefined) setStatus(next.status);
    setPage(1);
  }

  function handleCreate(formData: ChargeFormData) {
    createCharge.mutate(
      { ...formData, amount: Number(formData.amount), due_date: formData.due_date || null, paid_at: formData.paid_at || null },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          showToast('Cobrança adicionada.', 'success');
        },
        onError: () => showToast('Não foi possível salvar a cobrança.'),
      },
    );
  }

  function handleUpdate(formData: ChargeFormData) {
    if (!editTarget) return;
    updateCharge.mutate(
      {
        id: editTarget.id,
        input: {
          ...formData,
          amount: Number(formData.amount),
          due_date: formData.due_date || null,
          paid_at: formData.paid_at || null,
        },
      },
      {
        onSuccess: () => {
          setEditTarget(null);
          showToast('Cobrança atualizada.', 'success');
        },
        onError: () => showToast('Não foi possível atualizar a cobrança.'),
      },
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteCharge.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast('Cobrança excluída.', 'success');
        setDeleteTarget(null);
      },
      onError: () => showToast('Não foi possível excluir a cobrança.'),
    });
  }

  function handleConfirmPaid(paidAt: string, paymentMethod: string) {
    if (!payTarget) return;
    markAsPaid.mutate(
      { id: payTarget.id, paidAt, paymentMethod: paymentMethod || null },
      {
        onSuccess: () => {
          showToast('Cobrança marcada como paga.', 'success');
          setPayTarget(null);
        },
        onError: () => showToast('Não foi possível marcar como pago.'),
      },
    );
  }

  function handleWhatsApp(charge: ChargeListItem) {
    const link = buildWhatsAppLink(
      charge.whatsapp,
      settings ? buildChargeWhatsAppMessage(charge, settings) : undefined,
    );
    if (!link) {
      showToast('Cliente sem WhatsApp cadastrado.');
      return;
    }
    window.open(link, '_blank', 'noopener');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-lg font-semibold">Cobranças</h1>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} /> Adicionar cobrança
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-9 text-gray-400" />
        <Input
          label="Buscar"
          className="pl-9"
          placeholder="Descrição, projeto ou cliente"
          value={search}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => updateFilters({ status: option.key })}
            aria-pressed={status === option.key}
            className={`min-h-touch rounded-full border px-3 text-sm font-medium transition-colors ${
              status === option.key
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma cobrança encontrada"
          description={
            search || status !== 'todos'
              ? 'Tente ajustar a busca ou os filtros.'
              : 'Comece adicionando a primeira cobrança.'
          }
          actionLabel="Adicionar cobrança"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:hidden">
            {items.map((charge) => (
              <ChargeCard
                key={charge.id}
                charge={charge}
                onEdit={() => setEditTarget(charge)}
                onDelete={() => setDeleteTarget(charge)}
                onPay={() => setPayTarget(charge)}
                onWhatsApp={() => handleWhatsApp(charge)}
              />
            ))}
          </div>

          <div className="hidden lg:block">
            <Table>
              <thead>
                <tr>
                  <Th>Descrição</Th>
                  <Th>Cliente</Th>
                  <Th>Vencimento</Th>
                  <Th>Status</Th>
                  <Th>Valor</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((charge) => {
                  const chargeStatus = charge.status as ChargeStatus;
                  return (
                    <tr key={charge.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <Td>{charge.description || charge.project_name}</Td>
                      <Td>{charge.client_name}</Td>
                      <Td>
                        {formatDate(charge.due_date)}
                        {chargeStatus === 'atrasado' && charge.dias_atraso != null && (
                          <span className="ml-1 text-xs text-status-atrasado">({charge.dias_atraso}d)</span>
                        )}
                      </Td>
                      <Td>
                        <Badge tone={chargeStatusTone[chargeStatus]}>{chargeStatusLabels[chargeStatus]}</Badge>
                      </Td>
                      <Td>{formatCurrency(charge.amount)}</Td>
                      <Td>
                        <div className="flex gap-1">
                          {!charge.paid_at && (
                            <IconButton label="Marcar como pago" onClick={() => setPayTarget(charge)}>
                              <CheckCircle2 size={16} />
                            </IconButton>
                          )}
                          {!charge.paid_at && (
                            <IconButton label="Cobrar no WhatsApp" onClick={() => handleWhatsApp(charge)}>
                              <MessageCircle size={16} />
                            </IconButton>
                          )}
                          <IconButton label="Editar cobrança" onClick={() => setEditTarget(charge)}>
                            <Pencil size={16} />
                          </IconButton>
                          <IconButton label="Excluir cobrança" tone="danger" onClick={() => setDeleteTarget(charge)}>
                            <Trash2 size={16} />
                          </IconButton>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <Pagination page={page} pageSize={CHARGES_PAGE_SIZE} total={total} onPageChange={setPage} />
          {isFetching && !isLoading && (
            <p className="text-xs text-gray-400" role="status">
              Atualizando...
            </p>
          )}
        </>
      )}

      {isCreateOpen && (
        <Modal title="Adicionar cobrança" onClose={() => setIsCreateOpen(false)}>
          <ChargeForm
            isSubmitting={createCharge.isPending}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Editar cobrança" onClose={() => setEditTarget(null)}>
          <ChargeForm
            defaultValues={editTarget}
            isSubmitting={updateCharge.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Excluir cobrança"
          description={`Tem certeza que deseja excluir "${deleteTarget.description || deleteTarget.project_name}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isLoading={deleteCharge.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {payTarget && (
        <MarkAsPaidDialog
          isLoading={markAsPaid.isPending}
          onConfirm={handleConfirmPaid}
          onCancel={() => setPayTarget(null)}
        />
      )}
    </div>
  );
}
