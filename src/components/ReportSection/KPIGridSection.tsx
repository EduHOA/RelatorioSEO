import React from 'react';
import { ReportSection, MetricData } from '../../types/report';
import { reportStrings, type ReportLocale } from '../../utils/reportStrings';
import './SectionStyles.css';

const KPI_COMPARISON_SUFFIX_PT: Record<string, string> = {
  periodo_anterior: 'vs. período anterior',
  ano_anterior: 'vs. ano anterior',
  ambos: 'vs. período e ano anteriores',
};

interface KPIGridSectionProps {
  section: ReportSection;
  locale?: ReportLocale;
}

export const KPIGridSection: React.FC<KPIGridSectionProps> = ({ section, locale }) => {
  const metrics: MetricData[] = section.data.metrics || [];
  const comparisonPeriod = (section.data.comparisonPeriod as string) || 'periodo_anterior';
  const s = locale ? reportStrings[locale] : null;
  const vsLabel = s
    ? (comparisonPeriod === 'periodo_anterior' ? s.vsPreviousPeriod : comparisonPeriod === 'ano_anterior' ? s.vsPreviousYear : s.vsPeriodAndYear)
    : (KPI_COMPARISON_SUFFIX_PT[comparisonPeriod] || KPI_COMPARISON_SUFFIX_PT.periodo_anterior);
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
                {formatVariation(metric.change, metric.changeType, s ? s.vsPreviousPeriod : 'vs. período anterior')}
                {formatVariation(metric.changeAnoAnterior, metric.changeTypeAnoAnterior, s ? s.vsPreviousYear : 'vs. ano anterior')}
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
