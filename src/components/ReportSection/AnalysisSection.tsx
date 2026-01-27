import React from 'react';
import { ReportSection } from '../../types/report';
import './SectionStyles.css';

interface AnalysisSectionProps {
  section: ReportSection;
}

export const AnalysisSection: React.FC<AnalysisSectionProps> = ({ section }) => {
  const analysis = section.data.analysis || '';
  const title = section.data.title || section.title || 'Análise';

  return (
    <section className="report-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="analysis-section">
        {!section.title && title && <h3>{title}</h3>}
        <div className="analysis-content" dangerouslySetInnerHTML={{ __html: analysis }} />
      </div>
    </section>
  );
};
