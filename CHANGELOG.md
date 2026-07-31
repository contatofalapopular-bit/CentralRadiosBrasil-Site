Central Rádios Brasil — Commit 22.2.6
Rádio em Destaque completa

Base utilizada
- Versão 22.2.5 validada pelo usuário.

Arquivos alterados
- index.html
- app.js
- style.css

Implementações
- Leitura automática de status.destaque no banco oficial.
- Exibição automática de nome, categoria, slogan/descrição, cidade e UF.
- Logo da emissora com fallback seguro para as iniciais.
- Botão Ouvir agora integrado ao player existente.
- Botão Visitar site exibido somente quando houver endereço válido.
- Seção escondida quando nenhuma emissora publicada estiver em destaque.
- Critério seguro quando houver mais de uma emissora marcada: verificada, atualização mais recente e nome.
- Card da emissora selecionada recebe identificação visual.
- Layout aprimorado e responsivo para computador e celular.

Observação
- No banco 3.1.3 consultado durante o desenvolvimento, a emissora atual estava com destaque=false. A seção só aparece depois que o Painel Administrativo publicar uma emissora com status.destaque=true.
