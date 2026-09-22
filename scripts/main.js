import { MODULE_ID, CLASSE, canalNovo, log } from "./const.js";
import { camera } from "./camera.js";
import { darVisao } from "./visao.js";
import { JanelaLigacoes } from "./ligacoes.js";

/**
 * Montagem do módulo.
 *
 * Há um utilizador do Foundry só para a transmissão. O mestre abre-o num
 * browser à parte e partilha esse separador; os espectadores veem o que o
 * grupo vê, sem a interface do Foundry, com uma câmara que se mexe sozinha.
 * O ecrã do mestre nunca entra na transmissão.
 */

const uidTransmissao = () => game.settings.get(MODULE_ID, "utilizador");

// a lista de utilizadores só existe depois do init
Hooks.once("setup", () => {
  const escolhas = { "": game.i18n.localize("TRANS.Config.Ninguem") };
  for (const u of game.users) if (!u.isGM) escolhas[u.id] = u.name;

  game.settings.register(MODULE_ID, "utilizador", {
    name: "TRANS.Config.Utilizador", hint: "TRANS.Config.UtilizadorHint",
    scope: "world", config: true, type: String, default: "", choices: escolhas,
    requiresReload: true,
    onChange: (uid) => darVisao(uid)
  });

  // gerado sozinho na primeira vez; as ligações ficam iguais para sempre
  game.settings.register(MODULE_ID, "canal", {
    scope: "world", config: false, type: String, default: ""
  });

  game.settings.registerMenu(MODULE_ID, "ligacoes", {
    name: "TRANS.Ligacoes.Titulo", label: "TRANS.Ligacoes.Botao", hint: "TRANS.Ligacoes.Hint",
    icon: "fa-solid fa-tower-broadcast", type: JanelaLigacoes, restricted: true
  });
});

Hooks.once("ready", async () => {
  const uid = uidTransmissao();

  if (game.user.isGM) {
    if (!game.settings.get(MODULE_ID, "canal") && game.users.activeGM?.isSelf) {
      await game.settings.set(MODULE_ID, "canal", canalNovo());
    }
    await darVisao(uid);
    let espera = null;
    const rever = () => { clearTimeout(espera); espera = setTimeout(() => darVisao(uidTransmissao()), 500); };
    Hooks.on("createActor", rever);
    Hooks.on("updateActor", (_a, mudou) => { if ("ownership" in mudou) rever(); });
    Hooks.on("updateUser", rever);   // um jogador novo na mesa
  }

  if (!uid || game.user.id !== uid) return;

  document.body.classList.add(CLASSE);
  // O Foundry abre «escolhe a tua personagem» a quem entra sem personagem —
  // e a transmissão nunca tem uma. Fecha-se já e de cada vez que voltar.
  const semConfig = (app) => { if (app.document?.id === uid) app.close(); };
  Hooks.on("renderUserConfig", semConfig);
  for (const app of foundry.applications.instances.values()) {
    if (app.constructor.name === "UserConfig") semConfig(app);
  }
  // O cursor do mestre diz para onde ele está a olhar — uma armadilha escondida,
  // uma porta que ainda ninguém viu. Na transmissão não há cursores; os pings ficam.
  const semCursores = () => { if (canvas.controls?.cursors) canvas.controls.cursors.visible = false; };
  Hooks.on("canvasReady", semCursores);
  semCursores();
  // barra lateral fechada: as jogadas de dados aparecem por cima do mapa e desaparecem
  ui.sidebar?.collapse?.();
  camera.montar();
  log("este cliente é a transmissão");
});
