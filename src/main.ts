import './style.css'

const MAP_SRC = '/zeichenhafen-map.png'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div id="game">
    <img id="map" src="${MAP_SRC}" alt="Zeichenhafen Karte" />
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
    width: 18px;
    height: 28px;
    z-index: 5;
    border-radius: 50% 50% 35% 35%;
    background:
      radial-gradient(circle at 50% 18%, #f2c99b 0 18%, transparent 19%),
      radial-gradient(circle at 42% 16%, #3b2418 0 10%, transparent 11%),
      linear-gradient(#173f5f 28%, #1d78a8 28% 68%, #2b1b12 68%);
    border: 2px solid #f7edc9;
    box-shadow: 0 3px 6px rgba(0,0,0,.45);
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

const map = document.getElementById('map') as HTMLImageElement
const player = document.getElementById('player') as HTMLDivElement
const message = document.getElementById('message') as HTMLDivElement

const mapW = 1536
const mapH = 1024

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

function isInsideRect(
  x: number,
  y: number,
  rect: { x: number; y: number; w: number; h: number }
): boolean {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
}

const waterBlocks = [
  { x: 0, y: 0, w: 1536, h: 90 },
  { x: 0, y: 90, w: 80, h: 934 },
  { x: 1450, y: 90, w: 86, h: 934 },
  { x: 0, y: 900, w: 1536, h: 124 },
  { x: 370, y: 160, w: 210, h: 720 },
  { x: 720, y: 540, w: 260, h: 230 },
  { x: 980, y: 640, w: 150, h: 120 },
]

const buildingBlocks = [
  { x: 465, y: 640, w: 190, h: 125 },
  { x: 1130, y: 745, w: 130, h: 120 },
  { x: 1045, y: 410, w: 150, h: 145 },
  { x: 730, y: 95, w: 220, h: 180 },
  { x: 135, y: 125, w: 210, h: 185 },
  { x: 1130, y: 575, w: 120, h: 100 },
  { x: 330, y: 675, w: 95, h: 90 },
]

function getBlockReason(x: number, y: number): 'water' | 'building' | null {
  const footX = x + 9
  const footY = y + 27

  for (const rect of buildingBlocks) {
    if (isInsideRect(footX, footY, rect)) return 'building'
  }

  for (const rect of waterBlocks) {
    if (isInsideRect(footX, footY, rect)) return 'water'
  }

  return null
}

function isBlocked(x: number, y: number): boolean {
  if (x < 20 || y < 20 || x > mapW - 40 || y > mapH - 40) return true
  return getBlockReason(x, y) !== null
}

function updateCamera() {
  const screenW = window.innerWidth
  const screenH = window.innerHeight

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

    const blockReason = getBlockReason(nextX, nextY)

    if (!isBlocked(nextX, nextY)) {
      playerX = nextX
      playerY = nextY
      message.textContent = keys['Shift']
        ? 'Du rennst durch den Zeichenhafen.'
        : 'Du erkundest den Zeichenhafen.'
    } else if (blockReason === 'building') {
      message.textContent =
        'Hier steht ein Gebäude. Suche eine Tür oder einen Weg daran vorbei.'
    } else if (blockReason === 'water') {
      message.textContent =
        'Hier ist Wasser. Suche einen Weg über Land, Stege oder Brücken.'
    } else {
      message.textContent = 'Hier geht es nicht weiter.'
    }
  }

  updateCamera()
  requestAnimationFrame(update)
}

update()
