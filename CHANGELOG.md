# CHANGELOG — Central Rádios Brasil

## 22.4.0 — Parte 7: Visual Premium 2026

- Cabeçalho premium com navegação rápida para Destaque, Regiões, Novidades e Emissoras.
- Barra de progresso de leitura no topo da página.
- Novo acabamento visual para estatísticas, filtros, regiões, cards e player.
- Efeitos de profundidade, brilho, elevação e transições mais suaves.
- Entrada animada das seções e dos cards conforme o conteúdo aparece.
- Botão flutuante para voltar ao topo.
- Melhorias específicas para celular e telas menores.
- Respeito automático à preferência de acessibilidade por movimento reduzido.

## 22.3.2 — Parte 6: Estatísticas nacionais

- Seis indicadores calculados diretamente a partir das emissoras públicas e ativas.
- Totais automáticos de emissoras, estados, cidades, categorias, streams ativos e verificadas.
- Contagem independente do bloco `totais` do banco, evitando números zerados ou desatualizados.
- Animação numérica com formatação brasileira para valores maiores.
- Cidades identificadas por cidade + UF para impedir duplicidade incorreta entre estados.
- Streams duplicados da mesma emissora são contabilizados apenas uma vez.
- Grade responsiva em três, duas ou uma coluna conforme a tela.

## 22.3.1 — Parte 5: Rádios recém-adicionadas

- Nova seção “Recém-chegadas à Central”.
- Exibição automática de até 10 emissoras mais recentes.
- Ordenação por `dataPublicacao` e campos de data compatíveis.
- Selo visual “NOVA” em cada emissora da seção.
- Data de entrada na Central exibida quando disponível.
- Fallback seguro para a ordem do `radios.json` quando não houver data.
- Integração preservada com player, favoritas e compartilhamento.
- Layout responsivo para computador e celular.

# Histórico de versões

## 22.3.0 — Parte 4: Rádio em Destaque dinâmica

- Exibe automaticamente a emissora marcada com `status.destaque: true`.
- Usa uma emissora pública e ativa como destaque automático enquanto não houver destaque oficial.
- Mostra logo, categoria, descrição, cidade, UF e link do site quando disponível.
- Botão **Ouvir agora** integrado ao player e ao contador de reproduções.
- Layout premium e responsivo com melhor acessibilidade.

## 22.2.9 — Parte 3: Mais ouvidas por você
- Ranking automático baseado nas reproduções feitas neste navegador.
- Contagem individual de reproduções por emissora.
- Lista das cinco emissoras mais ouvidas.
- Botão para limpar o histórico local.
- Integração com player, favoritas e cards existentes.
- Mantida a correção de espaçamento da versão 22.2.8.1.

## 22.2.8.1 — Correção visual
- Corrigida a sobreposição entre os cards de regiões e a barra de filtros.

## 22.2.8 — Parte 2: Explorar por regiões
- Filtro pelas cinco regiões brasileiras com contagem automática.

## 22.2.7 — Parte 1: Favoritas
- Até cinco favoritas salvas no navegador.
