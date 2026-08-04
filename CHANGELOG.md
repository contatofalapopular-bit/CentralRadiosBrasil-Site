## 22.16.0 — Reprodução automática da última rádio

- Tenta reproduzir automaticamente a última emissora ao abrir ou atualizar o Portal.
- Tenta iniciar automaticamente emissoras abertas por link compartilhado.
- Quando o navegador bloqueia o áudio, a primeira interação em qualquer área do Portal libera a reprodução sem exigir o botão Play.
- Pausar ou fechar o player respeita a decisão do ouvinte e cancela novas tentativas automáticas.
- Cache PWA atualizado para 22.16.0.

## 22.15.1 — Correção do cadastro e acompanhamento

- Eliminado o falso protocolo causado pelo preenchimento automático do campo antirrobô.
- O envio remove o campo de segurança antes de montar o formulário.
- A consulta agora apresenta mensagens claras para indisponibilidade e tempo excedido.
- Cache do PWA atualizado para forçar a entrega dos arquivos corrigidos.

## 22.15.1 — Correção de espaçamento da Home Dinâmica

- Corrigida a sobreposição do painel de filtros com a última seção dinâmica da Home.
- Restaurado espaçamento vertical consistente após Categorias em destaque e demais seções de descoberta.
- Ajuste responsivo aplicado também em tablets e celulares.
- Mantidos cards, filtros, catálogo, player, PWA e acessibilidade.
- Cache PWA atualizado para 22.15.1.

## 22.14.0 — Descoberta de Emissoras e Home Dinâmica

- Nova seção “Continuar ouvindo”, usando a última emissora salva no aparelho.
- Nova seção “Recém-chegadas”, ordenada por datas reais do catálogo.
- Nova exploração por regiões brasileiras, exibindo apenas regiões representadas no banco.
- Nova seção de rádios verificadas, baseada no status oficial da emissora.
- Novas categorias em destaque, calculadas pelas emissoras disponíveis.
- Filtros rápidos por região e categoria integrados ao catálogo.
- Cards com dimensões estáveis no desktop, tablet e celular.
- Mantidos ranking, favoritas, player, Streaming CRB, PWA e acessibilidade.

## 22.13.0 — Estrutura Institucional, Privacidade, SEO e Compartilhamento

- Criadas páginas públicas de Privacidade, Termos de Uso, Regras para Emissoras e Suporte.
- Adicionado rodapé institucional em todas as páginas públicas.
- Incluídos canonical, Open Graph, Twitter Card e JSON-LD.
- Criados robots.txt, sitemap.xml e imagem social 1200 × 630.
- Compartilhamento de rádio passa a gerar link exclusivo com `?radio=`.
- Link direto abre e destaca a emissora, prepara o player e aguarda ação do usuário.
- Adicionado botão de compartilhar ao player.
- Consentimentos de cadastro e Streaming CRB ligados aos documentos institucionais.
- Cache PWA atualizado para 22.13.0.

## 22.12.3 — Correção do espaçamento dos botões do Hero

- Reorganizadas as cinco ações principais da Home.
- Desktop: três botões na primeira linha e dois centralizados na segunda.
- Tablet: duas colunas, com a última ação centralizada.
- Celular: uma coluna, sem sobreposição ou corte de texto.
- Permitida quebra de texto controlada dentro dos botões.
- Mantidos Streaming CRB, pré-cadastro, player, PWA e acessibilidade.

## 22.12.0 — Streaming CRB e pré-cadastro de interessados

- Criada a nova página/aba pública **Streaming CRB**.
- Adicionada apresentação do futuro serviço de streaming para rádios online.
- Criado formulário acessível de pré-cadastro de interessados.
- Integração preparada com o Worker principal e o banco D1.
- Adicionado acesso ao Streaming CRB no cabeçalho e no Hero do Portal.
- Service Worker atualizado para disponibilizar a nova página no PWA.
- O pré-cadastro é gratuito e não representa contratação ou cobrança.

## 22.12.0 — Ícone e abertura do aplicativo

- Atualizados o ícone instalado, favicon e ícone de dispositivos Apple.
- Criado novo ícone maskable com área segura para Android.
- Corrigida a tela de abertura do PWA para usar fundo azul institucional e logo proporcional.
- Renomeados os arquivos de ícone para impedir reutilização do cache antigo.
- Cache PWA atualizado para 22.12.0.

## 22.11.2 — Ajuste visual da logo do portal

- Corrigido o enquadramento da logo institucional no cabeçalho do portal.
- Substituída a imagem principal da marca por uma versão em PNG com melhor recorte visual.
- Removido o aspecto desproporcional do fundo preto ao redor da logo.
- Mantidos identidade visual, acessibilidade, player e PWA.
- Cache PWA atualizado para 22.11.2.

# Changelog

## 22.11.1 — Correção do player no aplicativo móvel

- Corrigido o botão “Fechar player” que desaparecia em telas com até 390 px.
- O botão agora permanece visível no aplicativo instalado e no navegador móvel.
- Posicionamento ajustado para não retirar espaço dos controles de reprodução.
- Preservada a abertura da última emissora ouvida.
- Cache PWA atualizado para 22.11.1.

## 22.11.0 — Acessibilidade do Portal

- Adicionado link “Pular para o conteúdo principal” em todas as páginas.
- Criado foco visível reforçado para teclado e suporte a alto contraste.
- Cards de emissoras corrigidos para evitar controles interativos aninhados.
- Ranking principal convertido para botões nativos.
- Top 10, Modo Carro e instruções de instalação agora prendem e restauram o foco corretamente.
- Player anuncia seleção, conexão, reprodução, pausa e erros para leitores de tela.
- Formulários focam o primeiro campo inválido e anunciam erros e confirmações.
- Emojis decorativos foram ocultados de leitores de tela nos principais controles.
- Corrigidos HTML inválido no Hero e identificador duplicado da barra do Modo Carro.
- Mantidos Hero, identidade visual, player, ranking, favoritas, ZAP, Modo Carro e integrações existentes.
- Cache PWA atualizado para 22.11.0.

## 22.10.1 — Correções de espaçamento

- Corrigido o título de Favoritas escondido pelo cabeçalho fixo.
- Removida a sobreposição dos filtros sobre a seção Favoritas.
- Cards de favoritas centralizados quando houver poucas emissoras.
- Ranking centralizado quando houver menos de cinco rádios.
- Aumentada a altura útil dos cards do ranking para impedir cortes nos selos e nas reproduções válidas.
- Espaçamentos verticais do ranking e das favoritas refinados.
- Cache PWA atualizado para 22.10.1.

## 22.10.0 — Player Premium, Popularidade e ZAP

- Capa ampliada para 74px no player.
- Iluminação e animação suave durante a reprodução.
- Controle de volume sincronizado entre player e Modo Carro.
- Cronômetro de tempo ouvido.
- Indicador de qualidade da conexão e estabilidade real da transmissão.
- Wake Lock opcional no Modo Carro.
- ZAP automático a cada 20 segundos.
- Selos de popularidade baseados em dados reais.
- Fallback de metadados alterado para “Programação ao vivo”.
- Atualização do cache PWA para 22.10.0.
