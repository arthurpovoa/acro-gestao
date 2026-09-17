import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/format';
import { formatDate, formatMonthYear } from '@/lib/dates';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { clientStatusLabels, clientStatusTone } from '../clientStatus';
import {
  useClient,
  useClientCharges,
  useClientContracts,
  useClientPayments,
  useClientProjects,
  useDeleteClient,
  useUpdateClient,
} from '../hooks';
import { ClientForm, type ClientFormData } from '../components/ClientForm';

type TabKey = 'projetos' | 'contratos' | 'cobrancas' | 'pagamentos';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'projetos', label: 'Projetos' },
  { key: 'contratos', label: 'Contratos' },
  { key: 'cobrancas', label: 'Cobranças' },
  { key: 'pagamentos', label: 'Pagamentos' },
];

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabKey>('projetos');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showInactiveOffer, setShowInactiveOffer] = useState(false);

  const { data: client, isLoading } = useClient(id);
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  if (!id) return <Navigate to="/clientes" replace />;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Cliente não encontrado.</p>
        <Link to="/clientes" className="mt-3 inline-block text-sm text-primary hover:underline dark:text-primary-200">
          Voltar para clientes
        </Link>
      </Card>
    );
  }

  const whatsappLink = buildWhatsAppLink(client.whatsapp);
  const status = (client.status ?? 'ativo') as keyof typeof clientStatusLabels;

  const handleUpdate = (formData: ClientFormData) => {
    updateClient.mutate(
      { id, input: { ...formData, joined_at: formData.joined_at || null } },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          showToast('Cliente atualizado.', 'success');
        },
        onError: () => showToast('Não foi possível atualizar o cliente.'),
      },
    );
  };

  const handleDelete = () => {
    deleteClient.mutate(id, {
      onSuccess: () => {
        showToast('Cliente excluído.', 'success');
        navigate('/clientes');
      },
      onError: (error: unknown) => {
        const pgError = error as { code?: string };
        setIsDeleteOpen(false);
        if (pgError.code === '23503') {
          setShowInactiveOffer(true);
        } else {
          showToast('Não foi possível excluir o cliente.');
        }
      },
    });
  };

  const handleMarkInactive = () => {
    updateClient.mutate(
      { id, input: { status: 'inativo' } },
      {
        onSuccess: () => {
          showToast('Cliente marcado como inativo.', 'success');
          setShowInactiveOffer(false);
        },
        onError: () => showToast('Não foi possível atualizar o cliente.'),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Link to="/clientes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">
        <ArrowLeft size={16} /> Voltar para clientes
      </Link>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{client.name}</h1>
              <Badge tone={clientStatusTone[status]}>{clientStatusLabels[status]}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {client.contact_name || 'Sem responsável'} · {client.city || 'Sem cidade'}
            </p>
          </div>
          <div className="flex gap-2">
            {whatsappLink ? (
              <a href={whatsappLink} target="_blank" rel="noopener">
                <Button variant="secondary" className="gap-2">
                  <MessageCircle size={16} /> WhatsApp
                </Button>
              </a>
            ) : (
              <Button variant="secondary" disabled title="Cliente sem WhatsApp cadastrado" className="gap-2">
                <MessageCircle size={16} /> Sem WhatsApp
              </Button>
            )}
            <Button variant="secondary" onClick={() => setIsEditOpen(true)} aria-label="Editar cliente">
              <Pencil size={16} />
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)} aria-label="Excluir cliente">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm dark:border-gray-800 sm:grid-cols-4">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">E-mail</dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{client.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Cliente desde</dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{formatDate(client.joined_at)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Recebido total</dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{formatCurrency(client.recebido_total)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Em aberto</dt>
            <dd className="mt-0.5 font-medium text-status-atrasado">{formatCurrency(client.em_aberto)}</dd>
          </div>
        </dl>

        {client.notes && (
          <p className="mt-4 whitespace-pre-wrap border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
            {client.notes}
          </p>
        )}
      </Card>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`min-h-touch shrink-0 border-b-2 px-4 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-primary text-primary dark:border-primary-300 dark:text-primary-200'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'projetos' && <ProjectsTab clientId={id} />}
      {tab === 'contratos' && <ContractsTab clientId={id} />}
      {tab === 'cobrancas' && <ChargesTab clientId={id} />}
      {tab === 'pagamentos' && <PaymentsTab clientId={id} />}

      {isEditOpen && (
        <Modal title="Editar cliente" onClose={() => setIsEditOpen(false)}>
          <ClientForm
            defaultValues={client}
            isSubmitting={updateClient.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
          />
        </Modal>
      )}

      {isDeleteOpen && (
        <ConfirmDialog
          title="Excluir cliente"
          description={`Tem certeza que deseja excluir "${client.name}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isLoading={deleteClient.isPending}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}

      {showInactiveOffer && (
        <ConfirmDialog
          title="Cliente com vínculos"
          description={`"${client.name}" tem projetos ou contratos vinculados e não pode ser excluído. Deseja marcá-lo como inativo em vez disso?`}
          confirmLabel="Marcar como inativo"
          variant="primary"
          isLoading={updateClient.isPending}
          onConfirm={handleMarkInactive}
          onCancel={() => setShowInactiveOffer(false)}
        />
      )}
    </div>
  );
}

function ProjectsTab({ clientId }: { clientId: string }) {
  const { data, isLoading } = useClientProjects(clientId);
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum projeto avulso ainda.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {data.map((project) => (
        <li key={project.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
            <p className="text-gray-500 dark:text-gray-400">{project.status}</p>
          </div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(project.amount)}</p>
        </li>
      ))}
    </ul>
  );
}

function ContractsTab({ clientId }: { clientId: string }) {
  const { data, isLoading } = useClientContracts(clientId);
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma mensalidade ainda.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {data.map((contract) => (
        <li key={contract.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{contract.service || 'Mensalidade'}</p>
            <p className="text-gray-500 dark:text-gray-400">
              Vencimento dia {contract.due_day} · desde {formatDate(contract.start_date)}
            </p>
          </div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(contract.monthly_amount)}</p>
        </li>
      ))}
    </ul>
  );
}

function ChargesTab({ clientId }: { clientId: string }) {
  const { data, isLoading } = useClientCharges(clientId);
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma cobrança ainda.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {data.map((charge) => (
        <li key={charge.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{charge.description || charge.project_name}</p>
            <p className="text-gray-500 dark:text-gray-400">Vencimento {formatDate(charge.due_date)}</p>
          </div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(charge.amount)}</p>
        </li>
      ))}
    </ul>
  );
}

function PaymentsTab({ clientId }: { clientId: string }) {
  const { data, isLoading } = useClientPayments(clientId);
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum pagamento de mensalidade ainda.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {data.map((payment) => (
        <li key={payment.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{payment.service || 'Mensalidade'}</p>
            <p className="text-gray-500 dark:text-gray-400">Referência {formatMonthYear(payment.reference_month)}</p>
          </div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(payment.amount)}</p>
        </li>
      ))}
    </ul>
  );
}
