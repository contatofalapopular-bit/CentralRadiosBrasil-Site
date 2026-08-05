"use strict";

const URL_RADIOS =
  "https://raw.githubusercontent.com/contatofalapopular-bit/CentralRadiosBrasil-Dados/main/radios.json";

const URL_API =
  "https://broken-bar-45e2.contatofalapopular.workers.dev";

const URL_HERO_FRASES = "hero-frases.json";

const HERO_MENSAGENS_PADRAO = [
  {
    superior: "Descubra rádios de todas as regiões do Brasil.",
    inferior: "Encontre emissoras, cidades e estilos em um catálogo nacional."
  },
  {
    superior: "Encontre novas vozes, cidades e culturas.",
    inferior: "Cada sintonia aproxima você de uma nova região do país."
  },
  {
    superior: "Ouça sua cidade onde estiver.",
    inferior: "Leve as vozes e a programação da sua região com você."
  },
  {
    superior: "Uma sintonia para cada momento do seu dia.",
    inferior: "Música, informação, cultura e entretenimento em um só lugar."
  },
  {
    superior: "Conectando ouvintes e emissoras de todo o país.",
    inferior: "Uma plataforma criada para ampliar o alcance das rádios brasileiras."
  },
  {
    superior: "Sua próxima rádio favorita está aqui.",
    inferior: "Explore o catálogo e descubra novas emissoras ao vivo."
  }
];

const CHAVE_SESSAO = "centralRadiosBrasilSessaoId";
const CHAVE_FAVORITAS = "centralRadiosBrasilFavoritas";
const CHAVE_ULTIMA_RADIO = "centralRadiosBrasilUltimaRadio";
const CHAVE_VOLUME = "centralRadiosBrasilVolume";
const DURACAO_ZAP_SEGUNDOS = 20;
const INTERVALO_TEMPO_OUVIDO_MS = 1000;
const INTERVALO_MONITOR_BUFFER_MS = 2000;
const LIMITE_TRAVAMENTO_AUDIO_MS = 12000;
const ATRASOS_RECONEXAO_MS = [2000, 4000, 8000, 15000, 30000, 60000];
const TEMPO_MINIMO_RANKING_SEGUNDOS = 5 * 60;
const INTERVALO_PROGRESSO_RANKING_MS = 30 * 1000;
const LIMITE_ESPERA_STREAM_RANKING_MS = 60 * 1000;

const elementos = {
  pesquisa: document.getElementById("pesquisa"),
  filtroEstado: document.getElementById("filtro-estado"),
  filtroCategoria: document.getElementById("filtro-categoria"),
  btnLimpar: document.getElementById("btn-limpar"),

  heroFrase: document.getElementById("hero-frase-rotativa"),
  heroDescricao: document.getElementById("hero-descricao-rotativa"),

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
  playerMusica: document.getElementById("player-musica"),
  playerBuffer: document.getElementById("player-buffer"),
  playerStatus: document.getElementById("player-status"),
  playerPopularidade: document.getElementById("player-popularidade"),
  playerConexao: document.getElementById("player-conexao"),
  playerTempo: document.getElementById("player-tempo"),
  playerEstabilidadeBarra: document.getElementById("player-estabilidade-barra"),
  playerZapStatus: document.getElementById("player-zap-status"),
  playerToast: document.getElementById("player-toast"),
  btnPlayPause: document.getElementById("btn-play-pause"),
  btnPlayerFavorita: document.getElementById("btn-player-favorita"),
  btnRadioAnterior: document.getElementById("btn-radio-anterior"),
  btnProximaRadio: document.getElementById("btn-proxima-radio"),
  btnVolume: document.getElementById("btn-volume"),
  playerVolumePopover: document.getElementById("player-volume-popover"),
  playerVolume: document.getElementById("player-volume"),
  btnZap: document.getElementById("btn-zap"),
  btnModoCarro: document.getElementById("btn-modo-carro"),
  btnCompartilharRadio: document.getElementById("btn-compartilhar-radio"),
  btnReportarRadio: document.getElementById("btn-reportar-radio"),
  btnRecolherPlayer: document.getElementById("btn-recolher-player"),
  btnFecharPlayer: document.getElementById("btn-fechar-player"),

  favoritas: document.getElementById("favoritas"),
  gradeFavoritas: document.getElementById("grade-favoritas"),
  contadorFavoritas: document.getElementById("contador-favoritas"),

  continuarOuvindo: document.getElementById("continuar-ouvindo"),
  continuarOuvindoConteudo: document.getElementById("continuar-ouvindo-conteudo"),
  recemChegadas: document.getElementById("recem-chegadas"),
  gradeRecemChegadas: document.getElementById("grade-recem-chegadas"),
  explorarRegioes: document.getElementById("explorar-regioes"),
  mapaResumoGeral: document.getElementById("mapa-resumo-geral"),
  mapaEstados: document.getElementById("mapa-estados"),
  mapaRede: document.getElementById("mapa-rede"),
  mapaConexoes: document.getElementById("mapa-conexoes"),
  mapaEmissoras: document.getElementById("mapa-emissoras"),
  mapaEstadosLista: document.getElementById("mapa-estados-lista"),
  mapaPainelEtiqueta: document.getElementById("mapa-painel-etiqueta"),
  mapaPainelTitulo: document.getElementById("mapa-painel-titulo"),
  mapaPainelDescricao: document.getElementById("mapa-painel-descricao"),
  mapaTotalEmissoras: document.getElementById("mapa-total-emissoras"),
  mapaTotalCidades: document.getElementById("mapa-total-cidades"),
  mapaTotalEstados: document.getElementById("mapa-total-estados"),
  mapaCidadeNova: document.getElementById("mapa-cidade-nova"),
  mapaCidadeNovaNome: document.getElementById("mapa-cidade-nova-nome"),
  mapaCidades: document.getElementById("mapa-cidades"),
  mapaCidadesContador: document.getElementById("mapa-cidades-contador"),
  mapaRadiosLista: document.getElementById("mapa-radios-lista"),
  mapaRadiosContador: document.getElementById("mapa-radios-contador"),
  btnOuvirMapa: document.getElementById("btn-ouvir-mapa"),
  btnVerMapaCatalogo: document.getElementById("btn-ver-mapa-catalogo"),
  radiosVerificadas: document.getElementById("radios-verificadas"),
  gradeVerificadas: document.getElementById("grade-verificadas"),
  categoriasDestaque: document.getElementById("categorias-destaque"),
  gradeCategoriasDestaque: document.getElementById("grade-categorias-destaque"),
  filtroDescobertaAtivo: document.getElementById("filtro-descoberta-ativo"),

  modoCarro: document.getElementById("modo-carro"),
  modoCarroLogo: document.getElementById("modo-carro-logo"),
  modoCarroStatus: document.getElementById("modo-carro-status"),
  modoCarroNome: document.getElementById("modo-carro-nome"),
  modoCarroLocalizacao: document.getElementById("modo-carro-localizacao"),
  modoCarroMusica: document.getElementById("modo-carro-musica"),
  modoCarroBuffer: document.getElementById("modo-carro-buffer"),
  modoCarroPopularidade: document.getElementById("modo-carro-popularidade"),
  modoCarroConexao: document.getElementById("modo-carro-conexao"),
  modoCarroTempo: document.getElementById("modo-carro-tempo"),
  modoCarroEstabilidadeBarra: document.getElementById("modo-carro-estabilidade-barra"),
  modoCarroZapStatus: document.getElementById("modo-carro-zap-status"),
  btnCarroAnterior: document.getElementById("btn-carro-anterior"),
  btnCarroPlay: document.getElementById("btn-carro-play"),
  btnCarroProxima: document.getElementById("btn-carro-proxima"),
  btnCarroFavorita: document.getElementById("btn-carro-favorita"),
  btnCarroTelaLigada: document.getElementById("btn-carro-tela-ligada"),
  btnCarroZap: document.getElementById("btn-carro-zap"),
  carroVolume: document.getElementById("carro-volume"),
  btnCarroVolumeMenos: document.getElementById("btn-carro-volume-menos"),
  btnCarroVolumeMais: document.getElementById("btn-carro-volume-mais"),
  btnSairModoCarro: document.getElementById("btn-sair-modo-carro"),
  anuncioAcessibilidade: document.getElementById("anuncio-acessibilidade")
};

const estado = {
  banco: null,
  radios: [],
  radiosFiltradas: [],
  radioAtual: null,
  carregandoAudio: false,
  paginaAtual: 1,
  radiosPorPagina: 12,
  favoritas: new Set(),
  regiaoSelecionada: "",
  mapaRegiaoSelecionada: "",
  mapaUfSelecionada: "",
  mapaCidadeSelecionada: "",
  mapaCidadeUfSelecionada: "",
  usuarioPausou: false,
  fechandoPlayer: false,
  playerRecolhido: false,
  indiceStreamAtual: 0,
  reconexao: {
    tentativa: 0,
    timerId: null,
    motivo: ""
  },
  buffer: {
    intervaloId: null,
    ultimoTempo: 0,
    ultimoAvancoEm: 0
  },
  popularidade: {
    mapa: new Map(),
    atualizadoEm: null
  },
  tempoOuvido: {
    acumuladoSegundos: 0,
    inicioPerformance: null,
    intervaloId: null
  },
  conexao: {
    nivelForcado: null,
    oscilacoesRecentes: 0
  },
  volume: {
    valor: 0.8
  },
  wakeLock: {
    solicitado: false,
    sentinela: null
  },
  zap: {
    ativo: false,
    timeoutId: null,
    intervaloId: null,
    proximaTrocaEm: 0
  },
  toastTimerId: null,
  musicaAtual: {
    titulo: "Programação ao vivo",
    artista: "",
    intervaloId: null
  },
  reproducaoRanking: {
    eventoId: null,
    radioId: null,
    sessaoId: null,
    segundosAcumulados: 0,
    ultimoInicioPerformance: null,
    ultimoEnvioSegundos: 0,
    intervaloId: null,
    timeoutEsperaId: null,
    iniciando: false,
    enviando: false,
    finalizada: false
  },
  monitoramentoStreams: {
    atualizadoEm: null,
    indisponiveis: new Set(),
    totalIndisponiveis: 0
  },
  acessibilidade: {
    ultimoEstadoPlayer: "",
    timerFiltros: null
  },
  autoplay: {
    interacaoArmada: false,
    handlerPointer: null,
    handlerTeclado: null
  },
  hero: {
    mensagens: [...HERO_MENSAGENS_PADRAO],
    indice: 0,
    intervaloId: null,
    intervaloMs: 6000,
    transicaoMs: 450,
    pausadoPorVisibilidade: false
  }
};

document.addEventListener("DOMContentLoaded", iniciarPortal);

async function iniciarPortal() {
  carregarPreferenciasLocais();
  carregarPreferenciaPlayerRecolhido();
  registrarEventos();
  configurarMediaSession();
  atualizarControlesVolume();
  atualizarControlesZap();
  atualizarTempoOuvidoTela();
  void iniciarHeroRotativo();
  await carregarBanco();
  const abriuRadioCompartilhada = prepararRadioCompartilhada();
  if (!abriuRadioCompartilhada) restaurarUltimaRadio();
  tratarAtalhosDeAbertura();
}


const CHAVE_PLAYER_RECOLHIDO = "crb_player_recolhido";

function carregarPreferenciaPlayerRecolhido() {
  try {
    estado.playerRecolhido = localStorage.getItem(CHAVE_PLAYER_RECOLHIDO) === "1";
  } catch {}
  aplicarEstadoPlayerRecolhido();
}

function salvarPreferenciaPlayerRecolhido() {
  try {
    localStorage.setItem(CHAVE_PLAYER_RECOLHIDO, estado.playerRecolhido ? "1" : "0");
  } catch {}
}

function atualizarClassesPlayerVisivel() {
  const visivel = !elementos.player?.classList.contains("hidden");
  document.body.classList.toggle("player-visivel", visivel);
  document.body.classList.toggle("player-recolhido-visivel", visivel && estado.playerRecolhido);
}

function aplicarEstadoPlayerRecolhido() {
  elementos.player?.classList.toggle("player-recolhido", Boolean(estado.playerRecolhido));
  if (elementos.btnRecolherPlayer) {
    const recolhido = Boolean(estado.playerRecolhido);
    elementos.btnRecolherPlayer.textContent = recolhido ? "→" : "←";
    elementos.btnRecolherPlayer.setAttribute("aria-label", recolhido ? "Expandir controles do player" : "Recolher player para a esquerda");
    elementos.btnRecolherPlayer.setAttribute("aria-expanded", String(!recolhido));
    elementos.btnRecolherPlayer.title = recolhido ? "Expandir controles" : "Recolher player";
  }
  atualizarClassesPlayerVisivel();
}

function alternarPlayerRecolhido() {
  estado.playerRecolhido = !estado.playerRecolhido;
  aplicarEstadoPlayerRecolhido();
  salvarPreferenciaPlayerRecolhido();
}

function registrarEventos() {
  elementos.pesquisa.addEventListener("input", aplicarFiltros);
  elementos.filtroEstado.addEventListener("change", () => {
    estado.regiaoSelecionada = "";
    if (elementos.filtroEstado.value) {
      estado.mapaUfSelecionada = elementos.filtroEstado.value;
      estado.mapaRegiaoSelecionada = "";
      renderizarPainelMapaSonoro();
      atualizarSelecaoMapaSonoro();
    }
    atualizarFiltroDescobertaAtivo();
    aplicarFiltros();
  });
  elementos.filtroCategoria.addEventListener("change", aplicarFiltros);

  document.querySelectorAll("[data-descoberta-acao]").forEach(botao => {
    botao.addEventListener("click", () => abrirCatalogoPorDescoberta(botao.dataset.descobertaAcao));
  });

  document.querySelectorAll("[data-mapa-regiao]").forEach(botao => {
    botao.addEventListener("click", () => selecionarRegiaoMapa(botao.dataset.mapaRegiao || ""));
  });
  elementos.btnOuvirMapa?.addEventListener("click", ouvirRadioDoMapa);
  elementos.btnVerMapaCatalogo?.addEventListener("click", abrirCatalogoDoMapa);

  elementos.btnLimpar.addEventListener("click", limparFiltros);

  elementos.btnPlayPause.addEventListener("click", alternarReproducao);
  elementos.btnPlayerFavorita.addEventListener("click", () => alternarFavorita(estado.radioAtual));
  elementos.btnRadioAnterior.addEventListener("click", () => tocarRadioRelativa(-1));
  elementos.btnProximaRadio.addEventListener("click", () => tocarRadioRelativa(1));
  elementos.btnVolume.addEventListener("click", alternarPainelVolume);
  elementos.playerVolume.addEventListener("input", evento => aplicarVolume(Number(evento.target.value) / 100));
  elementos.btnZap.addEventListener("click", alternarZap);
  elementos.btnModoCarro.addEventListener("click", abrirModoCarro);
  elementos.btnCompartilharRadio?.addEventListener("click", () => compartilharRadio(estado.radioAtual));
  elementos.btnReportarRadio?.addEventListener("click", () => abrirOcorrenciaRadio(estado.radioAtual));
  elementos.btnRecolherPlayer?.addEventListener("click", alternarPlayerRecolhido);
  elementos.btnFecharPlayer.addEventListener("click", fecharPlayer);

  elementos.btnCarroAnterior.addEventListener("click", () => tocarRadioRelativa(-1));
  elementos.btnCarroPlay.addEventListener("click", alternarReproducao);
  elementos.btnCarroProxima.addEventListener("click", () => tocarRadioRelativa(1));
  elementos.btnCarroFavorita.addEventListener("click", () => alternarFavorita(estado.radioAtual));
  elementos.btnCarroTelaLigada.addEventListener("click", alternarTelaLigada);
  elementos.btnCarroZap.addEventListener("click", alternarZap);
  elementos.carroVolume.addEventListener("input", evento => aplicarVolume(Number(evento.target.value) / 100));
  elementos.btnCarroVolumeMenos.addEventListener("click", () => aplicarVolume(estado.volume.valor - 0.1));
  elementos.btnCarroVolumeMais.addEventListener("click", () => aplicarVolume(estado.volume.valor + 0.1));
  elementos.btnSairModoCarro.addEventListener("click", fecharModoCarro);

  document.addEventListener("click", evento => {
    if (!evento.target.closest(".player-volume-area")) fecharPainelVolume();
  });

  const conexao = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  conexao?.addEventListener?.("change", atualizarQualidadeConexao);
  document.addEventListener("visibilitychange", tratarVisibilidadeWakeLock);

  elementos.audio.addEventListener("play", () => {
    desarmarReproducaoNaPrimeiraInteracao();
    estado.carregandoAudio = false;
    estado.usuarioPausou = false;
    atualizarEstadoPlayer("AO VIVO", "⏸");
    iniciarMonitorBuffer();
    iniciarTempoOuvido();
    atualizarQualidadeConexao();
    atualizarAnimacaoCapa(true);
    atualizarMediaSession();
  });

  elementos.audio.addEventListener("pause", () => {
    if (!estado.carregandoAudio) {
      atualizarEstadoPlayer("Transmissão pausada", "▶");
    }
    pararMonitorBuffer();
    pausarTempoOuvido();
    atualizarAnimacaoCapa(false);
    if (estado.usuarioPausou) pararZap(false);
    if (estado.usuarioPausou || estado.fechandoPlayer) {
      cancelarReconexaoAutomatica();
    }
    void encerrarSessaoRankingAtual("pausa");
    atualizarMediaSession();
  });

  elementos.audio.addEventListener("waiting", () => {
    estado.carregandoAudio = true;
    atualizarEstadoPlayer("Conexão instável", "…");
    atualizarEstadoBuffer("Aguardando áudio");
    pausarTempoOuvido();
    registrarOscilacaoConexao();
    atualizarAnimacaoCapa(false);
    pausarCronometroRanking();
    agendarCancelamentoPorEspera();
    agendarReconexaoAutomatica("espera_de_audio", 8000);
  });

  elementos.audio.addEventListener("stalled", () => {
    atualizarEstadoBuffer("Transmissão travada");
    pausarTempoOuvido();
    registrarOscilacaoConexao();
    atualizarAnimacaoCapa(false);
    pausarCronometroRanking();
    agendarCancelamentoPorEspera();
    agendarReconexaoAutomatica("stream_travado", 6000);
  });

  elementos.audio.addEventListener("playing", () => {
    estado.carregandoAudio = false;
    estado.reconexao.tentativa = 0;
    cancelarReconexaoAutomatica();
    atualizarEstadoPlayer("AO VIVO", "⏸");
    atualizarEstadoBuffer("Buffer estável");
    limparTimeoutEsperaRanking();
    iniciarMonitorBuffer();
    iniciarTempoOuvido();
    atualizarQualidadeConexao();
    atualizarAnimacaoCapa(true);
    void iniciarOuRetomarContagemRanking();
    atualizarMediaSession();
  });

  elementos.audio.addEventListener("error", () => {
    estado.carregandoAudio = false;
    atualizarEstadoPlayer("Reconectando...", "…");
    atualizarEstadoBuffer("Falha na transmissão");
    pausarTempoOuvido();
    registrarOscilacaoConexao();
    atualizarAnimacaoCapa(false);
    void encerrarSessaoRankingAtual("erro_de_audio");
    agendarReconexaoAutomatica("erro_de_audio", 1500);
  });

  elementos.audio.addEventListener("ended", () => {
    void encerrarSessaoRankingAtual("transmissao_encerrada");
    agendarReconexaoAutomatica("transmissao_encerrada", 1500);
  });

  window.addEventListener("offline", () => {
    atualizarEstadoPlayer("Sem internet", "…");
    atualizarEstadoBuffer("Aguardando a conexão voltar");
    estado.conexao.nivelForcado = "offline";
    atualizarQualidadeConexao();
    pausarTempoOuvido();
    cancelarReconexaoAutomatica();
  });

  window.addEventListener("online", () => {
    estado.conexao.nivelForcado = null;
    atualizarQualidadeConexao();
    if (estado.radioAtual && !estado.usuarioPausou) {
      atualizarEstadoPlayer("Internet restabelecida", "…");
      agendarReconexaoAutomatica("internet_restabelecida", 250);
    }
  });


  window.addEventListener("pagehide", () => {
    void encerrarSessaoRankingAtual("saida_da_pagina");
    pararTempoOuvido();
    pararZap(false);
    void liberarWakeLock();
  });
}

async function iniciarHeroRotativo() {
  if (!elementos.heroFrase || !elementos.heroDescricao) return;

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

    estado.hero.mensagens = [...HERO_MENSAGENS_PADRAO];
  }

  exibirFraseHero(0, false);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  iniciarIntervaloHero();

  document.addEventListener("visibilitychange", controlarVisibilidadeHero);
}

function aplicarConfiguracaoHero(configuracao) {
  if (!configuracao || typeof configuracao !== "object") {
    estado.hero.mensagens = [...HERO_MENSAGENS_PADRAO];
    return;
  }

  const mensagensPadrao = normalizarMensagens(
    configuracao.mensagensPadrao,
    configuracao.frasesPadrao
  );

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

  let mensagens = mensagensPadrao.length > 0
    ? mensagensPadrao
    : [...HERO_MENSAGENS_PADRAO];

  if (campanhaSubstituta) {
    const especiais = normalizarMensagens(
      campanhaSubstituta.mensagens,
      campanhaSubstituta.frases
    );

    if (especiais.length > 0) {
      mensagens = especiais;
    }
  } else {
    const mensagensEspeciais = campanhasAtivas.flatMap(
      campanha => normalizarMensagens(
        campanha.mensagens,
        campanha.frases
      )
    );

    if (mensagensEspeciais.length > 0) {
      mensagens = [...mensagensEspeciais, ...mensagens];
    }
  }

  estado.hero.mensagens = removerMensagensDuplicadas(mensagens);

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

function normalizarMensagens(listaMensagens, listaFrasesLegadas) {
  const origem = Array.isArray(listaMensagens)
    ? listaMensagens
    : Array.isArray(listaFrasesLegadas)
      ? listaFrasesLegadas
      : [];

  return origem
    .map((item, indice) => {
      if (typeof item === "string") {
        const superior = item.trim();
        const fallback = HERO_MENSAGENS_PADRAO[
          indice % HERO_MENSAGENS_PADRAO.length
        ];

        return {
          superior,
          inferior: fallback.inferior
        };
      }

      if (!item || typeof item !== "object") return null;

      const superior = normalizarTexto(
        item.superior || item.titulo || item.texto
      );

      const inferior = normalizarTexto(
        item.inferior || item.descricao || item.subtitulo
      );

      return { superior, inferior };
    })
    .filter(mensagem => (
      mensagem &&
      mensagem.superior.length >= 8 &&
      mensagem.superior.length <= 150 &&
      mensagem.inferior.length >= 8 &&
      mensagem.inferior.length <= 240
    ));
}

function removerMensagensDuplicadas(lista) {
  const chaves = new Set();

  return lista.filter(mensagem => {
    const chave = `${mensagem.superior}||${mensagem.inferior}`;

    if (chaves.has(chave)) return false;

    chaves.add(chave);
    return true;
  });
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

  if (estado.hero.mensagens.length < 2) return;

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
    (estado.hero.indice + 1) % estado.hero.mensagens.length;

  exibirFraseHero(proximoIndice, true);
}

function exibirFraseHero(indice, animar) {
  const mensagem = estado.hero.mensagens[indice];

  if (
    !elementos.heroFrase ||
    !elementos.heroDescricao ||
    !mensagem
  ) {
    return;
  }

  const alvos = [
    elementos.heroFrase,
    elementos.heroDescricao
  ];

  const trocarTextos = () => {
    elementos.heroFrase.textContent = mensagem.superior;
    elementos.heroDescricao.textContent = mensagem.inferior;
    estado.hero.indice = indice;

    alvos.forEach(elemento => {
      elemento.classList.remove("hero-frase-saindo");
      elemento.classList.add("hero-frase-entrando");
    });

    window.setTimeout(() => {
      alvos.forEach(elemento => {
        elemento?.classList.remove("hero-frase-entrando");
      });
    }, estado.hero.transicaoMs);
  };

  if (!animar) {
    trocarTextos();
    return;
  }

  alvos.forEach(elemento => {
    elemento.classList.remove("hero-frase-entrando");
    elemento.classList.add("hero-frase-saindo");
  });

  window.setTimeout(trocarTextos, estado.hero.transicaoMs);
}

async function carregarBanco() {
  mostrarMensagem("Carregando emissoras...");

  try {
    const [resposta, statusMonitoramento, popularidade] = await Promise.all([
      fetch(URL_RADIOS, { cache: "no-store" }),
      carregarStatusMonitoramentoStreams(),
      carregarPopularidade()
    ]);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const banco = await resposta.json();

    validarBanco(banco);

    estado.banco = banco;
    estado.monitoramentoStreams = statusMonitoramento;
    estado.popularidade = popularidade;

    estado.radios = banco.radios
      .filter(radioPublicaAtiva)
      .filter((radio) =>
        !statusMonitoramento.indisponiveis.has(radio.id)
      );
   atualizarIndicadoresNacionais(banco);
    estado.radiosFiltradas = [...estado.radios];

    atualizarInformacoesBanco();
    preencherFiltros();
    renderizarRadios();
    renderizarFavoritas();
    renderizarDescobertaHome();
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


async function carregarPopularidade() {
  const fallback = {
    mapa: new Map(),
    atualizadoEm: null
  };

  try {
    const resposta = await fetch(
      `${URL_API}/api/popularidade?limit=300`,
      { cache: "no-store" }
    );

    if (!resposta.ok) return fallback;

    const dados = await resposta.json();
    const lista = Array.isArray(dados?.radios)
      ? dados.radios
      : [];

    return {
      atualizadoEm: dados?.atualizadoEm || null,
      mapa: new Map(
        lista
          .filter(item => item?.radioId)
          .map(item => [String(item.radioId), item])
      )
    };
  } catch (erro) {
    console.warn("Índice de popularidade temporariamente indisponível:", erro);
    return fallback;
  }
}

function obterDataPublicacaoRadio(radio) {
  const candidatos = [
    radio?.publicadoEm,
    radio?.dataPublicacao,
    radio?.createdAt,
    radio?.criadoEm,
    radio?.datas?.publicadoEm,
    radio?.datas?.criadoEm,
    radio?.cadastro?.publicadoEm,
    radio?.cadastro?.criadoEm,
    radio?.auditoria?.publicadoEm
  ];

  for (const valor of candidatos) {
    if (!valor) continue;
    const data = new Date(valor);
    if (!Number.isNaN(data.getTime())) return data;
  }

  return null;
}

function radioEhDestaqueEditorial(radio) {
  return [
    radio?.destaque,
    radio?.destaqueOficial,
    radio?.status?.destaque,
    radio?.status?.destaquePortal,
    radio?.portal?.destaque,
    radio?.classificacao?.destaque
  ].some(valor => valor === true || String(valor).toLowerCase() === "true");
}

function obterClassificacaoPopularidade(radio) {
  if (!radio) return null;

  if (radioEhDestaqueEditorial(radio)) {
    return {
      codigo: "destaque",
      rotulo: "Destaque",
      icone: "⭐",
      classe: "popularidade-destaque"
    };
  }

  const metrica = estado.popularidade.mapa.get(obterRadioId(radio));
  const automatica = metrica?.classificacaoAutomatica;

  if (automatica === "muito_popular") {
    return {
      codigo: "muito_popular",
      rotulo: "Muito Popular",
      icone: "🔥",
      classe: "popularidade-muito-popular"
    };
  }

  if (automatica === "em_alta") {
    return {
      codigo: "em_alta",
      rotulo: "Em Alta",
      icone: "🔥",
      classe: "popularidade-em-alta"
    };
  }

  const publicadaEm = obterDataPublicacaoRadio(radio);
  if (publicadaEm) {
    const idadeDias = Math.floor(
      (Date.now() - publicadaEm.getTime()) /
        (24 * 60 * 60 * 1000)
    );

    if (idadeDias >= 0 && idadeDias <= 30) {
      return {
        codigo: "nova",
        rotulo: "Nova",
        icone: "🆕",
        classe: "popularidade-nova"
      };
    }
  }

  return null;
}

function criarSeloPopularidade(radio) {
  const classificacao = obterClassificacaoPopularidade(radio);
  if (!classificacao) return null;

  const selo = document.createElement("span");
  selo.className = `radio-selo popularidade-selo ${classificacao.classe}`;
  definirTextoComIcone(selo, classificacao.icone, classificacao.rotulo);
  selo.title = "Índice calculado com dados reais da Central Rádios Brasil";
  return selo;
}

function atualizarSeloPopularidadePlayer(radio) {
  const classificacao = obterClassificacaoPopularidade(radio);
  const alvos = [
    elementos.playerPopularidade,
    elementos.modoCarroPopularidade
  ];

  alvos.forEach(alvo => {
    if (!alvo) return;
    alvo.className = "popularidade-selo";
    if (!classificacao) {
      alvo.textContent = "";
      alvo.classList.add("hidden");
      return;
    }
    definirTextoComIcone(alvo, classificacao.icone, classificacao.rotulo);
    alvo.classList.add(classificacao.classe);
    alvo.classList.remove("hidden");
  });
}

async function carregarStatusMonitoramentoStreams() {
  const fallback = {
    atualizadoEm: null,
    indisponiveis: new Set(),
    totalIndisponiveis: 0
  };

  try {
    const resposta = await fetch(
      `${URL_API}/api/streams/status`,
      { cache: "no-store" }
    );

    if (!resposta.ok) return fallback;

    const dados = await resposta.json();
    const lista = Array.isArray(dados?.streams)
      ? dados.streams
      : [];
    const indisponiveis = new Set(
      lista
        .filter((item) =>
          item?.disponivelNoPortal === false
        )
        .map((item) => item.radioId)
        .filter(Boolean)
    );

    return {
      atualizadoEm: dados?.atualizadoEm || null,
      indisponiveis,
      totalIndisponiveis: indisponiveis.size
    };
  } catch (erro) {
    console.warn(
      "Monitoramento de streams temporariamente indisponível:",
      erro
    );
    return fallback;
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

  const temporariamenteIndisponiveis =
    estado.monitoramentoStreams.totalIndisponiveis || 0;

  elementos.informacaoBanco.textContent =
    `${total} ${total === 1 ? "emissora disponível" : "emissoras disponíveis"}` +
    (temporariamenteIndisponiveis
      ? ` • ${temporariamenteIndisponiveis} temporariamente fora do ar`
      : "") +
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

    const ufsDaRegiao = obterUfsDaRegiao(estado.regiaoSelecionada);
    const correspondeRegiao =
      !estado.regiaoSelecionada ||
      ufsDaRegiao.includes(String(radio.localizacao?.uf || "").toUpperCase());

    const correspondeCategoria =
      !categoriaSelecionada ||
      categorias.includes(categoriaSelecionada);

    return (
      correspondePesquisa &&
      correspondeEstado &&
      correspondeRegiao &&
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
  estado.regiaoSelecionada = "";
  atualizarFiltroDescobertaAtivo();

  estado.radiosFiltradas = [...estado.radios];

  renderizarRadios();
  elementos.pesquisa.focus();
}

function renderizarRadios() {
  elementos.gradeRadios.innerHTML = "";
  elementos.paginacaoRadios.innerHTML = "";

  const radios = estado.radiosFiltradas;
  atualizarContador(radios.length);
  if (estado.acessibilidade.timerFiltros) {
    window.clearTimeout(estado.acessibilidade.timerFiltros);
  }
  estado.acessibilidade.timerFiltros = window.setTimeout(() => {
    window.CRBAcessibilidade?.anunciar(
      `${radios.length} ${radios.length === 1 ? "emissora encontrada" : "emissoras encontradas"}.`
    );
  }, 550);

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

function criarCardRadio(radio, opcoes = {}) {
  const artigo = document.createElement("article");
  artigo.className = "radio-card radio-card-compacto";
  if (opcoes.favorita) artigo.classList.add("radio-card-favorita");

  const nome = radio.nomeFantasia || radio.nome || "Emissora";
  artigo.dataset.radioId = obterIdentificadorRadio(radio);

  const botaoOuvir = document.createElement("button");
  botaoOuvir.type = "button";
  botaoOuvir.className = "radio-card-acao";
  botaoOuvir.setAttribute("aria-label", `Ouvir ${nome}`);
  botaoOuvir.title = `Ouvir ${nome}`;
  botaoOuvir.addEventListener("click", () => selecionarRadio(radio));

  const botaoFavorita = document.createElement("button");
  botaoFavorita.type = "button";
  botaoFavorita.className = "radio-favorita";
  botaoFavorita.dataset.radioId = obterIdentificadorRadio(radio);
  botaoFavorita.setAttribute("aria-label", ehFavorita(radio) ? `Remover ${nome} das favoritas` : `Adicionar ${nome} às favoritas`);
  botaoFavorita.setAttribute("aria-pressed", String(ehFavorita(radio)));
  botaoFavorita.textContent = ehFavorita(radio) ? "♥" : "♡";
  botaoFavorita.addEventListener("click", () => alternarFavorita(radio));

  const logo = criarLogoRadio(radio, "radio-logo");
  logo.setAttribute("aria-hidden", "true");

  const nomeElemento = document.createElement("strong");
  nomeElemento.className = "radio-nome";
  nomeElemento.textContent = nome;

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

  const seloPopularidade = criarSeloPopularidade(radio);
  if (seloPopularidade) selos.appendChild(seloPopularidade);

  const categoria = document.createElement("span");
  categoria.className = "radio-categoria";
  categoria.textContent = radio.classificacao?.categoriaPrincipal || "Rádio online";

  artigo.append(botaoOuvir, botaoFavorita, logo, nomeElemento, selos, categoria);
  return artigo;
}

function obterUrlLogo(radio) {
  const logo = radio?.logo;

  if (typeof logo === "string") {
    return logo.trim();
  }

  if (logo && typeof logo === "object") {
    const candidatos = [
      logo.miniatura,
      logo.quadrada,
      logo.original,
      logo.url
    ];

    const encontrado = candidatos.find(
      valor => typeof valor === "string" && valor.trim()
    );

    if (encontrado) {
      return encontrado.trim();
    }
  }

  if (
    typeof radio?.logoRanking === "string" &&
    radio.logoRanking.trim()
  ) {
    return radio.logoRanking.trim();
  }

  return "";
}

function criarLogoRadio(radio, classe) {
  const container = document.createElement("div");
  container.className = classe;

  const urlLogo = obterUrlLogo(radio);

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

function desarmarReproducaoNaPrimeiraInteracao() {
  if (!estado.autoplay.interacaoArmada) return;

  if (estado.autoplay.handlerPointer) {
    document.removeEventListener("pointerup", estado.autoplay.handlerPointer);
  }

  if (estado.autoplay.handlerTeclado) {
    document.removeEventListener("keydown", estado.autoplay.handlerTeclado);
  }

  estado.autoplay.interacaoArmada = false;
  estado.autoplay.handlerPointer = null;
  estado.autoplay.handlerTeclado = null;
}

function armarReproducaoNaPrimeiraInteracao() {
  if (estado.autoplay.interacaoArmada) return;

  const tentarNovamente = evento => {
    const alvo = evento?.target;

    if (
      alvo instanceof Element &&
      alvo.closest("#btn-fechar-player, #btn-play-pause, #btn-carro-play")
    ) {
      return;
    }

    desarmarReproducaoNaPrimeiraInteracao();

    if (
      !estado.radioAtual ||
      estado.usuarioPausou ||
      estado.fechandoPlayer ||
      !elementos.audio.paused
    ) {
      return;
    }

    void tentarReproducaoAutomatica({ origem: "primeira_interacao" });
  };

  estado.autoplay.interacaoArmada = true;
  estado.autoplay.handlerPointer = tentarNovamente;
  estado.autoplay.handlerTeclado = tentarNovamente;

  document.addEventListener("pointerup", tentarNovamente);
  document.addEventListener("keydown", tentarNovamente);
}

async function tentarReproducaoAutomatica(opcoes = {}) {
  if (!estado.radioAtual || !elementos.audio.src) return false;

  estado.usuarioPausou = false;
  estado.fechandoPlayer = false;
  estado.carregandoAudio = true;

  atualizarEstadoPlayer("Conectando automaticamente...", "…");
  atualizarEstadoBuffer("Iniciando a última rádio ouvida");

  try {
    await elementos.audio.play();
    desarmarReproducaoNaPrimeiraInteracao();
    return true;
  } catch (erro) {
    estado.carregandoAudio = false;

    if (erro?.name === "NotAllowedError") {
      console.info(
        "O navegador bloqueou a reprodução automática com som.",
        opcoes.origem || "abertura"
      );
      atualizarEstadoPlayer("Pronta para tocar automaticamente", "▶");
      atualizarEstadoBuffer("Toque em qualquer área do portal para liberar o áudio");
      armarReproducaoNaPrimeiraInteracao();
      return false;
    }

    console.error("Falha na reprodução automática:", erro);
    atualizarEstadoPlayer("Não foi possível iniciar automaticamente", "▶");
    atualizarEstadoBuffer("Use o botão reproduzir para tentar novamente");
    return false;
  }
}

async function selecionarRadio(radio, opcoes = {}) {
  const streams = obterStreamsValidos(radio);

  if (streams.length === 0) {
    window.CRBAcessibilidade?.anunciar(
      "Esta emissora está temporariamente sem transmissão.",
      { assertivo: true }
    );
    window.alert("Esta emissora está temporariamente sem transmissão.");
    return;
  }

  void encerrarSessaoRankingAtual("troca_de_radio");
  cancelarReconexaoAutomatica();
  pararMonitorBuffer();
  pararAtualizacaoMusica();

  estado.fechandoPlayer = false;
  estado.usuarioPausou = false;
  elementos.audio.pause();

  estado.radioAtual = radio;
  resetarTempoOuvido();
  estado.carregandoAudio = true;
  estado.indiceStreamAtual = Math.max(0, Math.min(Number(opcoes.indiceStream || 0), streams.length - 1));

  salvarUltimaRadio(radio);
  elementos.player.classList.remove("hidden");
  atualizarClassesPlayerVisivel();
  aplicarEstadoPlayerRecolhido();

  atualizarIdentidadePlayer(radio);
  window.CRBAcessibilidade?.anunciar(
    `${radio.nomeFantasia || radio.nome || "Emissora"} selecionada. Conectando à transmissão.`
  );
  atualizarEstadoPlayer("Conectando...", "…");
  atualizarEstadoBuffer("Preparando transmissão");

  elementos.audio.src = streams[estado.indiceStreamAtual];
  elementos.audio.load();

  try {
    await elementos.audio.play();
  } catch (erro) {
    estado.carregandoAudio = false;
    console.error("Falha ao iniciar a transmissão:", erro);
    atualizarEstadoPlayer("Toque no botão para iniciar", "▶");
    atualizarEstadoBuffer("Pronta para nova tentativa");
    if (opcoes.reconexaoAutomatica) {
      agendarReconexaoAutomatica("falha_ao_reconectar", 2000);
    }
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

function limparIntervaloRanking() {
  const controle = estado.reproducaoRanking;

  if (controle.intervaloId) {
    clearInterval(controle.intervaloId);
    controle.intervaloId = null;
  }
}

function limparTimeoutEsperaRanking() {
  const controle = estado.reproducaoRanking;

  if (controle.timeoutEsperaId) {
    clearTimeout(controle.timeoutEsperaId);
    controle.timeoutEsperaId = null;
  }
}

function atualizarTempoLocalRanking() {
  const controle = estado.reproducaoRanking;

  if (controle.ultimoInicioPerformance === null) {
    return;
  }

  const agora = performance.now();
  const delta = Math.max(
    0,
    (agora - controle.ultimoInicioPerformance) / 1000
  );

  controle.segundosAcumulados += delta;
  controle.ultimoInicioPerformance = agora;
}

function pausarCronometroRanking() {
  const controle = estado.reproducaoRanking;

  atualizarTempoLocalRanking();
  controle.ultimoInicioPerformance = null;
  limparIntervaloRanking();
}

function iniciarCronometroRanking() {
  const controle = estado.reproducaoRanking;

  if (
    !controle.eventoId ||
    controle.finalizada ||
    elementos.audio.paused ||
    estado.carregandoAudio
  ) {
    return;
  }

  if (controle.ultimoInicioPerformance === null) {
    controle.ultimoInicioPerformance = performance.now();
  }

  if (!controle.intervaloId) {
    controle.intervaloId = setInterval(() => {
      void enviarProgressoRankingAtual();
    }, INTERVALO_PROGRESSO_RANKING_MS);
  }
}

function reiniciarControleRanking() {
  limparIntervaloRanking();
  limparTimeoutEsperaRanking();

  estado.reproducaoRanking = {
    eventoId: null,
    radioId: null,
    sessaoId: null,
    segundosAcumulados: 0,
    ultimoInicioPerformance: null,
    ultimoEnvioSegundos: 0,
    intervaloId: null,
    timeoutEsperaId: null,
    iniciando: false,
    enviando: false,
    finalizada: false
  };
}

function criarSnapshotRanking() {
  atualizarTempoLocalRanking();

  const controle = estado.reproducaoRanking;

  return {
    eventoId: controle.eventoId,
    radioId: controle.radioId,
    sessaoId: controle.sessaoId,
    segundosAcumulados: Math.floor(
      controle.segundosAcumulados
    )
  };
}

async function enviarProgressoRanking(snapshot) {
  const resposta = await fetch(
    `${URL_API}/api/play/progresso`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(snapshot),
      keepalive: true
    }
  );

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      resultado?.erro || `Erro HTTP ${resposta.status}`
    );
  }

  return resultado;
}

async function cancelarEventoRankingServidor(
  snapshot,
  motivo
) {
  if (!snapshot?.eventoId) return;

  try {
    await fetch(`${URL_API}/api/play/cancelar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventoId: snapshot.eventoId,
        radioId: snapshot.radioId,
        sessaoId: snapshot.sessaoId,
        motivo
      }),
      keepalive: true
    });
  } catch (erro) {
    console.warn(
      "Não foi possível cancelar a sessão de ranking:",
      erro
    );
  }
}

async function iniciarOuRetomarContagemRanking() {
  if (
    !estado.radioAtual ||
    elementos.audio.paused ||
    estado.carregandoAudio
  ) {
    return;
  }

  const radioId = obterRadioId(estado.radioAtual);
  const controle = estado.reproducaoRanking;

  if (!radioId) return;

  if (
    controle.eventoId &&
    controle.radioId === radioId &&
    !controle.finalizada
  ) {
    iniciarCronometroRanking();
    return;
  }

  if (controle.finalizada && controle.radioId === radioId) {
    return;
  }

  if (controle.iniciando) return;

  const sessaoId = obterSessaoId();
  const radioCapturada = estado.radioAtual;

  controle.radioId = radioId;
  controle.sessaoId = sessaoId;
  controle.iniciando = true;

  try {
    const resposta = await fetch(`${URL_API}/api/play/iniciar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        radioId,
        sessaoId,
        origem: "PWA",
        cidade: radioCapturada?.localizacao?.cidade || "",
        estado: radioCapturada?.localizacao?.uf || ""
      })
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(
        resultado?.erro || `Erro HTTP ${resposta.status}`
      );
    }

    const aindaEhMesmaRadio =
      estado.radioAtual &&
      obterRadioId(estado.radioAtual) === radioId &&
      !elementos.audio.paused &&
      !estado.carregandoAudio;

    if (!aindaEhMesmaRadio) {
      await cancelarEventoRankingServidor(
        {
          eventoId: resultado.eventoId,
          radioId,
          sessaoId
        },
        "radio_alterada_antes_do_inicio"
      );
      return;
    }

    const controleAtual = estado.reproducaoRanking;
    controleAtual.eventoId = resultado.eventoId;
    controleAtual.radioId = radioId;
    controleAtual.sessaoId = sessaoId;
    controleAtual.segundosAcumulados = 0;
    controleAtual.ultimoEnvioSegundos = 0;
    controleAtual.finalizada = false;

    iniciarCronometroRanking();
  } catch (erro) {
    console.warn(
      "Não foi possível iniciar a validação do ranking:",
      erro
    );
  } finally {
    if (estado.reproducaoRanking.radioId === radioId) {
      estado.reproducaoRanking.iniciando = false;
    }
  }
}

async function enviarProgressoRankingAtual() {
  const controle = estado.reproducaoRanking;

  if (
    !controle.eventoId ||
    controle.finalizada ||
    controle.enviando
  ) {
    return;
  }

  const snapshot = criarSnapshotRanking();

  if (
    snapshot.segundosAcumulados <=
    controle.ultimoEnvioSegundos
  ) {
    return;
  }

  controle.enviando = true;

  try {
    const resultado = await enviarProgressoRanking(snapshot);

    const controleAtual = estado.reproducaoRanking;

    if (controleAtual.eventoId !== snapshot.eventoId) {
      return;
    }

    controleAtual.ultimoEnvioSegundos =
      snapshot.segundosAcumulados;

    if (
      resultado.contabilizado ||
      resultado.status === "duplicada"
    ) {
      controleAtual.finalizada = true;
      pausarCronometroRanking();

      console.info(
        resultado.contabilizado
          ? "Reprodução válida contabilizada após cinco minutos."
          : "Reprodução não repetida dentro do intervalo de proteção.",
        resultado
      );

      if (resultado.contabilizado) {
        void atualizarRankingNacional();
      }
    }
  } catch (erro) {
    console.warn(
      "Não foi possível atualizar o progresso do ranking:",
      erro
    );
  } finally {
    if (
      estado.reproducaoRanking.eventoId ===
      snapshot.eventoId
    ) {
      estado.reproducaoRanking.enviando = false;
    }
  }
}

function agendarCancelamentoPorEspera() {
  limparTimeoutEsperaRanking();

  estado.reproducaoRanking.timeoutEsperaId = setTimeout(
    () => {
      void encerrarSessaoRankingAtual(
        "stream_sem_audio_por_mais_de_60_segundos"
      );
    },
    LIMITE_ESPERA_STREAM_RANKING_MS
  );
}

async function encerrarSessaoRankingAtual(motivo) {
  const controle = estado.reproducaoRanking;

  if (!controle.eventoId && !controle.iniciando) {
    reiniciarControleRanking();
    return;
  }

  pausarCronometroRanking();
  const snapshot = criarSnapshotRanking();
  const jaFinalizada = controle.finalizada;

  reiniciarControleRanking();

  if (!snapshot.eventoId || jaFinalizada) {
    return;
  }

  if (
    snapshot.segundosAcumulados >=
    TEMPO_MINIMO_RANKING_SEGUNDOS
  ) {
    try {
      const resultado = await enviarProgressoRanking(snapshot);

      if (resultado.contabilizado) {
        console.info(
          "Reprodução válida contabilizada ao encerrar o player.",
          resultado
        );
        void atualizarRankingNacional();
        return;
      }

      if (resultado.status === "duplicada") {
        return;
      }
    } catch (erro) {
      console.warn(
        "Não foi possível concluir a validação antes de encerrar:",
        erro
      );
    }
  }

  await cancelarEventoRankingServidor(snapshot, motivo);
}

function atualizarIdentidadePlayer(radio) {
  elementos.playerNome.textContent =
    radio.nomeFantasia ||
    radio.nome ||
    "Emissora";

  elementos.playerLocalizacao.textContent =
    `${montarLocalizacao(radio)} • ` +
    `${radio.classificacao?.categoriaPrincipal || "Rádio online"}`;

  atualizarInformacoesMusica(radio);
  atualizarBotoesFavorita();
  if (elementos.btnCompartilharRadio) elementos.btnCompartilharRadio.disabled = false;
  if (elementos.btnReportarRadio) elementos.btnReportarRadio.disabled = false;
  atualizarSeloPopularidadePlayer(radio);

  const novoLogo = criarLogoRadio(radio, "player-logo");

  elementos.playerLogo.replaceWith(novoLogo);
  novoLogo.id = "player-logo";
  elementos.playerLogo = novoLogo;
  atualizarAnimacaoCapa(!elementos.audio.paused);
  sincronizarModoCarro();
  atualizarMediaSession();
  iniciarAtualizacaoMusica(radio);
}

async function alternarReproducao() {
  if (!estado.radioAtual) return;

  if (elementos.audio.paused) {
    try {
      estado.usuarioPausou = false;
      estado.fechandoPlayer = false;
      estado.carregandoAudio = true;
      atualizarEstadoPlayer("Conectando...", "…");
      atualizarEstadoBuffer("Preparando áudio");
      await elementos.audio.play();
    } catch (erro) {
      estado.carregandoAudio = false;
      console.error("Falha ao reproduzir:", erro);
      atualizarEstadoPlayer("Não foi possível reproduzir", "▶");
      atualizarEstadoBuffer("Toque novamente para tentar");
    }
    return;
  }

  estado.usuarioPausou = true;
  desarmarReproducaoNaPrimeiraInteracao();
  cancelarReconexaoAutomatica();
  elementos.audio.pause();
}

function fecharPlayer() {
  desarmarReproducaoNaPrimeiraInteracao();
  estado.fechandoPlayer = true;
  estado.usuarioPausou = true;
  cancelarReconexaoAutomatica();
  pararMonitorBuffer();
  pararAtualizacaoMusica();
  pararTempoOuvido();
  pararZap(false);
  fecharPainelVolume();
  fecharModoCarro();
  void encerrarSessaoRankingAtual("player_fechado");

  elementos.audio.pause();
  elementos.audio.removeAttribute("src");
  elementos.audio.load();

  estado.radioAtual = null;
  estado.carregandoAudio = false;
  estado.fechandoPlayer = false;

  elementos.player.classList.add("hidden");
  atualizarClassesPlayerVisivel();
  if (elementos.btnCompartilharRadio) elementos.btnCompartilharRadio.disabled = true;
  if (elementos.btnReportarRadio) elementos.btnReportarRadio.disabled = true;
  document.title = "Central Rádios Brasil — Ouça rádios online do Brasil";
  atualizarMediaSession();
}

function atualizarEstadoPlayer(texto, simboloBotao) {
  elementos.playerStatus.textContent = texto;
  elementos.btnPlayPause.replaceChildren();
  elementos.btnCarroPlay.replaceChildren();

  const iconePlayer = document.createElement("span");
  iconePlayer.setAttribute("aria-hidden", "true");
  iconePlayer.textContent = simboloBotao;
  elementos.btnPlayPause.appendChild(iconePlayer);

  const iconeCarro = iconePlayer.cloneNode(true);
  elementos.btnCarroPlay.appendChild(iconeCarro);
  elementos.modoCarroStatus.textContent = texto;

  const pausando = simboloBotao === "⏸";
  elementos.btnPlayPause.setAttribute("aria-label", pausando ? "Pausar rádio" : "Reproduzir rádio");
  elementos.btnCarroPlay.setAttribute("aria-label", pausando ? "Pausar rádio" : "Reproduzir rádio");

  const nome = estado.radioAtual?.nomeFantasia || estado.radioAtual?.nome || "Rádio";
  const chaveAnuncio = `${nome}|${texto}`;
  if (estado.acessibilidade.ultimoEstadoPlayer !== chaveAnuncio) {
    estado.acessibilidade.ultimoEstadoPlayer = chaveAnuncio;
    window.CRBAcessibilidade?.anunciar(`${nome}: ${texto}`);
  }

  atualizarAnimacaoCapa(pausando);
  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = pausando ? "playing" : "paused";
  }
}

function carregarPreferenciasLocais() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE_FAVORITAS) || "[]");
    estado.favoritas = new Set(Array.isArray(salvas) ? salvas.filter(Boolean) : []);
  } catch (erro) {
    console.warn("Não foi possível carregar as favoritas:", erro);
    estado.favoritas = new Set();
  }

  try {
    const valorSalvo = localStorage.getItem(CHAVE_VOLUME);
    const salvo = valorSalvo === null ? Number.NaN : Number(valorSalvo);
    estado.volume.valor = Number.isFinite(salvo)
      ? Math.min(1, Math.max(0, salvo))
      : 0.8;
  } catch {
    estado.volume.valor = 0.8;
  }

  aplicarVolume(estado.volume.valor, false);
  atualizarQualidadeConexao();
}

function obterIdentificadorRadio(radio) {
  return String(
    radio?.id ||
    radio?.slug ||
    `${radio?.nome || "radio"}-${radio?.localizacao?.cidade || "brasil"}-${radio?.localizacao?.uf || "br"}`
  );
}

function ehFavorita(radio) {
  return Boolean(radio && estado.favoritas.has(obterIdentificadorRadio(radio)));
}

function alternarFavorita(radio) {
  if (!radio) return;
  const id = obterIdentificadorRadio(radio);
  const adicionada = !estado.favoritas.has(id);
  if (adicionada) estado.favoritas.add(id);
  else estado.favoritas.delete(id);

  try {
    localStorage.setItem(CHAVE_FAVORITAS, JSON.stringify([...estado.favoritas]));
  } catch (erro) {
    console.warn("Não foi possível salvar as favoritas:", erro);
  }

  atualizarBotoesFavorita();
  animarFavorita();
  mostrarAvisoPlayer(
    adicionada ? "❤️ Adicionada às favoritas" : "Favorita removida"
  );
  renderizarFavoritas();
  renderizarRadios();
}

function atualizarBotoesFavorita() {
  const favorita = ehFavorita(estado.radioAtual);
  const simbolo = favorita ? "♥" : "♡";
  elementos.btnPlayerFavorita.textContent = simbolo;
  elementos.btnPlayerFavorita.classList.toggle("ativa", favorita);
  elementos.btnPlayerFavorita.setAttribute("aria-pressed", String(favorita));
  elementos.btnPlayerFavorita.setAttribute("aria-label", favorita ? "Remover rádio das favoritas" : "Adicionar rádio às favoritas");

  elementos.btnCarroFavorita.textContent = `${simbolo} ${favorita ? "Favorita" : "Favoritar"}`;
  elementos.btnCarroFavorita.classList.toggle("ativa", favorita);
  elementos.btnCarroFavorita.setAttribute("aria-pressed", String(favorita));
}

function renderizarFavoritas() {
  if (!elementos.favoritas || !elementos.gradeFavoritas) return;
  const radios = estado.radios.filter(ehFavorita);
  elementos.gradeFavoritas.innerHTML = "";
  elementos.contadorFavoritas.textContent = `${radios.length} ${radios.length === 1 ? "favorita" : "favoritas"}`;
  elementos.favoritas.classList.toggle("hidden", radios.length === 0);

  const fragmento = document.createDocumentFragment();
  radios.forEach(radio => fragmento.appendChild(criarCardRadio(radio, { favorita: true })));
  elementos.gradeFavoritas.appendChild(fragmento);
}

function salvarUltimaRadio(radio) {
  try {
    localStorage.setItem(CHAVE_ULTIMA_RADIO, obterIdentificadorRadio(radio));
    renderizarContinuarOuvindo();
  } catch (erro) {
    console.warn("Não foi possível salvar a última rádio:", erro);
  }
}

function restaurarUltimaRadio() {
  let id = "";
  try { id = localStorage.getItem(CHAVE_ULTIMA_RADIO) || ""; } catch {}
  if (!id) return;
  const radio = estado.radios.find(item => obterIdentificadorRadio(item) === id);
  if (!radio) return;

  estado.radioAtual = radio;
  estado.indiceStreamAtual = 0;
  elementos.player.classList.remove("hidden");
  atualizarClassesPlayerVisivel();
  aplicarEstadoPlayerRecolhido();
  atualizarIdentidadePlayer(radio);
  const stream = obterStreamsValidos(radio)[0];
  if (stream) {
    elementos.audio.src = stream;
    elementos.audio.load();
    void tentarReproducaoAutomatica({ origem: "ultima_radio" });
    return;
  }
  atualizarEstadoPlayer("Transmissão indisponível", "▶");
  atualizarEstadoBuffer("A última rádio está temporariamente sem stream válido");
}

function prepararRadioCompartilhada() {
  const parametros = new URLSearchParams(window.location.search);
  const radioId = String(parametros.get("radio") || "").trim();
  if (!radioId) return false;

  const radio = estado.radios.find(item =>
    obterIdentificadorRadio(item) === radioId || obterRadioId(item) === radioId
  );

  if (!radio) {
    mostrarMensagem("A emissora deste link não foi encontrada no catálogo atual.");
    window.setTimeout(() => document.querySelector("#catalogo-emissoras")?.scrollIntoView({ behavior: "smooth" }), 250);
    return true;
  }

  const indice = estado.radiosFiltradas.findIndex(item => obterIdentificadorRadio(item) === obterIdentificadorRadio(radio));
  if (indice >= 0) {
    estado.paginaAtual = Math.floor(indice / estado.radiosPorPagina) + 1;
    renderizarRadios();
  }

  estado.radioAtual = radio;
  estado.indiceStreamAtual = 0;
  elementos.player.classList.remove("hidden");
  atualizarClassesPlayerVisivel();
  aplicarEstadoPlayerRecolhido();
  atualizarIdentidadePlayer(radio);
  salvarUltimaRadio(radio);

  const stream = obterStreamsValidos(radio)[0];
  if (stream) {
    elementos.audio.src = stream;
    elementos.audio.load();
    void tentarReproducaoAutomatica({ origem: "link_compartilhado" });
  } else {
    atualizarEstadoPlayer("Transmissão indisponível", "▶");
    atualizarEstadoBuffer("Esta emissora está temporariamente sem stream válido");
  }

  const nome = radio.nomeFantasia || radio.nome || "Emissora";
  document.title = `${nome} — Central Rádios Brasil`;
  window.CRBAcessibilidade?.anunciar(`${nome} aberta por um link compartilhado. Tentando iniciar a transmissão automaticamente.`);

  window.setTimeout(() => {
    const idCompartilhado = obterIdentificadorRadio(radio);
    const card = Array.from(document.querySelectorAll("[data-radio-id]")).find(
      item => item.dataset.radioId === idCompartilhado
    );
    if (card) {
      card.classList.add("radio-card-compartilhada");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => card.classList.remove("radio-card-compartilhada"), 8000);
    }
  }, 350);
  return true;
}

function tratarAtalhosDeAbertura() {
  const parametros = new URLSearchParams(window.location.search);
  if (parametros.get("abrir") === "favoritas") {
    elementos.favoritas?.classList.remove("hidden");
    window.setTimeout(() => elementos.favoritas?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  }
  if (parametros.get("modo") === "carro") {
    window.setTimeout(abrirModoCarro, 250);
  }
}

function obterStreamsValidos(radio) {
  const lista = [];
  const adicionar = valor => {
    const url = String(valor || "").trim();
    if (url && !lista.includes(url)) lista.push(url);
  };
  adicionar(radio?.streamPrincipal?.url);
  const streams = Array.isArray(radio?.streams) ? [...radio.streams] : [];
  streams.sort((a, b) => Number(Boolean(b?.principal)) - Number(Boolean(a?.principal)));
  streams.forEach(stream => adicionar(stream?.url));
  return lista;
}

function agendarReconexaoAutomatica(motivo, atrasoPersonalizado = null) {
  if (!estado.radioAtual || estado.usuarioPausou || estado.fechandoPlayer) return;
  if (!navigator.onLine) {
    atualizarEstadoPlayer("Sem internet", "…");
    atualizarEstadoBuffer("Aguardando a conexão voltar");
    return;
  }
  if (estado.reconexao.timerId) return;

  const indice = Math.min(estado.reconexao.tentativa, ATRASOS_RECONEXAO_MS.length - 1);
  const atraso = atrasoPersonalizado ?? ATRASOS_RECONEXAO_MS[indice];
  estado.reconexao.motivo = motivo;
  atualizarEstadoPlayer(`Reconectando em ${Math.max(1, Math.ceil(atraso / 1000))}s`, "…");

  estado.reconexao.timerId = window.setTimeout(() => {
    estado.reconexao.timerId = null;
    void executarReconexaoAutomatica();
  }, atraso);
}

function cancelarReconexaoAutomatica() {
  if (estado.reconexao.timerId) window.clearTimeout(estado.reconexao.timerId);
  estado.reconexao.timerId = null;
}

async function executarReconexaoAutomatica() {
  if (!estado.radioAtual || estado.usuarioPausou || estado.fechandoPlayer || !navigator.onLine) return;

  const streams = obterStreamsValidos(estado.radioAtual);
  if (streams.length === 0) return;

  estado.reconexao.tentativa += 1;
  if (streams.length > 1 && estado.reconexao.tentativa > 1 && estado.reconexao.tentativa % 2 === 0) {
    estado.indiceStreamAtual = (estado.indiceStreamAtual + 1) % streams.length;
  }

  atualizarEstadoPlayer(`Reconectando • tentativa ${estado.reconexao.tentativa}`, "…");
  atualizarEstadoBuffer(streams.length > 1 && estado.indiceStreamAtual > 0 ? "Usando transmissão reserva" : "Restabelecendo transmissão");

  try {
    elementos.audio.src = streams[estado.indiceStreamAtual];
    elementos.audio.load();
    await elementos.audio.play();
  } catch (erro) {
    console.warn("Reconexão automática não concluída:", erro);
    agendarReconexaoAutomatica("nova_tentativa");
  }
}

function iniciarMonitorBuffer() {
  pararMonitorBuffer();
  estado.buffer.ultimoTempo = Number(elementos.audio.currentTime || 0);
  estado.buffer.ultimoAvancoEm = Date.now();
  estado.buffer.intervaloId = window.setInterval(verificarSaudeBuffer, INTERVALO_MONITOR_BUFFER_MS);
}

function pararMonitorBuffer() {
  if (estado.buffer.intervaloId) window.clearInterval(estado.buffer.intervaloId);
  estado.buffer.intervaloId = null;
}

function verificarSaudeBuffer() {
  if (!estado.radioAtual || elementos.audio.paused) return;
  const atual = Number(elementos.audio.currentTime || 0);
  if (Number.isFinite(atual) && atual > estado.buffer.ultimoTempo + 0.15) {
    estado.buffer.ultimoTempo = atual;
    estado.buffer.ultimoAvancoEm = Date.now();
  }

  let segundosAdiante = 0;
  try {
    const faixas = elementos.audio.buffered;
    if (faixas.length) segundosAdiante = Math.max(0, faixas.end(faixas.length - 1) - atual);
  } catch {}

  if (elementos.audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    atualizarEstadoBuffer(segundosAdiante >= 3 ? `Estabilidade boa • ${Math.round(segundosAdiante)}s disponíveis` : "Transmissão estável");
    if (estado.conexao.oscilacoesRecentes === 0) atualizarQualidadeConexao();
  } else {
    atualizarEstadoBuffer("Estabilidade reduzida");
    registrarOscilacaoConexao();
  }

  if (Date.now() - estado.buffer.ultimoAvancoEm > LIMITE_TRAVAMENTO_AUDIO_MS) {
    atualizarEstadoBuffer("Áudio sem avanço • reconectando");
    agendarReconexaoAutomatica("audio_sem_avanco", 250);
  }
}

function atualizarEstadoBuffer(texto) {
  elementos.playerBuffer.textContent = texto;
  elementos.modoCarroBuffer.textContent = texto;
}


function atualizarAnimacaoCapa(tocando) {
  elementos.playerLogo?.classList.toggle("tocando", Boolean(tocando));
  elementos.modoCarroLogo?.classList.toggle("tocando", Boolean(tocando));
  elementos.player?.classList.toggle("player-tocando", Boolean(tocando));
}

function animarFavorita() {
  [elementos.btnPlayerFavorita, elementos.btnCarroFavorita]
    .filter(Boolean)
    .forEach(botao => {
      botao.classList.remove("favorita-pulso");
      void botao.offsetWidth;
      botao.classList.add("favorita-pulso");
      window.setTimeout(() => botao.classList.remove("favorita-pulso"), 700);
    });
}

function mostrarAvisoPlayer(texto) {
  if (!elementos.playerToast) return;
  if (estado.toastTimerId) window.clearTimeout(estado.toastTimerId);
  elementos.playerToast.textContent = texto;
  elementos.playerToast.classList.remove("hidden");
  window.CRBAcessibilidade?.anunciar(texto);
  estado.toastTimerId = window.setTimeout(() => {
    elementos.playerToast.classList.add("hidden");
  }, 2600);
}

function formatarTempoOuvido(segundos) {
  const total = Math.max(0, Math.floor(segundos));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segundosRestantes = total % 60;
  return horas > 0
    ? `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`
    : `${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;
}

function obterTempoOuvidoSegundos() {
  const controle = estado.tempoOuvido;
  const adicional = controle.inicioPerformance !== null
    ? Math.max(0, (performance.now() - controle.inicioPerformance) / 1000)
    : 0;
  return controle.acumuladoSegundos + adicional;
}

function definirTextoComIcone(elemento, icone, texto) {
  if (!elemento) return;
  const decorativo = document.createElement("span");
  decorativo.setAttribute("aria-hidden", "true");
  decorativo.textContent = icone;
  elemento.replaceChildren(decorativo, document.createTextNode(` ${texto}`));
}

function definirBotaoComIcone(botao, icone, texto, ariaLabel = texto) {
  if (!botao) return;
  definirTextoComIcone(botao, icone, texto);
  botao.setAttribute("aria-label", ariaLabel);
}

function atualizarTempoOuvidoTela() {
  const texto = `Ouvindo há ${formatarTempoOuvido(obterTempoOuvidoSegundos())}`;
  definirTextoComIcone(elementos.playerTempo, "▶", texto);
  definirTextoComIcone(elementos.modoCarroTempo, "▶", texto);
}

function iniciarTempoOuvido() {
  const controle = estado.tempoOuvido;
  if (controle.inicioPerformance === null) {
    controle.inicioPerformance = performance.now();
  }
  if (!controle.intervaloId) {
    controle.intervaloId = window.setInterval(
      atualizarTempoOuvidoTela,
      INTERVALO_TEMPO_OUVIDO_MS
    );
  }
  atualizarTempoOuvidoTela();
}

function pausarTempoOuvido() {
  const controle = estado.tempoOuvido;
  if (controle.inicioPerformance !== null) {
    controle.acumuladoSegundos += Math.max(
      0,
      (performance.now() - controle.inicioPerformance) / 1000
    );
    controle.inicioPerformance = null;
  }
  atualizarTempoOuvidoTela();
}

function pararTempoOuvido() {
  pausarTempoOuvido();
  if (estado.tempoOuvido.intervaloId) {
    window.clearInterval(estado.tempoOuvido.intervaloId);
    estado.tempoOuvido.intervaloId = null;
  }
}

function resetarTempoOuvido() {
  pararTempoOuvido();
  estado.tempoOuvido.acumuladoSegundos = 0;
  estado.tempoOuvido.inicioPerformance = null;
  atualizarTempoOuvidoTela();
}

function detectarQualidadeConexao() {
  if (!navigator.onLine || estado.conexao.nivelForcado === "offline") {
    return { codigo: "offline", texto: "⚫ Sem conexão", nivel: 0 };
  }

  if (estado.conexao.oscilacoesRecentes >= 3) {
    return { codigo: "fraca", texto: "🔴 Conexão fraca", nivel: 1 };
  }

  if (estado.conexao.oscilacoesRecentes >= 1) {
    return { codigo: "media", texto: "🟡 Conexão oscilando", nivel: 2 };
  }

  const conexao = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const tipo = String(conexao?.effectiveType || "").toLowerCase();
  const downlink = Number(conexao?.downlink || 0);

  if (tipo === "slow-2g" || tipo === "2g") {
    return { codigo: "fraca", texto: "🔴 Conexão fraca", nivel: 1 };
  }

  if (tipo === "3g") {
    return { codigo: "media", texto: "🟡 Conexão média", nivel: 2 };
  }

  if (tipo === "4g" && downlink >= 5) {
    return { codigo: "excelente", texto: "🟢 Conexão excelente", nivel: 4 };
  }

  return { codigo: "estavel", texto: "🟢 Conexão estável", nivel: 3 };
}

function atualizarQualidadeConexao() {
  const qualidade = detectarQualidadeConexao();
  [elementos.playerConexao, elementos.modoCarroConexao]
    .filter(Boolean)
    .forEach(alvo => {
      const correspondencia = qualidade.texto.match(/^(\S+)\s+(.*)$/u);
      definirTextoComIcone(
        alvo,
        correspondencia?.[1] || "",
        correspondencia?.[2] || qualidade.texto
      );
      alvo.dataset.nivel = qualidade.codigo;
    });

  [elementos.playerEstabilidadeBarra, elementos.modoCarroEstabilidadeBarra]
    .filter(Boolean)
    .forEach(barra => {
      barra.dataset.nivel = qualidade.codigo;
      barra.style.width = `${qualidade.nivel * 25}%`;
    });
}

function registrarOscilacaoConexao() {
  estado.conexao.oscilacoesRecentes = Math.min(
    5,
    estado.conexao.oscilacoesRecentes + 1
  );
  atualizarQualidadeConexao();
  window.setTimeout(() => {
    estado.conexao.oscilacoesRecentes = Math.max(
      0,
      estado.conexao.oscilacoesRecentes - 1
    );
    atualizarQualidadeConexao();
  }, 30000);
}

function aplicarVolume(valor, persistir = true) {
  const normalizado = Math.min(1, Math.max(0, Number(valor) || 0));
  estado.volume.valor = normalizado;
  try {
    elementos.audio.volume = normalizado;
    elementos.audio.muted = false;
  } catch (erro) {
    console.info("O navegador controla o volume pelo próprio aparelho.", erro);
  }

  if (persistir) {
    try { localStorage.setItem(CHAVE_VOLUME, String(normalizado)); } catch {}
  }
  atualizarControlesVolume();
}

function atualizarControlesVolume() {
  const percentual = Math.round(estado.volume.valor * 100);
  if (elementos.playerVolume) elementos.playerVolume.value = String(percentual);
  if (elementos.carroVolume) elementos.carroVolume.value = String(percentual);
  if (elementos.btnVolume) {
    const icone = percentual === 0 ? "🔇" : percentual < 45 ? "🔉" : "🔊";
    definirBotaoComIcone(
      elementos.btnVolume,
      icone,
      "",
      `Controlar volume, ${percentual}%`
    );
  }
}

function alternarPainelVolume() {
  const abrindo = elementos.playerVolumePopover.classList.contains("hidden");
  elementos.playerVolumePopover.classList.toggle("hidden", !abrindo);
  elementos.btnVolume.setAttribute("aria-expanded", String(abrindo));
  if (abrindo) elementos.playerVolume.focus();
}

function fecharPainelVolume() {
  elementos.playerVolumePopover?.classList.add("hidden");
  elementos.btnVolume?.setAttribute("aria-expanded", "false");
}

async function solicitarWakeLock() {
  if (!("wakeLock" in navigator)) {
    estado.wakeLock.solicitado = false;
    mostrarAvisoPlayer("Tela sempre ligada não está disponível neste navegador");
    atualizarControlesWakeLock();
    return;
  }

  try {
    estado.wakeLock.sentinela = await navigator.wakeLock.request("screen");
    estado.wakeLock.sentinela.addEventListener("release", () => {
      estado.wakeLock.sentinela = null;
      atualizarControlesWakeLock();
    });
    mostrarAvisoPlayer("☀️ Tela permanecerá ligada no Modo Carro");
  } catch (erro) {
    estado.wakeLock.solicitado = false;
    console.warn("Não foi possível manter a tela ligada:", erro);
    mostrarAvisoPlayer("Não foi possível manter a tela ligada");
  }
  atualizarControlesWakeLock();
}

async function liberarWakeLock() {
  const sentinela = estado.wakeLock.sentinela;
  estado.wakeLock.sentinela = null;
  if (sentinela) {
    try { await sentinela.release(); } catch {}
  }
}

async function alternarTelaLigada() {
  estado.wakeLock.solicitado = !estado.wakeLock.solicitado;
  if (estado.wakeLock.solicitado) await solicitarWakeLock();
  else {
    await liberarWakeLock();
    mostrarAvisoPlayer("Tela sempre ligada desativada");
  }
  atualizarControlesWakeLock();
}

function atualizarControlesWakeLock() {
  if (!elementos.btnCarroTelaLigada) return;
  const ativa = Boolean(estado.wakeLock.solicitado && estado.wakeLock.sentinela);
  elementos.btnCarroTelaLigada.classList.toggle("ativa", ativa);
  elementos.btnCarroTelaLigada.setAttribute("aria-pressed", String(ativa));
  definirBotaoComIcone(
    elementos.btnCarroTelaLigada,
    "☀️",
    ativa ? "Tela ligada" : "Manter tela ligada",
    ativa ? "Desativar tela sempre ligada" : "Manter tela ligada"
  );
}

function tratarVisibilidadeWakeLock() {
  if (
    document.visibilityState === "visible" &&
    estado.wakeLock.solicitado &&
    !estado.wakeLock.sentinela &&
    !elementos.modoCarro.classList.contains("hidden")
  ) {
    void solicitarWakeLock();
  }
}

function escolherProximaRadioZap() {
  const lista = estado.radios.filter(radio =>
    obterIdentificadorRadio(radio) !== obterIdentificadorRadio(estado.radioAtual)
  );
  if (!lista.length) return null;
  return lista[Math.floor(Math.random() * lista.length)];
}

function atualizarControlesZap() {
  const ativa = estado.zap.ativo;
  elementos.btnZap?.classList.toggle("ativa", ativa);
  elementos.btnZap?.setAttribute("aria-pressed", String(ativa));
  elementos.btnZap?.setAttribute("aria-label", ativa ? "Parar modo ZAP" : "Iniciar modo ZAP");
  if (elementos.btnCarroZap) {
    elementos.btnCarroZap.classList.toggle("ativa", ativa);
    elementos.btnCarroZap.setAttribute("aria-pressed", String(ativa));
    definirBotaoComIcone(
      elementos.btnCarroZap,
      ativa ? "■" : "📡",
      ativa ? "Parar ZAP" : "Iniciar ZAP",
      ativa ? "Parar modo ZAP" : "Iniciar modo ZAP"
    );
  }

  [elementos.playerZapStatus, elementos.modoCarroZapStatus]
    .filter(Boolean)
    .forEach(alvo => alvo.classList.toggle("hidden", !ativa));
}

function atualizarContagemZap() {
  if (!estado.zap.ativo) return;
  const restantes = Math.max(
    0,
    Math.ceil((estado.zap.proximaTrocaEm - Date.now()) / 1000)
  );
  const texto = `ZAP ativo • próxima rádio em ${restantes}s`;
  definirTextoComIcone(elementos.playerZapStatus, "📡", texto);
  definirTextoComIcone(elementos.modoCarroZapStatus, "📡", texto);
}

function programarProximaTrocaZap() {
  if (!estado.zap.ativo) return;
  if (estado.zap.timeoutId) window.clearTimeout(estado.zap.timeoutId);
  if (estado.zap.intervaloId) window.clearInterval(estado.zap.intervaloId);

  estado.zap.proximaTrocaEm = Date.now() + DURACAO_ZAP_SEGUNDOS * 1000;
  atualizarContagemZap();
  estado.zap.intervaloId = window.setInterval(atualizarContagemZap, 1000);
  estado.zap.timeoutId = window.setTimeout(() => {
    const proxima = escolherProximaRadioZap();
    if (proxima) void selecionarRadio(proxima, { origemZap: true });
    programarProximaTrocaZap();
  }, DURACAO_ZAP_SEGUNDOS * 1000);
}

function iniciarZap() {
  if (estado.radios.length < 2) {
    mostrarAvisoPlayer("São necessárias pelo menos duas rádios para usar o ZAP");
    return;
  }

  estado.zap.ativo = true;
  atualizarControlesZap();
  mostrarAvisoPlayer("📡 ZAP iniciado • descubra uma rádio a cada 20 segundos");

  if (!estado.radioAtual) {
    const primeira = estado.radios[Math.floor(Math.random() * estado.radios.length)];
    void selecionarRadio(primeira, { origemZap: true });
  }
  programarProximaTrocaZap();
}

function pararZap(mostrarAviso = true) {
  if (estado.zap.timeoutId) window.clearTimeout(estado.zap.timeoutId);
  if (estado.zap.intervaloId) window.clearInterval(estado.zap.intervaloId);
  const estavaAtivo = estado.zap.ativo;
  estado.zap.ativo = false;
  estado.zap.timeoutId = null;
  estado.zap.intervaloId = null;
  estado.zap.proximaTrocaEm = 0;
  atualizarControlesZap();
  if (mostrarAviso && estavaAtivo) mostrarAvisoPlayer("ZAP encerrado nesta rádio");
}

function alternarZap() {
  if (estado.zap.ativo) pararZap(true);
  else iniciarZap();
}

function obterListaNavegacao() {
  const favoritas = estado.radios.filter(ehFavorita);
  if (estado.radioAtual && ehFavorita(estado.radioAtual) && favoritas.length > 1) return favoritas;
  return estado.radios;
}

function tocarRadioRelativa(direcao) {
  const lista = obterListaNavegacao();
  if (!lista.length) return;
  const atualId = obterIdentificadorRadio(estado.radioAtual);
  let indice = lista.findIndex(radio => obterIdentificadorRadio(radio) === atualId);
  if (indice < 0) indice = direcao > 0 ? -1 : 0;
  const proximo = (indice + direcao + lista.length) % lista.length;
  void selecionarRadio(lista[proximo]);
  if (estado.zap.ativo) programarProximaTrocaZap();
}

function abrirModoCarro() {
  sincronizarModoCarro();
  document.body.classList.add("modo-carro-aberto");
  window.CRBAcessibilidade?.abrirDialogo(elementos.modoCarro, {
    focoInicial: elementos.btnSairModoCarro,
    anuncio: "Modo carro aberto.",
    aoFechar: concluirFechamentoModoCarro
  });
  atualizarControlesWakeLock();
}

function concluirFechamentoModoCarro() {
  document.body.classList.remove("modo-carro-aberto");
  estado.wakeLock.solicitado = false;
  void liberarWakeLock();
  atualizarControlesWakeLock();
}

function fecharModoCarro() {
  if (window.CRBAcessibilidade?.dialogoEstaAberto(elementos.modoCarro)) {
    window.CRBAcessibilidade.fecharDialogo({ anuncio: "Modo carro fechado." });
    return;
  }

  elementos.modoCarro.classList.add("hidden");
  elementos.modoCarro.hidden = true;
  elementos.modoCarro.setAttribute("aria-hidden", "true");
  concluirFechamentoModoCarro();
}

function sincronizarModoCarro() {
  const radio = estado.radioAtual;
  if (!radio) return;
  elementos.modoCarroNome.textContent = radio.nomeFantasia || radio.nome || "Emissora";
  elementos.modoCarroLocalizacao.textContent = `${montarLocalizacao(radio)} • ${radio.classificacao?.categoriaPrincipal || "Rádio online"}`;
  atualizarTextoMusicaElemento(elementos.modoCarroMusica, montarTextoMusica());
  atualizarSeloPopularidadePlayer(radio);

  const novoLogo = criarLogoRadio(radio, "modo-carro-logo");
  elementos.modoCarroLogo.replaceWith(novoLogo);
  novoLogo.id = "modo-carro-logo";
  elementos.modoCarroLogo = novoLogo;
  atualizarAnimacaoCapa(!elementos.audio.paused);
  atualizarBotoesFavorita();
  atualizarTempoOuvidoTela();
  atualizarQualidadeConexao();
  atualizarControlesZap();
  atualizarControlesVolume();
}

function extrairInformacoesMusica(valor) {
  if (!valor) return null;
  if (typeof valor === "string") {
    const texto = valor.trim();
    if (!texto) return null;
    const partes = texto.split(/\s+-\s+/);
    if (partes.length >= 2) return { artista: partes.shift(), titulo: partes.join(" - ") };
    return { titulo: texto, artista: "" };
  }
  if (typeof valor !== "object") return null;
  const titulo = valor.titulo || valor.title || valor.musica || valor.song || valor.track || valor.currentSong;
  const artista = valor.artista || valor.artist || valor.cantor || valor.author || "";
  return titulo ? { titulo: String(titulo), artista: String(artista || "") } : null;
}

function obterInformacoesMusicaDoRadio(radio) {
  const candidatos = [radio?.agoraTocando, radio?.musicaAtual, radio?.metadata, radio?.metadados, radio?.programacao?.agora];
  for (const candidato of candidatos) {
    const dados = extrairInformacoesMusica(candidato);
    if (dados) return dados;
  }
  return { titulo: "Programação ao vivo", artista: "" };
}

function atualizarTextoMusicaElemento(elemento, texto) {
  if (!elemento) return;
  if (texto === "Programação ao vivo") {
    definirTextoComIcone(elemento, "🎙️", texto);
    return;
  }
  elemento.textContent = texto;
}

function atualizarInformacoesMusica(radio, dados = null) {
  const info = dados || obterInformacoesMusicaDoRadio(radio);
  estado.musicaAtual = {
    titulo: info.titulo || "Programação ao vivo",
    artista: info.artista || "",
    intervaloId: estado.musicaAtual.intervaloId || null
  };
  const texto = montarTextoMusica();
  atualizarTextoMusicaElemento(elementos.playerMusica, texto);
  atualizarTextoMusicaElemento(elementos.modoCarroMusica, texto);
  atualizarMediaSession();
}

function montarTextoMusica() {
  return estado.musicaAtual.artista ? `${estado.musicaAtual.artista} — ${estado.musicaAtual.titulo}` : estado.musicaAtual.titulo;
}

function obterUrlMetadados(radio) {
  return String(radio?.metadataUrl || radio?.metadadosUrl || radio?.metadados?.url || radio?.metadata?.url || "").trim();
}

function iniciarAtualizacaoMusica(radio) {
  pararAtualizacaoMusica();
  const url = obterUrlMetadados(radio);
  if (!url) return;
  const consultar = async () => {
    try {
      const resposta = await fetch(url, { cache: "no-store" });
      if (!resposta.ok) return;
      const tipo = resposta.headers.get("content-type") || "";
      const dadosBrutos = tipo.includes("json") ? await resposta.json() : await resposta.text();
      const dados = extrairInformacoesMusica(dadosBrutos?.nowPlaying || dadosBrutos?.current || dadosBrutos?.song || dadosBrutos);
      if (dados) atualizarInformacoesMusica(radio, dados);
    } catch (erro) {
      console.info("Metadados musicais indisponíveis para esta emissora.", erro);
    }
  };
  void consultar();
  estado.musicaAtual.intervaloId = window.setInterval(consultar, 30000);
}

function pararAtualizacaoMusica() {
  if (estado.musicaAtual.intervaloId) window.clearInterval(estado.musicaAtual.intervaloId);
  estado.musicaAtual.intervaloId = null;
}

function configurarMediaSession() {
  if (!("mediaSession" in navigator)) return;
  const definir = (acao, funcao) => {
    try { navigator.mediaSession.setActionHandler(acao, funcao); } catch {}
  };
  definir("play", () => {
    if (elementos.audio.paused) void alternarReproducao();
  });
  definir("pause", () => {
    if (!elementos.audio.paused) void alternarReproducao();
  });
  definir("stop", fecharPlayer);
  definir("previoustrack", () => tocarRadioRelativa(-1));
  definir("nexttrack", () => tocarRadioRelativa(1));
}

function atualizarMediaSession() {
  if (!("mediaSession" in navigator)) return;
  if (!estado.radioAtual) {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = "none";
    return;
  }
  const radio = estado.radioAtual;
  const logo = obterUrlLogo(radio) || new URL("icons/icon-512-v22113.png", document.baseURI).href;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: estado.musicaAtual.titulo || radio.nomeFantasia || radio.nome || "Central Rádios Brasil",
      artist: estado.musicaAtual.artista || radio.nomeFantasia || radio.nome || "Central Rádios Brasil",
      album: `${montarLocalizacao(radio)} • ${radio.classificacao?.categoriaPrincipal || "Rádio online"}`,
      artwork: [
        { src: logo, sizes: "512x512", type: logo.toLowerCase().includes(".png") ? "image/png" : "image/jpeg" }
      ]
    });
    navigator.mediaSession.playbackState = elementos.audio.paused ? "paused" : "playing";
  } catch (erro) {
    console.info("Controles de mídia parcialmente indisponíveis.", erro);
  }
}

function criarLinkCompartilhavelRadio(radio) {
  const url = new URL("https://centralradiosbrasil.com.br/");
  url.searchParams.set("radio", obterIdentificadorRadio(radio));
  return url.href;
}

async function copiarLinkCompartilhavel(texto) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(texto);
    return;
  }
  const campo = document.createElement("textarea");
  campo.value = texto;
  campo.setAttribute("readonly", "");
  campo.style.position = "fixed";
  campo.style.opacity = "0";
  document.body.appendChild(campo);
  campo.select();
  document.execCommand("copy");
  campo.remove();
}

async function compartilharRadio(radio) {
  if (!radio) return;
  const nome = radio.nomeFantasia || radio.nome || "esta emissora";
  const link = criarLinkCompartilhavelRadio(radio);
  const dados = {
    title: `${nome} — Central Rádios Brasil`,
    text: `Ouça ${nome} na Central Rádios Brasil.`,
    url: link
  };

  try {
    if (navigator.share) {
      await navigator.share(dados);
      return;
    }
    await copiarLinkCompartilhavel(link);
    mostrarAvisoPlayer("Link desta emissora copiado");
  } catch (erro) {
    if (erro?.name !== "AbortError") console.error("Erro ao compartilhar:", erro);
  }
}



function abrirOcorrenciaRadio(radio) {
  if (!radio) return;
  const url = new URL("ocorrencias/", window.location.href);
  url.searchParams.set("tipo", "radio_fora_do_ar");
  url.searchParams.set("radio", obterIdentificadorRadio(radio));
  window.location.href = url.href;
}

const REGIOES_BRASIL = {
  Norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
  Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MT", "MS"],
  Sudeste: ["ES", "MG", "RJ", "SP"],
  Sul: ["PR", "RS", "SC"]
};

const ICONES_REGIOES = {
  Norte: "🌿",
  Nordeste: "☀️",
  "Centro-Oeste": "◆",
  Sudeste: "🏙️",
  Sul: "🧭"
};

const ESTADOS_BRASIL = {
  AC: { nome: "Acre", regiao: "Norte", x: 12, y: 49 },
  AM: { nome: "Amazonas", regiao: "Norte", x: 27, y: 34 },
  RR: { nome: "Roraima", regiao: "Norte", x: 31, y: 13 },
  AP: { nome: "Amapá", regiao: "Norte", x: 59, y: 13 },
  PA: { nome: "Pará", regiao: "Norte", x: 52, y: 31 },
  RO: { nome: "Rondônia", regiao: "Norte", x: 27, y: 52 },
  TO: { nome: "Tocantins", regiao: "Norte", x: 56, y: 48 },
  MA: { nome: "Maranhão", regiao: "Nordeste", x: 69, y: 37 },
  PI: { nome: "Piauí", regiao: "Nordeste", x: 74, y: 48 },
  CE: { nome: "Ceará", regiao: "Nordeste", x: 84, y: 44 },
  RN: { nome: "Rio Grande do Norte", regiao: "Nordeste", x: 93, y: 45, pequeno: true },
  PB: { nome: "Paraíba", regiao: "Nordeste", x: 92, y: 51, pequeno: true },
  PE: { nome: "Pernambuco", regiao: "Nordeste", x: 87, y: 56 },
  AL: { nome: "Alagoas", regiao: "Nordeste", x: 88, y: 62, pequeno: true },
  SE: { nome: "Sergipe", regiao: "Nordeste", x: 84, y: 66, pequeno: true },
  BA: { nome: "Bahia", regiao: "Nordeste", x: 73, y: 62 },
  MT: { nome: "Mato Grosso", regiao: "Centro-Oeste", x: 43, y: 55 },
  MS: { nome: "Mato Grosso do Sul", regiao: "Centro-Oeste", x: 43, y: 72 },
  GO: { nome: "Goiás", regiao: "Centro-Oeste", x: 58, y: 66 },
  DF: { nome: "Distrito Federal", regiao: "Centro-Oeste", x: 61, y: 63, pequeno: true },
  MG: { nome: "Minas Gerais", regiao: "Sudeste", x: 69, y: 73 },
  ES: { nome: "Espírito Santo", regiao: "Sudeste", x: 81, y: 75, pequeno: true },
  RJ: { nome: "Rio de Janeiro", regiao: "Sudeste", x: 75, y: 82, pequeno: true },
  SP: { nome: "São Paulo", regiao: "Sudeste", x: 61, y: 80 },
  PR: { nome: "Paraná", regiao: "Sul", x: 56, y: 87 },
  SC: { nome: "Santa Catarina", regiao: "Sul", x: 58, y: 92, pequeno: true },
  RS: { nome: "Rio Grande do Sul", regiao: "Sul", x: 51, y: 96 }
};

const ICONES_CATEGORIAS = {
  Gospel: "🙏",
  Sertanejo: "🤠",
  Notícias: "📰",
  Eclética: "🎶",
  Pop: "🎤",
  Rock: "🎸",
  Forró: "🪗",
  Comunitária: "🤝",
  Esportes: "⚽",
  Católica: "⛪"
};

function renderizarDescobertaHome() {
  renderizarContinuarOuvindo();
  renderizarRecemChegadas();
  renderizarMapaSonoro();
  renderizarVerificadas();
  renderizarCategoriasDestaque();
}

function preencherGradeDescoberta(container, radios) {
  if (!container) return;
  container.innerHTML = "";
  const fragmento = document.createDocumentFragment();
  radios.forEach(radio => fragmento.appendChild(criarCardRadio(radio)));
  container.appendChild(fragmento);
}

function obterUltimaRadioSalva() {
  let id = "";
  try { id = localStorage.getItem(CHAVE_ULTIMA_RADIO) || ""; } catch {}
  if (!id) return null;
  return estado.radios.find(radio => obterIdentificadorRadio(radio) === id) || null;
}

function renderizarContinuarOuvindo() {
  if (!elementos.continuarOuvindo || !elementos.continuarOuvindoConteudo || !estado.radios.length) return;
  const radio = obterUltimaRadioSalva();
  elementos.continuarOuvindoConteudo.innerHTML = "";
  elementos.continuarOuvindo.classList.toggle("hidden", !radio);
  if (!radio) return;

  const nome = radio.nomeFantasia || radio.nome || "Emissora";
  const card = document.createElement("article");
  card.className = "continuar-card";

  const logo = criarLogoRadio(radio, "continuar-card-logo");
  const info = document.createElement("div");
  info.className = "continuar-card-info";
  const etiqueta = document.createElement("span");
  etiqueta.className = "continuar-card-etiqueta";
  etiqueta.textContent = "Última rádio ouvida";
  const titulo = document.createElement("h3");
  titulo.textContent = nome;
  const detalhe = document.createElement("p");
  detalhe.textContent = `${montarLocalizacao(radio)} • ${radio.classificacao?.categoriaPrincipal || "Rádio online"}`;
  info.append(etiqueta, titulo, detalhe);

  const acao = document.createElement("button");
  acao.type = "button";
  acao.className = "continuar-card-acao";
  acao.innerHTML = '<span aria-hidden="true">▶</span><span>Continuar ouvindo</span>';
  acao.setAttribute("aria-label", `Continuar ouvindo ${nome}`);
  acao.addEventListener("click", () => selecionarRadio(radio));

  card.append(logo, info, acao);
  elementos.continuarOuvindoConteudo.appendChild(card);
}

function renderizarRecemChegadas() {
  if (!elementos.recemChegadas || !elementos.gradeRecemChegadas) return;
  const radios = estado.radios
    .map(radio => ({ radio, data: obterDataPublicacaoRadio(radio) }))
    .filter(item => item.data)
    .sort((a, b) => b.data.getTime() - a.data.getTime())
    .slice(0, 6)
    .map(item => item.radio);
  elementos.recemChegadas.classList.toggle("hidden", radios.length === 0);
  preencherGradeDescoberta(elementos.gradeRecemChegadas, radios);
}

function obterNomeRegiaoPorUf(uf) {
  const sigla = String(uf || "").toUpperCase();
  return Object.entries(REGIOES_BRASIL).find(([, ufs]) => ufs.includes(sigla))?.[0] || "";
}

function obterUfsDaRegiao(regiao) {
  return REGIOES_BRASIL[regiao] || [];
}

function normalizarCidadeMapa(valor) {
  const texto = String(valor || "").trim().replace(/\s+/g, " ");
  if (!texto) return "";
  const conectivos = new Set(["da", "das", "de", "do", "dos", "e"]);
  return texto
    .toLocaleLowerCase("pt-BR")
    .split(" ")
    .map((parte, indice) => indice > 0 && conectivos.has(parte)
      ? parte
      : `${parte.charAt(0).toLocaleUpperCase("pt-BR")}${parte.slice(1)}`)
    .join(" ");
}

function obterRadiosRecorteMapa() {
  let radios = [...estado.radios];
  if (estado.mapaCidadeSelecionada && estado.mapaCidadeUfSelecionada) {
    radios = radios.filter(radio =>
      String(radio.localizacao?.uf || "").toUpperCase() === estado.mapaCidadeUfSelecionada &&
      normalizarCidadeMapa(radio.localizacao?.cidade) === estado.mapaCidadeSelecionada
    );
  } else if (estado.mapaUfSelecionada) {
    radios = radios.filter(radio => String(radio.localizacao?.uf || "").toUpperCase() === estado.mapaUfSelecionada);
  } else if (estado.mapaRegiaoSelecionada) {
    const ufs = obterUfsDaRegiao(estado.mapaRegiaoSelecionada);
    radios = radios.filter(radio => ufs.includes(String(radio.localizacao?.uf || "").toUpperCase()));
  }
  return radios;
}

function obterResumoCidadesMapa(radios) {
  const mapa = new Map();
  radios.forEach(radio => {
    const cidade = normalizarCidadeMapa(radio.localizacao?.cidade);
    const uf = String(radio.localizacao?.uf || "").toUpperCase();
    if (!cidade || !uf) return;
    const chave = `${uf}|${cidade.toLocaleLowerCase("pt-BR")}`;
    const data = obterDataPublicacaoRadio(radio);
    if (!mapa.has(chave)) {
      mapa.set(chave, { cidade, uf, total: 0, primeiraData: data || null });
    }
    const item = mapa.get(chave);
    item.total += 1;
    if (data && (!item.primeiraData || data < item.primeiraData)) item.primeiraData = data;
  });
  return [...mapa.values()];
}

function obterCidadeRecemChegada(radios) {
  return obterResumoCidadesMapa(radios)
    .filter(item => item.primeiraData)
    .sort((a, b) => b.primeiraData.getTime() - a.primeiraData.getTime())[0] || null;
}


const CORES_REDE_MAPA = {
  Norte: "#46efb3",
  Nordeste: "#ffd166",
  "Centro-Oeste": "#37e6ff",
  Sudeste: "#6ca8ff",
  Sul: "#d48cff"
};

function hashVisualMapa(texto) {
  let hash = 2166136261;
  for (const caractere of String(texto || "")) {
    hash ^= caractere.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function limitarCoordenadaMapa(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function obterPontosRedeMapa(radios) {
  const grupos = new Map();
  radios.forEach(radio => {
    const cidade = normalizarCidadeMapa(radio.localizacao?.cidade);
    const uf = String(radio.localizacao?.uf || "").toUpperCase();
    if (!cidade || !ESTADOS_BRASIL[uf]) return;
    const chave = `${uf}|${cidade.toLocaleLowerCase("pt-BR")}`;
    if (!grupos.has(chave)) grupos.set(chave, { chave, cidade, uf, radios: [] });
    grupos.get(chave).radios.push(radio);
  });

  const porUf = new Map();
  [...grupos.values()].forEach(grupo => {
    if (!porUf.has(grupo.uf)) porUf.set(grupo.uf, []);
    porUf.get(grupo.uf).push(grupo);
  });

  const pontos = [];
  porUf.forEach((itens, uf) => {
    const base = ESTADOS_BRASIL[uf];
    itens
      .sort((a, b) => b.radios.length - a.radios.length || a.cidade.localeCompare(b.cidade, "pt-BR"))
      .forEach((grupo, indice) => {
        const semente = hashVisualMapa(grupo.chave);
        const angulo = ((semente % 360) + indice * 137.5) * Math.PI / 180;
        const raio = itens.length === 1 ? .7 : 1.8 + Math.min(4.2, indice * .75);
        grupo.x = limitarCoordenadaMapa(base.x + Math.cos(angulo) * raio, 7.5, 95.5);
        grupo.y = limitarCoordenadaMapa(base.y + Math.sin(angulo) * raio, 6.5, 97);
        grupo.regiao = base.regiao;
        grupo.cor = CORES_REDE_MAPA[base.regiao] || "#37e6ff";
        grupo.total = grupo.radios.length;
        pontos.push(grupo);
      });
  });

  const limite = window.matchMedia?.("(max-width: 620px)")?.matches ? 28 : 64;
  return pontos
    .sort((a, b) => b.total - a.total || a.uf.localeCompare(b.uf) || a.cidade.localeCompare(b.cidade, "pt-BR"))
    .slice(0, limite);
}

function criarCaminhoRedeMapa(origem, destino, curvatura = 0) {
  const meioX = (origem.x + destino.x) / 2;
  const meioY = (origem.y + destino.y) / 2;
  const dx = destino.x - origem.x;
  const dy = destino.y - origem.y;
  const tamanho = Math.max(1, Math.hypot(dx, dy));
  const controleX = meioX - (dy / tamanho) * curvatura;
  const controleY = meioY + (dx / tamanho) * curvatura;
  return `M ${origem.x.toFixed(2)} ${origem.y.toFixed(2)} Q ${controleX.toFixed(2)} ${controleY.toFixed(2)} ${destino.x.toFixed(2)} ${destino.y.toFixed(2)}`;
}

function adicionarConexaoRedeMapa(origem, destino, opcoes = {}) {
  if (!elementos.mapaConexoes) return;
  const ns = "http://www.w3.org/2000/svg";
  const cor = opcoes.cor || origem.cor || destino.cor || "#37e6ff";
  const d = criarCaminhoRedeMapa(origem, destino, opcoes.curvatura || 0);
  const atraso = `${-((opcoes.indice || 0) % 8) * .65}s`;
  const dados = {
    ufs: [origem.uf, destino.uf].filter(Boolean).join(","),
    regioes: [origem.regiao, destino.regiao].filter(Boolean).join(","),
    cidades: [origem.chave, destino.chave].filter(Boolean).join(",")
  };

  const base = document.createElementNS(ns, "path");
  base.setAttribute("d", d);
  base.setAttribute("pathLength", "100");
  base.setAttribute("class", `mapa-rede-linha${opcoes.secundaria ? " secundaria" : ""}`);
  base.style.setProperty("--mapa-cor", cor);
  Object.entries(dados).forEach(([chave, valor]) => base.dataset[chave] = valor);
  elementos.mapaConexoes.appendChild(base);

  const fluxo = document.createElementNS(ns, "path");
  fluxo.setAttribute("d", d);
  fluxo.setAttribute("pathLength", "100");
  fluxo.setAttribute("class", `mapa-rede-fluxo${opcoes.secundaria ? " secundaria" : ""}`);
  fluxo.style.setProperty("--mapa-cor", cor);
  fluxo.style.setProperty("--mapa-delay", atraso);
  Object.entries(dados).forEach(([chave, valor]) => fluxo.dataset[chave] = valor);
  elementos.mapaConexoes.appendChild(fluxo);
}

function criarPontoEmissoraMapa(ponto, indice, cidadeNova) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "mapa-emissora-ponto";
  if (cidadeNova && cidadeNova.cidade === ponto.cidade && cidadeNova.uf === ponto.uf) botao.classList.add("cidade-nova");
  botao.dataset.uf = ponto.uf;
  botao.dataset.regiao = ponto.regiao;
  botao.dataset.cidade = ponto.cidade;
  botao.dataset.chave = ponto.chave;
  botao.style.setProperty("--mapa-x", `${ponto.x}%`);
  botao.style.setProperty("--mapa-y", `${ponto.y}%`);
  botao.style.setProperty("--mapa-cor", ponto.cor);
  botao.style.setProperty("--mapa-delay", `${-(indice % 9) * .42}s`);
  botao.setAttribute("aria-pressed", "false");
  botao.setAttribute("aria-label", `${ponto.cidade}, ${ponto.uf}: ${ponto.total} ${ponto.total === 1 ? "emissora" : "emissoras"}`);
  botao.title = `${ponto.cidade} • ${ponto.uf} — ${ponto.total} ${ponto.total === 1 ? "emissora" : "emissoras"}`;
  botao.innerHTML = `<span class="mapa-emissora-onda" aria-hidden="true"></span><span class="mapa-emissora-nucleo" aria-hidden="true"></span><span class="mapa-emissora-label"><strong>${ponto.cidade}</strong><small>${ponto.uf} • ${ponto.total}</small></span>`;
  botao.addEventListener("click", () => selecionarCidadeMapa(ponto.cidade, ponto.uf));
  return botao;
}

function renderizarRedeMapaSonoro(radios, cidadeNova) {
  if (!elementos.mapaConexoes || !elementos.mapaEmissoras) return;
  const pontos = obterPontosRedeMapa(radios);
  elementos.mapaConexoes.innerHTML = "";
  elementos.mapaEmissoras.innerHTML = "";

  const hub = { x: 51, y: 58, uf: "", regiao: "", chave: "", cor: "#37e6ff" };
  pontos.forEach((ponto, indice) => {
    const curvatura = ((hashVisualMapa(ponto.chave) % 11) - 5) * .42;
    adicionarConexaoRedeMapa(hub, ponto, { indice, cor: ponto.cor, curvatura });
    elementos.mapaEmissoras.appendChild(criarPontoEmissoraMapa(ponto, indice, cidadeNova));
  });

  const pares = new Set();
  pontos.forEach((ponto, indice) => {
    const vizinhos = pontos
      .filter(outro => outro !== ponto && outro.regiao === ponto.regiao)
      .map(outro => ({ outro, distancia: Math.hypot(outro.x - ponto.x, outro.y - ponto.y) }))
      .sort((a, b) => a.distancia - b.distancia);
    const vizinho = vizinhos[0]?.outro;
    if (!vizinho) return;
    const chavePar = [ponto.chave, vizinho.chave].sort().join("::");
    if (pares.has(chavePar)) return;
    pares.add(chavePar);
    adicionarConexaoRedeMapa(ponto, vizinho, {
      indice: indice + pontos.length,
      cor: ponto.cor,
      curvatura: ((indice % 3) - 1) * 1.2,
      secundaria: true
    });
  });
}

function selecionarCidadeMapa(cidade, uf) {
  const mesmaCidade = estado.mapaCidadeSelecionada === cidade && estado.mapaCidadeUfSelecionada === uf;
  estado.mapaCidadeSelecionada = mesmaCidade ? "" : cidade;
  estado.mapaCidadeUfSelecionada = mesmaCidade ? "" : uf;
  estado.mapaUfSelecionada = mesmaCidade ? uf : uf;
  estado.mapaRegiaoSelecionada = "";
  renderizarPainelMapaSonoro();
  atualizarSelecaoMapaSonoro();
  window.CRBAcessibilidade?.anunciar(
    mesmaCidade ? `Mapa sonoro voltou ao estado ${ESTADOS_BRASIL[uf]?.nome || uf}.` : `Mapa sonoro selecionado: ${cidade}, ${uf}.`
  );
}

function criarBotaoEstadoMapa(uf, dados, total, cidadeNova) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "mapa-uf";
  if (dados.pequeno) botao.classList.add("mapa-uf-pequeno");
  if (total > 0) botao.classList.add("tem-radio");
  if (cidadeNova?.uf === uf) botao.classList.add("tem-cidade-nova");
  botao.dataset.uf = uf;
  botao.dataset.regiao = dados.regiao;
  botao.dataset.nome = dados.nome;
  botao.style.setProperty("--mapa-x", `${dados.x}%`);
  botao.style.setProperty("--mapa-y", `${dados.y}%`);
  botao.setAttribute("aria-pressed", "false");
  botao.setAttribute("aria-label", `${dados.nome}: ${total} ${total === 1 ? "emissora" : "emissoras"}`);
  botao.title = `${dados.nome} — ${total} ${total === 1 ? "emissora" : "emissoras"}`;
  botao.innerHTML = `<span class="mapa-uf-sigla">${uf}</span><span class="mapa-uf-contagem">${total}</span>`;
  botao.addEventListener("click", () => selecionarUfMapa(uf));
  return botao;
}

function criarBotaoEstadoListaMapa(uf, dados, total) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "mapa-estado-lista-botao";
  if (total > 0) botao.classList.add("tem-radio");
  botao.dataset.uf = uf;
  botao.setAttribute("aria-pressed", "false");
  botao.innerHTML = `<strong>${uf}</strong><span>${dados.nome}</span><small>${total}</small>`;
  botao.addEventListener("click", () => selecionarUfMapa(uf));
  return botao;
}

function renderizarMapaSonoro() {
  if (!elementos.explorarRegioes || !elementos.mapaEstados) return;
  const radios = estado.radios;
  elementos.explorarRegioes.classList.toggle("hidden", radios.length === 0);
  if (!radios.length) return;

  const contagemUfs = new Map();
  radios.forEach(radio => {
    const uf = String(radio.localizacao?.uf || "").toUpperCase();
    if (ESTADOS_BRASIL[uf]) contagemUfs.set(uf, (contagemUfs.get(uf) || 0) + 1);
  });
  const cidades = obterResumoCidadesMapa(radios);
  const cidadeNova = obterCidadeRecemChegada(radios);
  elementos.mapaResumoGeral.textContent = `${radios.length} ${radios.length === 1 ? "emissora" : "emissoras"} • ${contagemUfs.size} ${contagemUfs.size === 1 ? "estado" : "estados"} • ${cidades.length} ${cidades.length === 1 ? "cidade" : "cidades"}`;

  elementos.mapaEstados.innerHTML = "";
  elementos.mapaEstadosLista.innerHTML = "";
  Object.entries(ESTADOS_BRASIL).forEach(([uf, dados]) => {
    const total = contagemUfs.get(uf) || 0;
    elementos.mapaEstados.appendChild(criarBotaoEstadoMapa(uf, dados, total, cidadeNova));
    elementos.mapaEstadosLista.appendChild(criarBotaoEstadoListaMapa(uf, dados, total));
  });
  renderizarRedeMapaSonoro(radios, cidadeNova);

  document.querySelectorAll("[data-mapa-regiao-total]").forEach(item => {
    const regiao = item.dataset.mapaRegiaoTotal;
    const total = regiao === "Brasil"
      ? radios.length
      : radios.filter(radio => obterUfsDaRegiao(regiao).includes(String(radio.localizacao?.uf || "").toUpperCase())).length;
    item.textContent = total;
  });

  renderizarPainelMapaSonoro();
  atualizarSelecaoMapaSonoro();
}

function selecionarUfMapa(uf) {
  estado.mapaUfSelecionada = estado.mapaUfSelecionada === uf && !estado.mapaCidadeSelecionada ? "" : uf;
  estado.mapaCidadeSelecionada = "";
  estado.mapaCidadeUfSelecionada = "";
  estado.mapaRegiaoSelecionada = "";
  renderizarPainelMapaSonoro();
  atualizarSelecaoMapaSonoro();
  window.CRBAcessibilidade?.anunciar(
    estado.mapaUfSelecionada
      ? `Mapa sonoro selecionado: ${ESTADOS_BRASIL[estado.mapaUfSelecionada]?.nome || estado.mapaUfSelecionada}.`
      : "Mapa sonoro voltou ao panorama nacional."
  );
}

function selecionarRegiaoMapa(regiao) {
  estado.mapaRegiaoSelecionada = estado.mapaRegiaoSelecionada === regiao ? "" : regiao;
  estado.mapaUfSelecionada = "";
  estado.mapaCidadeSelecionada = "";
  estado.mapaCidadeUfSelecionada = "";
  renderizarPainelMapaSonoro();
  atualizarSelecaoMapaSonoro();
  window.CRBAcessibilidade?.anunciar(
    estado.mapaRegiaoSelecionada ? `Mapa sonoro selecionado: região ${estado.mapaRegiaoSelecionada}.` : "Mapa sonoro selecionado: Brasil inteiro."
  );
}

function atualizarSelecaoMapaSonoro() {
  document.querySelectorAll(".mapa-uf, .mapa-estado-lista-botao").forEach(botao => {
    const selecionado = Boolean(estado.mapaUfSelecionada && botao.dataset.uf === estado.mapaUfSelecionada);
    const emRegiao = Boolean(!estado.mapaUfSelecionada && estado.mapaRegiaoSelecionada && ESTADOS_BRASIL[botao.dataset.uf]?.regiao === estado.mapaRegiaoSelecionada);
    botao.classList.toggle("selecionado", selecionado);
    botao.classList.toggle("em-regiao", emRegiao);
    botao.setAttribute("aria-pressed", String(selecionado));
  });
  document.querySelectorAll("[data-mapa-regiao]").forEach(botao => {
    const selecionado = (botao.dataset.mapaRegiao || "") === estado.mapaRegiaoSelecionada && !estado.mapaUfSelecionada && !estado.mapaCidadeSelecionada;
    botao.classList.toggle("ativo", selecionado);
    botao.setAttribute("aria-pressed", String(selecionado));
  });

  document.querySelectorAll(".mapa-emissora-ponto").forEach(botao => {
    const cidadeSelecionada = Boolean(
      estado.mapaCidadeSelecionada &&
      botao.dataset.cidade === estado.mapaCidadeSelecionada &&
      botao.dataset.uf === estado.mapaCidadeUfSelecionada
    );
    const pertenceUf = Boolean(!estado.mapaCidadeSelecionada && estado.mapaUfSelecionada && botao.dataset.uf === estado.mapaUfSelecionada);
    const pertenceRegiao = Boolean(!estado.mapaCidadeSelecionada && !estado.mapaUfSelecionada && estado.mapaRegiaoSelecionada && botao.dataset.regiao === estado.mapaRegiaoSelecionada);
    const existeRecorte = Boolean(estado.mapaCidadeSelecionada || estado.mapaUfSelecionada || estado.mapaRegiaoSelecionada);
    const ativoNoRecorte = cidadeSelecionada || pertenceUf || pertenceRegiao;
    botao.classList.toggle("selecionado", cidadeSelecionada);
    botao.classList.toggle("em-recorte", ativoNoRecorte);
    botao.classList.toggle("apagado", existeRecorte && !ativoNoRecorte);
    botao.setAttribute("aria-pressed", String(cidadeSelecionada));
  });

  document.querySelectorAll(".mapa-rede-linha, .mapa-rede-fluxo").forEach(linha => {
    const ufs = String(linha.dataset.ufs || "").split(",").filter(Boolean);
    const regioes = String(linha.dataset.regioes || "").split(",").filter(Boolean);
    const cidades = String(linha.dataset.cidades || "").split(",").filter(Boolean);
    const cidadeChave = estado.mapaCidadeSelecionada
      ? `${estado.mapaCidadeUfSelecionada}|${estado.mapaCidadeSelecionada.toLocaleLowerCase("pt-BR")}`
      : "";
    const existeRecorte = Boolean(cidadeChave || estado.mapaUfSelecionada || estado.mapaRegiaoSelecionada);
    const ativa = cidadeChave
      ? cidades.includes(cidadeChave)
      : estado.mapaUfSelecionada
        ? ufs.includes(estado.mapaUfSelecionada)
        : estado.mapaRegiaoSelecionada
          ? regioes.includes(estado.mapaRegiaoSelecionada)
          : true;
    linha.classList.toggle("apagada", existeRecorte && !ativa);
    linha.classList.toggle("destaque", existeRecorte && ativa);
  });
}

function criarRadioCompactaMapa(radio) {
  const artigo = document.createElement("article");
  artigo.className = "mapa-radio-item";
  const nome = radio.nomeFantasia || radio.nome || "Emissora";
  const logo = criarLogoRadio(radio, "mapa-radio-logo");
  logo.setAttribute("aria-hidden", "true");
  const info = document.createElement("div");
  info.className = "mapa-radio-info";
  const titulo = document.createElement("strong");
  titulo.textContent = nome;
  const detalhe = document.createElement("small");
  detalhe.textContent = `${montarLocalizacao(radio)} • ${radio.classificacao?.categoriaPrincipal || "Rádio online"}`;
  info.append(titulo, detalhe);
  const ouvir = document.createElement("button");
  ouvir.type = "button";
  ouvir.className = "mapa-radio-ouvir";
  ouvir.setAttribute("aria-label", `Ouvir ${nome}`);
  ouvir.innerHTML = '<span aria-hidden="true">▶</span>';
  ouvir.addEventListener("click", () => selecionarRadio(radio));
  artigo.append(logo, info, ouvir);
  return artigo;
}

function renderizarPainelMapaSonoro() {
  if (!elementos.mapaPainelTitulo) return;
  const radios = obterRadiosRecorteMapa();
  const cidades = obterResumoCidadesMapa(radios);
  const estadosRepresentados = new Set(radios.map(radio => String(radio.localizacao?.uf || "").toUpperCase()).filter(Boolean));
  const cidadeNova = obterCidadeRecemChegada(radios);

  let titulo = "Brasil inteiro";
  let etiqueta = "PANORAMA NACIONAL";
  let descricao = "Explore a presença real das emissoras cadastradas em todo o país.";
  if (estado.mapaCidadeSelecionada && estado.mapaCidadeUfSelecionada) {
    const dados = ESTADOS_BRASIL[estado.mapaCidadeUfSelecionada];
    titulo = estado.mapaCidadeSelecionada;
    etiqueta = `${dados?.regiao || "CIDADE"} • ${estado.mapaCidadeUfSelecionada}`.toUpperCase();
    descricao = radios.length
      ? `Emissoras conectadas diretamente de ${titulo}, ${estado.mapaCidadeUfSelecionada}.`
      : `${titulo} ainda não possui emissora disponível.`;
  } else if (estado.mapaUfSelecionada) {
    const dados = ESTADOS_BRASIL[estado.mapaUfSelecionada];
    titulo = dados?.nome || estado.mapaUfSelecionada;
    etiqueta = `${dados?.regiao || "ESTADO"} • ${estado.mapaUfSelecionada}`.toUpperCase();
    descricao = radios.length
      ? `Conheça as rádios e cidades que representam ${titulo} na Central.`
      : `${titulo} ainda aguarda sua primeira emissora no mapa.`;
  } else if (estado.mapaRegiaoSelecionada) {
    titulo = `Região ${estado.mapaRegiaoSelecionada}`;
    etiqueta = "RECORTE REGIONAL";
    descricao = radios.length
      ? `Vozes, cidades e estilos da região ${estado.mapaRegiaoSelecionada}.`
      : `A região ${estado.mapaRegiaoSelecionada} ainda aguarda sua primeira emissora.`;
  }

  elementos.mapaPainelEtiqueta.textContent = etiqueta;
  elementos.mapaPainelTitulo.textContent = titulo;
  elementos.mapaPainelDescricao.textContent = descricao;
  elementos.mapaTotalEmissoras.textContent = radios.length;
  elementos.mapaTotalCidades.textContent = cidades.length;
  elementos.mapaTotalEstados.textContent = estadosRepresentados.size;

  elementos.mapaCidadeNova.classList.toggle("hidden", !cidadeNova);
  if (cidadeNova) elementos.mapaCidadeNovaNome.textContent = `${cidadeNova.cidade} • ${cidadeNova.uf}`;

  elementos.mapaCidades.innerHTML = "";
  elementos.mapaCidadesContador.textContent = cidades.length ? `${cidades.length} no total` : "";
  if (cidades.length) {
    cidades
      .sort((a, b) => b.total - a.total || a.cidade.localeCompare(b.cidade, "pt-BR"))
      .slice(0, 8)
      .forEach(item => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "mapa-cidade-chip";
        if (cidadeNova && item.cidade === cidadeNova.cidade && item.uf === cidadeNova.uf) botao.classList.add("nova");
        if (estado.mapaCidadeSelecionada === item.cidade && estado.mapaCidadeUfSelecionada === item.uf) botao.classList.add("selecionada");
        botao.innerHTML = `<span>${item.cidade}</span><small>${item.uf} • ${item.total}</small>`;
        botao.setAttribute("aria-label", `Selecionar rádios de ${item.cidade}, ${item.uf}`);
        botao.addEventListener("click", () => selecionarCidadeMapa(item.cidade, item.uf));
        elementos.mapaCidades.appendChild(botao);
      });
  } else {
    const vazio = document.createElement("p");
    vazio.className = "mapa-vazio";
    vazio.textContent = "Nenhuma cidade representada nesta área por enquanto.";
    elementos.mapaCidades.appendChild(vazio);
  }

  elementos.mapaRadiosLista.innerHTML = "";
  elementos.mapaRadiosContador.textContent = radios.length ? `${radios.length} disponíveis` : "";
  if (radios.length) {
    [...radios]
      .sort((a, b) => Number(b.status?.verificada === true) - Number(a.status?.verificada === true) || (a.nomeFantasia || a.nome || "").localeCompare(b.nomeFantasia || b.nome || "", "pt-BR"))
      .slice(0, 3)
      .forEach(radio => elementos.mapaRadiosLista.appendChild(criarRadioCompactaMapa(radio)));
  } else {
    const vazio = document.createElement("div");
    vazio.className = "mapa-vazio mapa-vazio-destaque";
    vazio.innerHTML = '<span aria-hidden="true">📡</span><p>Esta área está pronta para receber sua primeira emissora.</p><a href="cadastro/">Cadastrar uma rádio</a>';
    elementos.mapaRadiosLista.appendChild(vazio);
  }

  elementos.btnOuvirMapa.disabled = radios.length === 0;
  elementos.btnVerMapaCatalogo.disabled = radios.length === 0;
  elementos.btnOuvirMapa.innerHTML = radios.length
    ? '<span aria-hidden="true">▶</span> Ouvir uma rádio desta área'
    : '<span aria-hidden="true">▶</span> Nenhuma rádio disponível';
}

function ouvirRadioDoMapa() {
  const radios = obterRadiosRecorteMapa();
  if (!radios.length) return;
  const radio = radios[Math.floor(Math.random() * radios.length)];
  selecionarRadio(radio);
  window.CRBAcessibilidade?.anunciar(`Rádio sorteada no Mapa Sonoro: ${radio.nomeFantasia || radio.nome || "emissora"}.`);
}

function abrirCatalogoDoMapa() {
  const radios = obterRadiosRecorteMapa();
  if (!radios.length) return;
  estado.paginaAtual = 1;
  elementos.pesquisa.value = estado.mapaCidadeSelecionada || "";
  elementos.filtroCategoria.value = "";
  elementos.filtroEstado.value = estado.mapaCidadeUfSelecionada || estado.mapaUfSelecionada || "";
  estado.regiaoSelecionada = estado.mapaUfSelecionada || estado.mapaCidadeSelecionada ? "" : estado.mapaRegiaoSelecionada;
  atualizarFiltroDescobertaAtivo();
  aplicarFiltros();
  document.querySelector("#catalogo-emissoras")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.CRBAcessibilidade?.anunciar(`Catálogo aberto para ${elementos.mapaPainelTitulo.textContent}.`);
}

function abrirCatalogoPorCidadeMapa(cidade, uf) {
  estado.paginaAtual = 1;
  estado.regiaoSelecionada = "";
  elementos.pesquisa.value = cidade;
  elementos.filtroEstado.value = uf;
  elementos.filtroCategoria.value = "";
  atualizarFiltroDescobertaAtivo();
  aplicarFiltros();
  document.querySelector("#catalogo-emissoras")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.CRBAcessibilidade?.anunciar(`Catálogo filtrado pela cidade ${cidade}, ${uf}.`);
}

function renderizarVerificadas() {
  if (!elementos.radiosVerificadas || !elementos.gradeVerificadas) return;
  const radios = estado.radios.filter(radio => radio.status?.verificada === true).slice(0, 6);
  elementos.radiosVerificadas.classList.toggle("hidden", radios.length === 0);
  preencherGradeDescoberta(elementos.gradeVerificadas, radios);
}

function renderizarCategoriasDestaque() {
  if (!elementos.categoriasDestaque || !elementos.gradeCategoriasDestaque) return;
  const contagens = new Map();
  estado.radios.forEach(radio => {
    const categoriasDaRadio = [...new Set(obterCategorias(radio).map(valor => String(valor || "").trim()).filter(Boolean))];
    categoriasDaRadio.forEach(categoria => {
      contagens.set(categoria, (contagens.get(categoria) || 0) + 1);
    });
  });
  const categorias = [...contagens.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .slice(0, 6);
  elementos.categoriasDestaque.classList.toggle("hidden", categorias.length === 0);
  elementos.gradeCategoriasDestaque.innerHTML = "";
  categorias.forEach(([categoria, total]) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "categoria-destaque-card";
    botao.setAttribute("aria-label", `Ver ${total} ${total === 1 ? "emissora" : "emissoras"} da categoria ${categoria}`);

    const icone = document.createElement("span");
    icone.className = "categoria-destaque-icone";
    icone.setAttribute("aria-hidden", "true");
    icone.textContent = ICONES_CATEGORIAS[categoria] || "🎧";

    const nome = document.createElement("strong");
    nome.textContent = categoria;

    const quantidade = document.createElement("small");
    quantidade.textContent = `${total} ${total === 1 ? "emissora" : "emissoras"}`;

    botao.append(icone, nome, quantidade);
    botao.addEventListener("click", () => filtrarPorCategoria(categoria));
    elementos.gradeCategoriasDestaque.appendChild(botao);
  });
}

function filtrarPorRegiao(regiao) {
  estado.regiaoSelecionada = regiao;
  estado.paginaAtual = 1;
  elementos.filtroEstado.value = "";
  atualizarFiltroDescobertaAtivo();
  aplicarFiltros();
  document.querySelector("#catalogo-emissoras")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.CRBAcessibilidade?.anunciar(`Catálogo filtrado pela região ${regiao}.`);
}

function filtrarPorCategoria(categoria) {
  estado.regiaoSelecionada = "";
  estado.paginaAtual = 1;
  elementos.filtroEstado.value = "";
  elementos.filtroCategoria.value = categoria;
  atualizarFiltroDescobertaAtivo();
  aplicarFiltros();
  document.querySelector("#catalogo-emissoras")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function atualizarFiltroDescobertaAtivo() {
  if (!elementos.filtroDescobertaAtivo) return;
  const regiao = estado.regiaoSelecionada;
  elementos.filtroDescobertaAtivo.classList.toggle("hidden", !regiao);
  elementos.filtroDescobertaAtivo.textContent = regiao ? `Filtro ativo: região ${regiao}. Use “Limpar filtros” para mostrar todo o catálogo.` : "";
  // A seleção visual do Mapa Sonoro é independente dos filtros do catálogo.
}

function abrirCatalogoPorDescoberta(acao) {
  estado.regiaoSelecionada = "";
  elementos.pesquisa.value = "";
  elementos.filtroEstado.value = "";
  elementos.filtroCategoria.value = "";
  if (acao === "verificadas") {
    estado.radiosFiltradas = estado.radios.filter(radio => radio.status?.verificada === true);
    estado.paginaAtual = 1;
    renderizarRadios();
    window.CRBAcessibilidade?.anunciar("Catálogo exibindo rádios verificadas.");
  } else {
    estado.radiosFiltradas = [...estado.radios].sort((a, b) => {
      const dataA = obterDataPublicacaoRadio(a)?.getTime() || 0;
      const dataB = obterDataPublicacaoRadio(b)?.getTime() || 0;
      return dataB - dataA;
    });
    estado.paginaAtual = 1;
    renderizarRadios();
    window.CRBAcessibilidade?.anunciar("Catálogo organizado pelas emissoras mais recentes.");
  }
  atualizarFiltroDescobertaAtivo();
  document.querySelector("#catalogo-emissoras")?.scrollIntoView({ behavior: "smooth", block: "start" });
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


function atualizarRadioDestaque() {
  const secao = document.getElementById("radio-destaque");

  if (!secao || !estado.radios) return;

  const radio = estado.radios.find(
    item => item.status?.destaque === true
  );

  if (!radio) {
    secao.classList.add("hidden");
    return;
  }

  secao.classList.remove("hidden");

  document.getElementById("destaque-categoria").textContent =
    radio.classificacao?.categoriaPrincipal ||
    radio.categoria ||
    "Rádio online";

  document.getElementById("destaque-nome").textContent =
    radio.nomeFantasia || radio.nome || "Emissora";

  document.getElementById("destaque-descricao").textContent =
    radio.descricao ||
    radio.slogan ||
    "Ouça esta emissora em destaque.";

  document.getElementById("destaque-cidade").textContent =
    radio.localizacao?.cidade || radio.cidade || "";

  document.getElementById("destaque-uf").textContent =
    radio.localizacao?.uf || radio.uf || "";

  const logo = document.getElementById("destaque-logo");
  const urlLogo = obterUrlLogo(radio);

  logo.replaceChildren();

  if (urlLogo) {
    const imagem = document.createElement("img");
    imagem.src = urlLogo;
    imagem.alt = `Logo da ${radio.nome || "emissora"}`;

    imagem.addEventListener("error", () => {
      logo.replaceChildren();
      logo.textContent = obterIniciais(radio.nome);
    });

    logo.appendChild(imagem);
  } else {
    logo.textContent = obterIniciais(radio.nome);
  }

  document.getElementById("btn-ouvir-destaque").onclick = () => {
    selecionarRadio(radio);
  };
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
   RANKING NACIONAL — VERSÃO 22.7.0
========================================================= */

const rankingDemonstracao = [
  {
    id: "demo-fala-popular",
    nome: "Rádio Fala Popular",
    categoria: "Sertanejo",
    reproducoesRanking: 18452,
    logoRanking: "logo-central-radios-brasil.png",
    demonstrativa: true
  },
  {
    id: "demo-radio-cidade",
    nome: "Rádio Cidade",
    categoria: "Pop",
    reproducoesRanking: 16980,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-radio-brasil",
    nome: "Rádio Brasil",
    categoria: "Jornalismo",
    reproducoesRanking: 15770,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-nacional-mix",
    nome: "Rádio Nacional Mix",
    categoria: "Variedades",
    reproducoesRanking: 14920,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-goias-central",
    nome: "Rádio Goiás Central",
    categoria: "Sertanejo",
    reproducoesRanking: 13860,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-popular-hits",
    nome: "Rádio Popular Hits",
    categoria: "Pop",
    reproducoesRanking: 12440,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-brasil-sertanejo",
    nome: "Rádio Brasil Sertanejo",
    categoria: "Sertanejo",
    reproducoesRanking: 11980,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-noticias-24h",
    nome: "Rádio Notícias 24h",
    categoria: "Jornalismo",
    reproducoesRanking: 10750,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-gospel-brasil",
    nome: "Rádio Gospel Brasil",
    categoria: "Gospel",
    reproducoesRanking: 9820,
    logoRanking: "",
    demonstrativa: true
  },
  {
    id: "demo-esportes-central",
    nome: "Rádio Esportes Central",
    categoria: "Esportes",
    reproducoesRanking: 8940,
    logoRanking: "",
    demonstrativa: true
  }
];

const rankingMedalhas = ["🥇", "🥈", "🥉"];
const rankingClasses = ["ranking-card-ouro", "ranking-card-prata", "ranking-card-bronze"];
let rankingAtual = [];
let rankingEventosRegistrados = false;

function obterNumeroReproducoes(radio) {
  const candidatos = [
    radio?.estatisticas?.reproducoesValidas,
    radio?.estatisticas?.ouvintes,
    radio?.estatisticas?.ouvintesAtuais,
    radio?.estatisticas?.totalOuvintes,
    radio?.metricas?.ouvintes,
    radio?.ranking?.reproducoesValidas,
    radio?.ranking?.ouvintes,
    radio?.reproducoesValidas,
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
    reproducoesRanking: obterNumeroReproducoes(radio),
    logoRanking: obterUrlLogo(radio),
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
        reproducoesRanking: Number(
          item.reproducoesValidas ?? item.ouvintes ?? 0
        ),
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

function formatarReproducoesRanking(valor) {
  return new Intl.NumberFormat("pt-BR").format(Number(valor) || 0);
}

function acionarRadioRanking(radio) {
  const modal = document.getElementById("ranking-modal");
  if (modal && window.CRBAcessibilidade?.dialogoEstaAberto(modal)) {
    window.CRBAcessibilidade.fecharDialogo({ anuncio: "Ranking fechado." });
  }
  void selecionarRadio(radio);
}

function criarCardRanking(radio, indice) {
  const card = document.createElement("button");
  card.type = "button";
  card.className =
    `ranking-card ${rankingClasses[indice] || "ranking-card-padrao"}`;
  card.setAttribute("aria-label", `${indice + 1}º lugar: ${radio.nome}. Ouvir agora.`);

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

  const nome = document.createElement("span");
  nome.className = "ranking-card-nome";
  nome.textContent = radio.nome;

  const segmento = document.createElement("span");
  segmento.className = "ranking-segmento";
  segmento.textContent = radio.categoria;

  const seloPopularidade = criarSeloPopularidade(radio);

  const reproducoes = document.createElement("span");
  reproducoes.className = "ranking-ouvintes";
  reproducoes.textContent =
    `▶ ${formatarReproducoesRanking(radio.reproducoesRanking)} ` +
    `${Number(radio.reproducoesRanking) === 1
      ? "reprodução válida"
      : "reproduções válidas"}`;

  card.append(topo, logo, nome, segmento);
  if (seloPopularidade) card.appendChild(seloPopularidade);
  card.appendChild(reproducoes);

  card.addEventListener("click", () => acionarRadioRanking(radio));
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

  const seloPopularidade = criarSeloPopularidade(radio);

  const reproducoes = document.createElement("span");
  reproducoes.className = "ranking-top10-ouvintes";
  reproducoes.textContent =
    `▶ ${formatarReproducoesRanking(radio.reproducoesRanking)} ` +
    `${Number(radio.reproducoesRanking) === 1
      ? "reprodução válida"
      : "reproduções válidas"}`;

  item.append(topo, logo, nome, categoria);
  if (seloPopularidade) item.appendChild(seloPopularidade);
  item.appendChild(reproducoes);

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
    window.CRBAcessibilidade?.abrirDialogo(modal, {
      focoInicial: fechar,
      anuncio: "Ranking Top 10 aberto."
    });
  };

  const fecharModal = () => {
    window.CRBAcessibilidade?.fecharDialogo({ anuncio: "Ranking Top 10 fechado." });
  };

  abrir.addEventListener("click", abrirModal);
  fechar.addEventListener("click", fecharModal);
  modal.addEventListener("click", evento => {
    if (evento.target === modal) fecharModal();
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
        '<div class="ranking-carregando">O ranking começará a aparecer após as primeiras reproduções válidas de cinco minutos.</div>';

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
