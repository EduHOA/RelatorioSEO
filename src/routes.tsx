/**
 * Rotas da aplicação LiveSEO Relatórios
 *
 * /         – Início: criar novo, carregar salvo
 * /novo     – Assistente de novo relatório (ClientSetup)
 * /editor   – Editor do relatório (config vinda de state ou localStorage)
 */

export const ROUTES = {
  HOME: '/',
  NEW_REPORT: '/novo',
  EDITOR: '/editor',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
