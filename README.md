# Central Rádios Brasil — Site v22.14.2

## Etapa 5.2 — revisão 22.14.2 com acessibilidade

- Player premium com capa ampliada e iluminação discreta.
- Tempo ouvido em tempo real.
- Controle de volume.
- Indicador visual de estabilidade e qualidade da conexão.
- Mensagem elegante quando a emissora não fornece metadados.
- Animação e confirmação ao favoritar.
- Modo Carro com opção para manter a tela ligada.
- Modo ZAP: troca automática de emissora a cada 20 segundos.
- Índice de popularidade: Muito Popular, Em Alta, Destaque e Nova.
- Nenhum número de audiência, bitrate ou buffer é inventado.

O índice automático usa a API Worker v1.9.0 e somente reproduções válidas de cinco minutos.

## Correções 22.11.0

- Favoritas e filtros sem sobreposição.
- Seções protegidas do cabeçalho fixo.
- Ranking centralizado e sem conteúdo cortado.


## Acessibilidade 22.11.0

A revisão adiciona melhorias alinhadas à WCAG 2.2: navegação por teclado, foco visível, link de salto, diálogos com foco controlado, semântica correta nos cards, anúncios do player e tratamento acessível de erros em formulários. O visual e as funcionalidades existentes foram preservados. A certificação formal ainda depende de testes manuais com NVDA, VoiceOver e TalkBack em ambiente publicado.


## Correção 22.11.2 — Player no aplicativo móvel

- Restaurado o botão “Fechar player” em telas de até 390 px.
- Botão posicionado no canto superior direito sem comprimir os controles.
- Mantida a restauração da última emissora ao abrir o aplicativo.
- Cache PWA atualizado para distribuir a correção aos aplicativos instalados.


## Correção 22.11.2 — Ajuste visual da logo do portal

- Logo institucional do cabeçalho ajustada para eliminar o excesso visual de fundo preto.
- Nova imagem em PNG com recorte melhor e proporção mais equilibrada.


## Correção 22.12.0 — Ícone e abertura do aplicativo

- Novos ícones PWA produzidos a partir da logo ajustada.
- Ícone adaptável (maskable) com área segura para Android.
- Cor de abertura alterada para o azul institucional, removendo o fundo preto desproporcional.
- Nomes de arquivos renovados para evitar que o celular reutilize ícones antigos do cache.


## 22.12.0 — Streaming CRB

A versão adiciona a página `streaming/`, com apresentação do serviço em desenvolvimento e formulário de pré-cadastro. O formulário depende da rota `POST /api/streaming/interesses` do Worker principal v1.10.0.


## 22.12.3 — Correção do Hero

- As cinco ações principais foram reorganizadas para eliminar sobreposição e espaçamento irregular.
- O layout agora se adapta corretamente a desktop, tablet e celular.


## 22.12.3 — Hero “Conexão”

- A frase principal da Home passa a exibir “O Brasil inteiro em uma só Conexão.”


## 22.12.3 — Hero em duas linhas

O título principal foi redimensionado e estruturado para exibir a frase em duas linhas no desktop, mantendo adaptação para telas menores.


## 22.13.0 — Estrutura Institucional, Privacidade, SEO e Compartilhamento

Esta versão adiciona documentos institucionais, canal público de suporte, SEO técnico e links diretos para compartilhar emissoras. Os textos jurídicos devem passar por revisão profissional antes da operação comercial em escala.


## 22.14.0 — Descoberta de Emissoras e Home Dinâmica

A Home passa a montar automaticamente Continuar ouvindo, Recém-chegadas, regiões, rádios verificadas e categorias em destaque a partir dos dados reais do catálogo e das preferências locais do aparelho.


## 22.14.2 — Correção de espaçamento da Home Dinâmica

- Evita que o painel de filtros invada a seção dinâmica anterior.
- Mantém distância consistente no desktop, tablet e celular.


## 22.14.2 — Ajustes de texto e centralização do Hero

- Simplificada a descrição da seção Recém-chegadas.
- Centralizadas as duas linhas do título principal do Hero pelo mesmo eixo horizontal.
