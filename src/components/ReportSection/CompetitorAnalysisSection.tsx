import React from 'react';
import { ReportSection, CompetitorBarData } from '../../types/report';
import './SectionStyles.css';

interface CompetitorAnalysisSectionProps {
  section: ReportSection;
}

export const CompetitorAnalysisSection: React.FC<CompetitorAnalysisSectionProps> = ({ section }) => {
  const barGroups: CompetitorBarData[] = section.data.barGroups || [];

  const getBarClass = (type: string, name: string) => {
    if (name.toLowerCase() === 'gzv') {
      return 'bar-gzv';
    }
    if (type === 'positive') return 'positive';
    if (type === 'negative') return 'negative';
    return 'bar-comp';
  };

  return (
    <section className="report-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="chart-container">
        {barGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bar-group">
            <p className="bar-label">{group.label}</p>
            {group.competitors.map((competitor, compIndex) => {
              const maxValue = Math.max(...group.competitors.map(c => c.percentage));
              const width = maxValue > 0 ? (competitor.percentage / maxValue) * 100 : competitor.percentage;
              
              return (
                <div key={compIndex} className="bar-wrapper">
                  <span className="bar-name">{competitor.name}</span>
                  <div className="bar-outer">
                    <div 
                      className={`bar-inner ${getBarClass(competitor.type, competitor.name)}`}
                      style={{ width: `${width}%` }}
                    >
                      {competitor.value}
                    </div>
                  </div>
                </div>
              );
            })}
            {group.subtitle && (
              <>
                <h5>{group.subtitle}</h5>
                <br />
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
