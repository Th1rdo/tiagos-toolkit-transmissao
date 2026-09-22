/**
 * Lógica pura da câmara: sem Foundry, para poder ser testada em Node.
 *
 * Tudo em coordenadas da cena (pixéis do mapa). O ecrã é o tamanho da janela
 * que está a ser transmitida.
 */

/** Caixa que contém todos os retângulos, ou null se não há nenhum. */
export function caixa(rects) {
  if (!rects?.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rects) {
    x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y);
    x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h);
  }
  return { x0, y0, x1, y1 };
}

const limitar = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Onde pôr a câmara para caberem todos os retângulos, com margem à volta.
 * A margem é em pixéis da cena, porque "três quadrados de ar" é o que se quer
 * ver à volta de um grupo, seja qual for o zoom.
 */
export function enquadrar(rects, ecra, { margem = 0, zoomMin = 0.3, zoomMax = 1.5 } = {}) {
  const c = caixa(rects);
  if (!c || !ecra?.w || !ecra?.h) return null;
  const w = (c.x1 - c.x0) + margem * 2;
  const h = (c.y1 - c.y0) + margem * 2;
  const scale = limitar(Math.min(ecra.w / w, ecra.h / h), zoomMin, zoomMax);
  return { x: (c.x0 + c.x1) / 2, y: (c.y0 + c.y1) / 2, scale };
}

/**
 * Vale a pena mexer a câmara? Um token que anda um quadrado não pode fazer a
 * transmissão inteira balançar: só se move quando o centro foge mais de uma
 * fração do ecrã ou o zoom muda a sério. É isto que faz a câmara parecer
 * operada por alguém em vez de colada aos tokens.
 */
export function precisaMover(atual, alvo, ecra, { folgaCentro = 0.12, folgaZoom = 0.15 } = {}) {
  if (!alvo) return false;
  if (!atual) return true;
  if (Math.abs(alvo.scale / atual.scale - 1) > folgaZoom) return true;
  const distEcra = Math.hypot(alvo.x - atual.x, alvo.y - atual.y) * atual.scale;
  return distEcra > folgaCentro * Math.min(ecra.w, ecra.h);
}

/**
 * O que a câmara deve seguir, por ordem:
 * 1. em combate, quem está a jogar — se a transmissão o consegue ver;
 * 2. fora dele, o grupo inteiro;
 * 3. nada visível: não mexe.
 */
export function assunto({ grupo = [], vez = null } = {}) {
  if (vez) return { modo: "vez", rects: [vez] };
  if (grupo.length) return { modo: "grupo", rects: grupo };
  return null;
}
