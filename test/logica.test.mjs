import test from "node:test";
import assert from "node:assert/strict";
import { caixa, enquadrar, precisaMover, assunto } from "../scripts/logica.js";
import { ligacoes } from "../scripts/const.js";

const ecra = { w: 1600, h: 900 };
const q = (x, y) => ({ x, y, w: 100, h: 100 });

test("caixa de todos os tokens", () => {
  assert.deepEqual(caixa([q(0, 0), q(500, 300)]), { x0: 0, y0: 0, x1: 600, y1: 400 });
  assert.equal(caixa([]), null);
});

test("o grupo fica ao centro e cabe no ecrã", () => {
  const a = enquadrar([q(0, 0), q(1900, 900)], ecra, { margem: 0, zoomMin: 0.1, zoomMax: 5 });
  assert.equal(a.x, 1000);
  assert.equal(a.y, 500);
  assert.equal(a.scale, 0.8);   // 2000 de largura → 1600 px
});

test("um token sozinho não vira um grande plano", () => {
  const a = enquadrar([q(0, 0)], ecra, { margem: 0, zoomMax: 1.2 });
  assert.equal(a.scale, 1.2);
});

test("um grupo espalhado não some de vista", () => {
  const a = enquadrar([q(0, 0), q(40000, 0)], ecra, { zoomMin: 0.3 });
  assert.equal(a.scale, 0.3);
});

test("a margem é em pixéis da cena", () => {
  const sem = enquadrar([q(0, 0), q(700, 0)], ecra, { zoomMax: 5 });
  const com = enquadrar([q(0, 0), q(700, 0)], ecra, { margem: 400, zoomMax: 5 });
  assert.ok(com.scale < sem.scale);
});

test("andar um quadrado não mexe a câmara", () => {
  const atual = { x: 1000, y: 500, scale: 1 };
  assert.equal(precisaMover(atual, { x: 1050, y: 500, scale: 1 }, ecra), false);
  assert.equal(precisaMover(atual, { x: 1000, y: 500, scale: 1.05 }, ecra), false);
});

test("o grupo a fugir do ecrã mexe a câmara", () => {
  const atual = { x: 1000, y: 500, scale: 1 };
  assert.equal(precisaMover(atual, { x: 1400, y: 500, scale: 1 }, ecra), true);
  assert.equal(precisaMover(atual, { x: 1000, y: 500, scale: 0.6 }, ecra), true);
  assert.equal(precisaMover(null, { x: 0, y: 0, scale: 1 }, ecra), true);
  assert.equal(precisaMover(atual, null, ecra), false);
});

test("em combate segue quem joga; fora dele, o grupo", () => {
  const g = [q(0, 0), q(200, 0)];
  assert.equal(assunto({ grupo: g, vez: q(900, 900) }).modo, "vez");
  assert.equal(assunto({ grupo: g, vez: null }).modo, "grupo");
  assert.equal(assunto({ grupo: [], vez: null }), null);
});

test("as duas ligações apontam para o mesmo canal que o VDO.Ninja usa", () => {
  const l = ligacoes("mesa-2c63r3ddnd");
  assert.ok(l.enviar.includes("push=mesa_2c63r3ddnd&"));
  assert.ok(l.ver.includes("view=mesa_2c63r3ddnd&"));
});

test("a transmissão leva o som do Foundry, em qualidade de música", () => {
  const l = ligacoes("mesa_x");
  assert.ok(!l.enviar.includes("videoonly"));
  assert.ok(l.enviar.includes("&proaudio") && l.ver.includes("&proaudio"));
  assert.ok(l.enviar.includes("&suppresslocalaudio"));
});
