# Central Rádios Brasil — Site v22.17.1

## 22.17.1 — Mapa Sonoro Conectado

- Rede animada construída em HTML, CSS, SVG e JavaScript.
- Pontos luminosos representam cidades com emissoras reais.
- Linhas animadas conectam as cidades ao núcleo CRB e às cidades próximas da mesma região.
- Clique nos pontos para filtrar a cidade no painel.
- Modo com movimento reduzido respeitado.
- Sem alteração no Worker, D1, Admin ou Portal do Cliente.


- Substitui a antiga seção “Explore por regiões” por uma experiência nacional interativa.
- Mapa estilizado com os 26 estados e o Distrito Federal.
- Contagens reais por estado, região e cidade, calculadas a partir de `radios.json`.
- Destaque automático da cidade que entrou mais recentemente no mapa.
- Seleção de regiões, estados e cidades sem duplicar seções da Home.
- Lista compacta de rádios da área e ação para ouvir uma emissora aleatória.
- Botão para abrir o catálogo já filtrado pela área escolhida.
- Layout responsivo e alternativa de navegação por estados no celular.
- Nenhuma mudança no Worker, D1, Admin ou Portal do Cliente.

## 22.16.4 — Correção móvel do player

- Separados os botões Recolher e Fechar no aplicativo móvel.
- O botão flutuante Apoie não cobre mais os controles do player no celular.
- Player recolhido mantém logo e dados da emissora, com seta para reabrir os controles.
- Área segura inferior e telas baixas tratadas no CSS.
- Reprodução automática preservada; `app.js` permanece igual à v22.16.3.
- Nenhum Worker, D1, Admin ou Portal do Cliente foi alterado.

## 22.16.3 — Apoio voluntário por Pix

- Nova página pública `apoie/` com QR Code Pix e chave por e-mail.
- Botão para copiar a chave Pix com retorno acessível.
- Acesso no cabeçalho, Home, rodapé, atalho do PWA e sitemap.
- Aviso explícito de que a contribuição é opcional e não interfere em cadastro, aprovação ou destaque.

## Etapa 5.2 — revisão 22.16.0 com acessibilidade

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


## 22.16.0 — Correção de espaçamento da Home Dinâmica

- Evita que o painel de filtros invada a seção dinâmica anterior.
- Mantém distância consistente no desktop, tablet e celular.


## 22.16.0 — Ajustes de texto e centralização do Hero

- Simplificada a descrição da seção Recém-chegadas.
- Centralizadas as duas linhas do título principal do Hero pelo mesmo eixo horizontal.


## 22.16.0 — Ocorrências e confiabilidade

O Portal permite registrar problemas com emissoras e com a plataforma em `/ocorrencias/`, gerando protocolo e enviando os dados ao Worker principal.
## 22.16.0 — Correção crítica do fluxo de solicitações

Esta revisão impede que o navegador preencha automaticamente o campo antirrobô e elimina a possibilidade de o portal exibir um protocolo que não foi persistido. Também melhora o diagnóstico de falhas de conexão na página de acompanhamento.



## v22.16.0 — reprodução automática
Ao abrir ou atualizar o Portal, a última rádio é restaurada e o áudio é iniciado automaticamente quando permitido pelo navegador. Se o navegador bloquear áudio com som, a primeira interação na página libera a reprodução.


## 22.16.4 — Correção de publicação do Apoio Pix
- Arquivos entregues diretamente na raiz do pacote.
- Cache da PWA atualizado.
- Atalho flutuante de apoio adicionado à Home.