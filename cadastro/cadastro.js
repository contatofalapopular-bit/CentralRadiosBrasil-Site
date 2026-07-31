"use strict";

const URL_API_CADASTRO =
  "https://broken-bar-45e2.contatofalapopular.workers.dev";

const LIMITE_LOGO_BYTES = 2 * 1024 * 1024;
const RESOLUCAO_MINIMA_LOGO = 512;
const RESOLUCAO_MAXIMA_LOGO = 4096;

const formulario = document.getElementById(
  "form-cadastro-emissora"
);

const campoLogo = document.getElementById("logo");
const previewLogo = document.getElementById("logo-preview");
const mensagemLogo = document.getElementById("mensagem-logo");
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

campoDescricao.addEventListener("input", () => {
  contadorDescricao.textContent =
    `${campoDescricao.value.length}/600`;
});

campoLogo.addEventListener("change", validarLogoSelecionada);

formulario.addEventListener("submit", enviarCadastro);

botaoCopiar.addEventListener("click", copiarProtocolo);

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
    botaoEnviar.disabled = false;
    botaoEnviar.textContent = "Enviar para análise";
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
