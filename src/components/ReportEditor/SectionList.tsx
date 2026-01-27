import React, { useState, useRef, useEffect } from 'react';
import { ReportSection, SectionType } from '../../types/report';
import './SectionList.css';

interface SectionListProps {
  sections: ReportSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, newOrder: number) => void;
  onAdd: (type: SectionType) => void;
}

const sectionTypeLabels: Record<SectionType, string> = {
  header: 'Cabeçalho',
  summary: 'Resumo',
  metrics: 'Métricas',
  chart: 'Gráfico',
  table: 'Tabela',
  image: 'Imagem',
  text: 'Texto',
  comparison: 'Comparação',
  footer: 'Rodapé',
  metaSEO: 'Meta SEO',
  kpiGrid: 'Grid de KPIs',
  gainsLosses: 'Ganhos/Perdas',
  analysis: 'Análise',
  competitorAnalysis: 'Análise de Concorrentes',
  statusCards: 'Cards de Status',
  actions: 'Ações',
};

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  selectedId,
  onSelect,
  onToggleVisibility,
  onDelete,
  onReorder,
  onAdd,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const moveUp = (section: ReportSection) => {
    if (section.order > 0) {
      onReorder(section.id, section.order - 1);
    }
  };

  const moveDown = (section: ReportSection) => {
    const maxOrder = Math.max(...sections.map(s => s.order));
    if (section.order < maxOrder) {
      onReorder(section.id, section.order + 1);
    }
  };

  const handleAddSection = (type: SectionType) => {
    onAdd(type);
    setDropdownOpen(false);
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
            className={`section-item ${selectedId === section.id ? 'selected' : ''} ${!section.visible ? 'hidden' : ''}`}
            onClick={() => onSelect(section.id)}
          >
            <div className="section-item-header">
              <span className="section-type-badge">{sectionTypeLabels[section.type]}</span>
              <div className="section-actions">
                <button
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
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveUp(section);
                  }}
                  title="Mover para cima"
                >
                  ↑
                </button>
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveDown(section);
                  }}
                  title="Mover para baixo"
                >
                  ↓
                </button>
                <button
                  className="icon-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Tem certeza que deseja excluir esta seção?')) {
                      onDelete(section.id);
                    }
                  }}
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="section-item-title">
              {section.title || `Seção ${section.type} (sem título)`}
            </div>
            <div className="section-item-order">Ordem: {section.order + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
