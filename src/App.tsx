import { useState, useEffect } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Home } from './components/Home/Home';
import { ClientSetup } from './components/ClientSetup/ClientSetup';
import { ReportEditor } from './components/ReportEditor/ReportEditor';
import { ReportConfig } from './types/report';
import { exportToPDF, exportToHTML } from './utils/exportUtils';
import { getReportHistory, saveReportToHistory } from './utils/reportHistory';
import { Modal } from './components/Modal/Modal';
import { ROUTES } from './routes';
import './App.css';

function persistConfig(config: ReportConfig) {
  saveReportToHistory(config);
}

function LoadingOverlay() {
  return (
    <div className="app-loading-overlay" role="status" aria-live="polite">
      <div className="app-loading-spinner" />
      <p className="app-loading-text">Carregando relatório...</p>
    </div>
  );
}

function HomePage({ setLoading }: { setLoading: (v: boolean) => void }) {
  const navigate = useNavigate();

  return (
    <Home
      onNewReport={() => navigate(ROUTES.NEW_REPORT)}
      onLoadReport={(config) => {
        setLoading(true);
        navigate(ROUTES.EDITOR, { state: { config } });
      }}
      onImportReport={(config) => {
        setLoading(true);
        persistConfig(config);
        navigate(ROUTES.EDITOR, { state: { config } });
      }}
    />
  );
}

function ClientSetupPage({ setLoading }: { setLoading: (v: boolean) => void }) {
  const navigate = useNavigate();

  return (
    <ClientSetup
      onComplete={(config) => {
        setLoading(true);
        persistConfig(config);
        navigate(ROUTES.EDITOR, { state: { config } });
      }}
      onBack={() => navigate(ROUTES.HOME)}
    />
  );
}

function EditorPage({ setLoading }: { setLoading: (v: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const stateConfig = (location.state as { config?: ReportConfig } | undefined)?.config;
  const [config, setConfig] = useState<ReportConfig | null>(() => {
    if (stateConfig) return stateConfig;
    const history = getReportHistory();
    return history.length > 0 ? history[0] : null;
  });
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [pdfSavedFilename, setPdfSavedFilename] = useState<string | null>(null);
  const [htmlSavedFilename, setHtmlSavedFilename] = useState<string | null>(null);

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  const handleSave = (newConfig: ReportConfig) => {
    setConfig(newConfig);
    persistConfig(newConfig);
    setSavedModalOpen(true);
  };

  const handleExportPDF = async () => {
    if (!config) return;
    const filename = `relatorio-${config.clientName}-${Date.now()}.pdf`;
    try {
      const reportContainer = document.getElementById('report-export');
      if (reportContainer) {
        await exportToPDF('report-export', filename);
        setPdfSavedFilename(filename);
      } else {
        alert('Nenhum relatório encontrado para exportar. Certifique-se de estar no modo de visualização.');
      }
    } catch (error) {
      alert('Erro ao exportar PDF. Verifique o console para mais detalhes.');
      console.error(error);
    }
  };

  const handleExportHTML = () => {
    if (!config) return;
    const reportContainer = document.querySelector('.report-container');
    const filename = `relatorio-${config.clientName}-${Date.now()}.html`;
    if (reportContainer) {
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name}</title>
  <style>
    ${Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n')}
  </style>
</head>
<body>
  ${reportContainer.outerHTML}
</body>
</html>
      `;
      exportToHTML(htmlContent, filename);
      setHtmlSavedFilename(filename);
    }
  };

  const handleBackToHome = () => {
    if (config) persistConfig(config);
    navigate(ROUTES.HOME);
  };

  if (!config) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="app">
      <ReportEditor initialConfig={config} onSave={handleSave} />
      <div className="export-buttons">
        <button type="button" className="btn btn-secondary" onClick={handleBackToHome}>
          ← Voltar ao Início
        </button>
        <button type="button" className="btn btn-primary" onClick={handleExportPDF}>
          Exportar PDF
        </button>
        <button type="button" className="btn btn-primary" onClick={handleExportHTML}>
          Exportar HTML
        </button>
      </div>

      <Modal
        open={savedModalOpen}
        onClose={() => setSavedModalOpen(false)}
        title="Relatório salvo"
        message="As alterações foram salvas com sucesso. O relatório foi atualizado no histórico."
        variant="success"
        confirmLabel="OK"
      />

      <Modal
        open={pdfSavedFilename !== null}
        onClose={() => setPdfSavedFilename(null)}
        title="PDF salvo"
        message={
          pdfSavedFilename ? (
            <>
              O relatório foi exportado em PDF com sucesso.
              <br />
              <br />
              Arquivo: <strong>{pdfSavedFilename}</strong>
              <br />
              O arquivo foi salvo na pasta de Downloads do seu navegador (ou na pasta padrão de
              download configurada).
            </>
          ) : (
            ''
          )
        }
        variant="success"
        confirmLabel="OK"
      />

      <Modal
        open={htmlSavedFilename !== null}
        onClose={() => setHtmlSavedFilename(null)}
        title="HTML salvo"
        message={
          htmlSavedFilename ? (
            <>
              O relatório foi exportado em HTML com sucesso.
              <br />
              <br />
              Arquivo: <strong>{htmlSavedFilename}</strong>
              <br />
              O arquivo foi salvo na pasta de Downloads do seu navegador (ou na pasta padrão de
              download configurada).
            </>
          ) : (
            ''
          )
        }
        variant="success"
        confirmLabel="OK"
      />
    </div>
  );
}

function AppRoutes({ setLoading }: { setLoading: (v: boolean) => void }) {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage setLoading={setLoading} />} />
      <Route path={ROUTES.NEW_REPORT} element={<ClientSetupPage setLoading={setLoading} />} />
      <Route path={ROUTES.EDITOR} element={<EditorPage setLoading={setLoading} />} />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <HashRouter>
        <AppRoutes setLoading={setIsLoading} />
      </HashRouter>
    </>
  );
}

export default App;
