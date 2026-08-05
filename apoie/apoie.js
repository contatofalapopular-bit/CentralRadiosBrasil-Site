"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("btn-copiar-pix");
  const chave = document.getElementById("chave-pix");
  const status = document.getElementById("apoie-status");
  if (!botao || !chave || !status) return;

  botao.addEventListener("click", async () => {
    const texto = chave.textContent.trim();
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
      } else {
        const campo = document.createElement("textarea");
        campo.value = texto;
        campo.setAttribute("readonly", "");
        campo.style.position = "fixed";
        campo.style.opacity = "0";
        document.body.appendChild(campo);
        campo.select();
        const copiado = document.execCommand("copy");
        campo.remove();
        if (!copiado) throw new Error("Cópia não suportada");
      }
      status.textContent = "Chave Pix copiada.";
      botao.innerHTML = '<span aria-hidden="true">✓</span> Chave copiada';
      window.setTimeout(() => {
        botao.innerHTML = '<span aria-hidden="true">⧉</span> Copiar chave Pix';
        status.textContent = "";
      }, 3500);
    } catch {
      status.textContent = "Não foi possível copiar automaticamente. Selecione a chave acima e copie manualmente.";
    }
  });
});
