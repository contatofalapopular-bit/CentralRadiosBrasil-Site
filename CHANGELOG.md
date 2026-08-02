# Central Rádios Brasil — Site v22.8.0

## PWA instalável

- Adicionado `manifest.webmanifest`.
- Adicionado `service-worker.js` na raiz para controlar todo o portal.
- Adicionados ícones oficiais para tela inicial e modo maskable.
- Adicionado botão **Instalar aplicativo** nas páginas públicas.
- Adicionada tela offline.
- Cache seguro das páginas essenciais e do último `radios.json` disponível.
- Atualização automática de novas versões, preservando áudio em reprodução.
- Avisos de perda e retorno da conexão.

---

## 22.7.0 — Cadastro fácil e anti-duplicidade

- Cidades oficiais carregadas por estado usando a API de Localidades do IBGE.
- Categoria principal transformada em lista padronizada.
- Formatação automática de site e WhatsApp.
- Rascunho salvo localmente no aparelho.
- Verificação prévia de emissora, stream e domínio duplicados.
- Bloqueio de stream ou emissora já publicados ou com solicitação ativa.
- Mensagens de orientação mais claras durante o cadastro.

## 22.7.0 — Ranking válido após cinco minutos

- Contagem em duas etapas: início da sessão e confirmação de progresso.
- Reprodução somente validada após 300 segundos de áudio.
- Pausa, troca, fechamento ou erro antes do prazo cancelam a tentativa.
- Heartbeat de progresso a cada 30 segundos.
- Proteção por sessão e dispositivo, com intervalo mínimo de 30 minutos por rádio.
- Ranking renomeado de “ouvintes” para “reproduções válidas”.
- Base do ranking passa a ignorar reproduções antigas sem validação de tempo.

## 22.5.2 — Alterações da emissora e proteção contra streams fora do ar

- Página Acompanhar cadastro permite solicitar alterações após a aprovação.
- Dados já publicados permanecem ativos até a análise administrativa e uma nova publicação.
- Novo teste obrigatório de reprodução quando a URL do stream é alterada.
- Portal consulta o monitoramento automático e oculta temporariamente emissoras sem áudio por 12 horas.
- Emissoras reaparecem após duas verificações consecutivas com áudio.

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
