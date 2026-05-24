import Phaser from 'phaser';
import './style.css';
import mapUrl from './assets/zeichenhafen-map.png';

type Place = { key:string; title:string; subtitle:string; x:number; y:number; locked:boolean; quest?:string };
const PLACES: Place[] = [
  {key:'punktkai', title:'Punktkai', subtitle:'Die ruhigen Enden – Punkt', x:1225, y:760, locked:false, quest:'Punktkai Phase 1: Bearbeite die erste Heftseite und zeige sie deiner Lehrkraft.'},
  {key:'fragensteg', title:'Fragensteg', subtitle:'Die Fragen des Hafens – Fragezeichen', x:1220, y:360, locked:false, quest:'Fragensteg Phase 1: Finde Fragesätze und Fragewörter.'},
  {key:'rufklippen', title:'Rufklippen', subtitle:'Die starken Stimmen – Ausrufezeichen', x:260, y:300, locked:true},
  {key:'listenpier', title:'Listenpier', subtitle:'Die geordneten Reihen – Aufzählungen', x:640, y:840, locked:true},
  {key:'kommahafen', title:'Kommahafen', subtitle:'Die getrennten Gedanken – Kommas', x:1190, y:650, locked:true},
  {key:'redebruecken', title:'Redebrücken', subtitle:'Die Stimmen im Hafen – wörtliche Rede', x:590, y:255, locked:true},
  {key:'gedankenbucht', title:'Gedankenbucht', subtitle:'Die stillen Einschübe – Gedankenstrich', x:360, y:680, locked:true},
  {key:'archiv', title:'Archiv der Zeichenmeister', subtitle:'Die Ordnung aller Texte – flexibel schreiben', x:865, y:270, locked:true},
];

class BootScene extends Phaser.Scene {
  constructor(){ super('boot'); }
  preload(){ this.load.image('map', mapUrl); }
  create(){
    this.cameras.main.setBackgroundColor('#061923');
    const title = this.add.text(this.scale.width/2, this.scale.height/2-55, 'NAVARIS', {fontSize:'58px', color:'#f4e2b8', stroke:'#061923', strokeThickness:8}).setOrigin(.5);
    const sub = this.add.text(this.scale.width/2, this.scale.height/2+15, 'Deutschron – Zeichenhafen Alpha 0.1', {fontSize:'24px', color:'#f4e2b8'}).setOrigin(.5);
    const hint = this.add.text(this.scale.width/2, this.scale.height/2+80, 'Tippen oder Leertaste drücken', {fontSize:'18px', color:'#d6c49a'}).setOrigin(.5);
    this.tweens.add({targets:hint, alpha:.35, duration:800, yoyo:true, repeat:-1});
    this.input.once('pointerdown', ()=>this.scene.start('map'));
    this.input.keyboard?.once('keydown-SPACE', ()=>this.scene.start('map'));
  }
}

class MapScene extends Phaser.Scene {
  player!: Phaser.GameObjects.Container; cursors!: Phaser.Types.Input.Keyboard.CursorKeys; wasd:any; speed=210; run=340; xp=1250; level=7;
  dialog!: Phaser.GameObjects.Container; questText!: Phaser.GameObjects.Text; minimapDot!: Phaser.GameObjects.Arc;
  constructor(){ super('map'); }
  create(){
    const bg=this.add.image(0,0,'map').setOrigin(0); this.physics.world.setBounds(0,0,bg.width,bg.height); this.cameras.main.setBounds(0,0,bg.width,bg.height);
    this.createPlayer(785,900); this.cameras.main.startFollow(this.player, true, .08, .08); this.cameras.main.setZoom(Math.min(this.scale.width/1365, this.scale.height/768)*1.6);
    this.cursors=this.input.keyboard!.createCursorKeys(); this.wasd=this.input.keyboard!.addKeys('W,A,S,D,SHIFT');
    this.createHotspots(); this.createUI(); this.createDialog();
  }
  createPlayer(x:number,y:number){
    const body=this.add.ellipse(0,8,26,34,0x2b5c74).setStrokeStyle(3,0xf4e2b8);
    const head=this.add.circle(0,-18,13,0xf0c28d).setStrokeStyle(2,0x3d2415);
    const hair=this.add.arc(0,-22,14,180,360,false,0x3d2415);
    const shadow=this.add.ellipse(0,30,34,12,0x000000,.35);
    this.player=this.add.container(x,y,[shadow,body,head,hair]); this.physics.add.existing(this.player); const pbody=this.player.body as Phaser.Physics.Arcade.Body; pbody.setCollideWorldBounds(true); pbody.setSize(28,42); pbody.setOffset(-14,-22);
  }
  createHotspots(){
    PLACES.forEach(p=>{ const zone=this.add.zone(p.x,p.y,170,120).setInteractive({useHandCursor:true});
      zone.on('pointerdown',()=>this.openPlace(p));
      const marker=this.add.circle(p.x,p.y-70,18,p.locked?0x8a6d2d:0x2d7f47,.9).setStrokeStyle(3,0xf3ddb0); marker.setInteractive({useHandCursor:true}).on('pointerdown',()=>this.openPlace(p));
      this.add.text(p.x,p.y-73,p.locked?'🔒':'★',{fontSize:'18px'}).setOrigin(.5);
    });
  }
  createUI(){
    const cam=this.cameras.main; const w=this.scale.width; const h=this.scale.height;
    const top=this.add.rectangle(0,0,w,58,0x082b3a,.9).setOrigin(0).setScrollFactor(0);
    this.add.text(18,14,'Deutschron · Zeichenhafen',{fontSize:'24px',color:'#f4e2b8'}).setScrollFactor(0);
    this.add.text(w-230,12,`Lv. ${this.level}`,{fontSize:'20px',color:'#f4e2b8'}).setScrollFactor(0);
    this.add.rectangle(w-155,25,160,16,0x1d1d1d).setScrollFactor(0).setStrokeStyle(2,0xf4e2b8);
    this.add.rectangle(w-235+80,25,100,10,0x58a84f).setScrollFactor(0);
    this.add.text(w-150,37,`${this.xp}/2000 XP`,{fontSize:'12px',color:'#f4e2b8'}).setOrigin(.5,0).setScrollFactor(0);
    ['Questbuch','Inventar','Karte'].forEach((b,i)=>{ const x=20+i*118; this.add.rectangle(x, h-42,105,36,0x173c31,.88).setOrigin(0).setStrokeStyle(2,0xd5bc83).setScrollFactor(0).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.smallToast(b+' ist vorbereitet.')); this.add.text(x+52,h-31,b,{fontSize:'15px',color:'#f4e2b8'}).setOrigin(.5).setScrollFactor(0); });
    this.add.rectangle(w-146,h-118,126,94,0x092b37,.85).setOrigin(0).setStrokeStyle(2,0xd5bc83).setScrollFactor(0); this.add.text(w-84,h-112,'Minimap',{fontSize:'13px',color:'#f4e2b8'}).setOrigin(.5).setScrollFactor(0); this.minimapDot=this.add.circle(w-84,h-72,5,0xf4e2b8).setScrollFactor(0);
  }
  createDialog(){
    const w=this.scale.width,h=this.scale.height; const panel=this.add.rectangle(w/2,h-105,720,120,0x1b1209,.93).setStrokeStyle(3,0xd5bc83).setScrollFactor(0);
    this.questText=this.add.text(w/2-335,h-150,'',{fontSize:'20px',color:'#f4e2b8',wordWrap:{width:670}}).setScrollFactor(0);
    this.dialog=this.add.container(0,0,[panel,this.questText]).setVisible(false);
    this.input.keyboard?.on('keydown-ESC',()=>this.dialog.setVisible(false));
  }
  openPlace(p:Place){
    const text = p.locked ? `${p.title}\n${p.subtitle}\n\nDieser Ort liegt noch im Nebel. Eine Lehrkraft kann den passenden Schlüssel freigeben.` : `${p.title}\n${p.subtitle}\n\n${p.quest ?? 'Dieser Ort ist vorbereitet.'}\n\nStatus: betretbar. Lehrerbestätigung folgt später über das Portal.`;
    this.questText.setText(text); this.dialog.setVisible(true);
  }
  smallToast(t:string){ this.questText.setText(t); this.dialog.setVisible(true); }
  update(_t:number,dt:number){
    const body=this.player.body as Phaser.Physics.Arcade.Body; let vx=0,vy=0; const r=this.wasd.SHIFT?.isDown || this.cursors.shift?.isDown; const s=r?this.run:this.speed;
    if(this.cursors.left.isDown||this.wasd.A.isDown) vx=-s; if(this.cursors.right.isDown||this.wasd.D.isDown) vx=s; if(this.cursors.up.isDown||this.wasd.W.isDown) vy=-s; if(this.cursors.down.isDown||this.wasd.S.isDown) vy=s;
    body.setVelocity(vx,vy); if(vx&&vy) body.velocity.normalize().scale(s); if(vx||vy){this.player.angle=Math.sin(Date.now()/90)*1.5;} else this.player.angle=0;
    const w=this.scale.width,h=this.scale.height; this.minimapDot.setPosition(w-146+20+(this.player.x/1536)*86, h-118+25+(this.player.y/1024)*58);
  }
}

new Phaser.Game({ type: Phaser.AUTO, parent:'app', width: window.innerWidth, height: window.innerHeight, backgroundColor:'#071923', physics:{default:'arcade', arcade:{debug:false}}, scale:{mode:Phaser.Scale.RESIZE, autoCenter:Phaser.Scale.CENTER_BOTH}, scene:[BootScene,MapScene] });
