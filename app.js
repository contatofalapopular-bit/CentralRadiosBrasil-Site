"use strict";

const URL_RADIOS =
  "https://raw.githubusercontent.com/contatofalapopular-bit/CentralRadiosBrasil-Dados/main/radios.json";

const CHAVE_FAVORITAS = "central-radios-brasil-favoritas";
const LIMITE_FAVORITAS = 5;

const REGIOES_BRASIL = {
  "Norte": ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
  "Nordeste": ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MT", "MS"],
  "Sudeste": ["ES", "MG", "RJ", "SP"],
  "Sul": ["PR", "RS", "SC"]
};

const elementos = {
  pesquisa: document.getElementById("pesquisa"),
  filtroEstado: document.getElementById("filtro-estado"),
  filtroCategoria: document.getElementById("filtro-categoria"),
  btnLimpar: document.getElementById("btn-limpar"),

  gradeRadios: document.getElementById("grade-radios"),
  mensagemStatus: document.getElementById("mensagem-status"),
  contadorRadios: document.getElementById("contador-radios"),
  secaoFavoritas: document.getElementById("secao-favoritas"),
  gradeFavoritas: document.getElementById("grade-favoritas"),
  contadorFavoritas: document.getElementById("contador-favoritas"),
  gradeRegioes: document.getElementById("grade-regioes"),
  btnLimparRegiao: document.getElementById("btn-limpar-regiao"),

  versaoBanco: document.getElementById("versao-banco"),
  informacaoBanco: document.getElementById("informacao-banco"),

  player: document.getElementById("player"),
  audio: document.getElementById("audio-player"),
  playerLogo: document.getElementById("player-logo"),
  playerNome: document.getElementById("player-nome"),
  playerLocalizacao: document.getElementById("player-localizacao"),
  playerStatus: document.getElementById("player-status"),
  btnPlayPause: document.getElementById("btn-play-pause"),
  btnFecharPlayer: document.getElementById("btn-fechar-player"),

  btnExplorarRadios: document.getElementById("btn-explorar-radios"),
  btnConhecerPlataforma: document.getElementById("btn-conhecer-plataforma"),
  modalPlataforma: document.getElementById("modal-plataforma"),
  btnFecharPlataforma: document.getElementById("btn-fechar-plataforma"),
  btnModalExplorar: document.getElementById("btn-modal-explorar"),
  catalogoLista: document.getElementById("catalogo-lista"),

  radioDestaque: document.getElementById("radio-destaque"),
  destaqueLogo: document.getElementById("destaque-logo"),
  destaqueCategoria: document.getElementById("destaque-categoria"),
  destaqueNome: document.getElementById("destaque-nome"),
  destaqueDescricao: document.getElementById("destaque-descricao"),
  destaqueCidade: document.getElementById("destaque-cidade"),
  destaqueUf: document.getElementById("destaque-uf"),
  btnOuvirDestaque: document.getElementById("btn-ouvir-destaque"),
  btnSiteDestaque: document.getElementById("btn-site-destaque")
};

const estado = {
  banco: null,
  radios: [],
  radiosFiltradas: [],
  radioAtual: null,
  radioDestaque: null,
  favoritas: carregarIdsFavoritos(),
  regiaoSelecionada: "",
  carregandoAudio: false
};

document.addEventListener("DOMContentLoaded", iniciarPortal);

async function iniciarPortal() {
  registrarEventos();
  await carregarBanco();
}

function registrarEventos() {
  elementos.pesquisa.addEventListener("input", aplicarFiltros);
  elementos.filtroEstado.addEventListener("change", () => {
    if (elementos.filtroEstado.value) {
      estado.regiaoSelecionada = "";
      atualizarEstadoVisualRegioes();
    }
    aplicarFiltros();
  });
  elementos.filtroCategoria.addEventListener("change", aplicarFiltros);

  elementos.btnLimpar.addEventListener("click", limparFiltros);
  elementos.btnLimparRegiao?.addEventListener("click", limparFiltroRegiao);
  elementos.gradeRegioes?.addEventListener("click", evento => {
    const botao = evento.target.closest("[data-regiao]");
    if (!botao || botao.disabled) return;
    selecionarRegiao(botao.dataset.regiao || "");
  });

  elementos.btnPlayPause.addEventListener("click", alternarReproducao);
  elementos.btnFecharPlayer.addEventListener("click", fecharPlayer);

  elementos.btnExplorarRadios?.addEventListener("click", irParaCatalogo);
  elementos.btnConhecerPlataforma?.addEventListener("click", abrirModalPlataforma);
  elementos.btnFecharPlataforma?.addEventListener("click", fecharModalPlataforma);
  elementos.btnModalExplorar?.addEventListener("click", () => {
    fecharModalPlataforma();
    irParaCatalogo();
  });

  elementos.btnOuvirDestaque?.addEventListener("click", () => {
    if (estado.radioDestaque) {
      selecionarRadio(estado.radioDestaque, { destacarCard: true });
    }
  });

  elementos.modalPlataforma?.addEventListener("click", evento => {
    if (evento.target === elementos.modalPlataforma) {
      fecharModalPlataforma();
    }
  });

  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !elementos.modalPlataforma?.classList.contains("hidden")) {
      fecharModalPlataforma();
    }
  });

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

function irParaCatalogo() {
  const destino = elementos.catalogoLista || elementos.gradeRadios;

  destino?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function abrirModalPlataforma() {
  if (!elementos.modalPlataforma) {
    return;
  }

  elementos.modalPlataforma.classList.remove("hidden");
  document.body.classList.add("modal-aberto");
  elementos.btnFecharPlataforma?.focus();
}

function fecharModalPlataforma() {
  if (!elementos.modalPlataforma) {
    return;
  }

  elementos.modalPlataforma.classList.add("hidden");
  document.body.classList.remove("modal-aberto");
  elementos.btnConhecerPlataforma?.focus();
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
    atualizarIndicadoresNacionais(banco);
    atualizarRadioDestaque();
    estado.radiosFiltradas = [...estado.radios];

    atualizarInformacoesBanco();
    preencherFiltros();
    renderizarRegioes();
    renderizarRadios();
    renderizarFavoritas();
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

function obterRegiaoPorUf(uf) {
  return Object.entries(REGIOES_BRASIL).find(([, ufs]) => ufs.includes(uf))?.[0] || "";
}

function renderizarRegioes() {
  if (!elementos.gradeRegioes) return;

  const icones = {
    "Norte": "🌿",
    "Nordeste": "☀️",
    "Centro-Oeste": "🌾",
    "Sudeste": "🏙️",
    "Sul": "🧉"
  };

  elementos.gradeRegioes.innerHTML = "";

  Object.keys(REGIOES_BRASIL).forEach(nome => {
    const total = estado.radios.filter(radio =>
      REGIOES_BRASIL[nome].includes(radio.localizacao?.uf)
    ).length;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "card-regiao";
    botao.dataset.regiao = nome;
    botao.disabled = total === 0;
    botao.setAttribute("aria-pressed", "false");
    botao.innerHTML = `
      <span class="regiao-icone" aria-hidden="true">${icones[nome]}</span>
      <span class="regiao-nome">${nome}</span>
      <span class="regiao-total">${total} ${total === 1 ? "emissora" : "emissoras"}</span>
    `;

    elementos.gradeRegioes.appendChild(botao);
  });

  atualizarEstadoVisualRegioes();
}

function selecionarRegiao(nome) {
  if (!REGIOES_BRASIL[nome]) return;

  estado.regiaoSelecionada = estado.regiaoSelecionada === nome ? "" : nome;
  elementos.filtroEstado.value = "";
  atualizarEstadoVisualRegioes();
  aplicarFiltros();

  document.getElementById("catalogo-lista")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function limparFiltroRegiao() {
  estado.regiaoSelecionada = "";
  atualizarEstadoVisualRegioes();
  aplicarFiltros();
}

function atualizarEstadoVisualRegioes() {
  elementos.gradeRegioes?.querySelectorAll("[data-regiao]").forEach(botao => {
    const ativo = botao.dataset.regiao === estado.regiaoSelecionada;
    botao.classList.toggle("ativo", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });

  elementos.btnLimparRegiao?.classList.toggle("hidden", !estado.regiaoSelecionada);
}

function aplicarFiltros() {
  const termo = normalizarTexto(elementos.pesquisa.value);
  const estadoSelecionado = elementos.filtroEstado.value;
  const categoriaSelecionada = elementos.filtroCategoria.value;
  const ufsRegiao = estado.regiaoSelecionada
    ? REGIOES_BRASIL[estado.regiaoSelecionada] || []
    : [];

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

    const correspondeRegiao =
      !estado.regiaoSelecionada ||
      ufsRegiao.includes(radio.localizacao?.uf);

    return (
      correspondePesquisa &&
      correspondeEstado &&
      correspondeCategoria &&
      correspondeRegiao
    );
  });

  renderizarRadios();
}

function limparFiltros() {
  elementos.pesquisa.value = "";
  elementos.filtroEstado.value = "";
  elementos.filtroCategoria.value = "";
  estado.regiaoSelecionada = "";
  atualizarEstadoVisualRegioes();

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
  artigo.dataset.radioId = obterIdRadio(radio);
  artigo.tabIndex = -1;
  artigo.dataset.radioId = radio.id || radio.slug || "";

  if (radio === estado.radioAtual) {
    artigo.classList.add("radio-card-selecionado");
  }

  const topo = document.createElement("div");
  topo.className = "radio-card-topo";

  const logo = criarLogoRadio(radio, "radio-logo");

  const selos = document.createElement("div");
  selos.className = "radio-selos";

  const botaoFavorito = criarBotaoFavorito(radio);

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

  const acoesTopo = document.createElement("div");
  acoesTopo.className = "radio-topo-acoes";
  acoesTopo.append(botaoFavorito, selos);

  topo.append(logo, acoesTopo);

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

function obterIdRadio(radio) {
  return String(
    radio?.id ||
    radio?.slug ||
    radio?.nomeFantasia ||
    radio?.nome ||
    ""
  ).trim();
}

function carregarIdsFavoritos() {
  try {
    const valor = JSON.parse(localStorage.getItem(CHAVE_FAVORITAS) || "[]");
    return Array.isArray(valor)
      ? valor.filter(Boolean).slice(0, LIMITE_FAVORITAS)
      : [];
  } catch {
    return [];
  }
}

function salvarFavoritas() {
  localStorage.setItem(CHAVE_FAVORITAS, JSON.stringify(estado.favoritas));
}

function radioFavorita(radio) {
  return estado.favoritas.includes(obterIdRadio(radio));
}

function criarBotaoFavorito(radio) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "botao-favorito";

  atualizarBotaoFavorito(botao, radio);

  botao.addEventListener("click", evento => {
    evento.stopPropagation();
    alternarFavorita(radio);
  });

  return botao;
}

function atualizarBotaoFavorito(botao, radio) {
  const ativa = radioFavorita(radio);
  const nome = radio.nomeFantasia || radio.nome || "emissora";

  botao.classList.toggle("ativo", ativa);
  botao.textContent = ativa ? "♥" : "♡";
  botao.title = ativa ? "Remover das favoritas" : "Adicionar às favoritas";
  botao.setAttribute("aria-pressed", String(ativa));
  botao.setAttribute(
    "aria-label",
    ativa ? `Remover ${nome} das favoritas` : `Adicionar ${nome} às favoritas`
  );
}

function alternarFavorita(radio) {
  const id = obterIdRadio(radio);

  if (!id) {
    return;
  }

  const indice = estado.favoritas.indexOf(id);

  if (indice >= 0) {
    estado.favoritas.splice(indice, 1);
  } else {
    if (estado.favoritas.length >= LIMITE_FAVORITAS) {
      alert("Você pode salvar até 5 rádios favoritas.");
      return;
    }

    estado.favoritas.push(id);
  }

  salvarFavoritas();
  renderizarRadios();
  renderizarFavoritas();
}

function renderizarFavoritas() {
  if (!elementos.secaoFavoritas || !elementos.gradeFavoritas) {
    return;
  }

  const radiosFavoritas = estado.favoritas
    .map(id => estado.radios.find(radio => obterIdRadio(radio) === id))
    .filter(Boolean);

  const idsValidos = radiosFavoritas.map(obterIdRadio);
  if (idsValidos.length !== estado.favoritas.length) {
    estado.favoritas = idsValidos;
    salvarFavoritas();
  }

  elementos.contadorFavoritas.textContent =
    `${radiosFavoritas.length} de ${LIMITE_FAVORITAS}`;

  elementos.gradeFavoritas.innerHTML = "";

  if (radiosFavoritas.length === 0) {
    elementos.secaoFavoritas.classList.add("hidden");
    return;
  }

  const fragmento = document.createDocumentFragment();
  radiosFavoritas.forEach(radio => {
    fragmento.appendChild(criarCardRadio(radio));
  });

  elementos.gradeFavoritas.appendChild(fragmento);
  elementos.secaoFavoritas.classList.remove("hidden");
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

function atualizarRadioDestaque() {
  if (!elementos.radioDestaque) {
    return;
  }

  const candidatas = estado.radios
    .filter(radio => radio.status?.destaque === true)
    .sort(compararRadiosDestaque);

  const radio = candidatas[0] || null;
  estado.radioDestaque = radio;

  if (!radio) {
    elementos.radioDestaque.classList.add("hidden");
    elementos.radioDestaque.setAttribute("aria-hidden", "true");
    return;
  }

  const nome = radio.nomeFantasia || radio.nome || "Emissora em destaque";
  const categoria = radio.classificacao?.categoriaPrincipal || "Rádio online";
  const descricao = radio.slogan || radio.descricao ||
    "Ouça esta emissora ao vivo na Central Rádios Brasil.";

  elementos.destaqueNome.textContent = nome;
  elementos.destaqueCategoria.textContent = categoria;
  elementos.destaqueDescricao.textContent = descricao;
  elementos.destaqueCidade.textContent = radio.localizacao?.cidade || "Brasil";
  elementos.destaqueUf.textContent = radio.localizacao?.uf || "";

  atualizarLogoDestaque(radio);
  atualizarSiteDestaque(radio);

  elementos.btnOuvirDestaque?.setAttribute(
    "aria-label",
    `Ouvir ${nome} agora`
  );

  elementos.radioDestaque.classList.remove("hidden");
  elementos.radioDestaque.removeAttribute("aria-hidden");
}

function compararRadiosDestaque(a, b) {
  const verificadaA = a.status?.verificada === true ? 1 : 0;
  const verificadaB = b.status?.verificada === true ? 1 : 0;

  if (verificadaA !== verificadaB) {
    return verificadaB - verificadaA;
  }

  const dataA = Date.parse(a.atualizadoEm || a.criadoEm || "") || 0;
  const dataB = Date.parse(b.atualizadoEm || b.criadoEm || "") || 0;

  if (dataA !== dataB) {
    return dataB - dataA;
  }

  const nomeA = a.nomeFantasia || a.nome || "";
  const nomeB = b.nomeFantasia || b.nome || "";

  return nomeA.localeCompare(nomeB, "pt-BR");
}

function atualizarLogoDestaque(radio) {
  if (!elementos.destaqueLogo) {
    return;
  }

  elementos.destaqueLogo.innerHTML = "";

  const urlLogo =
    radio.logo?.original ||
    radio.logo?.quadrada ||
    radio.logo?.miniatura ||
    "";

  if (!urlLogo) {
    elementos.destaqueLogo.textContent = obterIniciais(
      radio.nomeFantasia || radio.nome
    );
    return;
  }

  const imagem = document.createElement("img");
  imagem.src = urlLogo;
  imagem.alt = `Logo da ${radio.nomeFantasia || radio.nome || "emissora"}`;

  imagem.addEventListener("error", () => {
    elementos.destaqueLogo.innerHTML = "";
    elementos.destaqueLogo.textContent = obterIniciais(
      radio.nomeFantasia || radio.nome
    );
  }, { once: true });

  elementos.destaqueLogo.appendChild(imagem);
}

function atualizarSiteDestaque(radio) {
  if (!elementos.btnSiteDestaque) {
    return;
  }

  const site = normalizarUrlExterna(radio.site);

  if (!site) {
    elementos.btnSiteDestaque.classList.add("hidden");
    elementos.btnSiteDestaque.removeAttribute("href");
    return;
  }

  elementos.btnSiteDestaque.href = site;
  elementos.btnSiteDestaque.classList.remove("hidden");
  elementos.btnSiteDestaque.setAttribute(
    "aria-label",
    `Visitar o site da ${radio.nomeFantasia || radio.nome || "emissora"}`
  );
}

function normalizarUrlExterna(valor) {
  const texto = String(valor || "").trim();

  if (!texto) {
    return "";
  }

  try {
    const url = new URL(
      /^https?:\/\//i.test(texto) ? texto : `https://${texto}`
    );

    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function marcarRadioSelecionada(radio) {
  document.querySelectorAll(".radio-card-selecionado").forEach(card => {
    card.classList.remove("radio-card-selecionado");
  });

  const id = radio.id || radio.slug || "";

  if (!id) {
    return;
  }

  document.querySelectorAll(".radio-card").forEach(card => {
    if (card.dataset.radioId === id) {
      card.classList.add("radio-card-selecionado");
    }
  });
}

function revelarRadioNoCatalogo(radio) {
  const id = radio.id || radio.slug || "";
  let card = null;

  document.querySelectorAll(".radio-card").forEach(item => {
    if (!card && item.dataset.radioId === id) {
      card = item;
    }
  });

  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.focus?.({ preventScroll: true });
  }

  window.setTimeout(() => {
    elementos.player?.focus?.({ preventScroll: true });
  }, 500);
}

async function selecionarRadio(radio, opcoes = {}) {
  const stream = obterUrlStream(radio);

  if (!stream) {
    alert("Esta emissora está temporariamente sem transmissão.");
    return;
  }

  estado.radioAtual = radio;
  estado.carregandoAudio = true;

  elementos.player.classList.remove("hidden");

  marcarRadioSelecionada(radio);
  atualizarIdentidadePlayer(radio);

  if (opcoes.destacarCard) {
    revelarRadioNoCatalogo(radio);
  }
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

  document.querySelectorAll(".radio-card-selecionado").forEach(card => {
    card.classList.remove("radio-card-selecionado");
  });

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
function atualizarIndicadoresNacionais(banco) {
  const totais = banco?.totais || {};

  animarNumero(
    "total-emissoras",
    totais.emissoras || 0
  );

  animarNumero(
    "total-estados",
    totais.estados || 0
  );

  animarNumero(
    "total-cidades",
    totais.cidades || 0
  );

  animarNumero(
    "total-verificadas",
    totais.verificadas || 0
  );
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

