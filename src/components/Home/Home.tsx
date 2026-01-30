import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportConfig } from '../../types/report';
import {
  getReportHistory,
  deleteReportFromHistory,
  clearReportHistory,
} from '../../utils/reportHistory';
import { Modal } from '../Modal/Modal';
import './Home.css';

interface HomeProps {
  onNewReport: () => void;
  onLoadReport: (config: ReportConfig) => void;
  onImportReport: (config: ReportConfig) => void;
}

export const Home: React.FC<HomeProps> = ({ onNewReport, onLoadReport, onImportReport }) => {
  const [reports, setReports] = useState<ReportConfig[]>(() => getReportHistory());
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string } | null>(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const refreshList = useCallback(() => {
    setReports(getReportHistory());
  }, []);

  const handleLoadFromJSON = () => {
    try {
      const config = JSON.parse(jsonInput) as ReportConfig;
      if (!config.id) config.id = `report-${Date.now()}`;
      onImportReport(config);
      setShowLoadModal(false);
      setJsonInput('');
      refreshList();
    } catch (error) {
      alert('Erro ao carregar JSON. Verifique o formato.');
      console.error(error);
    }
  };

  const handleOpenReport = (config: ReportConfig) => {
    onLoadReport(config);
  };

  const handleDeleteClick = (e: React.MouseEvent, r: ReportConfig) => {
    e.stopPropagation();
    setDeleteModal({ open: true, id: r.id, name: r.name });
  };

  const handleConfirmDelete = () => {
    if (deleteModal) {
      deleteReportFromHistory(deleteModal.id);
      refreshList();
      setDeleteModal(null);
    }
  };

  const handleClearAllClick = () => {
    setClearModalOpen(true);
  };

  const handleConfirmClearAll = () => {
    clearReportHistory();
    setReports([]);
    setClearModalOpen(false);
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <img
            src="https://www.linx.com.br/app/uploads/2022/07/liveSEO-logo-aplicacao-principal-1-1.png"
            alt="Relatórios liveSEO"
            className="home-logo"
          />
          <h1>Relatórios liveSEO</h1>
          <p className="home-subtitle">Crie e personalize relatórios de análise de resultados</p>
        </div>

        <div className="home-actions">
          <div className="action-card" onClick={onNewReport}>
            <div className="action-icon">📄</div>
            <h3>Criar Novo Relatório</h3>
            <p>Comece do zero com um template padrão</p>
          </div>
        </div>

        <section className="home-history">
          <h2 className="home-history-title">Histórico de Relatórios</h2>
          {reports.length === 0 ? (
            <p className="home-history-empty">
              Nenhum relatório salvo. Crie um novo ou importe de JSON.
            </p>
          ) : (
            <ul className="report-list">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="report-list-item"
                  onClick={() => handleOpenReport(r)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenReport(r);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="report-list-item-info">
                    <strong>{r.name}</strong>
                    <span className="report-list-item-meta">
                      {r.clientName} · {r.period}
                    </span>
                    <span className="report-list-item-date">
                      {r.metadata?.updatedAt
                        ? format(new Date(r.metadata.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })
                        : '—'}
                    </span>
                  </div>
                  <div className="report-list-item-actions">
                    <button
                      type="button"
                      className="btn-report-open"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReport(r);
                      }}
                      title="Abrir e editar"
                    >
                      Abrir
                    </button>
                    <button
                      type="button"
                      className="btn-report-delete"
                      onClick={(e) => handleDeleteClick(e, r)}
                      title="Excluir do histórico"
                      aria-label={`Excluir ${r.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="home-footer">
          <button type="button" className="btn-import-json" onClick={() => setShowLoadModal(true)}>
            Importar relatório de JSON
          </button>
          <button type="button" className="btn-clear" onClick={handleClearAllClick}>
            Limpar todo o histórico
          </button>
        </div>
      </div>

      <Modal
        open={deleteModal?.open ?? false}
        onClose={() => setDeleteModal(null)}
        title="Excluir relatório do histórico?"
        message={
          deleteModal ? (
            <>
              O relatório <strong>"{deleteModal.name}"</strong> será removido do histórico e não
              poderá ser recuperado. Deseja continuar?
            </>
          ) : (
            ''
          )
        }
        variant="danger"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
      />

      <Modal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Limpar todo o histórico?"
        message="Todos os relatórios salvos serão removidos. Esta ação não pode ser desfeita. Deseja continuar?"
        variant="danger"
        confirmLabel="Limpar tudo"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmClearAll}
      />

      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Importar Relatório JSON</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowLoadModal(false)}
                aria-label="Fechar"
              >
                ×
              </button>
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
              <button type="button" className="btn btn-secondary" onClick={() => setShowLoadModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={handleLoadFromJSON}>
                Carregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
