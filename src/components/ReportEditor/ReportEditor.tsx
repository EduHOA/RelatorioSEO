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
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    }));
  };

  const addSection = (type: ReportSection['type']) => {
    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      type,
      title: `Nova Seção ${type}`,
      visible: true,
      order: config.sections.length,
      data: {},
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
      <div className="editor-header">
        <h1>Editor de Relatórios - LiveSEO</h1>
        <div className="editor-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Editar' : 'Visualizar'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onSave(config)}
          >
            Salvar Relatório
          </button>
        </div>
      </div>

      <div className="editor-content">
        {previewMode ? (
          <div className="preview-container">
            <ReportRenderer config={config} />
          </div>
        ) : (
          <>
            <div className="editor-sidebar">
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
            </div>

            <div className="editor-main">
              {selectedSection ? (
                <SectionEditor
                  section={selectedSection}
                  onUpdate={(updates) => updateSection(selectedSection.id, updates)}
                />
              ) : (
                <div className="no-selection">
                  <p>Selecione uma seção para editar ou adicione uma nova seção</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
