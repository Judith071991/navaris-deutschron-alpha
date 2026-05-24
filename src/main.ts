import './style.css'

const MAP_SRC = '/zeichenhafen-map.png'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
<div id="game">
  <img id="map" src="${MAP_SRC}" alt="Zeichenhafen" />

  <div id="player"></div>

  <div id="hud">
    <div class="hud-row">
      <strong>Navaris – Deutschron</strong>
      <span>Lv. 1</span>
    </div>

    <div id="xpbar">
      <div id="xpfill"></div>
    </div>
  </div>

  <div id="buttons">
    <button>Questbuch</button>
    <button>Inventar</button>
    <button>Karte</button>
    <button>Gadgets</button>
  </div>

  <div id="message">
    Willkommen im Zeichenhafen.
  </div>

  <div id="interaction">
    Drücke E
  </div>
</div>
`

const style = document.createElement('style')

style.textContent = `
html, body, #app {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0e2430;
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
  user-select: none;
  pointer-events: none;
}

#player {
  position: absolute;
  width: 16px;
  height: 24px;
  border-radius: 40% 40% 30% 30%;
  background:
    radial-gradient(circle at 50% 18%, #f1c99d 0 18%, transparent 19%),
    radial-gradient(circle at 45% 15%, #3d2417 0 8%, transparent 9%),
    linear-gradient(#173f5f 25%, #2374a5 25% 72%, #2b1b12 72%);
  border: 2px solid #f5e6b7;
  box-shadow: 0 2px 5px rgba(0,0,0,.45);
  z-index: 10;
}

#hud {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 250px;
  padding: 10px;
  background: rgba(15, 34, 43, .88);
  color: #f8e8be;
  border: 3px solid #c9a86a;
  border-radius: 10px;
  z-index: 100;
}

.hud-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

#xpbar {
  height: 12px;
  background: #261c14;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d5b978;
}

#xpfill {
  width: 22%;
  height: 100%;
  background: #77b648;
}

#buttons {
  position: absolute;
  left: 12px;
  bottom: 16px;
  display: flex;
  gap: 8px;
  z-index: 100;
}

button {
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid #c9a86a;
  background: #f2e2ba;
  font-weight: bold;
}

#message {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  min-width: 400px;
  max-width: 700px;
  padding: 14px 18px;
  border-radius: 10px;
  border: 3px solid #c9a86a;
  background: rgba(0,0,0,.82);
  color: #f8e8be;
  text-align: center;
  z-index: 100;
}

#interaction {
  position: absolute;
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(0,0,0,.88);
  color: white;
  border: 2px solid #c9a86a;
  display: none;
  z-index: 150;
}
`

document.head.appendChild(style)

const map = document.getElementById('map') as HTMLImageElement
const player = document.getElementById('player') as HTMLDivElement
const message = document.getElementById('message') as HTMLDivElement
const interaction = document.getElementById('interaction') as HTMLDivElement

const mapW = 1536
const mapH = 1024

let playerX = 735
let playerY = 860

const speedWalk = 3.5
const speedRun = 6.5

const keys: Record<string, boolean> = {}

document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true
})

document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false
})

const walkAreas = [
  { x: 620, y: 760, w: 220, h: 180 }, // Startbereich

  { x: 820, y: 760, w: 240, h: 120 }, // Weg Punktkai
  { x: 1000, y: 700, w: 220, h: 200 }, // Punktkai

  { x: 760, y: 640, w: 80, h: 150 }, // Verbindungsweg
]

function isInsideRect(
  x: number,
  y: number,
  rect: { x: number; y: number; w: number; h: number }
) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.w &&
    y >= rect.y &&
    y <= rect.y + rect.h
  )
}

function canWalk(x: number, y: number) {
  const footX = x + 8
  const footY = y + 22

  for (const area of walkAreas) {
    if (isInsideRect(footX, footY, area)) {
      return true
    }
  }

  return false
}

const punktkaiNPC = {
  x: 1115,
  y: 760,
  radius: 70,
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

  interaction.style.left = `${punktkaiNPC.x - camX - 20}px`
  interaction.style.top = `${punktkaiNPC.y - camY - 40}px`
}

function updateInteraction() {
  const dist = Math.hypot(
    playerX - punktkaiNPC.x,
    playerY - punktkaiNPC.y
  )

  if (dist < punktkaiNPC.radius) {
    interaction.style.display = 'block'

    if (keys['e']) {
      message.textContent =
        'Torven: Willkommen am Punktkai. Deine erste Aufgabe wartet im Questbuch.'
    }
  } else {
    interaction.style.display = 'none'
  }
}

function update() {
  let dx = 0
  let dy = 0

  if (keys['arrowup'] || keys['w']) dy -= 1
  if (keys['arrowdown'] || keys['s']) dy += 1
  if (keys['arrowleft'] || keys['a']) dx -= 1
  if (keys['arrowright'] || keys['d']) dx += 1

  if (dx !== 0 || dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy)

    dx /= len
    dy /= len

    const speed = keys['shift'] ? speedRun : speedWalk

    const nextX = playerX + dx * speed
    const nextY = playerY + dy * speed

    if (canWalk(nextX, nextY)) {
      playerX = nextX
      playerY = nextY

      message.textContent = keys['shift']
        ? 'Du rennst durch den Zeichenhafen.'
        : 'Du erkundest den Zeichenhafen.'
    } else {
      message.textContent =
        'Dieser Bereich ist noch nicht zugänglich.'
    }
  }

  updateInteraction()
  updateCamera()

  requestAnimationFrame(update)
}

update()
