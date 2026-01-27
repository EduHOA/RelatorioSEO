import React, { useState } from 'react';
import { ReportSection, ReportImage } from '../../types/report';
import './SectionStyles.css';

interface ImageSectionProps {
  section: ReportSection;
}

export const ImageSection: React.FC<ImageSectionProps> = ({ section }) => {
  const images: ReportImage[] = section.data.images || [];
  const [modalImage, setModalImage] = useState<string | null>(null);

  const openModal = (src: string) => {
    setModalImage(src);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <>
      <section className="report-section image-section">
        {section.title && <h2 className="section-title">{section.title}</h2>}
        <div className="image-compare">
          {images.map((image) => (
            <div key={image.id} className="image-card">
              {image.caption && (
                <div className="image-header">
                  <h4>{image.caption.split(' - ')[0] || image.caption}</h4>
                  {image.caption.includes('•') && (
                    <span className="image-tag">
                      {image.caption.split('•')[1]?.trim() || 'Google'}
                    </span>
                  )}
                </div>
              )}
              <img 
                src={image.url} 
                alt={image.alt}
                onClick={() => openModal(image.url)}
              />
              {image.caption && !image.caption.includes('•') && (
                <p className="image-caption">{image.caption}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <div 
        className={`image-modal ${modalImage ? 'active' : ''}`}
        onClick={closeModal}
      >
        <span className="modal-close" onClick={closeModal}>&times;</span>
        {modalImage && (
          <img 
            className="modal-content" 
            src={modalImage}
            alt="Imagem ampliada"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </>
  );
};
