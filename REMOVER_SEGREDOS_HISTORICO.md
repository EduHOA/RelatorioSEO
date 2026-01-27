# Remover segredos do histórico do Git

O GitHub bloqueou o push porque o histórico contém a chave da OpenAI em:
- **.env** (em commits antigos)
- **src/agents/pdfExtractionAgent.ts** linha 336 (em um commit antigo)

O código **atual** já está correto (usa `import.meta.env.VITE_OPENAI_API_KEY` e não tem chave hardcoded).  
É preciso **reescrever o histórico** para que o repositório remoto nunca tenha visto esses segredos.

## Opção 1: Novo histórico limpo (recomendado para poucos commits)

Cria um único commit inicial sem nenhum segredo no histórico. **O histórico antigo é descartado.**

Execute **na raiz do projeto** (pasta Relatório), no PowerShell ou Git Bash:

```powershell
# 1. Garantir que .env não será incluído (já está no .gitignore)
# 2. Criar um branch órfão (sem histórico)
git checkout --orphan temp_main

# 3. Adicionar tudo exceto .env (o .gitignore já evita .env)
git add -A
git reset -- .env 2>$null; git reset -- .env.local 2>$null  # garantir que .env nunca entre

# 4. Primeiro commit limpo
git commit -m "Initial commit (sem segredos no histórico)"

# 5. Trocar main pelo novo histórico
git branch -D main
git branch -m main

# 6. Enviar substituindo o remoto (force push)
git push -f origin main
```

Depois disso, o repositório no GitHub terá só esse commit, sem segredos.

---

## Opção 2: Manter histórico e limpar com git filter-repo

Se precisar **manter os commits** e só apagar o arquivo `.env` e o trecho com a chave em `pdfExtractionAgent.ts` de todo o histórico:

1. Instale [git-filter-repo](https://github.com/newren/git-filter-repo).

2. Remover `.env` de todo o histórico:
   ```bash
   git filter-repo --path .env --invert-paths --force
   ```

3. Para remover a chave que ficou em `src/agents/pdfExtractionAgent.ts` em um commit antigo, é necessário um replace-text. Crie um arquivo `replacements.txt` com uma linha (substitua pelo padrão que identifica a chave sem colar a chave real), ou use o BFG Repo Cleaner.  
   Como a chave já não está mais no código atual, a solução mais simples costuma ser a **Opção 1**.

---

## Depois de limpar

1. **Revogue a chave antiga** no painel da OpenAI e crie uma nova, pois ela já foi exposta no GitHub.
2. Coloque a nova chave só no seu `.env` local (que não é commitado).
3. Nunca faça commit de `.env` — ele já está no `.gitignore`.
