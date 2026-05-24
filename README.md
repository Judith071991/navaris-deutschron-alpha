# Navaris – Deutschron Alpha 0.1

Dies ist das erste echte Fundament für die spätere Navaris-Web-App. Es ist keine Wegwerf-Demo: Die Struktur ist so angelegt, dass später Supabase-Login, Lehrerportal, Quests, XP, Inventar und weitere Welten ergänzt werden können.

## Enthalten
- Phaser-Webspiel mit Startbildschirm
- Zeichenhafen als erste Region
- Spielfigur mit Pfeiltasten/WASD
- Rennen mit Shift
- anklickbare Orte
- Platzhalter für XP-Leiste, Questbuch, Inventar, Karte und Minimap
- PWA-Grundmanifest

## Lokal testen
```bash
npm install
npm run dev
```

## Für Vercel
Framework Preset: Vite  
Build Command: `npm run build`  
Output Directory: `dist`

## Nächste Ausbaustufen
1. Touch-Steuerung für iPad ergänzen
2. Tilemap statt Einzelbild als echte begehbare Karte
3. Supabase einbinden
4. Schüler-/Lehrerrollen anlegen
5. Quest- und XP-System speichern
6. Lehrerfreigabe und Rückkehrquests bauen
