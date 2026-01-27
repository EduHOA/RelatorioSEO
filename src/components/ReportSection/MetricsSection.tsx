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

export const MetricsSection: React.FC<MetricsSectionProps> = ({ section, colors }) => {
  const metrics: MetricData[] = section.data.metrics || [];

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

  return (
    <section className="report-section metrics-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card" style={{ borderTopColor: colors.primary }}>
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
            {formatChange(metric.change, metric.changeType)}
          </div>
        ))}
      </div>
    </section>
  );
};
