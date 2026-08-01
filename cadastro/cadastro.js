"use strict";

const URL_API_CADASTRO =
  "https://broken-bar-45e2.contatofalapopular.workers.dev";

const LIMITE_LOGO_BYTES = 2 * 1024 * 1024;
const RESOLUCAO_MINIMA_LOGO = 512;
const RESOLUCAO_MAXIMA_LOGO = 4096;
const TEMPO_MAXIMO_TESTE_STREAM_MS = 15000;

const formulario = document.getElementById(
  "form-cadastro-emissora"
);

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

campoDescricao.addEventListener("input", () => {
  contadorDescricao.textContent =
    `${campoDescricao.value.length}/600`;
});

campoLogo.addEventListener("change", validarLogoSelecionada);
campoStream.addEventListener("input", invalidarTesteStream);
botaoTestarStream.addEventListener("click", testarStream);

formulario.addEventListener("submit", enviarCadastro);
atualizarEstadoBotaoEnviar();

botaoCopiar.addEventListener("click", copiarProtocolo);

function obterStreamDigitado() {
  return String(campoStream.value || "").trim();
}

function streamEstaValidado() {
  return Boolean(
    streamValidado &&
    streamValidado.url === obterStreamDigitado()
  );
}

function atualizarEstadoBotaoEnviar() {
  if (testeStreamEmAndamento) {
    botaoEnviar.disabled = true;
    return;
  }

  botaoEnviar.disabled = !streamEstaValidado();
}

function definirMensagemStream(texto, classe = "aguardando") {
  mensagemStream.textContent = texto;
  mensagemStream.className =
    `cadastro-stream-resultado ${classe}`.trim();
}

function invalidarTesteStream() {
  streamValidado = null;
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

async function testarStream() {
  ocultarAlerta();
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
    urlNormalizada = validarFormatoInicialStream(valor);
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
    "Conectando ao servidor e verificando se o endereço entrega áudio direto...",
    "testando"
  );
  atualizarEstadoBotaoEnviar();

  const controlador = new AbortController();
  const temporizador = window.setTimeout(
    () => controlador.abort(),
    TEMPO_MAXIMO_TESTE_STREAM_MS
  );

  try {
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
        signal: controlador.signal
      }
    );

    let resultado;

    try {
      resultado = await resposta.json();
    } catch {
      resultado = null;
    }

    if (!resposta.ok || !resultado?.ok || !resultado?.compativel) {
      throw new Error(
        resultado?.erro ||
        "O endereço não foi reconhecido como áudio direto compatível."
      );
    }

    streamValidado = {
      url: obterStreamDigitado(),
      formato: resultado.formato || "Áudio",
      contentType: resultado.contentType || ""
    };

    const detalhes = [
      resultado.formato,
      resultado.contentType,
      resultado.redirecionamentos > 0
        ? `${resultado.redirecionamentos} redirecionamento(s) seguro(s)`
        : "HTTPS direto"
    ].filter(Boolean);

    definirMensagemStream(
      `✅ Stream testado e compatível${detalhes.length ? `: ${detalhes.join(" • ")}` : "."}`,
      "sucesso"
    );
  } catch (erro) {
    streamValidado = null;
    campoStream.classList.add("campo-invalido");

    const mensagem = erro?.name === "AbortError"
      ? "O servidor demorou demais para responder. Confirme a URL direta HTTPS com a hospedagem."
      : erro instanceof Error
        ? erro.message
        : "Não foi possível testar o stream agora.";

    definirMensagemStream(mensagem, "erro");
  } finally {
    window.clearTimeout(temporizador);
    testeStreamEmAndamento = false;
    botaoTestarStream.disabled = false;
    botaoTestarStream.textContent = "🔊 Testar transmissão";
    atualizarEstadoBotaoEnviar();
  }
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

  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    destacarCamposInvalidos();
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

  if (!logoValidada) {
    dados.delete("logo");
  }

  botaoEnviar.disabled = true;
  botaoEnviar.textContent = "Enviando...";

  try {
    const resposta = await fetch(
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

function exibirSucesso(resultado) {
  protocoloGerado.textContent = resultado.protocolo;

  observacaoSucesso.textContent = resultado.logoRecebida
    ? "A logomarca foi recebida. O cadastro permanece pendente até a análise administrativa."
    : "Nenhuma logomarca foi enviada. A solicitação continuará pendente até que a emissora complete esse envio pelo sistema.";

  formulario.classList.add("hidden");
  secaoSucesso.classList.remove("hidden");

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
      }
    });
}

function limparErrosCampos() {
  formulario
    .querySelectorAll(".campo-invalido")
    .forEach(campo => {
      campo.classList.remove("campo-invalido");
    });
}

function mostrarAlerta(mensagem) {
  alerta.textContent = mensagem;
  alerta.classList.remove("hidden");
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
