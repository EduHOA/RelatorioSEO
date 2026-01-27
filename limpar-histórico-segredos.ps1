# Script para reescrever o histórico do Git e remover segredos (API key) dos commits.
# Execute na raiz do projeto: .\limpar-histórico-segredos.ps1

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".git")) {
    Write-Error "Execute este script na raiz do repositório (pasta do projeto)."
    exit 1
}

Write-Host "Criando novo histórico sem segredos..." -ForegroundColor Yellow

# Branch órfão = histórico vazio, working tree igual ao atual
git checkout --orphan temp_main

# Adicionar tudo; .gitignore evita .env
git add -A
# Garantir que .env e .env.local nunca entrem (caso tenham sido adicionados)
if (Test-Path ".env") { git reset -- .env }
if (Test-Path ".env.local") { git reset -- .env.local }

git status
Write-Host "`nConfira acima: .env NÃO deve aparecer na lista de 'Changes to be committed'.`n" -ForegroundColor Cyan

git commit -m "Initial commit (sem segredos no histórico)"

# Trocar main pelo novo histórico
git branch -D main
git branch -m main

Write-Host "`nPronto. Agora envie com: git push -f origin main" -ForegroundColor Green
Write-Host "Importante: revogue a chave antiga no painel da OpenAI e use uma chave nova no .env local.`n" -ForegroundColor Yellow
