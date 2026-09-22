import { CAMARA, log } from "./const.js";
import { enquadrar, precisaMover, assunto } from "./logica.js";

/**
 * A câmara automática. Só corre no cliente da transmissão.
 *
 * Ninguém a opera: segue o grupo e, em combate, quem está a jogar. O mestre
 * pode tomar-lhe o lugar com o gesto que já conhece (shift + ping puxa a vista
 * de todos) e ela devolve-lhe o controlo durante uns segundos.
 */
class Camera {
  #timer = null;
  #minhaAte = 0;       // até quando os canvasPan são da própria câmara
  #pausaAte = 0;

  montar() {
    const agendar = () => this.agendar();
    Hooks.on("canvasReady", () => this.enquadrar({ imediato: true }));
    Hooks.on("updateToken", (_d, mudou) => {
      if ("x" in mudou || "y" in mudou || "hidden" in mudou) agendar();
    });
    Hooks.on("createToken", agendar);
    Hooks.on("deleteToken", agendar);
    Hooks.on("updateCombat", (_c, mudou) => {
      if ("turn" in mudou || "round" in mudou) agendar();
    });
    Hooks.on("combatStart", agendar);
    Hooks.on("deleteCombat", agendar);
    // a visão muda depois de o token acabar de andar: é aí que se sabe quem se vê
    Hooks.on("sightRefresh", agendar);

    Hooks.on("canvasPan", () => {
      if (Date.now() < this.#minhaAte) return;
      this.#pausaAte = Date.now() + CAMARA.PAUSA_MANUAL;
    });

    if (canvas.ready) this.enquadrar({ imediato: true });
  }

  agendar() {
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.enquadrar(), CAMARA.ESPERA);
  }

  /** Retângulo de um token na cena, ou null se a transmissão não o vê. */
  #rect(t) {
    if (!t || t.document.hidden) return null;
    if (!(t.isVisible ?? t.visible)) return null;
    const b = t.bounds;
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  }

  #assunto() {
    const combate = game.combat;
    let vez = null;
    if (combate?.started && combate.scene?.id === canvas.scene?.id) {
      vez = this.#rect(combate.combatant?.token?.object);
    }
    const grupo = canvas.tokens.placeables
      .filter(t => t.actor?.hasPlayerOwner)
      .map(t => this.#rect(t))
      .filter(Boolean);
    return assunto({ grupo, vez });
  }

  enquadrar({ imediato = false } = {}) {
    if (!canvas.ready || Date.now() < this.#pausaAte) return;
    const a = this.#assunto();
    if (!a) return;

    const grelha = canvas.grid.size;
    const [w, h] = canvas.screenDimensions;
    const ecra = { w, h };
    const alvo = enquadrar(a.rects, ecra, {
      margem: (a.modo === "vez" ? CAMARA.MARGEM_VEZ : CAMARA.MARGEM_GRUPO) * grelha,
      zoomMin: CAMARA.ZOOM_MIN,
      zoomMax: CAMARA.ZOOM_MAX
    });
    const atual = { x: canvas.stage.pivot.x, y: canvas.stage.pivot.y, scale: canvas.stage.scale.x };
    if (!imediato && !precisaMover(atual, alvo, ecra)) return;

    const duracao = imediato ? 0 : CAMARA.DURACAO;
    this.#minhaAte = Date.now() + duracao + 300;
    if (imediato) canvas.pan(alvo);
    else canvas.animatePan({ ...alvo, duration: duracao, easing: "easeInOutCosine" });
    log("câmara →", a.modo, alvo);
  }
}

export const camera = new Camera();
