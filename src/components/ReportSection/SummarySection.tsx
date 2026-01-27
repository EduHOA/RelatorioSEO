import React from 'react';
import { ReportSection } from '../../types/report';
import './SectionStyles.css';

interface SummarySectionProps {
  section: ReportSection;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ section }) => {
  const summary = section.data.summary || '';
  const highlights = section.data.highlights || [];

  return (
    <section className="report-section summary-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      {summary && <p className="summary-text">{summary}</p>}
      {highlights.length > 0 && (
        <ul className="highlights-list">
          {highlights.map((highlight: string, index: number) => (
            <li key={index} className="highlight-item">{highlight}</li>
          ))}
        </ul>
      )}
    </section>
  );
};
