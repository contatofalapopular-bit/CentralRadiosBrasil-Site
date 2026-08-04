# Central Rádios Brasil — v22.16.0

## Reprodução automática da última emissora

- Ao abrir ou atualizar o Portal, a última emissora ouvida é restaurada e o Portal tenta iniciar o áudio automaticamente.
- Links compartilhados de emissoras também tentam iniciar a transmissão automaticamente.
- Quando o navegador bloqueia áudio com som sem interação, o Portal fica preparado para iniciar na primeira interação em qualquer área da página, sem exigir especificamente o botão Play.
- Pausar ou fechar o player cancela a tentativa automática pendente.
- Cache do PWA atualizado para `22.16.0`.

## Limitação do navegador

Chrome, Edge, Safari e Firefox podem bloquear reprodução automática audível. O Portal trata essa restrição sem travar o player e mantém o botão Play como alternativa.
