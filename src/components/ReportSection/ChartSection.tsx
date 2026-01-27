import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ReportSection, ChartData } from '../../types/report';
import './SectionStyles.css';

interface ChartSectionProps {
  section: ReportSection;
  colors: {
    primary: string;
    accent: string;
  };
}

type ChartTooltipState = {
  type: 'line' | 'bar' | 'area' | 'pie';
  index: number;
  clientX: number;
  clientY: number;
  title: string;
  rows: { label: string; value: string; color?: string }[];
};

export const ChartSection: React.FC<ChartSectionProps> = ({ section, colors }) => {
  const [chartTooltip, setChartTooltip] = useState<ChartTooltipState | null>(null);
  const lineChartWrapRef = useRef<HTMLDivElement>(null);
  const barChartAreaRef = useRef<HTMLDivElement>(null);
  const areaChartWrapRef = useRef<HTMLDivElement>(null);

  const chartData: ChartData = section.data.chart || {
    type: 'bar',
    labels: [],
    datasets: []
  };

  // Renderização de gráfico de barras verticais
  const renderBarChart = () => {
    const maxValue = Math.max(
      ...chartData.datasets.flatMap(d => d.data),
      1
    );
    const chartHeight = 280;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const plotHeight = chartHeight - padding.top - padding.bottom;
    const numDatasets = chartData.datasets.length;

    return (
      <div className="simple-chart chart-type-bar chart-type-bar-vertical">
        <div className="bar-chart-container" style={{ height: `${chartHeight}px` }}>
          {/* Eixo Y (valores) */}
          <div className="bar-chart-y-labels">
            {[100, 75, 50, 25, 0].map((percent, i) => {
              const value = (percent / 100) * maxValue;
              return (
                <div key={i} className="bar-chart-y-label">
                  {value.toLocaleString('pt-BR')}
                </div>
              );
            })}
          </div>
          {/* Área das barras + eixo X no mesmo bloco para alinhar colunas */}
          <div className="bar-chart-right bar-chart-right-interactive">
            <div
              ref={barChartAreaRef}
              className="bar-chart-area"
              style={{ height: plotHeight }}
              onMouseMove={(e) => {
                const rect = barChartAreaRef.current?.getBoundingClientRect();
                if (!rect || chartData.labels.length === 0) return;
                const xNorm = (e.clientX - rect.left) / rect.width;
                const n = chartData.labels.length;
                const idx = Math.min(n - 1, Math.max(0, Math.floor(xNorm * n)));
                setChartTooltip({
                  type: 'bar',
                  index: idx,
                  clientX: e.clientX,
                  clientY: e.clientY,
                  title: chartData.labels[idx],
                  rows: chartData.datasets.map((ds) => ({
                    label: ds.label,
                    value: Number(ds.data?.[idx] ?? 0).toLocaleString('pt-BR'),
                    color: ds.color,
                  })),
                });
              }}
              onMouseLeave={() => setChartTooltip(null)}
              role="img"
              aria-label="Gráfico de barras: passe o mouse para ver os dados"
            >
              {chartData.labels.map((label, index) => (
                <div key={index} className="bar-chart-column">
                  <div className="bar-chart-column-bars" style={{ height: plotHeight }}>
                    {chartData.datasets.map((dataset, dsIndex) => {
                      const value = dataset.data[index] ?? 0;
                      const barHeightPct = maxValue > 0 ? (Number(value) / maxValue) * 100 : 0;
                      const barColor = dataset.color || colors.primary;
                      return (
                        <div
                          key={dsIndex}
                          className="chart-bar-vertical"
                          style={{
                            height: `${barHeightPct}%`,
                            backgroundColor: barColor,
                            backgroundImage: `linear-gradient(180deg, ${barColor}, ${barColor}dd)`,
                            width: numDatasets > 1 ? `calc(${100 / numDatasets}% - 6px)` : '100%',
                          }}
                          title={`${dataset.label}: ${Number(value).toLocaleString('pt-BR')}`}
                        >
                          {value > 0 && (
                            <span className="chart-value-vertical">
                              {Number(value).toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {/* Eixo X (categorias) — mesma largura da área para colunas alinhadas */}
            <div className="bar-chart-x-labels">
              {chartData.labels.map((label, index) => (
                <div key={index} className="bar-chart-x-label">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
        {chartData.datasets.length > 0 && (
          <div className="chart-legend">
            {chartData.datasets.map((dataset, index) => (
              <div key={index} className="legend-item">
                <span
                  className="legend-color"
                  style={{
                    backgroundColor: dataset.color || colors.primary,
                    backgroundImage: `linear-gradient(135deg, ${dataset.color || colors.primary}, ${dataset.color || colors.primary}dd)`,
                  }}
                />
                <span>{dataset.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Renderização de gráfico de linha (eixo Y à esquerda; máx. 2 métricas/séries; tooltip ao passar o mouse)
  const renderLineChart = () => {
    const maxValue = Math.max(
      ...chartData.datasets.flatMap(d => d.data),
      1
    );
    const n = Math.max(chartData.labels.length, 1);
    const chartHeight = 280;
    const toX = (index: number) => (n > 1 ? ((index + 0.5) / n) * 100 : 50);
    const toY = (value: number) => 100 - (value / maxValue) * 100;

    const handleLineChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = lineChartWrapRef.current?.getBoundingClientRect();
      if (!rect || n === 0) return;
      const xNorm = (e.clientX - rect.left) / rect.width;
      const idx = Math.min(chartData.labels.length - 1, Math.max(0, Math.floor(xNorm * n)));
      setChartTooltip({
        type: 'line',
        index: idx,
        clientX: e.clientX,
        clientY: e.clientY,
        title: chartData.labels[idx],
        rows: chartData.datasets.slice(0, 2).map((ds) => ({
          label: ds.label,
          value: Number(ds.data?.[idx] ?? 0).toLocaleString('pt-BR'),
          color: ds.color,
        })),
      });
    };

    const handleLineChartMouseLeave = () => setChartTooltip(null);

    const lineHoverIndex = chartTooltip?.type === 'line' ? chartTooltip.index : null;

    return (
      <div className="simple-chart chart-type-line">
        <div className="line-chart-container" style={{ height: `${chartHeight}px` }}>
          {/* Eixo Y (valores) */}
          <div className="line-chart-y-labels">
            {[100, 75, 50, 25, 0].map((percent, i) => {
              const value = (percent / 100) * maxValue;
              return (
                <div key={i} className="line-chart-y-label">
                  {value.toLocaleString('pt-BR')}
                </div>
              );
            })}
          </div>
          {/* Área do gráfico + eixo X */}
          <div className="line-chart-right line-chart-right-interactive">
            <div
              ref={lineChartWrapRef}
              className="line-chart-svg-wrap"
              onMouseMove={handleLineChartMouseMove}
              onMouseLeave={handleLineChartMouseLeave}
              role="img"
              aria-label="Gráfico de linhas: passe o mouse para ver os dados"
            >
              <svg
                className="line-chart-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', display: 'block' }}
              >
                {/* Grid horizontais */}
                {[0, 25, 50, 75, 100].map((yPercent, i) => (
                  <line
                    key={i}
                    x1={0}
                    y1={100 - yPercent}
                    x2={100}
                    y2={100 - yPercent}
                    stroke="#e8eaed"
                    strokeWidth="0.3"
                    strokeDasharray="0.6 0.6"
                  />
                ))}
                {/* Linha vertical no ponto sob o mouse */}
                {lineHoverIndex !== null && (
                  <line
                    x1={toX(lineHoverIndex)}
                    y1={0}
                    x2={toX(lineHoverIndex)}
                    y2={100}
                    stroke="rgba(0,0,0,0.15)"
                    strokeWidth="0.4"
                    strokeDasharray="1 1"
                  />
                )}
                {/* Linhas por dataset (até 2 métricas) */}
                {chartData.datasets.slice(0, 2).map((dataset, dsIndex) => {
                  const points = chartData.labels.map((_, index) => {
                    const value = Number(dataset.data[index]) || 0;
                    return { x: toX(index), y: toY(value), value };
                  });
                  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
                  const lineColor = dataset.color || colors.primary;
                  return (
                    <g key={dsIndex}>
                      <polyline
                        points={pointsString}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((point, index) => (
                        <g key={index}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="1.2"
                            fill={lineColor}
                            stroke="#fff"
                            strokeWidth="0.5"
                          />
                          <title>{`${chartData.labels[index]}: ${point.value.toLocaleString('pt-BR')}`}</title>
                        </g>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>
            {/* Eixo X */}
            <div className="line-chart-x-rows">
              <div className="line-chart-x-row">
                {chartData.labels.map((label, index) => (
                  <div key={index} className="line-chart-x-label">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {chartData.datasets.slice(0, 2).length > 0 && (
          <div className="chart-legend">
            {chartData.datasets.slice(0, 2).map((dataset, index) => (
              <div key={index} className="legend-item">
                <span
                  className="legend-color"
                  style={{
                    backgroundColor: dataset.color || colors.primary,
                    backgroundImage: `linear-gradient(135deg, ${dataset.color || colors.primary}, ${dataset.color || colors.primary}dd)`,
                  }}
                />
                <span>{dataset.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Renderização de gráfico de área (tooltip ao passar o mouse)
  const renderAreaChart = () => {
    const maxValue = Math.max(
      ...chartData.datasets.flatMap(d => d.data),
      1
    );
    const n = Math.max(chartData.labels.length, 1);
    const chartHeight = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = Math.max(400, chartData.labels.length * 60);
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    return (
      <div className="simple-chart chart-type-area">
        <div
          ref={areaChartWrapRef}
          className="area-chart-container"
          style={{ height: `${chartHeight}px`, position: 'relative' }}
          onMouseMove={(e) => {
            const rect = areaChartWrapRef.current?.getBoundingClientRect();
            if (!rect || n === 0) return;
            const xNorm = (e.clientX - rect.left) / rect.width;
            const idx = Math.min(chartData.labels.length - 1, Math.max(0, Math.floor(xNorm * n)));
            setChartTooltip({
              type: 'area',
              index: idx,
              clientX: e.clientX,
              clientY: e.clientY,
              title: chartData.labels[idx],
              rows: chartData.datasets.map((ds) => ({
                label: ds.label,
                value: Number(ds.data?.[idx] ?? 0).toLocaleString('pt-BR'),
                color: ds.color,
              })),
            });
          }}
          onMouseLeave={() => setChartTooltip(null)}
          role="img"
          aria-label="Gráfico de área: passe o mouse para ver os dados"
        >
          <svg 
            className="area-chart-svg" 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%' }}
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((yPercent, i) => {
              const y = padding.top + (yPercent / 100) * plotHeight;
              return (
                <line
                  key={i}
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}

            {/* Area fills for each dataset */}
            {chartData.datasets.map((dataset, dsIndex) => {
              const points = chartData.labels.map((_, index) => {
                const value = dataset.data[index] || 0;
                const x = chartData.labels.length > 1
                  ? padding.left + (index / (chartData.labels.length - 1)) * plotWidth
                  : padding.left + plotWidth / 2;
                const y = padding.top + plotHeight - ((value / maxValue) * plotHeight);
                return { x, y, value };
              });

              // Construir path para área: começa na base esquerda, vai até os pontos, fecha na base direita
              const firstPoint = points[0];
              const lastPoint = points[points.length - 1];
              const baseY = padding.top + plotHeight;
              const areaPath = `M ${firstPoint.x},${baseY} L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${lastPoint.x},${baseY} Z`;
              const lineColor = dataset.color || colors.primary;

              return (
                <g key={dsIndex}>
                  <path
                    d={areaPath}
                    fill={lineColor}
                    fillOpacity="0.3"
                  />
                  <polyline
                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {points.map((point, index) => {
                    const { x, y, value } = point;
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill={lineColor}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <title>{`${chartData.labels[index]}: ${value.toLocaleString('pt-BR')}`}</title>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div className="area-chart-x-labels">
            {chartData.labels.map((label, index) => (
              <div key={index} className="area-chart-x-label">
                {label}
              </div>
            ))}
          </div>

          {/* Y-axis labels */}
          <div className="area-chart-y-labels">
            {[0, 25, 50, 75, 100].map((percent, i) => {
              const value = (percent / 100) * maxValue;
              return (
                <div key={i} className="area-chart-y-label">
                  {value.toLocaleString('pt-BR')}
                </div>
              );
            })}
          </div>
        </div>

        {chartData.datasets.length > 0 && (
          <div className="chart-legend">
            {chartData.datasets.map((dataset, index) => (
              <div key={index} className="legend-item">
                <span
                  className="legend-color"
                  style={{ 
                    backgroundColor: dataset.color || colors.primary,
                    backgroundImage: `linear-gradient(135deg, ${dataset.color || colors.primary}, ${dataset.color || colors.primary}dd)`
                  }}
                />
                <span>{dataset.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Renderização de gráfico de pizza
  const renderPieChart = () => {
    // Para gráfico de pizza, usamos apenas o primeiro dataset
    if (chartData.datasets.length === 0 || chartData.labels.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: 'var(--texto-secundario)',
          fontStyle: 'italic'
        }}>
          Sem dados para exibir
        </div>
      );
    }

    const dataset = chartData.datasets[0];
    const total = dataset.data.reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: 'var(--texto-secundario)',
          fontStyle: 'italic'
        }}>
          Sem dados para exibir
        </div>
      );
    }

    let currentAngle = -90; // Começa no topo (0 graus)
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    const svgSize = 200;

    // Filtrar apenas valores maiores que 0 para evitar fatias invisíveis
    const validData = chartData.labels
      .map((label, index) => ({
        label,
        value: dataset.data[index] || 0,
        index
      }))
      .filter(item => item.value > 0);

    if (validData.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: 'var(--texto-secundario)',
          fontStyle: 'italic'
        }}>
          Sem dados para exibir
        </div>
      );
    }

    const colorsArray = [
      dataset.color || colors.primary,
      colors.accent,
      '#28a745',
      '#dc3545',
      '#17a2b8',
      '#ffc107',
      '#6f42c1',
      '#e83e8c',
      '#20c997',
      '#fd7e14'
    ];

    return (
      <div className="simple-chart chart-type-pie">
        <div
          className="pie-chart-container"
          onMouseLeave={() => setChartTooltip(null)}
        >
          <svg 
            className="pie-chart-svg" 
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            style={{ width: '100%', maxWidth: '400px', height: 'auto', margin: '0 auto' }}
            role="img"
            aria-label="Gráfico de pizza: passe o mouse para ver os dados"
          >
            {validData.map((item, idx) => {
              const { label, value, index } = item;
              const percentage = (value / total) * 100;
              const angle = (percentage / 100) * 360;
              
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const startAngleRad = (startAngle * Math.PI) / 180;
              const endAngleRad = (endAngle * Math.PI) / 180;
              
              const x1 = centerX + radius * Math.cos(startAngleRad);
              const y1 = centerY + radius * Math.sin(startAngleRad);
              const x2 = centerX + radius * Math.cos(endAngleRad);
              const y2 = centerY + radius * Math.sin(endAngleRad);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              const sliceColor = colorsArray[idx % colorsArray.length];

              currentAngle = endAngle;

              return (
                <g
                  key={index}
                  onMouseMove={(e) => {
                    e.stopPropagation();
                    setChartTooltip({
                      type: 'pie',
                      index,
                      clientX: e.clientX,
                      clientY: e.clientY,
                      title: label,
                      rows: [
                        { label: 'Valor', value: value.toLocaleString('pt-BR'), color: sliceColor },
                        { label: 'Participação', value: `${percentage.toFixed(1)}%` },
                      ],
                    });
                  }}
                >
                  <path
                    d={pathData}
                    fill={sliceColor}
                    stroke="#fff"
                    strokeWidth="2"
                    className="pie-slice"
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="pie-chart-legend">
            {validData.map((item, idx) => {
              const { label, value, index } = item;
              const percentage = (value / total) * 100;
              const sliceColor = colorsArray[idx % colorsArray.length];

              return (
                <div key={index} className="pie-legend-item">
                  <span
                    className="pie-legend-color"
                    style={{ backgroundColor: sliceColor }}
                  />
                  <span className="pie-legend-label">{label}</span>
                  <span className="pie-legend-value">
                    {value.toLocaleString('pt-BR')} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Renderização principal baseada no tipo
  const renderSimpleChart = () => {
    if (chartData.labels.length === 0 || chartData.datasets.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: 'var(--texto-secundario)',
          fontStyle: 'italic'
        }}>
          Sem dados para exibir
        </div>
      );
    }

    switch (chartData.type) {
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      case 'pie':
        return renderPieChart();
      case 'bar':
      default:
        return renderBarChart();
    }
  };

  return (
    <section className="report-section chart-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="chart-container">
        {renderSimpleChart()}
      </div>
      {/* Tooltip overlay unificado para todos os gráficos (barras, linha, área, pizza) */}
      {chartTooltip !== null &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="chart-tooltip-overlay"
            style={{
              position: 'fixed',
              left: chartTooltip.clientX + 12,
              top: chartTooltip.clientY + 12,
              zIndex: 10000,
            }}
            aria-hidden
          >
            <div className="chart-tooltip-label">{chartTooltip.title}</div>
            {chartTooltip.rows.map((row, i) => (
              <div
                key={i}
                className="chart-tooltip-value"
                style={row.color ? { color: row.color } : undefined}
              >
                {row.label}: {row.value}
              </div>
            ))}
          </div>,
          document.body
        )}
    </section>
  );
};
