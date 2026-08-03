"use strict";

const URL_API_STREAMING =
  "https://broken-bar-45e2.contatofalapopular.workers.dev";

const formulario = document.getElementById("form-interesse-streaming");
const mensagem = document.getElementById("mensagem-interesse");
const botaoEnviar = document.getElementById("btn-enviar-interesse");
const painelSucesso = document.getElementById("interesse-sucesso");
const protocoloElemento = document.getElementById("interesse-protocolo");
const mensagemSucesso = document.getElementById("interesse-sucesso-mensagem");
const botaoNovo = document.getElementById("btn-novo-interesse");

function definirMensagem(texto, tipo = "") {
  if (!mensagem) return;
  mensagem.textContent = texto || "";
  mensagem.className = `streaming-mensagem${tipo ? ` ${tipo}` : ""}`;
}

function anunciar(texto) {
  const area = document.getElementById("anuncio-acessibilidade");
  if (!area) return;
  area.textContent = "";
  window.setTimeout(() => { area.textContent = texto; }, 40);
}

function campoPrimeiroInvalido() {
  return formulario?.querySelector(":invalid") || null;
}

function limparErros() {
  formulario?.querySelectorAll("[aria-invalid='true']").forEach(campo => {
    campo.removeAttribute("aria-invalid");
  });
}

function obterDados() {
  const dadosFormulario = new FormData(formulario);
  const recursos = dadosFormulario.getAll("recursos").map(String);

  return {
    nome: String(dadosFormulario.get("nome") || ""),
    email: String(dadosFormulario.get("email") || ""),
    whatsapp: String(dadosFormulario.get("whatsapp") || ""),
    cidade: String(dadosFormulario.get("cidade") || ""),
    estado: String(dadosFormulario.get("estado") || ""),
    situacaoProjeto: String(dadosFormulario.get("situacaoProjeto") || ""),
    previsaoInicio: String(dadosFormulario.get("previsaoInicio") || ""),
    nomeProjeto: String(dadosFormulario.get("nomeProjeto") || ""),
    recursos,
    mensagem: String(dadosFormulario.get("mensagem") || ""),
    consentimento: dadosFormulario.get("consentimento") === "1",
    enderecoAlternativo: String(dadosFormulario.get("enderecoAlternativo") || ""),
    origem: "portal-streaming-crb"
  };
}

async function enviarInteresse(evento) {
  evento.preventDefault();
  limparErros();
  definirMensagem("");

  if (!formulario.checkValidity()) {
    const invalido = campoPrimeiroInvalido();
    invalido?.setAttribute("aria-invalid", "true");
    formulario.reportValidity();
    invalido?.focus();
    definirMensagem("Confira os campos obrigatórios antes de enviar.", "erro");
    anunciar("O formulário possui campos obrigatórios não preenchidos.");
    return;
  }

  botaoEnviar.disabled = true;
  botaoEnviar.setAttribute("aria-busy", "true");
  botaoEnviar.textContent = "Enviando pré-cadastro...";
  definirMensagem("Registrando seu interesse. Aguarde.");

  try {
    const resposta = await fetch(
      `${URL_API_STREAMING}/api/streaming/interesses`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obterDados())
      }
    );

    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok || !resultado.ok) {
      throw new Error(resultado.erro || "Não foi possível enviar o pré-cadastro.");
    }

    protocoloElemento.textContent = resultado.protocolo || "Protocolo registrado";
    mensagemSucesso.textContent = resultado.mensagem ||
      "Entraremos em contato quando tivermos novidades sobre o Streaming CRB.";

    formulario.hidden = true;
    painelSucesso.hidden = false;
    painelSucesso.focus();
    anunciar("Pré-cadastro recebido com sucesso.");
  } catch (erro) {
    console.error("Falha ao registrar interesse no Streaming CRB:", erro);
    definirMensagem(
      erro instanceof Error ? erro.message : "Falha inesperada ao enviar.",
      "erro"
    );
    anunciar("Não foi possível enviar o pré-cadastro.");
  } finally {
    botaoEnviar.disabled = false;
    botaoEnviar.removeAttribute("aria-busy");
    botaoEnviar.textContent = "Entrar na lista de interessados";
  }
}

function novoInteresse() {
  formulario.reset();
  limparErros();
  definirMensagem("");
  painelSucesso.hidden = true;
  formulario.hidden = false;
  document.getElementById("interesse-nome")?.focus();
}

formulario?.addEventListener("submit", enviarInteresse);
botaoNovo?.addEventListener("click", novoInteresse);
