/**
 * API de tradução para relatórios.
 * Usa endpoint configurável via VITE_TRANSLATE_API_URL (formato LibreTranslate: POST /translate com q, source, target).
 * Se não definido, usa MyMemory (fallback gratuito com limite).
 * Glossário de termos SEO/relatório garante traduções corretas (contexto).
 */

const env = (import.meta as { env?: Record<string, string> }).env ?? {};
const LIBRETRANSLATE_URL = env.VITE_TRANSLATE_API_URL || 'https://libretranslate.com/translate';
const API_KEY = env.VITE_TRANSLATE_API_KEY || '';

const SOURCE_LANG = 'pt';
const TARGET_LANG_MAP = { en: 'en', es: 'es' } as const;
export type TranslateTargetLang = keyof typeof TARGET_LANG_MAP;

/** Glossário PT → EN/ES para termos de relatório SEO (evita traduções erradas da API). */
const GLOSSARY: Record<string, { en: string; es: string }> = {
  Cliques: { en: 'Clicks', es: 'Clics' },
  Impressões: { en: 'Impressions', es: 'Impresiones' },
  'Posição média': { en: 'Average position', es: 'Posición media' },
  'CTR médio': { en: 'Average CTR', es: 'CTR medio' },
  'Sessões orgânicas': { en: 'Organic sessions', es: 'Sesiones orgánicas' },
  Sessões: { en: 'Sessions', es: 'Sesiones' },
  'Novos usuários': { en: 'New users', es: 'Nuevos usuarios' },
  'Total de usuários': { en: 'Total users', es: 'Total de usuarios' },
  'Taxa de engajamento': { en: 'Engagement rate', es: 'Tasa de participación' },
  'Palavras-chave': { en: 'Keywords', es: 'Palabras clave' },
  'palavras-chave': { en: 'keywords', es: 'palabras clave' },
  'Tráfego orgânico': { en: 'Organic traffic', es: 'Tráfico orgánico' },
  Concorrentes: { en: 'Competitors', es: 'Competidores' },
  concorrentes: { en: 'competitors', es: 'competidores' },
  'Autoridade de domínio (DR)': { en: 'Domain Rating (DR)', es: 'Calificación de dominio (DR)' },
  'Autoridade do site (DR)': { en: 'Domain Rating (DR)', es: 'Calificación de dominio (DR)' },
  'Maiores ganhos em palavras-chave': { en: 'Top keyword gains', es: 'Mayores ganancias en palabras clave' },
  'Maiores perdas em palavras-chave': { en: 'Top keyword losses', es: 'Mayores pérdidas en palabras clave' },
  'Impressões (Acumulado)': { en: 'Impressions (Cumulative)', es: 'Impresiones (Acumulado)' },
  'Ano anterior': { en: 'Previous year', es: 'Año anterior' },
  'Período anterior': { en: 'Previous period', es: 'Período anterior' },
  'Principais Métricas': { en: 'Key metrics', es: 'Métricas principales' },
  'Principais Métricas do Site': { en: 'Site key metrics', es: 'Métricas principales del sitio' },
  'Principais Métricas do Blog': { en: 'Blog key metrics', es: 'Métricas principales del blog' },
  'Palavras-chave e URLs': { en: 'Keywords and URLs', es: 'Palabras clave y URLs' },
  'Palavras-chave e URLs do blog': { en: 'Blog keywords and URLs', es: 'Palabras clave y URLs del blog' },
  Análise: { en: 'Analysis', es: 'Análisis' },
  'Análise do blog': { en: 'Blog analysis', es: 'Análisis del blog' },
  'Análise de concorrentes': { en: 'Competitor analysis', es: 'Análisis de competidores' },
  'Análise (Tráfego por LLMs)': { en: 'Analysis (LLM traffic)', es: 'Análisis (Tráfico por LLMs)' },
  'Tráfego por LLMs': { en: 'LLM traffic', es: 'Tráfico por LLMs' },
  Conclusão: { en: 'Conclusion', es: 'Conclusión' },
  'Ações finalizadas': { en: 'Completed actions', es: 'Acciones finalizadas' },
  'Ações em andamento': { en: 'Actions in progress', es: 'Acciones en curso' },
  'Meta SEO': { en: 'SEO goals', es: 'Metas SEO' },
  'Total de palavras-chave no Top 3': { en: 'Total keywords in Top 3', es: 'Total de palabras clave en Top 3' },
  'Total de palavras-chave no Top 4-10': { en: 'Total keywords in Top 4-10', es: 'Total de palabras clave en Top 4-10' },
  'Tráfego orgânico dos concorrentes': { en: 'Competitors’ organic traffic', es: 'Tráfico orgánico de competidores' },
  'Relatório de desempenho do domínio': { en: 'Domain performance report', es: 'Informe de rendimiento del dominio' },
  'Equipe liveSEO': { en: 'liveSEO team', es: 'Equipo liveSEO' },
  'A meta definida abaixo é válida para o período. Ao final desse ciclo, será realizado um novo levantamento para reavaliação dos resultados.': {
    en: 'The goal set below is valid for the period. At the end of this cycle, a new assessment will be carried out to re-evaluate results.',
    es: 'La meta definida abajo es válida para el período. Al final de este ciclo, se realizará un nuevo levantamiento para reevaluación de los resultados.',
  },
};

function isLikelyUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim()) || /^data:/i.test(s.trim());
}

function isNumericOrEmpty(s: string): boolean {
  const t = s.trim();
  if (t.length === 0) return true;
  if (t === '—' || t === '–' || t === '-') return true; // placeholders
  return /^\d+([.,]\d+)?%?$/.test(t) || /^[\d\s.,+-]+$/.test(t);
}

function glossaryLookup(text: string, targetLang: TranslateTargetLang): string | null {
  const trimmed = text.trim();
  const key = trimmed;
  const entry = GLOSSARY[key];
  if (entry) return targetLang === 'en' ? entry.en : entry.es;
  return null;
}

/**
 * Traduz um texto via API (formato LibreTranslate).
 */
export async function translateText(
  text: string,
  targetLang: TranslateTargetLang
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || isLikelyUrl(trimmed) || isNumericOrEmpty(trimmed)) {
    return text;
  }

  const fromGlossary = glossaryLookup(trimmed, targetLang);
  if (fromGlossary != null) return fromGlossary;

  const target = TARGET_LANG_MAP[targetLang];
  const body: Record<string, string> = {
    q: trimmed,
    source: SOURCE_LANG,
    target,
  };
  if (API_KEY) body.api_key = API_KEY;

  try {
    const res = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const fallback = await translateWithMyMemory(trimmed, target);
      return fallback ?? text;
    }

    const data = await res.json();
    const translated = (data as { translatedText?: string }).translatedText;
    return typeof translated === 'string' ? translated : text;
  } catch {
    try {
      return (await translateWithMyMemory(trimmed, target)) ?? text;
    } catch {
      return text;
    }
  }
}

/**
 * Fallback: MyMemory API (GET, sem chave, limite de uso).
 */
async function translateWithMyMemory(text: string, targetLang: string): Promise<string | null> {
  const langpair = `${SOURCE_LANG}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const translated = (data as { responseData?: { translatedText?: string } }).responseData?.translatedText;
  return typeof translated === 'string' ? translated : null;
}

/**
 * Coleta todos os caminhos de valores string em um objeto (para traduzir).
 */
function collectStringPaths(
  obj: unknown,
  path: (string | number)[] = []
): { value: string; path: (string | number)[] }[] {
  const out: { value: string; path: (string | number)[] }[] = [];

  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      const s = obj;
      if (s.length > 0 && !isLikelyUrl(s) && !isNumericOrEmpty(s)) {
        out.push({ value: s, path: [...path] });
      }
    }
    return out;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      out.push(...collectStringPaths(item, [...path, i]));
    });
    return out;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      if (value.length > 0 && !isLikelyUrl(value) && !isNumericOrEmpty(value)) {
        out.push({ value, path: [...path, key] });
      }
    } else {
      out.push(...collectStringPaths(value, [...path, key]));
    }
  }
  return out;
}

function setByPath(obj: Record<string, any>, path: (string | number)[], value: string): void {
  let current: any = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const nextKey = path[i + 1];
    if (current[key] === undefined) current[key] = typeof nextKey === 'number' ? [] : {};
    current = current[key];
  }
  if (path.length > 0) current[path[path.length - 1]] = value;
}

/**
 * Traduz todo o conteúdo textual de um ReportConfig e retorna um novo config.
 */
export async function translateReportConfig(
  config: import('../types/report').ReportConfig,
  targetLang: TranslateTargetLang
): Promise<import('../types/report').ReportConfig> {
  const clone = JSON.parse(JSON.stringify(config)) as import('../types/report').ReportConfig;
  const paths = collectStringPaths(clone);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (const { value, path } of paths) {
    const translated = await translateText(value, targetLang);
    setByPath(clone as Record<string, any>, path, translated);
    await delay(150);
  }

  return clone;
}
