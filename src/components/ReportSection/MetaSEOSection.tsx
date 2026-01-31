import React from 'react';
import { ReportSection, MetaSEOData } from '../../types/report';
import { reportStrings, type ReportLocale } from '../../utils/reportStrings';
import './SectionStyles.css';

interface MetaSEOSectionProps {
  section: ReportSection;
  locale?: ReportLocale;
}

export const MetaSEOSection: React.FC<MetaSEOSectionProps> = ({ section, locale }) => {
  const metaData: MetaSEOData = section.data.metaSEO || {
    metas: []
  };
  const s = locale ? reportStrings[locale] : null;
  const metaConservative = s ? s.metaConservative : 'Meta conservadora:';
  const metaGrowthRepresenting = s ? s.metaGrowthRepresenting : 'representando um crescimento de';
  const metaPercentReached = s ? s.metaPercentReached : '% da meta atingida';

  return (
    <section className="report-section">
      {section.title && <h2 className="section-title">{section.title}</h2>}
      <div className="meta-container">
        {metaData.description && <p>{metaData.description}</p>}
        {metaData.metas.map((meta, index) => (
          <div key={index} className="meta-bar-wrapper">
            {meta.target && (
              <p>
                <strong>{metaConservative}</strong> {meta.target}, {metaGrowthRepresenting} <strong>{meta.growth}</strong>.
              </p>
            )}
            <div className="meta-label">
              <span>{meta.label}</span>
              <span>{meta.percentage}{metaPercentReached}</span>
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
