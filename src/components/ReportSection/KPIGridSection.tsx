import React from 'react';
import { ReportSection, MetricData } from '../../types/report';
import './SectionStyles.css';

interface KPIGridSectionProps {
  section: ReportSection;
}

const KPI_COMPARISON_SUFFIX: Record<string, string> = {
  periodo_anterior: 'vs. período anterior',
  ano_anterior: 'vs. ano anterior',
  ambos: 'vs. período e ano anteriores',
};

export const KPIGridSection: React.FC<KPIGridSectionProps> = ({ section }) => {
  const metrics: MetricData[] = section.data.metrics || [];
  const comparisonPeriod = (section.data.comparisonPeriod as string) || 'periodo_anterior';
  const vsLabel = KPI_COMPARISON_SUFFIX[comparisonPeriod] || KPI_COMPARISON_SUFFIX.periodo_anterior;
  const isAmbos = comparisonPeriod === 'ambos';

  const formatVariation = (change?: number, changeType?: string, label?: string) => {
    if (change === undefined) return null;
    const sign = change > 0 ? '▲' : '▼';
    const className = changeType === 'increase' ? 'pos' : changeType === 'decrease' ? 'neg' : '';
    const suffix = label ?? vsLabel;
    return (
      <div className={`kpi-variation ${className}`}>
        {sign} {Math.abs(change)}% {suffix}
      </div>
    );
  };

  return (
    <section className="report-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="kpi-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="kpi-card">
            <div className="kpi-title">{metric.label}</div>
            <div className="kpi-value">{metric.value}</div>
            {isAmbos ? (
              <div className="kpi-variations">
                {formatVariation(metric.change, metric.changeType, 'vs. período anterior')}
                {formatVariation(metric.changeAnoAnterior, metric.changeTypeAnoAnterior, 'vs. ano anterior')}
              </div>
            ) : (
              formatVariation(metric.change, metric.changeType)
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
