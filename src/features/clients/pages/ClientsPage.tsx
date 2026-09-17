import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
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
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { clientStatusLabels, clientStatusOptions, clientStatusTone } from '../clientStatus';
import { useClients, useCreateClient, useDeleteClient, useUpdateClient } from '../hooks';
import { ClientForm, type ClientFormData } from '../components/ClientForm';
import { CLIENTS_PAGE_SIZE, type Client } from '../api';

type StatusFilter = 'todos' | 'ativo' | 'prospect' | 'inativo';
type ClientListItem = Pick<Client, 'id' | 'name' | 'contact_name' | 'whatsapp' | 'city' | 'status'>;

export default function ClientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ClientListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [inactiveOffer, setInactiveOffer] = useState<{ id: string; name: string } | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { showToast } = useToast();

  const { data, isLoading, isFetching } = useClients({
    page,
    search: debouncedSearch || undefined,
    status,
  });

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  function updateFilters(next: Partial<{ search: string; status: StatusFilter }>) {
    if (next.search !== undefined) setSearch(next.search);
    if (next.status !== undefined) setStatus(next.status);
    setPage(1);
  }

  function handleCreate(formData: ClientFormData) {
    createClient.mutate(
      { ...formData, joined_at: formData.joined_at || null },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          showToast('Cliente adicionado.', 'success');
        },
        onError: () => showToast('Não foi possível salvar o cliente.'),
      },
    );
  }

  function handleUpdate(formData: ClientFormData) {
    if (!editTarget) return;
    updateClient.mutate(
      { id: editTarget.id, input: { ...formData, joined_at: formData.joined_at || null } },
      {
        onSuccess: () => {
          setEditTarget(null);
          showToast('Cliente atualizado.', 'success');
        },
        onError: () => showToast('Não foi possível atualizar o cliente.'),
      },
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteClient.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast('Cliente excluído.', 'success');
        setDeleteTarget(null);
      },
      onError: (error: unknown) => {
        const pgError = error as { code?: string };
        setDeleteTarget(null);
        if (pgError.code === '23503') {
          setInactiveOffer(deleteTarget);
        } else {
          showToast('Não foi possível excluir o cliente.');
        }
      },
    });
  }

  function handleMarkInactive() {
    if (!inactiveOffer) return;
    updateClient.mutate(
      { id: inactiveOffer.id, input: { status: 'inativo' } },
      {
        onSuccess: () => {
          showToast('Cliente marcado como inativo.', 'success');
          setInactiveOffer(null);
        },
        onError: () => showToast('Não foi possível atualizar o cliente.'),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-lg font-semibold">Clientes</h1>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} /> Adicionar cliente
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-9 text-gray-400" />
          <Input
            label="Buscar por nome"
            className="pl-9"
            placeholder="Digite o nome do cliente"
            value={search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>
        <Select
          label="Status"
          value={status}
          onChange={(e) => updateFilters({ status: e.target.value as StatusFilter })}
        >
          <option value="todos">Todos</option>
          {clientStatusOptions.map((option) => (
            <option key={option} value={option}>
              {clientStatusLabels[option]}
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
          icon={Users}
          title="Nenhum cliente encontrado"
          description={
            search || status !== 'todos'
              ? 'Tente ajustar a busca ou os filtros.'
              : 'Comece adicionando o primeiro cliente.'
          }
          actionLabel="Adicionar cliente"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {items.map((client) => {
              const link = buildWhatsAppLink(client.whatsapp);
              return (
                <div
                  key={client.id}
                  className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link to={`/clientes/${client.id}`} className="font-medium text-gray-900 dark:text-gray-100">
                      {client.name}
                    </Link>
                    <Badge tone={clientStatusTone[client.status as keyof typeof clientStatusTone]}>
                      {clientStatusLabels[client.status as keyof typeof clientStatusLabels]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {client.contact_name || 'Sem responsável'} · {client.city || 'Sem cidade'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener"
                        className="text-sm font-medium text-primary hover:underline dark:text-primary-200"
                      >
                        WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditTarget(client)}
                      aria-label={`Editar ${client.name}`}
                      className="ml-auto flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: client.id, name: client.name })}
                      aria-label={`Excluir ${client.name}`}
                      className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-status-atrasado hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block">
            <Table>
              <thead>
                <tr>
                  <Th>Nome</Th>
                  <Th>Responsável</Th>
                  <Th>Cidade</Th>
                  <Th>Status</Th>
                  <Th>WhatsApp</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((client) => {
                  const link = buildWhatsAppLink(client.whatsapp);
                  return (
                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <Td>
                        <Link
                          to={`/clientes/${client.id}`}
                          className="font-medium text-primary hover:underline dark:text-primary-200"
                        >
                          {client.name}
                        </Link>
                      </Td>
                      <Td>{client.contact_name || '—'}</Td>
                      <Td>{client.city || '—'}</Td>
                      <Td>
                        <Badge tone={clientStatusTone[client.status as keyof typeof clientStatusTone]}>
                          {clientStatusLabels[client.status as keyof typeof clientStatusLabels]}
                        </Badge>
                      </Td>
                      <Td>
                        {link ? (
                          <a href={link} target="_blank" rel="noopener" className="text-primary hover:underline dark:text-primary-200">
                            Abrir
                          </a>
                        ) : (
                          <span className="text-gray-400">Sem número</span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setEditTarget(client)}
                            aria-label={`Editar ${client.name}`}
                            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: client.id, name: client.name })}
                            aria-label={`Excluir ${client.name}`}
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

          <Pagination page={page} pageSize={CLIENTS_PAGE_SIZE} total={total} onPageChange={setPage} />
          {isFetching && !isLoading && (
            <p className="text-xs text-gray-400" role="status">
              Atualizando...
            </p>
          )}
        </>
      )}

      {isCreateOpen && (
        <Modal title="Adicionar cliente" onClose={() => setIsCreateOpen(false)}>
          <ClientForm
            isSubmitting={createClient.isPending}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Editar cliente" onClose={() => setEditTarget(null)}>
          <ClientForm
            defaultValues={editTarget}
            isSubmitting={updateClient.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Excluir cliente"
          description={`Tem certeza que deseja excluir "${deleteTarget.name}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isLoading={deleteClient.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {inactiveOffer && (
        <ConfirmDialog
          title="Cliente com vínculos"
          description={`"${inactiveOffer.name}" tem projetos ou contratos vinculados e não pode ser excluído. Deseja marcá-lo como inativo em vez disso?`}
          confirmLabel="Marcar como inativo"
          variant="primary"
          isLoading={updateClient.isPending}
          onConfirm={handleMarkInactive}
          onCancel={() => setInactiveOffer(null)}
        />
      )}
    </div>
  );
}
