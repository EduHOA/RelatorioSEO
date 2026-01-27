import React, { useState } from 'react';
import { ReportConfig, ReportSection } from '../../types/report';
import { ReportRenderer } from '../ReportRenderer';
import { SectionList } from './SectionList';
import { SectionEditor } from './SectionEditor';
import './ReportEditor.css';

interface ReportEditorProps {
  initialConfig: ReportConfig;
  onSave: (config: ReportConfig) => void;
}

export const ReportEditor: React.FC<ReportEditorProps> = ({ initialConfig, onSave }) => {
  const [config, setConfig] = useState<ReportConfig>(initialConfig);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(true);

  const updateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    setConfig(prev => {
      const sections = prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      );
      const next = { ...prev, sections };
      const updatedSection = sections.find(s => s.id === sectionId);
      if (updatedSection?.type === 'header' && updatedSection.data) {
        const d = updatedSection.data as Record<string, unknown>;
        if (d.clientName !== undefined) next.clientName = String(d.clientName);
        if (d.periodInfo !== undefined) next.period = String(d.periodInfo);
        if (d.logo !== undefined) next.logo = d.logo ? String(d.logo) : next.logo;
      }
      return next;
    });
  };

  const addSection = (type: ReportSection['type']) => {
    const defaultDataForType: Record<string, unknown> = {};
    if (type === 'metrics' || type === 'kpiGrid') {
      defaultDataForType.comparisonPeriod = 'periodo_anterior';
      defaultDataForType.metrics = [];
    }
    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      type,
      title: type === 'kpiGrid' ? 'Principais Métricas' : type === 'metrics' ? 'Métricas' : `Nova Seção ${type}`,
      visible: true,
      order: config.sections.length,
      data: defaultDataForType,
    };

    setConfig(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));

    setSelectedSectionId(newSection.id);
  };

  const deleteSection = (sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
    }));
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };

  const reorderSections = (sectionId: string, newOrder: number) => {
    setConfig(prev => {
      const sections = [...prev.sections];
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return prev;

      const movedSection = sections[sectionIndex];
      const oldOrder = movedSection.order;

      // Se a nova ordem é a mesma, não faz nada
      if (oldOrder === newOrder) return prev;

      // Ajusta a ordem das outras seções
      sections.forEach(s => {
        if (s.id === sectionId) return;
        
        if (oldOrder < newOrder) {
          // Movendo para baixo
          if (s.order > oldOrder && s.order <= newOrder) {
            s.order -= 1;
          }
        } else {
          // Movendo para cima
          if (s.order >= newOrder && s.order < oldOrder) {
            s.order += 1;
          }
        }
      });

      movedSection.order = newOrder;

      return { ...prev, sections };
    });
  };

  const selectedSection = config.sections.find(s => s.id === selectedSectionId);

  return (
    <div className="report-editor">
      <header className="editor-header">
        <div className="editor-header-left">
          <span className="editor-brand">LiveSEO</span>
          <span className="editor-title">{config.clientName} · {config.period}</span>
        </div>
        <div className="editor-tabs">
          <button
            type="button"
            className={`editor-tab ${previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(true)}
            aria-pressed={previewMode}
          >
            <span className="tab-icon">👁</span>
            Visualizar
          </button>
          <button
            type="button"
            className={`editor-tab ${!previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(false)}
            aria-pressed={!previewMode}
          >
            <span className="tab-icon">✏️</span>
            Editar
          </button>
        </div>
        <div className="editor-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSave(config)}
          >
            Salvar relatório
          </button>
        </div>
      </header>

      <div className="editor-content">
        {previewMode ? (
          <div className="preview-wrapper">
            <div className="preview-paper">
              <ReportRenderer config={config} />
            </div>
          </div>
        ) : (
          <div className="editor-split">
            <aside className="editor-sidebar">
              <SectionList
                sections={config.sections}
                selectedId={selectedSectionId}
                onSelect={setSelectedSectionId}
                onToggleVisibility={(id) => {
                  const section = config.sections.find(s => s.id === id);
                  if (section) {
                    updateSection(id, { visible: !section.visible });
                  }
                }}
                onDelete={deleteSection}
                onReorder={reorderSections}
                onAdd={addSection}
              />
            </aside>
            <main className="editor-main">
              {selectedSection ? (
                <SectionEditor
                  section={selectedSection}
                  onUpdate={(updates) => updateSection(selectedSection.id, updates)}
                />
              ) : (
                <div className="no-selection">
                  <div className="no-selection-illustration">📄</div>
                  <h3>Selecione uma seção</h3>
                  <p>Clique em uma seção na barra lateral para editar o conteúdo, ou adicione uma nova seção.</p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
