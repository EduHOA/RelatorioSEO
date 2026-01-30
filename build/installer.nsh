; Personalização do instalador NSIS – Relatórios liveSEO
; Estilo alinhado ao aplicativo (laranja #ff9a05, fundo #f4f6f9)

!macro customHeader
  ; Branding: idioma e textos alinhados ao estilo do relatório
!macroend

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Bem-vindo ao Relatórios liveSEO"
  !define MUI_WELCOMEPAGE_TEXT "Este assistente irá instalar o Relatórios liveSEO no seu computador.$\r$\n$\r$\nO Relatórios liveSEO é a ferramenta para criação e edição de relatórios de análise de resultados, no estilo da liveSEO.$\r$\n$\r$\nRecomenda-se fechar outras aplicações antes de continuar. Clique em Avançar para prosseguir."
  !insertMacro MUI_PAGE_WELCOME
!macroend

!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Desinstalar Relatórios liveSEO"
  !define MUI_WELCOMEPAGE_TEXT "Este assistente irá remover o Relatórios liveSEO do seu computador.$\r$\n$\r$\nFeche o aplicativo se estiver em execução antes de continuar.$\r$\n$\r$\nClique em Avançar para prosseguir."
  !insertMacro MUI_UNPAGE_WELCOME
!macroend
