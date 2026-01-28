import React, { useState, useEffect } from 'react';
import { ReportSection, SectionType } from '../../types/report';
import './SectionEditor.css';

export type MetricsComparisonPeriod = 'periodo_anterior' | 'ano_anterior' | 'ambos';

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
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

interface SectionEditorProps {
  section: ReportSection;
  onUpdate: (updates: Partial<ReportSection>) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ section, onUpdate }) => {
  const [localData, setLocalData] = useState(section.data);

  useEffect(() => {
    setLocalData(section.data);
  }, [section.id]);

  const updateData = (key: string, value: any) => {
    const newData = { ...localData, [key]: value };
    setLocalData(newData);
    onUpdate({ data: newData });
  };

  const renderEditor = () => {
    switch (section.type) {
      case 'header':
        return (
          <div className="editor-form">
            <label>
              Nome do cliente / Título:
              <input
                type="text"
                value={localData.clientName ?? ''}
                onChange={(e) => updateData('clientName', e.target.value)}
                placeholder="Ex: GZV Solutions"
              />
            </label>
            <label>
              Domínio (texto em “Relatório de desempenho do domínio…”):
              <input
                type="text"
                value={localData.domain ?? ''}
                onChange={(e) => updateData('domain', e.target.value)}
                placeholder="Ex: gzvsolutions.com.br"
              />
            </label>
            <label>
              Período de análise:
              <input
                type="text"
                value={localData.periodInfo ?? ''}
                onChange={(e) => updateData('periodInfo', e.target.value)}
                placeholder="Ex: 01/01/2026 a 31/01/2026"
              />
            </label>
            <label>
              Período de comparação:
              <input
                type="text"
                value={localData.comparisonPeriod ?? ''}
                onChange={(e) => updateData('comparisonPeriod', e.target.value)}
                placeholder="Ex: Ano anterior"
              />
            </label>
            <label>
              URL do logo:
              <input
                type="url"
                value={localData.logo ?? ''}
                onChange={(e) => updateData('logo', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
              <small className="form-hint">Deixe em branco para usar o logo padrão da LiveSEO.</small>
            </label>
          </div>
        );

      case 'summary':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Resumo Executivo"
              />
            </label>
            <label>
              Resumo:
              <textarea
                value={localData.summary || ''}
                onChange={(e) => updateData('summary', e.target.value)}
                placeholder="Digite o resumo..."
                rows={5}
              />
            </label>
            <div className="editor-section">
              <div className="editor-section-header">
                <h4>Destaques</h4>
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => updateData('highlights', [...(localData.highlights || []), ''])}
                >
                  + Adicionar Destaque
                </button>
              </div>
              <p className="form-hint summary-highlights-hint">
                Adicione os tópicos em destaque do relatório. Cada item aparece como um bullet no resumo.
              </p>
              {(localData.highlights || []).map((highlight: string, index: number) => (
                <div key={index} className="dimension-item highlight-item-editor">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => {
                      const next = [...(localData.highlights || [])];
                      next[index] = e.target.value;
                      updateData('highlights', next);
                    }}
                    placeholder={`Destaque ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => updateData('highlights', (localData.highlights || []).filter((_: string, i: number) => i !== index))}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Principais Métricas"
              />
            </label>
            <MetricsEditor
              metrics={localData.metrics || []}
              onChange={(metrics) => updateData('metrics', metrics)}
              comparisonPeriod={(localData.comparisonPeriod as MetricsComparisonPeriod) || 'periodo_anterior'}
              onComparisonPeriodChange={(v) => updateData('comparisonPeriod', v)}
            />
          </div>
        );

      case 'chart':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Gráfico de Resultados"
              />
            </label>
            <ChartEditor
              chart={localData.chart}
              onChange={(chart) => updateData('chart', chart)}
            />
          </div>
        );

      case 'table':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Tabela de Dados"
              />
            </label>
            <TableEditor
              table={localData.table}
              onChange={(table) => updateData('table', table)}
            />
          </div>
        );

      case 'image':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Imagens"
              />
            </label>
            <ImageEditor
              images={localData.images || []}
              onChange={(images) => updateData('images', images)}
            />
          </div>
        );

      case 'text':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Texto"
              />
            </label>
            <label>
              Conteúdo (HTML permitido):
              <textarea
                value={localData.content || ''}
                onChange={(e) => updateData('content', e.target.value)}
                placeholder="<p>Digite o conteúdo aqui...</p>"
                rows={10}
              />
            </label>
          </div>
        );

      case 'footer':
        return (
          <div className="editor-form">
            <label>
              Texto do Rodapé:
              <input
                type="text"
                value={localData.text || ''}
                onChange={(e) => updateData('text', e.target.value)}
                placeholder="Relatório gerado pela LiveSEO"
              />
            </label>
          </div>
        );

      case 'metaSEO':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Meta SEO"
              />
            </label>
            <MetaSEOEditor
              metaSEO={localData.metaSEO || { description: '', metas: [], analysis: '' }}
              onChange={(metaSEO) => updateData('metaSEO', metaSEO)}
            />
          </div>
        );

      case 'kpiGrid':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Principais Métricas"
              />
            </label>
            <MetricsEditor
              metrics={localData.metrics || []}
              onChange={(metrics) => updateData('metrics', metrics)}
              comparisonPeriod={(localData.comparisonPeriod as MetricsComparisonPeriod) || 'periodo_anterior'}
              onComparisonPeriodChange={(v) => updateData('comparisonPeriod', v)}
            />
          </div>
        );

      case 'gainsLosses':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Palavras chave e URLs"
              />
            </label>
            <GainsLossesEditor
              gainsLosses={localData.gainsLosses || []}
              onChange={(gainsLosses) => updateData('gainsLosses', gainsLosses)}
            />
          </div>
        );

      case 'analysis':
        return (
          <div className="editor-form">
            <label>
              Título da Análise:
              <input
                type="text"
                value={localData.title || ''}
                onChange={(e) => updateData('title', e.target.value)}
                placeholder="Análise"
              />
            </label>
            <label>
              Conteúdo da Análise:
              <textarea
                value={localData.analysis || ''}
                onChange={(e) => updateData('analysis', e.target.value)}
                placeholder="Digite a análise..."
                rows={10}
              />
            </label>
          </div>
        );

      case 'competitorAnalysis':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Análise de Concorrentes"
              />
            </label>
            <CompetitorAnalysisEditor
              barGroups={localData.barGroups || []}
              onChange={(barGroups) => updateData('barGroups', barGroups)}
            />
          </div>
        );

      case 'statusCards':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Ações Finalizadas"
              />
            </label>
            <StatusCardsEditor
              cards={localData.cards || []}
              onChange={(cards) => updateData('cards', cards)}
            />
          </div>
        );

      case 'actions':
        return (
          <div className="editor-form">
            <label>
              Título da Seção:
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Ações em Andamento"
              />
            </label>
            <ActionsEditor
              actions={localData.actions || []}
              onChange={(actions) => updateData('actions', actions)}
            />
          </div>
        );

      default:
        return <p>Editor não disponível para este tipo de seção</p>;
    }
  };

  return (
    <div className="section-editor">
      <div className="editor-header-section">
        <div className="editor-header-title">
          <span className="editor-section-badge">{SECTION_TYPE_LABELS[section.type]}</span>
          <h3>{section.title || SECTION_TYPE_LABELS[section.type]}</h3>
        </div>
        <label className="toggle-visibility">
          <input
            type="checkbox"
            checked={section.visible}
            onChange={(e) => onUpdate({ visible: e.target.checked })}
          />
          <span>Visível no relatório</span>
        </label>
      </div>
      <div className="editor-body">
        <div className="editor-form-panel">
          {renderEditor()}
        </div>
      </div>
    </div>
  );
};

// Componentes auxiliares para edição de dados específicos

const MetricsEditor: React.FC<{
  metrics: any[];
  onChange: (metrics: any[]) => void;
  comparisonPeriod?: MetricsComparisonPeriod;
  onComparisonPeriodChange?: (value: MetricsComparisonPeriod) => void;
}> = ({
  metrics,
  onChange,
  comparisonPeriod = 'periodo_anterior',
  onComparisonPeriodChange,
}) => {
  const updateMetric = (index: number, field: string, value: any) => {
    const newMetrics = [...metrics];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    onChange(newMetrics);
  };

  const addMetric = () => {
    onChange([...metrics, { label: '', value: '', change: 0, changeType: 'neutral' }]);
  };

  const removeMetric = (index: number) => {
    onChange(metrics.filter((_, i) => i !== index));
  };

  return (
    <div className="metrics-editor">
      {onComparisonPeriodChange && (
        <div className="metrics-comparison-option">
          <label>
            Período de comparação dos dados <span className="form-hint">(vale para todas as métricas)</span>
            <select
              value={comparisonPeriod}
              onChange={(e) => onComparisonPeriodChange(e.target.value as MetricsComparisonPeriod)}
              className="metrics-comparison-select"
            >
              <option value="periodo_anterior">Período anterior</option>
              <option value="ano_anterior">Ano anterior</option>
              <option value="ambos">Ambos</option>
            </select>
          </label>
        </div>
      )}
      <button className="btn btn-small" onClick={addMetric}>+ Adicionar Métrica</button>
      {metrics.map((metric, index) => (
        <div key={index} className={`metric-editor-item ${comparisonPeriod === 'ambos' ? 'metric-editor-item-ambos' : ''}`}>
          <input
            type="text"
            placeholder="Label"
            value={metric.label || ''}
            onChange={(e) => updateMetric(index, 'label', e.target.value)}
          />
          <input
            type="text"
            placeholder="Valor"
            value={metric.value || ''}
            onChange={(e) => updateMetric(index, 'value', e.target.value)}
          />
          <div className="metric-comparisons-cell">
            <div className="metric-comparison-row">
              <span className="metric-comparison-label">
                {comparisonPeriod === 'ano_anterior' ? 'Ano ant.' : 'Período ant.'}
              </span>
              <span className="metric-change-wrapper">
                <input
                  type="number"
                  placeholder="0"
                  value={metric.change == null ? '' : metric.change}
                  onChange={(e) => updateMetric(index, 'change', e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0))}
                  className="metric-change-input"
                />
                <span className="metric-change-unit">%</span>
              </span>
              <select
                value={metric.changeType || 'neutral'}
                onChange={(e) => updateMetric(index, 'changeType', e.target.value)}
                title="Aumento, Neutro ou Queda"
              >
                <option value="increase">Aumento</option>
                <option value="decrease">Queda</option>
                <option value="neutral">Neutro</option>
              </select>
            </div>
            {comparisonPeriod === 'ambos' && (
              <div className="metric-comparison-row">
                <span className="metric-comparison-label">Ano ant.</span>
                <span className="metric-change-wrapper">
                  <input
                    type="number"
                    placeholder="0"
                    value={metric.changeAnoAnterior == null ? '' : metric.changeAnoAnterior}
                    onChange={(e) => updateMetric(index, 'changeAnoAnterior', e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0))}
                    className="metric-change-input"
                  />
                  <span className="metric-change-unit">%</span>
                </span>
                <select
                  value={metric.changeTypeAnoAnterior || 'neutral'}
                  onChange={(e) => updateMetric(index, 'changeTypeAnoAnterior', e.target.value)}
                  title="Aumento, Neutro ou Queda (ano anterior)"
                >
                  <option value="increase">Aumento</option>
                  <option value="decrease">Queda</option>
                  <option value="neutral">Neutro</option>
                </select>
              </div>
            )}
          </div>
          <div className="metric-actions-cell">
            <button className="btn btn-small btn-danger" onClick={() => removeMetric(index)}>
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ChartEditor: React.FC<{ chart: any; onChange: (chart: any) => void }> = ({
  chart,
  onChange,
}) => {
  const chartData = chart || { type: 'bar', labels: [], datasets: [] };

  const addDimension = () => {
    onChange({
      ...chartData,
      labels: [...(chartData.labels || []), '']
    });
  };

  const updateDimension = (index: number, value: string) => {
    const newLabels = [...(chartData.labels || [])];
    newLabels[index] = value;
    onChange({ ...chartData, labels: newLabels });
  };

  const removeDimension = (index: number) => {
    const newLabels = (chartData.labels || []).filter((_: any, i: number) => i !== index);
    const newDatasets = (chartData.datasets || []).map((dataset: any) => ({
      ...dataset,
      data: dataset.data.filter((_: any, i: number) => i !== index)
    }));
    onChange({ ...chartData, labels: newLabels, datasets: newDatasets });
  };

  const maxMetricsForLine = 2;
  const canAddMetric = chartData.type !== 'line' || (chartData.datasets || []).length < maxMetricsForLine;

  const addMetric = () => {
    if (!canAddMetric) return;
    onChange({
      ...chartData,
      datasets: [...(chartData.datasets || []), {
        label: '',
        data: new Array(chartData.labels?.length || 0).fill(0),
        color: '#ff9a05'
      }]
    });
  };

  const updateMetric = (index: number, field: string, value: any) => {
    const newDatasets = [...(chartData.datasets || [])];
    newDatasets[index] = { ...newDatasets[index], [field]: value };
    onChange({ ...chartData, datasets: newDatasets });
  };

  const updateMetricData = (metricIndex: number, dimensionIndex: number, value: number) => {
    const newDatasets = [...(chartData.datasets || [])];
    if (!newDatasets[metricIndex].data) {
      newDatasets[metricIndex].data = [];
    }
    const newData = [...newDatasets[metricIndex].data];
    newData[dimensionIndex] = value;
    newDatasets[metricIndex].data = newData;
    onChange({ ...chartData, datasets: newDatasets });
  };

  const removeMetric = (index: number) => {
    onChange({
      ...chartData,
      datasets: (chartData.datasets || []).filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="chart-editor">
      <label>
        Tipo de Gráfico:
        <select
          value={chartData.type || 'bar'}
          onChange={(e) => onChange({ ...chartData, type: e.target.value })}
        >
          <option value="bar">Barras</option>
          <option value="line">Linha</option>
          <option value="pie">Pizza</option>
          <option value="area">Área</option>
        </select>
      </label>

      <div className="editor-section">
        <div className="editor-section-header">
          <h4>Dimensões (Eixo X)</h4>
          <button className="btn btn-small" onClick={addDimension}>+ Adicionar Dimensão</button>
        </div>
        {(chartData.labels || []).map((label: string, index: number) => (
          <div key={index} className="dimension-item">
            <input
              type="text"
              placeholder={`Dimensão ${index + 1} (ex: Jan, Fev, Mar)`}
              value={label}
              onChange={(e) => updateDimension(index, e.target.value)}
            />
            <button className="btn btn-small btn-danger" onClick={() => removeDimension(index)}>
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="editor-section">
        <div className="editor-section-header">
          <h4>
            Métricas (Séries de Dados)
            {chartData.type === 'line' && (
              <span className="editor-section-badge">máx. 2</span>
            )}
          </h4>
          <button
            type="button"
            className="btn btn-small"
            onClick={addMetric}
            disabled={!canAddMetric}
          >
            + Adicionar Métrica
          </button>
        </div>
        {(chartData.datasets || []).map((dataset: any, metricIndex: number) => (
          <div key={metricIndex} className="metric-item">
            <div className="metric-header">
              <input
                type="text"
                placeholder="Nome da métrica (ex: Cliques, Impressões)"
                value={dataset.label || ''}
                onChange={(e) => updateMetric(metricIndex, 'label', e.target.value)}
                className="metric-label-input"
              />
              <input
                type="color"
                value={dataset.color || '#ff9a05'}
                onChange={(e) => updateMetric(metricIndex, 'color', e.target.value)}
                title="Cor da métrica"
              />
              <button className="btn btn-small btn-danger" onClick={() => removeMetric(metricIndex)}>
                Remover Métrica
              </button>
            </div>
            <div className="metric-values">
              {(chartData.labels || []).map((_: any, dimensionIndex: number) => (
                <div key={dimensionIndex} className="metric-value-item">
                  <label>{chartData.labels[dimensionIndex] || `Dimensão ${dimensionIndex + 1}`}:</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={dataset.data?.[dimensionIndex] || 0}
                    onChange={(e) => updateMetricData(metricIndex, dimensionIndex, parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TableEditor: React.FC<{ table: any; onChange: (table: any) => void }> = ({
  table,
  onChange,
}) => {
  const tableData = table || { headers: [], rows: [], footer: null };

  const addColumn = () => {
    onChange({
      ...tableData,
      headers: [...(tableData.headers || []), ''],
      rows: (tableData.rows || []).map((row: any[]) => [...row, '']),
      footer: tableData.footer ? [...tableData.footer, ''] : null
    });
  };

  const updateColumn = (index: number, value: string) => {
    const newHeaders = [...(tableData.headers || [])];
    newHeaders[index] = value;
    onChange({ ...tableData, headers: newHeaders });
  };

  const removeColumn = (index: number) => {
    onChange({
      ...tableData,
      headers: (tableData.headers || []).filter((_: any, i: number) => i !== index),
      rows: (tableData.rows || []).map((row: any[]) => row.filter((_: any, i: number) => i !== index)),
      footer: tableData.footer ? tableData.footer.filter((_: any, i: number) => i !== index) : null
    });
  };

  const addRow = () => {
    onChange({
      ...tableData,
      rows: [...(tableData.rows || []), new Array(tableData.headers?.length || 0).fill('')]
    });
  };

  const updateRow = (rowIndex: number, cellIndex: number, value: string) => {
    const newRows = [...(tableData.rows || [])];
    if (!newRows[rowIndex]) {
      newRows[rowIndex] = [];
    }
    const newRow = [...newRows[rowIndex]];
    newRow[cellIndex] = value;
    newRows[rowIndex] = newRow;
    onChange({ ...tableData, rows: newRows });
  };

  const removeRow = (index: number) => {
    onChange({
      ...tableData,
      rows: (tableData.rows || []).filter((_: any, i: number) => i !== index)
    });
  };

  const toggleFooter = () => {
    if (tableData.footer) {
      onChange({ ...tableData, footer: null });
    } else {
      onChange({
        ...tableData,
        footer: new Array(tableData.headers?.length || 0).fill('')
      });
    }
  };

  const updateFooter = (index: number, value: string) => {
    if (!tableData.footer) return;
    const newFooter = [...tableData.footer];
    newFooter[index] = value;
    onChange({ ...tableData, footer: newFooter });
  };

  return (
    <div className="table-editor">
      <div className="editor-section">
        <div className="editor-section-header">
          <h4>Colunas (Cabeçalhos)</h4>
          <button className="btn btn-small" onClick={addColumn}>+ Adicionar Coluna</button>
        </div>
        {(tableData.headers || []).map((header: string, index: number) => (
          <div key={index} className="column-item">
            <input
              type="text"
              placeholder={`Coluna ${index + 1}`}
              value={header}
              onChange={(e) => updateColumn(index, e.target.value)}
            />
            <button className="btn btn-small btn-danger" onClick={() => removeColumn(index)}>
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="editor-section">
        <div className="editor-section-header">
          <h4>Linhas (Dados)</h4>
          <button className="btn btn-small" onClick={addRow}>+ Adicionar Linha</button>
        </div>
        {(tableData.rows || []).map((row: any[], rowIndex: number) => (
          <div key={rowIndex} className="row-item">
            <div className="row-header">
              <span>Linha {rowIndex + 1}</span>
              <button className="btn btn-small btn-danger" onClick={() => removeRow(rowIndex)}>
                Remover
              </button>
            </div>
            <div className="row-cells">
              {(tableData.headers || []).map((_: any, cellIndex: number) => (
                <div key={cellIndex} className="cell-item">
                  <label>{tableData.headers[cellIndex] || `Coluna ${cellIndex + 1}`}:</label>
                  <input
                    type="text"
                    placeholder="Valor"
                    value={row[cellIndex] || ''}
                    onChange={(e) => updateRow(rowIndex, cellIndex, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="editor-section">
        <div className="editor-section-header">
          <h4>Rodapé (Opcional)</h4>
          <button className="btn btn-small" onClick={toggleFooter}>
            {tableData.footer ? 'Remover Rodapé' : 'Adicionar Rodapé'}
          </button>
        </div>
        {tableData.footer && (tableData.headers || []).map((_: any, index: number) => (
          <div key={index} className="footer-item">
            <label>{tableData.headers[index] || `Coluna ${index + 1}`}:</label>
            <input
              type="text"
              placeholder="Valor do rodapé"
              value={tableData.footer[index] || ''}
              onChange={(e) => updateFooter(index, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ImageEditor: React.FC<{ images: any[]; onChange: (images: any[]) => void }> = ({
  images,
  onChange,
}) => {
  const addImage = () => {
    onChange([...images, { id: `img-${Date.now()}`, url: '', alt: '', caption: '' }]);
  };

  const updateImage = (index: number, field: string, value: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange(newImages);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="image-editor">
      <button className="btn btn-small" onClick={addImage}>+ Adicionar Imagem</button>
      {images.map((image, index) => (
        <div key={index} className="image-editor-item">
          <input
            type="text"
            placeholder="URL da Imagem"
            value={image.url || ''}
            onChange={(e) => updateImage(index, 'url', e.target.value)}
          />
          <input
            type="text"
            placeholder="Texto Alternativo"
            value={image.alt || ''}
            onChange={(e) => updateImage(index, 'alt', e.target.value)}
          />
          <input
            type="text"
            placeholder="Legenda (opcional)"
            value={image.caption || ''}
            onChange={(e) => updateImage(index, 'caption', e.target.value)}
          />
          <button className="btn btn-small btn-danger" onClick={() => removeImage(index)}>
            Remover
          </button>
        </div>
      ))}
    </div>
  );
};

const ActionsEditor: React.FC<{ actions: any[]; onChange: (actions: any[]) => void }> = ({
  actions,
  onChange,
}) => {
  const addAction = () => {
    onChange([...actions, { text: '', url: '', status: 'andamento' }]);
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], [field]: value };
    onChange(newActions);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  return (
    <div className="actions-editor">
      <button className="btn btn-small" onClick={addAction}>+ Adicionar Ação</button>
      {actions.map((action, index) => (
        <div key={index} className="action-editor-item">
          <input
            type="text"
            placeholder="Texto da ação"
            value={action.text || ''}
            onChange={(e) => updateAction(index, 'text', e.target.value)}
          />
          <input
            type="url"
            placeholder="URL (opcional)"
            value={action.url || ''}
            onChange={(e) => updateAction(index, 'url', e.target.value)}
          />
          <select
            value={action.status || 'andamento'}
            onChange={(e) => updateAction(index, 'status', e.target.value)}
          >
            <option value="andamento">Em andamento</option>
            <option value="iniciar">A iniciar</option>
            <option value="docs">Em documentação</option>
            <option value="finalizadas">Finalizadas</option>
            <option value="backlog_priorizado">Backlog priorizado</option>
          </select>
          <button className="btn btn-small btn-danger" onClick={() => removeAction(index)}>
            Remover
          </button>
        </div>
      ))}
    </div>
  );
};

// Editores específicos para seções customizadas

const MetaSEOEditor: React.FC<{ metaSEO: any; onChange: (metaSEO: any) => void }> = ({
  metaSEO,
  onChange,
}) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...metaSEO, [field]: value });
  };

  const addMeta = () => {
    onChange({
      ...metaSEO,
      metas: [...(metaSEO.metas || []), {
        label: '',
        target: '',
        growth: '',
        current: '',
        percentage: 0,
        color: '#ff9a05',
      }],
    });
  };

  const updateMeta = (index: number, field: string, value: any) => {
    const newMetas = [...(metaSEO.metas || [])];
    newMetas[index] = { ...newMetas[index], [field]: value };
    onChange({ ...metaSEO, metas: newMetas });
  };

  const removeMeta = (index: number) => {
    onChange({
      ...metaSEO,
      metas: (metaSEO.metas || []).filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="meta-seo-editor">
      <label>
        Descrição Inicial:
        <textarea
          value={metaSEO.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="A meta definida abaixo é válida para o período..."
          rows={3}
        />
      </label>
      
      <div className="editor-section">
        <div className="editor-section-header">
          <h4>Metas</h4>
          <button className="btn btn-small" onClick={addMeta}>+ Adicionar Meta</button>
        </div>
        {(metaSEO.metas || []).map((meta: any, index: number) => (
          <div key={index} className="meta-editor-item">
            <input
              type="text"
              placeholder="Label (ex: Sessões orgânicas)"
              value={meta.label || ''}
              onChange={(e) => updateMeta(index, 'label', e.target.value)}
            />
            <input
              type="text"
              placeholder="Meta (ex: 1.728)"
              value={meta.target || ''}
              onChange={(e) => updateMeta(index, 'target', e.target.value)}
            />
            <input
              type="text"
              placeholder="Crescimento (ex: 16,36%)"
              value={meta.growth || ''}
              onChange={(e) => updateMeta(index, 'growth', e.target.value)}
            />
            <input
              type="text"
              placeholder="Valor atual (ex: 1.3 mil)"
              value={meta.current || ''}
              onChange={(e) => updateMeta(index, 'current', e.target.value)}
            />
            <input
              type="number"
              placeholder="Porcentagem atingida"
              value={meta.percentage || 0}
              onChange={(e) => updateMeta(index, 'percentage', parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
            />
            <input
              type="color"
              value={meta.color || '#ff9a05'}
              onChange={(e) => updateMeta(index, 'color', e.target.value)}
              title="Cor da barra"
            />
            <button className="btn btn-small btn-danger" onClick={() => removeMeta(index)}>
              Remover
            </button>
          </div>
        ))}
      </div>

      <label>
        Análise:
        <textarea
          value={metaSEO.analysis || ''}
          onChange={(e) => updateField('analysis', e.target.value)}
          placeholder="O projeto apresenta desempenho sólido..."
          rows={4}
        />
      </label>
    </div>
  );
};

const GainsLossesEditor: React.FC<{ gainsLosses: any[]; onChange: (gainsLosses: any[]) => void }> = ({
  gainsLosses,
  onChange,
}) => {
  const addList = () => {
    onChange([...gainsLosses, { title: '', items: [] }]);
  };

  const updateList = (index: number, field: string, value: any) => {
    const newLists = [...gainsLosses];
    newLists[index] = { ...newLists[index], [field]: value };
    onChange(newLists);
  };

  const removeList = (index: number) => {
    onChange(gainsLosses.filter((_, i) => i !== index));
  };

  const addItem = (listIndex: number) => {
    const newLists = [...gainsLosses];
    newLists[listIndex].items = [...(newLists[listIndex].items || []), {
      keyword: '',
      change: '',
      changeType: 'increase',
      url: '',
    }];
    onChange(newLists);
  };

  const updateItem = (listIndex: number, itemIndex: number, field: string, value: any) => {
    const newLists = [...gainsLosses];
    newLists[listIndex].items[itemIndex] = {
      ...newLists[listIndex].items[itemIndex],
      [field]: value,
    };
    onChange(newLists);
  };

  const removeItem = (listIndex: number, itemIndex: number) => {
    const newLists = [...gainsLosses];
    newLists[listIndex].items = newLists[listIndex].items.filter((_: any, i: number) => i !== itemIndex);
    onChange(newLists);
  };

  return (
    <div className="gains-losses-editor">
      <button className="btn btn-small" onClick={addList}>+ Adicionar Lista</button>
      {gainsLosses.map((list, listIndex) => (
        <div key={listIndex} className="gains-losses-list-item">
          <div className="list-header">
            <input
              type="text"
              placeholder="Título da lista (ex: Maiores ganhos em palavras-chave)"
              value={list.title || ''}
              onChange={(e) => updateList(listIndex, 'title', e.target.value)}
              className="list-title-input"
            />
            <button className="btn btn-small btn-danger" onClick={() => removeList(listIndex)}>
              Remover Lista
            </button>
          </div>
          <button className="btn btn-small" onClick={() => addItem(listIndex)}>
            + Adicionar Item
          </button>
          {(list.items || []).map((item: any, itemIndex: number) => (
            <div key={itemIndex} className="gains-losses-item">
              <input
                type="text"
                placeholder="Palavra-chave"
                value={item.keyword || ''}
                onChange={(e) => updateItem(listIndex, itemIndex, 'keyword', e.target.value)}
              />
              <input
                type="text"
                placeholder="Mudança (ex: +622% cliques)"
                value={item.change || ''}
                onChange={(e) => updateItem(listIndex, itemIndex, 'change', e.target.value)}
              />
              <select
                value={item.changeType || 'increase'}
                onChange={(e) => updateItem(listIndex, itemIndex, 'changeType', e.target.value)}
              >
                <option value="increase">Aumento</option>
                <option value="decrease">Queda</option>
              </select>
              <input
                type="url"
                placeholder="URL (opcional)"
                value={item.url || ''}
                onChange={(e) => updateItem(listIndex, itemIndex, 'url', e.target.value)}
              />
              <button className="btn btn-small btn-danger" onClick={() => removeItem(listIndex, itemIndex)}>
                Remover
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const CompetitorAnalysisEditor: React.FC<{ barGroups: any[]; onChange: (barGroups: any[]) => void }> = ({
  barGroups,
  onChange,
}) => {
  const addGroup = () => {
    onChange([...barGroups, { label: '', competitors: [], subtitle: '' }]);
  };

  const updateGroup = (index: number, field: string, value: any) => {
    const newGroups = [...barGroups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    onChange(newGroups);
  };

  const removeGroup = (index: number) => {
    onChange(barGroups.filter((_, i) => i !== index));
  };

  const addCompetitor = (groupIndex: number) => {
    const newGroups = [...barGroups];
    newGroups[groupIndex].competitors = [...(newGroups[groupIndex].competitors || []), {
      name: '',
      value: '',
      percentage: 0,
      type: 'neutral',
    }];
    onChange(newGroups);
  };

  const updateCompetitor = (groupIndex: number, competitorIndex: number, field: string, value: any) => {
    const newGroups = [...barGroups];
    newGroups[groupIndex].competitors[competitorIndex] = {
      ...newGroups[groupIndex].competitors[competitorIndex],
      [field]: value,
    };
    onChange(newGroups);
  };

  const removeCompetitor = (groupIndex: number, competitorIndex: number) => {
    const newGroups = [...barGroups];
    newGroups[groupIndex].competitors = newGroups[groupIndex].competitors.filter(
      (_: any, i: number) => i !== competitorIndex
    );
    onChange(newGroups);
  };

  return (
    <div className="competitor-analysis-editor">
      <button className="btn btn-small" onClick={addGroup}>+ Adicionar Grupo de Barras</button>
      {barGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="bar-group-item">
          <div className="group-header">
            <input
              type="text"
              placeholder="Label do grupo (ex: Tráfego orgânico dos concorrentes)"
              value={group.label || ''}
              onChange={(e) => updateGroup(groupIndex, 'label', e.target.value)}
              className="group-label-input"
            />
            <button className="btn btn-small btn-danger" onClick={() => removeGroup(groupIndex)}>
              Remover Grupo
            </button>
          </div>
          <input
            type="text"
            placeholder="Subtítulo (opcional)"
            value={group.subtitle || ''}
            onChange={(e) => updateGroup(groupIndex, 'subtitle', e.target.value)}
          />
          <button className="btn btn-small" onClick={() => addCompetitor(groupIndex)}>
            + Adicionar Concorrente
          </button>
          {(group.competitors || []).map((competitor: any, competitorIndex: number) => (
            <div key={competitorIndex} className="competitor-item">
              <input
                type="text"
                placeholder="Nome do concorrente"
                value={competitor.name || ''}
                onChange={(e) => updateCompetitor(groupIndex, competitorIndex, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Valor (ex: +30,95%)"
                value={competitor.value || ''}
                onChange={(e) => updateCompetitor(groupIndex, competitorIndex, 'value', e.target.value)}
              />
              <input
                type="number"
                placeholder="Porcentagem da barra (0-100)"
                value={competitor.percentage || 0}
                onChange={(e) => updateCompetitor(groupIndex, competitorIndex, 'percentage', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
              />
              <select
                value={competitor.type || 'neutral'}
                onChange={(e) => updateCompetitor(groupIndex, competitorIndex, 'type', e.target.value)}
              >
                <option value="positive">Positivo</option>
                <option value="negative">Negativo</option>
                <option value="neutral">Neutro</option>
              </select>
              <button className="btn btn-small btn-danger" onClick={() => removeCompetitor(groupIndex, competitorIndex)}>
                Remover
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const StatusCardsEditor: React.FC<{ cards: any[]; onChange: (cards: any[]) => void }> = ({
  cards,
  onChange,
}) => {
  const addCard = () => {
    onChange([...cards, { title: '', description: '', status: 'medio' }]);
  };

  const updateCard = (index: number, field: string, value: any) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    onChange(newCards);
  };

  const removeCard = (index: number) => {
    onChange(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="status-cards-editor">
      <button className="btn btn-small" onClick={addCard}>+ Adicionar Card</button>
      {cards.map((card, index) => (
        <div key={index} className="status-card-item">
          <input
            type="text"
            placeholder="Título do card"
            value={card.title || ''}
            onChange={(e) => updateCard(index, 'title', e.target.value)}
          />
          <textarea
            placeholder="Descrição"
            value={card.description || ''}
            onChange={(e) => updateCard(index, 'description', e.target.value)}
            rows={4}
          />
          <select
            value={card.status || 'medio'}
            onChange={(e) => updateCard(index, 'status', e.target.value)}
          >
            <option value="critico">Crítico</option>
            <option value="alto">Alto</option>
            <option value="medio">Médio</option>
            <option value="normal">Normal</option>
          </select>
          <button className="btn btn-small btn-danger" onClick={() => removeCard(index)}>
            Remover
          </button>
        </div>
      ))}
    </div>
  );
};
