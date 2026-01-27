import React from 'react';
import { ReportSection, GainsLossesData } from '../../types/report';
import './SectionStyles.css';

interface GainsLossesSectionProps {
  section: ReportSection;
}

export const GainsLossesSection: React.FC<GainsLossesSectionProps> = ({ section }) => {
  const data: GainsLossesData[] = section.data.gainsLosses || [];

  return (
    <section className="report-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="data-row">
        {data.map((item, index) => (
          <div key={index} className="data-card">
            <h3>{item.title}</h3>
            <ul className="item-list">
              {item.items.map((listItem, itemIndex) => (
                <li key={itemIndex}>
                  <span>
                    {listItem.url ? (
                      <a href={listItem.url} target="_blank" rel="noopener noreferrer">
                        {listItem.keyword}
                      </a>
                    ) : (
                      listItem.keyword
                    )}
                  </span>
                  <span className={listItem.changeType === 'increase' ? 'pos' : 'neg'}>
                    {listItem.change}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
