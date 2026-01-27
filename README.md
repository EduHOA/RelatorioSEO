# Sistema de Relatórios LiveSEO

Sistema dinâmico para criação e personalização de relatórios de análise de resultados para clientes da LiveSEO.

## 🚀 Características

- **Totalmente Dinâmico**: Personalize ordem, conteúdo e visibilidade de cada seção
- **Múltiplos Tipos de Seção**: Cabeçalho, Resumo, Métricas, Gráficos, Tabelas, Imagens, Texto, Comparações e Rodapé
- **Interface Intuitiva**: Editor visual com preview em tempo real
- **Exportação**: Exporte para PDF ou HTML
- **Padrão Consistente**: Mantém o padrão visual enquanto permite personalização
- **TypeScript**: Totalmente tipado para maior segurança e produtividade

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📖 Como Usar

### 1. Criar um Novo Relatório

- Clique em "Novo Relatório" no canto inferior direito
- Informe o nome do cliente e o período
- Um relatório padrão será criado automaticamente

### 2. Personalizar o Relatório

#### Adicionar Seções
- Clique em "Editar" para entrar no modo de edição
- Clique em "+ Adicionar Seção" na barra lateral
- Escolha o tipo de seção desejado

#### Editar Seções
- Selecione uma seção na lista lateral
- Edite os campos no painel direito
- As alterações são salvas automaticamente

#### Reordenar Seções
- Use os botões ↑ e ↓ na lista de seções
- Ou arraste e solte (funcionalidade futura)

#### Mostrar/Ocultar Seções
- Clique no ícone de olho 👁️ para alternar visibilidade
- Seções ocultas aparecem esmaecidas na lista

### 3. Visualizar

- Clique em "Visualizar" para ver o relatório final
- O preview mostra exatamente como o cliente verá

### 4. Exportar

- **PDF**: Clique em "Exportar PDF" para gerar um arquivo PDF
- **HTML**: Clique em "Exportar HTML" para gerar um arquivo HTML standalone

## 🎨 Tipos de Seção

### Cabeçalho (Header)
- Título do relatório
- Nome do cliente
- Período
- Logo (opcional)

### Resumo (Summary)
- Texto de resumo
- Lista de destaques

### Métricas (Metrics)
- Cards com métricas principais
- Valores e percentuais de mudança
- Indicadores visuais (aumento/queda)

### Gráfico (Chart)
- Gráficos de barras, linha, pizza ou área
- Múltiplos datasets
- Legenda personalizada

### Tabela (Table)
- Cabeçalhos personalizáveis
- Múltiplas linhas de dados
- Rodapé opcional

### Imagem (Image)
- Múltiplas imagens
- Legendas opcionais
- Texto alternativo

### Texto (Text)
- Conteúdo HTML livre
- Formatação personalizada

### Comparação (Comparison)
- Comparação entre períodos
- Indicadores de mudança

### Rodapé (Footer)
- Texto personalizado
- Informações de criação

## 💾 Salvamento

O relatório é automaticamente salvo no localStorage do navegador. Para persistência permanente, implemente integração com backend.

## 🔧 Estrutura do Projeto

```
src/
├── components/
│   ├── ReportSection/      # Componentes de cada tipo de seção
│   ├── ReportEditor/       # Editor e interface de personalização
│   └── ReportRenderer.tsx  # Renderizador principal
├── types/
│   └── report.ts           # Tipos TypeScript
├── utils/
│   ├── exportUtils.ts      # Funções de exportação
│   └── reportTemplates.ts  # Templates padrão
├── App.tsx                  # Componente principal
└── main.tsx                 # Entry point
```

## 🎯 Próximas Melhorias

- [ ] Arrastar e soltar para reordenar seções
- [ ] Mais tipos de gráficos (Chart.js integration)
- [ ] Temas pré-definidos
- [ ] Importar/Exportar configurações JSON
- [ ] Integração com backend
- [ ] Histórico de versões
- [ ] Colaboração em tempo real

## 📝 Licença

Este projeto é de uso interno da LiveSEO.
