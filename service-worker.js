"use strict";

const APP_VERSION = "22.11.3";
const CACHE_SHELL = `crb-shell-${APP_VERSION}`;
const CACHE_DADOS = `crb-dados-${APP_VERSION}`;
const URL_RADIOS = "https://raw.githubusercontent.com/contatofalapopular-bit/CentralRadiosBrasil-Dados/main/radios.json";

const ARQUIVOS_ESSENCIAIS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./accessibility.js",
  "./pwa.css",
  "./pwa.js",
  "./manifest.webmanifest?v=22.11.3",
  "./offline.html",
  "./hero-frases.json",
  "./logo-central-radios-brasil.png",
  "./icons/icon-192-v22113.png",
  "./icons/icon-512-v22113.png",
  "./icons/icon-maskable-512-v22113.png",
  "./icons/apple-touch-icon-v22113.png",
  "./icons/favicon-64-v22113.png",
  "./cadastro/",
  "./cadastro/index.html",
  "./cadastro/cadastro.css",
  "./cadastro/cadastro.js",
  "./acompanhar/",
  "./acompanhar/index.html",
  "./acompanhar/acompanhar.css",
  "./acompanhar/acompanhar.js",
  "./plataforma/",
  "./plataforma/index.html",
  "./plataforma/plataforma.css"
];

self.addEventListener("install", evento => {
  evento.waitUntil((async () => {
    const cache = await caches.open(CACHE_SHELL);
    await cache.addAll(ARQUIVOS_ESSENCIAIS);

    try {
      const resposta = await fetch(URL_RADIOS, { cache: "no-store" });
      if (resposta.ok) {
        const cacheDados = await caches.open(CACHE_DADOS);
        await cacheDados.put(URL_RADIOS, resposta.clone());
      }
    } catch (erro) {
      console.info("Catálogo será armazenado após a primeira conexão.", erro);
    }

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", evento => {
  evento.waitUntil((async () => {
    const permitidos = new Set([CACHE_SHELL, CACHE_DADOS]);
    const nomes = await caches.keys();
    await Promise.all(
      nomes
        .filter(nome => nome.startsWith("crb-") && !permitidos.has(nome))
        .map(nome => caches.delete(nome))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", evento => {
  if (evento.data?.tipo === "PULAR_ESPERA") {
    void self.skipWaiting();
  }
});

self.addEventListener("fetch", evento => {
  const requisicao = evento.request;
  if (requisicao.method !== "GET") return;

  const url = new URL(requisicao.url);

  if (requisicao.destination === "audio" || url.hostname.endsWith("workers.dev")) {
    return;
  }

  if (requisicao.mode === "navigate") {
    evento.respondWith(responderNavegacao(requisicao));
    return;
  }

  if (url.href === URL_RADIOS) {
    evento.respondWith(responderDados(requisicao));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith("/service-worker.js")) return;
    evento.respondWith(responderArquivoLocal(requisicao));
    return;
  }

  if (requisicao.destination === "image") {
    evento.respondWith(responderImagemExterna(requisicao));
  }
});

async function responderNavegacao(requisicao) {
  try {
    const resposta = await fetch(requisicao);
    if (resposta.ok) {
      const cache = await caches.open(CACHE_SHELL);
      await cache.put(requisicao, resposta.clone());
    }
    return resposta;
  } catch {
    const cache = await caches.open(CACHE_SHELL);
    return (
      await cache.match(requisicao, { ignoreSearch: true }) ||
      await cache.match("./offline.html")
    );
  }
}

async function responderDados(requisicao) {
  const cache = await caches.open(CACHE_DADOS);
  try {
    const resposta = await fetch(requisicao, { cache: "no-store" });
    if (resposta.ok) await cache.put(URL_RADIOS, resposta.clone());
    return resposta;
  } catch {
    return (
      await cache.match(URL_RADIOS) ||
      new Response(JSON.stringify({
        valido: false,
        offline: true,
        emissoras: [],
        mensagem: "Catálogo indisponível sem conexão e ainda não armazenado neste aparelho."
      }), {
        status: 503,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      })
    );
  }
}

async function responderArquivoLocal(requisicao) {
  const cache = await caches.open(CACHE_SHELL);
  const salvo = await cache.match(requisicao, { ignoreSearch: true });

  const atualizacao = fetch(requisicao).then(async resposta => {
    if (resposta.ok) await cache.put(requisicao, resposta.clone());
    return resposta;
  }).catch(() => null);

  if (salvo) {
    void atualizacao;
    return salvo;
  }

  return (await atualizacao) || Response.error();
}

async function responderImagemExterna(requisicao) {
  const cache = await caches.open(CACHE_DADOS);
  const salvo = await cache.match(requisicao);
  if (salvo) return salvo;

  try {
    const resposta = await fetch(requisicao);
    if (resposta.ok || resposta.type === "opaque") {
      await cache.put(requisicao, resposta.clone());
    }
    return resposta;
  } catch {
    return Response.error();
  }
}
