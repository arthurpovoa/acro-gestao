import { useState } from 'react';
import { Info, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/format';
import { formatDate } from '@/lib/dates';
import { transactionTypeLabels, transactionTypeOptions, transactionTypeTone } from '../transactionStatus';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useDistinctCategories,
  useTransactions,
  useUpdateTransaction,
} from '../hooks';
import { TransactionForm, type TransactionFormData } from '../components/TransactionForm';
import { TRANSACTIONS_PAGE_SIZE, type Transaction } from '../api';

type TypeFilter = 'todos' | (typeof transactionTypeOptions)[number];

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState<string>(currentMonth());
  const [type, setType] = useState<TypeFilter>('todos');
  const [category, setCategory] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const { showToast } = useToast();
  const { data: categories } = useDistinctCategories();

  const { data, isLoading, isFetching } = useTransactions({
    page,
    month: month || undefined,
    type,
    category: category || undefined,
  });

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  function updateFilters(next: Partial<{ month: string; type: TypeFilter; category: string }>) {
    if (next.month !== undefined) setMonth(next.month);
    if (next.type !== undefined) setType(next.type);
    if (next.category !== undefined) setCategory(next.category);
    setPage(1);
  }

  function handleCreate(formData: TransactionFormData) {
    createTransaction.mutate(
      { ...formData, amount: Number(formData.amount) },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          showToast('Lançamento adicionado.', 'success');
        },
        onError: () => showToast('Não foi possível salvar o lançamento.'),
      },
    );
  }

  function handleUpdate(formData: TransactionFormData) {
    if (!editTarget) return;
    updateTransaction.mutate(
      { id: editTarget.id, input: { ...formData, amount: Number(formData.amount) } },
      {
        onSuccess: () => {
          setEditTarget(null);
          showToast('Lançamento atualizado.', 'success');
        },
        onError: () => showToast('Não foi possível atualizar o lançamento.'),
      },
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteTransaction.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast('Lançamento excluído.', 'success');
        setDeleteTarget(null);
      },
      onError: () => showToast('Não foi possível excluir o lançamento.'),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-lg font-semibold">Financeiro</h1>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} /> Adicionar lançamento
        </Button>
      </div>

      <div className="flex gap-2 rounded-lg border border-primary-100 bg-primary-50 p-3 text-sm text-primary-700 dark:border-primary-800/40 dark:bg-primary-800/20 dark:text-primary-200">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          Esta lista mostra só os lançamentos manuais. Cobranças pagas e mensalidades recebidas já entram
          automaticamente nas entradas do Painel — não precisa lançar aqui de novo.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          label="Mês"
          type="month"
          value={month}
          onChange={(e) => updateFilters({ month: e.target.value })}
        />
        <Select label="Tipo" value={type} onChange={(e) => updateFilters({ type: e.target.value as TypeFilter })}>
          <option value="todos">Todos</option>
          {transactionTypeOptions.map((option) => (
            <option key={option} value={option}>
              {transactionTypeLabels[option]}
            </option>
          ))}
        </Select>
        <Select
          label="Categoria"
          value={category}
          onChange={(e) => updateFilters({ category: e.target.value })}
        >
          <option value="">Todas</option>
          {categories?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Nenhum lançamento encontrado"
          description={
            type !== 'todos' || category
              ? 'Tente ajustar os filtros.'
              : 'Comece adicionando o primeiro lançamento manual.'
          }
          actionLabel="Adicionar lançamento"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:hidden">
            {items.map((transaction) => {
              const t = transaction.type as keyof typeof transactionTypeTone;
              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {transaction.description || transaction.category || 'Sem descrição'}
                    </p>
                    <Badge tone={transactionTypeTone[t]}>{transactionTypeLabels[t]}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.date)}
                    {transaction.category ? ` · ${transaction.category}` : ''}
                  </p>
                  <p className={`font-medium ${t === 'entrada' ? 'text-status-pago' : 'text-status-atrasado'}`}>
                    {t === 'entrada' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </p>
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditTarget(transaction)}
                      aria-label={`Editar lançamento`}
                      className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(transaction)}
                      aria-label={`Excluir lançamento`}
                      className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-status-atrasado hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <Table>
              <thead>
                <tr>
                  <Th>Data</Th>
                  <Th>Descrição</Th>
                  <Th>Categoria</Th>
                  <Th>Tipo</Th>
                  <Th>Valor</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((transaction) => {
                  const t = transaction.type as keyof typeof transactionTypeTone;
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <Td>{formatDate(transaction.date)}</Td>
                      <Td>{transaction.description || '—'}</Td>
                      <Td>{transaction.category || '—'}</Td>
                      <Td>
                        <Badge tone={transactionTypeTone[t]}>{transactionTypeLabels[t]}</Badge>
                      </Td>
                      <Td className={t === 'entrada' ? 'text-status-pago' : 'text-status-atrasado'}>
                        {t === 'entrada' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setEditTarget(transaction)}
                            aria-label="Editar lançamento"
                            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(transaction)}
                            aria-label="Excluir lançamento"
                            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-status-atrasado hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <Pagination page={page} pageSize={TRANSACTIONS_PAGE_SIZE} total={total} onPageChange={setPage} />
          {isFetching && !isLoading && (
            <p className="text-xs text-gray-400" role="status">
              Atualizando...
            </p>
          )}
        </>
      )}

      {isCreateOpen && (
        <Modal title="Adicionar lançamento" onClose={() => setIsCreateOpen(false)}>
          <TransactionForm
            isSubmitting={createTransaction.isPending}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Editar lançamento" onClose={() => setEditTarget(null)}>
          <TransactionForm
            defaultValues={editTarget}
            isSubmitting={updateTransaction.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Excluir lançamento"
          description={`Tem certeza que deseja excluir "${deleteTarget.description || deleteTarget.category || 'este lançamento'}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isLoading={deleteTransaction.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
