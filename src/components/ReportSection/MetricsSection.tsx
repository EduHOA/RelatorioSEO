import React from 'react';
import { ReportSection, MetricData } from '../../types/report';
import './SectionStyles.css';

interface MetricsSectionProps {
  section: ReportSection;
  colors: {
    primary: string;
    accent: string;
  };
}

const COMPARISON_LABELS: Record<string, string> = {
  periodo_anterior: 'Comparação: período anterior',
  ano_anterior: 'Comparação: ano anterior',
  ambos: 'Comparação: período e ano anteriores',
};

export const MetricsSection: React.FC<MetricsSectionProps> = ({ section, colors }) => {
  const metrics: MetricData[] = section.data.metrics || [];
  const comparisonPeriod = (section.data.comparisonPeriod as string) || 'periodo_anterior';
  const comparisonLabel = COMPARISON_LABELS[comparisonPeriod] || COMPARISON_LABELS.periodo_anterior;

  const formatChange = (change?: number, type?: string) => {
    if (change === undefined) return null;
    const sign = change > 0 ? '+' : '';
    const className = type === 'increase' ? 'positive' : type === 'decrease' ? 'negative' : 'neutral';
    return (
      <span className={`metric-change ${className}`}>
        {sign}{change}%
      </span>
    );
  };

  const isAmbos = comparisonPeriod === 'ambos';

  return (
    <section className="report-section metrics-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <p className="metrics-comparison-hint">{comparisonLabel}</p>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card" style={{ borderTopColor: colors.primary }}>
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
            {isAmbos ? (
              <div className="metric-changes metric-changes-dual">
                <div className="metric-change-line">
                  {formatChange(metric.change, metric.changeType)}
                  <span className="metric-change-context">vs. período anterior</span>
                </div>
                <div className="metric-change-line">
                  {formatChange(metric.changeAnoAnterior, metric.changeTypeAnoAnterior)}
                  <span className="metric-change-context">vs. ano anterior</span>
                </div>
              </div>
            ) : (
              <div className="metric-change-line metric-change-line-single">
                {formatChange(metric.change, metric.changeType)}
                <span className="metric-change-context">
                  {comparisonPeriod === 'ano_anterior' ? 'vs. ano anterior' : 'vs. período anterior'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
