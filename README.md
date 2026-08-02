# Central Rádios Brasil — Site v22.8.0

## Cadastro fácil e proteção contra duplicidade

- Estado selecionado em lista oficial.
- Cidades carregadas automaticamente pela API de Localidades do IBGE.
- O campo continua aceitando digitação manual se a API estiver indisponível.
- Categoria principal padronizada em lista para evitar variações e duplicidades.
- Site recebe `https://` automaticamente quando necessário.
- WhatsApp é formatado durante a digitação.
- O formulário salva um rascunho local no aparelho e permite limpá-lo.
- Nome, localização, domínio e stream são comparados com o catálogo e com solicitações ativas.
- Streams e emissoras já cadastrados são bloqueados antes do envio.
- A verificação é repetida pelo Worker no momento do cadastro.

## Publicação

1. Publique primeiro o **Worker v1.8.0**.
2. Depois substitua os arquivos do repositório `CentralRadiosBrasil-Site`.
3. Preserve o arquivo `CNAME`.
4. Após o GitHub Pages ficar verde, abra `/cadastro/` e pressione `Ctrl + F5`.

## Testes recomendados

- Escolher um estado e confirmar o carregamento das cidades.
- Digitar um domínio sem `https://` e sair do campo.
- Informar um stream já publicado e confirmar o bloqueio.
- Informar dados novos, testar o stream e confirmar a liberação do envio.


## PWA instalável — v22.8.0

- Manifesto de aplicativo web e ícones 192/512/maskable.
- Instalação no celular e computador sem loja de aplicativos.
- Abertura em modo standalone.
- Service worker com páginas essenciais e último catálogo em cache.
- Tela offline e aviso de conexão.
- Atualização automática sem interromper uma rádio que estiver tocando.
