import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div id="game">
    <img id="map" src="/zeichenhafen-map.png" alt="Zeichenhafen Karte" />
    <div id="player"></div>

    <div id="hud">
      <div class="hud-row">
        <strong>Navaris – Deutschron</strong>
        <span>Lv. 1</span>
      </div>
      <div id="xpbar"><div id="xpfill"></div></div>
    </div>

    <div id="buttons">
      <button>Questbuch</button>
      <button>Inventar</button>
      <button>Karte</button>
      <button>Gadgets</button>
    </div>

    <div id="message">Willkommen im Zeichenhafen.</div>
  </div>
`

const style = document.createElement('style')
style.textContent = `
  html, body, #app {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #102c3a;
    font-family: Georgia, serif;
  }

  #game {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  #map {
    position: absolute;
    left: 0;
    top: 0;
    width: 1536px;
    height: 1024px;
    max-width: none;
    user-select: none;
    pointer-events: none;
  }

  #player {
    position: absolute;
    width: 34px;
    height: 48px;
    border-radius: 18px 18px 10px 10px;
    background: linear-gradient(#f4d29b 0 35%, #1d78a8 35% 100%);
    border: 3px solid white;
    box-shadow: 0 4px 8px rgba(0,0,0,.45);
    z-index: 5;
  }

  #hud {
    position: absolute;
    top: 14px;
    left: 14px;
    width: 260px;
    padding: 10px;
    color: #f7edc9;
    background: rgba(16, 41, 48, .85);
    border: 3px solid #caa86a;
    border-radius: 8px;
    z-index: 20;
  }

  .hud-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  #xpbar {
    height: 12px;
    background: #2a2015;
    border: 1px solid #d8bd7a;
    border-radius: 8px;
    overflow: hidden;
  }

  #xpfill {
    height: 100%;
    width: 25%;
    background: #78b84a;
  }

  #buttons {
    position: absolute;
    left: 14px;
    bottom: 18px;
    display: flex;
    gap: 8px;
    z-index: 20;
  }

  button {
    padding: 8px 12px;
    border-radius: 8px;
    border: 2px solid #caa86a;
    background: #f3e1b6;
    font-weight: bold;
  }

  #message {
    position: absolute;
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    min-width: 420px;
    max-width: 760px;
    padding: 14px 18px;
    color: #f7edc9;
    background: rgba(10, 10, 10, .88);
    border: 3px solid #caa86a;
    border-radius: 8px;
    font-size: 18px;
    z-index: 20;
    text-align: center;
  }
`
document.head.appendChild(style)

const game = document.getElementById('game') as HTMLDivElement
const map = document.getElementById('map') as HTMLImageElement
const player = document.getElementById('player') as HTMLDivElement
const message = document.getElementById('message') as HTMLDivElement

let playerX = 735
let playerY = 850

const speedWalk = 4
const speedRun = 7

const keys: Record<string, boolean> = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})

document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function isBlocked(x: number, y: number): boolean {
  // Kartenrand
  if (x < 40 || y < 40 || x > 1490 || y > 970) return true

  // Unteres Wasser, aber Ankunftssteg bleibt frei
  if (y > 900 && (x < 690 || x > 800)) return true

  // Linkes Wasser grob
  if (x < 150 && y > 260) return true

  // Rechtes Wasser grob
  if (x > 1350 && y > 180) return true

  // Großer Wasserkanal links der Mitte
  if (x > 410 && x < 565 && y > 210 && y < 850) return true

  // Wasser bei Kommahafen
  if (x > 785 && x < 970 && y > 560 && y < 770) return true

  // Wasser unten rechts um Punktkai, Weg bleibt frei
  if (x > 930 && x < 1180 && y > 760 && y < 930) return true

  return false
}

function updateCamera() {
  const screenW = window.innerWidth
  const screenH = window.innerHeight

  const mapW = 1536
  const mapH = 1024

  let camX = playerX - screenW / 2
  let camY = playerY - screenH / 2

  camX = Math.max(0, Math.min(camX, mapW - screenW))
  camY = Math.max(0, Math.min(camY, mapH - screenH))

  map.style.left = `${-camX}px`
  map.style.top = `${-camY}px`

  player.style.left = `${playerX - camX}px`
  player.style.top = `${playerY - camY}px`
}

function update() {
  let dx = 0
  let dy = 0

  if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1
  if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1
  if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1

  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy)
    dx /= length
    dy /= length

    const currentSpeed = keys['Shift'] ? speedRun : speedWalk

    const nextX = playerX + dx * currentSpeed
    const nextY = playerY + dy * currentSpeed

    if (!isBlocked(nextX, nextY)) {
      playerX = nextX
      playerY = nextY
      message.textContent = keys['Shift']
        ? 'Du rennst durch den Zeichenhafen.'
        : 'Du erkundest den Zeichenhafen.'
    } else {
      message.textContent =
        'Hier geht es nicht weiter. Suche einen Weg über Land, Stege oder Brücken.'
    }
  }

  updateCamera()
  requestAnimationFrame(update)
}

update()
