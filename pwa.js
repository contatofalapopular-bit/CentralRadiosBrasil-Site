"use strict";

(() => {
  const VERSAO_PWA = "22.14.2";
  const scriptAtual = document.currentScript;
  const raizApp = scriptAtual
    ? new URL("./", scriptAtual.src)
    : new URL("./", window.location.href);

  let eventoInstalacao = null;
  let recarregamentoSolicitado = false;
  const tinhaControlador = Boolean(navigator.serviceWorker?.controller);

  document.addEventListener("DOMContentLoaded", () => {
    prepararBotoesInstalacao();
    prepararEstadoConexao();
    registrarServiceWorker();
  });

  window.addEventListener("beforeinstallprompt", evento => {
    evento.preventDefault();
    eventoInstalacao = evento;
    exibirBotoesInstalacao();
  });

  window.addEventListener("appinstalled", () => {
    eventoInstalacao = null;
    ocultarBotoesInstalacao();
    mostrarAviso({
      titulo: "Aplicativo instalado",
      mensagem: "A Central Rádios Brasil já está disponível na tela inicial.",
      tipo: "success",
      duracao: 6000
    });
  });

  function prepararBotoesInstalacao() {
    const instalado = estaEmModoAplicativo();
    const ios = dispositivoIOS();

    document.querySelectorAll(".pwa-install-button").forEach(botao => {
      botao.addEventListener("click", solicitarInstalacao);

      if (instalado) {
        botao.hidden = true;
      } else if (ios) {
        botao.hidden = false;
      }
    });
  }

  function exibirBotoesInstalacao() {
    if (estaEmModoAplicativo()) return;
    document.querySelectorAll(".pwa-install-button").forEach(botao => {
      botao.hidden = false;
    });
  }

  function ocultarBotoesInstalacao() {
    document.querySelectorAll(".pwa-install-button").forEach(botao => {
      botao.hidden = true;
    });
  }

  async function solicitarInstalacao() {
    if (estaEmModoAplicativo()) {
      ocultarBotoesInstalacao();
      return;
    }

    if (eventoInstalacao) {
      const evento = eventoInstalacao;
      eventoInstalacao = null;
      await evento.prompt();
      const escolha = await evento.userChoice;

      if (escolha.outcome !== "accepted") {
        mostrarAviso({
          titulo: "Instalação cancelada",
          mensagem: "O portal continua disponível normalmente no navegador.",
          duracao: 4500
        });
      }
      return;
    }

    if (dispositivoIOS()) {
      mostrarInstrucoesIOS();
      return;
    }

    mostrarAviso({
      titulo: "Instalação pelo navegador",
      mensagem: "Abra o menu do navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.",
      duracao: 7000
    });
  }

  function estaEmModoAplicativo() {
    return window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
  }

  function dispositivoIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  function mostrarInstrucoesIOS() {
    let fundo = document.getElementById("pwa-dialogo-ios");

    if (!fundo) {
      fundo = document.createElement("div");
      fundo.id = "pwa-dialogo-ios";
      fundo.className = "pwa-dialogo-fundo";
      fundo.innerHTML = `
        <section class="pwa-dialogo" role="dialog" aria-modal="true" aria-labelledby="pwa-dialogo-titulo">
          <h2 id="pwa-dialogo-titulo">Instalar no iPhone ou iPad</h2>
          <p>Use o Safari e siga estes passos:</p>
          <ol>
            <li>Toque no botão <strong>Compartilhar</strong>.</li>
            <li>Escolha <strong>Adicionar à Tela de Início</strong>.</li>
            <li>Confirme em <strong>Adicionar</strong>.</li>
          </ol>
          <div class="pwa-dialogo-acoes">
            <button type="button">Entendi</button>
          </div>
        </section>`;
      document.body.appendChild(fundo);
      fundo.querySelector("button").addEventListener("click", () => {
        window.CRBAcessibilidade?.fecharDialogo({ anuncio: "Instruções de instalação fechadas." });
      });
      fundo.addEventListener("click", evento => {
        if (evento.target === fundo) {
          window.CRBAcessibilidade?.fecharDialogo({ anuncio: "Instruções de instalação fechadas." });
        }
      });
    }

    fundo.hidden = false;
    const botao = fundo.querySelector("button");
    window.CRBAcessibilidade?.abrirDialogo(fundo, {
      focoInicial: botao,
      anuncio: "Instruções para instalar no iPhone ou iPad abertas."
    });
  }

  function prepararEstadoConexao() {
    if (!navigator.onLine) mostrarAvisoOffline();

    window.addEventListener("offline", mostrarAvisoOffline);
    window.addEventListener("online", () => {
      removerAvisosPersistentes("offline");
      mostrarAviso({
        titulo: "Conexão restabelecida",
        mensagem: "O catálogo e as transmissões podem ser atualizados novamente.",
        tipo: "success",
        duracao: 5000
      });
    });
  }

  function mostrarAvisoOffline() {
    mostrarAviso({
      chave: "offline",
      titulo: "Você está sem internet",
      mensagem: "As páginas e o último catálogo salvo continuam disponíveis. O áudio ao vivo precisa de conexão.",
      tipo: "offline",
      persistente: true
    });
  }

  async function registrarServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registro = await navigator.serviceWorker.register(
        new URL("service-worker.js", raizApp),
        {
          scope: raizApp.pathname,
          updateViaCache: "none"
        }
      );

      observarAtualizacao(registro);

      // Confere uma versão nova sempre que o portal é aberto.
      void registro.update();

      window.setInterval(() => {
        void registro.update();
      }, 60 * 60 * 1000);

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!tinhaControlador || recarregamentoSolicitado) return;
        recarregamentoSolicitado = true;

        const audio = document.querySelector("audio");
        const tocando = Boolean(audio && !audio.paused && !audio.ended);

        if (!tocando) {
          window.location.reload();
          return;
        }

        mostrarAviso({
          chave: "atualizacao",
          titulo: "Nova versão pronta",
          mensagem: "A atualização será aplicada ao recarregar. A rádio atual não será interrompida automaticamente.",
          acaoTexto: "Atualizar agora",
          aoAcionar: () => window.location.reload(),
          persistente: true
        });
      });
    } catch (erro) {
      console.warn("Não foi possível ativar os recursos PWA.", erro);
    }
  }

  function observarAtualizacao(registro) {
    registro.addEventListener("updatefound", () => {
      const instalando = registro.installing;
      if (!instalando) return;

      instalando.addEventListener("statechange", () => {
        if (instalando.state === "installed" && navigator.serviceWorker.controller) {
          console.info(`Central Rádios Brasil PWA ${VERSAO_PWA}: atualização instalada.`);
        }
      });
    });
  }

  function obterAreaAvisos() {
    let area = document.querySelector(".pwa-toast-area");
    if (!area) {
      area = document.createElement("div");
      area.className = "pwa-toast-area";
      area.setAttribute("role", "status");
      area.setAttribute("aria-live", "polite");
      area.setAttribute("aria-atomic", "false");
      document.body.appendChild(area);
    }
    return area;
  }

  function mostrarAviso({
    chave = "",
    titulo,
    mensagem,
    tipo = "",
    acaoTexto = "",
    aoAcionar = null,
    persistente = false,
    duracao = 5000
  }) {
    const area = obterAreaAvisos();
    let aviso = chave ? area.querySelector(`[data-chave="${chave}"]`) : null;

    if (!aviso) {
      aviso = document.createElement("div");
      aviso.className = `pwa-toast${tipo ? ` pwa-toast--${tipo}` : ""}`;
      if (chave) aviso.dataset.chave = chave;
      area.appendChild(aviso);
    }

    aviso.innerHTML = `
      <div>
        <strong>${escaparHtml(titulo)}</strong>
        <p>${escaparHtml(mensagem)}</p>
      </div>
      ${acaoTexto ? `<button type="button">${escaparHtml(acaoTexto)}</button>` : ""}`;

    const botao = aviso.querySelector("button");
    if (botao && typeof aoAcionar === "function") {
      botao.addEventListener("click", aoAcionar, { once: true });
    }

    if (!persistente) {
      window.setTimeout(() => aviso.remove(), duracao);
    }
  }

  function removerAvisosPersistentes(chave) {
    document.querySelectorAll(`.pwa-toast[data-chave="${chave}"]`).forEach(item => item.remove());
  }

  function escaparHtml(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
