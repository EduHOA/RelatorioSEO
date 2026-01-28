import React, { useState, useRef, useEffect } from 'react';
import { ReportSection, SectionType } from '../../types/report';
import './SectionList.css';

const SECTION_DRAG_TYPE = 'application/x-section-id';

interface SectionListProps {
  sections: ReportSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, newOrder: number) => void;
  onAdd: (type: SectionType) => void;
  onUpdateSection?: (id: string, updates: Partial<ReportSection>) => void;
}

const sectionTypeLabels: Record<SectionType, string> = {
  header: 'Cabeçalho',
  summary: 'Resumo',
  metrics: 'Métricas',
  chart: 'Gráfico',
  table: 'Tabela',
  image: 'Imagem',
  text: 'Texto',
  footer: 'Rodapé',
  metaSEO: 'Meta SEO',
  kpiGrid: 'Grid de KPIs',
  gainsLosses: 'Palavras chave e URLs',
  analysis: 'Análise',
  competitorAnalysis: 'Análise de Concorrentes',
  statusCards: 'Ações finalizadas',
  actions: 'Ações em andamento',
};

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  selectedId,
  onSelect,
  onToggleVisibility,
  onDelete,
  onReorder,
  onAdd,
  onUpdateSection,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<ReportSection | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const lastDropTime = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitleId && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitleId]);

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!sectionToDelete) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSectionToDelete(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sectionToDelete]);

  const handleDragStart = (e: React.DragEvent, section: ReportSection) => {
    setDraggedId(section.id);
    e.dataTransfer.setData(SECTION_DRAG_TYPE, section.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', section.id);
  };

  const handleDragOver = (e: React.DragEvent, section: ReportSection) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedId && draggedId !== section.id) {
      setDragOverId(section.id);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(related)) {
      setDragOverId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSection: ReportSection) => {
    e.preventDefault();
    setDragOverId(null);
    const id = e.dataTransfer.getData(SECTION_DRAG_TYPE) || e.dataTransfer.getData('text/plain');
    if (id && id !== targetSection.id) {
      onReorder(id, targetSection.order);
      lastDropTime.current = Date.now();
    }
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleCardClick = (sectionId: string) => {
    if (Date.now() - lastDropTime.current < 400) return;
    onSelect(sectionId);
  };

  const handleAddSection = (type: SectionType) => {
    onAdd(type);
    setDropdownOpen(false);
  };

  const handleConfirmDelete = () => {
    if (sectionToDelete) {
      onDelete(sectionToDelete.id);
      setSectionToDelete(null);
    }
  };

  const handleTitleSave = (section: ReportSection, value: string) => {
    const trimmed = value.trim();
    if (onUpdateSection) {
      onUpdateSection(section.id, { title: trimmed || undefined });
    }
    setEditingTitleId(null);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent, section: ReportSection) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave(section, (e.target as HTMLInputElement).value);
    }
    if (e.key === 'Escape') {
      setEditingTitleId(null);
    }
  };

  return (
    <div className="section-list">
      <div className="section-list-header">
        <h2>Seções do Relatório</h2>
        <div className="add-section-dropdown" ref={dropdownRef}>
          <button 
            className="btn btn-small btn-primary"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            + Adicionar Seção
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              {Object.entries(sectionTypeLabels).map(([type, label]) => (
                <button
                  key={type}
                  className="dropdown-item"
                  onClick={() => handleAddSection(type as SectionType)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sections-container">
        {sortedSections.map((section) => (
          <div
            key={section.id}
            className={`section-item ${selectedId === section.id ? 'selected' : ''} ${!section.visible ? 'hidden' : ''} ${draggedId === section.id ? 'dragging' : ''} ${dragOverId === section.id ? 'drag-over' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragOver={(e) => handleDragOver(e, section)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section)}
            onDragEnd={handleDragEnd}
            onClick={() => handleCardClick(section.id)}
          >
            <div className="section-item-drag-handle" title="Arraste para reordenar" aria-hidden>
              <span className="section-drag-grip">⋮⋮</span>
            </div>
            <div className="section-item-body">
              <div className="section-item-header">
                <span className="section-type-badge">{sectionTypeLabels[section.type]}</span>
                <div className="section-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(section.id);
                    }}
                    title={section.visible ? 'Ocultar' : 'Mostrar'}
                  >
                    {section.visible ? '👁️' : '👁️‍🗨️'}
                  </button>
                  <button
                    type="button"
                    className="icon-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSectionToDelete(section);
                    }}
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div
                className="section-item-title-wrap"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (onUpdateSection) setEditingTitleId(section.id);
                }}
                title={onUpdateSection ? 'Duplo clique para editar o título (controle interno)' : undefined}
              >
                {editingTitleId === section.id && onUpdateSection ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    className="section-item-title-input"
                    defaultValue={section.title || ''}
                    placeholder={`Título (ex: ${sectionTypeLabels[section.type]})`}
                    onBlur={(e) => handleTitleSave(section, e.target.value)}
                    onKeyDown={(e) => handleTitleKeyDown(e, section)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="section-item-title">
                    {section.title || `Seção ${section.type} (sem título)`}
                  </span>
                )}
                {onUpdateSection && editingTitleId !== section.id && (
                  <span className="section-item-title-hint">duplo clique para editar</span>
                )}
              </div>
              <div className="section-item-order">Ordem: {section.order + 1}</div>
            </div>
          </div>
        ))}
      </div>

      {sectionToDelete && (
        <div
          className="section-delete-modal-overlay"
          onClick={() => setSectionToDelete(null)}
        >
          <div
            className="section-delete-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="section-delete-modal-title"
          >
            <div className="section-delete-modal-header">
              <h2 id="section-delete-modal-title">Excluir seção</h2>
              <button
                type="button"
                className="section-delete-modal-close"
                onClick={() => setSectionToDelete(null)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div className="section-delete-modal-body">
              <p>
                Tem certeza que deseja excluir a seção{' '}
                <strong>
                  {sectionToDelete.title || sectionTypeLabels[sectionToDelete.type] || 'esta seção'}
                </strong>
                ? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="section-delete-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSectionToDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
