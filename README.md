# Central Rádios Brasil — Site v22.9.0

## Etapa 5.1 — Favoritas, player inteligente e modo carro

- Favoritas ficam salvas no aparelho, sem exigir conta.
- A última rádio é recuperada ao abrir novamente o portal.
- O player tenta reconectar após oscilações de internet e alterna para stream secundário quando disponível.
- O buffer é monitorado para detectar espera, baixo carregamento ou áudio travado.
- O modo carro oferece controles grandes para reduzir interações durante o uso.
- A Media Session API leva nome, logomarca e controles para a tela bloqueada, fones e teclas de mídia compatíveis.
- Música e artista aparecem quando a emissora fornecer metadados por campo do catálogo ou URL compatível. Caso contrário, o aplicativo informa que os metadados não foram enviados.

## Limite atual

A PWA melhora o uso no veículo e os controles do sistema, mas não aparece como aplicativo oficial no Android Auto ou Apple CarPlay. Essa integração exige aplicativos nativos em uma etapa futura.

## Publicação

Substitua todos os arquivos no repositório `CentralRadiosBrasil-Site`, preservando o `CNAME`. Após o GitHub Pages concluir, pressione `Ctrl + F5`.

## Testes

1. Marcar e remover uma rádio favorita.
2. Fechar e abrir o aplicativo para verificar a última rádio.
3. Abrir o modo carro e testar anterior, próxima, play e favorita.
4. Desligar a internet por alguns segundos e confirmar a reconexão após o retorno.
5. Verificar os controles na tela bloqueada do celular.
