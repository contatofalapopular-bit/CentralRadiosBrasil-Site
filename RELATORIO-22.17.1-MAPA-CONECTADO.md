# Relatório — 22.17.1 Mapa Sonoro Conectado

## Objetivo
Transformar o Mapa Sonoro em uma experiência visual semelhante ao Hero da plataforma, usando apenas código.

## Implementação
- SVG dinâmico para conexões.
- Pontos gerados com dados reais de UF e cidade do `radios.json`.
- Cores por região.
- Fluxo animado nas linhas.
- Núcleo CRB central.
- Clique em cidade atualiza o painel e as rádios da área.
- Estados sem emissora continuam acessíveis, mas discretos.
- `prefers-reduced-motion` desativa animações para acessibilidade.

## Isolamento
Somente Site Público/PWA. Nenhuma alteração em Worker, D1, Admin ou Portal do Cliente.
