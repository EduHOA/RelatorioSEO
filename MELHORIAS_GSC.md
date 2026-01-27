# Melhorias para Captura Precisa de Dados do GSC

## Problemas Identificados

### 1. **Impressões Calculadas por Proporção** ❌
**Problema:** O sistema está calculando impressões por proporção em vez de ler diretamente do Excel (linhas 438-450).

**Impacto:** Valores imprecisos, especialmente quando há variações no CTR entre palavras-chave.

**Solução:** Buscar colunas de impressões diretamente do Excel quando disponíveis.

---

### 2. **CTR e Posição Calculados** ❌
**Problema:** CTR e posição são calculados ou usam valores médios do summary em vez de valores específicos por palavra-chave.

**Impacto:** Perda de precisão nos dados individuais de cada palavra-chave.

**Solução:** Priorizar valores diretos do Excel, calcular apenas quando não disponíveis.

---

### 3. **Detecção de Colunas Limitada** ⚠️
**Problema:** O mapeamento de colunas pode falhar com variações de nomes ou formatos diferentes de exportação.

**Solução:** Expandir lista de variações de nomes e adicionar fallback inteligente.

---

### 4. **Validação de Dados Insuficiente** ⚠️
**Problema:** Não há validação se os valores extraídos fazem sentido (ex: CTR > 100%, posição negativa).

**Solução:** Adicionar validações e logs de dados suspeitos.

---

## Recomendações de Implementação

### Prioridade ALTA 🔴

1. **Buscar Impressões Diretamente do Excel**
   - Adicionar mapeamento de colunas de impressões na planilha de palavras-chave
   - Usar valores diretos quando disponíveis
   - Calcular por proporção apenas como último recurso

2. **Buscar CTR e Posição por Palavra-Chave**
   - Mapear colunas de CTR e posição na planilha de keywords
   - Usar valores específicos de cada linha
   - Validar valores (CTR entre 0-100%, posição > 0)

### Prioridade MÉDIA 🟡

3. **Melhorar Detecção de Colunas**
   - Adicionar mais variações de nomes (português/inglês)
   - Detectar formato de exportação (GSC padrão vs customizado)
   - Suportar múltiplos formatos de cabeçalho

4. **Validação e Logging**
   - Validar valores extraídos
   - Logar dados suspeitos para debug
   - Alertar usuário sobre dados inconsistentes

### Prioridade BAIXA 🟢

5. **Otimizações**
   - Cache de mapeamento de colunas
   - Processamento paralelo para múltiplos arquivos
   - Melhor tratamento de erros com mensagens específicas

---

## Estrutura Ideal do Arquivo Excel

### Página "Summary" (Primeira página)
```
Linha 0: Cabeçalho | Período | Cliques | Impressões | CTR | Posição média
Linha 1: Período atual | 1234 | 5678 | 2.15% | 5.2
Linha 2: Período comparação | 1000 | 5000 | 2.00% | 5.5
Linha 3: Diferença % | +23.4% | +13.56% | +7.5% | -5.45%
```

### Página "Keywords" (Segunda página)
```
Linha 0: Palavras-chave | Cliques (atual) | Impressões (atual) | CTR (atual) | Posição (atual) | Cliques (comparação) | Impressões (comparação) | CTR (comparação) | Posição (comparação) | Diferença | % Diferença
Linha 1: palavra chave 1 | 100 | 1000 | 10.00% | 3.5 | 80 | 900 | 8.89% | 4.0 | +20 | +25%
...
```

---

## Formato de Exportação Recomendado do GSC

Para garantir máxima precisão, recomende ao usuário exportar do GSC com:

1. **Todas as colunas disponíveis:**
   - Query (Palavra-chave)
   - Clicks (Cliques)
   - Impressions (Impressões)
   - CTR
   - Position (Posição média)

2. **Comparação de períodos:**
   - Exportar dados do período atual
   - Exportar dados do período de comparação
   - Ou usar a funcionalidade de comparação do GSC (se disponível)

3. **Estrutura de arquivo:**
   - Primeira página: Resumo agregado (Summary)
   - Segunda página: Dados detalhados por palavra-chave

---

## Próximos Passos

1. Implementar busca direta de impressões, CTR e posição
2. Expandir mapeamento de colunas
3. Adicionar validações
4. Testar com diferentes formatos de exportação
5. Documentar formato esperado para usuários
