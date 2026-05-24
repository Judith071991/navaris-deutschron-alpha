import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
<div id="game-container">
  <img id="map" src="/zeichenhafen-map.png" alt="Zeichenhafen" />
  
  <div id="player"></div>

  <div id="ui-top">
    <div id="xp-bar">
      <div id="xp-fill"></div>
    </div>
    <div id="level">Lv. 1</div>
  </div>

  <div id="ui-bottom">
    <button>Questbuch</button>
    <button>Inventar</button>
    <button>Karte</button>
    <button>Gadgets</button>
  </div>

  <div id="message-box">
    Willkommen im Zeichenhafen.
  </div>
</div>
`

const player = document.getElementById('player') as HTMLDivElement
const messageBox = document.getElementById('message-box') as HTMLDivElement

let x = 700
let y = 820

const speed = 6

function updatePlayer() {
  player.style.left = `${x}px`
  player.style.top = `${y}px`
}

updatePlayer()

document.addEventListener('keydown', (e) => {
  let newX = x
  let newY = y

  if (e.key === 'ArrowUp') newY -= speed
  if (e.key === 'ArrowDown') newY += speed
  if (e.key === 'ArrowLeft') newX -= speed
  if (e.key === 'ArrowRight') newX += speed

  // Kartenränder
  if (newX < 40) return
  if (newY < 40) return
  if (newX > 1450) return
  if (newY > 920) return

  // Wasserbereiche grob blockieren
  const blocked =
    // unteres Wasser
    (newY > 870) ||

    // linkes Wasser
    (newX < 140 && newY > 300) ||

    // rechtes Wasser
    (newX > 1280 && newY > 250) ||

    // mittlerer Kanal links
    (newX > 420 && newX < 560 && newY > 250 && newY < 860) ||

    // Kommahafen Wasser
    (newX > 760 && newX < 980 && newY > 520 && newY < 760)

  if (blocked) {
    messageBox.innerText =
      'Hier geht es nicht weiter. Der Weg muss über Stege, Brücken oder Land führen.'
    return
  }

  x = newX
  y = newY

  messageBox.innerText = 'Erkunde den Zeichenhafen.'

  updatePlayer()
})
