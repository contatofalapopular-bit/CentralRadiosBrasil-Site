# Central Rádios Brasil — Site v22.6.0

## Ranking válido após cinco minutos

- O início do áudio não gera mais pontuação imediata.
- A reprodução somente entra no ranking depois de **5 minutos de áudio efetivamente reproduzido**.
- Pausar, fechar o player, trocar de emissora ou ocorrer erro antes do tempo cancela a contagem.
- Pequenos períodos de carregamento não contam como tempo ouvido; espera superior a 60 segundos encerra a tentativa.
- O navegador envia progresso ao Worker a cada 30 segundos.
- O ranking exibe **reproduções válidas**, e não “ouvintes”.
- A mesma sessão ou dispositivo não pontua novamente na mesma rádio dentro de 30 minutos.

## Publicação

1. Publique primeiro o **Worker v1.6.0**.
2. Depois substitua os arquivos do repositório `CentralRadiosBrasil-Site` pelos arquivos deste pacote.
3. Preserve o arquivo `CNAME`.
4. Após o GitHub Pages ficar verde, abra o portal e pressione `Ctrl + F5`.

## Observação

O ranking correto começa com uma base nova de reproduções validadas. Os registros antigos, que não comprovavam cinco minutos de áudio, não são usados na nova classificação.
