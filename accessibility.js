"use strict";

(() => {
  const SELETOR_FOCAVEIS = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "audio[controls]",
    "video[controls]",
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']"
  ].join(",");

  const dialogo = {
    elemento: null,
    focoAnterior: null,
    aoFechar: null,
    elementosInertes: []
  };

  function visivel(elemento) {
    if (!(elemento instanceof HTMLElement)) return false;
    if (elemento.hidden || elemento.closest("[hidden], .hidden")) return false;
    const estilo = window.getComputedStyle(elemento);
    return estilo.display !== "none" && estilo.visibility !== "hidden";
  }

  function obterFocaveis(container) {
    return [...container.querySelectorAll(SELETOR_FOCAVEIS)]
      .filter(visivel)
      .filter(elemento => elemento.getAttribute("aria-hidden") !== "true");
  }

  function obterRegiaoAnuncio() {
    let regiao = document.getElementById("anuncio-acessibilidade");
    if (!regiao) {
      regiao = document.createElement("div");
      regiao.id = "anuncio-acessibilidade";
      regiao.className = "sr-only";
      regiao.setAttribute("role", "status");
      regiao.setAttribute("aria-live", "polite");
      regiao.setAttribute("aria-atomic", "true");
      document.body.appendChild(regiao);
    }
    return regiao;
  }

  function anunciar(texto, opcoes = {}) {
    const mensagem = String(texto || "").replace(/[❤️⭐🔥🆕📡🚗☀️🎙️▶⏸⏮⏭🔊✕🏆🥇🥈🥉]/gu, "").trim();
    if (!mensagem) return;

    const regiao = obterRegiaoAnuncio();
    regiao.setAttribute("aria-live", opcoes.assertivo ? "assertive" : "polite");
    regiao.textContent = "";
    window.setTimeout(() => {
      regiao.textContent = mensagem;
    }, 30);
  }

  function aplicarInertAoFundo(elementoDialogo) {
    dialogo.elementosInertes = [];

    [...document.body.children].forEach(elemento => {
      if (!(elemento instanceof HTMLElement)) return;
      if (elemento === elementoDialogo || elemento.contains(elementoDialogo)) return;
      if (["SCRIPT", "STYLE", "LINK"].includes(elemento.tagName)) return;
      if (elemento.id === "anuncio-acessibilidade") return;

      dialogo.elementosInertes.push({
        elemento,
        inert: elemento.inert,
        ariaHidden: elemento.getAttribute("aria-hidden")
      });

      elemento.inert = true;
      elemento.setAttribute("aria-hidden", "true");
    });
  }

  function restaurarFundo() {
    dialogo.elementosInertes.forEach(({ elemento, inert, ariaHidden }) => {
      elemento.inert = inert;
      if (ariaHidden === null) elemento.removeAttribute("aria-hidden");
      else elemento.setAttribute("aria-hidden", ariaHidden);
    });
    dialogo.elementosInertes = [];
  }

  function abrirDialogo(elemento, opcoes = {}) {
    if (!(elemento instanceof HTMLElement)) return;

    if (dialogo.elemento === elemento) {
      const focoAtual = opcoes.focoInicial instanceof HTMLElement
        ? opcoes.focoInicial
        : obterFocaveis(elemento)[0] || elemento;
      focoAtual.focus({ preventScroll: true });
      return;
    }

    if (dialogo.elemento && dialogo.elemento !== elemento) {
      fecharDialogo({ restaurarFoco: false });
    }

    dialogo.elemento = elemento;
    dialogo.focoAnterior = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    dialogo.aoFechar = typeof opcoes.aoFechar === "function"
      ? opcoes.aoFechar
      : null;

    elemento.hidden = false;
    elemento.classList.remove("hidden");
    elemento.setAttribute("aria-hidden", "false");
    document.body.classList.add("dialogo-aberto");

    window.requestAnimationFrame(() => {
      const focoInicial = opcoes.focoInicial instanceof HTMLElement
        ? opcoes.focoInicial
        : obterFocaveis(elemento)[0] || elemento;
      focoInicial.focus({ preventScroll: true });
      aplicarInertAoFundo(elemento);
      anunciar(opcoes.anuncio || "Janela aberta.");
    });
  }

  function fecharDialogo(opcoes = {}) {
    const elemento = dialogo.elemento;
    if (!(elemento instanceof HTMLElement)) return;

    const focoAnterior = dialogo.focoAnterior;
    const aoFechar = dialogo.aoFechar;

    elemento.classList.add("hidden");
    elemento.hidden = true;
    elemento.setAttribute("aria-hidden", "true");
    document.body.classList.remove("dialogo-aberto");
    restaurarFundo();

    dialogo.elemento = null;
    dialogo.focoAnterior = null;
    dialogo.aoFechar = null;

    if (typeof aoFechar === "function") aoFechar();

    if (opcoes.restaurarFoco !== false && focoAnterior?.isConnected) {
      window.requestAnimationFrame(() => focoAnterior.focus({ preventScroll: true }));
    }

    if (opcoes.anuncio) anunciar(opcoes.anuncio);
  }

  function dialogoEstaAberto(elemento) {
    return dialogo.elemento === elemento;
  }

  function tratarTecladoDialogo(evento) {
    if (!dialogo.elemento) return;

    if (evento.key === "Escape") {
      evento.preventDefault();
      fecharDialogo({ anuncio: "Janela fechada." });
      return;
    }

    if (evento.key !== "Tab") return;

    const focaveis = obterFocaveis(dialogo.elemento);
    if (!focaveis.length) {
      evento.preventDefault();
      dialogo.elemento.focus();
      return;
    }

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  function limparCamposInvalidos(formulario) {
    if (!(formulario instanceof HTMLFormElement)) return;
    formulario.querySelectorAll("[aria-invalid='true']").forEach(campo => {
      campo.removeAttribute("aria-invalid");
    });
  }

  function focarPrimeiroInvalido(formulario) {
    if (!(formulario instanceof HTMLFormElement)) return null;

    let primeiro = null;
    formulario.querySelectorAll("input, select, textarea").forEach(campo => {
      const invalido = !campo.checkValidity();
      if (invalido) {
        campo.setAttribute("aria-invalid", "true");
        if (!primeiro) primeiro = campo;
      } else {
        campo.removeAttribute("aria-invalid");
      }
    });

    if (primeiro instanceof HTMLElement) {
      primeiro.focus({ preventScroll: true });
      primeiro.scrollIntoView({ behavior: "smooth", block: "center" });
      anunciar("Há campos obrigatórios ou inválidos. Revise o primeiro campo destacado.", { assertivo: true });
    }

    return primeiro;
  }

  function prepararPagina() {
    obterRegiaoAnuncio();

    document.querySelectorAll("main[id]").forEach(main => {
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    });

    document.querySelectorAll(".skip-link").forEach(link => {
      link.addEventListener("click", () => {
        const alvo = document.querySelector(link.getAttribute("href"));
        if (alvo instanceof HTMLElement) {
          window.setTimeout(() => alvo.focus({ preventScroll: true }), 0);
        }
      });
    });

    document.querySelectorAll("form").forEach(formulario => {
      formulario.addEventListener("input", evento => {
        const campo = evento.target;
        if (campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement || campo instanceof HTMLTextAreaElement) {
          if (campo.checkValidity()) campo.removeAttribute("aria-invalid");
        }
      });

      formulario.addEventListener("invalid", evento => {
        const campo = evento.target;
        if (campo instanceof HTMLElement) campo.setAttribute("aria-invalid", "true");
      }, true);
    });
  }

  document.addEventListener("keydown", tratarTecladoDialogo, true);
  document.addEventListener("DOMContentLoaded", prepararPagina);

  window.CRBAcessibilidade = Object.freeze({
    anunciar,
    abrirDialogo,
    fecharDialogo,
    dialogoEstaAberto,
    focarPrimeiroInvalido,
    limparCamposInvalidos,
    obterFocaveis
  });
})();
