import React from 'react';
import { ReportSection, MetaSEOData } from '../../types/report';
import './SectionStyles.css';

interface MetaSEOSectionProps {
  section: ReportSection;
}

export const MetaSEOSection: React.FC<MetaSEOSectionProps> = ({ section }) => {
  const metaData: MetaSEOData = section.data.metaSEO || {
    metas: []
  };

  return (
    <section className="report-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="meta-container">
        {metaData.description && <p>{metaData.description}</p>}
        {metaData.metas.map((meta, index) => (
          <div key={index} className="meta-bar-wrapper">
            {meta.target && (
              <p>
                <strong>Meta conservadora:</strong> {meta.target}, representando um crescimento de <strong>{meta.growth}</strong>.
              </p>
            )}
            <div className="meta-label">
              <span>{meta.label}</span>
              <span>{meta.percentage}% da meta atingida</span>
            </div>
            <div className="progress-bg">
              <div 
                className={`progress-fill ${meta.color === 'gray' ? 'gray' : ''}`}
                style={{ width: `${meta.percentage}%` }}
              >
                {meta.current}
              </div>
            </div>
          </div>
        ))}
        {metaData.analysis && (
          <div className="meta-analysis">
            {metaData.analysis}
          </div>
        )}
      </div>
    </section>
  );
};
