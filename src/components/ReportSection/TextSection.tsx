import React from 'react';
import { ReportSection } from '../../types/report';
import './SectionStyles.css';

interface TextSectionProps {
  section: ReportSection;
}

export const TextSection: React.FC<TextSectionProps> = ({ section }) => {
  const content = section.data.content || '';

  return (
    <section className="report-section text-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div 
        className="text-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
};
