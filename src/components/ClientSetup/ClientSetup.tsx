import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import { ReportConfig } from '../../types/report';
import { createDefaultReport } from '../../utils/reportTemplates';
import './ClientSetup.css';

interface ClientSetupProps {
  onComplete: (config: ReportConfig) => void;
  onBack: () => void;
}

export const ClientSetup: React.FC<ClientSetupProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState<{
    clientName: string;
    domain: string;
    periodStart: Date | null;
    periodEnd: Date | null;
    period: string;
    comparisonPeriod: 'Período anterior' | 'Ano anterior';
    logo: string;
  }>({
    clientName: '',
    domain: '',
    periodStart: null,
    periodEnd: null,
    period: '',
    comparisonPeriod: 'Ano anterior',
    logo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | Date | null) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      if (field === 'periodStart' || field === 'periodEnd') {
        if (updated.periodStart && updated.periodEnd) {
          updated.period = `${format(updated.periodStart, 'dd/MM/yyyy')} a ${format(updated.periodEnd, 'dd/MM/yyyy')}`;
        }
      }

      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Nome do cliente é obrigatório';
    }

    if (!formData.domain.trim()) {
      newErrors.domain = 'Domínio é obrigatório';
    }

    if (!formData.periodStart || !formData.periodEnd) {
      newErrors.period = 'Período de análise é obrigatório';
    } else if (formData.periodStart > formData.periodEnd) {
      newErrors.period = 'Data inicial deve ser anterior à data final';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateReport = () => {
    if (!validate()) return;

    const config = createDefaultReport(formData.clientName, formData.period);

    config.clientName = formData.clientName;
    config.period = formData.period;
    config.logo = formData.logo || config.logo;

    const headerSection = config.sections.find(s => s.type === 'header');
    if (headerSection) {
      headerSection.data.domain = formData.domain;
      headerSection.data.periodInfo = formData.period;
      headerSection.data.comparisonPeriod = formData.comparisonPeriod;
    }

    onComplete(config);
  };

  return (
    <div className="client-setup">
      <div className="setup-header">
        <button className="btn-back" onClick={onBack}>
          ← Voltar
        </button>
        <h1>Configuração do Relatório</h1>
        <p className="setup-description">
          Preencha as informações básicas. Os dados do relatório serão preenchidos manualmente no editor.
        </p>
      </div>

      <div className="setup-content">
        <div className="setup-form">
          <div className="form-section">
            <h2>Informações do Cliente</h2>

            <div className="form-group">
              <label htmlFor="clientName">
                Nome do Cliente <span className="required">*</span>
              </label>
              <input
                id="clientName"
                type="text"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Ex: GZV Solutions"
                className={errors.clientName ? 'error' : ''}
              />
              {errors.clientName && (
                <span className="error-message">{errors.clientName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="domain">
                Domínio do Site <span className="required">*</span>
              </label>
              <input
                id="domain"
                type="text"
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                placeholder="Ex: gzvsolutions.com.br"
                className={errors.domain ? 'error' : ''}
              />
              {errors.domain && (
                <span className="error-message">{errors.domain}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Período de Análise <span className="required">*</span>
              </label>
              <div className="date-range-picker">
                <div className="date-picker-group">
                  <label className="date-label">De:</label>
                  <DatePicker
                    selected={formData.periodStart}
                    onChange={(date: Date | null) => handleInputChange('periodStart', date)}
                    selectsStart
                    startDate={formData.periodStart}
                    endDate={formData.periodEnd}
                    dateFormat="dd/MM/yyyy"
                    className={errors.period ? 'error' : ''}
                    placeholderText="Data inicial"
                    isClearable
                  />
                </div>
                <div className="date-picker-group">
                  <label className="date-label">Até:</label>
                  <DatePicker
                    selected={formData.periodEnd}
                    onChange={(date: Date | null) => handleInputChange('periodEnd', date)}
                    selectsEnd
                    startDate={formData.periodStart}
                    endDate={formData.periodEnd}
                    minDate={formData.periodStart}
                    dateFormat="dd/MM/yyyy"
                    className={errors.period ? 'error' : ''}
                    placeholderText="Data final"
                    isClearable
                  />
                </div>
              </div>
              {formData.period && (
                <div className="period-display">
                  <strong>Período selecionado:</strong> {formData.period}
                </div>
              )}
              {errors.period && (
                <span className="error-message">{errors.period}</span>
              )}
            </div>

            <div className="form-group form-group-comparison">
              <label htmlFor="comparisonPeriod">
                Período de Comparação
              </label>
              <select
                id="comparisonPeriod"
                value={formData.comparisonPeriod}
                onChange={(e) => handleInputChange('comparisonPeriod', e.target.value)}
                className="form-select"
              >
                <option value="Período anterior">Período anterior</option>
                <option value="Ano anterior">Ano anterior</option>
              </select>
              <small className="form-hint">
                Define a base de comparação dos dados no relatório
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="logo">
                URL do Logo (opcional)
              </label>
              <input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => handleInputChange('logo', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
              <small className="form-hint">
                Se não preenchido, será usado o logo padrão da LiveSEO
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary btn-large" onClick={handleCreateReport}>
              Criar Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
