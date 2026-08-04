"use strict";

const URL_API_ACOMPANHAMENTO =
  "https://broken-bar-45e2.contatofalapopular.workers.dev";

const LIMITE_LOGO_BYTES = 2 * 1024 * 1024;
const RESOLUCAO_MINIMA_LOGO = 512;
const RESOLUCAO_MAXIMA_LOGO = 4096;
const TEMPO_MAXIMO_TESTE_STREAM_MS = 15000;
const TEMPO_MAXIMO_REPRODUCAO_STREAM_MS = 20000;
const TEMPO_CONFIRMACAO_REPRODUCAO_MS = 3500;
const TEMPO_MAXIMO_CONSULTA_MS = 20000;

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

const secaoAlteracao = document.getElementById("secao-alteracao-emissora");
const formularioAlteracao = document.getElementById("form-alteracao-emissora");
const avisoAlteracaoPendente = document.getElementById("alteracao-pendente-aviso");
const textoAlteracaoPendente = document.getElementById("alteracao-pendente-texto");
const campoAlteracaoNome = document.getElementById("alteracao-nome-radio");
const campoAlteracaoCategoria = document.getElementById("alteracao-categoria");
const campoAlteracaoCidade = document.getElementById("alteracao-cidade");
const campoAlteracaoEstado = document.getElementById("alteracao-estado");
const campoAlteracaoEmail = document.getElementById("alteracao-email");
const campoAlteracaoWhatsapp = document.getElementById("alteracao-whatsapp");
const campoAlteracaoSite = document.getElementById("alteracao-site");
const campoAlteracaoStream = document.getElementById("alteracao-stream");
const campoAlteracaoDescricao = document.getElementById("alteracao-descricao");
const campoAlteracaoLogo = document.getElementById("alteracao-logo");
const botaoTestarStreamAlteracao = document.getElementById("btn-testar-stream-alteracao");
const mensagemStreamAlteracao = document.getElementById("mensagem-stream-alteracao");
const alertaAlteracao = document.getElementById("alerta-alteracao");
const botaoEnviarAlteracao = document.getElementById("btn-enviar-alteracao");

let credenciaisAtuais = null;
let solicitacaoAtual = null;
let logoValidada = null;
let urlPreviewAtual = "";
let streamAlteracaoValidado = null;
let testeStreamAlteracaoEmAndamento = false;
let audioTesteAlteracao = null;

formularioConsulta.addEventListener("submit", consultarCadastro);
formularioLogo.addEventListener("submit", enviarLogomarca);
campoLogo.addEventListener("change", validarLogoSelecionada);
botaoNovaConsulta.addEventListener("click", iniciarNovaConsulta);
formularioAlteracao.addEventListener("submit", enviarAlteracao);
campoAlteracaoStream.addEventListener("input", invalidarTesteStreamAlteracao);
botaoTestarStreamAlteracao.addEventListener("click", testarStreamAlteracao);

preencherProtocoloDaUrl();

async function consultarCadastro(evento) {
  evento.preventDefault();
  ocultarAlerta(alertaConsulta);

  if (!formularioConsulta.checkValidity()) {
    window.CRBAcessibilidade?.focarPrimeiroInvalido(formularioConsulta);
    formularioConsulta.reportValidity();
    return;
  }

  const protocolo = campoProtocolo.value.trim().toUpperCase();
  const email = campoEmail.value.trim().toLowerCase();

  botaoConsultar.disabled = true;
  botaoConsultar.textContent = "Consultando...";

  try {
    const resposta = await consultarCadastroComTimeout(
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
    resultadoCadastro.focus({ preventScroll: true });
    window.CRBAcessibilidade?.anunciar(
      `Cadastro localizado. Status: ${formatarStatus(solicitacaoAtual.status)}.`
    );

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

async function consultarCadastroComTimeout(url, opcoes) {
  const controlador = new AbortController();
  const temporizador = window.setTimeout(
    () => controlador.abort(),
    TEMPO_MAXIMO_CONSULTA_MS
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
        "A consulta demorou mais que o esperado. Aguarde alguns instantes e tente novamente."
      );
    }

    if (erro instanceof TypeError) {
      throw new Error(
        "Não foi possível conectar ao sistema de acompanhamento. Verifique a internet e tente novamente."
      );
    }

    throw erro;
  } finally {
    window.clearTimeout(temporizador);
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

  renderizarAlteracaoEmissora(solicitacao, aprovada);
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

function renderizarAlteracaoEmissora(solicitacao, aprovada) {
  secaoAlteracao.classList.toggle("hidden", !aprovada);

  if (!aprovada) {
    formularioAlteracao.classList.add("hidden");
    avisoAlteracaoPendente.classList.add("hidden");
    return;
  }

  const pendente = solicitacao.alteracao_pendente;

  if (pendente) {
    formularioAlteracao.classList.add("hidden");
    avisoAlteracaoPendente.classList.remove("hidden");
    textoAlteracaoPendente.textContent =
      `Protocolo ${pendente.id} • ${formatarStatus(pendente.status)} • ` +
      `enviada em ${formatarData(pendente.criado_em)}. ` +
      "A emissora permanece publicada com os dados anteriores até a conclusão da análise.";
    return;
  }

  avisoAlteracaoPendente.classList.add("hidden");
  formularioAlteracao.classList.remove("hidden");
  preencherFormularioAlteracao(solicitacao);
}

function preencherFormularioAlteracao(solicitacao) {
  campoAlteracaoNome.value = solicitacao.nome_radio || "";
  campoAlteracaoCategoria.value =
    solicitacao.categoria_principal || "";
  campoAlteracaoCidade.value = solicitacao.cidade || "";
  campoAlteracaoEstado.value = solicitacao.estado || "";
  campoAlteracaoEmail.value = solicitacao.email || "";
  campoAlteracaoWhatsapp.value = solicitacao.whatsapp || "";
  campoAlteracaoSite.value = solicitacao.site || "";
  campoAlteracaoStream.value = solicitacao.stream_url || "";
  campoAlteracaoDescricao.value = solicitacao.descricao || "";
  campoAlteracaoLogo.value = "";
  streamAlteracaoValidado = {
    url: obterStreamAlteracaoDigitado(),
    reproducaoConfirmada: true,
    original: true
  };
  definirMensagemStreamAlteracao(
    "O stream atual já foi validado. Teste novamente apenas se alterar o endereço.",
    "aguardando"
  );
  campoAlteracaoStream.classList.remove("campo-invalido");
  atualizarBotaoAlteracao();
}

function obterStreamAlteracaoDigitado() {
  return String(campoAlteracaoStream.value || "").trim();
}

function streamAlteracaoEstaValidado() {
  return Boolean(
    streamAlteracaoValidado &&
    streamAlteracaoValidado.url ===
      obterStreamAlteracaoDigitado() &&
    streamAlteracaoValidado.reproducaoConfirmada === true
  );
}

function atualizarBotaoAlteracao() {
  botaoEnviarAlteracao.disabled =
    testeStreamAlteracaoEmAndamento ||
    !streamAlteracaoEstaValidado();
}

function definirMensagemStreamAlteracao(
  texto,
  classe = "aguardando"
) {
  mensagemStreamAlteracao.textContent = texto;
  mensagemStreamAlteracao.className =
    `cadastro-stream-resultado ${classe}`.trim();
}

function invalidarTesteStreamAlteracao() {
  encerrarAudioTesteAlteracao();
  streamAlteracaoValidado = null;
  campoAlteracaoStream.classList.remove("campo-invalido");
  definirMensagemStreamAlteracao(
    "O endereço foi alterado. Teste novamente para liberar o envio.",
    "aguardando"
  );
  atualizarBotaoAlteracao();
}

function validarFormatoStreamAlteracao(valor) {
  let url;

  try {
    url = new URL(valor);
  } catch {
    throw new Error("Informe uma URL de stream válida.");
  }

  if (url.protocol !== "https:") {
    throw new Error(
      "O stream precisa começar com https://. Endereços HTTP não são aceitos."
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

function encerrarAudioTesteAlteracao() {
  if (!audioTesteAlteracao) return;

  try {
    audioTesteAlteracao.pause();
    audioTesteAlteracao.removeAttribute("src");
    audioTesteAlteracao.load();
  } catch {
    // O encerramento não deve interromper o formulário.
  }

  audioTesteAlteracao = null;
}

async function consultarStreamAlteracaoNoWorker(
  urlNormalizada,
  signal
) {
  const resposta = await fetch(
    `${URL_API_ACOMPANHAMENTO}/api/streams/testar`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ streamUrl: urlNormalizada }),
      signal
    }
  );

  const resultado = await lerRespostaJson(resposta);

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

function confirmarStreamAlteracaoNoNavegador(
  urlNormalizada
) {
  encerrarAudioTesteAlteracao();

  const audio = new Audio();
  audioTesteAlteracao = audio;
  audio.preload = "auto";
  audio.volume = 0.35;
  audio.src = urlNormalizada;
  audio.setAttribute("playsinline", "");

  return new Promise((resolve, reject) => {
    let finalizado = false;
    let iniciou = false;
    let timerConfirmacao = null;

    const timerLimite = window.setTimeout(() => {
      falhar(
        "O servidor respondeu, mas o navegador não reproduziu o áudio em até 20 segundos."
      );
    }, TEMPO_MAXIMO_REPRODUCAO_STREAM_MS);

    function limpar() {
      window.clearTimeout(timerLimite);
      if (timerConfirmacao) {
        window.clearTimeout(timerConfirmacao);
      }
      audio.removeEventListener("playing", confirmarInicio);
      audio.removeEventListener("timeupdate", confirmarPeloTempo);
      audio.removeEventListener("error", tratarErro);
      audio.removeEventListener("abort", tratarInterrupcao);
    }

    function concluir() {
      if (finalizado) return;
      finalizado = true;
      limpar();
      encerrarAudioTesteAlteracao();
      resolve(true);
    }

    function falhar(mensagem) {
      if (finalizado) return;
      finalizado = true;
      limpar();
      encerrarAudioTesteAlteracao();
      reject(new Error(mensagem));
    }

    function confirmarInicio() {
      if (iniciou || finalizado) return;
      iniciou = true;
      definirMensagemStreamAlteracao(
        "🔊 O áudio está tocando. Confirmando por alguns segundos...",
        "testando"
      );
      timerConfirmacao = window.setTimeout(
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

    function tratarErro() {
      const codigo = audio.error?.code || 0;
      const mensagens = {
        1: "O teste de áudio foi interrompido.",
        2: "O navegador encontrou uma falha de rede ao abrir o stream.",
        3: "O navegador recebeu o stream, mas não decodificou o áudio.",
        4: "O formato do áudio não é compatível com este navegador."
      };
      falhar(
        mensagens[codigo] ||
        "O navegador não conseguiu reproduzir este endereço."
      );
    }

    function tratarInterrupcao() {
      if (!finalizado && !iniciou) {
        falhar("A reprodução do stream foi interrompida.");
      }
    }

    audio.addEventListener("playing", confirmarInicio);
    audio.addEventListener("timeupdate", confirmarPeloTempo);
    audio.addEventListener("error", tratarErro);
    audio.addEventListener("abort", tratarInterrupcao);

    const tentativa = audio.play();

    if (
      tentativa &&
      typeof tentativa.catch === "function"
    ) {
      tentativa.catch((erro) => {
        const mensagem =
          erro?.name === "NotAllowedError"
            ? "O navegador bloqueou o som. Clique novamente em Testar transmissão."
            : erro?.name === "NotSupportedError"
              ? "O navegador não reconheceu este endereço como áudio."
              : "Não foi possível iniciar a reprodução real deste stream.";
        falhar(mensagem);
      });
    }
  });
}

async function testarStreamAlteracao() {
  ocultarAlerta(alertaAlteracao);
  encerrarAudioTesteAlteracao();
  streamAlteracaoValidado = null;

  const valor = obterStreamAlteracaoDigitado();

  if (!valor) {
    campoAlteracaoStream.classList.add("campo-invalido");
    definirMensagemStreamAlteracao(
      "Informe primeiro a URL direta da transmissão.",
      "erro"
    );
    return;
  }

  let urlNormalizada;

  try {
    urlNormalizada = validarFormatoStreamAlteracao(valor);
  } catch (erro) {
    campoAlteracaoStream.classList.add("campo-invalido");
    definirMensagemStreamAlteracao(
      erro instanceof Error
        ? erro.message
        : "A URL do stream é inválida.",
      "erro"
    );
    return;
  }

  campoAlteracaoStream.value = urlNormalizada;
  campoAlteracaoStream.classList.remove("campo-invalido");
  testeStreamAlteracaoEmAndamento = true;
  botaoTestarStreamAlteracao.disabled = true;
  botaoTestarStreamAlteracao.textContent = "Testando...";
  definirMensagemStreamAlteracao(
    "Verificando o servidor e a reprodução real do áudio...",
    "testando"
  );
  atualizarBotaoAlteracao();

  const controlador = new AbortController();
  const timer = window.setTimeout(
    () => controlador.abort(),
    TEMPO_MAXIMO_TESTE_STREAM_MS
  );

  try {
    const [resultado] = await Promise.all([
      consultarStreamAlteracaoNoWorker(
        urlNormalizada,
        controlador.signal
      ),
      confirmarStreamAlteracaoNoNavegador(
        urlNormalizada
      )
    ]);

    streamAlteracaoValidado = {
      url: obterStreamAlteracaoDigitado(),
      reproducaoConfirmada: true,
      formato: resultado.formato || "Áudio"
    };

    definirMensagemStreamAlteracao(
      `✅ Stream compatível: ${resultado.formato || "Áudio"} • reprodução confirmada`,
      "sucesso"
    );
  } catch (erro) {
    streamAlteracaoValidado = null;
    campoAlteracaoStream.classList.add("campo-invalido");
    definirMensagemStreamAlteracao(
      erro?.name === "AbortError"
        ? "O servidor demorou demais para responder."
        : erro instanceof Error
          ? erro.message
          : "Não foi possível testar o stream.",
      "erro"
    );
  } finally {
    window.clearTimeout(timer);
    controlador.abort();
    encerrarAudioTesteAlteracao();
    testeStreamAlteracaoEmAndamento = false;
    botaoTestarStreamAlteracao.disabled = false;
    botaoTestarStreamAlteracao.textContent =
      "🔊 Testar transmissão";
    atualizarBotaoAlteracao();
  }
}

async function validarLogoAlteracaoSelecionada() {
  const arquivo = campoAlteracaoLogo.files?.[0];

  if (!arquivo) return true;

  if (
    !["image/png", "image/jpeg", "image/webp"].includes(
      arquivo.type
    )
  ) {
    throw new Error(
      "A nova logomarca deve ser PNG, JPG, JPEG ou WebP."
    );
  }

  if (arquivo.size > LIMITE_LOGO_BYTES) {
    throw new Error(
      "A nova logomarca ultrapassa o limite de 2 MB."
    );
  }

  const dimensoes = await obterDimensoesImagem(arquivo);

  if (dimensoes.largura !== dimensoes.altura) {
    throw new Error(
      "A nova logomarca precisa ser quadrada, com proporção 1:1."
    );
  }

  if (
    dimensoes.largura < RESOLUCAO_MINIMA_LOGO ||
    dimensoes.largura > RESOLUCAO_MAXIMA_LOGO
  ) {
    throw new Error(
      "A nova logomarca deve ter entre 512 × 512 e 4096 × 4096 pixels."
    );
  }

  return true;
}

function existemMudancasNaAlteracao() {
  if (!solicitacaoAtual) return false;

  const valores = {
    nome_radio: campoAlteracaoNome.value.trim(),
    categoria_principal: campoAlteracaoCategoria.value.trim(),
    cidade: campoAlteracaoCidade.value.trim(),
    estado: campoAlteracaoEstado.value,
    email: campoAlteracaoEmail.value.trim().toLowerCase(),
    whatsapp: campoAlteracaoWhatsapp.value.trim(),
    site: campoAlteracaoSite.value.trim(),
    stream_url: campoAlteracaoStream.value.trim(),
    descricao: campoAlteracaoDescricao.value.trim()
  };

  const mudouCampo = Object.entries(valores).some(
    ([chave, valor]) =>
      String(solicitacaoAtual[chave] || "").trim() !==
      String(valor || "").trim()
  );

  return mudouCampo || Boolean(campoAlteracaoLogo.files?.[0]);
}

async function enviarAlteracao(evento) {
  evento.preventDefault();
  ocultarAlerta(alertaAlteracao);

  if (!credenciaisAtuais || !solicitacaoAtual) {
    mostrarAlerta(
      alertaAlteracao,
      "Consulte novamente o cadastro antes de enviar a alteração."
    );
    return;
  }

  if (!formularioAlteracao.checkValidity()) {
    window.CRBAcessibilidade?.focarPrimeiroInvalido(formularioAlteracao);
    formularioAlteracao.reportValidity();
    return;
  }

  if (!streamAlteracaoEstaValidado()) {
    mostrarAlerta(
      alertaAlteracao,
      "Teste a transmissão e aguarde a confirmação antes de enviar."
    );
    campoAlteracaoStream.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return;
  }

  if (!existemMudancasNaAlteracao()) {
    mostrarAlerta(
      alertaAlteracao,
      "Nenhuma alteração foi informada."
    );
    return;
  }

  try {
    await validarLogoAlteracaoSelecionada();
  } catch (erro) {
    mostrarAlerta(
      alertaAlteracao,
      erro instanceof Error
        ? erro.message
        : "A nova logomarca é inválida."
    );
    return;
  }

  const dados = new FormData(formularioAlteracao);
  dados.append("protocolo", credenciaisAtuais.protocolo);
  dados.append(
    "emailAutenticacao",
    credenciaisAtuais.email
  );

  if (!campoAlteracaoLogo.files?.[0]) {
    dados.delete("logo");
  }

  botaoEnviarAlteracao.disabled = true;
  botaoEnviarAlteracao.textContent = "Enviando...";

  try {
    const resposta = await fetch(
      `${URL_API_ACOMPANHAMENTO}/api/solicitacoes/alteracoes`,
      {
        method: "POST",
        body: dados
      }
    );
    const resultado = await lerRespostaJson(resposta);

    if (!resposta.ok || !resultado?.ok) {
      throw new Error(
        resultado?.erro ||
        `Não foi possível enviar a alteração (HTTP ${resposta.status}).`
      );
    }

    solicitacaoAtual.alteracao_pendente =
      resultado.alteracao;
    renderizarSolicitacao(solicitacaoAtual);
    mostrarAlerta(
      alertaAlteracao,
      "Alteração recebida. A emissora continua publicada com os dados anteriores até a aprovação.",
      "sucesso"
    );
  } catch (erro) {
    mostrarAlerta(
      alertaAlteracao,
      erro instanceof Error
        ? erro.message
        : "Não foi possível enviar a alteração agora."
    );
  } finally {
    botaoEnviarAlteracao.textContent =
      "Enviar alteração para análise";
    atualizarBotaoAlteracao();
  }
}

function iniciarNovaConsulta() {
  credenciaisAtuais = null;
  solicitacaoAtual = null;
  streamAlteracaoValidado = null;
  encerrarAudioTesteAlteracao();
  secaoAlteracao.classList.add("hidden");
  ocultarAlerta(alertaAlteracao);
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
  elemento.setAttribute("role", tipo === "erro" ? "alert" : "status");
  elemento.setAttribute("aria-live", tipo === "erro" ? "assertive" : "polite");
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
