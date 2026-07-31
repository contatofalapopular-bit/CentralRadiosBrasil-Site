# Changelog

## 22.3.6 — Acesso ao Portal da Emissora

- Novo botão com ícone “Cadastre sua rádio” na área principal.
- Link preparado para `centralradiosbrasil.com.br/cadastro/`.
- Criada página temporária da rota de cadastro para evitar link quebrado.
- O formulário completo será implantado na Etapa 2.
- Identidade visual e responsividade preservadas.


## Home 2.0 — Fase 1 (31/07/2026)

- Reconstrução real do `index.html`.
- Remoção completa do placeholder e das referências inexistentes a `streaming-layout.css` e `streaming-layout.js`.
- Novo Hero institucional, mantendo a identidade visual aprovada.
- Nova arquitetura de descoberta com Mais Ouvidas, Novidades e Favoritas.
- Nova área de categorias com atalhos funcionais.
- Nova apresentação das regiões e do catálogo nacional.
- Nova seção “Para Emissoras”.
- Novo CSS escrito do zero, responsivo para computador, tablet e celular.
- Player, favoritos, filtros, destaque e leitura do `radios.json` preservados.


## 22.2.6 — Ranking Nacional
- Top 3 com medalhas, bordas ouro/prata/bronze e audiência.
- Botão Ver Top 10 com modal completo.
- Integração com o player para emissoras reais.
- Dados demonstrativos usados somente enquanto não houver métricas reais suficientes.

## 22.3.0 — Estatísticas reais via API
- Integração do player com `POST /api/play` no Cloudflare Worker.
- Registro somente após o áudio entrar no estado `playing`.
- Identificador persistente de sessão salvo no navegador.
- Envio de rádio, origem, cidade e estado ao banco D1.
- Falhas na API não interrompem a reprodução da emissora.
- Proteção contra chamadas simultâneas no cliente; deduplicação definitiva mantida no Worker.
