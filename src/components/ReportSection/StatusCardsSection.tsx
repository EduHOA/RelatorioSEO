import React from 'react';
import { ReportSection, StatusCardData } from '../../types/report';
import './SectionStyles.css';

interface StatusCardsSectionProps {
  section: ReportSection;
}

export const StatusCardsSection: React.FC<StatusCardsSectionProps> = ({ section }) => {
  const cards: StatusCardData[] = section.data.cards || [];

  return (
    <section className="report-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="status-grid">
        {cards.map((card, index) => (
          <div key={index} className={`status-card ${card.status}`}>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
