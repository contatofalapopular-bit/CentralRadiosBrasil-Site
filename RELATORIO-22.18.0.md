# Central Rádios Brasil — Site/PWA 22.18.0

## Melhorias aplicadas

- Player inteligente no desktop: expande ao iniciar uma rádio, recolhe após a rolagem e volta a expandir no topo ou ao receber interação.
- Player inferior no celular e tablet preservado.
- Ordem da página inicial reorganizada para aproximar busca e catálogo do início da navegação.
- Chamada de apoio movida para o final do conteúdo principal; botão do cabeçalho e botão flutuante preservados.
- Páginas individuais de compartilhamento geradas para todas as emissoras atuais, com título, descrição, logomarca, Open Graph, Twitter Card e JSON-LD próprios.
- Catálogo inicial pré-renderizado no HTML e fallback sem JavaScript.
- Snapshot local `catalogo-inicial.json` adicionado para contingência quando o GitHub de dados estiver indisponível.
- Mapa convertido para WebP e carregado sob demanda.
- Logomarca do cabeçalho convertida para WebP em 192 e 384 px.
- Service Worker separado entre núcleo crítico e arquivos opcionais; falha em uma imagem ou página secundária não impede a instalação do PWA.
- Texto do ranking atualizado para refletir a proteção atual por conexão e rede.
- Sitemap ampliado com páginas individuais das emissoras.

## Decisão preservada

As ondas, pulsos, pontos luminosos e fluxos animados do Mapa Sonoro foram mantidos integralmente. Nenhuma animação do mapa foi removida.

## Compatibilidade

- Worker/API 1.18.2: preservado.
- Regras de audiência: preservadas.
- Admin, Portal do Cliente e banco D1: sem alterações.
