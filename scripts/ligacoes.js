import { MODULE_ID, ligacoes } from "./const.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * A janela das duas ligações. É a única coisa que o mestre precisa daqui:
 * uma para abrir no browser da transmissão, outra para pôr no Discord.
 * As duas não mudam de sessão para sessão.
 */
export class JanelaLigacoes extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "ttt-ligacoes",
    tag: "div",
    window: { title: "TRANS.Ligacoes.Titulo", icon: "fa-solid fa-tower-broadcast" },
    position: { width: 520, height: "auto" },
    actions: { copiar: JanelaLigacoes.#copiar }
  };

  static PARTS = { corpo: { template: `modules/${MODULE_ID}/templates/ligacoes.hbs` } };

  async _prepareContext() {
    const canal = game.settings.get(MODULE_ID, "canal");
    const uid = game.settings.get(MODULE_ID, "utilizador");
    return { ...ligacoes(canal), utilizador: game.users.get(uid)?.name ?? null };
  }

  static async #copiar(_ev, botao) {
    const texto = botao.dataset.texto;
    await game.clipboard.copyPlainText(texto);
    ui.notifications.info(game.i18n.localize("TRANS.Ligacoes.Copiada"));
  }
}
