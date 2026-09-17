import { useEffect, useRef, useState } from 'react';
import { Database, Download, FileUp, PlusCircle, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/app/providers/AuthProvider';
import { asStringList, type Settings } from '../api';
import { useSettings, useUpdateSettings } from '../hooks';
import { ListEditor } from '../components/ListEditor';
import { exportAllDataCSV, exportAllDataJSON } from '../export';
import { importClientsCSV } from '../import';
import { clearSampleData, hasSampleData, loadSampleData } from '../sampleData';

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: settings, isLoading } = useSettings();

  if (isLoading || !settings) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Configurações</h1>
      <SettingsForm settings={settings} />
      <DataToolsCard userId={user?.id} />
    </div>
  );
}

function SettingsForm({ settings }: { settings: Settings }) {
  const { showToast } = useToast();
  const updateSettings = useUpdateSettings();

  const [servicosAvulsos, setServicosAvulsos] = useState<string[]>(() => asStringList(settings.servicos_avulsos));
  const [servicosRecorrentes, setServicosRecorrentes] = useState<string[]>(() =>
    asStringList(settings.servicos_recorrentes),
  );
  const [categorias, setCategorias] = useState<string[]>(() => asStringList(settings.categorias));
  const [formasPagamento, setFormasPagamento] = useState<string[]>(() => asStringList(settings.formas_pagamento));

  const [msgAvulsoAVencer, setMsgAvulsoAVencer] = useState(settings.msg_avulso_a_vencer);
  const [msgAvulsoAtrasado, setMsgAvulsoAtrasado] = useState(settings.msg_avulso_atrasado);
  const [msgMensalidade, setMsgMensalidade] = useState(settings.msg_mensalidade);

  function handleSaveLists() {
    updateSettings.mutate(
      {
        servicos_avulsos: servicosAvulsos,
        servicos_recorrentes: servicosRecorrentes,
        categorias,
        formas_pagamento: formasPagamento,
      },
      {
        onSuccess: () => showToast('Listas salvas.', 'success'),
        onError: () => showToast('Não foi possível salvar as listas.'),
      },
    );
  }

  function handleSaveMessages() {
    updateSettings.mutate(
      {
        msg_avulso_a_vencer: msgAvulsoAVencer,
        msg_avulso_atrasado: msgAvulsoAtrasado,
        msg_mensalidade: msgMensalidade,
      },
      {
        onSuccess: () => showToast('Modelos de mensagem salvos.', 'success'),
        onError: () => showToast('Não foi possível salvar os modelos.'),
      },
    );
  }

  return (
    <>
      <Card className="flex flex-col gap-5">
        <h2 className="text-base font-semibold">Listas editáveis</h2>
        <ListEditor label="Serviços avulsos" items={servicosAvulsos} onChange={setServicosAvulsos} />
        <ListEditor label="Serviços recorrentes" items={servicosRecorrentes} onChange={setServicosRecorrentes} />
        <ListEditor label="Categorias do financeiro" items={categorias} onChange={setCategorias} />
        <ListEditor label="Formas de pagamento" items={formasPagamento} onChange={setFormasPagamento} />
        <div className="flex justify-end">
          <Button onClick={handleSaveLists} isLoading={updateSettings.isPending}>
            Salvar listas
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Modelos de mensagem do WhatsApp</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Placeholders disponíveis: {'{nome}'}, {'{valor}'}, {'{descricao}'}, {'{vencimento}'}, {'{meses}'}, {'{servico}'}
        </p>
        <MessageField label="Avulso a vencer" value={msgAvulsoAVencer} onChange={setMsgAvulsoAVencer} />
        <MessageField label="Avulso atrasado" value={msgAvulsoAtrasado} onChange={setMsgAvulsoAtrasado} />
        <MessageField label="Mensalidade" value={msgMensalidade} onChange={setMsgMensalidade} />
        <div className="flex justify-end">
          <Button onClick={handleSaveMessages} isLoading={updateSettings.isPending}>
            Salvar modelos
          </Button>
        </div>
      </Card>
    </>
  );
}

function MessageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
      {label}
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
    </label>
  );
}

function DataToolsCard({ userId }: { userId: string | undefined }) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isClearingSample, setIsClearingSample] = useState(false);
  const [confirmClearSample, setConfirmClearSample] = useState(false);
  const [sampleExists, setSampleExists] = useState<boolean | null>(null);

  useEffect(() => {
    hasSampleData().then(setSampleExists).catch(() => setSampleExists(null));
  }, []);

  async function handleExportJSON() {
    setIsExportingJSON(true);
    try {
      await exportAllDataJSON();
    } catch {
      showToast('Não foi possível exportar os dados em JSON.');
    } finally {
      setIsExportingJSON(false);
    }
  }

  async function handleExportCSV() {
    setIsExportingCSV(true);
    try {
      await exportAllDataCSV();
    } catch {
      showToast('Não foi possível exportar os dados em CSV.');
    } finally {
      setIsExportingCSV(false);
    }
  }

  async function handleImportFile(file: File) {
    if (!userId) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const result = await importClientsCSV(text, userId);
      showToast(
        `${result.imported} cliente(s) importado(s)${result.skipped ? `, ${result.skipped} ignorado(s)` : ''}.`,
        'success',
      );
      if (result.errors.length > 0) {
        showToast(`${result.errors.length} erro(s) durante a importação.`);
      }
    } catch {
      showToast('Não foi possível importar o arquivo.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleLoadSample() {
    if (!userId) return;
    setIsLoadingSample(true);
    try {
      await loadSampleData(userId);
      setSampleExists(true);
      showToast('Dados de exemplo carregados.', 'success');
    } catch {
      showToast('Não foi possível carregar os dados de exemplo.');
    } finally {
      setIsLoadingSample(false);
    }
  }

  async function handleClearSample() {
    setIsClearingSample(true);
    try {
      await clearSampleData();
      setSampleExists(false);
      setConfirmClearSample(false);
      showToast('Dados de exemplo apagados.', 'success');
    } catch {
      showToast('Não foi possível apagar os dados de exemplo.');
    } finally {
      setIsClearingSample(false);
    }
  }

  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-base font-semibold">Dados</h2>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Exportar</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleExportJSON} isLoading={isExportingJSON} className="gap-2">
            <Download size={16} /> Exportar JSON
          </Button>
          <Button variant="secondary" onClick={handleExportCSV} isLoading={isExportingCSV} className="gap-2">
            <Download size={16} /> Exportar CSV
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Importar clientes (CSV)</p>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Colunas aceitas: nome (ou name), responsavel, whatsapp, email, cidade, origem, status, observacoes.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImportFile(file);
          }}
          className="hidden"
        />
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          isLoading={isImporting}
          className="gap-2"
        >
          <FileUp size={16} /> Escolher arquivo CSV
        </Button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Dados de exemplo</p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={handleLoadSample}
            isLoading={isLoadingSample}
            disabled={sampleExists === true}
            className="gap-2"
          >
            <PlusCircle size={16} /> Carregar dados de exemplo
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmClearSample(true)}
            disabled={sampleExists !== true}
            className="gap-2"
          >
            <Trash2 size={16} /> Apagar dados de exemplo
          </Button>
        </div>
      </div>

      {confirmClearSample && (
        <ConfirmDialog
          title="Apagar dados de exemplo"
          description={`Isso vai excluir "Cliente Exemplo Ltda" e tudo vinculado a ele (projeto, cobranças, contrato e pagamentos). Essa ação não pode ser desfeita.`}
          confirmLabel="Apagar"
          isLoading={isClearingSample}
          onConfirm={handleClearSample}
          onCancel={() => setConfirmClearSample(false)}
        />
      )}

      <p className="flex items-center gap-2 text-xs text-gray-400">
        <Database size={14} /> Todas as operações desta seção afetam diretamente o banco de dados.
      </p>
    </Card>
  );
}
