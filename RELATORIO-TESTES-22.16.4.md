# Relatório de testes — Site v22.16.4

## Resultado

**Aprovado.**

### Verificações de código
- app_js_unchanged: **OK**
- audio_autoplay_present: **OK**
- version_index_22_16_4: **OK**
- version_sw_22_16_4: **OK**
- mobile_support_hidden_with_player: **OK**
- specific_close_mobile_rule: **OK**

### Testes responsivos em Chromium
- 360x800 — expanded: botões sem sobreposição, sem rolagem horizontal; Apoie = `none`.
- 360x800 — collapsed: botões sem sobreposição, sem rolagem horizontal; Apoie = `none`.
- 390x844 — expanded: botões sem sobreposição, sem rolagem horizontal; Apoie = `none`.
- 390x844 — collapsed: botões sem sobreposição, sem rolagem horizontal; Apoie = `none`.
- 412x915 — expanded: botões sem sobreposição, sem rolagem horizontal; Apoie = `none`.
- 412x915 — collapsed: botões sem sobreposição, sem rolagem horizontal; Apoie = `none`.
- 768x1024 — expanded: botões sem sobreposição, sem rolagem horizontal; Apoie = `flex`.
- 768x1024 — collapsed: botões sem sobreposição, sem rolagem horizontal; Apoie = `flex`.
- 1366x768 — expanded: botões sem sobreposição, sem rolagem horizontal; Apoie = `flex`.
- 1366x768 — collapsed: botões sem sobreposição, sem rolagem horizontal; Apoie = `flex`.

### Escopo preservado

- `app.js` idêntico ao da v22.16.3.
- Elemento `<audio autoplay>` preservado.
- Worker, D1, Admin e Portal do Cliente não foram alterados.
- Player, ranking, ZAP, Modo Carro, favoritos e catálogo preservados.
