import React from 'react';
import { ReportSection, ChartData } from '../../types/report';
import './SectionStyles.css';

interface ChartSectionProps {
  section: ReportSection;
  colors: {
    primary: string;
    accent: string;
  };
}

export const ChartSection: React.FC<ChartSectionProps> = ({ section, colors }) => {
  const chartData: ChartData = section.data.chart || {
    type: 'bar',
    labels: [],
    datasets: []
  };

  // Renderização de gráfico de barras
  const renderBarChart = () => {
    const maxValue = Math.max(
      ...chartData.datasets.flatMap(d => d.data),
      1
    );

    return (
      <div className="simple-chart chart-type-bar">
        {chartData.labels.map((label, index) => {
          return (
            <div key={index} className="chart-bar-container">
              <div className="chart-label">{label}</div>
              <div className="chart-bars">
                {chartData.datasets.map((dataset, dsIndex) => {
                  const value = dataset.data[index] || 0;
                  const barPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                  const barColor = dataset.color || colors.primary;
                  
                  return (
                    <div
                      key={dsIndex}
                      className="chart-bar"
                      style={{
                        width: `${barPercentage}%`,
                        backgroundColor: barColor,
                        backgroundImage: `linear-gradient(135deg, ${barColor}, ${barColor}dd)`
                      }}
                      title={`${dataset.label}: ${value.toLocaleString('pt-BR')}`}
                    >
                      {value > 0 && (
                        <span className="chart-value">
                          {value.toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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

  // Renderização de gráfico de linha
  const renderLineChart = () => {
    const maxValue = Math.max(
      ...chartData.datasets.flatMap(d => d.data),
      1
    );
    const chartHeight = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = Math.max(400, chartData.labels.length * 60);
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    return (
      <div className="simple-chart chart-type-line">
        <div className="line-chart-container" style={{ height: `${chartHeight}px`, position: 'relative' }}>
          <svg 
            className="line-chart-svg" 
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

            {/* Lines for each dataset */}
            {chartData.datasets.map((dataset, dsIndex) => {
              const points = chartData.labels.map((_, index) => {
                const value = dataset.data[index] || 0;
                const x = chartData.labels.length > 1
                  ? padding.left + (index / (chartData.labels.length - 1)) * plotWidth
                  : padding.left + plotWidth / 2;
                const y = padding.top + plotHeight - ((value / maxValue) * plotHeight);
                return { x, y, value };
              });

              const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
              const lineColor = dataset.color || colors.primary;

              return (
                <g key={dsIndex}>
                  <polyline
                    points={pointsString}
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
          <div className="line-chart-x-labels">
            {chartData.labels.map((label, index) => (
              <div key={index} className="line-chart-x-label">
                {label}
              </div>
            ))}
          </div>

          {/* Y-axis labels */}
          <div className="line-chart-y-labels">
            {[0, 25, 50, 75, 100].map((percent, i) => {
              const value = (percent / 100) * maxValue;
              return (
                <div key={i} className="line-chart-y-label">
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

  // Renderização de gráfico de área
  const renderAreaChart = () => {
    const maxValue = Math.max(
      ...chartData.datasets.flatMap(d => d.data),
      1
    );
    const chartHeight = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = Math.max(400, chartData.labels.length * 60);
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    return (
      <div className="simple-chart chart-type-area">
        <div className="area-chart-container" style={{ height: `${chartHeight}px`, position: 'relative' }}>
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
        <div className="pie-chart-container">
          <svg 
            className="pie-chart-svg" 
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            style={{ width: '100%', maxWidth: '400px', height: 'auto', margin: '0 auto' }}
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
                <g key={index}>
                  <path
                    d={pathData}
                    fill={sliceColor}
                    stroke="#fff"
                    strokeWidth="2"
                    className="pie-slice"
                    style={{ cursor: 'pointer' }}
                    title={`${label}: ${value.toLocaleString('pt-BR')} (${percentage.toFixed(1)}%)`}
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
    </section>
  );
};
