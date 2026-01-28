import { useState } from 'react';
import {
  BrowserRouter,
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
import { ROUTES } from './routes';
import './App.css';

const STORAGE_KEY = 'liveseo-report-config';

function persistConfig(config: ReportConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function loadConfigFromStorage(): ReportConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReportConfig) : null;
  } catch {
    return null;
  }
}

function HomePage() {
  const navigate = useNavigate();

  return (
    <Home
      onNewReport={() => navigate(ROUTES.NEW_REPORT)}
      onLoadReport={(config) => {
        persistConfig(config);
        navigate(ROUTES.EDITOR, { state: { config } });
      }}
    />
  );
}

function ClientSetupPage() {
  const navigate = useNavigate();

  return (
    <ClientSetup
      onComplete={(config) => {
        persistConfig(config);
        navigate(ROUTES.EDITOR, { state: { config } });
      }}
      onBack={() => navigate(ROUTES.HOME)}
    />
  );
}

function EditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateConfig = (location.state as { config?: ReportConfig } | undefined)?.config;
  const [config, setConfig] = useState<ReportConfig | null>(
    () => stateConfig ?? loadConfigFromStorage()
  );

  const handleSave = (newConfig: ReportConfig) => {
    setConfig(newConfig);
    persistConfig(newConfig);
    alert('Relatório salvo com sucesso!');
  };

  const handleExportPDF = async () => {
    if (!config) return;
    try {
      const reportContainer = document.getElementById('report-export');
      if (reportContainer) {
        await exportToPDF('report-export', `relatorio-${config.clientName}-${Date.now()}.pdf`);
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
      exportToHTML(htmlContent, `relatorio-${config.clientName}-${Date.now()}.html`);
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
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.NEW_REPORT} element={<ClientSetupPage />} />
      <Route path={ROUTES.EDITOR} element={<EditorPage />} />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
