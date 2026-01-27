import React from 'react';
import { ReportSection } from '../../types/report';
import './SectionStyles.css';

interface ComparisonSectionProps {
  section: ReportSection;
  colors: {
    primary: string;
    accent: string;
  };
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ section, colors }) => {
  const comparisons = section.data.comparisons || [];

  return (
    <section className="report-section comparison-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="comparison-container">
        <div className="comparisons-grid">
          {comparisons.map((comparison: any, index: number) => (
            <div key={index} className="comparison-card">
              <div className="comparison-period">{comparison.period}</div>
              <div className="comparison-value" style={{ color: colors.primary }}>
                {comparison.value}
              </div>
              {comparison.change !== undefined && (
                <div className={`comparison-change ${comparison.change > 0 ? 'positive' : 'negative'}`}>
                  {comparison.change > 0 ? '↑' : '↓'} {Math.abs(comparison.change)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
