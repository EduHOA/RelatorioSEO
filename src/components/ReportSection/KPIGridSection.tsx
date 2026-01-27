import React from 'react';
import { ReportSection, MetricData } from '../../types/report';
import './SectionStyles.css';

interface KPIGridSectionProps {
  section: ReportSection;
}

export const KPIGridSection: React.FC<KPIGridSectionProps> = ({ section }) => {
  const metrics: MetricData[] = section.data.metrics || [];

  const formatVariation = (change?: number, changeType?: string) => {
    if (change === undefined) return null;
    const sign = change > 0 ? '▲' : '▼';
    const className = changeType === 'increase' ? 'pos' : changeType === 'decrease' ? 'neg' : '';
    return (
      <div className={`kpi-variation ${className}`}>
        {sign} {Math.abs(change)}% vs. período anterior
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
            {formatVariation(metric.change, metric.changeType)}
          </div>
        ))}
      </div>
    </section>
  );
};
