import React, { useState } from 'react';
import { Home } from './components/Home/Home';
import { ClientSetup } from './components/ClientSetup/ClientSetup';
import { ReportEditor } from './components/ReportEditor/ReportEditor';
import { ReportConfig } from './types/report';
import { exportToPDF, exportToHTML } from './utils/exportUtils';
import './App.css';

function App() {
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showClientSetup, setShowClientSetup] = useState(false);

  const handleSave = (newConfig: ReportConfig) => {
    setConfig(newConfig);
    // Salva no localStorage
    localStorage.setItem('liveseo-report-config', JSON.stringify(newConfig));
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
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
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

  const handleNewReport = () => {
    setShowClientSetup(true);
  };

  const handleClientSetupComplete = (newConfig: ReportConfig) => {
    setConfig(newConfig);
    setShowClientSetup(false);
    setShowEditor(true);
  };

  const handleClientSetupBack = () => {
    setShowClientSetup(false);
  };

  const handleLoadReport = (loadedConfig: ReportConfig) => {
    setConfig(loadedConfig);
    setShowEditor(true);
  };

  const handleBackToHome = () => {
    if (config) {
      // Salva antes de voltar
      localStorage.setItem('liveseo-report-config', JSON.stringify(config));
    }
    setShowEditor(false);
    setConfig(null);
  };

  if (showClientSetup) {
    return (
      <ClientSetup
        onComplete={handleClientSetupComplete}
        onBack={handleClientSetupBack}
      />
    );
  }

  if (!showEditor || !config) {
    return <Home onNewReport={handleNewReport} onLoadReport={handleLoadReport} />;
  }

  return (
    <div className="app">
      <ReportEditor
        initialConfig={config}
        onSave={handleSave}
      />
      <div className="export-buttons">
        <button className="btn btn-secondary" onClick={handleBackToHome}>
          ← Voltar ao Início
        </button>
        <button className="btn btn-primary" onClick={handleExportPDF}>
          Exportar PDF
        </button>
        <button className="btn btn-primary" onClick={handleExportHTML}>
          Exportar HTML
        </button>
      </div>
    </div>
  );
}

export default App;
