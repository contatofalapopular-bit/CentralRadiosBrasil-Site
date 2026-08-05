"use strict";

const URL_RADIOS_OCORRENCIAS = "https://raw.githubusercontent.com/contatofalapopular-bit/CentralRadiosBrasil-Dados/main/radios.json";
const URL_API_OCORRENCIAS = "https://broken-bar-45e2.contatofalapopular.workers.dev";

const estadoOcorrencias = { radios: [] };

const elementosOcorrencias = {
  form: document.getElementById("ocorrencias-form"),
  formularioArea: document.getElementById("formulario-area"),
  sucesso: document.getElementById("ocorrencias-sucesso"),
  protocolo: document.getElementById("protocolo-ocorrencia"),
  tipo: document.getElementById("tipo-ocorrencia"),
  radio: document.getElementById("emissora-id"),
  mensagem: document.getElementById("mensagem-ocorrencia"),
  contador: document.getElementById("contador-mensagem"),
  feedback: document.getElementById("ocorrencias-feedback"),
  botao: document.getElementById("enviar-ocorrencia"),
  nova: document.getElementById("nova-ocorrencia")
};

document.addEventListener("DOMContentLoaded", async () => {
  aplicarParametrosUrl();
  conectarEventosOcorrencias();
  await carregarEmissorasOcorrencias();
});

function conectarEventosOcorrencias() {
  elementosOcorrencias.form?.addEventListener("submit", enviarOcorrencia);
  elementosOcorrencias.mensagem?.addEventListener("input", atualizarContadorMensagem);
  elementosOcorrencias.tipo?.addEventListener("change", atualizarObrigatoriedadeEmissora);
  elementosOcorrencias.nova?.addEventListener("click", reiniciarFormularioOcorrencia);
}

function aplicarParametrosUrl() {
  const parametros = new URLSearchParams(location.search);
  const tipo = parametros.get("tipo") || "";
  if ([...elementosOcorrencias.tipo.options].some(opcao => opcao.value === tipo)) {
    elementosOcorrencias.tipo.value = tipo;
  }
  atualizarObrigatoriedadeEmissora();
}

async function carregarEmissorasOcorrencias() {
  try {
    const resposta = await fetch(URL_RADIOS_OCORRENCIAS, { cache: "no-store" });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const banco = await resposta.json();
    estadoOcorrencias.radios = (Array.isArray(banco.radios) ? banco.radios : [])
      .filter(radio => radio?.status?.publica !== false)
      .sort((a, b) => nomeRadio(a).localeCompare(nomeRadio(b), "pt-BR"));

    elementosOcorrencias.radio.innerHTML = '<option value="">Selecione uma emissora</option>' +
      estadoOcorrencias.radios.map(radio => {
        const local = [radio.localizacao?.cidade, radio.localizacao?.uf].filter(Boolean).join(" — ");
        return `<option value="${escaparAtributo(radio.id)}">${escaparHtml(nomeRadio(radio))}${local ? ` — ${escaparHtml(local)}` : ""}</option>`;
      }).join("");

    const radioParametro = new URLSearchParams(location.search).get("radio") || "";
    if (estadoOcorrencias.radios.some(radio => String(radio.id) === radioParametro)) {
      elementosOcorrencias.radio.value = radioParametro;
    }
  } catch (erro) {
    elementosOcorrencias.radio.innerHTML = '<option value="">Catálogo indisponível — informe a rádio na mensagem</option>';
    console.warn("Não foi possível carregar as emissoras:", erro);
  }
}

function atualizarObrigatoriedadeEmissora() {
  const obrigatoria = ["radio_fora_do_ar", "dados_incorretos", "conteudo_inadequado"].includes(elementosOcorrencias.tipo?.value);
  if (elementosOcorrencias.radio) {
    elementosOcorrencias.radio.required = obrigatoria;
    elementosOcorrencias.radio.setAttribute("aria-required", String(obrigatoria));
  }
}

function atualizarContadorMensagem() {
  if (elementosOcorrencias.contador) {
    elementosOcorrencias.contador.textContent = `${elementosOcorrencias.mensagem.value.length} de 1500 caracteres`;
  }
}

async function enviarOcorrencia(evento) {
  evento.preventDefault();
  ocultarFeedback();
  atualizarObrigatoriedadeEmissora();

  if (!elementosOcorrencias.form.reportValidity()) return;

  const radio = estadoOcorrencias.radios.find(item => String(item.id) === elementosOcorrencias.radio.value) || null;
  const dados = {
    tipo: elementosOcorrencias.tipo.value,
    radioId: radio?.id || "",
    radioNome: radio ? nomeRadio(radio) : "",
    radioCidade: radio?.localizacao?.cidade || "",
    radioEstado: radio?.localizacao?.uf || "",
    nome: document.getElementById("nome-contato").value.trim(),
    email: document.getElementById("email-contato").value.trim(),
    mensagem: elementosOcorrencias.mensagem.value.trim(),
    paginaUrl: document.referrer || location.href,
    consentimento: document.getElementById("consentimento-ocorrencia").checked,
    enderecoAlternativo: document.getElementById("endereco-alternativo").value
  };

  definirCarregando(true);
  try {
    const resposta = await fetch(`${URL_API_OCORRENCIAS}/api/ocorrencias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const resultado = await resposta.json().catch(() => ({}));
    if (!resposta.ok || resultado.ok === false) {
      throw new Error(resultado.erro || `Não foi possível enviar (HTTP ${resposta.status}).`);
    }
    elementosOcorrencias.protocolo.textContent = resultado.protocolo || "Protocolo indisponível";
    elementosOcorrencias.formularioArea.classList.add("hidden");
    elementosOcorrencias.sucesso.classList.remove("hidden");
    elementosOcorrencias.sucesso.focus();
  } catch (erro) {
    mostrarFeedback(erro.message || "Não foi possível enviar a ocorrência.");
  } finally {
    definirCarregando(false);
  }
}

function reiniciarFormularioOcorrencia() {
  elementosOcorrencias.form.reset();
  aplicarParametrosUrl();
  const radioParametro = new URLSearchParams(location.search).get("radio") || "";
  if (estadoOcorrencias.radios.some(radio => String(radio.id) === radioParametro)) {
    elementosOcorrencias.radio.value = radioParametro;
  }
  atualizarContadorMensagem();
  elementosOcorrencias.sucesso.classList.add("hidden");
  elementosOcorrencias.formularioArea.classList.remove("hidden");
  elementosOcorrencias.tipo.focus();
}

function definirCarregando(carregando) {
  elementosOcorrencias.botao.disabled = carregando;
  elementosOcorrencias.botao.textContent = carregando ? "Enviando…" : "Enviar ocorrência";
}

function mostrarFeedback(mensagem) {
  elementosOcorrencias.feedback.textContent = mensagem;
  elementosOcorrencias.feedback.classList.remove("hidden");
  elementosOcorrencias.feedback.focus?.();
}

function ocultarFeedback() {
  elementosOcorrencias.feedback.textContent = "";
  elementosOcorrencias.feedback.classList.add("hidden");
}

function nomeRadio(radio) {
  return String(radio?.nomeFantasia || radio?.nome || "Emissora");
}

function escaparHtml(valor) {
  return String(valor || "").replace(/[&<>'"]/g, caractere => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[caractere]);
}

function escaparAtributo(valor) {
  return escaparHtml(valor);
}
