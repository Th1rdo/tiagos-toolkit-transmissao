# Tiago's Toolkit: Transmissão

Uma transmissão da mesa para quem assiste. Os espectadores abrem **uma ligação** e veem o mapa como o
grupo o vê — sem a interface do Foundry, sem conta, sem instalar nada. O som continua no Discord.

**O ecrã do mestre nunca entra na transmissão.** O que se transmite é outro utilizador do Foundry, aberto
num browser à parte, que só vê o que os jogadores veem.

---

## Instalar

Foundry → **Add-on Modules → Install Module** → colar em *Manifest URL*:

```
https://github.com/Th1rdo/tiagos-toolkit-transmissao/releases/latest/download/module.json
```

Foundry v13 e v14. Sem dependências.

## O que o módulo faz sozinho

- **Esconde a interface** no cliente da transmissão: barras, fichas, chat, hotbar, cartaz de pausa,
  cursores. Ficam o mapa, os balões de fala, as réguas, os pings, e as jogadas de dados, que aparecem
  uns segundos no canto e desaparecem. Stage, Cinema e Points of Interest continuam a aparecer.
- **Dá a visão do grupo**: a transmissão fica Observadora de todas as personagens dos jogadores, e vê pelos
  olhos delas (visão e névoa incluídas). Uma personagem nova é apanhada sozinha.
- **Câmara automática**: enquadra o grupo; em combate, vai a quem está a jogar (se o grupo o vê).
  Não balança com cada passo — só se mexe quando o grupo sai do quadro.
- **O mestre pode tomar a câmara** com o gesto que já conhece: *shift + ping* puxa a vista de todos,
  a transmissão incluída. A câmara automática espera 20 s antes de voltar a mexer.

## Preparar (uma vez, ~5 minutos)

1. **Criar o utilizador**: *Gerir utilizadores* → novo, nome **Transmissão**, papel **Jogador**,
   sem personagem.
2. **Definições do módulo** → *Utilizador da transmissão* → **Transmissão**.
3. **Um browser à parte.** No Chrome: ícone do perfil → *Adicionar* → perfil «Transmissão».
   Nesse perfil, entrar no jogo como **Transmissão**.
   > Tem de ser outro perfil (ou outro browser): o Foundry só deixa um utilizador por browser.
   > No Forge, **não** entrar com a conta do Forge nesse perfil — seria o mestre outra vez.
4. **Definições do módulo** → *Ligações da transmissão*:
   - a **1.ª ligação** abre-se no perfil Transmissão, num separador ao lado do Foundry;
   - a **2.ª ligação** fixa-se no Discord. É sempre a mesma.

## Em cada sessão

1. Abrir o perfil Transmissão (os separadores voltam sozinhos).
2. No separador do VDO.Ninja: **partilhar ecrã** → *Separador* → o separador do Foundry.
3. Pronto. Os espectadores abrem a ligação fixada no Discord.

O tamanho da janela da transmissão é o tamanho do vídeo: 1280×720 ou 1920×1080 ficam bem.

## Limites

- O vídeo vai **do teu computador para cada espectador** (VDO.Ninja, WebRTC, menos de 1 s de atraso).
  Com uma ligação normal, 5–10 espectadores em 720p. Para mais do que isso, usar o YouTube em direto
  (não listado) — com 2–5 s de atraso em relação ao som do Discord.
- A transmissão é um segundo cliente do Foundry na tua máquina: gasta memória e GPU como qualquer outro.
