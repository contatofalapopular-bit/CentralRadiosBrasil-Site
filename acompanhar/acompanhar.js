"use strict";

const URL_API_ACOMPANHAMENTO =
  "https://broken-bar-45e2.contatofalapopular.workers.dev";

const LIMITE_LOGO_BYTES = 2 * 1024 * 1024;
const RESOLUCAO_MINIMA_LOGO = 512;
const RESOLUCAO_MAXIMA_LOGO = 4096;

const formularioConsulta = document.getElementById("form-acompanhar");
const campoProtocolo = document.getElementById("protocolo");
const campoEmail = document.getElementById("email-acompanhamento");
const botaoConsultar = document.getElementById("btn-consultar");
const alertaConsulta = document.getElementById("alerta-consulta");
const resultadoCadastro = document.getElementById("resultado-cadastro");
const botaoNovaConsulta = document.getElementById("btn-nova-consulta");

const resultadoNomeRadio = document.getElementById("resultado-nome-radio");
const resultadoProtocolo = document.getElementById("resultado-protocolo");
const resultadoStatus = document.getElementById("resultado-status");
const resultadoLocalizacao = document.getElementById("resultado-localizacao");
const resultadoCategoria = document.getElementById("resultado-categoria");
const resultadoPlano = document.getElementById("resultado-plano");
const resultadoAtualizacao = document.getElementById("resultado-atualizacao");
const resultadoObservacao = document.getElementById("resultado-observacao");

const formularioLogo = document.getElementById("form-enviar-logo");
const campoLogo = document.getElementById("logo-acompanhamento");
const previewLogo = document.getElementById("acompanhar-logo-preview");
const mensagemLogo = document.getElementById("mensagem-logo-acompanhamento");
const alertaLogo = document.getElementById("alerta-logo");
const botaoEnviarLogo = document.getElementById("btn-enviar-logo");
const textoSelecionarLogo = document.getElementById("texto-selecionar-logo");
const textoSituacaoLogo = document.getElementById("texto-situacao-logo");
const logoConfirmada = document.getElementById("logo-confirmada");
const logoDimensoes = document.getElementById("logo-dimensoes");
const mensagemCadastroAprovado = document.getElementById("mensagem-cadastro-aprovado");

let credenciaisAtuais = null;
let solicitacaoAtual = null;
let logoValidada = null;
let urlPreviewAtual = "";

formularioConsulta.addEventListener("submit", consultarCadastro);
formularioLogo.addEventListener("submit", enviarLogomarca);
campoLogo.addEventListener("change", validarLogoSelecionada);
botaoNovaConsulta.addEventListener("click", iniciarNovaConsulta);

preencherProtocoloDaUrl();

async function consultarCadastro(evento) {
  evento.preventDefault();
  ocultarAlerta(alertaConsulta);

  if (!formularioConsulta.checkValidity()) {
    formularioConsulta.reportValidity();
    return;
  }

  const protocolo = campoProtocolo.value.trim().toUpperCase();
  const email = campoEmail.value.trim().toLowerCase();

  botaoConsultar.disabled = true;
  botaoConsultar.textContent = "Consultando...";

  try {
    const resposta = await fetch(
      `${URL_API_ACOMPANHAMENTO}/api/solicitacoes/acompanhar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ protocolo, email })
      }
    );

    const resultado = await lerRespostaJson(resposta);

    if (!resposta.ok || !resultado?.ok) {
      throw new Error(
        resultado?.erro ||
        `Não foi possível consultar o cadastro (HTTP ${resposta.status}).`
      );
    }

    credenciaisAtuais = { protocolo, email };
    solicitacaoAtual = resultado.solicitacao;
    renderizarSolicitacao(solicitacaoAtual);

    formularioConsulta.classList.add("hidden");
    resultadoCadastro.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (erro) {
    console.error("Falha ao consultar cadastro:", erro);
    mostrarAlerta(
      alertaConsulta,
      erro instanceof Error
        ? erro.message
        : "Não foi possível consultar o cadastro agora."
    );
  } finally {
    botaoConsultar.disabled = false;
    botaoConsultar.textContent = "Consultar cadastro";
  }
}

function renderizarSolicitacao(solicitacao) {
  resultadoNomeRadio.textContent = solicitacao.nome_radio || "Emissora";
  resultadoProtocolo.textContent = solicitacao.protocolo || "";
  resultadoLocalizacao.textContent =
    `${solicitacao.cidade || "—"}/${solicitacao.estado || "—"}`;
  resultadoCategoria.textContent = solicitacao.categoria_principal || "—";
  resultadoPlano.textContent = formatarPlano(solicitacao.plano_solicitado);
  resultadoAtualizacao.textContent = formatarData(solicitacao.atualizado_em);

  const rotuloStatus = formatarStatus(solicitacao.status);
  resultadoStatus.textContent = rotuloStatus;
  resultadoStatus.className =
    `acompanhar-status ${solicitacao.status || "pendente"}`;

  if (solicitacao.observacao) {
    resultadoObservacao.textContent = solicitacao.observacao;
    resultadoObservacao.classList.remove("hidden");
  } else {
    resultadoObservacao.textContent = "";
    resultadoObservacao.classList.add("hidden");
  }

  renderizarLogoExistente(solicitacao);

  const aprovada = solicitacao.status === "aprovada";
  formularioLogo.classList.toggle("hidden", aprovada);
  mensagemCadastroAprovado.classList.toggle("hidden", !aprovada);

  if (!aprovada) {
    textoSelecionarLogo.textContent = solicitacao.logo_recebida
      ? "Selecionar nova logomarca"
      : "Selecionar logomarca";

    textoSituacaoLogo.textContent = solicitacao.logo_recebida
      ? "A logomarca já foi recebida. Você pode substituí-la antes da aprovação."
      : "A logomarca está pendente e precisa ser enviada para que o cadastro possa ser aprovado.";
  } else {
    textoSituacaoLogo.textContent =
      "A logomarca foi recebida e o cadastro está aprovado.";
  }

  limparSelecaoLogo();
}

function renderizarLogoExistente(solicitacao) {
  if (solicitacao.logo_recebida && solicitacao.logo_url) {
    const imagem = document.createElement("img");
    imagem.src = `${solicitacao.logo_url}?v=${encodeURIComponent(solicitacao.atualizado_em || "")}`;
    imagem.alt = `Logomarca de ${solicitacao.nome_radio || "emissora"}`;
    previewLogo.replaceChildren(imagem);

    logoConfirmada.classList.remove("hidden");
    logoDimensoes.textContent =
      solicitacao.logo_largura && solicitacao.logo_altura
        ? `${solicitacao.logo_largura} × ${solicitacao.logo_altura} pixels`
        : "Arquivo armazenado com sucesso.";
  } else {
    previewLogo.innerHTML =
      "<span>📻</span><small>Logomarca pendente</small>";
    logoConfirmada.classList.add("hidden");
    logoDimensoes.textContent = "";
  }
}

async function validarLogoSelecionada() {
  limparPreviewTemporaria();
  ocultarAlerta(alertaLogo);

  const arquivo = campoLogo.files?.[0];

  if (!arquivo) {
    limparSelecaoLogo();
    return;
  }

  const tiposPermitidos = [
    "image/png",
    "image/jpeg",
    "image/webp"
  ];

  if (!tiposPermitidos.includes(arquivo.type)) {
    rejeitarLogo("Formato inválido. Use PNG, JPG, JPEG ou WebP.");
    return;
  }

  if (arquivo.size > LIMITE_LOGO_BYTES) {
    rejeitarLogo("O arquivo ultrapassa o limite de 2 MB.");
    return;
  }

  try {
    const dimensoes = await obterDimensoesImagem(arquivo);

    if (dimensoes.largura !== dimensoes.altura) {
      rejeitarLogo("A imagem precisa ser quadrada, com proporção 1:1.");
      return;
    }

    if (
      dimensoes.largura < RESOLUCAO_MINIMA_LOGO ||
      dimensoes.altura < RESOLUCAO_MINIMA_LOGO
    ) {
      rejeitarLogo("A resolução mínima aceita é 512 × 512 pixels.");
      return;
    }

    if (
      dimensoes.largura > RESOLUCAO_MAXIMA_LOGO ||
      dimensoes.altura > RESOLUCAO_MAXIMA_LOGO
    ) {
      rejeitarLogo("A resolução máxima aceita é 4096 × 4096 pixels.");
      return;
    }

    logoValidada = { arquivo, ...dimensoes };
    urlPreviewAtual = URL.createObjectURL(arquivo);

    const imagem = document.createElement("img");
    imagem.src = urlPreviewAtual;
    imagem.alt = "Prévia da nova logomarca";
    previewLogo.replaceChildren(imagem);

    mensagemLogo.textContent =
      `${arquivo.name} • ${dimensoes.largura} × ${dimensoes.altura} px • ${formatarBytes(arquivo.size)}`;
    mensagemLogo.className = "cadastro-mensagem-campo sucesso";
    botaoEnviarLogo.disabled = false;
  } catch (erro) {
    console.error("Falha ao analisar logomarca:", erro);
    rejeitarLogo("Não foi possível ler a imagem selecionada.");
  }
}

async function enviarLogomarca(evento) {
  evento.preventDefault();
  ocultarAlerta(alertaLogo);

  if (!credenciaisAtuais || !logoValidada) {
    mostrarAlerta(alertaLogo, "Selecione uma logomarca válida.");
    return;
  }

  const dados = new FormData();
  dados.append("protocolo", credenciaisAtuais.protocolo);
  dados.append("email", credenciaisAtuais.email);
  dados.append("logo", logoValidada.arquivo);

  botaoEnviarLogo.disabled = true;
  botaoEnviarLogo.textContent = "Enviando...";

  try {
    const resposta = await fetch(
      `${URL_API_ACOMPANHAMENTO}/api/solicitacoes/logomarca`,
      {
        method: "POST",
        body: dados
      }
    );

    const resultado = await lerRespostaJson(resposta);

    if (!resposta.ok || !resultado?.ok) {
      throw new Error(
        resultado?.erro ||
        `Não foi possível enviar a logomarca (HTTP ${resposta.status}).`
      );
    }

    solicitacaoAtual = resultado.solicitacao;
    renderizarSolicitacao(solicitacaoAtual);

    mostrarAlerta(
      alertaLogo,
      "Logomarca recebida. O cadastro voltou para a fila de análise.",
      "sucesso"
    );
  } catch (erro) {
    console.error("Falha ao enviar logomarca:", erro);
    mostrarAlerta(
      alertaLogo,
      erro instanceof Error
        ? erro.message
        : "Não foi possível enviar a logomarca agora."
    );
  } finally {
    botaoEnviarLogo.textContent = "Enviar logomarca";
    botaoEnviarLogo.disabled = !logoValidada;
  }
}

function iniciarNovaConsulta() {
  credenciaisAtuais = null;
  solicitacaoAtual = null;
  limparSelecaoLogo();
  resultadoCadastro.classList.add("hidden");
  formularioConsulta.classList.remove("hidden");
  campoProtocolo.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function preencherProtocoloDaUrl() {
  const parametros = new URLSearchParams(window.location.search);
  const protocolo = parametros.get("protocolo");

  if (protocolo) {
    campoProtocolo.value = protocolo.toUpperCase().slice(0, 40);
  }
}

function rejeitarLogo(mensagem) {
  campoLogo.value = "";
  logoValidada = null;
  botaoEnviarLogo.disabled = true;
  mensagemLogo.textContent = mensagem;
  mensagemLogo.className = "cadastro-mensagem-campo erro";
  renderizarLogoExistente(solicitacaoAtual || {});
}

function limparSelecaoLogo() {
  campoLogo.value = "";
  logoValidada = null;
  botaoEnviarLogo.disabled = true;
  mensagemLogo.textContent = "Nenhum novo arquivo selecionado.";
  mensagemLogo.className = "cadastro-mensagem-campo";
  limparPreviewTemporaria();
}

function limparPreviewTemporaria() {
  if (urlPreviewAtual) {
    URL.revokeObjectURL(urlPreviewAtual);
    urlPreviewAtual = "";
  }
}

function obterDimensoesImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const imagem = new Image();

    imagem.onload = () => {
      const dimensoes = {
        largura: imagem.naturalWidth,
        altura: imagem.naturalHeight
      };
      URL.revokeObjectURL(url);
      resolve(dimensoes);
    };

    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Imagem inválida."));
    };

    imagem.src = url;
  });
}

async function lerRespostaJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

function mostrarAlerta(elemento, mensagem, tipo = "erro") {
  elemento.textContent = mensagem;
  elemento.classList.remove("hidden");
  elemento.classList.toggle("acompanhar-alerta-sucesso", tipo === "sucesso");
}

function ocultarAlerta(elemento) {
  elemento.classList.add("hidden");
  elemento.classList.remove("acompanhar-alerta-sucesso");
  elemento.textContent = "";
}

function formatarStatus(status) {
  return {
    pendente: "Pendente",
    em_analise: "Em análise",
    aprovada: "Aprovada",
    rejeitada: "Rejeitada"
  }[status] || "Pendente";
}

function formatarPlano(plano) {
  return {
    gratuito: "Gratuito",
    parceira_verificada: "Parceira verificada",
    premium: "Premium"
  }[plano] || plano || "Gratuito";
}

function formatarData(valor) {
  if (!valor) return "—";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(data);
}

function formatarBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
