/** Identidade do módulo e constantes partilhadas. */
export const MODULE_ID = "tiagos-toolkit-transmissao";

/** Classe no `body` do cliente que está a ser transmitido. */
export const CLASSE = "ttt-transmissao";

/**
 * Câmara. Margens em quadrados da grelha: o grupo precisa de ar à volta,
 * quem está a jogar precisa de mais (vê-se para onde vai).
 */
export const CAMARA = {
  MARGEM_GRUPO: 3,
  MARGEM_VEZ: 5,
  ZOOM_MIN: 0.3,
  ZOOM_MAX: 1.2,
  DURACAO: 1400,      // ms de viagem da câmara
  ESPERA: 350,        // ms: vários tokens a mexer contam como um movimento só
  // Se o mestre puxar a vista (shift + ping) ou alguém mexer na janela à mão,
  // a câmara automática fica quieta este tempo — senão desfazia o gesto dele.
  PAUSA_MANUAL: 20000
};

/** O serviço que leva o vídeo aos espectadores: WebRTC, menos de um segundo de atraso. */
export function ligacoes(canal) {
  // O VDO.Ninja troca tudo o que não é letra, número ou _ por _ — mas só do lado
  // de quem envia. Com um hífen no canal, a ligação de ver procurava «mesa-x» e a
  // transmissão estava em «mesa_x»: ecrã azul para todos os espectadores (0.1.0).
  const c = canalLimpo(canal);
  // Som do separador vai junto: o Discord leva as vozes, mas a música, os sons
  // dos rituais e o áudio das cutscenes só tocam dentro do Foundry (0.1.1 ia mudo).
  // proaudio nos dois lados: estéreo e sem filtros de voz, senão a música chega
  // a 32 kbps mono. suppresslocalaudio: o mestre não ouve tudo a dobrar.
  return {
    enviar: `https://vdo.ninja/?push=${c}&screenshare&proaudio&suppresslocalaudio`,
    ver: `https://vdo.ninja/?view=${c}&cleanoutput&proaudio`
  };
}

export const canalLimpo = (canal) => String(canal ?? "").replace(/[^A-Za-z0-9_]/g, "_");

/** Um canal difícil de adivinhar: quem não tem a ligação não entra. */
export function canalNovo() {
  const a = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "mesa_";
  for (let i = 0; i < 10; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export const log = (...args) => console.log(`${MODULE_ID} |`, ...args);
