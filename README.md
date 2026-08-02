# Central Rádios Brasil — Site v22.5.2

## Alterações implantadas

- A página **Acompanhar cadastro** permite que uma emissora aprovada solicite atualização dos próprios dados.
- Os dados atualmente publicados continuam no portal enquanto a alteração aguarda análise.
- Uma nova URL de stream precisa passar novamente pela validação técnica e pela reprodução real no navegador.
- O catálogo consulta o monitoramento do Worker e oculta temporariamente emissoras que permanecerem sem áudio por 12 horas.
- A emissora volta ao portal depois de duas verificações consecutivas com áudio.
- Se a API de monitoramento ficar indisponível, o catálogo continua carregando normalmente.

## Publicação

Substitua os arquivos do repositório `CentralRadiosBrasil-Site` pelos arquivos deste pacote, preservando o arquivo `CNAME`.

Publique o Worker v1.5.0 antes deste site.
