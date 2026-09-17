import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Layers, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatPercent } from '@/lib/format';
import { formatDate } from '@/lib/dates';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { useSettings } from '@/features/settings/hooks';
import {
  useChargesByProject,
  useCreateCharges,
  useDeleteCharge,
  useMarkChargeAsPaid,
  useUpdateCharge,
} from '@/features/charges/hooks';
import { ChargeCard } from '@/features/charges/components/ChargeCard';
import { ChargeForm, type ChargeFormData } from '@/features/charges/components/ChargeForm';
import { MarkAsPaidDialog } from '@/features/charges/components/MarkAsPaidDialog';
import { buildChargeWhatsAppMessage } from '@/features/charges/message';
import type { ChargeListItem } from '@/features/charges/api';
import { billingTypeLabels, projectStatusLabels, projectStatusTone } from '../projectStatus';
import { useDeleteProject, useProject, useUpdateProject } from '../hooks';
import { ProjectForm, type ProjectFormData } from '../components/ProjectForm';
import { GenerateInstallmentsModal } from '../components/GenerateInstallmentsModal';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isInstallmentsOpen, setIsInstallmentsOpen] = useState(false);
  const [isAddChargeOpen, setIsAddChargeOpen] = useState(false);
  const [editCharge, setEditCharge] = useState<ChargeListItem | null>(null);
  const [deleteCharge, setDeleteChargeTarget] = useState<ChargeListItem | null>(null);
  const [payCharge, setPayCharge] = useState<ChargeListItem | null>(null);

  const { data: project, isLoading } = useProject(id);
  const { data: charges, isLoading: isLoadingCharges } = useChargesByProject(id);
  const { data: settings } = useSettings();

  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createCharges = useCreateCharges();
  const updateCharge = useUpdateCharge();
  const deleteChargeMutation = useDeleteCharge();
  const markAsPaid = useMarkChargeAsPaid();

  if (!id) return <Navigate to="/projetos" replace />;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Projeto não encontrado.</p>
        <Link to="/projetos" className="mt-3 inline-block text-sm text-primary hover:underline dark:text-primary-200">
          Voltar para projetos
        </Link>
      </Card>
    );
  }

  const status = (project.status ?? 'orcamento') as keyof typeof projectStatusLabels;

  const handleUpdate = (formData: ProjectFormData) => {
    updateProject.mutate(
      {
        id,
        input: {
          ...formData,
          amount: formData.amount ? Number(formData.amount) : null,
          start_date: formData.start_date || null,
          due_date: formData.due_date || null,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          showToast('Projeto atualizado.', 'success');
        },
        onError: () => showToast('Não foi possível atualizar o projeto.'),
      },
    );
  };

  const handleDelete = () => {
    deleteProject.mutate(id, {
      onSuccess: () => {
        showToast('Projeto excluído.', 'success');
        navigate('/projetos');
      },
      onError: () => showToast('Não foi possível excluir o projeto.'),
    });
  };

  const handleGenerateInstallments = (installments: { amount: number; dueDate: string }[]) => {
    createCharges.mutate(
      installments.map((item, index) => ({
        project_id: id,
        description: `Parcela ${index + 1}/${installments.length}`,
        amount: item.amount,
        due_date: item.dueDate,
      })),
      {
        onSuccess: () => {
          setIsInstallmentsOpen(false);
          showToast('Parcelas geradas.', 'success');
        },
        onError: () => showToast('Não foi possível gerar as parcelas.'),
      },
    );
  };

  const handleAddCharge = (formData: ChargeFormData) => {
    createCharges.mutate(
      [
        {
          ...formData,
          amount: Number(formData.amount),
          project_id: id,
          due_date: formData.due_date || null,
          paid_at: formData.paid_at || null,
        },
      ],
      {
        onSuccess: () => {
          setIsAddChargeOpen(false);
          showToast('Cobrança adicionada.', 'success');
        },
        onError: () => showToast('Não foi possível salvar a cobrança.'),
      },
    );
  };

  const handleUpdateCharge = (formData: ChargeFormData) => {
    if (!editCharge) return;
    updateCharge.mutate(
      {
        id: editCharge.id,
        input: {
          ...formData,
          amount: Number(formData.amount),
          due_date: formData.due_date || null,
          paid_at: formData.paid_at || null,
        },
      },
      {
        onSuccess: () => {
          setEditCharge(null);
          showToast('Cobrança atualizada.', 'success');
        },
        onError: () => showToast('Não foi possível atualizar a cobrança.'),
      },
    );
  };

  const handleDeleteCharge = () => {
    if (!deleteCharge) return;
    deleteChargeMutation.mutate(deleteCharge.id, {
      onSuccess: () => {
        showToast('Cobrança excluída.', 'success');
        setDeleteChargeTarget(null);
      },
      onError: () => showToast('Não foi possível excluir a cobrança.'),
    });
  };

  const handleConfirmPaid = (paidAt: string, paymentMethod: string) => {
    if (!payCharge) return;
    markAsPaid.mutate(
      { id: payCharge.id, paidAt, paymentMethod: paymentMethod || null },
      {
        onSuccess: () => {
          showToast('Cobrança marcada como paga.', 'success');
          setPayCharge(null);
        },
        onError: () => showToast('Não foi possível marcar como pago.'),
      },
    );
  };

  const handleWhatsApp = (charge: ChargeListItem) => {
    const link = buildWhatsAppLink(charge.whatsapp, settings ? buildChargeWhatsAppMessage(charge, settings) : undefined);
    if (!link) {
      showToast('Cliente sem WhatsApp cadastrado.');
      return;
    }
    window.open(link, '_blank', 'noopener');
  };

  return (
    <div className="flex flex-col gap-4">
      <Link to="/projetos" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">
        <ArrowLeft size={16} /> Voltar para projetos
      </Link>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{project.name}</h1>
              <Badge tone={projectStatusTone[status]}>{projectStatusLabels[status]}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {project.client_name} · {project.service || 'Sem serviço definido'} ·{' '}
              {billingTypeLabels[(project.billing_type ?? 'unico') as keyof typeof billingTypeLabels]}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsEditOpen(true)} aria-label="Editar projeto">
              <Pencil size={16} />
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)} aria-label="Excluir projeto">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Recebido</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(project.total_recebido)} de {formatCurrency(project.total_lancado)} (
              {formatPercent(project.percentual_recebido)})
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar percent={project.percentual_recebido ?? 0} />
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm dark:border-gray-800 sm:grid-cols-4">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Início</dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{formatDate(project.start_date)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Prazo</dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{formatDate(project.due_date)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Valor total</dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{formatCurrency(project.amount)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Saldo</dt>
            <dd className="mt-0.5 font-medium text-status-atrasado">{formatCurrency(project.saldo)}</dd>
          </div>
        </dl>

        {project.notes && (
          <p className="mt-4 whitespace-pre-wrap border-t border-gray-100 pt-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
            {project.notes}
          </p>
        )}
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold">Cobranças do projeto</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsAddChargeOpen(true)} className="gap-2">
            Adicionar cobrança
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsInstallmentsOpen(true)}
            disabled={!project.amount}
            title={!project.amount ? 'Defina o valor do projeto antes de gerar parcelas.' : undefined}
            className="gap-2"
          >
            <Layers size={16} /> Gerar parcelas
          </Button>
        </div>
      </div>

      {isLoadingCharges ? (
        <Skeleton className="h-24 w-full" />
      ) : !charges || charges.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nenhuma cobrança ainda"
          description="Gere parcelas ou adicione uma cobrança avulsa para este projeto."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {charges.map((charge) => (
            <ChargeCard
              key={charge.id}
              charge={charge}
              onEdit={() => setEditCharge(charge)}
              onDelete={() => setDeleteChargeTarget(charge)}
              onPay={() => setPayCharge(charge)}
              onWhatsApp={() => handleWhatsApp(charge)}
            />
          ))}
        </div>
      )}

      {isEditOpen && (
        <Modal title="Editar projeto" onClose={() => setIsEditOpen(false)}>
          <ProjectForm
            defaultValues={project}
            isSubmitting={updateProject.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
          />
        </Modal>
      )}

      {isDeleteOpen && (
        <ConfirmDialog
          title="Excluir projeto"
          description={`Tem certeza que deseja excluir "${project.name}"? As cobranças lançadas neste projeto também serão excluídas. Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isLoading={deleteProject.isPending}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}

      {isInstallmentsOpen && project.amount && (
        <GenerateInstallmentsModal
          totalAmount={project.amount}
          isLoading={createCharges.isPending}
          onConfirm={handleGenerateInstallments}
          onCancel={() => setIsInstallmentsOpen(false)}
        />
      )}

      {isAddChargeOpen && (
        <Modal title="Adicionar cobrança" onClose={() => setIsAddChargeOpen(false)}>
          <ChargeForm
            fixedProjectId={id}
            isSubmitting={createCharges.isPending}
            onSubmit={handleAddCharge}
            onCancel={() => setIsAddChargeOpen(false)}
          />
        </Modal>
      )}

      {editCharge && (
        <Modal title="Editar cobrança" onClose={() => setEditCharge(null)}>
          <ChargeForm
            defaultValues={editCharge}
            fixedProjectId={id}
            isSubmitting={updateCharge.isPending}
            onSubmit={handleUpdateCharge}
            onCancel={() => setEditCharge(null)}
          />
        </Modal>
      )}

      {deleteCharge && (
        <ConfirmDialog
          title="Excluir cobrança"
          description={`Tem certeza que deseja excluir "${deleteCharge.description || 'esta cobrança'}"?`}
          confirmLabel="Excluir"
          isLoading={deleteChargeMutation.isPending}
          onConfirm={handleDeleteCharge}
          onCancel={() => setDeleteChargeTarget(null)}
        />
      )}

      {payCharge && (
        <MarkAsPaidDialog
          isLoading={markAsPaid.isPending}
          onConfirm={handleConfirmPaid}
          onCancel={() => setPayCharge(null)}
        />
      )}
    </div>
  );
}
