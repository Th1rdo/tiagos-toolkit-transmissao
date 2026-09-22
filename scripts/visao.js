import { log } from "./const.js";

/**
 * A transmissão vê o que o grupo vê.
 *
 * No Foundry, um utilizador que é Observador de uma personagem e não controla
 * nenhum token vê pelos olhos dela — e de todas as outras de que é Observador,
 * somadas. Por isso o módulo põe a transmissão como Observadora de cada ator
 * que tem um jogador como dono. O mestre não tem de se lembrar disto quando
 * entra uma personagem nova a meio da campanha.
 *
 * Só o mestre ativo escreve, para dois mestres ligados não duplicarem o trabalho.
 */
export async function darVisao(uid) {
  if (!uid || !game.users.activeGM?.isSelf) return;
  const OBS = CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
  const OWNER = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;

  const dejogador = (a) => Object.entries(a.ownership).some(([id, nivel]) => {
    if (id === "default" || id === uid) return false;
    const u = game.users.get(id);
    return u && !u.isGM && nivel >= OWNER;
  });
  const nivel = (a) => a.ownership[uid] ?? a.ownership.default ?? 0;

  const mudar = game.actors
    .filter(a => dejogador(a) && nivel(a) < OBS)
    .map(a => ({ _id: a.id, [`ownership.${uid}`]: OBS }));
  if (!mudar.length) return;
  await Actor.updateDocuments(mudar);
  log(`visão dada em ${mudar.length} personagem(ns)`);
}
