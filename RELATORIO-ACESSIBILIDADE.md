# Relatório de acessibilidade — Portal 22.11.0

## Escopo

Revisão aplicada sobre a base estável `CentralRadiosBrasil-Site-main(11).zip`, preservando identidade visual, Hero, catálogo, player, ranking, favoritas, ZAP, Modo Carro, cadastro, acompanhamento e recursos PWA.

## Melhorias implementadas

- Link “Pular para o conteúdo principal” na Home, cadastro, acompanhamento e página institucional.
- Foco visível reforçado para teclado, inclusive em modo de alto contraste.
- Respeito à preferência de redução de movimento.
- Cards das rádios sem controles interativos aninhados.
- Cards do ranking principal convertidos em botões nativos.
- Top 10, Modo Carro e instruções de instalação com foco preso, fechamento por Escape e retorno ao controle de origem.
- Fundo das janelas tornado inerte enquanto o diálogo está aberto.
- Anúncios de seleção, conexão, reprodução, pausa e falhas do player para leitores de tela.
- Emojis decorativos ocultados dos leitores de tela nos principais controles e indicadores.
- Formulários com foco no primeiro campo inválido, `aria-invalid` e mensagens de erro/status apropriadas.
- Resultados de cadastro e acompanhamento recebem foco após a conclusão.
- Campos de alteração ganharam informações de preenchimento automático e descrições associadas.
- Correção do HTML incompleto no Hero e do ID duplicado da barra de estabilidade do Modo Carro.
- Novo módulo compartilhado `accessibility.js`, incluído no cache do Service Worker.

## Validações automáticas executadas

- Sintaxe JavaScript verificada com `node --check`.
- CSS analisado com `tinycss2`, sem erros de parsing.
- HTML analisado com `lxml`, sem erros estruturais.
- Ausência de IDs duplicados.
- Todas as referências `aria-labelledby`, `aria-describedby` e `aria-controls` apontam para IDs existentes.
- Imagens estáticas possuem texto alternativo.
- Controles de formulário possuem rótulo associado ou nome acessível.
- Todos os arquivos essenciais listados pelo Service Worker existem.
- Nenhum arquivo da base estável original foi removido.

## Testes manuais recomendados após a publicação

A revisão melhora significativamente a conformidade com WCAG 2.2, mas uma declaração formal de conformidade AA exige testes no endereço publicado com:

- teclado, sem mouse;
- NVDA com Chrome ou Firefox no Windows;
- VoiceOver no Safari para iPhone/macOS;
- TalkBack no Android;
- zoom de 200% e 400%;
- contraste medido nos estados reais carregados pelo banco e pela API.

Esses testes são necessários porque leitores de tela, navegadores, conteúdo remoto e estados de transmissão podem se comportar de forma diferente no ambiente publicado.
