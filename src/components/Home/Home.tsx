import React, { useState } from 'react';
import { ReportConfig } from '../../types/report';
import './Home.css';

interface HomeProps {
  onNewReport: () => void;
  onLoadReport: (config: ReportConfig) => void;
}

export const Home: React.FC<HomeProps> = ({ onNewReport, onLoadReport }) => {
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const handleLoadFromJSON = () => {
    try {
      const config = JSON.parse(jsonInput);
      onLoadReport(config);
      setShowLoadModal(false);
      setJsonInput('');
    } catch (error) {
      alert('Erro ao carregar JSON. Verifique o formato.');
      console.error(error);
    }
  };

  const handleLoadFromStorage = () => {
    const saved = localStorage.getItem('liveseo-report-config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        onLoadReport(config);
      } catch (error) {
        alert('Erro ao carregar relatório salvo.');
        console.error(error);
      }
    } else {
      alert('Nenhum relatório salvo encontrado.');
    }
  };

  const handleClearStorage = () => {
    if (confirm('Tem certeza que deseja limpar todos os relatórios salvos?')) {
      localStorage.removeItem('liveseo-report-config');
      alert('Relatórios salvos foram limpos.');
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <img 
            src="https://www.linx.com.br/app/uploads/2022/07/liveSEO-logo-aplicacao-principal-1-1.png" 
            alt="LiveSEO" 
            className="home-logo"
          />
          <h1>Sistema de Relatórios</h1>
          <p className="home-subtitle">Crie e personalize relatórios de análise de resultados</p>
        </div>

        <div className="home-actions">
          <div className="action-card" onClick={onNewReport}>
            <div className="action-icon">📄</div>
            <h3>Criar Novo Relatório</h3>
            <p>Comece do zero com um template padrão</p>
          </div>

          <div className="action-card" onClick={handleLoadFromStorage}>
            <div className="action-icon">📂</div>
            <h3>Carregar Relatório Salvo</h3>
            <p>Continue editando um relatório anterior</p>
          </div>

        
        </div>

        <div className="home-footer">
          <button className="btn-clear" onClick={handleClearStorage}>
            Limpar Relatórios Salvos
          </button>
        </div>
      </div>

      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Importar Relatório JSON</h2>
              <button className="modal-close" onClick={() => setShowLoadModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <label>
                Cole o JSON do relatório:
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{"id": "report-1", "name": "...", ...}'
                  rows={10}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowLoadModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleLoadFromJSON}>
                Carregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
