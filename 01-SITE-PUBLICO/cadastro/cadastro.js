"use strict";

const URL_API_CADASTRO =
  "https://broken-bar-45e2.contatofalapopular.workers.dev";

const LIMITE_LOGO_BYTES = 2 * 1024 * 1024;
const RESOLUCAO_MINIMA_LOGO = 512;
const RESOLUCAO_MAXIMA_LOGO = 4096;
const TEMPO_MAXIMO_TESTE_STREAM_MS = 15000;
const TEMPO_MAXIMO_REPRODUCAO_STREAM_MS = 20000;
const TEMPO_CONFIRMACAO_REPRODUCAO_MS = 3500;
const CHAVE_RASCUNHO_CADASTRO = "crb-cadastro-rascunho-v1";
const TEMPO_ESPERA_DUPLICIDADE_MS = 650;
const TEMPO_MAXIMO_ENVIO_CADASTRO_MS = 35000;

const CODIGOS_IBGE_UF = {
  AC: 12, AL: 27, AP: 16, AM: 13, BA: 29,
  CE: 23, DF: 53, ES: 32, GO: 52, MA: 21,
  MT: 51, MS: 50, MG: 31, PA: 15, PB: 25,
  PR: 41, PE: 26, PI: 22, RJ: 33, RN: 24,
  RS: 43, RO: 11, RR: 14, SC: 42, SP: 35,
  SE: 28, TO: 17
};

const formulario = document.getElementById(
  "form-cadastro-emissora"
);

const campoNomeRadio = document.getElementById("nome-radio");
const campoCidade = document.getElementById("cidade");
const listaMunicipios = document.getElementById("municipios-sugeridos");
const mensagemCidade = document.getElementById("mensagem-cidade");
const campoEstado = document.getElementById("estado");
const campoCategoria = document.getElementById("categoria-principal");
const campoSite = document.getElementById("site");
const campoEmail = document.getElementById("email");
const campoWhatsapp = document.getElementById("whatsapp");
const mensagemDuplicidade = document.getElementById("mensagem-duplicidade");
const mensagemRascunho = document.getElementById("mensagem-rascunho");
const botaoLimparRascunho = document.getElementById("btn-limpar-rascunho");

const campoLogo = document.getElementById("logo");
const previewLogo = document.getElementById("logo-preview");
const mensagemLogo = document.getElementById("mensagem-logo");
const campoStream = document.getElementById("stream-url");
const botaoTestarStream = document.getElementById(
  "btn-testar-stream"
);
const mensagemStream = document.getElementById(
  "mensagem-stream"
);
const campoDescricao = document.getElementById("descricao");
const contadorDescricao = document.getElementById(
  "contador-descricao"
);
const alerta = document.getElementById("cadastro-alerta");
const botaoEnviar = document.getElementById(
  "btn-enviar-cadastro"
);
const secaoSucesso = document.getElementById(
  "cadastro-sucesso"
);
const protocoloGerado = document.getElementById(
  "protocolo-gerado"
);
const observacaoSucesso = document.getElementById(
  "observacao-sucesso"
);
const botaoCopiar = document.getElementById(
  "btn-copiar-protocolo"
);

let logoValidada = null;
let urlPreviewAtual = "";
let streamValidado = null;
let testeStreamEmAndamento = false;
let audioTesteStream = null;
let municipiosCarregados = [];
let controladorMunicipios = null;
let temporizadorDuplicidade = null;
let verificacaoDuplicidadeEmAndamento = false;
let duplicidadeCadastro = {
  verificada: false,
  bloqueado: false,
  motivos: [],
  avisos: []
};
let temporizadorRascunho = null;

campoDescricao.addEventListener("input", () => {
  contadorDescricao.textContent =
    `${campoDescricao.value.length}/600`;
});

campoLogo.addEventListener("change", validarLogoSelecionada);
campoStream.addEventListener("input", () => {
  invalidarTesteStream();
  agendarVerificacaoDuplicidade();
});
botaoTestarStream.addEventListener("click", testarStream);

campoEstado.addEventListener("change", async () => {
  campoCidade.value = "";
  await carregarMunicipiosDoEstado();
  agendarVerificacaoDuplicidade();
});

campoCidade.addEventListener("input", () => {
  validarCidadeOficial(false);
  agendarVerificacaoDuplicidade();
});

campoCidade.addEventListener("blur", () => {
  validarCidadeOficial(true);
  agendarVerificacaoDuplicidade(true);
});

[campoNomeRadio, campoEmail].forEach((campo) => {
  campo.addEventListener("input", agendarVerificacaoDuplicidade);
  campo.addEventListener("blur", () =>
    agendarVerificacaoDuplicidade(true)
  );
});

campoSite.addEventListener("blur", () => {
  normalizarSiteDigitado();
  agendarVerificacaoDuplicidade(true);
});

campoWhatsapp.addEventListener("input", formatarWhatsapp);

formulario.addEventListener("input", agendarSalvamentoRascunho);
formulario.addEventListener("change", agendarSalvamentoRascunho);
formulario.addEventListener("submit", enviarCadastro);
botaoLimparRascunho.addEventListener("click", limparRascunho);
botaoCopiar.addEventListener("click", copiarProtocolo);

restaurarRascunho();
contadorDescricao.textContent =
  `${campoDescricao.value.length}/600`;

if (campoEstado.value) {
  carregarMunicipiosDoEstado(campoCidade.value);
}

atualizarEstadoBotaoEnviar();

function obterStreamDigitado() {
  return String(campoStream.value || "").trim();
}

function streamEstaValidado() {
  return Boolean(
    streamValidado &&
    streamValidado.url === obterStreamDigitado() &&
    streamValidado.reproducaoConfirmada === true
  );
}

function atualizarEstadoBotaoEnviar() {
  botaoEnviar.disabled = Boolean(
    testeStreamEmAndamento ||
    verificacaoDuplicidadeEmAndamento ||
    duplicidadeCadastro.bloqueado ||
    !streamEstaValidado()
  );
}

function definirMensagemStream(texto, classe = "aguardando") {
  mensagemStream.textContent = texto;
  mensagemStream.className =
    `cadastro-stream-resultado ${classe}`.trim();
}

function invalidarTesteStream() {
  encerrarAudioTesteStream();
  streamValidado = null;
  duplicidadeCadastro.verificada = false;
  campoStream.classList.remove("campo-invalido");

  definirMensagemStream(
    "O endereço foi alterado. Teste novamente para liberar o envio.",
    "aguardando"
  );

  atualizarEstadoBotaoEnviar();
}

function validarFormatoInicialStream(valor) {
  let url;

  try {
    url = new URL(valor);
  } catch {
    throw new Error("Informe uma URL de stream válida.");
  }

  if (url.protocol !== "https:") {
    throw new Error(
      "O stream precisa começar com https://. Endereços HTTP são bloqueados pelo portal seguro."
    );
  }

  if (url.username || url.password) {
    throw new Error(
      "O stream não pode exigir usuário ou senha no endereço."
    );
  }

  if (/\.(pls|m3u|m3u8)$/i.test(url.pathname)) {
    throw new Error(
      "Envie a URL direta do áudio, não um arquivo .pls, .m3u ou .m3u8."
    );
  }

  return url.href;
}

function encerrarAudioTesteStream() {
  if (!audioTesteStream) return;

  try {
    audioTesteStream.pause();
    audioTesteStream.removeAttribute("src");
    audioTesteStream.load();
  } catch {
    // O encerramento do teste não deve interromper o formulário.
  }

  audioTesteStream = null;
}

async function consultarStreamNoWorker(
  urlNormalizada,
  signal
) {
  const resposta = await fetch(
    `${URL_API_CADASTRO}/api/streams/testar`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        streamUrl: urlNormalizada
      }),
      signal
    }
  );

  let resultado;

  try {
    resultado = await resposta.json();
  } catch {
    resultado = null;
  }

  if (
    !resposta.ok ||
    !resultado?.ok ||
    !resultado?.compativel
  ) {
    throw new Error(
      resultado?.erro ||
      "O endereço não foi reconhecido como áudio direto compatível."
    );
  }

  return resultado;
}

function confirmarReproducaoNoNavegador(
  urlNormalizada
) {
  encerrarAudioTesteStream();

  const audio = new Audio();
  audioTesteStream = audio;

  audio.preload = "auto";
  audio.volume = 0.35;
  audio.src = urlNormalizada;
  audio.setAttribute("playsinline", "");

  return new Promise((resolve, reject) => {
    let finalizado = false;
    let reproducaoIniciada = false;
    let temporizadorConfirmacao = null;

    const temporizadorLimite = window.setTimeout(() => {
      falhar(
        "O servidor respondeu, mas o navegador não conseguiu reproduzir o áudio em até 20 segundos."
      );
    }, TEMPO_MAXIMO_REPRODUCAO_STREAM_MS);

    function limparEventos() {
      window.clearTimeout(temporizadorLimite);

      if (temporizadorConfirmacao) {
        window.clearTimeout(temporizadorConfirmacao);
      }

      audio.removeEventListener(
        "playing",
        confirmarInicio
      );
      audio.removeEventListener(
        "timeupdate",
        confirmarPeloTempo
      );
      audio.removeEventListener(
        "error",
        tratarErroAudio
      );
      audio.removeEventListener(
        "abort",
        tratarInterrupcao
      );
    }

    function concluir() {
      if (finalizado) return;

      finalizado = true;
      limparEventos();
      encerrarAudioTesteStream();
      resolve(true);
    }

    function falhar(mensagem) {
      if (finalizado) return;

      finalizado = true;
      limparEventos();
      encerrarAudioTesteStream();
      reject(new Error(mensagem));
    }

    function confirmarInicio() {
      if (reproducaoIniciada || finalizado) return;

      reproducaoIniciada = true;

      definirMensagemStream(
        "🔊 O áudio está tocando. Confirmando por alguns segundos...",
        "testando"
      );

      temporizadorConfirmacao = window.setTimeout(
        concluir,
        TEMPO_CONFIRMACAO_REPRODUCAO_MS
      );
    }

    function confirmarPeloTempo() {
      if (
        Number.isFinite(audio.currentTime) &&
        audio.currentTime > 0
      ) {
        confirmarInicio();
      }
    }

    function tratarErroAudio() {
      const codigo = audio.error?.code || 0;

      const mensagens = {
        1: "O teste de áudio foi interrompido.",
        2: "O navegador encontrou uma falha de rede ao abrir o stream.",
        3: "O navegador recebeu o stream, mas não conseguiu decodificar o áudio.",
        4: "O formato do áudio não é compatível com este navegador."
      };

      falhar(
        mensagens[codigo] ||
        "O navegador não conseguiu reproduzir este endereço."
      );
    }

    function tratarInterrupcao() {
      if (!finalizado && !reproducaoIniciada) {
        falhar("A reprodução do stream foi interrompida.");
      }
    }

    audio.addEventListener(
      "playing",
      confirmarInicio
    );
    audio.addEventListener(
      "timeupdate",
      confirmarPeloTempo
    );
    audio.addEventListener(
      "error",
      tratarErroAudio
    );
    audio.addEventListener(
      "abort",
      tratarInterrupcao
    );

    const tentativa = audio.play();

    if (
      tentativa &&
      typeof tentativa.catch === "function"
    ) {
      tentativa.catch((erro) => {
        const mensagem =
          erro?.name === "NotAllowedError"
            ? "O navegador bloqueou o teste com som. Clique novamente em Testar transmissão."
            : erro?.name === "NotSupportedError"
              ? "O navegador não reconheceu este endereço como áudio reproduzível."
              : "Não foi possível iniciar a reprodução real deste stream.";

        falhar(mensagem);
      });
    }
  });
}

async function testarStream() {
  ocultarAlerta();
  encerrarAudioTesteStream();
  streamValidado = null;
  atualizarEstadoBotaoEnviar();

  const valor = obterStreamDigitado();

  if (!valor) {
    campoStream.classList.add("campo-invalido");
    definirMensagemStream(
      "Informe primeiro a URL direta da transmissão.",
      "erro"
    );
    campoStream.focus();
    return;
  }

  let urlNormalizada;

  try {
    urlNormalizada = validarFormatoInicialStream(
      valor
    );
  } catch (erro) {
    campoStream.classList.add("campo-invalido");
    definirMensagemStream(
      erro instanceof Error
        ? erro.message
        : "A URL do stream é inválida.",
      "erro"
    );
    return;
  }

  campoStream.value = urlNormalizada;
  campoStream.classList.remove("campo-invalido");
  testeStreamEmAndamento = true;
  botaoTestarStream.disabled = true;
  botaoTestarStream.textContent = "Testando...";
  definirMensagemStream(
    "Etapa 1 de 2: verificando o servidor. O áudio deverá tocar por alguns segundos.",
    "testando"
  );
  atualizarEstadoBotaoEnviar();

  const controlador = new AbortController();
  const temporizadorWorker = window.setTimeout(
    () => controlador.abort(),
    TEMPO_MAXIMO_TESTE_STREAM_MS
  );

  try {
    /*
      As duas verificações começam no mesmo clique:
      1. o Worker confere HTTPS e resposta do servidor;
      2. o navegador tenta reproduzir e decodificar o áudio.
    */
    const promessaWorker = consultarStreamNoWorker(
      urlNormalizada,
      controlador.signal
    );

    const promessaNavegador =
      confirmarReproducaoNoNavegador(
        urlNormalizada
      );

    const [resultado] = await Promise.all([
      promessaWorker,
      promessaNavegador
    ]);

    streamValidado = {
      url: obterStreamDigitado(),
      formato: resultado.formato || "Áudio",
      contentType: resultado.contentType || "",
      reproducaoConfirmada: true
    };

    const detalhes = [
      resultado.formato,
      resultado.contentType,
      "reprodução confirmada no navegador"
    ].filter(Boolean);

    definirMensagemStream(
      `✅ Stream testado e compatível: ${detalhes.join(" • ")}`,
      "sucesso"
    );

    await verificarDuplicidadeCadastro(true);
  } catch (erro) {
    streamValidado = null;
    campoStream.classList.add("campo-invalido");

    const mensagem =
      erro?.name === "AbortError"
        ? "O servidor demorou demais para responder. Confirme a URL direta HTTPS com a hospedagem."
        : erro instanceof Error
          ? erro.message
          : "Não foi possível testar o stream agora.";

    definirMensagemStream(mensagem, "erro");
  } finally {
    window.clearTimeout(temporizadorWorker);
    controlador.abort();
    encerrarAudioTesteStream();
    testeStreamEmAndamento = false;
    botaoTestarStream.disabled = false;
    botaoTestarStream.textContent =
      "🔊 Testar transmissão";
    atualizarEstadoBotaoEnviar();
  }
}


async function carregarMunicipiosDoEstado(cidadePreservada = "") {
  const uf = campoEstado.value;
  const codigo = CODIGOS_IBGE_UF[uf];

  municipiosCarregados = [];
  listaMunicipios.replaceChildren();
  campoCidade.setCustomValidity("");

  if (!codigo) {
    campoCidade.placeholder = "Selecione primeiro o estado";
    mensagemCidade.textContent =
      "Ao escolher o estado, carregaremos as cidades oficiais do IBGE.";
    return;
  }

  if (controladorMunicipios) {
    controladorMunicipios.abort();
  }

  controladorMunicipios = new AbortController();
  campoCidade.placeholder = "Carregando cidades...";
  mensagemCidade.textContent = "Carregando cidades oficiais...";

  try {
    const resposta = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${codigo}/municipios?orderBy=nome`,
      { signal: controladorMunicipios.signal }
    );

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();
    municipiosCarregados = Array.isArray(dados)
      ? dados
        .map((municipio) => String(municipio?.nome || "").trim())
        .filter(Boolean)
      : [];

    const fragmento = document.createDocumentFragment();

    for (const municipio of municipiosCarregados) {
      const opcao = document.createElement("option");
      opcao.value = municipio;
      fragmento.appendChild(opcao);
    }

    listaMunicipios.replaceChildren(fragmento);
    campoCidade.placeholder = "Comece a digitar a cidade";
    mensagemCidade.textContent =
      `${municipiosCarregados.length} cidades carregadas. Escolha uma opção da lista.`;

    if (cidadePreservada) {
      campoCidade.value = cidadePreservada;
      validarCidadeOficial(false);
    }
  } catch (erro) {
    if (erro?.name === "AbortError") return;

    campoCidade.placeholder = "Digite a cidade";
    mensagemCidade.textContent =
      "Não foi possível carregar a lista agora. Você pode digitar a cidade manualmente.";
    campoCidade.setCustomValidity("");
  }
}

function normalizarComparacaoLocal(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function validarCidadeOficial(mostrarMensagem) {
  const valor = campoCidade.value.trim();

  if (!valor || municipiosCarregados.length === 0) {
    campoCidade.setCustomValidity("");
    return true;
  }

  const chave = normalizarComparacaoLocal(valor);
  const cidadeOficial = municipiosCarregados.find(
    (municipio) =>
      normalizarComparacaoLocal(municipio) === chave
  );

  if (cidadeOficial) {
    campoCidade.value = cidadeOficial;
    campoCidade.setCustomValidity("");
    campoCidade.classList.remove("campo-invalido");
    return true;
  }

  campoCidade.setCustomValidity(
    "Escolha uma cidade da lista oficial do estado selecionado."
  );

  if (mostrarMensagem) {
    campoCidade.classList.add("campo-invalido");
    mensagemCidade.textContent =
      "Escolha uma das cidades sugeridas para evitar erro de localização.";
  }

  return false;
}

function normalizarSiteDigitado() {
  const valor = campoSite.value.trim();

  if (!valor) return;

  if (!/^https?:\/\//i.test(valor) && valor.includes(".")) {
    campoSite.value = `https://${valor}`;
  }
}

function formatarWhatsapp() {
  let digitos = campoWhatsapp.value.replace(/\D/g, "");

  if (digitos.startsWith("55") && digitos.length > 11) {
    digitos = digitos.slice(2);
  }

  digitos = digitos.slice(0, 11);

  if (digitos.length <= 2) {
    campoWhatsapp.value = digitos;
    return;
  }

  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);

  if (numero.length <= 4) {
    campoWhatsapp.value = `(${ddd}) ${numero}`;
  } else if (numero.length <= 8) {
    campoWhatsapp.value =
      `(${ddd}) ${numero.slice(0, 4)}-${numero.slice(4)}`;
  } else {
    campoWhatsapp.value =
      `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`;
  }
}

function agendarVerificacaoDuplicidade(imediata = false) {
  duplicidadeCadastro = {
    verificada: false,
    bloqueado: false,
    motivos: [],
    avisos: []
  };
  atualizarEstadoBotaoEnviar();

  if (temporizadorDuplicidade) {
    window.clearTimeout(temporizadorDuplicidade);
  }

  temporizadorDuplicidade = window.setTimeout(
    () => verificarDuplicidadeCadastro(false),
    imediata ? 0 : TEMPO_ESPERA_DUPLICIDADE_MS
  );
}

async function verificarDuplicidadeCadastro(forcar = false) {
  const dados = {
    nomeRadio: campoNomeRadio.value.trim(),
    cidade: campoCidade.value.trim(),
    estado: campoEstado.value,
    email: campoEmail.value.trim(),
    site: campoSite.value.trim(),
    streamUrl: obterStreamDigitado()
  };

  const possuiLocalizacao = Boolean(
    dados.nomeRadio && dados.cidade && dados.estado
  );

  if (!dados.streamUrl && !possuiLocalizacao) {
    duplicidadeCadastro = {
      verificada: false,
      bloqueado: false,
      motivos: [],
      avisos: []
    };
    definirMensagemDuplicidade(
      "🔎 A emissora e o stream serão comparados com o catálogo antes do envio.",
      "aguardando"
    );
    atualizarEstadoBotaoEnviar();
    return duplicidadeCadastro;
  }

  if (
    verificacaoDuplicidadeEmAndamento ||
    (!forcar && duplicidadeCadastro.verificada)
  ) {
    return duplicidadeCadastro;
  }

  verificacaoDuplicidadeEmAndamento = true;
  definirMensagemDuplicidade(
    "🔎 Verificando se a emissora ou a transmissão já estão cadastradas...",
    "verificando"
  );
  atualizarEstadoBotaoEnviar();

  try {
    const resposta = await fetch(
      `${URL_API_CADASTRO}/api/solicitacoes/verificar-duplicidade`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      }
    );

    const resultado = await resposta.json();

    if (!resposta.ok || !resultado?.ok) {
      throw new Error(
        resultado?.erro || "Não foi possível verificar duplicidade."
      );
    }

    duplicidadeCadastro = {
      verificada: true,
      bloqueado: Boolean(resultado.bloqueado),
      motivos: Array.isArray(resultado.motivos)
        ? resultado.motivos
        : [],
      avisos: Array.isArray(resultado.avisos)
        ? resultado.avisos
        : []
    };

    if (duplicidadeCadastro.bloqueado) {
      definirMensagemDuplicidade(
        `⛔ ${duplicidadeCadastro.motivos[0]?.mensagem || "Cadastro duplicado."}`,
        "erro",
        true
      );
    } else if (duplicidadeCadastro.avisos.length) {
      definirMensagemDuplicidade(
        `⚠️ ${duplicidadeCadastro.avisos[0].mensagem}`,
        "aviso"
      );
    } else {
      definirMensagemDuplicidade(
        "✅ Nenhum cadastro duplicado foi encontrado.",
        "sucesso"
      );
    }
  } catch (erro) {
    duplicidadeCadastro = {
      verificada: false,
      bloqueado: false,
      motivos: [],
      avisos: []
    };

    definirMensagemDuplicidade(
      "⚠️ A verificação prévia não respondeu. O servidor tentará novamente no envio.",
      "aviso"
    );
  } finally {
    verificacaoDuplicidadeEmAndamento = false;
    atualizarEstadoBotaoEnviar();
  }

  return duplicidadeCadastro;
}

function definirMensagemDuplicidade(
  texto,
  classe,
  mostrarAcompanhar = false
) {
  mensagemDuplicidade.className =
    `cadastro-duplicidade ${classe}`.trim();
  mensagemDuplicidade.replaceChildren();

  const span = document.createElement("span");
  span.textContent = texto;
  mensagemDuplicidade.appendChild(span);

  if (mostrarAcompanhar) {
    const link = document.createElement("a");
    link.href = "../acompanhar/";
    link.textContent = "Acompanhar cadastro existente";
    mensagemDuplicidade.appendChild(link);
  }
}

function agendarSalvamentoRascunho() {
  if (temporizadorRascunho) {
    window.clearTimeout(temporizadorRascunho);
  }

  temporizadorRascunho = window.setTimeout(
    salvarRascunho,
    500
  );
}

function salvarRascunho() {
  const dados = {};

  [
    "nomeRadio", "cidade", "estado", "categoriaPrincipal",
    "site", "descricao", "streamUrl", "email", "whatsapp"
  ].forEach((nome) => {
    const campo = formulario.elements.namedItem(nome);
    if (campo) dados[nome] = campo.value;
  });

  dados.termosAceitos = Boolean(
    formulario.elements.namedItem("termosAceitos")?.checked
  );

  try {
    localStorage.setItem(
      CHAVE_RASCUNHO_CADASTRO,
      JSON.stringify(dados)
    );
    mensagemRascunho.textContent =
      "Rascunho salvo automaticamente neste aparelho.";
  } catch {
    mensagemRascunho.textContent =
      "Não foi possível salvar o rascunho neste navegador.";
  }
}

function restaurarRascunho() {
  let dados;

  try {
    dados = JSON.parse(
      localStorage.getItem(CHAVE_RASCUNHO_CADASTRO) || "null"
    );
  } catch {
    dados = null;
  }

  if (!dados || typeof dados !== "object") return;

  [
    "nomeRadio", "cidade", "estado", "categoriaPrincipal",
    "site", "descricao", "streamUrl", "email", "whatsapp"
  ].forEach((nome) => {
    const campo = formulario.elements.namedItem(nome);
    if (campo && typeof dados[nome] === "string") {
      campo.value = dados[nome];
    }
  });

  const termos = formulario.elements.namedItem("termosAceitos");
  if (termos) termos.checked = Boolean(dados.termosAceitos);

  mensagemRascunho.textContent =
    "Rascunho anterior recuperado neste aparelho.";
}

function limparRascunho() {
  localStorage.removeItem(CHAVE_RASCUNHO_CADASTRO);
  formulario.reset();
  limparPreviewLogo();
  logoValidada = null;
  streamValidado = null;
  municipiosCarregados = [];
  listaMunicipios.replaceChildren();
  campoCidade.setCustomValidity("");
  campoCidade.placeholder = "Selecione primeiro o estado";
  contadorDescricao.textContent = "0/600";
  definirMensagemStream(
    "O teste do stream é obrigatório para liberar o envio.",
    "aguardando"
  );
  definirMensagemDuplicidade(
    "🔎 A emissora e o stream serão comparados com o catálogo antes do envio.",
    "aguardando"
  );
  mensagemRascunho.textContent =
    "Rascunho limpo. Você pode iniciar um novo cadastro.";
  atualizarEstadoBotaoEnviar();
}

async function validarLogoSelecionada() {
  limparPreviewLogo();

  const arquivo = campoLogo.files?.[0];

  if (!arquivo) {
    logoValidada = null;

    definirMensagemLogo(
      "A logomarca é opcional no envio inicial.",
      ""
    );

    return;
  }

  const tiposPermitidos = [
    "image/png",
    "image/jpeg",
    "image/webp"
  ];

  if (!tiposPermitidos.includes(arquivo.type)) {
    rejeitarLogo(
      "Formato inválido. Use PNG, JPG, JPEG ou WebP."
    );
    return;
  }

  if (arquivo.size > LIMITE_LOGO_BYTES) {
    rejeitarLogo(
      "O arquivo ultrapassa o limite de 2 MB."
    );
    return;
  }

  try {
    const dimensoes = await obterDimensoesImagem(arquivo);

    if (dimensoes.largura !== dimensoes.altura) {
      rejeitarLogo(
        "A imagem precisa ser quadrada, com proporção 1:1."
      );
      return;
    }

    if (
      dimensoes.largura < RESOLUCAO_MINIMA_LOGO ||
      dimensoes.altura < RESOLUCAO_MINIMA_LOGO
    ) {
      rejeitarLogo(
        "A resolução mínima aceita é 512 × 512 pixels."
      );
      return;
    }

    if (
      dimensoes.largura > RESOLUCAO_MAXIMA_LOGO ||
      dimensoes.altura > RESOLUCAO_MAXIMA_LOGO
    ) {
      rejeitarLogo(
        "A resolução máxima aceita é 4096 × 4096 pixels."
      );
      return;
    }

    logoValidada = {
      arquivo,
      largura: dimensoes.largura,
      altura: dimensoes.altura
    };

    urlPreviewAtual = URL.createObjectURL(arquivo);

    const imagem = document.createElement("img");
    imagem.src = urlPreviewAtual;
    imagem.alt = "Prévia da logomarca selecionada";

    previewLogo.replaceChildren(imagem);

    definirMensagemLogo(
      `${arquivo.name} • ` +
      `${dimensoes.largura} × ${dimensoes.altura} px • ` +
      `${formatarBytes(arquivo.size)}`,
      "sucesso"
    );
  } catch (erro) {
    console.error("Falha ao analisar a logomarca:", erro);

    rejeitarLogo(
      "Não foi possível ler a imagem selecionada."
    );
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

function rejeitarLogo(mensagem) {
  campoLogo.value = "";
  logoValidada = null;
  limparPreviewLogo();
  definirMensagemLogo(mensagem, "erro");
}

function limparPreviewLogo() {
  if (urlPreviewAtual) {
    URL.revokeObjectURL(urlPreviewAtual);
    urlPreviewAtual = "";
  }

  previewLogo.innerHTML =
    "<span>📻</span><small>Prévia da logomarca</small>";
}

function definirMensagemLogo(texto, classe) {
  mensagemLogo.textContent = texto;
  mensagemLogo.className =
    `cadastro-mensagem-campo ${classe}`.trim();
}

async function enviarCadastro(evento) {
  evento.preventDefault();

  limparErrosCampos();
  ocultarAlerta();
  normalizarSiteDigitado();
  validarCidadeOficial(true);

  if (!formulario.checkValidity()) {
    destacarCamposInvalidos();
    window.CRBAcessibilidade?.focarPrimeiroInvalido(formulario);
    formulario.reportValidity();
    return;
  }

  await verificarDuplicidadeCadastro(true);

  if (duplicidadeCadastro.bloqueado) {
    mostrarAlerta(
      duplicidadeCadastro.motivos[0]?.mensagem ||
      "Esta emissora ou transmissão já possui cadastro ativo."
    );
    mensagemDuplicidade.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return;
  }

  if (!streamEstaValidado()) {
    campoStream.classList.add("campo-invalido");
    mostrarAlerta(
      "Teste a transmissão e aguarde a confirmação de compatibilidade antes de enviar o cadastro."
    );
    campoStream.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return;
  }

  if (campoLogo.files?.[0] && !logoValidada) {
    mostrarAlerta(
      "A logomarca selecionada ainda não passou pela validação."
    );
    return;
  }

  const dados = new FormData(formulario);

  // Evita que preenchimentos automáticos do navegador acionem o campo de segurança.
  dados.delete("enderecoAlternativo");

  if (!logoValidada) {
    dados.delete("logo");
  }

  botaoEnviar.disabled = true;
  botaoEnviar.textContent = "Enviando...";

  try {
    const resposta = await enviarCadastroComTimeout(
      `${URL_API_CADASTRO}/api/solicitacoes`,
      {
        method: "POST",
        body: dados
      }
    );

    let resultado;

    try {
      resultado = await resposta.json();
    } catch {
      resultado = null;
    }

    if (!resposta.ok || !resultado?.ok) {
      throw new Error(
        resultado?.erro ||
        `Não foi possível enviar o cadastro (HTTP ${resposta.status}).`
      );
    }

    exibirSucesso(resultado);
  } catch (erro) {
    console.error("Falha no cadastro:", erro);

    mostrarAlerta(
      erro instanceof Error
        ? erro.message
        : "Não foi possível enviar o cadastro agora."
    );
  } finally {
    botaoEnviar.textContent = "Enviar para análise";
    atualizarEstadoBotaoEnviar();
  }
}

async function enviarCadastroComTimeout(url, opcoes) {
  const controlador = new AbortController();
  const temporizador = window.setTimeout(
    () => controlador.abort(),
    TEMPO_MAXIMO_ENVIO_CADASTRO_MS
  );

  try {
    return await fetch(url, {
      ...opcoes,
      cache: "no-store",
      signal: controlador.signal
    });
  } catch (erro) {
    if (erro?.name === "AbortError") {
      throw new Error(
        "O servidor demorou para confirmar o cadastro. Aguarde alguns instantes e tente novamente."
      );
    }

    if (erro instanceof TypeError) {
      throw new Error(
        "Não foi possível conectar ao sistema de cadastro. Verifique a internet e tente novamente."
      );
    }

    throw erro;
  } finally {
    window.clearTimeout(temporizador);
  }
}

function exibirSucesso(resultado) {
  localStorage.removeItem(CHAVE_RASCUNHO_CADASTRO);
  protocoloGerado.textContent = resultado.protocolo;

  observacaoSucesso.textContent = resultado.logoRecebida
    ? "A logomarca foi recebida. O cadastro permanece pendente até a análise administrativa."
    : "Nenhuma logomarca foi enviada. A solicitação continuará pendente até que a emissora complete esse envio pelo sistema.";

  formulario.classList.add("hidden");
  secaoSucesso.classList.remove("hidden");
  secaoSucesso.focus({ preventScroll: true });
  window.CRBAcessibilidade?.anunciar(
    `Cadastro enviado com sucesso. Protocolo ${resultado.protocolo}.`
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function copiarProtocolo() {
  const protocolo = protocoloGerado.textContent.trim();

  try {
    await navigator.clipboard.writeText(protocolo);
    botaoCopiar.textContent = "Copiado";

    window.setTimeout(() => {
      botaoCopiar.textContent = "Copiar";
    }, 1800);
  } catch {
    alert(`Anote o protocolo: ${protocolo}`);
  }
}

function destacarCamposInvalidos() {
  formulario
    .querySelectorAll("input, select, textarea")
    .forEach(campo => {
      if (!campo.checkValidity()) {
        campo.classList.add("campo-invalido");
        campo.setAttribute("aria-invalid", "true");
      }
    });
}

function limparErrosCampos() {
  formulario
    .querySelectorAll(".campo-invalido")
    .forEach(campo => {
      campo.classList.remove("campo-invalido");
      campo.removeAttribute("aria-invalid");
    });
}

function mostrarAlerta(mensagem) {
  alerta.textContent = mensagem;
  alerta.classList.remove("hidden");
  alerta.setAttribute("tabindex", "-1");
}

function ocultarAlerta() {
  alerta.classList.add("hidden");
  alerta.textContent = "";
}

function formatarBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
