import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useToast } from '@/components/ui/Toast';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { formatCurrency, formatPercent } from '@/lib/format';
import { projectStatusLabels, projectStatusOptions, projectStatusTone } from '../projectStatus';
import { useCreateProject, useProjects } from '../hooks';
import { ProjectForm, type ProjectFormData } from '../components/ProjectForm';
import { PROJECTS_PAGE_SIZE } from '../api';

type StatusFilter = 'todos' | (typeof projectStatusOptions)[number];

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { showToast } = useToast();

  const { data, isLoading, isFetching } = useProjects({
    page,
    search: debouncedSearch || undefined,
    status,
  });

  const createProject = useCreateProject();
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  function updateFilters(next: Partial<{ search: string; status: StatusFilter }>) {
    if (next.search !== undefined) setSearch(next.search);
    if (next.status !== undefined) setStatus(next.status);
    setPage(1);
  }

  function handleCreate(formData: ProjectFormData) {
    createProject.mutate(
      {
        ...formData,
        amount: formData.amount ? Number(formData.amount) : null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          showToast('Projeto adicionado.', 'success');
        },
        onError: () => showToast('Não foi possível salvar o projeto.'),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-lg font-semibold">Projetos</h1>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} /> Adicionar projeto
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-9 text-gray-400" />
          <Input
            label="Buscar por nome"
            className="pl-9"
            placeholder="Digite o nome do projeto"
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
          {projectStatusOptions.map((option) => (
            <option key={option} value={option}>
              {projectStatusLabels[option]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Nenhum projeto encontrado"
          description={
            search || status !== 'todos'
              ? 'Tente ajustar a busca ou os filtros.'
              : 'Comece adicionando o primeiro projeto.'
          }
          actionLabel="Adicionar projeto"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:hidden">
            {items.map((project) => {
              const status = project.status as keyof typeof projectStatusTone;
              return (
                <Link
                  key={project.id}
                  to={`/projetos/${project.id}`}
                  className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                    <Badge tone={projectStatusTone[status]}>{projectStatusLabels[status]}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{project.client_name}</p>
                  <ProgressBar percent={project.percentual_recebido ?? 0} />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(project.total_recebido)} de {formatCurrency(project.total_lancado)} (
                    {formatPercent(project.percentual_recebido)})
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <Table>
              <thead>
                <tr>
                  <Th>Projeto</Th>
                  <Th>Cliente</Th>
                  <Th>Status</Th>
                  <Th>Recebido</Th>
                  <Th>Progresso</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((project) => {
                  const status = project.status as keyof typeof projectStatusTone;
                  return (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <Td>
                        <Link
                          to={`/projetos/${project.id}`}
                          className="font-medium text-primary hover:underline dark:text-primary-200"
                        >
                          {project.name}
                        </Link>
                      </Td>
                      <Td>{project.client_name}</Td>
                      <Td>
                        <Badge tone={projectStatusTone[status]}>{projectStatusLabels[status]}</Badge>
                      </Td>
                      <Td>
                        {formatCurrency(project.total_recebido)} / {formatCurrency(project.total_lancado)}
                      </Td>
                      <Td className="w-48">
                        <div className="flex items-center gap-2">
                          <ProgressBar percent={project.percentual_recebido ?? 0} />
                          <span className="w-10 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                            {formatPercent(project.percentual_recebido)}
                          </span>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <Pagination page={page} pageSize={PROJECTS_PAGE_SIZE} total={total} onPageChange={setPage} />
          {isFetching && !isLoading && (
            <p className="text-xs text-gray-400" role="status">
              Atualizando...
            </p>
          )}
        </>
      )}

      {isCreateOpen && (
        <Modal title="Adicionar projeto" onClose={() => setIsCreateOpen(false)}>
          <ProjectForm
            isSubmitting={createProject.isPending}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
