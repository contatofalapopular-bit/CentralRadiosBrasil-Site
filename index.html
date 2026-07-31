"use strict";

const URL_RADIOS =
  "https://raw.githubusercontent.com/contatofalapopular-bit/CentralRadiosBrasil-Dados/main/radios.json";

const URL_API =
  "https://broken-bar-45e2.contatofalapopular.workers.dev";

const URL_HERO_FRASES = "hero-frases.json";

const HERO_FRASES_PADRAO = [
  "Descubra rádios de todas as regiões do Brasil.",
  "Encontre novas vozes, cidades e culturas.",
  "Ouça sua cidade onde estiver.",
  "Uma sintonia para cada momento do seu dia.",
  "Conectando ouvintes e emissoras de todo o país.",
  "Sua próxima rádio favorita está aqui."
];

const CHAVE_SESSAO = "centralRadiosBrasilSessaoId";

const elementos = {
  pesquisa: document.getElementById("pesquisa"),
  filtroEstado: document.getElementById("filtro-estado"),
  filtroCategoria: document.getElementById("filtro-categoria"),
  btnLimpar: document.getElementById("btn-limpar"),

  heroFrase: document.getElementById("hero-frase-rotativa"),

  gradeRadios: document.getElementById("grade-radios"),
  mensagemStatus: document.getElementById("mensagem-status"),
  contadorRadios: document.getElementById("contador-radios"),
  paginacaoRadios: document.getElementById("paginacao-radios"),

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
  carregandoAudio: false,
  paginaAtual: 1,
  radiosPorPagina: 12,
  registroPendente: false,
  hero: {
    frases: [...HERO_FRASES_PADRAO],
    indice: 0,
    intervaloId: null,
    intervaloMs: 6000,
    transicaoMs: 450,
    pausadoPorVisibilidade: false
  }
};

document.addEventListener("DOMContentLoaded", iniciarPortal);

async function iniciarPortal() {
  registrarEventos();
  void iniciarHeroRotativo();
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
    registrarReproducaoAtual();
  });

  elementos.audio.addEventListener("error", () => {
    estado.carregandoAudio = false;
    atualizarEstadoPlayer("Não foi possível reproduzir", "▶");
  });
}


async function iniciarHeroRotativo() {
  if (!elementos.heroFrase) return;

  try {
    const resposta = await fetch(URL_HERO_FRASES, {
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const configuracao = await resposta.json();
    aplicarConfiguracaoHero(configuracao);
  } catch (erro) {
    console.warn(
      "Não foi possível carregar hero-frases.json. Usando frases padrão.",
      erro
    );

    estado.hero.frases = [...HERO_FRASES_PADRAO];
  }

  exibirFraseHero(0, false);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  iniciarIntervaloHero();

  document.addEventListener("visibilitychange", controlarVisibilidadeHero);
}

function aplicarConfiguracaoHero(configuracao) {
  if (!configuracao || typeof configuracao !== "object") return;

  const frasesPadrao = normalizarFrases(configuracao.frasesPadrao);
  const fusoHorario = normalizarTexto(configuracao.fusoHorario) ||
    "America/Sao_Paulo";

  const campanhasAtivas = Array.isArray(configuracao.campanhas)
    ? configuracao.campanhas
        .filter(campanha => campanhaEstaAtiva(campanha, fusoHorario))
        .sort((a, b) => numeroSeguro(b.prioridade) - numeroSeguro(a.prioridade))
    : [];

  const campanhaSubstituta = campanhasAtivas.find(
    campanha => normalizarTexto(campanha.modo).toLowerCase() === "substituir"
  );

  let frases = frasesPadrao.length > 0
    ? frasesPadrao
    : [...HERO_FRASES_PADRAO];

  if (campanhaSubstituta) {
    const especiais = normalizarFrases(campanhaSubstituta.frases);

    if (especiais.length > 0) {
      frases = especiais;
    }
  } else {
    const frasesEspeciais = campanhasAtivas.flatMap(
      campanha => normalizarFrases(campanha.frases)
    );

    if (frasesEspeciais.length > 0) {
      frases = [...frasesEspeciais, ...frases];
    }
  }

  estado.hero.frases = removerDuplicadas(frases);

  const intervaloSegundos = numeroSeguro(configuracao.intervaloSegundos);
  const transicaoMs = numeroSeguro(configuracao.transicaoMilissegundos);

  estado.hero.intervaloMs = Math.max(
    3500,
    intervaloSegundos > 0 ? intervaloSegundos * 1000 : 6000
  );

  estado.hero.transicaoMs = Math.min(
    900,
    Math.max(180, transicaoMs > 0 ? transicaoMs : 450)
  );
}

function campanhaEstaAtiva(campanha, fusoHorario) {
  if (!campanha || campanha.ativa !== true) return false;

  const inicio = normalizarTexto(campanha.inicio);
  const fim = normalizarTexto(campanha.fim);

  if (!inicio || !fim) return false;

  const hoje = obterDataNoFuso(fusoHorario);

  if (campanha.anual === true) {
    const hojeMesDia = `${hoje.mes}-${hoje.dia}`;

    if (!/^\d{2}-\d{2}$/.test(inicio) || !/^\d{2}-\d{2}$/.test(fim)) {
      return false;
    }

    return intervaloIncluiValor(hojeMesDia, inicio, fim);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fim)) {
    return false;
  }

  return intervaloIncluiValor(hoje.iso, inicio, fim);
}

function obterDataNoFuso(fusoHorario) {
  try {
    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: fusoHorario,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const mapa = Object.fromEntries(
      partes
        .filter(parte => parte.type !== "literal")
        .map(parte => [parte.type, parte.value])
    );

    return {
      ano: mapa.year,
      mes: mapa.month,
      dia: mapa.day,
      iso: `${mapa.year}-${mapa.month}-${mapa.day}`
    };
  } catch (erro) {
    console.warn("Fuso horário inválido no Hero:", fusoHorario, erro);

    const agora = new Date();
    const ano = String(agora.getFullYear());
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return {
      ano,
      mes,
      dia,
      iso: `${ano}-${mes}-${dia}`
    };
  }
}

function intervaloIncluiValor(valor, inicio, fim) {
  if (inicio <= fim) {
    return valor >= inicio && valor <= fim;
  }

  return valor >= inicio || valor <= fim;
}

function normalizarFrases(lista) {
  if (!Array.isArray(lista)) return [];

  return lista
    .map(item => {
      if (typeof item === "string") return item.trim();

      if (item && typeof item === "object") {
        return normalizarTexto(item.texto);
      }

      return "";
    })
    .filter(frase => frase.length >= 8 && frase.length <= 150);
}

function removerDuplicadas(lista) {
  return [...new Set(lista)];
}

function normalizarTexto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function numeroSeguro(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function iniciarIntervaloHero() {
  pararIntervaloHero();

  if (estado.hero.frases.length < 2) return;

  estado.hero.intervaloId = window.setInterval(
    avancarFraseHero,
    estado.hero.intervaloMs
  );
}

function pararIntervaloHero() {
  if (estado.hero.intervaloId !== null) {
    window.clearInterval(estado.hero.intervaloId);
    estado.hero.intervaloId = null;
  }
}

function controlarVisibilidadeHero() {
  if (document.hidden) {
    estado.hero.pausadoPorVisibilidade = true;
    pararIntervaloHero();
    return;
  }

  if (estado.hero.pausadoPorVisibilidade) {
    estado.hero.pausadoPorVisibilidade = false;
    iniciarIntervaloHero();
  }
}

function avancarFraseHero() {
  const proximoIndice =
    (estado.hero.indice + 1) % estado.hero.frases.length;

  exibirFraseHero(proximoIndice, true);
}

function exibirFraseHero(indice, animar) {
  const frase = estado.hero.frases[indice];

  if (!elementos.heroFrase || !frase) return;

  const trocarTexto = () => {
    elementos.heroFrase.textContent = frase;
    estado.hero.indice = indice;
    elementos.heroFrase.classList.remove("hero-frase-saindo");
    elementos.heroFrase.classList.add("hero-frase-entrando");

    window.setTimeout(() => {
      elementos.heroFrase?.classList.remove("hero-frase-entrando");
    }, estado.hero.transicaoMs);
  };

  if (!animar) {
    trocarTexto();
    return;
  }

  elementos.heroFrase.classList.remove("hero-frase-entrando");
  elementos.heroFrase.classList.add("hero-frase-saindo");

  window.setTimeout(trocarTexto, estado.hero.transicaoMs);
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
    estado.radiosFiltradas = [...estado.radios];

    atualizarInformacoesBanco();
    preencherFiltros();
    renderizarRadios();
    atualizarRadioDestaque();
    atualizarRankingNacional();
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
  estado.paginaAtual = 1;
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
  estado.paginaAtual = 1;
  elementos.pesquisa.value = "";
  elementos.filtroEstado.value = "";
  elementos.filtroCategoria.value = "";

  estado.radiosFiltradas = [...estado.radios];

  renderizarRadios();
  elementos.pesquisa.focus();
}

function renderizarRadios() {
  elementos.gradeRadios.innerHTML = "";
  elementos.paginacaoRadios.innerHTML = "";

  const radios = estado.radiosFiltradas;
  atualizarContador(radios.length);

  if (radios.length === 0) {
    mostrarMensagem(
      "Nenhuma emissora foi encontrada com os filtros selecionados."
    );
    return;
  }

  ocultarMensagem();

  const totalPaginas = Math.max(
    1,
    Math.ceil(radios.length / estado.radiosPorPagina)
  );

  if (estado.paginaAtual > totalPaginas) {
    estado.paginaAtual = totalPaginas;
  }

  const inicio = (estado.paginaAtual - 1) * estado.radiosPorPagina;
  const radiosDaPagina = radios.slice(
    inicio,
    inicio + estado.radiosPorPagina
  );

  const fragmento = document.createDocumentFragment();

  radiosDaPagina.forEach(radio => {
    fragmento.appendChild(criarCardRadio(radio));
  });

  elementos.gradeRadios.appendChild(fragmento);
  renderizarPaginacao(totalPaginas);
}

function renderizarPaginacao(totalPaginas) {
  if (totalPaginas <= 1) {
    return;
  }

  const criarBotao = (texto, pagina, classe = "") => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = `botao-pagina ${classe}`.trim();
    botao.textContent = texto;
    botao.disabled = pagina === estado.paginaAtual && classe !== "navegacao";

    if (pagina === estado.paginaAtual && classe !== "navegacao") {
      botao.classList.add("ativo");
      botao.setAttribute("aria-current", "page");
    }

    botao.addEventListener("click", () => {
      estado.paginaAtual = pagina;
      renderizarRadios();
      document.querySelector(".catalogo")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

    return botao;
  };

  const anterior = criarBotao(
    "← Anterior",
    Math.max(1, estado.paginaAtual - 1),
    "navegacao"
  );
  anterior.disabled = estado.paginaAtual === 1;
  elementos.paginacaoRadios.appendChild(anterior);

  const janelaInicio = Math.max(1, estado.paginaAtual - 2);
  const janelaFim = Math.min(totalPaginas, janelaInicio + 4);
  const inicioAjustado = Math.max(1, janelaFim - 4);

  for (let pagina = inicioAjustado; pagina <= janelaFim; pagina += 1) {
    elementos.paginacaoRadios.appendChild(
      criarBotao(String(pagina), pagina)
    );
  }

  const proxima = criarBotao(
    "Próxima →",
    Math.min(totalPaginas, estado.paginaAtual + 1),
    "navegacao"
  );
  proxima.disabled = estado.paginaAtual === totalPaginas;
  elementos.paginacaoRadios.appendChild(proxima);
}

function criarCardRadio(radio) {
  const artigo = document.createElement("article");
  artigo.className = "radio-card radio-card-compacto";
  artigo.tabIndex = 0;
  artigo.setAttribute("role", "button");

  const nome = radio.nomeFantasia || radio.nome || "Emissora";
  artigo.setAttribute("aria-label", `Ouvir ${nome}`);
  artigo.title = `Ouvir ${nome}`;

  const logo = criarLogoRadio(radio, "radio-logo");

  const selos = document.createElement("div");
  selos.className = "radio-selos";

  const seloAoVivo = document.createElement("span");
  seloAoVivo.className = "radio-selo radio-selo-ao-vivo";
  seloAoVivo.textContent = "No ar";
  selos.appendChild(seloAoVivo);

  if (radio.status?.verificada === true) {
    const seloVerificada = document.createElement("span");
    seloVerificada.className = "radio-selo radio-selo-verificada";
    seloVerificada.textContent = "Verificada";
    selos.appendChild(seloVerificada);
  }

  const categoria = document.createElement("span");
  categoria.className = "radio-categoria";
  categoria.textContent =
    radio.classificacao?.categoriaPrincipal || "Rádio online";

  artigo.append(logo, selos, categoria);

  const ouvir = () => selecionarRadio(radio);
  artigo.addEventListener("click", ouvir);
  artigo.addEventListener("keydown", evento => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      ouvir();
    }
  });

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


function obterSessaoId() {
  try {
    let sessaoId = localStorage.getItem(CHAVE_SESSAO);

    if (sessaoId) {
      return sessaoId;
    }

    sessaoId =
      typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : `sessao-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 14)}`;

    localStorage.setItem(CHAVE_SESSAO, sessaoId);
    return sessaoId;
  } catch (erro) {
    console.warn("Não foi possível persistir a sessão:", erro);

    return `sessao-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 14)}`;
  }
}

function obterRadioId(radio) {
  const candidato =
    radio?.id ||
    radio?.radioId ||
    radio?.slug ||
    radio?.codigo;

  if (typeof candidato === "string" && candidato.trim()) {
    return candidato.trim();
  }

  const nome =
    radio?.nomeFantasia ||
    radio?.nome ||
    "radio";

  const cidade = radio?.localizacao?.cidade || "brasil";
  const uf = radio?.localizacao?.uf || "br";

  return normalizarTexto(`${nome}-${cidade}-${uf}`)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function registrarReproducaoAtual() {
  if (!estado.radioAtual || estado.registroPendente) {
    return;
  }

  const radioId = obterRadioId(estado.radioAtual);

  if (!radioId) {
    console.warn("A rádio atual não possui identificador válido.");
    return;
  }

  estado.registroPendente = true;

  try {
    const resposta = await fetch(`${URL_API}/api/play`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        radioId,
        sessaoId: obterSessaoId(),
        origem: "PWA",
        cidade: estado.radioAtual?.localizacao?.cidade || "",
        estado: estado.radioAtual?.localizacao?.uf || ""
      }),
      keepalive: true
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const resultado = await resposta.json();

    console.info(
      resultado.contabilizado
        ? "Reprodução contabilizada."
        : "Reprodução já contabilizada recentemente.",
      resultado
    );

    if (resultado.contabilizado) {
      atualizarRankingNacional();
    }
  } catch (erro) {
    // A indisponibilidade das estatísticas nunca interrompe o áudio.
    console.warn("Não foi possível registrar a reprodução:", erro);
  } finally {
    estado.registroPendente = false;
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


function atualizarRadioDestaque(){
 const sec=document.getElementById("radio-destaque");
 if(!sec||!estado.radios)return;
 const radio=estado.radios.find(r=>r.status&&r.status.destaque);
 if(!radio){sec.classList.add("hidden");return;}
 sec.classList.remove("hidden");
 document.getElementById("destaque-categoria").textContent=radio.categoria||"";
 document.getElementById("destaque-nome").textContent=radio.nome||"";
 document.getElementById("destaque-descricao").textContent=radio.descricao||radio.slogan||"Ouça esta emissora em destaque.";
 document.getElementById("destaque-cidade").textContent=radio.cidade||"";
 document.getElementById("destaque-uf").textContent=radio.uf||"";
 const logo=document.getElementById("destaque-logo");
 if(radio.logo){logo.innerHTML=`<img src="${radio.logo}" alt="${radio.nome}">`;}else{logo.textContent=(radio.nome||'CR').split(' ').map(x=>x[0]).join('').slice(0,3).toUpperCase();}
 document.getElementById("btn-ouvir-destaque").onclick=()=>selecionarRadio(radio);
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


/* =========================================================
   RANKING NACIONAL — VERSÃO 22.3.5
========================================================= */

const rankingDemonstracao = [
  {
    id: "demo-fala-popular",
    nome: "Rádio Fala Popular",
    categoria: "Sertanejo",
    ouvintesRanking: 18452,
    logoRanking: "logo-central-radios-brasil.jpeg.jpeg",
    demonstrativa: true
  },
  {
    id: "demo-radio-cidade",
    nome: "Rádio Cidade",
    categoria: "Pop",
    ouvintesRanking: 16980,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-radio-brasil",
    nome: "Rádio Brasil",
    categoria: "Jornalismo",
    ouvintesRanking: 15770,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-nacional-mix",
    nome: "Rádio Nacional Mix",
    categoria: "Variedades",
    ouvintesRanking: 14920,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-goias-central",
    nome: "Rádio Goiás Central",
    categoria: "Sertanejo",
    ouvintesRanking: 13860,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-popular-hits",
    nome: "Rádio Popular Hits",
    categoria: "Pop",
    ouvintesRanking: 12440,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-brasil-sertanejo",
    nome: "Rádio Brasil Sertanejo",
    categoria: "Sertanejo",
    ouvintesRanking: 11980,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-noticias-24h",
    nome: "Rádio Notícias 24h",
    categoria: "Jornalismo",
    ouvintesRanking: 10750,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-gospel-brasil",
    nome: "Rádio Gospel Brasil",
    categoria: "Gospel",
    ouvintesRanking: 9820,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-esportes-central",
    nome: "Rádio Esportes Central",
    categoria: "Esportes",
    ouvintesRanking: 8940,
    logoRanking: "",
    demonstrativa: true
  }
];

const rankingMedalhas = ["🥇", "🥈", "🥉"];
const rankingClasses = ["ranking-card-ouro", "ranking-card-prata", "ranking-card-bronze"];
let rankingAtual = [];
let rankingEventosRegistrados = false;

function obterNumeroOuvintes(radio) {
  const candidatos = [
    radio?.estatisticas?.ouvintes,
    radio?.estatisticas?.ouvintesAtuais,
    radio?.estatisticas?.totalOuvintes,
    radio?.metricas?.ouvintes,
    radio?.ranking?.ouvintes,
    radio?.ouvintes
  ];

  for (const valor of candidatos) {
    const numero = Number(valor);
    if (Number.isFinite(numero) && numero >= 0) {
      return numero;
    }
  }

  return 0;
}

function normalizarRadioRanking(radio) {
  return {
    ...radio,
    nome: radio.nomeFantasia || radio.nome || "Emissora",
    categoria: radio.classificacao?.categoriaPrincipal || radio.categoria || "Rádio online",
    ouvintesRanking: obterNumeroOuvintes(radio),
    logoRanking:
      radio.logo?.miniatura ||
      radio.logo?.quadrada ||
      radio.logo?.original ||
      radio.logoRanking ||
      "",
    demonstrativa: false
  };
}

function localizarRadioPorId(radioId) {
  return estado.radios.find(
    radio => obterRadioId(radio) === radioId
  ) || null;
}

async function carregarRankingReal() {
  const resposta = await fetch(
    `${URL_API}/api/ranking?periodo=mes&limit=10`,
    {
      method: "GET",
      cache: "no-store"
    }
  );

  if (!resposta.ok) {
    throw new Error(`Erro HTTP ${resposta.status}`);
  }

  const dados = await resposta.json();

  if (!dados?.ok || !Array.isArray(dados.ranking)) {
    throw new Error("Resposta inválida da API de ranking.");
  }

  return dados.ranking
    .map(item => {
      const radio = localizarRadioPorId(item.radioId);

      if (!radio) {
        console.warn(
          "Rádio do ranking não encontrada no catálogo:",
          item.radioId
        );
        return null;
      }

      return {
        ...normalizarRadioRanking(radio),
        ouvintesRanking: Number(item.ouvintes || 0),
        posicaoRanking: Number(item.posicao || 0)
      };
    })
    .filter(Boolean);
}

function criarLogoRanking(radio, classe) {
  const logo = document.createElement("div");
  logo.className = classe;

  if (radio.logoRanking) {
    const imagem = document.createElement("img");
    imagem.src = radio.logoRanking;
    imagem.alt = `Logo da ${radio.nome}`;
    imagem.loading = "lazy";
    imagem.addEventListener("error", () => {
      logo.replaceChildren();
      logo.textContent = obterIniciais(radio.nome);
    });
    logo.appendChild(imagem);
  } else {
    logo.textContent = obterIniciais(radio.nome);
  }

  return logo;
}

function formatarOuvintesRanking(valor) {
  return new Intl.NumberFormat("pt-BR").format(Number(valor) || 0);
}

function acionarRadioRanking(radio) {
  selecionarRadio(radio);
}

function criarCardRanking(radio, indice) {
  const card = document.createElement("article");
  card.className =
    `ranking-card ${rankingClasses[indice] || "ranking-card-padrao"}`;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `${indice + 1}º lugar: ${radio.nome}`);

  const topo = document.createElement("div");
  topo.className = "ranking-card-topo";

  const vivo = document.createElement("span");
  vivo.className = "ranking-status-vivo";
  vivo.textContent = "AO VIVO";

  const medalha = document.createElement("span");
  medalha.className = "ranking-medalha";
  medalha.textContent =
    rankingMedalhas[indice] || `${indice + 1}º`;
  medalha.setAttribute("aria-hidden", "true");

  topo.append(vivo, medalha);

  const logo = criarLogoRanking(radio, "ranking-logo");

  const nome = document.createElement("h3");
  nome.textContent = radio.nome;

  const segmento = document.createElement("span");
  segmento.className = "ranking-segmento";
  segmento.textContent = radio.categoria;

  const ouvintes = document.createElement("span");
  ouvintes.className = "ranking-ouvintes";
  ouvintes.textContent =
    `🎧 ${formatarOuvintesRanking(radio.ouvintesRanking)} ` +
    `${Number(radio.ouvintesRanking) === 1 ? "ouvinte" : "ouvintes"}`;

  card.append(topo, logo, nome, segmento, ouvintes);

  const abrir = () => acionarRadioRanking(radio);
  card.addEventListener("click", abrir);
  card.addEventListener("keydown", evento => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      abrir();
    }
  });

  return card;
}

function criarLinhaRanking(radio, indice) {
  const item = document.createElement("li");
  item.className =
    `ranking-top10-item ${rankingClasses[indice] || "ranking-card-padrao"}`;
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  item.setAttribute(
    "aria-label",
    `${indice + 1}º lugar: ${radio.nome}`
  );

  const topo = document.createElement("div");
  topo.className = "ranking-card-topo";

  const vivo = document.createElement("span");
  vivo.className = "ranking-status-vivo";
  vivo.textContent = "AO VIVO";

  const posicao = document.createElement("span");
  posicao.className = "ranking-top10-posicao";
  posicao.textContent =
    indice < 3 ? rankingMedalhas[indice] : `${indice + 1}º`;

  topo.append(vivo, posicao);

  const logo = criarLogoRanking(radio, "ranking-top10-logo");

  const nome = document.createElement("strong");
  nome.className = "ranking-top10-nome";
  nome.textContent = radio.nome;

  const categoria = document.createElement("span");
  categoria.className = "ranking-top10-categoria";
  categoria.textContent = radio.categoria;

  const ouvintes = document.createElement("span");
  ouvintes.className = "ranking-top10-ouvintes";
  ouvintes.textContent =
    `🎧 ${formatarOuvintesRanking(radio.ouvintesRanking)} ` +
    `${Number(radio.ouvintesRanking) === 1 ? "ouvinte" : "ouvintes"}`;

  item.append(topo, logo, nome, categoria, ouvintes);

  const abrir = () => acionarRadioRanking(radio);
  item.addEventListener("click", abrir);
  item.addEventListener("keydown", evento => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      abrir();
    }
  });

  return item;
}

function registrarEventosRanking() {
  if (rankingEventosRegistrados) return;

  const modal = document.getElementById("ranking-modal");
  const abrir = document.getElementById("btn-ranking-top10");
  const fechar = document.getElementById("btn-fechar-ranking");

  if (!modal || !abrir || !fechar) return;

  const abrirModal = () => {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    fechar.focus();
  };

  const fecharModal = () => {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    abrir.focus();
  };

  abrir.addEventListener("click", abrirModal);
  fechar.addEventListener("click", fecharModal);
  modal.addEventListener("click", evento => {
    if (evento.target === modal) fecharModal();
  });
  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !modal.classList.contains("hidden")) {
      fecharModal();
    }
  });

  rankingEventosRegistrados = true;
}

async function atualizarRankingNacional() {
  const top3 = document.getElementById("ranking-nacional-top3");
  const top10 = document.getElementById("ranking-top10-lista");
  const botaoTop10 = document.getElementById("btn-ranking-top10");

  if (!top3 || !top10) return;

  top3.innerHTML =
    '<div class="ranking-carregando">Carregando ranking real...</div>';
  top10.replaceChildren();

  try {
    rankingAtual = await carregarRankingReal();

    if (rankingAtual.length === 0) {
      top3.innerHTML =
        '<div class="ranking-carregando">O ranking começará a aparecer conforme as emissoras receberem reproduções.</div>';

      if (botaoTop10) {
        botaoTop10.disabled = true;
      }

      registrarEventosRanking();
      return;
    }

    top3.replaceChildren(
      ...rankingAtual.slice(0, 5).map(criarCardRanking)
    );

    top10.replaceChildren(
      ...rankingAtual.slice(0, 10).map(criarLinhaRanking)
    );

    if (botaoTop10) {
      botaoTop10.disabled = false;
    }
  } catch (erro) {
    console.error("Erro ao carregar o ranking real:", erro);

    rankingAtual = [];
    top3.innerHTML =
      '<div class="ranking-carregando">Não foi possível carregar o ranking agora.</div>';

    if (botaoTop10) {
      botaoTop10.disabled = true;
    }
  }

  registrarEventosRanking();
}
