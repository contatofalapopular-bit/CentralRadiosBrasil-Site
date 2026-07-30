"use strict";

const URL_RADIOS =
  "https://raw.githubusercontent.com/contatofalapopular-bit/CentralRadiosBrasil-Dados/main/radios.json";

const elementos = {
  pesquisa: document.getElementById("pesquisa"),
  filtroEstado: document.getElementById("filtro-estado"),
  filtroCategoria: document.getElementById("filtro-categoria"),
  btnLimpar: document.getElementById("btn-limpar"),

  gradeRadios: document.getElementById("grade-radios"),
  mensagemStatus: document.getElementById("mensagem-status"),
  contadorRadios: document.getElementById("contador-radios"),

  versaoBanco: document.getElementById("versao-banco"),
  informacaoBanco: document.getElementById("informacao-banco"),

  player: document.getElementById("player"),
  audio: document.getElementById("audio-player"),
  playerLogo: document.getElementById("player-logo"),
  playerNome: document.getElementById("player-nome"),
  playerLocalizacao: document.getElementById("player-localizacao"),
  playerStatus: document.getElementById("player-status"),
  btnPlayPause: document.getElementById("btn-play-pause"),
  btnFecharPlayer: document.getElementById("btn-fechar-player")
};

const estado = {
  banco: null,
  radios: [],
  radiosFiltradas: [],
  radioAtual: null,
  carregandoAudio: false
};

document.addEventListener("DOMContentLoaded", iniciarPortal);

async function iniciarPortal() {
  registrarEventos();
  await carregarBanco();
}

function registrarEventos() {
  elementos.pesquisa.addEventListener("input", aplicarFiltros);
  elementos.filtroEstado.addEventListener("change", aplicarFiltros);
  elementos.filtroCategoria.addEventListener("change", aplicarFiltros);

  elementos.btnLimpar.addEventListener("click", limparFiltros);

  elementos.btnPlayPause.addEventListener("click", alternarReproducao);
  elementos.btnFecharPlayer.addEventListener("click", fecharPlayer);

  elementos.audio.addEventListener("play", () => {
    estado.carregandoAudio = false;
    atualizarEstadoPlayer("AO VIVO", "⏸");
  });

  elementos.audio.addEventListener("pause", () => {
    if (!estado.carregandoAudio) {
      atualizarEstadoPlayer("Transmissão pausada", "▶");
    }
  });

  elementos.audio.addEventListener("waiting", () => {
    estado.carregandoAudio = true;
    atualizarEstadoPlayer("Conectando...", "…");
  });

  elementos.audio.addEventListener("playing", () => {
    estado.carregandoAudio = false;
    atualizarEstadoPlayer("AO VIVO", "⏸");
  });

  elementos.audio.addEventListener("error", () => {
    estado.carregandoAudio = false;
    atualizarEstadoPlayer("Não foi possível reproduzir", "▶");
  });
}

async function carregarBanco() {
  mostrarMensagem("Carregando emissoras...");

  try {
    const resposta = await fetch(URL_RADIOS, {
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const banco = await resposta.json();

    validarBanco(banco);

    estado.banco = banco;

    estado.radios = banco.radios.filter(radioPublicaAtiva);
    atualizarIndicadoresNacionais(estado.radios);
    estado.radiosFiltradas = [...estado.radios];

    atualizarInformacoesBanco();
    preencherFiltros();
    renderizarRadios();
  } catch (erro) {
    console.error("Erro ao carregar o banco:", erro);

    elementos.versaoBanco.textContent = "Banco indisponível";

    mostrarMensagem(
      "Não foi possível carregar as emissoras agora. Verifique sua conexão e tente novamente."
    );

    atualizarContador(0);
  }
}

function validarBanco(banco) {
  if (!banco || typeof banco !== "object") {
    throw new Error("Banco inválido.");
  }

  if (!Array.isArray(banco.radios)) {
    throw new Error("A lista de rádios não foi encontrada.");
  }
}

function radioPublicaAtiva(radio) {
  return (
    radio &&
    radio.statusCadastro === "publicada" &&
    radio.status?.ativa === true &&
    radio.status?.publica === true &&
    obterUrlStream(radio)
  );
}

function obterUrlStream(radio) {
  if (radio?.streamPrincipal?.url) {
    return radio.streamPrincipal.url.trim();
  }

  if (!Array.isArray(radio?.streams)) {
    return "";
  }

  const principal = radio.streams.find(
    stream => stream?.principal === true && stream?.url
  );

  if (principal) {
    return principal.url.trim();
  }

  const primeiroValido = radio.streams.find(stream => stream?.url);

  return primeiroValido?.url?.trim() || "";
}

function atualizarInformacoesBanco() {
  const versao =
    estado.banco.datasetVersion ||
    estado.banco.schemaVersion ||
    estado.banco.catalogo?.versaoPainel ||
    "não informada";

  elementos.versaoBanco.textContent = `Banco ${versao}`;

  const total = estado.radios.length;
  const data = formatarData(estado.banco.generatedAt);

  elementos.informacaoBanco.textContent =
    `${total} ${total === 1 ? "emissora publicada" : "emissoras publicadas"}` +
    (data ? ` • Atualizado em ${data}` : "");
}

function formatarData(valor) {
  if (!valor) {
    return "";
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(data);
}

function preencherFiltros() {
  const estados = [...new Set(
    estado.radios
      .map(radio => radio.localizacao?.uf)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const categorias = [...new Set(
    estado.radios.flatMap(radio => {
      const lista = radio.classificacao?.categorias;

      if (Array.isArray(lista) && lista.length > 0) {
        return lista;
      }

      const principal = radio.classificacao?.categoriaPrincipal;
      return principal ? [principal] : [];
    })
  )].sort((a, b) => a.localeCompare(b, "pt-BR"));

  preencherSelect(
    elementos.filtroEstado,
    estados,
    "Todos os estados"
  );

  preencherSelect(
    elementos.filtroCategoria,
    categorias,
    "Todas as categorias"
  );
}

function preencherSelect(select, valores, textoInicial) {
  select.innerHTML = "";

  const opcaoInicial = document.createElement("option");
  opcaoInicial.value = "";
  opcaoInicial.textContent = textoInicial;

  select.appendChild(opcaoInicial);

  valores.forEach(valor => {
    const opcao = document.createElement("option");
    opcao.value = valor;
    opcao.textContent = valor;
    select.appendChild(opcao);
  });
}

function aplicarFiltros() {
  const termo = normalizarTexto(elementos.pesquisa.value);
  const estadoSelecionado = elementos.filtroEstado.value;
  const categoriaSelecionada = elementos.filtroCategoria.value;

  estado.radiosFiltradas = estado.radios.filter(radio => {
    const categorias = obterCategorias(radio);

    const textoPesquisa = normalizarTexto([
      radio.nome,
      radio.nomeFantasia,
      radio.slogan,
      radio.descricao,
      radio.localizacao?.cidade,
      radio.localizacao?.uf,
      radio.localizacao?.pais,
      radio.classificacao?.categoriaPrincipal,
      ...categorias,
      ...(radio.classificacao?.tags || [])
    ].filter(Boolean).join(" "));

    const correspondePesquisa =
      !termo || textoPesquisa.includes(termo);

    const correspondeEstado =
      !estadoSelecionado ||
      radio.localizacao?.uf === estadoSelecionado;

    const correspondeCategoria =
      !categoriaSelecionada ||
      categorias.includes(categoriaSelecionada);

    return (
      correspondePesquisa &&
      correspondeEstado &&
      correspondeCategoria
    );
  });

  renderizarRadios();
}

function limparFiltros() {
  elementos.pesquisa.value = "";
  elementos.filtroEstado.value = "";
  elementos.filtroCategoria.value = "";

  estado.radiosFiltradas = [...estado.radios];

  renderizarRadios();
  elementos.pesquisa.focus();
}

function renderizarRadios() {
  elementos.gradeRadios.innerHTML = "";

  const radios = estado.radiosFiltradas;

  atualizarContador(radios.length);

  if (radios.length === 0) {
    mostrarMensagem(
      "Nenhuma emissora foi encontrada com os filtros selecionados."
    );

    return;
  }

  ocultarMensagem();

  const fragmento = document.createDocumentFragment();

  radios.forEach(radio => {
    fragmento.appendChild(criarCardRadio(radio));
  });

  elementos.gradeRadios.appendChild(fragmento);
}

function criarCardRadio(radio) {
  const artigo = document.createElement("article");
  artigo.className = "radio-card";

  const topo = document.createElement("div");
  topo.className = "radio-card-topo";

  const logo = criarLogoRadio(radio, "radio-logo");

  const selos = document.createElement("div");
  selos.className = "radio-selos";

  const seloAoVivo = document.createElement("span");
  seloAoVivo.className = "radio-selo radio-selo-ao-vivo";
  seloAoVivo.textContent = "No ar";

  selos.appendChild(seloAoVivo);

  if (radio.status?.verificada === true) {
    const seloVerificada = document.createElement("span");
    seloVerificada.className =
      "radio-selo radio-selo-verificada";
    seloVerificada.textContent = "Verificada";

    selos.appendChild(seloVerificada);
  }

  topo.append(logo, selos);

  const corpo = document.createElement("div");
  corpo.className = "radio-card-corpo";

  const categoria = document.createElement("span");
  categoria.className = "radio-categoria";
  categoria.textContent =
    radio.classificacao?.categoriaPrincipal ||
    "Rádio online";

  const titulo = document.createElement("h3");
  titulo.textContent =
    radio.nomeFantasia ||
    radio.nome ||
    "Emissora";

  const slogan = document.createElement("p");
  slogan.className = "radio-slogan";
  slogan.textContent =
    radio.slogan ||
    radio.descricao ||
    "Ouça esta emissora na Central Rádios Brasil.";

  const localizacao = document.createElement("div");
  localizacao.className = "radio-localizacao";
  localizacao.textContent = montarLocalizacao(radio);

  const rodape = document.createElement("div");
  rodape.className = "radio-card-rodape";

  const botaoOuvir = document.createElement("button");
  botaoOuvir.className = "botao-ouvir";
  botaoOuvir.type = "button";
  botaoOuvir.textContent = "Ouvir agora";

  botaoOuvir.addEventListener("click", () => {
    selecionarRadio(radio);
  });

  const botaoCompartilhar = document.createElement("button");
  botaoCompartilhar.className = "botao-card-secundario";
  botaoCompartilhar.type = "button";
  botaoCompartilhar.textContent = "↗";
  botaoCompartilhar.title = "Compartilhar emissora";
  botaoCompartilhar.setAttribute(
    "aria-label",
    `Compartilhar ${titulo.textContent}`
  );

  botaoCompartilhar.addEventListener("click", () => {
    compartilharRadio(radio);
  });

  rodape.append(botaoOuvir, botaoCompartilhar);

  corpo.append(
    categoria,
    titulo,
    slogan,
    localizacao,
    rodape
  );

  artigo.append(topo, corpo);

  return artigo;
}

function criarLogoRadio(radio, classe) {
  const container = document.createElement("div");
  container.className = classe;

  const urlLogo =
    radio.logo?.miniatura ||
    radio.logo?.quadrada ||
    radio.logo?.original ||
    "";

  if (urlLogo) {
    const imagem = document.createElement("img");

    imagem.src = urlLogo;
    imagem.alt = `Logo da ${radio.nome || "emissora"}`;
    imagem.loading = "lazy";

    imagem.addEventListener("error", () => {
      container.innerHTML = "";
      container.textContent = obterIniciais(radio.nome);
    });

    container.appendChild(imagem);
  } else {
    container.textContent = obterIniciais(radio.nome);
  }

  return container;
}

function obterIniciais(nome) {
  const palavras = String(nome || "CRB")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter(palavra =>
      !["rádio", "radio", "fm", "am"].includes(
        palavra.toLocaleLowerCase("pt-BR")
      )
    );

  const iniciais = palavras
    .slice(0, 2)
    .map(palavra => palavra.charAt(0))
    .join("")
    .toUpperCase();

  return iniciais || "CRB";
}

function obterCategorias(radio) {
  const categorias = radio.classificacao?.categorias;

  if (Array.isArray(categorias) && categorias.length > 0) {
    return categorias;
  }

  const principal = radio.classificacao?.categoriaPrincipal;

  return principal ? [principal] : [];
}

function montarLocalizacao(radio) {
  const cidade = radio.localizacao?.cidade;
  const uf = radio.localizacao?.uf;

  if (cidade && uf) {
    return `${cidade} — ${uf}`;
  }

  return cidade || uf || "Brasil";
}

async function selecionarRadio(radio) {
  const stream = obterUrlStream(radio);

  if (!stream) {
    alert("Esta emissora está temporariamente sem transmissão.");
    return;
  }

  estado.radioAtual = radio;
  estado.carregandoAudio = true;

  elementos.player.classList.remove("hidden");

  atualizarIdentidadePlayer(radio);
  atualizarEstadoPlayer("Conectando...", "…");

  elementos.audio.pause();
  elementos.audio.src = stream;
  elementos.audio.load();

  try {
    await elementos.audio.play();
  } catch (erro) {
    estado.carregandoAudio = false;

    console.error("Falha ao iniciar a transmissão:", erro);

    atualizarEstadoPlayer(
      "Toque no botão para iniciar",
      "▶"
    );
  }
}

function atualizarIdentidadePlayer(radio) {
  elementos.playerNome.textContent =
    radio.nomeFantasia ||
    radio.nome ||
    "Emissora";

  elementos.playerLocalizacao.textContent =
    `${montarLocalizacao(radio)} • ` +
    `${radio.classificacao?.categoriaPrincipal || "Rádio online"}`;

  const novoLogo = criarLogoRadio(radio, "player-logo");

  elementos.playerLogo.replaceWith(novoLogo);
  novoLogo.id = "player-logo";
  elementos.playerLogo = novoLogo;
}

async function alternarReproducao() {
  if (!estado.radioAtual) {
    return;
  }

  if (elementos.audio.paused) {
    try {
      estado.carregandoAudio = true;
      atualizarEstadoPlayer("Conectando...", "…");

      await elementos.audio.play();
    } catch (erro) {
      estado.carregandoAudio = false;

      console.error("Falha ao reproduzir:", erro);

      atualizarEstadoPlayer(
        "Não foi possível reproduzir",
        "▶"
      );
    }

    return;
  }

  elementos.audio.pause();
}

function fecharPlayer() {
  elementos.audio.pause();
  elementos.audio.removeAttribute("src");
  elementos.audio.load();

  estado.radioAtual = null;
  estado.carregandoAudio = false;

  elementos.player.classList.add("hidden");
}

function atualizarEstadoPlayer(texto, simboloBotao) {
  elementos.playerStatus.textContent = texto;
  elementos.btnPlayPause.textContent = simboloBotao;

  elementos.btnPlayPause.setAttribute(
    "aria-label",
    simboloBotao === "⏸"
      ? "Pausar rádio"
      : "Reproduzir rádio"
  );
}

async function compartilharRadio(radio) {
  const nome =
    radio.nomeFantasia ||
    radio.nome ||
    "esta emissora";

  const dados = {
    title: nome,
    text: `Ouça ${nome} na Central Rádios Brasil.`,
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(dados);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);

    alert("Link do Portal copiado.");
  } catch (erro) {
    if (erro?.name !== "AbortError") {
      console.error("Erro ao compartilhar:", erro);
    }
  }
}

function mostrarMensagem(texto) {
  elementos.mensagemStatus.textContent = texto;
  elementos.mensagemStatus.classList.remove("hidden");
}

function ocultarMensagem() {
  elementos.mensagemStatus.classList.add("hidden");
}

function atualizarContador(total) {
  elementos.contadorRadios.textContent =
    `${total} ${total === 1 ? "emissora" : "emissoras"}`;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}
function atualizarIndicadoresNacionais(radios) {
  const lista = Array.isArray(radios) ? radios : [];

  const estados = new Set();
  const cidades = new Set();

  let totalVerificadas = 0;

  lista.forEach((radio) => {

    const estado = (radio.estado || "").trim();
    const cidade = (radio.cidade || "").trim();

    if (estado) estados.add(estado);

    if (cidade) {
      cidades.add(cidade + estado);
    }

    if (radio.verificada === true) {
      totalVerificadas++;
    }

  });

  animarNumero("total-emissoras", lista.length);
  animarNumero("total-estados", estados.size);
  animarNumero("total-cidades", cidades.size);
  animarNumero("total-verificadas", totalVerificadas);
}

function animarNumero(id, valorFinal) {

  const elemento = document.getElementById(id);

  if (!elemento) return;

  const inicio = 0;
  const duracao = 800;
  const tempoInicial = performance.now();

  function atualizar(tempo) {

    const progresso = Math.min((tempo - tempoInicial) / duracao, 1);

    elemento.textContent = Math.round(
      inicio + (valorFinal - inicio) * progresso
    );

    if (progresso < 1) {
      requestAnimationFrame(atualizar);
    }

  }

  requestAnimationFrame(atualizar);

}
