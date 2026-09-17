import { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Pencil, Plus, Trash2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/format';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { useSettings } from '@/features/settings/hooks';
import { contractSituacaoLabels, contractSituacaoTone, monthNamesShort } from '../contractStatus';
import { useContractMonths, useContracts, useCreateContract, useDeleteContract, useUpdateContract } from '../hooks';
import type { ContractDetail } from '../api';
import { ContractForm, type ContractFormData } from '../components/ContractForm';
import { ContractMonthCell } from '../components/ContractMonthCell';
import { MonthPaymentsDialog } from '../components/MonthPaymentsDialog';
import { buildContractWhatsAppMessage } from '../message';

export default function ContractsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ContractDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContractDetail | null>(null);
  const [activeCell, setActiveCell] = useState<{ contract: ContractDetail; month: number } | null>(null);

  const { showToast } = useToast();
  const { data: settings } = useSettings();
  const { data: contracts, isLoading: isLoadingContracts } = useContracts();
  const { data: months, isLoading: isLoadingMonths } = useContractMonths(year);

  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();

  function monthsFor(contractId: string) {
    return (months ?? []).filter((m) => m.contract_id === contractId).sort((a, b) => a.month - b.month);
  }

  function handleCreate(formData: ContractFormData) {
    createContract.mutate(
      {
        ...formData,
        monthly_amount: Number(formData.monthly_amount),
        due_day: Number(formData.due_day),
        end_date: formData.end_date || null,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          showToast('Contrato adicionado.', 'success');
        },
        onError: () => showToast('Não foi possível salvar o contrato.'),
      },
    );
  }

  function handleUpdate(formData: ContractFormData) {
    if (!editTarget?.id) return;
    updateContract.mutate(
      {
        id: editTarget.id,
        input: {
          ...formData,
          monthly_amount: Number(formData.monthly_amount),
          due_day: Number(formData.due_day),
          end_date: formData.end_date || null,
        },
      },
      {
        onSuccess: () => {
          setEditTarget(null);
          showToast('Contrato atualizado.', 'success');
        },
        onError: () => showToast('Não foi possível atualizar o contrato.'),
      },
    );
  }

  function handleDelete() {
    if (!deleteTarget?.id) return;
    deleteContract.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast('Contrato excluído.', 'success');
        setDeleteTarget(null);
      },
      onError: () => showToast('Não foi possível excluir o contrato.'),
    });
  }

  function handleWhatsApp(contract: ContractDetail) {
    const link = buildWhatsAppLink(contract.whatsapp, settings ? buildContractWhatsAppMessage(contract, settings) : undefined);
    if (!link) {
      showToast('Cliente sem WhatsApp cadastrado.');
      return;
    }
    window.open(link, '_blank', 'noopener');
  }

  const isLoading = isLoadingContracts || isLoadingMonths;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-lg font-semibold">Mensalidades</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              aria-label="Ano anterior"
              className="flex min-h-touch min-w-touch items-center justify-center text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-12 text-center text-sm font-medium">{year}</span>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              aria-label="Próximo ano"
              className="flex min-h-touch min-w-touch items-center justify-center text-gray-600 dark:text-gray-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus size={16} /> Adicionar contrato
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nenhum contrato de mensalidade ainda"
          description="Adicione um contrato para começar a controlar os pagamentos recorrentes."
          actionLabel="Adicionar contrato"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          {/* Mobile: card por contrato */}
          <div className="flex flex-col gap-3 lg:hidden">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{contract.client_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contract.service || 'Mensalidade'} · {formatCurrency(contract.monthly_amount)}/mês
                    </p>
                  </div>
                  <Badge tone={contractSituacaoTone[(contract.situacao ?? 'ativo') as keyof typeof contractSituacaoLabels]}>
                    {contractSituacaoLabels[(contract.situacao ?? 'ativo') as keyof typeof contractSituacaoLabels]}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {monthsFor(contract.id as string).map((m) => (
                    <ContractMonthCell
                      key={m.month}
                      month={m.month}
                      status={m.status as never}
                      valorPago={m.valor_pago}
                      showLabel
                      onClick={() => setActiveCell({ contract, month: m.month })}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(contract.meses_em_aberto ?? 0) > 0
                      ? `${contract.meses_em_aberto} mês(es) em aberto · ${formatCurrency(contract.valor_em_aberto)}`
                      : 'Em dia'}
                  </p>
                  <div className="flex gap-1">
                    {(contract.meses_em_aberto ?? 0) > 0 && (
                      <IconBtn label="Cobrar no WhatsApp" onClick={() => handleWhatsApp(contract)}>
                        <MessageCircle size={16} />
                      </IconBtn>
                    )}
                    <IconBtn label="Editar contrato" onClick={() => setEditTarget(contract)}>
                      <Pencil size={16} />
                    </IconBtn>
                    <IconBtn label="Excluir contrato" tone="danger" onClick={() => setDeleteTarget(contract)}>
                      <Trash2 size={16} />
                    </IconBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: grade */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-separate border-spacing-1 text-sm">
              <thead>
                <tr>
                  <th className="min-w-48 pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Contrato
                  </th>
                  {monthNamesShort.map((label) => (
                    <th key={label} className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {label}
                    </th>
                  ))}
                  <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id}>
                    <td className="rounded-lg bg-white px-3 py-2 dark:bg-gray-900">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{contract.client_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {contract.service || 'Mensalidade'} · {formatCurrency(contract.monthly_amount)}
                      </p>
                    </td>
                    {monthsFor(contract.id as string).map((m) => (
                      <td key={m.month}>
                        <ContractMonthCell
                          month={m.month}
                          status={m.status as never}
                          valorPago={m.valor_pago}
                          onClick={() => setActiveCell({ contract, month: m.month })}
                        />
                      </td>
                    ))}
                    <td>
                      <div className="flex justify-center gap-1">
                        {(contract.meses_em_aberto ?? 0) > 0 && (
                          <IconBtn label="Cobrar no WhatsApp" onClick={() => handleWhatsApp(contract)}>
                            <MessageCircle size={16} />
                          </IconBtn>
                        )}
                        <IconBtn label="Editar contrato" onClick={() => setEditTarget(contract)}>
                          <Pencil size={16} />
                        </IconBtn>
                        <IconBtn label="Excluir contrato" tone="danger" onClick={() => setDeleteTarget(contract)}>
                          <Trash2 size={16} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isCreateOpen && (
        <Modal title="Adicionar contrato" onClose={() => setIsCreateOpen(false)}>
          <ContractForm
            isSubmitting={createContract.isPending}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Editar contrato" onClose={() => setEditTarget(null)}>
          <ContractForm
            defaultValues={editTarget}
            isSubmitting={updateContract.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Excluir contrato"
          description={`Tem certeza que deseja excluir o contrato de "${deleteTarget.client_name}"? Os pagamentos registrados neste contrato também serão excluídos. Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isLoading={deleteContract.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {activeCell && (
        <MonthPaymentsDialog
          contract={{
            id: activeCell.contract.id as string,
            start_date: activeCell.contract.start_date as string,
            end_date: activeCell.contract.end_date,
            monthly_amount: activeCell.contract.monthly_amount as number,
            due_day: activeCell.contract.due_day as number,
            client_name: activeCell.contract.client_name,
            service: activeCell.contract.service,
          }}
          referenceMonth={`${year}-${String(activeCell.month).padStart(2, '0')}-01`}
          onClose={() => setActiveCell(null)}
        />
      )}
    </div>
  );
}

function IconBtn({
  label,
  tone = 'default',
  onClick,
  children,
}: {
  label: string;
  tone?: 'default' | 'danger';
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex min-h-touch min-w-touch items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
        tone === 'danger' ? 'text-status-atrasado' : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {children}
    </button>
  );
}
