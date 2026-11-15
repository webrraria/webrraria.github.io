
if(window.__WEBRRARIA_MOBILE_BLOCKED__){
  const font=Object.entries(window.__PERSONAL_PACK||{}).find(([key])=>/\.ttf$/i.test(key));
  if(font&&window.FontFace){const face=new FontFace('WebrrariaNotice',`url(${font[1]})`);face.load().then(loaded=>document.fonts.add(loaded)).catch(()=>{});}
}else{

// Sandboxed file previews may deny persistent storage; gameplay still works in memory.
const gameStorage=(()=>{
  const memory=new Map();let store=null;
  try{store=window.localStorage;const k='terraria-storage-test';store.setItem(k,'1');store.removeItem(k);}catch(e){}
  return {getItem(k){if(memory.has(k))return memory.get(k);try{return store?.getItem(k)??null;}catch(e){return null;}},setItem(k,v){try{if(store){store.setItem(k,String(v));memory.delete(k);return true;}}catch(e){}memory.set(k,String(v));return false;},removeItem(k){memory.delete(k);try{store?.removeItem(k);}catch(e){}},persistent:!!store};
})();

/* =========================================================
   TERRARIA WEB - High Quality Port
   Classic Demo engine. No external assets required.
   Real textures supported via user-uploaded pack (personal use only)
   ========================================================= */
const TILE = 16;
const WORLD_W = 520; // tiles
const WORLD_H = 200;
const GRAVITY = 0.55;
const JUMP = -9.2;
const SPEED = 3.0;
const MAX_FALL = 12;

// Tile IDs
const T = {
  AIR:0,
  DIRT:1, GRASS:2, STONE:3, WOOD:4, LEAVES:5, SAND:6, SNOW:7,
  TORCH:8, COPPER:9, IRON:10, PLATFORM:11, CHEST:12,
  BRICK:13, GLASS:14, TRUNK:15,
  MUD:16,JUNGLE_GRASS:17,MUSHROOM_GRASS:18,MUSHROOM:19,VINE:20,MOSS_BRICK:21,GLOW_LANTERN:22,
  AMBER:23,ICE_BRICK:24,STONE_BRICK:25,TIMBER:26,AMBER_LAMP:27,SUPPLY_CACHE:28,WORKBENCH:34,FURNACE:35,ANVIL:36,CHAIR:37,TABLE:38,STONE_SLAB:29,SANDSTONE_BRICK:30,SNOW_BRICK:31,MARBLE:32,GRANITE:33,
};
const TILE_NAME = {
  [T.WORKBENCH]:'Work Bench',[T.FURNACE]:'Furnace',[T.ANVIL]:'Iron Anvil',[T.CHAIR]:'Wooden Chair',[T.TABLE]:'Wooden Table',
  [T.STONE_SLAB]:'Stone Slab',[T.SANDSTONE_BRICK]:'Sandstone Brick',[T.SNOW_BRICK]:'Snow Brick',[T.MARBLE]:'Marble Block',[T.GRANITE]:'Granite Block',
  [T.AIR]:'Air',[T.DIRT]:'Dirt',[T.GRASS]:'Grass',[T.STONE]:'Stone',[T.WOOD]:'Wood',
  [T.LEAVES]:'Leaves',[T.SAND]:'Sand',[T.SNOW]:'Snow',[T.TORCH]:'Torch',[T.COPPER]:'Copper Ore',
  [T.IRON]:'Iron Ore',[T.PLATFORM]:'Platform',[T.CHEST]:'Chest',[T.BRICK]:'Brick',[T.GLASS]:'Glass',[T.TRUNK]:'Tree',[T.MUD]:'Mud',[T.JUNGLE_GRASS]:'Jungle Grass',[T.MUSHROOM_GRASS]:'Mushroom Grass',[T.MUSHROOM]:'Blue Mushroom',[T.VINE]:'Vine',[T.MOSS_BRICK]:'Moss Brick',[T.GLOW_LANTERN]:'Glow Lantern',[T.AMBER]:'Amber Ore',[T.ICE_BRICK]:'Ice Brick',[T.STONE_BRICK]:'Stone Brick',[T.TIMBER]:'Timber Block',[T.AMBER_LAMP]:'Amber Lamp',[T.SUPPLY_CACHE]:'Supply Cache',
};
const SOLID = new Set([T.DIRT,T.GRASS,T.STONE,T.WOOD,T.SAND,T.SNOW,T.COPPER,T.IRON,T.BRICK,T.GLASS,T.CHEST,T.MUD,T.JUNGLE_GRASS,T.MUSHROOM_GRASS,T.MOSS_BRICK,T.AMBER,T.ICE_BRICK,T.STONE_BRICK,T.TIMBER,T.SUPPLY_CACHE,T.STONE_SLAB,T.SANDSTONE_BRICK,T.SNOW_BRICK,T.MARBLE,T.GRANITE]);
const BREAK_TIME = { // ticks to break with copper pickaxe
  [T.STONE_SLAB]:32,[T.SANDSTONE_BRICK]:24,[T.SNOW_BRICK]:18,[T.MARBLE]:32,[T.GRANITE]:36,
  [T.DIRT]:18,[T.GRASS]:18,[T.SAND]:16,[T.SNOW]:16,[T.WOOD]:22,[T.LEAVES]:10,[T.STONE]:34,[T.COPPER]:40,[T.IRON]:48,[T.BRICK]:30,[T.GLASS]:12,[T.CHEST]:30,[T.PLATFORM]:14,[T.MUD]:16,[T.JUNGLE_GRASS]:18,[T.MUSHROOM_GRASS]:18,[T.MUSHROOM]:4,[T.VINE]:4,[T.MOSS_BRICK]:30,[T.GLOW_LANTERN]:6,[T.TORCH]:6,[T.AMBER]:52,[T.ICE_BRICK]:24,[T.STONE_BRICK]:32,[T.TIMBER]:20,[T.AMBER_LAMP]:6,[T.SUPPLY_CACHE]:16
};
const ITEM_TO_TILE = {
  workbench:T.WORKBENCH,furnace:T.FURNACE,anvil:T.ANVIL,chair:T.CHAIR,table:T.TABLE,
  stoneslab:T.STONE_SLAB,sandstonebrick:T.SANDSTONE_BRICK,snowbrick:T.SNOW_BRICK,marble:T.MARBLE,granite:T.GRANITE,
  dirt:T.DIRT, grass:T.GRASS, stone:T.STONE, wood:T.WOOD, leaves:T.LEAVES, sand:T.SAND, snow:T.SNOW,
  mud:T.MUD,junglegrass:T.JUNGLE_GRASS,mycelium:T.MUSHROOM_GRASS,mushroom:T.MUSHROOM,vine:T.VINE,mossbrick:T.MOSS_BRICK,glowlantern:T.GLOW_LANTERN,
  amber:T.AMBER,icebrick:T.ICE_BRICK,stonebrick:T.STONE_BRICK,timber:T.TIMBER,amberlamp:T.AMBER_LAMP,
  copper:T.COPPER, iron:T.IRON, platform:T.PLATFORM, torch:T.TORCH, brick:T.BRICK, glass:T.GLASS, chest:T.CHEST
};

const extraTileDrops={34:'workbench',35:'furnace',36:'anvil',37:'chair',38:'table',29:'stoneslab',30:'sandstonebrick',31:'snowbrick',32:'marble',33:'granite'};

// Web Audio effects: original local pack samples, gesture unlock, persisted master level.
const SFX=(()=>{
  let saved={};try{saved=JSON.parse(gameStorage.getItem('terraria-sfx')||'{}');}catch(e){}
  let volume=Number.isFinite(saved.volume)?Math.max(0,Math.min(1,saved.volume)):.65;
  let muted=!!saved.muted,context=null,master=null,analyser=null,unlocked=false,decodeFailures=0,played=0,lastError=null,enableOnClick=false;
  const urls=new Map(),buffers=new Map(),pending=new Map(),voices=new Set(),last=new Map();
  const library={
    select:{files:['menu_tick'],gain:.33,wait:.06,group:'ui'},
    open:{files:['menu_open'],gain:.46,wait:.08,group:'ui'},
    close:{files:['menu_close'],gain:.46,wait:.08,group:'ui'},
    save:{files:['menu_tick'],gain:.4,wait:.1},
    dig:{files:['dig_0','dig_1','dig_2'],gain:.48,wait:.13,group:'material'},
    stone:{files:['tink_0','tink_1','tink_2'],gain:.38,wait:.13,group:'material'},
    wood:{files:['dig_0','dig_1','dig_2'],gain:.46,wait:.13,group:'material'},
    grass:{files:['grass'],gain:.25,wait:.15,group:'material'},
    place:{files:['dig_0','dig_1','dig_2'],gain:.48,wait:.1},
    swing:{files:['item_1'],gain:.33,wait:.3},
    craft:{files:['item_37'],gain:.4,wait:.14},
    pickup:{files:['grab'],gain:.3,wait:.09},
    step:{files:['run'],gain:.14,wait:.2,group:'feet'},
    jump:{files:['run'],gain:.12,rate:1.3,wait:.2,group:'feet'},
    land:{files:['run'],gain:.23,rate:.86,wait:.16,group:'feet'},
    hurt:{files:['player_hit_0','player_hit_1','player_hit_2'],gain:.5,wait:.3},
    death:{files:['player_killed'],gain:.55,wait:1},
    slimeHit:{files:['npc_hit_2'],gain:.36,wait:.15},
    zombieHit:{files:['npc_hit_1'],gain:.36,wait:.15},
    slimeDeath:{files:['npc_killed_2'],gain:.4,wait:.15},
    zombieDeath:{files:['npc_killed_1'],gain:.4,wait:.15}
  };
  function updateUI(){
    const button=document.getElementById('btnSound'),slider=document.getElementById('sfxVolume');
    if(button){button.textContent=muted||volume===0?'SFX OFF':context?.state==='running'?'SFX ON':'ENABLE SFX';button.setAttribute('aria-pressed',String(muted));button.title=lastError||'Enable/mute sound effects (M). Use TEST SFX to check playback.';}
    if(slider){slider.value=Math.round(volume*100);slider.title=`Sound effects: ${Math.round(volume*100)}%`;}
  }
  function save(){try{gameStorage.setItem('terraria-sfx',JSON.stringify({volume,muted}));}catch(e){}}
  function apply(){
    if(master){const t=context.currentTime;master.gain.cancelScheduledValues(t);master.gain.setTargetAtTime(muted?0:volume,t,.015);}
    updateUI();save();
  }
  function stop(){for(const source of voices){try{source.stop();}catch(e){}}voices.clear();}
  function setup(){
    if(context)return true;
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio){document.getElementById('btnSound').title='Web Audio is not supported in this browser';return false;}
    try{
      context=new Audio();master=context.createGain();master.gain.value=muted?0:volume;
      const limiter=context.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=10;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.12;
      analyser=context.createAnalyser();analyser.fftSize=1024;
      master.connect(limiter);limiter.connect(analyser);analyser.connect(context.destination);
      context.addEventListener('statechange',updateUI);return true;
    }catch(e){return false;}
  }
  async function load(name){
    if(buffers.has(name))return buffers.get(name);
    if(pending.has(name))return pending.get(name);
    if(!context||!urls.has(name))return null;
    const job=(async()=>{try{
      const url=urls.get(name);let bytes;
      if(url.startsWith('data:')){
        // No fetch(): the file viewer denies network connections, including data fetches.
        const split=url.indexOf(','),header=url.slice(0,split),payload=url.slice(split+1);
        const raw=header.includes(';base64')?atob(payload):decodeURIComponent(payload);
        bytes=Uint8Array.from(raw,c=>c.charCodeAt(0)).buffer;
      }else{
        const response=await fetch(url);if(!response.ok)throw Error('Audio download failed');bytes=await response.arrayBuffer();
      }
      const buffer=await context.decodeAudioData(bytes);buffers.set(name,buffer);return buffer;
    }catch(e){decodeFailures++;lastError='Could not decode '+name+': '+e.message;return null;}finally{pending.delete(name);}})();
    pending.set(name,job);return job;
  }
  function unlock(){
    if(!setup())return;
    unlocked=true;
    // resume is called directly inside the trusted gesture for mobile autoplay policies.
    if(context.state!=='running')context.resume().catch(e=>{lastError=e.message;updateUI();});
    updateUI();
    for(const name of urls.keys())load(name);
  }
  function register(name,url){
    name=name.replace(/\.(wav|mp3|ogg)$/i,'').toLowerCase();urls.set(name,url);buffers.delete(name);
    if(unlocked)load(name);
  }
  function fallback(name){
    // Shareable asset-free build: small procedural effects, never a bundled game recording.
    const length=name==='death'?.3:name==='swing'?.13:.065;
    const b=context.createBuffer(1,Math.ceil(context.sampleRate*length),context.sampleRate),data=b.getChannelData(0);
    const noisy=['dig','stone','wood','grass','place','step','land','swing'].includes(name);
    for(let i=0;i<data.length;i++){const t=i/context.sampleRate,env=(1-i/data.length)**2;data[i]=(noisy?Math.random()*2-1:Math.sin(2*Math.PI*(name==='pickup'?900:420)*t))*env*.22;}
    return b;
  }
  async function play(name,options={}){
    const spec=library[name];if(!spec||!unlocked||!context||muted||volume===0||document.hidden)return;
    const now=performance.now(),group=options.group||spec.group||name;
    if(now-(last.get(group)??-Infinity)<(options.wait??spec.wait??.1)*1000)return;
    last.set(group,now);
    const file=spec.files[(Math.random()*spec.files.length)|0];
    let gain=(options.gain??1)*spec.gain,pan=0;
    if(options.x!==undefined){
      const dx=options.x-(player.x+player.w/2),dy=(options.y??player.y)-player.y;
      gain*=Math.max(0,1-Math.hypot(dx,dy)/700);pan=Math.max(-.8,Math.min(.8,dx/350));
    }
    if(gain<.005)return;
    if(context.state!=='running'){
      try{await Promise.race([context.resume(),new Promise(resolve=>setTimeout(resolve,300))]);}catch(e){lastError=e.message;}
    }
    const buffer=(urls.has(file)?await load(file):null)||fallback(name);
    // Do not play stale queued effects after a tab switch, mute, or delayed decoding.
    if(!buffer||muted||volume===0||document.hidden||performance.now()-now>1800||context.state!=='running')return;
    if(voices.size>=18){const oldest=voices.values().next().value;try{oldest.stop();}catch(e){}voices.delete(oldest);}
    const source=context.createBufferSource(),level=context.createGain();source.buffer=buffer;
    source.playbackRate.value=(spec.rate||1)*(options.rate||1)*(.97+Math.random()*.06);level.gain.value=gain;
    source.connect(level);
    if(context.createStereoPanner){const p=context.createStereoPanner();p.pan.value=pan;level.connect(p);p.connect(master);source.onended=()=>{voices.delete(source);source.disconnect();level.disconnect();p.disconnect();};}
    else{level.connect(master);source.onended=()=>{voices.delete(source);source.disconnect();level.disconnect();};}
    voices.add(source);source.start();played++;
  }
  function toggle(){muted=!muted;if(muted)stop();apply();if(!muted)play('select');}
  document.addEventListener('pointerdown',e=>{
    if(e.target.closest('#btnSound')&&(!unlocked||!context||context.state!=='running'))enableOnClick=true;
    unlock();
  },{capture:true});
  document.addEventListener('touchend',unlock,{capture:true,passive:true});
  document.addEventListener('click',unlock,{capture:true});
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,textarea,select')||e.ctrlKey||e.metaKey||e.altKey)return;
    unlock();if(e.key.toLowerCase()==='m'&&!e.repeat){toggle();e.preventDefault();}
  },{capture:true});
  document.addEventListener('visibilitychange',()=>{if(!context)return;if(document.hidden){stop();context.suspend().catch(()=>{});}else if(unlocked)context.resume().catch(()=>{});});
  async function testSound(){
    unlock();muted=false;if(volume===0)volume=.65;apply();
    try{await Promise.race([context?.resume(),new Promise(resolve=>setTimeout(resolve,400))]);}catch(e){lastError=e.message;}
    if(context?.state!=='running'){
      lastError='Audio is blocked by this browser or embedded preview. Open the live preview and click TEST SFX.';
      toast(lastError,4500);updateUI();return;
    }
    await play('open',{group:'sound-test',wait:0,gain:1.7});toast('Sound test played · M mutes / unmutes',2200);
  }
  document.getElementById('btnSound').addEventListener('click',()=>{
    if(enableOnClick||!unlocked||context?.state!=='running'){enableOnClick=false;testSound();}
    else toggle();
  });
  document.getElementById('btnTestSound').addEventListener('click',testSound);
  document.getElementById('sfxVolume').addEventListener('input',e=>{volume=Number(e.target.value)/100;apply();});
  document.getElementById('sfxVolume').addEventListener('change',()=>play('select'));
  document.addEventListener('click',e=>{
    const slot=e.target.closest('.slot,.invslot,#characterBtn,#resetTexBtn,#demoTexBtn,#closeGuide');
    if(slot)play('select');
  });
  updateUI();
  return {play,register,audioContext:()=>context,clear(){stop();urls.clear();buffers.clear();},inspect:()=>({supported:!!(window.AudioContext||window.webkitAudioContext),state:context?.state||'locked',volume,muted,registered:urls.size,decoded:buffers.size,decodeFailures,active:voices.size,played,lastError,outputPeak:(()=>{if(!analyser)return 0;const a=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(a);return a.reduce((m,v)=>Math.max(m,Math.abs(v)),0);})()})};
})();
// The title recordings are registered from the user's personal asset pack only.
const MenuMusic=(()=>{
  let prefs={};try{prefs=JSON.parse(gameStorage.getItem('webrraria-music')||'{}');}catch(e){}
  let selected=prefs.track==='classic'?'classic':'journey',volume=Number.isFinite(prefs.volume)?Math.max(0,Math.min(1,prefs.volume)):.35;
  const urls=new Map(),buffers=new Map(),pending=new Map();let source=null,gain=null,musicAnalyser=null,stopTimer=null,started=false,lastError=null,playingTrack=null;
  const visible=()=>document.getElementById('menu').style.display!=='none'&&!document.body.classList.contains('in-game-menu');
  function update(){
    const hint=document.getElementById('musicHint');if(hint)hint.textContent=!urls.size?'Load title music in Workshop':lastError?'Click to enable music':!started?'Click anywhere to enable music':volume===0?'Music muted':source?'♫ '+(selected==='classic'?'Title (Classic)':"Journey’s Beginning"):'Menu music ready';
    const range=document.getElementById('musicVolume');if(range)range.value=Math.round(volume*100);
    const choice=document.getElementById('musicTrack');if(choice)choice.value=selected;
    const number=document.getElementById('musicVolumeValue');if(number)number.textContent=Math.round(volume*100)+'%';
  }
  async function decode(track){
    if(buffers.has(track))return buffers.get(track);if(pending.has(track))return pending.get(track);
    const ctx=SFX.audioContext();if(!ctx||!urls.has(track))return null;
    const job=(async()=>{try{const url=urls.get(track);const raw=atob(url.slice(url.indexOf(',')+1));const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const b=await ctx.decodeAudioData(bytes.buffer);buffers.set(track,b);return b;}catch(e){lastError=e.message;return null;}finally{pending.delete(track);}})();pending.set(track,job);return job;
  }
  function stop(){
    if(!source)return;const ctx=SFX.audioContext(),old=source,oldGain=gain;
    oldGain.gain.cancelScheduledValues(ctx.currentTime);oldGain.gain.setTargetAtTime(0,ctx.currentTime,.1);
    clearTimeout(stopTimer);stopTimer=setTimeout(()=>{if(source!==old)return;try{old.stop();}catch(e){}source=null;gain=null;playingTrack=null;update();},500);
  }
  async function play(){
    if(!started||!visible())return;clearTimeout(stopTimer);const ctx=SFX.audioContext();if(!ctx)return;
    if(ctx.state!=='running')ctx.resume().catch(e=>{lastError=e.message;update();});
    const track=selected,b=await decode(track);if(!b||track!==selected||!visible()||!started)return;
    if(source&&playingTrack===track){gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setTargetAtTime(volume,ctx.currentTime,.15);update();return;}
    if(source){const old=source;gain.gain.setTargetAtTime(0,ctx.currentTime,.06);try{old.stop(ctx.currentTime+.3);}catch(e){}}
    const node=ctx.createBufferSource(),level=ctx.createGain();node.buffer=b;node.loop=true;node.connect(level);if(!musicAnalyser){musicAnalyser=ctx.createAnalyser();musicAnalyser.fftSize=256;musicAnalyser.connect(ctx.destination);}level.connect(musicAnalyser);level.gain.value=0;level.gain.setTargetAtTime(volume,ctx.currentTime,.2);node.start();
    source=node;gain=level;playingTrack=track;lastError=null;
    node.onended=()=>{node.disconnect();level.disconnect();};update();
  }
  function save(){gameStorage.setItem('webrraria-music',JSON.stringify({track:selected,volume}));}
  function gesture(){started=true;play();update();}
  document.addEventListener('pointerdown',gesture,{capture:true});document.addEventListener('keydown',gesture,{capture:true});document.addEventListener('touchend',gesture,{capture:true,passive:true});
  document.getElementById('musicHint')?.addEventListener('click',gesture);
  document.getElementById('musicVolume')?.addEventListener('input',e=>{volume=Number(e.target.value)/100;save();if(gain){const ctx=SFX.audioContext();gain.gain.setTargetAtTime(visible()?volume:0,ctx.currentTime,.04);}update();});
  document.getElementById('musicTrack')?.addEventListener('change',e=>{selected=e.target.value==='classic'?'classic':'journey';save();play();update();});
  update();return {register(track,url){urls.set(track,url);update();if(started)play();},clear(){stop();urls.clear();buffers.clear();update();},sync(){visible()?play():stop();update();},inspect:()=>({selected,volume,playing:!!source,playingTrack,registered:urls.size,decoded:buffers.size,duration:buffers.get(selected)?.duration||0,outputPeak:(()=>{if(!musicAnalyser)return 0;const values=new Float32Array(256);musicAnalyser.getFloatTimeDomainData(values);return values.reduce((m,v)=>Math.max(m,Math.abs(v)),0);})(),error:lastError})};
})();

function materialSound(t){
  if([T.STONE,T.IRON,T.COPPER,T.BRICK,T.GLASS,T.AMBER,T.ICE_BRICK,T.STONE_BRICK].includes(t))return 'stone';
  if(t===T.GRASS||t===T.LEAVES)return 'grass';
  if(t===T.WOOD||t===T.TRUNK||t===T.TIMBER||t===T.SUPPLY_CACHE)return 'wood';
  return 'dig';
}

let storedPrefs={};try{storedPrefs=JSON.parse(gameStorage.getItem('webrraria-settings-v1')||'{}')||{};}catch(e){}
const GRAPHICS_QUALITY=Object.freeze({
  lowest:Object.freeze({name:'Lowest',scale:.5,dprCap:1,particleRate:0,particleCap:0,menuFPS:15}),
  low:Object.freeze({name:'Low',scale:.65,dprCap:1,particleRate:.35,particleCap:80,menuFPS:20}),
  medium:Object.freeze({name:'Medium',scale:.75,dprCap:1,particleRate:.6,particleCap:160,menuFPS:24}),
  good:Object.freeze({name:'Good',scale:1,dprCap:1,particleRate:.85,particleCap:320,menuFPS:30}),
  awesome:Object.freeze({name:'Awesome',scale:1,dprCap:2,particleRate:1,particleCap:600,menuFPS:30})
});
const gamePrefs={quality:Object.hasOwn(GRAPHICS_QUALITY,storedPrefs.quality)?storedPrefs.quality:(storedPrefs.lowEnd===true?'medium':'awesome'),zoom:Number.isFinite(storedPrefs.zoom)&&storedPrefs.zoom>=1&&storedPrefs.zoom<=3?storedPrefs.zoom:null,particles:storedPrefs.particles!==false,shake:storedPrefs.shake!==false,coordinates:storedPrefs.coordinates!==false,fps:storedPrefs.fps===true,difficulty:['peaceful','classic','hard'].includes(storedPrefs.difficulty)?storedPrefs.difficulty:'classic',autosave:[0,8,15,30,60].includes(storedPrefs.autosave)?storedPrefs.autosave:8,dayLength:[.5,1,2].includes(storedPrefs.dayLength)?storedPrefs.dayLength:1};

function graphicsPreset(){return GRAPHICS_QUALITY[gamePrefs.quality];}
function worldPixelScale(){const q=graphicsPreset();return Math.min(window.devicePixelRatio||1,q.dprCap)*q.scale;}

// Canvas setup
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d', {alpha:false});
const mini = document.getElementById('mini');
const mctx = mini.getContext('2d');
let DPR = worldPixelScale();
function resize(){
  DPR = worldPixelScale();
  const rect = document.getElementById('gameStage').getBoundingClientRect();
  canvas.width = Math.floor(rect.width * DPR);
  canvas.height = Math.floor(rect.height * DPR);
  canvas.style.width = rect.width+'px';
  canvas.style.height = rect.height+'px';
  ctx.imageSmoothingEnabled=false;
}
window.addEventListener('resize', resize);
resize();

// HiDPI & Zoom
let zoom = 2; // pixel scale multiplier (2 = Terraria-like)
if(window.innerWidth < 900) zoom = 1.7;



// World data
let terrainRevision=0;
let world = []; // 2D array [y][x]
let lightMap = []; // brightness 0..1
let torchLight = []; // emitted light is independent of day/night ambient
let surfaceY = [];
let trees = [];
let worldSeed=1;
let generatorVersion=2; // surface height per x
let spawn = {x:0,y:0};
let time = 0; // 0..24000 (0 dawn)
let day = 1;

// Player
const player = {
  x: 0, y:0, vx:0, vy:0, w:12, h:26,
  dir:1, onGround:false, health:10, maxHealth:10, mana:20,
  inv: [], // {id,count}
  hotbar: [], // length 10
  selected:0,
  swing:0,
  hurtTime:0,
};
for(let i=0;i<10;i++) player.hotbar.push(null);
let inventory = Array(40).fill(null);

// Enemies
let enemies=[];
let particles=[];
let drops=[]; // item entities

// Input
const keys = {};
window.addEventListener('keydown', e=>{
  const k=e.key.toLowerCase();
  if(k==='escape'&&document.getElementById('menu').style.display!=='none'){e.preventDefault();Menu.back();return;}
  if(e.target.matches('input,textarea,select')||e.target.closest('#pvpControl button,#chatPanel button'))return;
  if(Containers.busy()&&inventoryOpen()&&k!=='escape')return;
  if((k==='i'||k==='tab')&&gameStarted&&document.getElementById('menu').style.display==='none'){
    e.preventDefault();if(!e.repeat)toggleInventory();return;
  }
  if(inventoryOpen()&&k!=='escape'){
    if(!e.repeat&&/^[0-9]$/.test(k)){e.preventDefault();inventoryNumberKey(k==='0'?9:Number(k)-1);}
    return;
  }
  if(gameStarted&&[' ','w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
  keys[k]=true;
  if(k==='escape'){
    if(document.getElementById('invOverlay').style.display!=='none'){
      toggleInventory(false);
    } else if(document.getElementById('menu').style.display==='none'){
      openMenu();
    } else {
      // if menu open and playing, close menu
      if(gameStarted) closeMenu();
    }
  }
  if(k>='1' && k<='9' && gameStarted && document.getElementById('invOverlay').style.display==='none'){
    player.selected = parseInt(k)-1;
    updateHotbar();
  }
  if(gameStarted&&!e.repeat&&'1234567890qe'.includes(k)&&document.getElementById('menu').style.display==='none')SFX.play('select');
  if(k==='0' && gameStarted) {player.selected=9; updateHotbar();}
  if(k==='q' && gameStarted){player.selected=(player.selected+9)%10;updateHotbar()}
  if(k==='e' && gameStarted){player.selected=(player.selected+1)%10;updateHotbar()}
});
window.addEventListener('keyup', e=> keys[e.key.toLowerCase()]=false);

let mouse = {x:0,y:0, downL:false, downR:false, worldX:0, worldY:0, tileX:0, tileY:0};
canvas.addEventListener('mousemove', e=>{
  const r=canvas.getBoundingClientRect();
  mouse.x=(e.clientX - r.left)*DPR;
  mouse.y=(e.clientY - r.top)*DPR;
});
canvas.addEventListener('mousedown', e=>{
  if(e.button===0){mouse.downL=true;if(gameStarted&&document.getElementById('menu').style.display==='none'&&ITEMS[player.hotbar[player.selected]?.id]?.tool)SFX.play('swing');}
  if(e.button===2) mouse.downR=true;
  // prevent menu stealing click
  if(gameStarted && document.getElementById('menu').style.display==='none' && document.getElementById('invOverlay').style.display==='none')
    e.preventDefault();
});
window.addEventListener('mouseup', e=>{
  if(e.button===0) mouse.downL=false;
  if(e.button===2) mouse.downR=false;
});
canvas.addEventListener('contextmenu', e=>e.preventDefault());
canvas.addEventListener('wheel', e=>{
  if(!gameStarted) return;
  if(e.deltaY<0) player.selected=(player.selected+9)%10;
  else player.selected=(player.selected+1)%10;
  updateHotbar();SFX.play('select');
},{passive:true});

// Touch joysticks
let joyL={active:false, dx:0, dy:0}, joyR={active:false, dx:0, dy:0};
function setupJoy(el, joy, stick){
  let pid=null, rect=null, cx=0, cy=0;
  el.addEventListener('pointerdown', e=>{
    pid=e.pointerId; el.setPointerCapture(pid);
    rect=el.getBoundingClientRect(); cx=rect.left+rect.width/2; cy=rect.top+rect.height/2;
    joy.active=true; updateJoy(e);
  });
  el.addEventListener('pointermove', e=>{ if(pid===e.pointerId) updateJoy(e)});
  el.addEventListener('pointerup', e=>{ if(pid===e.pointerId){ joy.active=false; joy.dx=0; joy.dy=0; stick.style.left='50%'; stick.style.top='50%'; pid=null; }});
  function updateJoy(e){
    const dx=(e.clientX-cx)/(rect.width/2);
    const dy=(e.clientY-cy)/(rect.height/2);
    const len=Math.hypot(dx,dy);
    const clamped = len>1? {x:dx/len,y:dy/len}:{x:dx,y:dy};
    joy.dx=clamped.x; joy.dy=clamped.y;
    stick.style.left=(50+clamped.x*28)+'%';
    stick.style.top=(50+clamped.y*28)+'%';
  }
}
setupJoy(document.getElementById('joyL'), joyL, document.getElementById('stickL'));
setupJoy(document.getElementById('joyR'), joyR, document.getElementById('stickR'));
document.getElementById('btnJump').addEventListener('touchstart', e=>{keys[' ']=true; e.preventDefault();},{passive:false});
document.getElementById('btnJump').addEventListener('touchend', e=>{keys[' ']=false;},{passive:false});
document.getElementById('btnInv').addEventListener('click', ()=> toggleInventory());

// Camera
let cam = {x:0,y:0};

// Textures - procedural generation + pack override
const texCanvas = document.createElement('canvas');
texCanvas.width = 256; texCanvas.height=256;
const tctx = texCanvas.getContext('2d');
tctx.imageSmoothingEnabled=false;

// Generate placeholder textures sheet: 16x16 tiles for each ID
const atlas = document.createElement('canvas');
atlas.width = 16*16; atlas.height=16;
const actx = atlas.getContext('2d');
actx.imageSmoothingEnabled=false;
const spriteFrameCache=new Map();
const biomeTileCache=new Map();
let loadedPack = {}; // id -> Image
let personalTexturesReady=!window.__PERSONAL_PACK;
let modsReady=false,modRuntime=null;
function updateLaunchButtons(){for(const el of [document.getElementById('playBtn'),document.querySelector('[data-view=home] [data-go=multiplayer]')])el.disabled=!personalTexturesReady||!modsReady;}
function validateModRequirements(value){if(value===undefined)return [];if(!Array.isArray(value)||value.length>8)throw Error('Invalid world mod requirements.');const ids=new Set();return value.map(r=>{if(!r||typeof r.id!=='string'||!/^[a-z][a-z0-9_.-]{0,47}$/.test(r.id)||typeof r.version!=='string'||r.version.length>32||typeof r.hash!=='string'||!/^([a-f0-9]{64})$/.test(r.hash)||ids.has(r.id))throw Error('Invalid world mod requirements.');ids.add(r.id);return {id:r.id,version:r.version,hash:r.hash};});}
function requireWorldMods(value){const requirements=validateModRequirements(value);if(requirements.length){if(!modRuntime)throw Error('World mods are still loading.');modRuntime.check(requirements);}return requirements;}

function personalLoading(loading){personalTexturesReady=!loading;updateLaunchButtons();}
if(window.__PERSONAL_PACK)personalLoading(true);else updateLaunchButtons();

function hash2(x,y){ return Math.abs(Math.sin(x*127.1+y*311.7)*43758.5453)%1 }
function makeTileTexture(id){
  const c = document.createElement('canvas'); c.width=16; c.height=16;
  const x = c.getContext('2d'); x.imageSmoothingEnabled=false;
  // base colors inspired by Terraria but not exact rip
  let base, accent, pattern='noise';
  switch(id){
    case T.DIRT: base='#7a4a24'; accent='#5a3418'; break;
    case T.GRASS: base='#5a3418'; accent='#3a9a2e'; break;
    case T.STONE: base='#8a8d90'; accent='#6b6e71'; break;
    case T.WOOD: base='#9c6b2e'; accent='#7a4f1d'; pattern='wood'; break;
    case T.LEAVES: base='#2d7a1f'; accent='#3fb02f'; break;
    case T.SAND: base='#d9c08a'; accent='#c2a86a'; break;
    case T.SNOW: base='#eef4ff'; accent='#cbd9ef'; break;
    case T.COPPER: base='#8a8d90'; accent='#d67a2e'; pattern='ore'; break;
    case T.IRON: base='#8a8d90'; accent='#d8d6d0'; pattern='ore'; break;
    case T.BRICK: base='#8a3a2e'; accent='#6e2a20'; pattern='brick'; break;
    case T.GLASS: base='#aee4ff'; accent='#dff6ff'; pattern='glass'; break;
    case T.PLATFORM: base='#8e6a2e'; accent='#5a3e18'; break;
    case T.CHEST: base='#b3872e'; accent='#7a5a14'; break;
    case T.TORCH: base='#2b1e0c'; accent='#ffcc33'; break;
    default: base='#000'; accent='#111';
  }
  x.fillStyle=base; x.fillRect(0,0,16,16);
  if(pattern==='noise'){
    for(let i=0;i<32;i++){
      const rx=(hash2(id*10+i, i)*16)|0;
      const ry=(hash2(i, id*10)*16)|0;
      x.fillStyle = hash2(rx,ry)>0.5? accent:'rgba(0,0,0,0.15)';
      x.fillRect(rx,ry,1,1);
      if(id===T.GRASS && ry<4){ x.fillStyle=accent; x.fillRect(rx,0,1,3+ (hash2(rx,ry)*2|0)); }
    }
    if(id===T.GRASS){
      // grass top highlight
      x.fillStyle='#4ec23d'; x.fillRect(0,0,16,3);
      x.fillStyle='#2d8a22'; x.fillRect(0,3,16,1);
    }
    if(id===T.STONE){
      for(let i=0;i<8;i++){ const rx=(hash2(i,id)*14)|0, ry=(hash2(id,i)*14)|0; x.strokeStyle='rgba(0,0,0,0.18)'; x.strokeRect(rx,ry,3,2); }
    }
  } else if(pattern==='wood'){
    x.fillStyle=accent;
    for(let y=0;y<16;y+=4){ x.fillRect(0,y,16,1); x.fillStyle = y%8===0? '#6a4515':'#b07a2a'; }
    // vertical grain
    x.fillStyle='rgba(0,0,0,0.12)'; for(let i=0;i<6;i++) x.fillRect((hash2(id,i)*15)|0,0,1,16);
  } else if(pattern==='ore'){
    // ore speckles
    for(let i=0;i<10;i++){
      const rx=(hash2(id*2+i*3, i)*13)|0, ry=(hash2(i,id*2)*13)|0;
      x.fillStyle=accent; x.fillRect(rx,ry,2,2);
      x.fillStyle='rgba(255,255,255,0.4)'; x.fillRect(rx,ry,1,1);
    }
  } else if(pattern==='brick'){
    x.fillStyle=accent; for(let y=0;y<16;y+=4){ x.fillRect(0,y,16,1); if(y%8===0) for(let px=0;px<16;px+=8) x.fillRect(px,y,1,5); else for(let px=4;px<16;px+=8) x.fillRect(px,y,1,5); }
  } else if(pattern==='glass'){
    x.clearRect(0,0,16,16);
    x.fillStyle='rgba(174,228,255,0.35)'; x.fillRect(0,0,16,16);
    x.strokeStyle='rgba(255,255,255,0.7)'; x.strokeRect(0.5,0.5,15,15);
    x.fillStyle='rgba(255,255,255,0.9)'; x.fillRect(2,2,4,2); x.fillRect(2,5,2,6);
  }
  // border shade
  x.fillStyle='rgba(0,0,0,0.18)'; x.fillRect(0,15,16,1); x.fillRect(15,0,1,16);
  return c;
}
let tileCanvases = {};
function rebuildAtlas(){
  if(window.__PERSONAL_PACK)return; // Personal never generates placeholder textures.
  for(let id=1; id<=14; id++){
    const c = makeTileTexture(id);
    tileCanvases[id]=c;
    // draw into atlas strip
    actx.clearRect((id-1)*16,0,16,16);
    actx.drawImage(c, (id-1)*16,0);
  }
  // torch special 16x16 still
}
rebuildAtlas();

// Try load pack from IndexedDB (if user previously dropped)
let db;
function openDB(){
  return new Promise((res, rej)=>{
    const rq=indexedDB.open('terraria-web',1);
    rq.onupgradeneeded=e=>{ e.target.result.createObjectStore('packs'); };
    rq.onsuccess=e=>{db=e.target.result; res(db);};
    rq.onerror=rej;
  });
}
const packNames = {
  'tiles_18.png':T.WORKBENCH,'tiles_17.png':T.FURNACE,'tiles_16.png':T.ANVIL,'tiles_15.png':T.CHAIR,'tiles_14.png':T.TABLE,
  'tiles_0.png': T.DIRT, 'tiles_1.png': T.STONE, 'tiles_2.png': T.GRASS,
  'tiles_30.png': T.WOOD, 'tiles_53.png': T.SAND, 'tiles_147.png': T.SNOW,
  'tiles_7.png': T.COPPER, 'tiles_6.png': T.IRON, 'npc_1.png': 'slime', 'npc_3.png': 'zombie',
  'tiles_4.png': T.TORCH, 'tiles_19.png': T.PLATFORM, 'tiles_21.png': T.CHEST,
  'tiles_273.png':T.STONE_SLAB,'tiles_151.png':T.SANDSTONE_BRICK,'tiles_148.png':T.SNOW_BRICK,'tiles_357.png':T.MARBLE,'tiles_369.png':T.GRANITE,
  'tiles_59.png':T.MUD,'tiles_60.png':T.JUNGLE_GRASS,'tiles_70.png':T.MUSHROOM_GRASS,
  'tiles_71.png':T.MUSHROOM,'tiles_52.png':T.VINE,'tiles_179.png':T.MOSS_BRICK,'tiles_566.png':T.AMBER,'tiles_206.png':T.ICE_BRICK,'tiles_191.png':T.TIMBER,'tiles_192.png':'nativeLeaves',
  'npc_204.png':'slime-jungle','npc_147.png':'slime-ice','npc_537.png':'slime-sand','npc_254.png':'zombie-cave','npc_49.png':'bat',
  'tiles_38.png': T.BRICK, 'tiles_54.png': T.GLASS
};
const spriteFiles = {
  'player_0_0.png':'partHead0','player_0_1.png':'partHead1','player_0_2.png':'partHead2','player_0_10.png':'partLegs0','player_0_11.png':'partLegs1','player_0_12.png':'partLegs2','player_hair_1.png':'partHair',
  'character_0.png':'character0','character_1.png':'character1','character_2.png':'character2',
  'tree_tops_0.png':'treetop','tree_branches_0.png':'treebranch','tiles_5.png':'trunk',
  'inventory_back.png':'slot','inventory_back2.png':'slotActive','heart.png':'heart','mana.png':'mana',
  'cloud_0.png':'cloud0','cloud_1.png':'cloud1','cloud_2.png':'cloud2','cloud_3.png':'cloud3','cloud_4.png':'cloud4','sun.png':'sun','moon_0.png':'moon'
};
const expandedItemSprites={};const derivedExpansionImages=new WeakSet();
const itemSprites={pickaxe:3509,axe:3506,sword:3507,dirt:2,stone:3,wood:9,grass:2,
  sand:169,snow:593,copper:12,iron:11,platform:94,torch:8,brick:129,glass:170,chest:48,gel:23};
// Original sprites for every personal item. Custom game items reuse an appropriate
// original sprite rather than a procedurally drawn icon or a recolored replacement.
const personalItemSprites={workbench:36,furnace:33,anvil:35,chair:34,table:32,ironbar:22,copperbar:20,ironaxe:10,stoneslab:2119,sandstonebrick:607,snowbrick:594,marble:3066,granite:3087,pickaxe:3509,axe:3506,sword:3507,dirt:2,grass:2,stone:3,wood:9,sand:169,snow:593,copper:12,iron:11,platform:94,torch:8,brick:129,glass:170,chest:48,gel:23,mud:176,junglegrass:195,mycelium:194,mushroom:183,vine:210,mossbrick:137,glowlantern:2547,fiber:210,spore:331,ironsword:4,ironpickaxe:1,jungleblade:190,healingpotion:188,amber:999,icebrick:883,stonebrick:129,timber:620,amberlamp:2133,amberblade:3520,amberpickaxe:3521,ambertonic:188};
function installPersonalTextures(){
  Object.assign(itemSprites,personalItemSprites);
  for(const [id,n]of Object.entries(personalItemSprites))if(loadedPack['item'+n])expandedItemSprites[id]=loadedPack['item'+n];
  if(loadedPack.nativeLeaves){const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');g.drawImage(loadedPack.nativeLeaves,18,18,16,16,0,0,16,16);expandedItemSprites.leaves=c;tileCanvases[T.LEAVES]=c;}
  if(loadedPack[T.BRICK])loadedPack[T.STONE_BRICK]=loadedPack[T.BRICK];
  if(loadedPack[T.CHEST])loadedPack[T.SUPPLY_CACHE]=loadedPack[T.CHEST];
  if(loadedPack.slime)loadedPack['slime-fungal']=loadedPack.slime;
  if(loadedPack.item2547)loadedPack[T.GLOW_LANTERN]=loadedPack.item2547;
  if(loadedPack.item2133)loadedPack[T.AMBER_LAMP]=loadedPack.item2133;
  for(const t of Object.values(T))if(loadedPack[t])tileCanvases[t]=loadedPack[t];
  spriteFrameCache.clear();biomeTileCache.clear();CaveRenderer.clear();
}
function checkPersonalTextures(){
  if(!window.__PERSONAL_PACK)return;
  const required=[...Object.values(T).filter(t=>t!==T.AIR&&t!==T.LEAVES&&t!==T.TRUNK),...Object.values(personalItemSprites).map(n=>'item'+n),'nativeLeaves','trunk','treetop','treebranch','character0','character1','character2','slime','slime-jungle','slime-ice','slime-sand','slime-fungal','zombie','zombie-cave','bat','background0','background2','background3','slot','slotActive','heart','mana'];
  const missing=[...new Set(required)].filter(key=>!loadedPack[key]);
  if(missing.length)throw Error('Personal textures missing: '+missing.join(', '));
  personalLoading(false);
}
let characterStyle=Number(gameStorage.getItem('terraria-character')||0)%3;
function chooseCharacter(){
  characterStyle=(characterStyle+1)%3;gameStorage.setItem('terraria-character',characterStyle);
  document.getElementById('characterBtn').textContent=`CHARACTER ${characterStyle+1} / 3`;toast('Character appearance changed');
}
function itemSprite(id){return loadedPack['item'+itemSprites[id]]||expandedItemSprites[id];}
const itemIconURLs=new WeakMap();
function realItemElement(id,size=30){
  const im=itemSprite(id);if(!im)return null;
  const el=document.createElement('img');el.src=im.src||itemIconURLs.get(im)||(()=>{const url=im.toDataURL();itemIconURLs.set(im,url);return url;})();el.style.cssText=`width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated`;return el;
}
async function applyPack(pack){
  let loaded=0, failed=0;
  spriteFrameCache.clear();biomeTileCache.clear();
  await Promise.all(Object.entries(pack).map(async ([name,url])=>{
    const low=name.split(/[\\/]/).pop().toLowerCase();
    if(/^menu_(journey|classic)\.mp3$/.test(low)){MenuMusic.register(low.includes('classic')?'classic':'journey',url);loaded++;return;}
    if(/\.(wav|mp3|ogg)$/.test(low)){SFX.register(low,url);loaded++;return;}
    if(/\.(ttf|otf)$/.test(low)){
      try{
        const font=await new FontFace('TerrariaAndy', `url(${url})`).load();
        document.fonts.add(font);
        let style=document.getElementById('personalFontStyle');
        if(!style){style=document.createElement('style');style.id='personalFontStyle';document.head.appendChild(style);}
        style.textContent=`
          body,#game-wrap,#game-wrap *{font-family:TerrariaAndy,Arial,sans-serif !important;font-synthesis:none}
          #topbar button{font-size:13px}#topbar .title{font-size:17px}
          .panel h1{font-size:34px}.panel h2{font-size:21px}.btn{font-size:18px}
          .controls-help,.notice{font-size:15px}.toast{font-size:18px}
          #hotbar::before,#hearts::before,#mana::before{font-family:TerrariaAndy,Arial,sans-serif!important}
          #hotbar .slot span.num{font-size:14px}#hotbar .slot span.cnt{font-size:17px}
          #minimap .label{font-size:15px}#coords{font-size:15px}
          .inventory-panel h1{font-size:29px!important}.inventory-section-title{font-size:20px}
          .inventory-section-title span{font-size:14px}.inventory-help,.inventory-held{font-size:16px}
          .inventory-close,.inventory-action{font-size:16px}.inventory-close kbd{font-size:13px}
          #invOverlay .slot-index{font-size:13px}#invOverlay .slot-count{font-size:17px}
          #itemName{font-size:20px}#itemType{font-size:15px}#itemDescription{font-size:17px}#itemStack{font-size:15px}
          .recipe{min-height:82px;flex-shrink:0}.recipe-text{font-size:18px;line-height:1.15}.recipe-needs{font-size:15px;line-height:1.15}.craft-options,.inventory-muted{font-size:14px}
          @media(max-width:600px){#topbar button{font-size:12px}#hotbar .slot span.num,#invOverlay .slot-index{font-size:10px}#hotbar .slot span.cnt,#invOverlay .slot-count{font-size:13px}.inventory-help{font-size:14px}.inventory-close{font-size:14px}.inventory-panel h1{font-size:24px!important}}
        `;
        loaded++;
      }catch(e){failed++;}
      return;
    }
    const item=low.match(/^item_(\d+)\.png$/);
    const bg=low.match(/^background_(\d+)\.png$/),star=low.match(/^star_(\d+)\.png$/);
    const key=packNames[low]??spriteFiles[low]??(bg?'background'+bg[1]:star?'star'+star[1]:item ? 'item'+item[1] : undefined);
    if(key===undefined)return;
    try{
      const img=new Image();img.src=url;await img.decode();loadedPack[key]=img;loaded++;
    }catch(e){failed++;}
  }));
  installExpansionTextures();modRuntime?.refresh?.();checkPersonalTextures();
  document.getElementById('texStatus').textContent=failed?`Pack loaded; ${failed} files couldn’t load.`:'Resource pack loaded.';
  document.getElementById('texStatus').style.color=failed?'#ffd700':'#7fff7f';
  let style=document.getElementById('packUIStyle');
  if(!style){style=document.createElement('style');style.id='packUIStyle';document.head.appendChild(style);}
  style.textContent=(loadedPack.slot ? `:root{--inventory-slot-image:url("${loadedPack.slot.src}");--inventory-active-slot-image:url("${(loadedPack.slotActive||loadedPack.slot).src}")}.slot,.invslot{background-image:url("${loadedPack.slot.src}");background-size:100% 100%;border-color:transparent}.slot.active{background-image:url("${(loadedPack.slotActive||loadedPack.slot).src}")}` : '')+
   (loadedPack.heart ? `.heart,.heart.empty{background:transparent url("${loadedPack.heart.src}") center/contain no-repeat;clip-path:none;border:0;width:22px;height:22px}.heart:after{display:none}.heart.empty{opacity:.25}` : '')+
   (loadedPack.mana ? `.star{background:transparent url("${loadedPack.mana.src}") center/contain no-repeat;clip-path:none;border:0;width:22px;height:24px}` : '');
  updateHotbar();updateHearts();updateMana();
  return loaded;
}
async function loadPersistedPack(){
  try{
    if(window.__PERSONAL_PACK)await applyPack(window.__PERSONAL_PACK);
    const d=await openDB();
    const pack=await new Promise((resolve,reject)=>{
      const r=d.transaction('packs','readonly').objectStore('packs').get('active');
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
    });
    if(pack)await applyPack(pack);
  }catch(e){console.warn('Could not load saved pack',e);if(window.__PERSONAL_PACK){document.getElementById('texStatus').textContent=e.message;toast(e.message,8000);}}
}
const artReady=loadPersistedPack();
document.getElementById('characterBtn').textContent=`CHARACTER ${characterStyle+1} / 3`;
document.getElementById('characterBtn').addEventListener('click',chooseCharacter);

// File drop handling
const dropzone=document.getElementById('dropzone');
const fileInput=document.getElementById('fileInput');
dropzone.addEventListener('click', ()=> fileInput.click());
dropzone.addEventListener('dragover', e=>{e.preventDefault(); dropzone.classList.add('drag')});
dropzone.addEventListener('dragleave', ()=> dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', e=>{e.preventDefault(); dropzone.classList.remove('drag'); handleFiles(e.dataTransfer.files)});
fileInput.addEventListener('change', ()=> handleFiles(fileInput.files));

async function handleFiles(files){
  const pack={};
  for(const f of files){
    const name=f.name.toLowerCase();
    if(packNames[name]===undefined && spriteFiles[name]===undefined && !/^(item|background|star)_\d+\.png$/.test(name) && !/\.(ttf|otf|wav|mp3|ogg)$/.test(name))continue;
    pack[f.name]=await new Promise((resolve,reject)=>{
      const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(f);
    });
  }
  if(!Object.keys(pack).length){toast('Use converted PNG textures or a TTF/OTF font; XNB needs conversion first.');return;}
  const n=await applyPack(pack);
  try{
    const d=await openDB();
    await new Promise((resolve,reject)=>{
      const tx=d.transaction('packs','readwrite');tx.objectStore('packs').put(pack,'active');
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    });
    toast('Resource pack loaded and saved.');
  }catch(e){toast('Pack loaded for this session.');}
}
document.getElementById('resetTexBtn').addEventListener('click', async()=>{
  if(window.__PERSONAL_PACK){try{const d=await openDB();d.transaction('packs','readwrite').objectStore('packs').delete('active');}catch{}await applyPack(window.__PERSONAL_PACK);toast('Original personal textures restored.');return;}
  loadedPack={};SFX.clear();MenuMusic.clear();spriteFrameCache.clear();document.getElementById('packUIStyle')?.remove();document.getElementById('personalFontStyle')?.remove();
  document.getElementById('texStatus').textContent='Using default textures';
  document.getElementById('texStatus').style.color='#ffd700';
  try{ const d=await openDB(); const tx=d.transaction('packs','readwrite'); tx.objectStore('packs').delete('active'); }catch(e){}
  toast('Pack reset.');
});
document.getElementById('demoTexBtn').addEventListener('click', ()=> document.getElementById('texGuide').style.display='flex');
document.getElementById('closeGuide').addEventListener('click', ()=> document.getElementById('texGuide').style.display='none');

// Simple noise
function noise(x){ return Math.sin(x*0.01)*0.5 + Math.sin(x*0.023)*0.3 + Math.sin(x*0.05)*0.2; }
function noise2(x,y){ return Math.sin(x*0.05+y*0.05)*0.5 + Math.sin(x*0.1 - y*0.07)*0.3; }

function terrainNoise(x,scale,salt=0){
  const q=x/scale,i=Math.floor(q),f=q-i,t=f*f*(3-2*f);
  const v=j=>hash2(j+worldSeed*.013,salt+worldSeed*.007)*2-1;
  return v(i)*(1-t)+v(i+1)*t;
}
function generateWorld(persist=true,requestedSeed=null){
  Containers.reset();
  worldSeed=requestedSeed===null?((Math.random()*10000000)|0):requestedSeed;generatorVersion=4;trees=[];backgroundBlend=null;
  let state=worldSeed|0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)|0;return (state>>>0)/4294967296;};
  world=Array.from({length:WORLD_H},()=>Array(WORLD_W).fill(T.AIR));
  lightMap=Array.from({length:WORLD_H},()=>Array(WORLD_W).fill(0));surfaceY=[];
  const center=WORLD_W>>1;
  const centerHeight=61+Math.round(terrainNoise(center,65,1)*8);
  for(let x=0;x<WORLD_W;x++){
    let h=61+terrainNoise(x,65,1)*10+terrainNoise(x,25,2)*4+terrainNoise(x,11,3)*1.2;
    const flat=1-Math.min(1,Math.max(0,Math.abs(x-center)-7)/17);
    h=h*(1-flat)+centerHeight*flat;
    h=Math.round(h);
    if(x)h=Math.max(surfaceY[x-1]-1,Math.min(surfaceY[x-1]+1,h));
    surfaceY[x]=h;
    const soil=10+Math.round(terrainNoise(x,24,9)*3);
    const biome=biomeWeights(x);
    for(let y=h;y<WORLD_H;y++){
      let type=y<h+soil?T.DIRT:T.STONE;
      if(y===h)type=T.GRASS;
      const depth=y-h;
      // Biome strata taper into tongues and pockets rather than ending at a vertical wall.
      const ripple=terrainNoise(x+depth*2,13,17)*1.5;
      const snowDepth=7*smooth01((biome.snow-.12)/.88)+ripple*biome.snow;
      const sandDepth=13*smooth01((biome.desert-.1)/.9)+ripple*biome.desert;
      if(biome.snow>.13&&depth<snowDepth)type=T.SNOW;
      if(biome.desert>.11&&depth<sandDepth)type=T.SAND;
      world[y][x]=type;
    }
  }
  function carve(cx,cy,rx,ry,entrance=false){
    for(let yy=Math.floor(cy-ry);yy<=Math.ceil(cy+ry);yy++)for(let xx=Math.floor(cx-rx);xx<=Math.ceil(cx+rx);xx++){
      if(xx<3||xx>=WORLD_W-3||yy<2||yy>=WORLD_H-4)continue;
      if(yy<surfaceY[xx]+(entrance?0:9))continue;
      if(((xx-cx)/rx)**2+((yy-cy)/ry)**2<1)world[yy][xx]=T.AIR;
    }
  }
  // Meandering tunnels connect rooms instead of diagonal stripes and single-cell holes.
  for(let k=0;k<36;k++){
    let x=10+random()*(WORLD_W-20),y=surfaceY[Math.floor(x)]+17+random()*100;
    let angle=random()*Math.PI*2,turn=0;
    const steps=35+(random()*85|0),radius=1.2+random()*1.7;
    for(let j=0;j<steps;j++){
      const r=radius*(1+Math.sin(j*.14)*.3);
      carve(x,y,r*1.3,r);
      turn=turn*.7+(random()-.5)*.3;angle+=turn;
      x+=Math.cos(angle)*1.1;y+=Math.sin(angle)*.65;
      if(x<5||x>WORLD_W-5||y>WORLD_H-7)break;
      if(y<surfaceY[Math.max(0,Math.min(WORLD_W-1,x|0))]+12)angle=Math.abs(angle)+.25;
    }
  }
  for(let i=0;i<35;i++){
    const x=12+random()*(WORLD_W-24),y=surfaceY[x|0]+22+random()*95;
    carve(x,y,3+random()*7,2+random()*4);
  }
  // Two traversable cave mouths away from the safe starting clearing.
  for(const ex of [center-48,center+58]){
    let x=ex,y=surfaceY[ex]+1;
    for(let j=0;j<34;j++){carve(x,y,2.2,2.1,true);x+=.65;y+=.55;}
  }
  // Coherent ore clusters replace scattered single-tile noise.
  for(let k=0;k<190;k++){
    let x=5+random()*(WORLD_W-10),y=surfaceY[x|0]+14+random()*115;
    const type=random()<.55?T.COPPER:T.IRON;
    for(let j=0;j<4+(random()*7|0);j++){
      const xx=x|0,yy=y|0;
      if(xx>1&&xx<WORLD_W-1&&yy>2&&yy<WORLD_H-3){
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(random()<.65&&world[yy+dy][xx+dx]===T.STONE)world[yy+dy][xx+dx]=type;
      }
      x+=random()*2-1;y+=random()*2-1;
    }
  }
  // Tree trunks are separate, non-solid scenery, not stacks of wooden building blocks.
  for(let x=83;x<WORLD_W-99;x+=7+(random()*6|0)){
    if(Math.abs(x-center)<12||world[surfaceY[x]][x]!==T.GRASS)continue;
    if(Math.abs(surfaceY[x]-surfaceY[x+1])>1)continue;
    const base=surfaceY[x]-1,height=6+(random()*6|0),top=base-height+1;
    const tree={x,base,top,variant:random()*3|0,crown:true};
    trees.push(tree);
    for(let y=top;y<=base;y++)world[y][x]=T.TRUNK;
  }
  // Small treasure chambers, always supported and below the surface.
  for(let i=0;i<13;i++){
    const cx=15+(random()*(WORLD_W-30)|0),cy=surfaceY[cx]+24+(random()*65|0);
    for(let dy=-3;dy<=1;dy++)for(let dx=-4;dx<=4;dx++)world[cy+dy][cx+dx]=dy===1?T.WOOD:T.AIR;
    world[cy][cx]=T.CHEST;Containers.seed(cx,cy);
  }
  spawn={x:center*TILE,y:(surfaceY[center]-3)*TILE};
  player.x=spawn.x;player.y=spawn.y;player.vx=0;player.vy=0;
  player.health=player.maxHealth;player.hurtTime=0;player.swing=0;player.onGround=false;time=3800;day=1;particles=[];drops=[];
  // initial light
  updateLightMap();

  // give starter inventory
  player.hotbar=[{id:'pickaxe',count:1},{id:'axe',count:1},{id:'sword',count:1},{id:'dirt',count:150},{id:'wood',count:80},{id:'platform',count:40},{id:'torch',count:60},null,null,null];
  inventory.fill(null);inventoryCursor=null;cursorOrigin=null;
  // fill some extras
  inventory[0]={id:'stone',count:30}; inventory[1]={id:'sand',count:20}; inventory[2]={id:'brick',count:15};inventory[3]={id:'gel',count:10};
  // enemies reset
  enemies=[];
  for(let i=0;i<10;i++) spawnSlime();

  // The menu preview must never overwrite an existing saved world.
  if(persist)saveGame();
}
const lightQueue=[];
const lightKernels=new Map();
function lightKernel(radius,level,falloff){const key=radius+':'+level+':'+falloff;if(lightKernels.has(key))return lightKernels.get(key);const data=[];for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){const value=Math.max(0,level-Math.hypot(dx,dy)*falloff);if(value>0)data.push(dx,dy,value);}const k=new Float64Array(data);lightKernels.set(key,k);return k;}
function updateLightMap(changedCells=null){
  if(!world.length||!world[0])return;
  terrainRevision++;CaveRenderer.invalidate(changedCells);
  if(lightMap.length!==WORLD_H||!(lightMap[0] instanceof Float64Array)){lightMap=Array.from({length:WORLD_H},()=>new Float64Array(WORLD_W));torchLight=Array.from({length:WORLD_H},()=>new Float32Array(WORLD_W));}
  for(let y=0;y<WORLD_H;y++){lightMap[y].fill(.08);torchLight[y].fill(0);}lightQueue.length=0;
  for(let x=0;x<WORLD_W;x++)for(let y=0;y<WORLD_H;y++){lightMap[y][x]=1;if(SOLID.has(world[y][x])){lightQueue.push(y*WORLD_W+x);break;}if(y>0&&(x===0||x===WORLD_W-1))lightQueue.push(y*WORLD_W+x);}
  for(let head=0;head<lightQueue.length;head++){const cell=lightQueue[head],x=cell%WORLD_W,y=(cell/WORLD_W)|0;for(let d=0;d<4;d++){const xx=x+(d===0?-1:d===1?1:0),yy=y+(d===2?1:d===3?-1:0);if(xx<0||xx>=WORLD_W||yy<0||yy>=WORLD_H)continue;const value=lightMap[y][x]-(SOLID.has(world[yy][xx])?.105:.055);if(value>lightMap[yy][xx]+.015){lightMap[yy][xx]=value;lightQueue.push(yy*WORLD_W+xx);}}}
  for(let y=1;y<WORLD_H-1;y++)for(let x=1;x<WORLD_W-1;x++){const t=world[y][x];if(t!==T.TORCH&&t!==T.GLOW_LANTERN&&t!==T.MUSHROOM&&t!==T.AMBER_LAMP)continue;const k=t===T.AMBER_LAMP?lightKernel(10,1,.095):lightKernel(8,t===T.MUSHROOM?.48:1,.115);for(let i=0;i<k.length;i+=3){const xx=x+k[i],yy=y+k[i+1];if(xx<0||xx>=WORLD_W||yy<0||yy>=WORLD_H)continue;const emitted=k[i+2];torchLight[yy][xx]=Math.max(torchLight[yy][xx],emitted);lightMap[yy][xx]=Math.max(lightMap[yy][xx],emitted);}}
}

// Save / Load
function captureGame(){return {mods:modRuntime?.requirements()||[],world,surfaceY,spawn,trees,chests:Containers.dump(),worldSeed,generatorVersion,player:{x:player.x,y:player.y,health:player.health,hotbar:player.hotbar,inv:inventory,selected:player.selected,cursor:inventoryCursor,cursorOrigin},guestProfiles:GuestProfiles.dump(),time,day};}
function saveGame(){
  try{Achievements.flush();if(MP.guest()){MP.checkpoint();return false;}if(!gameStarted||!WorldStore.active())return false;const data=captureGame(),ok=WorldStore.save(data);gameStorage.setItem('terraria-web-save',JSON.stringify(data));return ok!==false;}catch(e){toast('Save failed. Export a world file to keep a backup.',5000);return false;}
}
function loadGame(dataOverride=null){
  try{
    const raw=dataOverride?null:gameStorage.getItem('terraria-web-save');
    if(!dataOverride&&!raw) return false;
    const data=dataOverride||JSON.parse(raw);requireWorldMods(data.mods);
    if(!data.world || data.world.length!==WORLD_H) return false;
    world=data.world; surfaceY=data.surfaceY; spawn=data.spawn;GuestProfiles.reset(data.guestProfiles);Containers.reset(data.chests||[]);
    trees=data.trees||[];worldSeed=data.worldSeed??1;generatorVersion=data.generatorVersion||1;
    if(!data.trees){
      // Legacy saves keep their terrain, but remove detached decorative tree fragments.
      for(let x=0;x<WORLD_W;x++){
        let y=surfaceY[x]-1;
        if(world[y]?.[x]===T.WOOD){
          const base=y;while(y>=0&&world[y][x]===T.WOOD){world[y][x]=T.TRUNK;y--;}
          trees.push({x,base,top:y+1,variant:x%3,crown:true});
        }
        for(let yy=0;yy<surfaceY[x];yy++)if(world[yy][x]===T.LEAVES)world[yy][x]=T.AIR;
      }
    }
    if(data.player){
      player.x=data.player.x; player.y=data.player.y;
      player.health=data.player.health||10;
      if(data.player.hotbar) player.hotbar=data.player.hotbar;
      if(data.player.inv) inventory=Array.from({length:40},(_,i)=>data.player.inv[i]||null);
      inventoryCursor=data.player.cursor||null;cursorOrigin=data.player.cursorOrigin||null;
      player.selected=data.player.selected||0;
    }
    time=data.time??3800; day=data.day||1;
    player.vx=0;player.vy=0;player.hurtTime=0;player.swing=0;player.onGround=false;particles=[];drops=[];backgroundBlend=null;
    updateLightMap();
    enemies=[]; for(let i=0;i<10;i++) spawnSlime();
    return true;
  }catch(e){ return false; }
}

// Items
const ITEMS = {
  workbench:{name:'Work Bench',tile:T.WORKBENCH,description:'Place on the floor. Right-click to open Work Bench crafting. Makes furniture and building supplies.'},
  furnace:{name:'Furnace',tile:T.FURNACE,description:'Place on the floor. Right-click to smelt copper and iron ore into bars, or sand into glass.'},
  anvil:{name:'Iron Anvil',tile:T.ANVIL,description:'Place on the floor. Right-click to turn bars into tools, weapons, and supplies.'},
  chair:{name:'Wooden Chair',tile:T.CHAIR,description:'A chair for your home.'},
  table:{name:'Wooden Table',tile:T.TABLE,description:'A table for your home.'},
  ironbar:{name:'Iron Bar',material:true,description:'Smelt three Iron Ore at a Furnace.'},
  copperbar:{name:'Copper Bar',material:true,description:'Smelt three Copper Ore at a Furnace.'},
  ironaxe:{name:'Iron Axe',tool:'axe',power:1.5},
  stoneslab:{name:'Stone Slab',tile:T.STONE_SLAB},sandstonebrick:{name:'Sandstone Brick',tile:T.SANDSTONE_BRICK},snowbrick:{name:'Snow Brick',tile:T.SNOW_BRICK},marble:{name:'Marble Block',tile:T.MARBLE},granite:{name:'Granite Block',tile:T.GRANITE},
  dirt:{name:'Dirt Block', tile:T.DIRT, icon:'dirt'},
  grass:{name:'Grass Block', tile:T.GRASS, icon:'grass'},
  stone:{name:'Stone Block', tile:T.STONE, icon:'stone'},
  wood:{name:'Wood', tile:T.WOOD, icon:'wood'},
  leaves:{name:'Leaves', tile:T.LEAVES, icon:'leaves'},
  sand:{name:'Sand Block', tile:T.SAND, icon:'sand'},
  snow:{name:'Snow Block', tile:T.SNOW, icon:'snow'},
  copper:{name:'Copper Ore', tile:T.COPPER, icon:'copper'},
  iron:{name:'Iron Ore', tile:T.IRON, icon:'iron'},
  brick:{name:'Brick', tile:T.BRICK, icon:'brick'},
  glass:{name:'Glass', tile:T.GLASS, icon:'glass'},
  platform:{name:'Platform', tile:T.PLATFORM, icon:'platform'},
  torch:{name:'Torch', tile:T.TORCH, icon:'torch'},
  chest:{name:'Chest', tile:T.CHEST, icon:'chest'},
  mud:{name:'Mud',tile:T.MUD},junglegrass:{name:'Jungle Grass',tile:T.JUNGLE_GRASS},mycelium:{name:'Mushroom Grass',tile:T.MUSHROOM_GRASS},
  mushroom:{name:'Blue Mushroom',tile:T.MUSHROOM},vine:{name:'Vine',tile:T.VINE},mossbrick:{name:'Moss Brick',tile:T.MOSS_BRICK},glowlantern:{name:'Glow Lantern',tile:T.GLOW_LANTERN},
  fiber:{name:'Plant Fiber',material:true},spore:{name:'Glowing Spore',material:true},
  ironsword:{name:'Iron Broadsword',tool:'sword',damage:12},ironpickaxe:{name:'Iron Pickaxe',tool:'pickaxe',power:2},jungleblade:{name:'Jungle Blade',tool:'sword',damage:16},healingpotion:{name:'Healing Potion',heal:4},
  amber:{name:'Amber Ore',tile:T.AMBER,description:'Found in deep veins and supply caches. Sand slimes and cave zombies can drop it too.'},
  icebrick:{name:'Ice Brick',tile:T.ICE_BRICK},stonebrick:{name:'Stone Brick',tile:T.STONE_BRICK},timber:{name:'Timber Block',tile:T.TIMBER},amberlamp:{name:'Amber Lamp',tile:T.AMBER_LAMP,description:'A bright lamp for your underground base.'},
  amberblade:{name:'Amber Broadsword',tool:'sword',damage:20},amberpickaxe:{name:'Amber Pickaxe',tool:'pickaxe',power:2.8},ambertonic:{name:'Amber Tonic',heal:6},
  gel:{name:'Gel',material:true},
  pickaxe:{name:'Copper Pickaxe', tool:'pickaxe', power:1},
  axe:{name:'Copper Axe', tool:'axe', power:1},
  sword:{name:'Copper Shortsword', tool:'sword', damage:7},
};

function addToInventory(id,count=1){
  const left=insertStack([player.hotbar,inventory],{id,count});
  updateHotbar();if(inventoryOpen())updateInventoryUI();return left;
}
function consumeSelected(){
  const sel=player.hotbar[player.selected];
  if(!sel) return null;
  return sel;
}

// Enemies
function spawnSlime(){
  let x=(Math.random()*WORLD_W|0);
  // near surface but not too close to player spawn
  if(Math.abs(x - Math.floor(player.x/TILE)) < 24) x+=40;
  if(x>=WORLD_W) x=WORLD_W-10;
  const y=surfaceY[x]-2;
  enemies.push({
    type:'slime', x:x*TILE, y:y*TILE, vx: (Math.random()-0.5)*1.2, vy:0, w:18, h:14,
    health:16, maxHealth:16, dir:Math.random()<0.5?-1:1, jumpCooldown:0, hurt:0, onGround:false
  });
}
function spawnZombie(xTile){
  if(gamePrefs.difficulty==='peaceful')return;
  enemies.push({
    type:'zombie', x:xTile*TILE, y:(surfaceY[xTile]-3)*TILE, vx:0, vy:0, w:14, h:28,
    health:24, maxHealth:24, dir:1, hurt:0, onGround:false
  });
}

// Particles & Drops
function spawnParticles(x,y, tileId, n=6){
  const q=graphicsPreset();if(!gamePrefs.particles||q.particleRate===0)return;
  n=Math.max(1,Math.round(n*q.particleRate));
  for(let i=0;i<n&&particles.length<q.particleCap;i++){
    particles.push({
      x:x+8 + (Math.random()-0.5)*8, y:y+8 + (Math.random()-0.5)*8,
      vx:(Math.random()-0.5)*4, vy:(Math.random()-0.5)*4 -1,
      life: 0.4 + Math.random()*0.3, maxLife:0.6, tileId, size: 2+Math.random()*3
    });
  }
}
function spawnDrop(tileId, x, y){
  const nameMap={ [T.DIRT]:'dirt',[T.GRASS]:'dirt',[T.STONE]:'stone',[T.WOOD]:'wood',[T.LEAVES]:'leaves',[T.SAND]:'sand',[T.SNOW]:'snow',[T.COPPER]:'copper',[T.IRON]:'iron',[T.BRICK]:'brick',[T.GLASS]:'glass',[T.PLATFORM]:'platform',[T.TORCH]:'torch',[T.CHEST]:'chest',[T.MUD]:'mud',[T.JUNGLE_GRASS]:'junglegrass',[T.MUSHROOM_GRASS]:'mycelium',[T.MUSHROOM]:'mushroom',[T.VINE]:'fiber',[T.MOSS_BRICK]:'mossbrick',[T.GLOW_LANTERN]:'glowlantern',[T.AMBER]:'amber',[T.ICE_BRICK]:'icebrick',[T.STONE_BRICK]:'stonebrick',[T.TIMBER]:'timber',[T.AMBER_LAMP]:'amberlamp' };
  if(tileId===T.SUPPLY_CACHE){dropContainerLoot(Containers.breakAt(x,y),x,y);return;}
  if(tileId===T.CHEST&&world[y]?.[x]===T.CHEST)Containers.breakAt(x,y);
  if(tileId===T.AMBER)Achievements.note('amberMined');
  const id=tileId===T.TRUNK?'wood':(extraTileDrops[tileId]||nameMap[tileId]);
  if(!id) return;
  drops.push({id, x:x*TILE+8, y:y*TILE+8, vx:(Math.random()-0.5)*2, vy:-2, life: 12}); // life in seconds floating
}
function dropStack(id,count,x,y,life=45){if(count>0)drops.push({id,count,x,y,vx:(Math.random()-.5)*2,vy:-2,life});}
function dropContainerLoot(loot,x,y){for(const s of loot||[])dropStack(s.id,s.count,x*TILE+8,y*TILE+4);Achievements.note('supplyCaches');}
function magnetDrops(){
  for(const d of drops){
    const dx=(player.x+player.w/2) - d.x;
    const dy=(player.y+player.h/2) - d.y;
    const dist=Math.hypot(dx,dy);
    if(dist<90&&dist>.001){
      const pull=0.35 + (90-dist)*0.012;
      d.vx += (dx/dist)*pull*0.18;
      d.vy += (dy/dist)*pull*0.18;
    }
    if(dist<18){
      const count=d.count||1,left=addToInventory(d.id,count);if(left===count)continue;SFX.play('pickup');
      if(left){d.count=left;continue;}d.collected=true;
      // pickup puff
      spawnParticles(d.x-8,d.y-8, ITEM_TO_TILE[d.id]||T.DIRT, 4);
    }
  }
  drops=drops.filter(d=>!d.collected);
}

// Input mining
let breakProgress=0, breakX=-1, breakY=-1;
function getSelectedToolPower(){
  const sel=player.hotbar[player.selected];
  if(!sel) return 0;
  const it=ITEMS[sel.id];
  if(it && it.tool==='pickaxe') return it.power||1;
  if(it && it.tool==='axe') return .7*(it.power||1);
  return 0.15; // bare hands slow
}
function canMineTile(tileId){
  if(tileId===T.AIR) return false;
  return true;
}
function handleMining(dt){
  // determine target tile: mouse world position + smart cursor
  const worldMouseX = (mouse.x/DPR)/zoom + cam.x;
  const worldMouseY = (mouse.y/DPR)/zoom + cam.y;
  let tx = Math.floor(worldMouseX / TILE);
  let ty = Math.floor(worldMouseY / TILE);

  // smart cursor if shift
  if(keys['shift']){
    // find closest solid in radius
    let best=null, bestDist=Infinity;
    for(let dy=-5;dy<=5;dy++) for(let dx=-5;dx<=5;dx++){
      const nx=Math.floor(player.x/TILE)+dx, ny=Math.floor(player.y/TILE)+dy;
      if(nx<0||nx>=WORLD_W||ny<0||ny>=WORLD_H) continue;
      const t=world[ny][nx];
      if(!SOLID.has(t) && t!==T.TORCH && t!==T.PLATFORM) continue;
      const dist=Math.hypot((nx*TILE+8)-(player.x+player.w/2), (ny*TILE+8)-(player.y+player.h/2));
      if(dist<bestDist && dist< 96){ bestDist=dist; best={x:nx,y:ny}; }
    }
    if(best){ tx=best.x; ty=best.y; }
  }
  mouse.tileX=tx; mouse.tileY=ty;
  mouse.worldX=worldMouseX; mouse.worldY=worldMouseY;

  const furniture=HomeFurniture.at(tx,ty);
  if(mouse.downR&&furniture&&HomeFurniture.isStation(furniture.t)){mouse.downR=false;HomeFurniture.open(furniture.x,furniture.y);return;}
  if(mouse.downL&&furniture){tx=furniture.x;ty=furniture.y;mouse.tileX=tx;mouse.tileY=ty;}
  const container=Containers.at(tx,ty);
  if(mouse.downR&&container){mouse.downR=false;Containers.open(container.x,container.y);return;}
  if(mouse.downL&&container){tx=container.x;ty=container.y;mouse.tileX=tx;mouse.tileY=ty;}
  const activeTool=player.hotbar[player.selected];
  if(mouse.downL&&activeTool&&ITEMS[activeTool.id]?.heal){healFromInventory(activeTool);mouse.downL=false;return;}
  if(mouse.downL&&activeTool&&ITEMS[activeTool.id]?.tool==='sword'){
    player.swing=1;SFX.play('swing');
  }
  // placing
  if(mouse.downR){
    // place selected block
    const sel=player.hotbar[player.selected];
    if(sel){
      const item=ITEMS[sel.id];
      if(item && item.tile!==undefined){
        // range check
        const dist=Math.hypot((tx*TILE+8)-(player.x+player.w/2), (ty*TILE+8)-(player.y+player.h/2));
        if(dist< 96){
          if(tx>=0&&tx<WORLD_W&&ty>=0&&ty<WORLD_H){
            // can't place inside player?
            const px=Math.floor(player.x/TILE), py=Math.floor(player.y/TILE);
            const insidePlayer = (tx===Math.floor((player.x+player.w/2)/TILE) && ty===Math.floor((player.y+player.h/2)/TILE));
            if(world[ty][tx]===T.AIR && !insidePlayer && Containers.canPlace(tx,ty,item.tile)){
              // adjacency: need neighbor solid or platform logic
              let hasSupport=false;
              for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
                const nx=tx+dx, ny=ty+dy;
                if(nx<0||nx>=WORLD_W||ny<0||ny>=WORLD_H) continue;
                if(world[ny][nx]!==T.AIR) hasSupport=true;
              }
              // allow placing if player near enough; relaxed
              if(item.tile===T.TORCH?torchMount(tx,ty)>=0:(hasSupport || item.tile===T.PLATFORM)){
                if(MP.active()){MP.edit('place',tx,ty,sel.id);mouse.downR=false;return;}
                world[ty][tx]=item.tile;Achievements.note('placed');if(item.tile===T.TORCH)Achievements.note('torchesPlaced');
                SFX.play('place',{x:tx*TILE,y:ty*TILE});
                sel.count--;
                if(sel.count<=0) player.hotbar[player.selected]=null;
                updateHotbar(); updateInventoryUI();
                updateLightMap([[tx,ty]]);
                // consume cooldown to prevent spam
                mouse.downR=false; // require click per place? but we want hold
                // re-enable after 120ms
                setTimeout(()=> mouse.downR = mouse.downR, 90);
              }
            }
          }
        }
      }
    }
  }

  if(mouse.downL){
    if(tx<0||tx>=WORLD_W||ty<0||ty>=WORLD_H) return;
    const t=world[ty][tx];
    if(t===T.CHEST&&!Containers.canBreak(tx,ty)){mouse.downL=false;toast('Empty the chest before mining it.');return;}
    if(!canMineTile(t)) { breakProgress=0; breakX=-1; return; }
    // range check for mining
    const dist=Math.hypot((tx*TILE+8)-(player.x+player.w/2), (ty*TILE+8)-(player.y+player.h/2));
    if(dist> 110){ breakProgress=0; return; }

    SFX.play(materialSound(t),{x:tx*TILE,y:ty*TILE});
    if(breakX!==tx || breakY!==ty){ breakProgress=0; breakX=tx; breakY=ty; }
    const toolPower=getSelectedToolPower();
    const base=BREAK_TIME[t]||20;
    const speed = toolPower>0? (1/toolPower) : 6; // pick faster
    breakProgress += dt*60 / (base*speed*0.18 + 4); // normalized
    // also sword swing
    player.swing=Math.min(1, breakProgress*2);
    if(breakProgress>=1){
      if(MP.active()){MP.edit('mine',tx,ty);breakProgress=0;breakX=-1;return;}
      // break it
      SFX.play(materialSound(t),{x:tx*TILE,y:ty*TILE,group:'break',gain:1.1,wait:.09});
      spawnParticles(tx*TILE, ty*TILE, t, 9);
      spawnDrop(t, tx, ty);
      world[ty][tx]=T.AIR;Achievements.note('mined');if(t===T.TRUNK)Achievements.note('wood');if(t===T.COPPER)Achievements.note('copper');if(t===T.IRON)Achievements.note('iron');
      if(t===T.TRUNK){
        const tree=trees.find(v=>v.x===tx&&ty>=v.top&&ty<=v.base);
        if(tree){
          for(let yy=tree.top;yy<ty;yy++)if(world[yy][tx]===T.TRUNK){world[yy][tx]=T.AIR;spawnDrop(T.TRUNK,tx,yy);}
          tree.crown=false;tree.top=ty+1;trees=trees.filter(v=>v.top<=v.base);
        }
      }
      breakProgress=0; breakX=-1;
      updateLightMap(t===T.TRUNK?null:[[tx,ty]]);
      // screen shake small
      cam.shake = gamePrefs.shake?3:0;
    }
  } else {
    // attacking with sword even if not mining?
    if(player.swing>0) player.swing*=0.85;
    if(breakProgress>0) breakProgress*=0.92;
    if(breakProgress<0.01) breakProgress=0;
  }
}

// Physics
function solidAt(x,y){
  const tx=Math.floor(x/TILE), ty=Math.floor(y/TILE);
  if(tx<0||tx>=WORLD_W||ty<0||ty>=WORLD_H) return true; // world bounds solid
  const t=world[ty][tx];
  if(Containers.at(tx,ty))return true;
  if(t===T.AIR) return false;
  if(t===T.PLATFORM){
    // platform: only solid when falling onto top (handled separately)
    return false;
  }
  return SOLID.has(t) || t===T.CHEST;
}
function rectCollides(x,y,w,h){
  // check corners + edges
  const left=Math.floor(x/TILE), right=Math.floor((x+w)/TILE);
  const top=Math.floor(y/TILE), bottom=Math.floor((y+h)/TILE);
  for(let ty=top; ty<=bottom; ty++) for(let tx=left; tx<=right; tx++){
    if(tx<0||tx>=WORLD_W||ty<0||ty>=WORLD_H) continue;
    const t=world[ty][tx];
    if(Containers.at(tx,ty))return {tx,ty,tile:T.CHEST};
    if(t===T.AIR) continue;
    if(t===T.PLATFORM){
      // check if feet are above platform and falling
      const platformTop=ty*TILE;
      const playerBottom=y+h;
      const prevBottom=y+h - player.vy;
      if(player.vy>=0 && prevBottom <= platformTop+2 && playerBottom >= platformTop && x+w>tx*TILE && x<tx*TILE+TILE){
        return {platform:true, tx, ty};
      } else continue;
    }
    if(SOLID.has(t) || t===T.CHEST) return {tx,ty, tile:t};
  }
  return null;
}

let stepDistance=0;
function updatePlayer(dt){
  const previousGround=player.onGround,previousX=player.x,fallSpeed=player.vy;
  // input -> velocity
  let move=0;
  if(keys['a']||keys['arrowleft']) move-=1;
  if(keys['d']||keys['arrowright']) move+=1;
  // joystick
  if(joyL.active) move += joyL.dx;
  move=Math.max(-1, Math.min(1, move));
  if(move!==0) player.dir=Math.sign(move);
  player.vx = move * SPEED;
  // apply joystick vertical? not needed

  // jump
  const wantJump = keys['w']||keys['arrowup']||keys[' ']|| joyL.dy<-0.6;
  if(wantJump && player.onGround){
    player.vy = JUMP;SFX.play('jump');
    player.onGround=false;
  }
  // variable jump height? simple

  player.vy += GRAVITY;
  if(player.vy>MAX_FALL) player.vy=MAX_FALL;

  // horizontal move + collide
  let nextX = player.x + player.vx;
  let col = rectCollides(nextX, player.y, player.w, player.h);
  if(col){
    if(player.vx>0) nextX = col.tx*TILE - player.w - 0.01;
    else if(player.vx<0) nextX = (col.tx+1)*TILE + 0.01;
    player.vx=0;
  }
  player.x=nextX;

  // vertical
  let nextY = player.y + player.vy;
  col = rectCollides(player.x, nextY, player.w, player.h);
  if(col){
    if(player.vy>0){
      const top = col.ty!==undefined? col.ty*TILE : col.ty*TILE;
      nextY = (col.ty)*TILE - player.h - 0.01;
      player.vy=0;
      player.onGround=true;
    } else if(player.vy<0){
      nextY = (col.ty+1)*TILE + 0.01;
      player.vy=0;
    }
  } else {
    player.onGround=false;
    // platform snap tolerance
    if(player.vy>0){
      // check just below feet for platform
      const footY = player.y + player.h + 1;
      const footX = player.x + player.w/2;
      const tx=Math.floor(footX/TILE), ty=Math.floor(footY/TILE);
      if(tx>=0&&tx<WORLD_W&&ty>=0&&ty<WORLD_H && world[ty][tx]===T.PLATFORM){
        if(player.y + player.h <= ty*TILE+4){
          nextY = ty*TILE - player.h;
          player.vy=0; player.onGround=true;
        }
      }
    }
  }
  player.y=nextY;
  if(player.onGround){
    if(!previousGround&&fallSpeed>3)SFX.play('land');
    stepDistance+=Math.abs(player.x-previousX);
    if(stepDistance>24){SFX.play('step');stepDistance=0;}
  }else stepDistance=0;

  // world bounds
  player.x=Math.max(0, Math.min(WORLD_W*TILE - player.w, player.x));
  player.y=Math.max(0, Math.min(WORLD_H*TILE - player.h, player.y));

  // hurt timer
  if(player.hurtTime>0) player.hurtTime-=dt;

  // fall damage? simple
  // auto heal slowly? no

  // swing decay
  if(!mouse.downL) player.swing*=0.9;

  // magnet drops
  magnetDrops();
}

function updateEnemies(dt){
  for(const e of enemies){
    // basic AI: move towards player horizontally, jump if obstacle
    const dx=(player.x - e.x);
    const dist=Math.hypot(dx, player.y - e.y);
    let dir = Math.sign(dx);
    if(Math.abs(dx)< 300) e.dir = dir||e.dir;

    if(e.type==='bat'){updateCaveBat(e,dt);continue;}
    if(e.type==='slime'){
      // slime hops
      e.jumpCooldown-=dt;
      e.vy+=GRAVITY*0.6;
      // horizontal drag
      e.vx *= 0.96;
      if(e.onGround){
        e.vx*=0.82;
        if(e.jumpCooldown<=0 && Math.abs(dx)<260){
          e.vy = (-6.5-Math.random()*1.5)*(e.variant==='jungle'?1.2:1);
          e.vx = e.dir * (1.0 + Math.random()*0.8)*(e.variant==='ice'?1.3:1);
          e.jumpCooldown=(0.9+Math.random()*0.8)*(e.variant==='sand'?.7:1);
          e.onGround=false;
        } else if(Math.random()<0.015){
          e.vy=-4; e.vx=e.dir*0.7; e.onGround=false;
        }
      }
      // move
      let nx=e.x+e.vx, ny=e.y+e.vy;
      let col=rectCollides(nx, e.y, e.w, e.h);
      if(col){ e.vx*=-0.6; nx=e.x; }
      e.x=nx;
      col=rectCollides(e.x, ny, e.w, e.h);
      if(col){
        if(e.vy>0){ ny=col.ty*TILE - e.h; e.vy=0; e.onGround=true; } else { ny=(col.ty+1)*TILE; e.vy=0; }
      } else e.onGround=false;
      e.y=ny;

      // damage player
      if(e.hurt<=0){
        const overlap = !(player.x+player.w < e.x || player.x > e.x+e.w || player.y+player.h < e.y || player.y > e.y+e.h);
        if(overlap && player.hurtTime<=0){
          player.health-=enemyDamage(e.damage||1);SFX.play('hurt');
          player.hurtTime=1.0;
          // knockback
          player.vx = dir * -4;
          player.vy = -4;
          updateHearts();
          if(player.health<=0) respawn();
        }
      } else e.hurt-=dt;

      // player attack hits slime
      if(mouse.downL){
        const sel=player.hotbar[player.selected];
        const isSword = sel && ITEMS[sel.id] && ITEMS[sel.id].tool==='sword';
        const range = isSword? 44 : 34;
        const cx=player.x+player.w/2 + player.dir* (isSword? 18:10);
        const cy=player.y+player.h/2;
        const d=Math.hypot((e.x+e.w/2)-cx, (e.y+e.h/2)-cy);
        if(d<range && player.swing>0.2 && e.hurt<=0){
          e.health-= isSword?(ITEMS[sel.id].damage||7):3;SFX.play('slimeHit',{x:e.x,y:e.y});
          e.hurt=0.35;
          e.vx = player.dir * 3;
          e.vy=-3;
          spawnParticles(e.x, e.y, T.SLIME?0:T.DIRT, 6);
          if(e.health<=0){
            SFX.play('slimeDeath',{x:e.x,y:e.y});Achievements.note('slimes');
            // death puff + coin?
            for(let i=0;i<8;i++) spawnParticles(e.x,e.y,T.LEAVES,1);
            e.dead=true;if(e.variant==='sand'&&Math.random()<.5)drops.push({id:'amber',x:e.x,y:e.y,vx:0,vy:-1,life:25});if(e.variant==='fungal')drops.push({id:'spore',x:e.x,y:e.y,vx:0,vy:-1,life:18});
            // drop gel? as leaves placeholder
            drops.push({id:'gel', x:e.x+e.w/2, y:e.y, vx:(Math.random()-0.5)*2, vy:-2, life:12});
            if(Math.random()<0.25) drops.push({id:'torch', x:e.x+e.w/2+4, y:e.y, vx:0, vy:-1, life:12});
          }
        }
      }
    } else if(e.type==='zombie'){
      e.hurt=Math.max(0,e.hurt-dt);
      // walk towards player
      e.vx = e.dir * (e.variant==='cave'?.85:1.1);
      e.vy+=GRAVITY*0.52;
      // jump over obstacle? if blocked
      let nx=e.x+e.vx, ny=e.y+e.vy;
      let colH=rectCollides(nx, e.y, e.w, e.h);
      if(colH){ // try jump
        if(e.onGround){ e.vy=-5.5; e.onGround=false; }
        else e.vx*=0.5;
      } else e.x=nx;
      let colV=rectCollides(e.x, ny, e.w, e.h);
      if(colV){
        if(e.vy>0){ ny=colV.ty*TILE - e.h; e.vy=0; e.onGround=true; } else { ny=(colV.ty+1)*TILE; e.vy=0;}
      } else e.onGround=false;
      e.y=ny;
      // damage
      const overlap = !(player.x+player.w < e.x || player.x > e.x+e.w || player.y+player.h < e.y || player.y > e.y+e.h);
      if(overlap && player.hurtTime<=0){
        player.health-=enemyDamage(e.damage||2);SFX.play('hurt'); player.hurtTime=1.0; player.vx= e.dir*-5; player.vy=-4; updateHearts(); if(player.health<=0) respawn();
      }
      // hit by sword
      if(mouse.downL){
        const sel=player.hotbar[player.selected];
        const isSword= sel && ITEMS[sel.id]?.tool==='sword';
        const cx=player.x+player.w/2 + player.dir*18, cy=player.y+player.h/2;
        if(Math.hypot(e.x+e.w/2 - cx, e.y+e.h/2 - cy)<44 && player.swing>0.15 && e.hurt<=0){
          e.health-= isSword?(ITEMS[sel.id].damage||7):3;SFX.play('zombieHit',{x:e.x,y:e.y}); e.hurt=0.3; e.vx=player.dir*4; e.vy=-2;
          if(e.health<=0){ SFX.play('zombieDeath',{x:e.x,y:e.y});Achievements.note('zombies');if(e.variant==='cave')Achievements.note('caveZombies');e.dead=true; for(let i=0;i<8;i++) spawnParticles(e.x,e.y,T.DIRT,1); drops.push({id:e.variant==='cave'?'amber':'wood', x:e.x+e.w/2, y:e.y, vx:0, vy:-2, life:12}); }
        }
      }
    }

    // keep in bounds
    e.x=Math.max(0, Math.min(WORLD_W*TILE - e.w, e.x));
  }
  // remove dead
  enemies=enemies.filter(e=>!e.dead);
  // respawn
  if(enemies.length<8 && Math.random()<0.02) spawnSlime();
  if(time>13000 && time<23000 && enemies.length<10 && Math.random()<0.015){
    let x=(Math.random()*WORLD_W|0); if(Math.abs(x - player.x/TILE)>24) spawnZombie(x);
  }
  // update drops physics
  for(const d of drops){
    d.vy+=GRAVITY*0.4;
    d.x+=d.vx; d.y+=d.vy;
    d.vx*=0.98; d.vy*=0.99;
    // ground collide
    const tx=Math.floor(d.x/TILE), ty=Math.floor((d.y+4)/TILE);
    if(ty>=0&&ty<WORLD_H&&tx>=0&&tx<WORLD_W){
      const t=world[ty][tx];
      if(SOLID.has(t) && d.y+4 >= ty*TILE){
        d.y=ty*TILE-4; d.vy*= -0.35; d.vx*=0.75;
        if(Math.abs(d.vy)<0.5) d.vy=0;
      }
    }
    d.life-=dt;
  }
  drops=drops.filter(d=>d.life>0);

  // particles
  for(const p of particles){
    p.x+=p.vx; p.y+=p.vy; p.vy+=0.35; p.life-=dt;
  }
  particles=particles.filter(p=>p.life>0);
}
function respawn(){
  SFX.play('death');
  player.health=player.maxHealth;
  player.x=spawn.x; player.y=spawn.y-20;
  player.vx=0; player.vy=0;
  updateHearts();
  toast('You died - respawned!');
}

// Rendering
function getSkyColor(t){
  // t 0..24000: 0 dawn, 6000 noon, 12000 dusk, 18000 night
  let r,g,b;
  if(t<4500){ // dawn
    const f=t/4500;
    r= 20 + f*100; g= 30+ f*80; b= 80+ f*100;
  } else if(t<12000){
    r=135; g=206; b=235; // noon sky
  } else if(t<14000){
    const f=(t-12000)/2000;
    r=135 - f*60; g=206 - f*80; b=235 - f*80;
  } else if(t<20000){
    r=10; g=15; b=35; // night
  } else {
    const f=(t-20000)/4000;
    r=10+ f*40; g=15+ f*40; b=35+ f*70;
  }
  return `rgb(${r|0},${g|0},${b|0})`;
}
function daylight(){
  if(time<1300)return .65+time/1300*.35;
  if(time<11500)return 1;
  if(time<14000)return 1-(time-11500)/2500*.86;
  if(time<22300)return .14;
  return .14+(time-22300)/1700*.51;
}
const biomeScenes=new Map();
let backgroundBlend=null,lastBiomeFrame=0;
function smooth01(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
function biomeWeights(x){
  const snow=1-smooth01((x-44)/56),desert=smooth01((x-(WORLD_W-116))/56);
  const pocket=(a,b)=>smooth01((x-a)/26)*(1-smooth01((x-b)/26));
  const jungle=generatorVersion>=4?pocket(112,194):0,mushroom=generatorVersion>=4?pocket(324,394):0;
  return {snow,forest:Math.max(0,1-snow-desert-jungle-mushroom),desert,jungle,mushroom};
}
function updateBiomeBlend(){
  const target=biomeWeights((player.x+player.w/2)/TILE),now=performance.now();
  if(!backgroundBlend){backgroundBlend={...target};lastBiomeFrame=now;return backgroundBlend;}
  const dt=Math.min(.08,Math.max(0,(now-lastBiomeFrame)/1000));lastBiomeFrame=now;
  const rate=1-Math.exp(-dt/.6);
  for(const name of ['snow','forest','desert','jungle','mushroom'])backgroundBlend[name]=(backgroundBlend[name]||0)+(target[name]-(backgroundBlend[name]||0))*rate;
  const sum=Object.values(backgroundBlend).reduce((a,b)=>a+b,0);
  for(const name of Object.keys(backgroundBlend))backgroundBlend[name]/=sum;
  return backgroundBlend;
}
function drawBiomeLayers(g,biome,w,h){
  const layers=biome==='snow'?[[35,.07,.88],[36,.12,1],[37,.18,1.06],[39,.25,1.18]]:
    biome==='desert'?[[22,.07,.92],[20,.14,1.02],[21,.22,1.15]]:
    biome==='jungle'?[[7,.06,.88],[50,.11,1.02],[51,.17,1.05],[52,.26,1.18]]:
    biome==='mushroom'?[[7,.06,.88],[46,.11,1.02],[47,.17,1.05],[48,.26,1.18]]:
    [[7,.06,.88],[8,.11,1.02],[9,.17,1.05],[11,.26,1.18]];
  const shift=(spawn.y-cam.y-h/zoom*.52)*zoom*.13;
  for(const [id,speed,bottom] of layers){
    const img=loadedPack['background'+id];if(!img)continue;
    const scale=Math.max(.85,Math.min(1.45,h/650));
    const iw=img.width*scale,ih=img.height*scale,base=h*bottom+shift;
    const offset=-((cam.x*speed*zoom)%iw);
    for(let x=offset-iw;x<w;x+=iw){
      const xx=Math.floor(x),yy=Math.floor(base-ih);g.drawImage(img,xx,yy,Math.ceil(iw)+1,Math.ceil(ih));
      if(base<h)g.drawImage(img,0,img.height-2,img.width,2,xx,Math.floor(base)-1,Math.ceil(iw)+1,h-base+2);
    }
  }
}
function crossfadeBiomeScenes(w,h,sky,sun,moon,isNight,celestialX,celestialY){
  const weights=updateBiomeBlend();
  ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
  // Each scene is opaque and contains a full layer stack. Add weighted scenes to
  // get a real linear crossfade, not several translucent layers washing out the sky.
  ctx.globalCompositeOperation='lighter';
  for(const [biome,weight] of Object.entries(weights)){
    if(weight<.0001)continue;
    let scene=biomeScenes.get(biome);
    if(!scene){scene=document.createElement('canvas');biomeScenes.set(biome,scene);}
    if(scene.width!==Math.ceil(w)||scene.height!==Math.ceil(h)){scene.width=Math.ceil(w);scene.height=Math.ceil(h);}
    const g=scene.getContext('2d');g.imageSmoothingEnabled=false;g.globalCompositeOperation='source-over';g.globalAlpha=1;
    if(sky)g.drawImage(sky,0,0,sky.width,sky.height,0,0,w,h);
    else{g.fillStyle=getSkyColor(time);g.fillRect(0,0,w,h);}
    if(isNight&&moon)g.drawImage(moon,0,((day-1)%8)*50,50,50,celestialX-25,celestialY-25,50,50);
    else if(sun)g.drawImage(sun,celestialX-38,celestialY-38,76,76);
    drawBiomeLayers(g,biome,w,h);ctx.globalAlpha=weight;ctx.drawImage(scene,0,0,w,h);
  }
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
}
function blendedBiomeTile(t,x,y,base,brightness,key){
  const natural=[T.DIRT,T.GRASS,T.SAND,T.SNOW,T.MUD,T.JUNGLE_GRASS,T.MUSHROOM_GRASS];if(!natural.includes(t))return base;
  const neighbor=(xx,yy)=>{
    let other=world[yy]?.[xx];if(other===T.GRASS)other=T.DIRT;
    const own=t===T.GRASS?T.DIRT:t;
    return other!==own&&natural.includes(other)&&([T.SAND,T.SNOW,T.MUD,T.JUNGLE_GRASS,T.MUSHROOM_GRASS].includes(t)||[T.SAND,T.SNOW,T.MUD,T.JUNGLE_GRASS,T.MUSHROOM_GRASS].includes(other))&&loadedPack[other]?other:0;
  };
  const edges=[neighbor(x-1,y),neighbor(x+1,y),neighbor(x,y-1),neighbor(x,y+1)];
  if(!edges.some(Boolean))return base;
  const cacheKey=key+':'+edges.join(',');if(biomeTileCache.has(cacheKey))return biomeTileCache.get(cacheKey);
  const tile=document.createElement('canvas');tile.width=tile.height=16;const g=tile.getContext('2d');g.drawImage(base,0,0);
  edges.forEach((other,edge)=>{
    if(!other)return;
    const layer=document.createElement('canvas');layer.width=layer.height=16;const c=layer.getContext('2d');
    c.drawImage(shadedFrame(other,loadedPack[other],18,18,16,16,brightness),0,0);
    const coords=[[0,0,6,0],[16,0,10,0],[0,0,0,6],[0,16,0,10]][edge];
    const gradient=c.createLinearGradient(...coords);gradient.addColorStop(0,'rgba(0,0,0,.5)');gradient.addColorStop(1,'rgba(0,0,0,0)');
    c.globalCompositeOperation='destination-in';c.fillStyle=gradient;c.fillRect(0,0,16,16);g.drawImage(layer,0,0);
  });
  g.globalCompositeOperation='destination-in';g.drawImage(base,0,0);
  if(biomeTileCache.size>1800)biomeTileCache.clear();biomeTileCache.set(cacheKey,tile);return tile;
}

function drawBackground(){
  const w=canvas.width/DPR,h=canvas.height/DPR,light=daylight();
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;
  const sky=loadedPack.background0;
  if(sky)ctx.drawImage(sky,0,0,sky.width,sky.height,0,0,w,h);
  else{ctx.fillStyle=getSkyColor(time);ctx.fillRect(0,0,w,h);}
  const isNight=time>=14000&&time<22300;
  const progress=isNight?(time-14000)/8300:time<14000?time/14000:(time-24000)/14000;
  const celestialX=w*(.08+Math.max(0,progress)*.84);
  const celestialY=h*.37-Math.sin(Math.max(0,Math.min(1,progress))*Math.PI)*h*.28;
  const sun=loadedPack.sun,moon=loadedPack.moon;
  if(isNight&&moon){const phase=(day-1)%8;ctx.drawImage(moon,0,phase*50,50,50,celestialX-25,celestialY-25,50,50);}
  else if(sun)ctx.drawImage(sun,celestialX-38,celestialY-38,76,76);
  crossfadeBiomeScenes(w,h,sky,sun,moon,isNight,celestialX,celestialY);
  // Texture clouds drift on a different parallax plane, at their original proportions.
  for(let i=0;i<7;i++){
    const cloud=loadedPack['cloud'+(i%5)]||loadedPack.cloud0;
    if(!cloud)continue;
    const drift=performance.now()*.003*(1+i%3);
    const x=((i*239-cam.x*.12+drift)%(w+350)+w+350)%(w+350)-180;
    const y=40+(i%3)*44+Math.sin(i*7)*10;
    ctx.globalAlpha=.75;const scale=.32+(i%3)*.075;ctx.drawImage(cloud,Math.round(x),Math.round(y),cloud.width*scale,cloud.height*scale);
  }
  ctx.globalAlpha=1;
  // A single ambient tint keeps texture colors coherent from dawn to night.
  if(light<1){ctx.fillStyle=`rgba(6,10,35,${(1-light)*.9})`;ctx.fillRect(0,0,w,h);}
  if(light<.65){
    ctx.globalAlpha=(.65-light)/.65;
    for(let i=0;i<65;i++){
      const star=loadedPack['star'+(i%3)];const x=hash2(i,12)*w,y=hash2(i,47)*h*.55;
      const size=2+(i%4)*1.2;
      if(star)ctx.drawImage(star,x,y,size,size);
      
    }
  }
  // The moon is emissive and must not be darkened with the landscape.
  if(isNight&&moon){ctx.globalAlpha=.9;ctx.drawImage(moon,0,((day-1)%8)*50,50,50,celestialX-25,celestialY-25,50,50);}
  ctx.restore();
}

function shadedFrame(key,img,sx,sy,sw,sh,brightness=1){
  const shade=Math.max(0,Math.min(12,Math.round(brightness*12)));
  const k=`${key}:${sx}:${sy}:${sw}:${sh}:${shade}`;
  if(spriteFrameCache.has(k))return spriteFrameCache.get(k);
  const c=document.createElement('canvas');c.width=sw;c.height=sh;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
  if(shade<12){g.globalCompositeOperation='source-atop';g.fillStyle=`rgba(4,7,17,${1-shade/12})`;g.fillRect(0,0,sw,sh);}
  if(spriteFrameCache.size>5000){let n=0;for(const key of spriteFrameCache.keys()){spriteFrameCache.delete(key);if(++n>=512)break;}}spriteFrameCache.set(k,c);return c;
}
const terrainTypes=new Set([T.STONE_SLAB,T.SANDSTONE_BRICK,T.SNOW_BRICK,T.MARBLE,T.GRANITE,T.DIRT,T.GRASS,T.STONE,T.SAND,T.SNOW,T.COPPER,T.IRON,T.BRICK,T.GLASS,T.WOOD,T.MUD,T.JUNGLE_GRASS,T.MUSHROOM_GRASS,T.MOSS_BRICK]);
// Torch-sheet columns are floor/left-wall/right-wall mounts, NOT animation frames.
// The existing underground backdrop supplies background-wall support.
function torchMount(x,y){
  if(x<0||x>=WORLD_W||y<0||y>=WORLD_H)return -1;
  if(SOLID.has(world[y+1]?.[x])||world[y+1]?.[x]===T.PLATFORM)return 0;
  if(SOLID.has(world[y]?.[x-1]))return 1;
  if(SOLID.has(world[y]?.[x+1]))return 2;
  return y>surfaceY[x]+4?0:-1;
}
function drawTorch(x,y){
  const sx=(x*TILE-cam.x)*zoom,sy=(y*TILE-cam.y)*zoom,img=loadedPack[T.TORCH];
  if(img){
    const mount=Math.max(0,torchMount(x,y));
    const nativeSheet=img.width>=66&&img.height>=20;
    const ax=nativeSheet?mount*22:0,sw=nativeSheet?20:Math.min(16,img.width),sh=nativeSheet?20:Math.min(16,img.height);
    const frame=shadedFrame(T.TORCH,img,ax,0,sw,sh,1);
    const dx=Math.round(sx-(nativeSheet?2:0)*zoom),dy=Math.round(sy-(nativeSheet?4:0)*zoom);
    ctx.drawImage(frame,dx,dy,Math.round(sw*zoom),Math.round(sh*zoom));
  }else{const tex=tileCanvases[T.TORCH];if(tex)ctx.drawImage(tex,Math.round(sx),Math.round(sy),Math.round(TILE*zoom),Math.round(TILE*zoom));}
  drawTileOverlay(x,y,sx,sy,TILE*zoom);
}
function terrainAt(x,y){
  if(x<0||x>=WORLD_W||y<0||y>=WORLD_H)return false;
  return terrainTypes.has(world[y][x]);
}
function calculateTileFrame(x,y){
  const u=terrainAt(x,y-1),d=terrainAt(x,y+1),l=terrainAt(x-1,y),r=terrainAt(x+1,y);
  const v=(hash2(x,y)*3)|0;
  if(u&&d&&l&&r)return [1+v,1];
  if(!u&&d&&l&&r)return [1+v,0];
  if(u&&!d&&l&&r)return [1+v,2];
  if(u&&d&&!l&&r)return [0,v];
  if(u&&d&&l&&!r)return [4,v];
  if(!u&&d&&!l&&r)return [v*2,3];
  if(!u&&d&&l&&!r)return [1+v*2,3];
  if(u&&!d&&!l&&r)return [v*2,4];
  if(u&&!d&&l&&!r)return [1+v*2,4];
  if(!l&&!r&&u&&d)return [5,v];
  if(!u&&!d&&l&&r)return [6+v,4];
  if(!u&&d&&!l&&!r)return [6+v,0];
  if(u&&!d&&!l&&!r)return [6+v,3];
  if(!u&&!d&&!l&&r)return [9,v];
  if(!u&&!d&&l&&!r)return [12,v];
  return [6+v,5];
}
const tileFrameMemory=new Uint8Array(WORLD_W*WORLD_H),tileFrameValues=Array.from({length:96},(_,i)=>[i%16,(i/16)|0]);
let tileFrameRevision=-1;
function tileFrame(x,y){
  if(tileFrameRevision!==terrainRevision){tileFrameMemory.fill(255);tileFrameRevision=terrainRevision;}
  const index=y*WORLD_W+x;let value=tileFrameMemory[index];
  if(value===255){const [fx,fy]=calculateTileFrame(x,y);value=fy*16+fx;tileFrameMemory[index]=value;}
  return tileFrameValues[value];
}
function drawTreeCrowns(){
  if(!loadedPack.treetop)return;
  for(const tree of trees){
    if(!tree.crown||world[tree.top]?.[tree.x]!==T.TRUNK)continue;
    const x=(tree.x*TILE+8-cam.x)*zoom,y=(tree.top*TILE-cam.y)*zoom;
    if(x< -100*zoom||x>canvas.width/DPR+100*zoom||y< -100*zoom||y>canvas.height/DPR+100*zoom)continue;
    const crown=shadedFrame('crown',loadedPack.treetop,tree.variant*82,0,80,80,Math.max(.24,daylight()));
    ctx.drawImage(crown,Math.round(x-40*zoom),Math.round(y-50*zoom),80*zoom,80*zoom);
    // Owned side branches attached to a supported, continuous trunk.
    const branch=loadedPack.treebranch;
    if(branch&&tree.base-tree.top>7){
      const b=shadedFrame('branch',branch,0,0,40,40,Math.max(.24,daylight()));
      ctx.drawImage(b,Math.round(x-40*zoom),Math.round(y+35*zoom),40*zoom,40*zoom);
    }
  }
}
// One smoothly interpolated light field, not a dark rectangle baked into each tile.
const worldLightCanvas=document.createElement('canvas');
let worldLightImage=null,lightFieldA=null,lightFieldB=null,lightFieldKey="";
function drawSmoothLighting(){
  if(!world.length)return;
  const left=Math.floor(cam.x/TILE)-4,top=Math.floor(cam.y/TILE)-4;
  const columns=Math.ceil(canvas.width/DPR/zoom/TILE)+9,rows=Math.ceil(canvas.height/DPR/zoom/TILE)+9;
  const size=columns*rows;
  if(worldLightCanvas.width!==columns||worldLightCanvas.height!==rows){
    worldLightCanvas.width=columns;worldLightCanvas.height=rows;
    worldLightImage=new ImageData(columns,rows);lightFieldA=new Float32Array(size);lightFieldB=new Float32Array(size);
  }
  const ambient=Math.max(.28,daylight()),key=[terrainRevision,left,top,columns,rows,ambient].join(":");
  if(key!==lightFieldKey){
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
    const x=left+col,y=top+row,index=row*columns+col;
    if(x<0||x>=WORLD_W||y<0||y>=WORLD_H||y<surfaceY[x]){lightFieldA[index]=0;continue;}
    let light=Math.max((lightMap[y]?.[x]??1)*ambient,torchLight[y]?.[x]??0);
    if(world[y][x]===T.TORCH)light=1;
    const depth=y-surfaceY[x];if(depth>35)light*=Math.max(.65,1-(depth-35)*.003);
    lightFieldA[index]=1-Math.max(.18,Math.min(1,light+.12));
  }
  // Separable 1-2-1 Gaussian. Sub-tile interpolation removes checkerboard/banded AO.
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
    const i=row*columns+col;
    lightFieldB[i]=(lightFieldA[row*columns+Math.max(0,col-1)]+lightFieldA[i]*2+lightFieldA[row*columns+Math.min(columns-1,col+1)])/4;
  }
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
    const i=row*columns+col;
    const shade=(lightFieldB[Math.max(0,row-1)*columns+col]+lightFieldB[i]*2+lightFieldB[Math.min(rows-1,row+1)*columns+col])/4;
    const p=i*4;worldLightImage.data[p]=5;worldLightImage.data[p+1]=8;worldLightImage.data[p+2]=18;worldLightImage.data[p+3]=Math.round(shade*255);
  }
  worldLightCanvas.getContext('2d').putImageData(worldLightImage,0,0);lightFieldKey=key;
  }
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='low';
  ctx.drawImage(worldLightCanvas,(left*TILE-cam.x)*zoom,(top*TILE-cam.y)*zoom,columns*TILE*zoom,rows*TILE*zoom);ctx.restore();
}

// Static native terrain is rasterized once per 16x16-tile chunk, not per frame.
const CaveRenderer=(()=>{
  const cache=new Map(),opaque=new WeakMap(),dynamic=new Set([T.WORKBENCH,T.FURNACE,T.ANVIL,T.CHAIR,T.TABLE,T.AIR,T.LEAVES,T.TRUNK,T.TORCH,T.CHEST,T.SUPPLY_CACHE,T.MUSHROOM,T.VINE,T.GLOW_LANTERN,T.AMBER_LAMP]);
  const N=16,limit=32;let builds=0,hits=0;
  function isStatic(t){return !dynamic.has(t);}
  function clear(){cache.clear();}
  function invalidate(cells){if(!Array.isArray(cells)||!cells.length){clear();return;}for(const [x,y]of cells)for(let yy=Math.max(0,y-1);yy<=Math.min(WORLD_H-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(WORLD_W-1,x+1);xx++)cache.delete((xx/N|0)+','+(yy/N|0));}
  function tile(t,x,y){const img=loadedPack[t];if(img){let [fx,fy]=tileFrame(x,y),ax=fx*18,ay=fy*18;if(t===T.PLATFORM){ax=terrainAt(x-1,y)?0:18;ay=0;}if(img.width<34||img.height<34){ax=ay=0;}else if(ax+16>img.width||ay+16>img.height){ax=ay=18;}let f=shadedFrame(t,img,ax,ay,Math.min(16,img.width),Math.min(16,img.height),1);return blendedBiomeTile(t,x,y,f,1,t+':'+ax+':'+ay+':12');}return tileCanvases[t];}
  function chunk(cx,cy){const key=cx+','+cy;let c=cache.get(key);if(c){hits++;cache.delete(key);cache.set(key,c);return c;}c=document.createElement('canvas');c.width=c.height=N*TILE;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    for(let y=cy*N;y<Math.min(WORLD_H,(cy+1)*N);y++)for(let x=cx*N;x<Math.min(WORLD_W,(cx+1)*N);x++){
      const dx=(x-cx*N)*TILE,dy=(y-cy*N)*TILE,t=world[y][x];
      if(y>surfaceY[x]+4){const id=y<surfaceY[x]+16?2:3,wall=loadedPack['background'+id];if(wall){const f=shadedFrame('wall'+id,wall,x*16%wall.width,y*16%wall.height,16,16,.62);g.drawImage(f,dx,dy,16,16);}else{g.fillStyle='#171b25';g.fillRect(dx,dy,16,16);}}
      if(isStatic(t)){const f=tile(t,x,y);if(f)g.drawImage(f,dx,dy,16,16);}
    }
    cache.set(key,c);builds++;while(cache.size>limit)cache.delete(cache.keys().next().value);return c;
  }
  function draw(){if(!world.length)return false;const vw=canvas.width/DPR/zoom,vh=canvas.height/DPR/zoom;
    const l=Math.max(0,Math.floor(cam.x/(N*TILE))),r=Math.min(Math.ceil(WORLD_W/N)-1,Math.floor((cam.x+vw)/(N*TILE))),top=Math.max(0,Math.floor(cam.y/(N*TILE))),bottom=Math.min(Math.ceil(WORLD_H/N)-1,Math.floor((cam.y+vh)/(N*TILE)));
    for(let cy=top;cy<=bottom;cy++)for(let cx=l;cx<=r;cx++){const c=chunk(cx,cy),dx=Math.round((cx*N*TILE-cam.x)*zoom),dy=Math.round((cy*N*TILE-cam.y)*zoom);ctx.drawImage(c,dx,dy,Math.round(((cx+1)*N*TILE-cam.x)*zoom)-dx,Math.round(((cy+1)*N*TILE-cam.y)*zoom)-dy);}return true;
  }
  function imageOpaque(img){if(!img||img.width%16||img.height%16)return false;if(opaque.has(img))return opaque.get(img);const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const a=g.getImageData(0,0,c.width,c.height).data;let yes=true;for(let i=3;i<a.length;i+=4)if(a[i]!==255){yes=false;break;}opaque.set(img,yes);return yes;}
  function coversSky(){if(!world.length||cam.x<0||cam.y<0||cam.x+canvas.width/DPR/zoom>WORLD_W*TILE||cam.y+canvas.height/DPR/zoom>WORLD_H*TILE)return false;const top=Math.floor(cam.y/TILE),l=Math.max(0,Math.floor(cam.x/TILE)),r=Math.min(WORLD_W-1,Math.ceil((cam.x+canvas.width/DPR/zoom)/TILE));for(let x=l;x<=r;x++)if(top<=surfaceY[x]+4)return false;return (!loadedPack.background2||imageOpaque(loadedPack.background2))&&(!loadedPack.background3||imageOpaque(loadedPack.background3));}
  return {draw,isStatic,clear,invalidate,coversSky,inspect:()=>({chunks:cache.size,builds,hits,maxChunks:limit,bytes:cache.size*N*N*TILE*TILE*4})};
})();
function drawSceneBackground(){if(CaveRenderer.coversSky()){updateBiomeBlend();return;}drawBackground();}

function drawTileOverlay(x,y,sx,sy,sz){
      // crack overlay if breaking this tile
      if(x===breakX && y===breakY && breakProgress>0){
        const cracks = Math.min(3, Math.floor(breakProgress*4));
        ctx.save();
        ctx.strokeStyle='rgba(0,0,0,0.9)';
        ctx.lineWidth= Math.max(1, 1*zoom);
        // draw crack lines
        ctx.beginPath();
        const cx=sx, cy=sy;
        if(cracks>=1){ ctx.moveTo(cx+3*zoom, cy+4*zoom); ctx.lineTo(cx+7*zoom, cy+7*zoom); ctx.lineTo(cx+5*zoom, cy+12*zoom); }
        if(cracks>=2){ ctx.moveTo(cx+12*zoom, cy+3*zoom); ctx.lineTo(cx+9*zoom, cy+9*zoom); ctx.lineTo(cx+11*zoom, cy+14*zoom); }
        if(cracks>=3){ ctx.moveTo(cx+4*zoom, cy+13*zoom); ctx.lineTo(cx+8*zoom, cy+11*zoom); }
        ctx.stroke();
        // dark crack overlay
        ctx.fillStyle=`rgba(0,0,0,${0.15 + breakProgress*0.25})`;
        ctx.fillRect(sx,sy,sz,sz);
        ctx.restore();
      }
      // highlight hovered
      if(x===mouse.tileX && y===mouse.tileY){
        // only if in range
        const dist=Math.hypot((x*TILE+8)-(player.x+player.w/2), (y*TILE+8)-(player.y+player.h/2));
        if(dist<116){
          ctx.save();
          ctx.strokeStyle='rgba(255,255,255,0.9)';
          ctx.lineWidth=1.5*zoom;
          ctx.strokeRect(sx+0.5, sy+0.5, sz-1, sz-1);
          ctx.fillStyle='rgba(255,255,255,0.08)';
          ctx.fillRect(sx,sy,sz,sz);
          ctx.restore();
        }
      }
}
const visibleContainerCells=[],visibleTorchCells=[];
function drawWorld(){
  visibleContainerCells.length=0;visibleTorchCells.length=0;
  const cachedTerrain=CaveRenderer.draw();
  const groundedTreeBases=[],visibleHomeCells=[];
  // compute visible tiles
  const viewW = canvas.width/DPR/zoom;
  const viewH = canvas.height/DPR/zoom;
  const left = Math.floor(cam.x / TILE) -2;
  const right = Math.ceil((cam.x+viewW)/TILE)+2;
  const top = Math.floor(cam.y / TILE) -2;
  const bottom = Math.ceil((cam.y+viewH)/TILE)+2;

  // draw tiles
  for(let y=Math.max(0,top); y<Math.min(WORLD_H,bottom); y++){
    for(let x=Math.max(0,left); x<Math.min(WORLD_W,right); x++){
      const t=world[y][x];
      // Walls also sit behind solid edge pixels, so transparent borders never leak sky underground.
      if(!cachedTerrain&&y>surfaceY[x]+4){
        const wall=loadedPack['background'+(y<surfaceY[x]+16?2:3)];
        const wx=Math.round((x*TILE-cam.x)*zoom),wy=Math.round((y*TILE-cam.y)*zoom);
        if(wall){const f=shadedFrame('wall'+(y<surfaceY[x]+16?2:3),wall,x*16%wall.width,y*16%wall.height,16,16,.62);ctx.drawImage(f,wx,wy,Math.round(((x+1)*TILE-cam.x)*zoom)-wx,Math.round(((y+1)*TILE-cam.y)*zoom)-wy);}
        else{ctx.fillStyle='#171b25';ctx.fillRect(wx,wy,Math.round(((x+1)*TILE-cam.x)*zoom)-wx,Math.round(((y+1)*TILE-cam.y)*zoom)-wy);}
      }
      if(t===T.AIR)continue;
      const sx = (x*TILE - cam.x)*zoom;
      const sy = (y*TILE - cam.y)*zoom;
      const sz = TILE*zoom;
      if(sx+sz< -20 || sy+sz< -20 || sx>canvas.width/DPR+20 || sy>canvas.height/DPR+20) continue;

      if(cachedTerrain&&CaveRenderer.isStatic(t)){if((x===breakX&&y===breakY&&breakProgress>0)||(x===mouse.tileX&&y===mouse.tileY))drawTileOverlay(x,y,sx,sy,sz);continue;}
      const bright=1; // Smooth lighting is applied after all block textures, never per tile.
      if(t===T.LEAVES)continue;
      if(HomeFurniture.isType(t)){visibleHomeCells.push([x,y,t]);continue;}
      if(t===T.TRUNK){
        const img=loadedPack.trunk;
        if(img){
          // Use the same ambient shade as the crown/branches. Crop the sheet's
          // extra vertical pixels instead of overlapping adjacent trunk tiles.
          const frame=shadedFrame('trunk',img,0,((hash2(x,y)*3)|0)*22+2,20,16,Math.max(.24,daylight()));
          const dx=Math.round(sx-2*zoom),dy=Math.round(sy);
          ctx.drawImage(frame,dx,dy,Math.round(sx+18*zoom)-dx,Math.round(((y+1)*TILE-cam.y)*zoom)-dy);
          if(world[y+1]?.[x]!==T.TRUNK&&SOLID.has(world[y+1]?.[x]))groundedTreeBases.push({x,y,frame});
        }else{ctx.drawImage(tileCanvases[T.WOOD],sx,sy,sz,sz);}
      }else if(Containers.isType(t)){
        visibleContainerCells.push(x,y);
      }else if(window.__PERSONAL_PACK&&[T.MUSHROOM,T.VINE,T.GLOW_LANTERN,T.AMBER_LAMP].includes(t)&&loadedPack[t]){
        const img=loadedPack[t],plant=t===T.MUSHROOM||t===T.VINE;
        const sw=plant?16:img.width,sh=plant?(t===T.MUSHROOM?20:16):img.height,k=plant?1:Math.min(1,16/sw);
        const dw=sw*k,dh=sh*k;
        ctx.drawImage(img,0,0,sw,sh,Math.round(sx+(16-dw)*zoom/2),Math.round(sy+(16-dh)*zoom),Math.round(dw*zoom),Math.round(dh*zoom));
      }else if(t===T.TORCH){
        visibleTorchCells.push(x,y);continue;
      }else if(loadedPack[t]){
        const img=loadedPack[t];let [fx,fy]=tileFrame(x,y);
        let ax=fx*18,ay=fy*18,sw=16,sh=16,dw=sz,dh=sz,ox=0,oy=0;
        if(t===T.PLATFORM){ax=terrainAt(x-1,y)?0:18;ay=0;}

        if(ax+sw>img.width||ay+sh>img.height){ax=18;ay=18;sw=16;sh=16;}
        let frame=shadedFrame(t,img,ax,ay,sw,sh,bright);
        if(sw===16&&sh===16)frame=blendedBiomeTile(t,x,y,frame,bright,`${t}:${ax}:${ay}:${Math.round(bright*12)}`);
        const dx=Math.round(sx+ox),dy=Math.round(sy+oy);
        const width=sw===16&&sh===16?Math.round(((x+1)*TILE-cam.x)*zoom)-dx:Math.round(dw);
        const height=sw===16&&sh===16?Math.round(((y+1)*TILE-cam.y)*zoom)-dy:Math.round(dh);
        ctx.drawImage(frame,dx,dy,width,height);
      }else{
        const tex=tileCanvases[t];if(tex)ctx.drawImage(shadedFrame(t,tex,0,0,16,16,bright),Math.round(sx),Math.round(sy),Math.round(((x+1)*TILE-cam.x)*zoom)-Math.round(sx),Math.round(((y+1)*TILE-cam.y)*zoom)-Math.round(sy));
      }
      drawTileOverlay(x,y,sx,sy,sz);
    }
  }
  for(const {x,y,frame}of groundedTreeBases){
    const dx=Math.round((x*TILE-cam.x-2)*zoom),dy=Math.round(((y+1)*TILE-cam.y)*zoom);
    ctx.drawImage(frame,0,12,20,4,dx,dy,Math.round(20*zoom),Math.round(4*zoom));
  }
  HomeFurniture.draw(visibleHomeCells);
  // Torches overhang their tile: finish every cave wall before drawing them.
  for(let i=0;i<visibleTorchCells.length;i+=2)drawTorch(visibleTorchCells[i],visibleTorchCells[i+1]);
  // Furniture foreground pass. In particular, the AIR cell to the right must
  // finish drawing its underground wall before either half of a chest is drawn.
  const hoveredContainer=Containers.at(mouse.tileX,mouse.tileY);
  for(let i=0;i<visibleContainerCells.length;i+=2){
    const x=visibleContainerCells[i],y=visibleContainerCells[i+1],frame=Containers.frame(world[y][x],x,y);
    const dx=Math.round((x*TILE-cam.x)*zoom),dy=Math.round(((y-1)*TILE-cam.y)*zoom),w=Math.round(((x+2)*TILE-cam.x)*zoom)-dx,h=Math.round(((y+1)*TILE-cam.y)*zoom)-dy;
    ctx.drawImage(frame,dx,dy,w,h);
    if(x===breakX&&y===breakY&&breakProgress>0){ctx.save();ctx.fillStyle=`rgba(0,0,0,${.15+breakProgress*.25})`;ctx.fillRect(dx,dy,w,h);ctx.strokeStyle='rgba(0,0,0,.9)';ctx.lineWidth=zoom;ctx.beginPath();ctx.moveTo(dx+w*.25,dy+h*.2);ctx.lineTo(dx+w*.5,dy+h*.5);ctx.lineTo(dx+w*.35,dy+h*.8);ctx.stroke();ctx.restore();}
    if(hoveredContainer?.x===x&&hoveredContainer?.y===y&&Math.hypot(x*TILE+16-player.x,y*TILE-player.y)<116){ctx.save();ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.5*zoom;ctx.strokeRect(dx+.5,dy+.5,w-1,h-1);ctx.restore();}
  }
}

function drawDrops(){
  for(const d of drops){
    const sx=(d.x - cam.x)*zoom;
    const sy=(d.y - cam.y)*zoom;
    const sz=12*zoom;
    // bob
    const bob=Math.sin(performance.now()*0.005 + d.x)*1.2*zoom;
    // item icon: reuse tile texture with shine
    const item = ITEMS[d.id];
    let tile=T.DIRT;
    if(item && item.tile!==undefined) tile=item.tile;
    else tile=T.DIRT;
    ctx.save();
    // shadow
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(sx+sz/2, sy+sz, 6*zoom, 2*zoom,0,0,Math.PI*2); ctx.fill();
    // icon
    if(itemSprite(d.id)){
      const img=itemSprite(d.id);ctx.drawImage(img,sx,sy+bob,sz,sz);
    }else if(loadedPack[tile]){
      const img=loadedPack[tile];
      ctx.drawImage(img,0,0,16,16, sx, sy+bob, sz, sz);
    } else {
      const tex=tileCanvases[tile];
      if(tex) ctx.drawImage(tex, sx, sy+bob, sz, sz);
    }
    // outline
    ctx.strokeStyle='rgba(0,0,0,0.6)'; ctx.lineWidth=1*zoom; ctx.strokeRect(sx, sy+bob, sz, sz);
    // shine
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fillRect(sx+1*zoom, sy+bob+1*zoom, 3*zoom,2*zoom);
    ctx.restore();
  }
}
function drawEnemies(){
  for(const e of enemies){
    const sx=(e.x - cam.x)*zoom;
    const sy=(e.y - cam.y)*zoom;
    const w=e.w*zoom, h=e.h*zoom;
    ctx.save();
    // shadow
    ctx.fillStyle='rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(sx+w/2, sy+h, w*0.5, 3*zoom,0,0,Math.PI*2); ctx.fill();

    if(e.type==='bat'){drawCaveBat(e,sx,sy,w,h);}else if(e.type==='slime'){
      const squish = e.onGround? 0.8 + Math.sin(performance.now()*0.012)*0.05 : 1.1;
      // body
      const img=loadedPack['slime-'+e.variant]||loadedPack['slime'];
      if(img){
        const count=window.__PERSONAL_PACK&&e.variant==='sand'?3:2,fh=img.height/count,frame=Math.floor(performance.now()/180)%count;
        ctx.drawImage(img,0,frame*fh,img.width,fh-2, sx, sy+h-h*squish, w, h*squish);
      } else {
        // procedural slime
        ctx.fillStyle= e.hurt>0?'#ff9a9a':({sand:'#dcaf68',jungle:'#67b84b',fungal:'#8182cf',ice:'#82cee0'}[e.variant]||'#3ddb6a');
        // main blob
        ctx.beginPath();
        const cx=sx+w/2, cy=sy+h/2;
        const rx=w/2, ry=h/2 * squish;
        ctx.ellipse(cx, cy, rx, ry, 0,0,Math.PI*2); ctx.fill();
        // highlight
        ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(cx- rx*0.3, cy- ry*0.3, rx*0.25, ry*0.25, -0.4,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(cx+rx*0.2, cy+ry*0.2, rx*0.12, ry*0.12,0,0,Math.PI*2); ctx.fill();
        // eyes
        ctx.fillStyle='#0a0a1a'; ctx.beginPath(); ctx.arc(cx-rx*0.3, cy-ry*0.15, 2.2*zoom,0,Math.PI*2); ctx.arc(cx+rx*0.3, cy-ry*0.15,2.2*zoom,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(cx-rx*0.3+0.7*zoom, cy-ry*0.15-0.7*zoom,1*zoom,0,Math.PI*2); ctx.arc(cx+rx*0.3+0.7*zoom, cy-ry*0.15-0.7*zoom,1*zoom,0,Math.PI*2); ctx.fill();
        // mouth
        ctx.strokeStyle='rgba(0,0,0,0.7)'; ctx.lineWidth=1*zoom; ctx.beginPath(); ctx.arc(cx, cy+ry*0.18, 2.5*zoom,0,Math.PI); ctx.stroke();
      }
      // health bar
      if(e.health<e.maxHealth){
        ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(sx, sy-6*zoom, w, 3*zoom);
        ctx.fillStyle='#e00'; ctx.fillRect(sx+1, sy-6*zoom+1, (w-2)*(e.health/e.maxHealth), 1*zoom);
      }
    } else if(e.type==='zombie'){
      const zombie=loadedPack['zombie-'+e.variant]||loadedPack.zombie;
      if(zombie){
        const frame=Math.floor(performance.now()/120)%3;
        ctx.save();ctx.translate(sx+w/2,sy+h);ctx.scale(e.vx<0?-1:1,1);
        // Frame padding is not part of the sprite. Anchor its bottom to the
        // collision-box feet, not six pixels below them; retain native aspect ratio.
        const fh=zombie.height/3,sh=fh-2;
        ctx.drawImage(zombie,0,frame*fh,zombie.width,sh,-zombie.width/2*zoom,-sh*zoom,zombie.width*zoom,sh*zoom);ctx.restore();
      }else{
      // zombie body
      const hurtCol = e.hurt>0?'#ff7777':e.variant==='cave'?'#79768e':'#6b8c3a';
      ctx.fillStyle=hurtCol;
      ctx.fillRect(sx+3*zoom, sy+2*zoom, w-6*zoom, h-4*zoom);
      // head
      ctx.fillStyle= e.hurt>0?'#ffb3b3':e.variant==='cave'?'#a49db2':'#8aa86e';
      ctx.fillRect(sx+2*zoom, sy, w-4*zoom, 9*zoom);
      // eyes
      ctx.fillStyle='#ff2a2a'; ctx.fillRect(sx+4*zoom, sy+3*zoom,2*zoom,2*zoom); ctx.fillRect(sx+w-6*zoom, sy+3*zoom,2*zoom,2*zoom);
      // arms swing
      ctx.fillStyle=hurtCol; ctx.fillRect(sx, sy+6*zoom,3*zoom,8*zoom); ctx.fillRect(sx+w-3*zoom, sy+6*zoom,3*zoom,8*zoom);
      }
      if(e.health<e.maxHealth){
        ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(sx, sy-5*zoom, w,3*zoom);
        ctx.fillStyle='#e00'; ctx.fillRect(sx+1, sy-5*zoom+1,(w-2)*(e.health/e.maxHealth),1*zoom);
      }
    }
    ctx.restore();
  }
}

let playerSkinOverride;
function drawPlayer(){
  const sx=(player.x - cam.x)*zoom;
  const sy=(player.y - cam.y)*zoom;
  const w=player.w*zoom, h=player.h*zoom;
  ctx.save();
  // shadow
  ctx.fillStyle='rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(sx+w/2, sy+h+2*zoom, w*0.45, 2.5*zoom,0,0,Math.PI*2); ctx.fill();

  // hurt flash
  if(player.hurtTime>0 && Math.floor(player.hurtTime*20)%2===0){
    ctx.globalAlpha=0.5;
  }
  const realPlayer=(playerSkinOverride===undefined?Accounts.skin():playerSkinOverride)||loadedPack['character'+characterStyle];
  if(realPlayer){
    const moving=player.onGround&&Math.abs(player.vx)>0.1;
    const frame=!player.onGround?5:moving?6+Math.floor(performance.now()/90)%14:0;
    const scale=zoom*0.8;
    ctx.save();ctx.translate(sx+w/2,sy+h);ctx.scale(player.dir,1);
    ctx.drawImage(realPlayer,0,frame*56,40,56,-20*scale,-54*scale,40*scale,56*scale);
    const held=player.hotbar[player.selected];const image=held&&itemSprite(held.id);
    if(image){
      ctx.save();ctx.translate(6*zoom,-15*zoom);ctx.rotate(-.7+player.swing*1.8);
      const k=Math.min(1,24/Math.max(image.width,image.height))*zoom;
      ctx.drawImage(image,-4*zoom,-image.height*k+5*zoom,image.width*k,image.height*k);ctx.restore();
    }
    ctx.restore();ctx.restore();return;
  }
  // body construction: legs, torso, head, arm with tool
  const facing = player.dir>0?1:-1;
  // legs
  ctx.fillStyle='#2b3a6b'; // pants
  const walk = player.onGround && Math.abs(player.vx)>0.1 ? Math.sin(performance.now()*0.015)*3 : 0;
  ctx.fillRect(sx+3*zoom, sy+18*zoom, 5*zoom, 8*zoom);
  ctx.fillRect(sx+6*zoom+ walk*0.2*zoom, sy+18*zoom, 5*zoom, 8*zoom);
  // torso
  ctx.fillStyle='#e6393f'; // shirt
  ctx.fillRect(sx+2*zoom, sy+9*zoom, 10*zoom, 10*zoom);
  // arm
  ctx.fillStyle='#ffdbac';
  const armX = facing>0? sx+10*zoom : sx+2*zoom;
  const swingOff = player.swing* 10*zoom;
  ctx.save();
  ctx.translate(armX+2*zoom, sy+12*zoom);
  ctx.rotate(player.swing*0.9*facing -0.2);
  ctx.fillRect(-2*zoom, -2*zoom, 8*zoom*facing, 4*zoom);
  // tool in hand
  const sel=player.hotbar[player.selected];
  if(sel){
    const it=ITEMS[sel.id];
    if(it){
      if(it.tool==='pickaxe'){
        // pickaxe head
        ctx.fillStyle='#8a8d90';
        const hx= facing>0? 6*zoom: -6*zoom;
        ctx.fillRect(hx-4*zoom, -6*zoom, 8*zoom,3*zoom);
        ctx.fillRect(hx-2*zoom, -8*zoom,4*zoom,6*zoom);
        ctx.fillStyle='#9c6b2e'; ctx.fillRect(0, -1*zoom, 6*zoom*facing,2*zoom);
      } else if(it.tool==='axe'){
        ctx.fillStyle='#c0c0c0';
        const hx=facing>0?6*zoom:-6*zoom;
        ctx.beginPath(); ctx.moveTo(hx, -5*zoom); ctx.lineTo(hx+5*zoom*facing, -2*zoom); ctx.lineTo(hx,2*zoom); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#9c6b2e'; ctx.fillRect(0,-1*zoom,6*zoom*facing,2*zoom);
      } else if(it.tool==='sword'){
        ctx.fillStyle='#d9d9d9';
        const len=14*zoom;
        ctx.fillRect(2*zoom*facing, -1*zoom, len*facing, 2*zoom);
        ctx.fillStyle='#ffd700'; ctx.fillRect(0,-2*zoom,3*zoom*facing,4*zoom);
      } else {
        // block item held
        let tile=it.tile;
        const tex=tileCanvases[tile];
        if(tex){
          ctx.save();
          ctx.scale(facing,1);
          ctx.drawImage(tex, 4*zoom, -4*zoom, 8*zoom,8*zoom);
          ctx.restore();
        }
      }
    }
  }
  ctx.restore();

  // head
  ctx.fillStyle='#ffdbac';
  ctx.fillRect(sx+3*zoom, sy, 8*zoom, 8*zoom);
  // hair
  ctx.fillStyle='#b36b2e';
  ctx.fillRect(sx+2*zoom, sy-1*zoom, 10*zoom,3*zoom);
  ctx.fillRect(sx+2*zoom, sy+2*zoom, 2*zoom,5*zoom);
  ctx.fillRect(sx+10*zoom, sy+2*zoom,2*zoom,5*zoom);
  // face
  ctx.fillStyle='#0a0a0a';
  const eyeOff = facing>0? 2*zoom : -1*zoom;
  ctx.fillRect(sx+5*zoom+eyeOff, sy+4*zoom,1.5*zoom,1.5*zoom);
  ctx.fillRect(sx+8*zoom+eyeOff, sy+4*zoom,1.5*zoom,1.5*zoom);
  // invincible blink already
  ctx.restore();

  // health hurt outline
  if(player.hurtTime>0){
    ctx.save(); ctx.strokeStyle='rgba(255,0,0,0.6)'; ctx.lineWidth=2*zoom; ctx.strokeRect(sx,sy,w,h); ctx.restore();
  }
}

function drawParticles(){
  for(const p of particles){
    const sx=(p.x - cam.x)*zoom;
    const sy=(p.y - cam.y)*zoom;
    const a=p.life/p.maxLife;
    if(p.tileId!==undefined){
      const tex=tileCanvases[p.tileId];
      if(tex){
        ctx.save(); ctx.globalAlpha=a;
        ctx.drawImage(tex, sx, sy, p.size*zoom, p.size*zoom);
        ctx.restore();
      }
    } else {
      ctx.fillStyle=`rgba(0,0,0,${a})`;
      // fallback
    }
  }
}

function drawHUDHighlight(){
  // crosshair / cursor
  const sel=player.hotbar[player.selected];
  const worldMouseX = (mouse.x/DPR)/zoom + cam.x;
  const worldMouseY = (mouse.y/DPR)/zoom + cam.y;
  const tx=Math.floor(worldMouseX/TILE), ty=Math.floor(worldMouseY/TILE);
  // aim line for sword?
  // already tile highlight in world
}

const mapTerrainCanvas=document.createElement('canvas'),mapTerrainContext=mapTerrainCanvas.getContext('2d');
let mapTerrainRevision=-1,mapTerrainTiles=null;
function updateMinimap(){
  if(!world.length||document.getElementById('minimap').hidden)return;
  const mmW=mini.width,mmH=mini.height,scaleX=mmW/WORLD_W,scaleY=mmH/WORLD_H;
  if(mapTerrainRevision!==terrainRevision||mapTerrainCanvas.width!==mmW||mapTerrainCanvas.height!==mmH){
    const first=!mapTerrainTiles||mapTerrainCanvas.width!==mmW||mapTerrainCanvas.height!==mmH;
    if(first){mapTerrainCanvas.width=mmW;mapTerrainCanvas.height=mmH;mapTerrainTiles=new Uint8Array(WORLD_W*WORLD_H);}
    let minX=WORLD_W,minY=WORLD_H,maxX=-1,maxY=-1;
    // A cheap tile comparison avoids thousands of Canvas calls for each isolated edit.
    for(let y=0;y<WORLD_H;y++)for(let x=0;x<WORLD_W;x++){
      const i=y*WORLD_W+x,t=world[y][x];if(mapTerrainTiles[i]!==t){mapTerrainTiles[i]=t;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
    }
    if(first){minX=minY=0;maxX=WORLD_W-1;maxY=WORLD_H-1;}
    if(maxX>=minX){
      const rx=Math.floor(minX*scaleX),ry=Math.floor(minY*scaleY),right=Math.min(mmW,Math.ceil(maxX*scaleX+Math.ceil(scaleX)+1)),bottom=Math.min(mmH,Math.ceil(maxY*scaleY+Math.ceil(scaleY)+1));
      const padX=Math.ceil((Math.ceil(scaleX)+2)/scaleX)+2,padY=Math.ceil((Math.ceil(scaleY)+2)/scaleY)+2;
      const startX=Math.max(0,minX-padX),endX=Math.min(WORLD_W-1,maxX+padX),startY=Math.max(0,minY-padY),endY=Math.min(WORLD_H-1,maxY+padY);
      mapTerrainContext.save();mapTerrainContext.beginPath();mapTerrainContext.rect(rx,ry,right-rx,bottom-ry);mapTerrainContext.clip();
      mapTerrainContext.fillStyle='#2b1d0c';mapTerrainContext.fillRect(rx,ry,right-rx,bottom-ry);
  for(let x=startX;x<=endX;x++){
    const sy=surfaceY[x];
    const h=mmH / WORLD_H;
    // sky air skip
    // column
    for(let y=startY;y<=endY;y++){
      const t=world[y][x];
      if(t===T.AIR) continue;
      let col='#000';
      switch(t){
        case T.DIRT: col='#7a4a24'; break;
        case T.GRASS: col='#3a9a2e'; break;
        case T.STONE: col='#8a8d90'; break;
        case T.WOOD: col='#9c6b2e'; break;
        case T.LEAVES: col='#2d7a1f'; break;
        case T.SAND: col='#d9c08a'; break;
        case T.SNOW: col='#eef4ff'; break;
        case T.MUD: col='#635049';break;case T.JUNGLE_GRASS:col='#43b845';break;case T.MUSHROOM_GRASS:col='#3b99c7';break;case T.MUSHROOM:col='#98e6ff';break;case T.VINE:col='#4c8b46';break;case T.MOSS_BRICK:col='#3e6f57';break;case T.GLOW_LANTERN:col='#beffff';break;case T.AMBER:col='#ecaf4b';break;case T.ICE_BRICK:col='#99cadf';break;case T.STONE_BRICK:col='#7b8495';break;case T.TIMBER:col='#b17e4b';break;case T.AMBER_LAMP:col='#ffe09a';break;case T.SUPPLY_CACHE:col='#d39549';break;
        case T.COPPER: col='#d67a2e'; break;
        case T.IRON: col='#d8d6d0'; break;
        default: col='#5a3c14'; break;
      }
      mapTerrainContext.fillStyle=col;
      mapTerrainContext.fillRect(x*scaleX, y*scaleY, Math.ceil(scaleX)+1, Math.ceil(scaleY)+1);
    }
  }

      mapTerrainContext.restore();
    }
    mapTerrainRevision=terrainRevision;
  }
  mctx.clearRect(0,0,mmW,mmH);mctx.drawImage(mapTerrainCanvas,0,0);
  // player dot
  mctx.fillStyle='#ffec6e';
  mctx.fillRect(player.x/TILE*scaleX, player.y/TILE*scaleY, 3,3);
  // viewport rect
  const viewW = canvas.width/DPR/zoom / TILE * scaleX;
  const viewH = canvas.height/DPR/zoom / TILE * scaleY;
  mctx.strokeStyle='rgba(255,255,255,0.9)';
  mctx.lineWidth=1;
  mctx.strokeRect(cam.x/TILE*scaleX, cam.y/TILE*scaleY, viewW, viewH);
  // enemies
  mctx.fillStyle='#ff3a3a';
  for(const e of enemies){
    mctx.fillRect(e.x/TILE*scaleX, e.y/TILE*scaleY,2,2);
  }
}

// UI helpers
function updateHearts(){
  document.getElementById('lifeLabel').textContent='Life: '+Math.max(0,player.health)+' / '+player.maxHealth;
  const el=document.getElementById('hearts');
  el.innerHTML='';
  for(let i=0;i<player.maxHealth;i++){
    const d=document.createElement('div');
    d.className='heart'+(i>=player.health?' empty':'');
    el.appendChild(d);
  }
}
function updateMana(){
  const el=document.getElementById('mana');
  el.innerHTML='';
  for(let i=0;i<10;i++){
    const s=document.createElement('div'); s.className='star'; s.style.opacity=i<player.mana/2?'1':'0.2'; el.appendChild(s);
  }
}
function updateHotbar(){
  const current=player.hotbar[player.selected];document.getElementById('selectedItemName').textContent=current?(ITEMS[current.id]?.name||current.id):'';
  const hb=document.getElementById('hotbar');
  hb.innerHTML='';
  for(let i=0;i<10;i++){
    const slot=document.createElement('button');slot.type='button';slot.dataset.index=i;slot.setAttribute('aria-label','Hotbar '+((i+1)%10)+(player.hotbar[i]?' - '+(ITEMS[player.hotbar[i].id]?.name||player.hotbar[i].id):' - Empty'));slot.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key))e.stopPropagation();}); slot.className='slot'+(i===player.selected?' active':'');
    slot.innerHTML=`<span class="num">${(i+1)%10}</span>`;
    const it=player.hotbar[i];
    if(it){
      const meta=ITEMS[it.id];
      let tile=meta?.tile;
      let label='';
      if(meta && meta.tool) label = meta.name.split(' ')[0][0]; // P/A/S icon fallback
      const ownedIcon=realItemElement(it.id);
      if(ownedIcon){slot.appendChild(ownedIcon);if(it.count>1){const c=document.createElement('span');c.className='cnt';c.textContent=it.count;slot.appendChild(c);}}
      else if(tile!==undefined){
        const tex=tileCanvases[tile];
        if(tex){
          const img=document.createElement('canvas'); img.width=32; img.height=32;
          const ic=img.getContext('2d'); ic.imageSmoothingEnabled=false; ic.drawImage(tex,0,0,32,32);
          // convert to img element via canvas image
          const elImg=document.createElement('img'); elImg.src=img.toDataURL();
          slot.appendChild(elImg);
        }
        if(it.count>1){ const c=document.createElement('span'); c.className='cnt'; c.textContent=it.count; slot.appendChild(c); }
      } else if(meta && meta.tool){
        const icon=document.createElement('div');
        icon.style.cssText='width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(255,255,255,0.08);border-radius:4px;border:1px solid rgba(255,255,255,0.15)';
        icon.textContent= meta.tool==='pickaxe'?'⛏️': meta.tool==='axe'?'🪓':'🗡️';
        slot.appendChild(icon);
      }
    }
    slot.addEventListener('click', ()=>{ player.selected=i; updateHotbar(); });
    hb.appendChild(slot);
  }
}
// Inventory transactions always preserve counts. World updates pause while this panel is open.
const MAX_STACK=999;
let inventoryCursor=null,cursorOrigin=null,inventoryFocus={bag:'hotbar',index:0},inventoryPointer={x:0,y:0};
let inventoryPress=null,suppressInventoryClick=0,lastInventoryLongPress=0;
const RECIPES=[
  {id:'workbench',need:{wood:10},out:'workbench',count:1},
  {id:'furnace',station:T.WORKBENCH,need:{stone:20,wood:4,torch:3},out:'furnace',count:1},
  {id:'ironbar',station:T.FURNACE,need:{iron:3},out:'ironbar',count:1},
  {id:'copperbar',station:T.FURNACE,need:{copper:3},out:'copperbar',count:1},
  {id:'anvil',station:T.WORKBENCH,need:{ironbar:5},out:'anvil',count:1},
  {id:'chair',station:T.WORKBENCH,need:{wood:4},out:'chair',count:1},
  {id:'table',station:T.WORKBENCH,need:{wood:8},out:'table',count:1},
  {id:'ironaxe',station:T.ANVIL,need:{ironbar:6,wood:3},out:'ironaxe',count:1},
  {id:'forgedsword',station:T.ANVIL,need:{ironbar:3,wood:2},out:'ironsword',count:1},
  {id:'forgedpickaxe',station:T.ANVIL,need:{ironbar:4,wood:3},out:'ironpickaxe',count:1},
  {id:'benchbrick',station:T.WORKBENCH,need:{stone:2},out:'brick',count:4},
  {id:'benchplatform',station:T.WORKBENCH,need:{wood:1},out:'platform',count:4},
  {id:'smeltglass',station:T.FURNACE,need:{sand:2},out:'glass',count:4},
  {id:'coppertorch',station:T.ANVIL,need:{copperbar:1,wood:1,gel:1},out:'torch',count:12},
  {id:'stoneslab',need:{stone:2},out:'stoneslab',count:4},{id:'sandstonebrick',need:{sand:2,stone:1},out:'sandstonebrick',count:4},{id:'snowbrick',need:{snow:2},out:'snowbrick',count:4},{id:'marble',need:{stone:3},out:'marble',count:2},{id:'granite',need:{stone:3,iron:1},out:'granite',count:4},
  {id:'platform',need:{wood:1},out:'platform',count:2},
  {id:'torch',need:{wood:1,gel:1},out:'torch',count:3},
  {id:'brick',need:{stone:2},out:'brick',count:1},
  {id:'glass',need:{sand:2},out:'glass',count:1},
  {id:'chest',need:{wood:8,iron:2},out:'chest',count:1},
  {id:'mossbrick',need:{mud:3,stone:1},out:'mossbrick',count:2},
  {id:'glowlantern',need:{wood:2,mushroom:2,gel:1},out:'glowlantern',count:1},
  {id:'ironsword',need:{iron:8,wood:5},out:'ironsword',count:1},
  {id:'ironpickaxe',need:{iron:10,wood:6},out:'ironpickaxe',count:1},
  {id:'jungleblade',need:{iron:8,fiber:8,spore:3},out:'jungleblade',count:1},
  {id:'healingpotion',need:{mushroom:3,gel:2},out:'healingpotion',count:1},
  {id:'mycelium',need:{mud:3,spore:1},out:'mycelium',count:3},
  {id:'vine',need:{fiber:2},out:'vine',count:1},
  {id:'icebrick',need:{snow:3,stone:1},out:'icebrick',count:4},
  {id:'stonebrick',need:{stone:3},out:'stonebrick',count:4},
  {id:'timber',need:{wood:2},out:'timber',count:4},
  {id:'amberlamp',need:{amber:2,wood:2,gel:1},out:'amberlamp',count:1},
  {id:'amberblade',need:{amber:12,iron:6,wood:8},out:'amberblade',count:1},
  {id:'amberpickaxe',need:{amber:14,iron:8,wood:8},out:'amberpickaxe',count:1},
  {id:'ambertonic',need:{healingpotion:2,amber:1},out:'ambertonic',count:1}
];
function stackLimit(id){return ITEMS[id]?.tool?1:MAX_STACK;}
function cloneStack(s){return s?{...s}:null;}
function bagArray(bag){return bag==='hotbar'?player.hotbar:inventory;}
function inventoryOpen(){return document.getElementById('invOverlay').style.display!=='none';}
function insertStack(arrays,stack,existingOnly=false){
  let remaining=stack.count;
  for(const arr of arrays)for(const slot of arr){
    if(slot&&slot.id===stack.id&&slot.count<stackLimit(stack.id)){
      const n=Math.min(remaining,stackLimit(stack.id)-slot.count);slot.count+=n;remaining-=n;
      if(stack.favorite)slot.favorite=true;if(!remaining)return 0;
    }
  }
  if(!existingOnly)for(const arr of arrays)for(let i=0;i<arr.length;i++)if(!arr[i]){
    const n=Math.min(remaining,stackLimit(stack.id));arr[i]={...stack,count:n};remaining-=n;if(!remaining)return 0;
  }
  return remaining;
}
function inventoryIcon(id,size=32){
  const real=realItemElement(id,size);if(real){real.draggable=false;return real;}
  const meta=ITEMS[id],tile=meta?.tile;
  if(tile!==undefined&&tileCanvases[tile]){
    const c=document.createElement('canvas');c.width=size;c.height=size;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    const img=loadedPack[tile];if(img)g.drawImage(img,18,18,16,16,0,0,size,size);else g.drawImage(tileCanvases[tile],0,0,size,size);return c;
  }
  const el=document.createElement('span');el.className='fallback-item';el.textContent=meta?.tool==='pickaxe'?'⛏':meta?.tool==='axe'?'🪓':meta?.tool==='sword'?'⚔':id==='gel'?'◆':'■';return el;
}
function countItem(id,arrays=[player.hotbar,inventory]){return arrays.flat().reduce((n,s)=>n+(s?.id===id?s.count:0),0);}
function inventoryChanged(sound='select'){
  if(sound)SFX.play(sound);updateHotbar();updateInventoryUI();saveGame();
}
function inspectInventorySlot(bag,index){
  inventoryFocus={bag,index};const s=bagArray(bag)[index],meta=s&&ITEMS[s.id];
  const icon=document.getElementById('itemPreview');icon.replaceChildren();if(s)icon.appendChild(inventoryIcon(s.id,48));
  document.getElementById('itemName').textContent=s?meta?.name||s.id:'Empty slot';
  document.getElementById('itemType').textContent=s?(meta?.tool?'Tool · '+meta.tool:meta?.heal?'Consumable':meta?.tile!==undefined?'Placeable block':'Material'):'Pick up a stack, then choose a destination.';
  document.getElementById('itemDescription').textContent=s?(meta?.description|| (meta?.tool?(meta.damage?`${meta.damage} damage · reusable weapon`:'Reusable mining tool'):meta?.heal?`Restores ${meta.heal} health. Press H to quick-heal.`:s.id==='gel'?'Dropped by slimes. Combine with wood to craft torches.':'Use this item for building or demo crafting.')):'No item is selected.';
  document.getElementById('itemStack').textContent=s?`Stack ${s.count} / ${stackLimit(s.id)}${s.favorite?' · Favorited':''}`:'';
  document.getElementById('favoriteItem').disabled=!s;
  document.getElementById('favoriteItem').textContent=s?.favorite?'★ Unfavorite':'☆ Favorite';
  document.getElementById('splitItem').disabled=!s||s.count<2||!!inventoryCursor;
}
function drawInventoryCursor(){
  const ghost=document.getElementById('inventoryCursor'),readout=document.getElementById('heldItem');
  ghost.replaceChildren();
  if(inventoryCursor&&inventoryOpen()){
    ghost.appendChild(inventoryIcon(inventoryCursor.id,32));const n=document.createElement('span');n.textContent=inventoryCursor.count;ghost.appendChild(n);
    ghost.style.display='flex';ghost.style.left=Math.min(window.innerWidth-52,inventoryPointer.x+14)+'px';ghost.style.top=Math.min(window.innerHeight-52,inventoryPointer.y+14)+'px';
    readout.textContent=`Holding ${ITEMS[inventoryCursor.id]?.name||inventoryCursor.id} ×${inventoryCursor.count} - choose a slot`;
  }else{ghost.style.display='none';readout.textContent='';}
}
function operateInventorySlot(bag,index,right=false,quick=false){
  const arr=bagArray(bag),slot=arr[index];inventoryFocus={bag,index};
  if(quick&&!inventoryCursor){
    if(!slot)return;const left=insertStack([bag==='hotbar'?inventory:player.hotbar],slot);
    if(left===slot.count){toast('No space in the other section');return;}
    if(left)slot.count=left;else arr[index]=null;
  }else if(right){
    if(!inventoryCursor){
      if(!slot)return;const n=Math.ceil(slot.count/2);inventoryCursor={...slot,count:n};cursorOrigin={bag,index};slot.count-=n;if(!slot.count)arr[index]=null;
    }else if(!slot||slot.id===inventoryCursor.id&&slot.count<stackLimit(slot.id)){
      if(!slot)arr[index]={...inventoryCursor,count:1};else{slot.count++;if(inventoryCursor.favorite)slot.favorite=true;}
      if(!--inventoryCursor.count)inventoryCursor=null;
    }else return;
  }else if(!inventoryCursor){
    if(!slot)return;inventoryCursor=slot;arr[index]=null;cursorOrigin={bag,index};
  }else if(!slot){
    const n=Math.min(inventoryCursor.count,stackLimit(inventoryCursor.id));arr[index]={...inventoryCursor,count:n};inventoryCursor.count-=n;if(!inventoryCursor.count)inventoryCursor=null;
  }else if(slot.id===inventoryCursor.id&&slot.count<stackLimit(slot.id)){
    const n=Math.min(inventoryCursor.count,stackLimit(slot.id)-slot.count);slot.count+=n;inventoryCursor.count-=n;if(inventoryCursor.favorite)slot.favorite=true;if(!inventoryCursor.count)inventoryCursor=null;
  }else{arr[index]=inventoryCursor;inventoryCursor=slot;cursorOrigin={bag,index};}
  if(!inventoryCursor)cursorOrigin=null;inventoryChanged();
}
function storeInventoryCursor(){
  if(!inventoryCursor)return true;
  if(cursorOrigin){const arr=bagArray(cursorOrigin.bag),i=cursorOrigin.index,s=arr[i];
    if(!s){const n=Math.min(inventoryCursor.count,stackLimit(inventoryCursor.id));arr[i]={...inventoryCursor,count:n};inventoryCursor.count-=n;}
  }
  if(inventoryCursor.count)inventoryCursor.count=insertStack([player.hotbar,inventory],inventoryCursor);
  if(inventoryCursor.count){toast('Place the held stack before closing');updateHotbar();updateInventoryUI();saveGame();return false;}
  inventoryCursor=null;cursorOrigin=null;return true;
}
function inventoryNumberKey(index){
  if(inventoryCursor){operateInventorySlot('hotbar',index);return;}
  if(!inventoryFocus)return;const arr=bagArray(inventoryFocus.bag),from=inventoryFocus.index;
  if(arr===player.hotbar&&from===index)return;
  [arr[from],player.hotbar[index]]=[player.hotbar[index],arr[from]];inventoryChanged();
}
function toggleFavorite(){
  const s=bagArray(inventoryFocus.bag)[inventoryFocus.index];if(!s)return;s.favorite=!s.favorite;inventoryChanged();
}
function sortInventory(){
  if(inventoryCursor){toast('Place your held item before sorting');return;}
  const next=inventory.map(s=>s?.favorite?cloneStack(s):null);
  const items=inventory.filter(s=>s&&!s.favorite).map(cloneStack).sort((a,b)=>{
    const group=s=>ITEMS[s.id]?.tool?0:ITEMS[s.id]?.tile!==undefined?1:2;
    return group(a)-group(b)||(ITEMS[a.id]?.name||a.id).localeCompare(ITEMS[b.id]?.name||b.id);
  });
  for(const s of items)if(insertStack([next],s)){toast('Not enough room to split legacy oversized stacks');return;}
  inventory=next;inventoryChanged();toast('Backpack sorted · favorites stay in place');
}
function quickStackInventory(){
  if(inventoryCursor){toast('Place your held item first');return;}
  let moved=0;
  for(let i=0;i<inventory.length;i++){
    const s=inventory[i];if(!s||s.favorite||ITEMS[s.id]?.tool)continue;
    const left=insertStack([player.hotbar],s,true);moved+=s.count-left;if(left)s.count=left;else inventory[i]=null;
  }
  inventoryChanged();toast(moved?`Restocked ${moved} items into matching hotbar stacks`:'No matching hotbar stacks need items');
}
function craftPlan(recipe,batches=1,hot=player.hotbar,pack=inventory){
  if(recipe.station&&!HomeFurniture.nearby(recipe.station))return null;
  const arrays=[hot.map(cloneStack),pack.map(cloneStack)];
  for(const [id,count] of Object.entries(recipe.need))if(countItem(id,arrays)<count*batches)return null;
  for(const [id,count] of Object.entries(recipe.need)){
    let n=count*batches;
    for(const arr of arrays)for(let i=0;i<arr.length;i++)if(arr[i]?.id===id&&n){const take=Math.min(n,arr[i].count);arr[i].count-=take;n-=take;if(!arr[i].count)arr[i]=null;}
  }
  if(insertStack(arrays,{id:recipe.out,count:recipe.count*batches}))return null;
  return arrays;
}
function craftRecipe(recipe,requested=1){
  let plan=null,batches=requested;
  while(batches>0&&!(plan=craftPlan(recipe,batches)))batches--;
  if(!plan){toast(recipe.station&&!HomeFurniture.nearby(recipe.station)?'Stand near the '+TILE_NAME[recipe.station]+'.':'Missing materials or no inventory space');return false;}
  [player.hotbar,inventory]=plan;Achievements.note('crafts',batches);Achievements.note('crafted_'+recipe.out,recipe.count*batches);inventoryChanged('craft');toast(`Crafted ${ITEMS[recipe.out].name} ×${recipe.count*batches}`);return true;
}
function updateCraftingUI(){
  const list=document.getElementById('craftList');list.replaceChildren();let available=0,total=0;const station=HomeFurniture.focused();HomeFurniture.craftingStatus();
  const query=document.getElementById('recipeSearch').value.trim().toLowerCase();
  for(const recipe of RECIPES){
    if(station&&recipe.station&&recipe.station!==station)continue;
    if(query&&![ITEMS[recipe.out].name,...Object.keys(recipe.need).map(id=>ITEMS[id].name)].join(' ').toLowerCase().includes(query))continue;
    total++;const can=!!craftPlan(recipe);if(can)available++;
    if(document.getElementById('craftableOnly').checked&&!can)continue;
    const button=document.createElement('button');button.className='recipe'+(can?' craftable':'');button.dataset.recipe=recipe.id;button.disabled=!can;
    button.setAttribute('aria-label',`Craft ${ITEMS[recipe.out].name}`);
    const icon=document.createElement('span');icon.className='recipe-icon';icon.appendChild(inventoryIcon(recipe.out,28));button.appendChild(icon);
    const text=document.createElement('span');text.className='recipe-text';const name=document.createElement('strong');name.textContent=ITEMS[recipe.out].name+' ×'+recipe.count;text.appendChild(name);
    const need=document.createElement('span');need.className='recipe-needs';
    for(const [id,n] of Object.entries(recipe.need)){const owned=countItem(id),line=document.createElement('span');line.className=owned<n?'missing':'';line.textContent=`${ITEMS[id].name} ${owned}/${n}`;need.appendChild(line);}
    if(recipe.station){const line=document.createElement('span');line.className=HomeFurniture.nearby(recipe.station)?'':'missing';line.textContent='Near '+TILE_NAME[recipe.station];need.appendChild(line);}
    text.appendChild(need);button.appendChild(text);button.title=can?'Click to craft. Shift-click for up to 5 batches.':'Needs materials, room for the result, and any listed station nearby.';
    button.addEventListener('click',e=>{GUI.hideTooltip();craftRecipe(recipe,e.shiftKey?5:1);});list.appendChild(button);
  }
  document.getElementById('recipeCount').textContent=`${available} / ${total} available${query?' (filtered)':''}`;
  if(!list.children.length){const empty=document.createElement('p');empty.className='inventory-muted';empty.textContent=query?'No recipes match this search and filter.':'No recipes available. Collect building materials, ore, or gel.';list.appendChild(empty);}
}
function updateInventoryUI(){
  const hot=document.getElementById('invHotbar'),pack=document.getElementById('invMain');if(!hot||!pack)return;
  function render(container,bag){
    container.replaceChildren();const arr=bagArray(bag);
    arr.forEach((s,index)=>{
      const button=document.createElement('button');button.type='button';button.className='invslot'+(bag==='hotbar'&&index===player.selected?' selected':'')+(s?.favorite?' favorite':'');
      button.dataset.bag=bag;button.dataset.index=index;button.setAttribute('aria-label',`${bag==='hotbar'?'Hotbar':'Backpack'} slot ${index+1}${s?' - '+(ITEMS[s.id]?.name||s.id)+' ('+s.count+')':' - Empty'}`);
      const label=document.createElement('span');label.className='slot-index';label.textContent=bag==='hotbar'?String((index+1)%10):String(index+1);button.appendChild(label);
      if(s){button.appendChild(inventoryIcon(s.id,32));if(s.count>1){const count=document.createElement('span');count.className='slot-count';count.textContent=s.count;button.appendChild(count);}if(s.favorite){const star=document.createElement('span');star.className='favorite-star';star.textContent='★';button.appendChild(star);}}
      container.appendChild(button);
    });
  }
  render(hot,'hotbar');render(pack,'pack');
  document.getElementById('inventoryCount').textContent=`${inventory.filter(Boolean).length} / 40 slots used`;
  document.getElementById('sortInventory').disabled=!!inventoryCursor;document.getElementById('quickStackInventory').disabled=!!inventoryCursor;
  updateCraftingUI();inspectInventorySlot(inventoryFocus.bag,inventoryFocus.index);drawInventoryCursor();Containers.render();BuildTools.filter();
}
const inventoryOverlay=document.getElementById('invOverlay');
inventoryOverlay.addEventListener('click',e=>{
  const slot=e.target.closest('.invslot');if(!slot||performance.now()<suppressInventoryClick)return;
  if(e.altKey){inventoryFocus={bag:slot.dataset.bag,index:Number(slot.dataset.index)};toggleFavorite();return;}
  operateInventorySlot(slot.dataset.bag,Number(slot.dataset.index),false,e.shiftKey);
});
inventoryOverlay.addEventListener('contextmenu',e=>{const slot=e.target.closest('.invslot');if(!slot)return;e.preventDefault();if(performance.now()-lastInventoryLongPress<900)return;operateInventorySlot(slot.dataset.bag,Number(slot.dataset.index),true);});
inventoryOverlay.addEventListener('pointerover',e=>{const slot=e.target.closest('.invslot');if(slot)inspectInventorySlot(slot.dataset.bag,Number(slot.dataset.index));});
inventoryOverlay.addEventListener('focusin',e=>{const slot=e.target.closest('.invslot');if(slot)inspectInventorySlot(slot.dataset.bag,Number(slot.dataset.index));});
inventoryOverlay.addEventListener('pointerdown',e=>{
  const slot=e.target.closest('.invslot');if(!slot||e.button!==0)return;
  inventoryPress={x:e.clientX,y:e.clientY,bag:slot.dataset.bag,index:Number(slot.dataset.index),drag:false,id:e.pointerId};
  if(e.pointerType==='touch')inventoryPress.timer=setTimeout(()=>{
    if(!inventoryPress||inventoryPress.drag)return;lastInventoryLongPress=performance.now();operateInventorySlot(inventoryPress.bag,inventoryPress.index,true);inventoryPress.long=true;suppressInventoryClick=performance.now()+700;
  },500);
});
document.addEventListener('pointermove',e=>{
  inventoryPointer={x:e.clientX,y:e.clientY};
  if(inventoryPress&&!inventoryPress.long&&Math.hypot(e.clientX-inventoryPress.x,e.clientY-inventoryPress.y)>8){
    clearTimeout(inventoryPress.timer);
    if(!inventoryPress.drag){
      try{inventoryOverlay.setPointerCapture(e.pointerId);}catch(error){}
      if(!inventoryCursor&&bagArray(inventoryPress.bag)[inventoryPress.index])operateInventorySlot(inventoryPress.bag,inventoryPress.index);
      inventoryPress.drag=true;
    }
  }
  if(inventoryCursor&&inventoryOpen())drawInventoryCursor();
});
document.addEventListener('pointerup',e=>{
  if(!inventoryPress)return;clearTimeout(inventoryPress.timer);
  if(inventoryPress.long)suppressInventoryClick=performance.now()+100;
  if(inventoryPress.drag){const slot=document.elementFromPoint(e.clientX,e.clientY)?.closest('.invslot');if(slot)operateInventorySlot(slot.dataset.bag,Number(slot.dataset.index));suppressInventoryClick=performance.now()+200;}
  inventoryPress=null;
});
document.addEventListener('pointercancel',()=>{if(inventoryPress)clearTimeout(inventoryPress.timer);inventoryPress=null;});
document.getElementById('sortInventory').addEventListener('click',sortInventory);
document.getElementById('quickStackInventory').addEventListener('click',quickStackInventory);
document.getElementById('favoriteItem').addEventListener('click',toggleFavorite);
document.getElementById('splitItem').addEventListener('click',()=>operateInventorySlot(inventoryFocus.bag,inventoryFocus.index,true));
document.getElementById('craftableOnly').addEventListener('change',updateCraftingUI);
document.getElementById('recipeSearch').addEventListener('input',updateCraftingUI);


function toast(msg, dur=1800){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), dur);
}

// Game loop
let last=performance.now();
let gameStarted=false;
let camShake=0;
// Named saves and portable .webrraria files. These are NOT native Terraria .wld files.
// Achievements track actual actions, separately from individual world saves.
const Achievements=(()=>{
  const key='webrraria-achievements-v1';let stored={};try{stored=JSON.parse(gameStorage.getItem(key)||'{}');}catch(e){}
  const stats=Object.assign(Object.create(null),stored.stats&&typeof stored.stats==='object'?stored.stats:{});
  const unlocked=Object.assign(Object.create(null),stored.unlocked&&typeof stored.unlocked==='object'?stored.unlocked:{});
  const definitions=[
    ['first-world','A New Beginning','Create or import your first world.','worlds',1],
    ['three-worlds','World Collector','Keep three worlds in your world list.','worlds',3],
    ['favorite-world','A World Worth Keeping','Favorite a world.','favorite',1],
    ['inventory','Pocket Check','Open your inventory.','inventory',1],
    ['mine-one','Getting Started','Mine a block.','mined',1],
    ['mine-hundred','Digging In','Mine 100 blocks.','mined',100],
    ['mine-five-hundred','Keep Digging','Mine 500 blocks.','mined',500],
    ['place-one','First Brick','Place a block.','placed',1],
    ['place-fifty','Making a Place','Place 50 blocks.','placed',50],
    ['wood','Timber!','Chop a tree trunk.','wood',1],
    ['torch-placed','A Little Light','Place a torch.','torchesPlaced',1],
    ['copper','Copper Find','Mine copper ore.','copper',1],
    ['iron','Iron Find','Mine iron ore.','iron',1],
    ['craft-one','Handmade','Craft something.','crafts',1],
    ['craft-twenty-five','Busy Hands','Craft 25 batches.','crafts',25],
    ['craft-torch','Light Work','Craft torches.','crafted_torch',1],
    ['craft-platform','A Step Up','Craft platforms.','crafted_platform',1],
    ['craft-brick','Solid Choice','Craft bricks.','crafted_brick',1],
    ['craft-glass','Clear View','Craft glass.','crafted_glass',1],
    ['craft-chest','Somewhere to Put It','Craft a chest.','crafted_chest',1],
    ['slime-one','Slime Time','Defeat a slime.','slimes',1],
    ['slime-twenty-five','Sticky Business','Defeat 25 slimes.','slimes',25],
    ['zombie','Not Tonight','Defeat a zombie.','zombies',1],
    ['snow','Cold Feet','Visit the snow biome.','snow',1],
    ['desert','Warm Sand','Visit the desert biome.','desert',1],
    ['biomes','Take a Look Around','Visit forest, snow, and desert.','biomes',3],
    ['cave','Below the Surface','Go 20 tiles below the surface.','depth',20],
    ['deep-cave','Further Down','Go 60 tiles below the surface.','depth',60],
    ['export','A Copy to Keep','Export a world backup.','exports',1],
    ['import','Welcome Back','Import a world file.','imports',1],
    ['jungle','Into the Jungle','Visit the jungle.','jungle',1],
    ['mushroom-biome','Blue Glow','Visit the mushroom biome.','mushroom',1],
    ['all-biomes','Around the World','Visit all five biomes.','allBiomes',5],
    ['bat','Wings in the Dark','Defeat a cave bat.','bats',1],
    ['iron-sword','A Sharper Edge','Craft an iron broadsword.','crafted_ironsword',1],
    ['potion','Feeling Better','Use a healing potion.','healed',1],
    ['amber','A Warm Find','Mine 10 amber ore.','amberMined',10],
    ['supply-cache','Supplies for the Road','Break an underground supply cache.','supplyCaches',1],
    ['amber-blade','Golden Edge','Craft an amber broadsword.','crafted_amberblade',1],
    ['ice-builder','Cool Construction','Craft 20 ice bricks.','crafted_icebrick',20],
    ['play-time','Settling In','Spend 10 minutes playing.','seconds',600]
  ];
  let filter='all',saveTimer=null,visitClock=0,playClock=0,announcing=false;const announcements=[];
  function value(k){const n=Number(stats[k]);return Number.isFinite(n)?Math.max(0,n):0;}
  function flush(){clearTimeout(saveTimer);gameStorage.setItem(key,JSON.stringify({version:1,stats,unlocked}));}
  function persist(){clearTimeout(saveTimer);saveTimer=setTimeout(flush,400);}
  function announceNext(){
    if(announcing||!announcements.length)return;announcing=true;
    const def=announcements.shift(),box=document.getElementById('achievementToast');document.getElementById('achievementToastName').textContent=def[1];box.classList.add('show');
    SFX.play('save',{group:'achievement',gain:.65});
    setTimeout(()=>{box.classList.remove('show');setTimeout(()=>{announcing=false;announceNext();},250);},3200);
  }
  function check(quiet=false){
    let changed=false;
    for(const def of definitions)if(!unlocked[def[0]]&&value(def[3])>=def[4]){unlocked[def[0]]=new Date().toISOString();changed=true;if(!quiet)announcements.push(def);}
    if(changed){flush();announceNext();}
    if(!document.querySelector('[data-view="achievements"]').hidden)render();
  }
  function note(k,n=1){stats[k]=Math.min(1e9,value(k)+n);persist();check();}
  function highest(k,n){if(n<=value(k))return;stats[k]=n;persist();check();}
  function worlds(records,quiet=false){
    stats.worlds=Math.max(value('worlds'),records.length);if(records.some(w=>w.favorite))stats.favorite=1;
    persist();check(quiet);
  }
  function tick(dt){
    playClock+=dt;visitClock+=dt;
    if(playClock>=1){const n=Math.floor(playClock);playClock-=n;note('seconds',n);}
    if(visitClock<.5)return;visitClock=0;
    const x=Math.max(0,Math.min(WORLD_W-1,player.x/TILE)),weights=biomeWeights(x);
    let changed=false;for(const biome of ['forest','snow','desert','jungle','mushroom'])if(weights[biome]>.8&&!value(biome)){stats[biome]=1;changed=true;}
    const allCount=['forest','snow','desert','jungle','mushroom'].filter(k=>value(k)>0).length;if(allCount>value('allBiomes')){stats.allBiomes=allCount;changed=true;}
    const count=['forest','snow','desert'].filter(k=>value(k)>0).length;if(count>value('biomes')){stats.biomes=count;changed=true;}
    const depth=Math.max(0,Math.floor(player.y/TILE-surfaceY[Math.floor(x)]));if(depth>value('depth')){stats.depth=depth;changed=true;}
    if(changed){persist();check();}
  }
  function render(){
    const list=document.getElementById('achievementList');list.replaceChildren();
    const done=definitions.filter(d=>unlocked[d[0]]).length;
    document.getElementById('achievementSummary').textContent=done+' / '+definitions.length+' unlocked';
    for(const b of document.querySelectorAll('[data-achievement-filter]')){const selected=b.dataset.achievementFilter===filter;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);}
    for(const def of definitions){
      const won=!!unlocked[def[0]];if(filter==='unlocked'&&!won||filter==='locked'&&won)continue;
      const current=Math.min(def[4],won?def[4]:value(def[3])),row=document.createElement('article');row.className='milestone achievement-row'+(won?' unlocked':' locked');row.dataset.achievement=def[0];
      const icon=document.createElement('div');icon.className='achievement-icon';icon.textContent=won?'★':'☆';icon.setAttribute('aria-hidden','true');
      const body=document.createElement('div');body.className='achievement-body';const name=document.createElement('h2');name.textContent=def[1];const desc=document.createElement('p');desc.textContent=def[2];
      const progress=document.createElement('div');progress.className='achievement-progress';progress.setAttribute('role','progressbar');progress.setAttribute('aria-label',def[1]);progress.setAttribute('aria-valuenow',String(current));progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax',String(def[4]));const fill=document.createElement('span');fill.style.width=Math.min(100,current/def[4]*100)+'%';progress.append(fill);
      const status=document.createElement('small');status.textContent=won?'Unlocked':def[3]==='seconds'?Math.floor(current/60)+' / 10 minutes':current+' / '+def[4];
      body.append(name,desc,progress,status);row.append(icon,body);list.append(row);
    }
    if(!list.children.length){const p=document.createElement('p');p.className='title-note';p.textContent=filter==='unlocked'?'No achievements unlocked yet.':'All achievements unlocked.';list.append(p);}
  }
  for(const button of document.querySelectorAll('[data-achievement-filter]'))button.addEventListener('click',()=>{filter=button.dataset.achievementFilter;SFX.play('select');render();});
  window.addEventListener('pagehide',flush);
  return {note,highest,worlds,tick,flush,render,inspect:()=>({total:definitions.length,stats:{...stats},unlocked:{...unlocked}})};
})();

// Home furniture uses a bottom-left anchor and reserves its native-sized footprint.
const HomeFurniture=(()=>{
  const specs={
    [T.WORKBENCH]:{w:2,h:1,name:'Work Bench'},[T.FURNACE]:{w:3,h:2,name:'Furnace'},
    [T.ANVIL]:{w:2,h:1,name:'Iron Anvil'},[T.CHAIR]:{w:1,h:2,name:'Wooden Chair'},[T.TABLE]:{w:3,h:2,name:'Wooden Table'}
  },frames=new Map(),stations=[T.WORKBENCH,T.FURNACE,T.ANVIL];let context=null,lastCraftCheck=0,lastCraftSignature='';
  const isType=t=>!!specs[t],isStation=t=>stations.includes(t);
  function at(x,y){for(let dy=0;dy<2;dy++)for(let dx=0;dx<3;dx++){const t=world[y+dy]?.[x-dx],q=specs[t];if(q&&dx<q.w&&dy<q.h)return {x:x-dx,y:y+dy,t};}return null;}
  function canPlace(x,y,t,actors=[player]){
    const q=specs[t];if(!q)return !at(x,y);
    if(x<0||x+q.w>WORLD_W||y-q.h+1<0||y+1>=WORLD_H)return false;
    for(let dx=0;dx<q.w;dx++){
      if(!SOLID.has(world[y+1]?.[x+dx])&&world[y+1]?.[x+dx]!==T.PLATFORM)return false;
      for(let dy=0;dy<q.h;dy++)if(world[y-dy]?.[x+dx]!==T.AIR||at(x+dx,y-dy)||Containers.at(x+dx,y-dy))return false;
    }
    return !actors.filter(Boolean).some(p=>x*TILE<p.x+player.w&&(x+q.w)*TILE>p.x&&(y-q.h+1)*TILE<p.y+player.h&&(y+1)*TILE>p.y);
  }
  function within(x,y,t){const q=specs[t];if(!q)return false;const px=(player.x+player.w/2)/TILE,py=(player.y+player.h/2)/TILE;return Math.hypot(px-Math.max(x,Math.min(x+q.w,px)),py-Math.max(y-q.h+1,Math.min(y+1,py)))<=6;}
  function nearby(t){const q=specs[t];if(!q)return false;const px=Math.floor((player.x+player.w/2)/TILE),py=Math.floor((player.y+player.h/2)/TILE);for(let y=Math.max(0,py-7);y<=Math.min(WORLD_H-1,py+7);y++)for(let x=Math.max(0,px-6-q.w);x<=Math.min(WORLD_W-1,px+6);x++)if(world[y][x]===t&&within(x,y,t))return true;return false;}
  function craftingStatus(){const active=stations.filter(nearby);document.getElementById('craftingTitle').textContent=context?specs[context].name+' Crafting':'Crafting';document.getElementById('allStationRecipes').hidden=!context;document.getElementById('craftingStations').textContent=context&&!active.includes(context)?'Out of reach. Move near a placed '+specs[context].name+'.':active.length?'Nearby: '+active.map(t=>specs[t].name).join(', '):'Hand crafting. Right-click a placed Work Bench, Furnace, or Iron Anvil for more recipes.';}
  function open(x,y){const a=at(x,y);if(!a||!isStation(a.t))return false;if(!within(a.x,a.y,a.t)){toast('Move closer to the '+specs[a.t].name+'.');return false;}if(Containers.busy())return false;Containers.closeView();context=a.t;document.getElementById('recipeSearch').value='';document.getElementById('craftableOnly').checked=false;toggleInventory(true);document.getElementById('craftingSection').scrollIntoView({block:'nearest'});document.getElementById('recipeSearch').focus({preventScroll:true});return true;}
  function clearFocus(){context=null;lastCraftSignature='';}
  function tick(now){if(!inventoryOpen()||now-lastCraftCheck<250)return;lastCraftCheck=now;const signature=stations.map(t=>Number(nearby(t))).join('')+':'+context;if(signature!==lastCraftSignature){lastCraftSignature=signature;updateCraftingUI();}}
  document.getElementById('allStationRecipes').onclick=()=>{clearFocus();updateCraftingUI();};
  // Respond to a quick press, not only a held mouse button between game frames.
  canvas.addEventListener('pointerdown',e=>{if(e.button!==2||!gameStarted||inventoryOpen()||document.getElementById('menu').style.display!=='none')return;const r=canvas.getBoundingClientRect(),x=Math.floor(((e.clientX-r.left)/zoom+cam.x)/TILE),y=Math.floor(((e.clientY-r.top)/zoom+cam.y)/TILE),a=at(x,y);if(!a||!isStation(a.t))return;e.preventDefault();e.stopImmediatePropagation();mouse.downR=mouse.downL=false;open(a.x,a.y);},true);
  function draw(cells){for(const [x,y,t]of cells){const q=specs[t],img=loadedPack[t];if(!img){ctx.save();ctx.font='12px Arial';ctx.fillStyle='#fff';ctx.fillText(q.name,Math.round((x*TILE-cam.x)*zoom),Math.round((y*TILE-cam.y)*zoom));ctx.restore();continue;}let entry=frames.get(t);if(!entry||entry.img!==img){const c=document.createElement('canvas');c.width=q.w*16;c.height=q.h*16;const g=c.getContext('2d');g.imageSmoothingEnabled=false;for(let dy=0;dy<q.h;dy++)for(let dx=0;dx<q.w;dx++)g.drawImage(img,dx*18,dy*18,16,16,dx*16,dy*16,16,16);entry={img,c};frames.set(t,entry);}const sx=Math.round((x*TILE-cam.x)*zoom),sy=Math.round(((y-q.h+1)*TILE-cam.y)*zoom);ctx.drawImage(entry.c,sx,sy,Math.round(q.w*16*zoom),Math.round(q.h*16*zoom));if(breakX===x&&breakY===y&&breakProgress>0){ctx.save();ctx.globalAlpha=breakProgress*.45;ctx.fillStyle='#000';ctx.fillRect(sx,sy,q.w*16*zoom,q.h*16*zoom);ctx.restore();}}}
  return {at,isType,isStation,canPlace,nearby,within,open,focused:()=>context,clearFocus,craftingStatus,tick,draw,specs};
})();

// Containers use a single saved anchor and a two-by-two interactive footprint.
const Containers=(()=>{
  let records=Object.create(null),current=null,pending=null,nextRequest=0,lastGuestRequest=0,batching=false,quickQueue=[];
  const frames=new WeakMap(),section=document.getElementById('chestSection'),grid=document.getElementById('chestSlots');
  const key=(x,y)=>x+','+y,isType=t=>t===T.CHEST||t===T.SUPPLY_CACHE;
  const empty=()=>Array(40).fill(null);
  function at(x,y){if(isType(world[y]?.[x]))return {x,y};if(isType(world[y]?.[x-1]))return {x:x-1,y};if(isType(world[y+1]?.[x]))return {x,y:y+1};if(isType(world[y+1]?.[x-1]))return {x:x-1,y:y+1};return null;}
  function defaultSlots(type,x=0,y=0){const slots=empty();if(type===T.SUPPLY_CACHE){
    const deep=y>(surfaceY[x]||60)+35,r=Math.floor(hash2(x+143,y+97)*1000),bonus=['ironbar','copperbar','wood','stonebrick','healingpotion','ambertonic','ironpickaxe','ironsword'];
    const loot=[{id:'amber',count:(deep?7:4)+r%4},{id:'torch',count:10+r%9},{id:'gel',count:6+r%7},{id:'healingpotion',count:2+r%2},{id:'iron',count:7+r%6}];
    let id=bonus[r%bonus.length];if(!deep&&ITEMS[id].tool)id='copperbar';
    loot.push({id,count:ITEMS[id].tool?1:id==='wood'||id==='stonebrick'?20:ITEMS[id].heal?2:4+r%4});
    if(deep)loot.push({id:bonus[(r+3)%bonus.length],count:1});
    loot.forEach((stack,i)=>slots[i]=stack);
  }return slots;}
  function validStack(s){if(s==null)return null;if(!Object.hasOwn(ITEMS,s.id)||!Number.isSafeInteger(s.count)||s.count<1||s.count>stackLimit(s.id))throw Error('Invalid chest item.');return {id:s.id,count:s.count,...(s.favorite?{favorite:true}:{})};}
  function validate(saved,tiles=world){if(saved===undefined)return [];if(!Array.isArray(saved)||saved.length>2048)throw Error('Invalid chest storage.');const seen=new Set();return saved.map(r=>{if(!r||!Number.isInteger(r.x)||!Number.isInteger(r.y)||r.x<0||r.y<0||r.x>=WORLD_W||r.y>=WORLD_H||!isType(tiles[r.y]?.[r.x])||!Number.isInteger(r.version)||r.version<0||r.version>1e9||!Array.isArray(r.slots)||r.slots.length!==40||seen.has(key(r.x,r.y)))throw Error('Invalid chest storage.');seen.add(key(r.x,r.y));return {x:r.x,y:r.y,version:r.version,slots:r.slots.map(validStack)};});}
  function get(x,y){if(!isType(world[y]?.[x]))return null;const k=key(x,y);return records[k]||(records[k]={x,y,version:0,slots:defaultSlots(world[y][x],x,y)});}
  function seed(x,y){const r=get(x,y);r.slots[0]={id:'torch',count:12};r.slots[1]={id:'wood',count:24};r.slots[2]={id:'iron',count:8};r.slots[3]={id:'healingpotion',count:2};r.slots[4]={id:'workbench',count:1};r.slots[5]={id:'copper',count:9};const extras=['ironbar','copperbar','stonebrick','amber','healingpotion'];const pick=Math.floor(hash2(x+71,y+39)*extras.length);r.slots[6]={id:extras[pick],count:pick===4?2:6+Math.floor(hash2(x+9,y)*5)};}
  function dump(){return Object.values(records).filter(r=>isType(world[r.y]?.[r.x])).map(r=>({...r,slots:r.slots.map(cloneStack)}));}
  function closeView(){current=null;quickQueue=[];section.hidden=true;}
  function reset(saved=[]){closeView();pending=null;lastGuestRequest=0;records=Object.create(null);for(const r of validate(saved))records[key(r.x,r.y)]=r;}
  function nearby(actor,x,y){return actor&&Math.hypot(x*TILE+16-(actor.x+player.w/2),y*TILE-(actor.y+player.h/2))<=128;}
  function publish(message){if(MP.connected())MP.containerSend(message);}
  function sendState(r,open=false){publish({type:'container-state',record:r,open});}
  function render(){section.hidden=!current;if(!current)return;const r=records[key(current.x,current.y)];document.getElementById('chestTitle').textContent=world[current.y]?.[current.x]===T.SUPPLY_CACHE?'Supply Cache':'Chest';document.getElementById('chestHint').textContent=pending?'Moving items…':'Click a chest slot to take its stack · Shift-click an inventory stack to store it';grid.replaceChildren();for(let i=0;i<40;i++){const b=document.createElement('button');b.type='button';b.className='invslot';b.dataset.chestSlot=i;const s=r?.slots[i];b.disabled=!!pending||!r||!s;b.setAttribute('aria-label','Chest slot '+(i+1)+(s?' - '+ITEMS[s.id].name+' ('+s.count+')':' - Empty'));if(s){b.append(inventoryIcon(s.id,32));if(s.count>1){const n=document.createElement('span');n.className='slot-count';n.textContent=s.count;b.append(n);}}grid.append(b);}}
  function open(x,y){if(!nearby(player,x,y)){toast('Move closer to the chest.');return;}if(pending)return;if(inventoryCursor&&!storeInventoryCursor())return;current={x,y};toggleInventory(true);if(MP.active()&&!MP.connected()){closeView();toast('Wait for your friend to connect.');return;}if(MP.guest()){MP.containerSend({type:'container-open',x,y});}else get(x,y);render();SFX.play('open');}
  function result(stack){if(!stack)return;const left=addToInventory(stack.id,stack.count);if(left)dropStack(stack.id,left,player.x,player.y,60);}
  function transact(m,actor){if(!Number.isInteger(m.x)||!Number.isInteger(m.y)||!nearby(actor,m.x,m.y))return {ok:false};const r=get(m.x,m.y);if(!r||r.version!==m.version||!['deposit','take'].includes(m.kind)||!Number.isInteger(m.count)||m.count<1||m.count>999)return {ok:false};let out=null;
    if(m.kind==='deposit'){let stack;try{stack=validStack({id:m.id,count:m.count});}catch{return {ok:false};}const slots=r.slots.map(cloneStack);if(insertStack([slots],stack))return {ok:false};r.slots=slots;}
    else{if(!Number.isInteger(m.slot)||m.slot<0||m.slot>=40)return {ok:false};const s=r.slots[m.slot];if(!s||s.id!==m.id||s.count<m.count)return {ok:false};out={id:s.id,count:m.count,...(s.favorite?{favorite:true}:{})};s.count-=m.count;if(!s.count)r.slots[m.slot]=null;}
    r.version++;return {ok:true,stack:out};
  }
  function request(kind,slot,bag=null){if(!current||pending||inventoryCursor){if(inventoryCursor)toast('Place your held item first.');return;}const r=records[key(current.x,current.y)];if(!r)return;let id,count,source=null;
    if(kind==='deposit'){source=bagArray(bag)[slot];if(!source||source.favorite){if(source?.favorite)toast('Unfavorite this stack before storing it.');return;}id=source.id;const copy=r.slots.map(cloneStack);count=source.count-insertStack([copy],cloneStack(source));}
    else{const s=r.slots[slot];if(!s)return;id=s.id;count=s.count-insertStack([player.hotbar.map(cloneStack),inventory.map(cloneStack)],cloneStack(s));}
    if(!count){toast(kind==='deposit'?'The chest is full.':'Your inventory is full.');return;}
    const m={type:'container-move',n:++nextRequest,kind,x:r.x,y:r.y,version:r.version,id,count,...(kind==='take'?{slot}:{})};
    if(kind==='deposit'){source.count-=count;if(!source.count)bagArray(bag)[slot]=null;}
    if(MP.guest()){pending={...m,started:performance.now()};MP.containerSend(m);}
    else{const reply=transact(m,player);if(reply.ok)result(reply.stack);else if(kind==='deposit')result({id,count});if(reply.ok&&!batching)sendState(r);if(!batching)saveGame();}
    if(!batching){updateHotbar();updateInventoryUI();render();}
  }
  function receive(m,role,actor){if(!m.type.startsWith('container-'))return false;
    if(role==='host'&&m.type==='container-open'){if(Number.isInteger(m.x)&&Number.isInteger(m.y)&&nearby(actor,m.x,m.y)){const r=get(m.x,m.y);if(r)sendState(r,true);}return true;}
    if(role==='host'&&m.type==='container-move'){if(!Number.isInteger(m.n)||m.n<=lastGuestRequest||m.n>1e9)return true;lastGuestRequest=m.n;const reply=transact(m,actor);const r=records[key(m.x,m.y)];if(r)sendState(r);publish({type:'container-result',n:m.n,...reply});if(reply.ok){render();saveGame();}return true;}
    if(role==='guest'&&m.type==='container-state'){let data;try{data=validate([m.record]);}catch{return true;}const r=data[0],old=records[key(r.x,r.y)];if(!old||r.version>=old.version)records[key(r.x,r.y)]=r;render();return true;}
    if(role==='guest'&&m.type==='container-result'){if(!pending||m.n!==pending.n)return true;const old=pending;pending=null;if(m.ok){if(old.kind==='take'){const s=validStack(m.stack);if(!s||s.id!==old.id||s.count!==old.count)throw Error('Invalid chest transfer.');result(s);}}else{if(old.kind==='deposit')result({id:old.id,count:old.count});toast('The chest changed. Try again.');}updateHotbar();updateInventoryUI();render();return true;}
    if(role==='guest'&&m.type==='container-gone'){if(Number.isInteger(m.x)&&Number.isInteger(m.y)){delete records[key(m.x,m.y)];if(current&&current.x===m.x&&current.y===m.y)closeView();}return true;}
    return true;
  }
  function canBreak(x,y){if(world[y]?.[x]===T.SUPPLY_CACHE)return true;return !(records[key(x,y)]?.slots.some(Boolean));}
  function breakAt(x,y){const t=world[y]?.[x],r=records[key(x,y)],loot=t===T.SUPPLY_CACHE?(r?.slots||defaultSlots(t,x,y)).filter(Boolean).map(cloneStack):null;delete records[key(x,y)];if(current?.x===x&&current?.y===y)closeView();publish({type:'container-gone',x,y});return loot;}
  function canPlace(x,y,type,actors=[player]){if(at(x,y)||!HomeFurniture.canPlace(x,y,type,actors))return false;if(!isType(type))return true;if(x+1>=WORLD_W||y<1||y+1>=WORLD_H)return false;for(let dy=-1;dy<=0;dy++)for(let dx=0;dx<2;dx++)if(world[y+dy]?.[x+dx]!==T.AIR||at(x+dx,y+dy)||HomeFurniture.at(x+dx,y+dy))return false;if(!SOLID.has(world[y+1][x])||!SOLID.has(world[y+1][x+1]))return false;return !actors.filter(Boolean).some(p=>x*TILE<p.x+player.w&&(x+2)*TILE>p.x&&(y-1)*TILE<p.y+player.h&&(y+1)*TILE>p.y);}
  function frame(type,x,y){const img=loadedPack[type]||tileCanvases[type];let cache=frames.get(img);if(!cache){cache=new Map();frames.set(img,cache);}const opened=current?.x===x&&current?.y===y,frameY=opened&&img.height>=110?76:0,frameX=type===T.SUPPLY_CACHE&&img.width>=70?36:0,frameKey=frameX+':'+frameY;if(cache.has(frameKey))return cache.get(frameKey);const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.imageSmoothingEnabled=false;if(img.width>=34&&img.height>=34){for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)g.drawImage(img,frameX+dx*18,frameY+dy*18,16,16,dx*16,dy*16,16,16);}else g.drawImage(img,0,4,32,28);cache.set(frameKey,c);return c;}
  function quickDeposit(){if(!current||pending||inventoryCursor)return;const r=records[key(current.x,current.y)];if(!r)return;const matching=new Set(r.slots.filter(Boolean).map(s=>s.id));quickQueue=[];for(const bag of ['hotbar','pack'])bagArray(bag).forEach((stack,index)=>{if(stack&&!stack.favorite&&!ITEMS[stack.id]?.tool&&matching.has(stack.id))quickQueue.push({bag,index,id:stack.id});});if(MP.guest()){toast(quickQueue.length?'Depositing matching stacks…':'No matching stacks to deposit.');return;}batching=true;try{for(const q of quickQueue)if(bagArray(q.bag)[q.index]?.id===q.id)request('deposit',q.index,q.bag);}finally{batching=false;quickQueue=[];}sendState(r);saveGame();updateHotbar();updateInventoryUI();render();}
  document.getElementById('depositMatching').addEventListener('click',quickDeposit);
  function tick(now){if(current&&!pending&&quickQueue.length){const q=quickQueue.shift();if(bagArray(q.bag)[q.index]?.id===q.id)request('deposit',q.index,q.bag);}if(current&&(!isType(world[current.y]?.[current.x])||!nearby(player,current.x,current.y)))closeView();if(pending&&now-pending.started>15000){pending=null;MP.leave(true,'Chest transfer was interrupted. Reconnect to continue.');}}
  const overlay=document.getElementById('invOverlay');overlay.addEventListener('click',e=>{const chest=e.target.closest('[data-chest-slot]');if(chest){e.preventDefault();e.stopImmediatePropagation();request('take',Number(chest.dataset.chestSlot));return;}if(pending){e.preventDefault();e.stopImmediatePropagation();return;}const slot=e.target.closest('.invslot[data-bag]');if(current&&slot&&e.shiftKey){e.preventDefault();e.stopImmediatePropagation();request('deposit',Number(slot.dataset.index),slot.dataset.bag);}},true);
  overlay.addEventListener('pointerdown',e=>{if(e.target.closest('[data-chest-slot]')||pending)e.stopImmediatePropagation();},true);
  overlay.addEventListener('contextmenu',e=>{const slot=e.target.closest('[data-chest-slot]');if(slot||pending){e.preventDefault();e.stopImmediatePropagation();if(slot&&!pending)request('take',Number(slot.dataset.chestSlot));}},true);
  // Open on the press itself: a quick click must not be lost between slow frames.
  canvas.addEventListener('pointerdown',e=>{if(e.button!==2||!gameStarted||inventoryOpen()||document.getElementById('menu').style.display!=='none')return;const rect=canvas.getBoundingClientRect(),x=Math.floor(((e.clientX-rect.left)/zoom+cam.x)/TILE),y=Math.floor(((e.clientY-rect.top)/zoom+cam.y)/TILE),a=at(x,y);if(a&&nearby(player,a.x,a.y)){e.preventDefault();open(a.x,a.y);mouse.downR=false;}},true);
  document.getElementById('closeChest').addEventListener('click',closeView);
  return {at,isType,open,render,closeView,reset,seed,dump,quickDeposit,validate,canBreak,breakAt,canPlace,frame,receive,tick,busy:()=>!!pending,opened:()=>current};
})();

// Per-account guest characters belong to the host's world save, not browser identity.
const GuestProfiles=(()=>{
 let records=Object.create(null);
 const copy=value=>JSON.parse(JSON.stringify(value));
 function character(p){if(!p||![p.x,p.y].every(Number.isFinite)||p.x<0||p.y<0||p.x>=WORLD_W*TILE||p.y>=WORLD_H*TILE)throw Error('Invalid saved character position.');const item=s=>{if(s==null)return null;if(typeof s.id!=='string'||!Object.hasOwn(ITEMS,s.id)||!Number.isSafeInteger(s.count)||s.count<1||s.count>stackLimit(s.id))throw Error('Invalid saved character item.');return {id:s.id,count:s.count,...(s.favorite?{favorite:true}:{})};};if(!Array.isArray(p.hotbar)||p.hotbar.length!==10||!Array.isArray(p.inv)||p.inv.length!==40)throw Error('Invalid saved character inventory.');return {x:p.x,y:p.y,health:Math.max(1,Math.min(10,Number(p.health)||10)),selected:Number.isInteger(p.selected)&&p.selected>=0&&p.selected<10?p.selected:0,hotbar:p.hotbar.map(item),inv:p.inv.map(item),cursor:item(p.cursor),cursorOrigin:p.cursorOrigin&&['hotbar','pack'].includes(p.cursorOrigin.bag)&&Number.isInteger(p.cursorOrigin.index)&&p.cursorOrigin.index>=0&&p.cursorOrigin.index<(p.cursorOrigin.bag==='hotbar'?10:40)?{bag:p.cursorOrigin.bag,index:p.cursorOrigin.index}:null};}
 function validate(value){if(value===undefined)return [];if(!Array.isArray(value)||value.length>64)throw Error('Invalid saved multiplayer characters.');const seen=new Set();return value.map(r=>{if(!r||!/^[A-Za-z0-9_-]{22}$/.test(r.id)||!/^[A-Za-z0-9_]{3,20}$/.test(r.username)||seen.has(r.id))throw Error('Invalid saved multiplayer account.');seen.add(r.id);return {id:r.id,username:r.username,updatedAt:Number.isFinite(r.updatedAt)?r.updatedAt:0,character:character(r.character)};});}
 function reset(value){records=Object.create(null);for(const r of validate(value))records[r.id]=r;}
 function set(identity,p){if(!identity||!/^[A-Za-z0-9_-]{22}$/.test(identity.id))throw Error('The account has not been verified.');if(!records[identity.id]&&Object.keys(records).length>=64)throw Error('This world already has 64 saved multiplayer characters.');records[identity.id]={id:identity.id,username:identity.username,updatedAt:Date.now(),character:character(p)};}
 function get(identity){const data=records[identity.id];if(!data)return null;const p=copy(data.character),x=Math.floor(p.x/TILE),y=Math.floor(p.y/TILE);if(p.x+player.w>WORLD_W*TILE||p.y+player.h>WORLD_H*TILE)return {...p,x:spawn.x,y:spawn.y};for(let yy=y;yy<=Math.floor((p.y+player.h-.001)/TILE);yy++)for(let xx=x;xx<=Math.floor((p.x+player.w-.001)/TILE);xx++)if(SOLID.has(world[yy]?.[xx])||Containers.at(xx,yy))return {...p,x:spawn.x,y:spawn.y};return p;}
 return {validate,character,reset,set,get,dump:()=>Object.values(records).map(copy),has:id=>!!records[id]};
})();

const WorldStore=(()=>{
  const indexKey='webrraria-world-index-v1',prefix='webrraria-world-v1:';
  let records=[],activeId=null,selectedId=null,warningShown=false,lastWriteOk=true;
  const uid=()=>globalThis.crypto?.randomUUID?.()||'w-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
  const copy=v=>JSON.parse(JSON.stringify(v));
  function persistIndex(){return gameStorage.setItem(indexKey,JSON.stringify({version:1,worlds:records}));}
  function warn(ok){if(ok===false&&!warningShown){warningShown=true;toast('Browser storage is unavailable/full. Export your world file to keep it.',6500);}}
  function write(meta,data){
    const record={...meta,updatedAt:new Date().toISOString(),seed:data.worldSeed,size:'Classic Demo',width:WORLD_W,height:WORLD_H};
    const ok=gameStorage.setItem(prefix+record.id,JSON.stringify({meta:record,data}));warn(ok);
    const i=records.findIndex(w=>w.id===record.id);if(i<0)records.push(record);else records[i]=record;const indexed=persistIndex();warn(indexed);lastWriteOk=ok!==false&&indexed!==false;Achievements.worlds(records);return record;
  }
  function validate(data){
    const requiredMods=requireWorldMods(data?.mods);
    if(!data||!Array.isArray(data.world)||data.world.length!==WORLD_H)throw Error('This file has an incompatible world height.');
    for(const row of data.world){if(!Array.isArray(row)||row.length!==WORLD_W||row.some(t=>!Number.isInteger(t)||!Object.hasOwn(TILE_NAME,t)))throw Error('The world has invalid tile data or dimensions.');}
    if(!Array.isArray(data.surfaceY)||data.surfaceY.length!==WORLD_W||data.surfaceY.some(y=>!Number.isInteger(y)||y<1||y>=WORLD_H))throw Error('Invalid world surface.');
    const point=(p,fallback)=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<WORLD_W*TILE&&p.y>=0&&p.y<WORLD_H*TILE?{x:p.x,y:p.y}:fallback;
    const spawn=point(data.spawn,{x:WORLD_W/2*TILE,y:(data.surfaceY[WORLD_W>>1]-3)*TILE});
    function item(s){if(s===null||s===undefined)return null;if(!s||typeof s.id!=='string'||!Object.hasOwn(ITEMS,s.id)||!Number.isSafeInteger(s.count)||s.count<1||s.count>1000000)throw Error('Invalid inventory stack.');return {id:s.id,count:s.count,...(s.favorite?{favorite:true}:{})};}
    const p=data.player||{},position=point(p,spawn);
    const hotbar=Array.from({length:10},(_,i)=>item(p.hotbar?.[i])),inv=Array.from({length:40},(_,i)=>item(p.inv?.[i]));
    const trees=Array.isArray(data.trees)?data.trees.map(t=>{if(!Number.isInteger(t.x)||!Number.isInteger(t.top)||!Number.isInteger(t.base)||t.x<0||t.x>=WORLD_W||t.top<0||t.base>=WORLD_H||t.top>t.base)throw Error('Invalid tree data.');return {x:t.x,top:t.top,base:t.base,variant:Math.abs(Number(t.variant)||0)%3|0,crown:!!t.crown};}):undefined;
    const result={guestProfiles:GuestProfiles.validate(data.guestProfiles),mods:requiredMods,chests:Containers.validate(data.chests,data.world),world:data.world,surfaceY:data.surfaceY,spawn,worldSeed:Number.isFinite(data.worldSeed)?data.worldSeed:1,generatorVersion:Number(data.generatorVersion)||1,time:Number.isFinite(data.time)?Math.max(0,data.time%24000):3800,day:Math.max(1,Math.min(100000,Math.trunc(Number(data.day)||1))),player:{...position,health:Math.max(1,Math.min(10,Number(p.health)||10)),hotbar,inv,selected:Math.max(0,Math.min(9,Math.trunc(Number(p.selected)||0))),cursor:item(p.cursor),cursorOrigin:p.cursorOrigin&&['hotbar','pack'].includes(p.cursorOrigin.bag)&&Number.isInteger(p.cursorOrigin.index)&&p.cursorOrigin.index>=0&&p.cursorOrigin.index<(p.cursorOrigin.bag==='hotbar'?10:40)?{bag:p.cursorOrigin.bag,index:p.cursorOrigin.index}:null}};
    if(trees)result.trees=trees;return result;
  }
  function read(id){const raw=gameStorage.getItem(prefix+id);if(!raw)throw Error('This save is missing. Import a backup file to restore it.');return JSON.parse(raw);}
  function init(){
    try{const stored=JSON.parse(gameStorage.getItem(indexKey)||'null');if(stored?.version===1&&Array.isArray(stored.worlds))records=stored.worlds.filter(w=>w&&typeof w.id==='string'&&typeof w.name==='string').slice(0,100);}catch(e){}
    if(!records.length&&!gameStorage.getItem('webrraria-migrated-v1')){
      try{const old=JSON.parse(gameStorage.getItem('terraria-web-save')||'null');if(old?.world){const data=validate(old),meta={id:uid(),name:'My First World',createdAt:new Date().toISOString(),favorite:false};write(meta,data);}}catch(e){}
      gameStorage.setItem('webrraria-migrated-v1','1');
    }
    selectedId=records.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))[0]?.id||null;Achievements.worlds(records,true);
  }
  function save(data){
    if(!activeId)return;
    const meta=records.find(w=>w.id===activeId);if(!meta)return false;write(meta,data);return lastWriteOk;
  }
  function make(name,seed){
    if(!personalTexturesReady||!modsReady)throw Error('Textures and mods are still loading. Please wait.');
    if(MP.active())throw Error('Leave multiplayer before creating another world.');
    if(gameStarted&&activeId)saveGame();
    const meta={id:uid(),name:(name.trim()||'New World').slice(0,50),createdAt:new Date().toISOString(),favorite:false};
    activeId=meta.id;selectedId=meta.id;
    GuestProfiles.reset();generateWorld(false,seed);write(meta,captureGame());gameStorage.setItem('terraria-web-save',JSON.stringify(captureGame()));
    startGame();closeMenu();toast('Welcome to '+meta.name+'!');return meta.id;
  }
  function play(id){
    if(!personalTexturesReady||!modsReady)throw Error('Textures and mods are still loading. Please wait.');
    if(MP.active())throw Error('Leave multiplayer before switching worlds.');
    if(gameStarted&&activeId)saveGame();const stored=read(id),data=validate(stored.data);
    if(!loadGame(data))throw Error('Could not load this world.');
    activeId=selectedId=id;const i=records.findIndex(w=>w.id===id);records[i].lastPlayed=new Date().toISOString();persistIndex();
    gameStorage.setItem('terraria-web-save',JSON.stringify(data));startGame();closeMenu();toast(records[i].name);
  }
  function exportText(id){if(id===activeId&&gameStarted)saveGame();const stored=read(id);Achievements.note('exports');return JSON.stringify({format:'WebrrariaWorld',version:1,exportedAt:new Date().toISOString(),meta:{...stored.meta},data:stored.data});}
  function importText(text,fileName){
    if(text.length>8*1024*1024)throw Error('World file exceeds the 8 MB limit.');
    let input;try{input=JSON.parse(text);}catch(e){throw Error('This is not a valid Webrraria world file.');}
    if(input.format&&input.format!=='WebrrariaWorld')throw Error('Unsupported save format. Native Terraria .wld files are not supported.');
    if(input.format&&input.version!==1)throw Error('This world file uses a newer unsupported version.');
    const data=validate(input.format?input.data:input),name=String(input.meta?.name||fileName.replace(/\.(webrraria|json)$/i,'')||'Imported World').slice(0,50);
    const meta={id:uid(),name:records.some(w=>w.name===name)?(name.slice(0,39)+' (imported)'):name,createdAt:new Date().toISOString(),favorite:false};write(meta,data);selectedId=meta.id;Achievements.note('imports');return meta;
  }
  function remove(id){if(id===activeId&&gameStarted)throw Error('Save & Exit this world before deleting it.');gameStorage.removeItem(prefix+id);records=records.filter(w=>w.id!==id);persistIndex();if(selectedId===id)selectedId=records[0]?.id||null;}
  function favorite(id){const r=records.find(w=>w.id===id);if(r){r.favorite=!r.favorite;const saved=read(id);write(r,saved.data);}}
  async function exit(){Mods.stop();BuildTools.cancel();if(MP.active())await MP.leaveSafely(false);if(gameStarted&&activeId)saveGame();gameStarted=false;activeId=null;Menu.show('home');}
  function rename(id,name){const r=records.find(w=>w.id===id);if(!r)return;r.name=(name.trim()||r.name).slice(0,50);write(r,read(id).data);}
  init();return {list:()=>records.map(w=>({...w})),validate,save,make,play,read,exportText,importText,remove,favorite,exit,rename,selected:()=>selectedId,active:()=>activeId,select(id){selectedId=id;},inspect:()=>({activeId,selectedId,count:records.length,persistent:gameStorage.persistent})};
})();

const newsFeed=document.getElementById('newsFeed');newsFeed.append(...[...newsFeed.querySelectorAll('article')].sort((a,b)=>(b.querySelector('time')?.dateTime||'').localeCompare(a.querySelector('time')?.dateTime||'')));

// A new splash is chosen per visit. Click it to cycle; the supplied logo stays untouched.
const titleSplashes=[
  'Also try Terraria!',
  'Also try Eaglercraft!',
  'Don’t forget to save!',
  'Still in beta!',
  'Dig a little deeper.',
  'One more block.',
  'Mind the slimes.',
  'Bring a torch.',
  'Watch your step!',
  'Wood is useful.',
  'Back up your worlds.',
  'Just one more cave.',
  'It’s getting dark.',
  'Check your pockets.',
  'Build a little house.',
  'What’s under that rock?',
  'The slimes live here too.',
  'Take the long way home.',
  'A roof might help.',
  'There’s dirt in here.',
  'Pickaxe first, questions later.',
  'No rush.',
  'Hello, world!',
  'That was probably a slime.',
  'Leave room for a door.',
  'Found anything good?',
  'This cave looked smaller outside.',
  'A little more stone.',
  'Try another seed.'
];
let titleSplashIndex=Math.floor(Math.random()*titleSplashes.length);
const titleSplash=document.getElementById('titleSplash');
function updateTitleSplash(){titleSplash.textContent=titleSplashes[titleSplashIndex];titleSplash.setAttribute('aria-label',titleSplashes[titleSplashIndex]+' Click for another splash.');}
updateTitleSplash();
titleSplash.addEventListener('click',()=>{titleSplashIndex=(titleSplashIndex+1)%titleSplashes.length;updateTitleSplash();SFX.play('select');});

const Menu=(()=>{
  let view='home',pendingId=null,exportData='',exportName='World';
  const root=document.getElementById('menu');
  function show(next){
    MP.closeChat();
    if(next==='home'&&gameStarted)next='pause';
    document.body.classList.toggle('in-game-menu',gameStarted);
    document.getElementById('guiTooltip').style.display='none';
    view=next;root.style.display='flex';document.body.classList.add('menu-open');
    for(const el of root.querySelectorAll('[data-view]'))el.hidden=el.dataset.view!==next;
    root.scrollTop=0;document.getElementById('contBtn').hidden=!gameStarted;document.getElementById('saveExitBtn').hidden=!gameStarted;document.getElementById('exitBtn').hidden=gameStarted;
    root.classList.toggle('subpage',next!=='home');
    if(next==='worlds')renderWorlds();
    if(next==='multiplayer'||next==='pause')MP.syncUI();
    if(next==='settings'){const v=Math.round(SFX.inspect().volume*100);document.getElementById('settingsSfxVolume').value=v;document.getElementById('soundVolumeValue').textContent=v+'%';}
    if(next==='create'){setTimeout(()=>{const e=document.getElementById('worldName');e.focus();e.select();},0);}
    if(next==='news')document.getElementById('newsFeed').scrollTop=0;
    if(next==='achievements')Achievements.render();
    if(next==='mods')Mods.render();
    if(next==='account')Accounts.render();
    if(next==='admin')AdminTools.render(true);
    MenuMusic.sync();requestAnimationFrame(resize);
  }
  function hide(){root.style.display='none';document.body.classList.remove('menu-open','in-game-menu');MenuMusic.sync();for(const k of Object.keys(keys))keys[k]=false;mouse.downL=mouse.downR=false;requestAnimationFrame(resize);}
  function back(){if(view==='home'||view==='pause'){if(gameStarted)closeMenu();}else if(['create','delete','rename','export'].includes(view))show('worlds');else show('home');}
  function action(label,fn,cls='blue-button'){const b=document.createElement('button');b.className=cls;b.textContent=label;b.addEventListener('click',()=>{try{SFX.play('select');fn();}catch(e){toast(e.message,5000);}});return b;}
  function renderWorlds(){
    const list=document.getElementById('worldList'),q=document.getElementById('worldSearch').value.trim().toLowerCase();list.replaceChildren();
    const worlds=WorldStore.list().filter(w=>w.name.toLowerCase().includes(q)).sort((a,b)=>Number(b.favorite)-Number(a.favorite)||String(b.lastPlayed||b.updatedAt).localeCompare(String(a.lastPlayed||a.updatedAt)));
    document.getElementById('storageNote').textContent=gameStorage.persistent?'Browser saves are local to this browser. Export a file for a portable backup.':'This embedded preview uses session-only saves. Export world files before closing it.';
    if(!worlds.length){const p=document.createElement('p');p.className='empty-worlds';p.textContent=q?'No matching worlds.':'Your next adventure starts here.\nCreate a world or import a save file.';list.append(p);}
    for(const w of worlds){
      const row=document.createElement('article');row.className='world-row'+(WorldStore.selected()===w.id?' selected':'');row.dataset.worldId=w.id;
      const info=document.createElement('div'),name=document.createElement('div'),details=document.createElement('div'),tools=document.createElement('div');name.className='world-name';name.textContent=w.name;details.className='world-details';
      const date=new Date(w.updatedAt||w.createdAt);details.textContent='Classic · 520 × 200 · Seed '+w.seed+(Number.isNaN(date.getTime())?'':' · '+date.toLocaleDateString());tools.className='world-tools';
      tools.append(action(w.favorite?'★ Favorite':'☆ Favorite',()=>{WorldStore.favorite(w.id);renderWorlds();}),action('Rename',()=>{pendingId=w.id;document.getElementById('renameWorldName').value=w.name;show('rename');}),action('Export',()=>{exportData=WorldStore.exportText(w.id);exportName=w.name;document.getElementById('exportWorldText').value=exportData;document.getElementById('exportWorldName').textContent=w.name;show('export');}),action('Delete',()=>{if(WorldStore.active()===w.id&&gameStarted)throw Error('Save & Exit this world before deleting it.');pendingId=w.id;document.getElementById('deleteWorldName').textContent=w.name;show('delete');}));
      info.append(name,details,tools);row.append(info,action(WorldStore.active()===w.id&&gameStarted?'Resume':'Play',()=>WorldStore.play(w.id),'blue-button world-play'));list.append(row);
    }
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b){SFX.play('select');if(b.dataset.go==='exit'&&gameStarted)WorldStore.exit();show(b.dataset.go);}});
  root.addEventListener('pointerover',e=>{if(e.target.matches('.title-option'))SFX.play('select',{group:'menu-hover',wait:90,gain:.45});});
  document.getElementById('playBtn').addEventListener('click',()=>show('worlds'));
  document.getElementById('contBtn').addEventListener('click',()=>closeMenu());
  document.getElementById('saveExitBtn').addEventListener('click',()=>WorldStore.exit());
  document.getElementById('newBtn').addEventListener('click',()=>show('create'));
  document.getElementById('worldSearch').addEventListener('input',renderWorlds);
  function createWorldFromMenu(e){
    e.preventDefault();const s=document.getElementById('worldSeed').value.trim();let seed=null;
    if(s){if(/^\d+$/.test(s))seed=Number(s)>>>0;else{seed=2166136261;for(const c of s)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;}}
    try{WorldStore.make(document.getElementById('worldName').value,seed);}catch(err){toast(err.message,5000);}
  }
  document.getElementById('createWorldBtn').addEventListener('click',createWorldFromMenu);
  document.getElementById('createWorldForm').addEventListener('submit',createWorldFromMenu);
  document.getElementById('createWorldForm').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing)createWorldFromMenu(e);});
  document.getElementById('importWorldBtn').addEventListener('click',()=>document.getElementById('worldFileInput').click());
  document.getElementById('worldFileInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>8*1024*1024)throw Error('World file exceeds the 8 MB limit.');const meta=WorldStore.importText(await f.text(),f.name);toast('Imported '+meta.name);show('worlds');}catch(err){toast(err.message,6000);}finally{e.target.value='';}});
  document.getElementById('confirmDelete').addEventListener('click',()=>{try{WorldStore.remove(pendingId);show('worlds');toast('World deleted');}catch(e){toast(e.message,5000);}});
  function renameFromMenu(e){e.preventDefault();WorldStore.rename(pendingId,document.getElementById('renameWorldName').value);show('worlds');}
  document.getElementById('renameWorldForm').addEventListener('submit',renameFromMenu);
  document.getElementById('renameWorldBtn').addEventListener('click',renameFromMenu);
  document.getElementById('renameWorldForm').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing)renameFromMenu(e);});
  document.getElementById('downloadWorldBtn').addEventListener('click',()=>{const blob=new Blob([exportData],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(exportName.replace(/[^\p{L}\p{N}_ -]/gu,'').trim()||'World')+'.webrraria';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);});
  document.getElementById('copyWorldBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(exportData);toast('Save text copied');}catch(e){const t=document.getElementById('exportWorldText');t.focus();t.select();toast('Save text selected. Press Ctrl+C / Command+C to copy.',4000);}});
  document.getElementById('settingsSfxVolume').addEventListener('input',e=>{const native=document.getElementById('sfxVolume');native.value=e.target.value;native.dispatchEvent(new Event('input'));document.getElementById('soundVolumeValue').textContent=e.target.value+'%';});
  document.getElementById('settingsTestSound').addEventListener('click',()=>document.getElementById('btnTestSound').click());
  document.addEventListener('keydown',e=>{if(root.style.display==='none'||e.target.matches('input,textarea,select')||e.target.closest('.news-post,#newsFeed,#achievementList,#settingsBody')||!['ArrowUp','ArrowDown'].includes(e.key))return;const buttons=[...root.querySelectorAll('[data-view="'+view+'"] .title-option')].filter(b=>!b.hidden);if(!buttons.length)return;e.preventDefault();const i=buttons.indexOf(document.activeElement);buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();});
  return {show,hide,back,renderWorlds,inspect:()=>({view,open:root.style.display!=='none'})};
})();

// HUD controls and item tooltips share the existing inventory/save actions.
const GUI=(()=>{
  const tooltip=document.getElementById('guiTooltip'),map=document.getElementById('minimap'),mapButton=document.getElementById('mapToggle');
  let mapVisible=gameStorage.getItem('webrraria-map-visible')!=='0';
  function syncMap(){map.hidden=!mapVisible;mapButton.textContent=mapVisible?'Hide map':'Show map';mapButton.setAttribute('aria-pressed',String(mapVisible));}
  function toggleMap(){mapVisible=!mapVisible;syncMap();if(mapVisible)updateMinimap();gameStorage.setItem('webrraria-map-visible',mapVisible?'1':'0');SFX.play('select');}
  mapButton.addEventListener('click',toggleMap);syncMap();
  document.getElementById('inventorySaveBtn').addEventListener('click',()=>document.getElementById('btnSave').click());
  document.getElementById('resumePauseBtn').addEventListener('click',closeMenu);
  document.getElementById('pauseMultiplayerBtn').addEventListener('click',()=>Menu.show('multiplayer'));
  document.getElementById('pauseSettingsBtn').addEventListener('click',()=>Menu.show('settings'));
  document.getElementById('pauseSaveBtn').addEventListener('click',()=>document.getElementById('btnSave').click());
  document.getElementById('pauseExitBtn').addEventListener('click',()=>WorldStore.exit());
  document.getElementById('pauseAchievementsBtn').addEventListener('click',()=>Menu.show('achievements'));
  document.getElementById('pausePacksBtn').addEventListener('click',()=>Menu.show('workshop'));
  document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='v'&&!e.repeat&&!e.target.matches('input,textarea,select')&&gameStarted&&!inventoryOpen()&&document.getElementById('menu').style.display==='none')toggleMap();});
  function recipeTooltip(button,x,y){
    const text=button.querySelector('.recipe-text');tooltip.replaceChildren();
    const name=document.createElement('div');name.textContent=text.querySelector('strong').textContent;tooltip.append(name);
    for(const line of text.querySelectorAll('.recipe-needs span')){const detail=document.createElement('small');detail.textContent=line.textContent;detail.className=line.className;tooltip.append(detail);}
    tooltip.style.display='block';tooltip.style.left=Math.max(6,Math.min(innerWidth-tooltip.offsetWidth-8,x))+'px';tooltip.style.top=Math.max(6,Math.min(innerHeight-tooltip.offsetHeight-8,y))+'px';
  }
  document.getElementById('craftList').addEventListener('scroll',hideTooltip);
  document.addEventListener('focusin',e=>{const recipe=e.target.closest('#craftList .recipe');if(!recipe||innerWidth<=600){hideTooltip();return;}const box=recipe.getBoundingClientRect();recipeTooltip(recipe,box.right+12,box.top);});
  document.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||document.getElementById('menu').style.display!=='none'||inventoryCursor){hideTooltip();return;}
    const recipe=e.target.closest('#craftList .recipe');if(recipe&&innerWidth>600){recipeTooltip(recipe,e.clientX+18,e.clientY+22);return;}
    const slot=e.target.closest('.invslot,#hotbar .slot');
    if(!slot){hideTooltip();return;}
    const index=Number(slot.dataset.index),bag=slot.classList.contains('invslot')?slot.dataset.bag:'hotbar',stack=bagArray(bag)[index];
    if(!stack){hideTooltip();return;}
    const meta=ITEMS[stack.id];tooltip.replaceChildren();
    const name=document.createElement('div');name.textContent=(meta?.name||stack.id)+(stack.count>1?' ('+stack.count+')':'');name.style.color=stack.favorite?'#ffe080':'#fff';tooltip.append(name);
    const detail=document.createElement('small');detail.textContent=meta?.tool?(meta.damage?meta.damage+' melee damage':'Reusable tool'):meta?.heal?'Restores '+meta.heal+' health · H to heal':meta?.tile!==undefined?'Can be placed':'Material';tooltip.append(detail);
    if(stack.favorite){const fav=document.createElement('small');fav.textContent='Marked as favorite';tooltip.append(fav);}
    tooltip.style.display='block';tooltip.style.left=Math.max(6,Math.min(innerWidth-tooltip.offsetWidth-8,e.clientX+18))+'px';tooltip.style.top=Math.max(6,Math.min(innerHeight-tooltip.offsetHeight-8,e.clientY+22))+'px';
  });
  document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')hideTooltip();},{passive:true});
  window.addEventListener('blur',hideTooltip);
  function hideTooltip(){tooltip.style.display='none';}
  return {hideTooltip};
})();

let lastTitlePaint=-Infinity;
// This sun belongs only to the title backdrop, never the world clock.
const titleSun={x:null,y:null,drag:null,paintX:0,paintY:0};
const titleMenu=document.getElementById('menu');
titleMenu.addEventListener('pointerdown',e=>{
  if(e.button!==0||gameStarted||!loadedPack.sun||e.target.closest('button,a,input,select,textarea,label'))return;
  if(e.clientX<titleSun.paintX||e.clientX>titleSun.paintX+76||e.clientY<titleSun.paintY||e.clientY>titleSun.paintY+76)return;
  titleSun.drag={id:e.pointerId,dx:e.clientX-titleSun.paintX,dy:e.clientY-titleSun.paintY};
  titleMenu.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation();
},true);
titleMenu.addEventListener('pointermove',e=>{
  if(!titleSun.drag||titleSun.drag.id!==e.pointerId)return;
  titleSun.x=Math.max(0,Math.min(innerWidth-76,e.clientX-titleSun.drag.dx))/Math.max(1,innerWidth-76);
  titleSun.y=Math.max(0,Math.min(innerHeight-76,e.clientY-titleSun.drag.dy))/Math.max(1,innerHeight-76);
  lastTitlePaint=-Infinity;e.preventDefault();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])titleMenu.addEventListener(event,e=>{if(titleSun.drag?.id===e.pointerId)titleSun.drag=null;});
window.addEventListener('blur',()=>{titleSun.drag=null;});
function drawTitleBackground(now){
  const quality=graphicsPreset();if(now-lastTitlePaint<1000/quality.menuFPS)return;lastTitlePaint=now;
  const c=document.getElementById('titleSky'),g=c.getContext('2d'),w=innerWidth,h=innerHeight;
  // Scale scenery only; logo, controls, and text remain full-resolution DOM.
  const scale=quality.scale,rw=Math.max(1,Math.floor(w*scale)),rh=Math.max(1,Math.floor(h*scale));
  if(c.width!==rw||c.height!==rh){c.width=rw;c.height=rh;}g.setTransform(scale,0,0,scale,0,0);g.imageSmoothingEnabled=false;
  const sky=loadedPack.background0;
  if(sky)g.drawImage(sky,0,0,sky.width,sky.height,0,0,w,h);else{g.fillStyle='#87ceeb';g.fillRect(0,0,w,h);}
  const sun=loadedPack.sun,sunX=titleSun.x===null?w*(.82-(now/600000)%1):titleSun.x*Math.max(0,w-76),sunY=titleSun.y===null?h*.18:titleSun.y*Math.max(0,h-76);
  titleSun.paintX=sunX;titleSun.paintY=sunY;
  if(sun)g.drawImage(sun,Math.round(sunX),Math.round(sunY),76,76);
  for(let i=0;i<8;i++){
    const cloud=loadedPack['cloud'+i%5]||loadedPack.cloud0,x=((i*229+now*.006*(1+i%3))%(w+350))-180,y=35+(i%4)*55;
    if(cloud){const scale=.4+(i%3)*.1;g.globalAlpha=.85;g.drawImage(cloud,Math.round(x),y,Math.round(cloud.width*scale),Math.round(cloud.height*scale));}
  }g.globalAlpha=1;
  for(const [id,speed,bottom]of [[7,.002,.98],[8,.004,1.08],[9,.007,1.15],[11,.011,1.3]]){
    const img=loadedPack['background'+id];if(!img)continue;
    const scale=Math.max(.7,Math.min(1.8,h/650)),iw=Math.round(img.width*scale),ih=Math.round(img.height*scale),base=Math.round(h*bottom),offset=-Math.round((now*speed)%iw);
    for(let x=offset-iw;x<w;x+=iw){g.drawImage(img,x,base-ih,iw+1,ih);if(base<h)g.drawImage(img,0,img.height-2,img.width,2,x,base-1,iw+1,h-base+2);}
  }

}


function openMenu(){if(inventoryOpen()){toggleInventory(false);if(inventoryOpen())return;}SFX.play('open');Menu.show('home');}
function closeMenu(){SFX.play('close');Menu.hide();}

function toggleInventory(force){
  const el=document.getElementById('invOverlay'),opening=force??!inventoryOpen();
  if(opening&&!gameStarted){toast('Start a world to open your inventory');return;}
  if(opening)Menu.hide();
  if(!opening&&!storeInventoryCursor())return;
  if(!opening){Containers.closeView();HomeFurniture.clearFocus();}
  for(const k of Object.keys(keys))keys[k]=false;mouse.downL=false;mouse.downR=false;
  SFX.play(opening?'open':'close');el.style.display=opening?'flex':'none';document.body.classList.toggle('inventory-open',opening);GUI.hideTooltip();
  if(opening){Achievements.note('inventory');updateInventoryUI();document.getElementById('closeInv').focus({preventScroll:true});}
  else{updateHotbar();drawInventoryCursor();saveGame();canvas.focus({preventScroll:true});}
}
document.getElementById('btnInventory').addEventListener('click',()=>toggleInventory());
window.addEventListener('pagehide',()=>{if(gameStarted)saveGame();});
document.getElementById('btnMenu').addEventListener('click', ()=>{
  if(document.getElementById('menu').style.display==='none') openMenu();
  else { if(gameStarted) closeMenu(); }
});
document.getElementById('btnSave').addEventListener('click', ()=>{if(MP.guest()){toast('The host saves this world.');return;} saveGame();SFX.play('save'); toast('Game saved!'); });
document.getElementById('btnTex').addEventListener('click', ()=>{openMenu();Menu.show('workshop');});
document.getElementById('closeInv').addEventListener('click', ()=> toggleInventory(false));

function startGame(){
  gameStarted=true;
  cam.x=Math.max(0,Math.min(WORLD_W*TILE-canvas.width/DPR/zoom,player.x+player.w/2-canvas.width/DPR/zoom/2));
  cam.y=Math.max(0,Math.min(WORLD_H*TILE-canvas.height/DPR/zoom,player.y+player.h/2-canvas.height/DPR/zoom/2));
  updateHearts(); updateMana(); updateHotbar();
  document.getElementById('coords').style.display='block';
  last=performance.now();Mods.start();BuildTools.cancel();
}

function loop(now){
  expansionFrame(now);MP.tick(now);Containers.tick(now);HomeFurniture.tick(now);Mods.tick(now);
  if(!gameStarted){last=now;drawTitleBackground(now);requestAnimationFrame(loop);return;}
  const dt = Math.min(0.033, (now-last)/1000);
  last=now;
  if(document.getElementById('invOverlay').style.display==='none' && document.getElementById('menu').style.display==='none'){
    // update time
    if(!MP.guest())time += dt * 40/gamePrefs.dayLength; // 24000 = ~10 minutes full day
    if(time>=24000){ time=0; day++; }
    // difficulty curve: spawn zombies at night - handled in enemies
    handleMining(dt);
    updatePlayer(dt);
    updateEnemies(dt);
    MP.combat(now);Achievements.tick(dt);

    // camera follow with lerp
    const targetX = player.x + player.w/2 - (canvas.width/DPR/zoom)/2;
    const targetY = player.y + player.h/2 - (canvas.height/DPR/zoom)/2;
    cam.x += (targetX - cam.x) * 0.12;
    cam.y += (targetY - cam.y) * 0.12;
    cam.x = Math.max(0, Math.min(WORLD_W*TILE - canvas.width/DPR/zoom, cam.x));
    cam.y = Math.max(0, Math.min(WORLD_H*TILE - canvas.height/DPR/zoom, cam.y));
    if(cam.shake&&gamePrefs.shake){ cam.x += (Math.random()-0.5)*cam.shake; cam.y+=(Math.random()-0.5)*cam.shake; cam.shake*=0.85; if(cam.shake<0.1) cam.shake=0; }

    // coords
    const coords=document.getElementById('coords'),label=`${expansionBiome(player.x/TILE).replace(/^./,c=>c.toUpperCase())} · Day ${day}\n${player.x/TILE|0}, ${player.y/TILE|0}`;if(coords.textContent!==label)coords.textContent=label;

    // autosave every 8s
    autosaveElapsed+=dt;if(gamePrefs.autosave&&autosaveElapsed>=gamePrefs.autosave){autosaveElapsed=0;saveGame();}
  }

  // render
  // DPR scaling already via canvas size; we render in DPR space but logic uses DPR/zoom
  ctx.save();
  ctx.scale(DPR,DPR);
  // clear with sky
  drawSceneBackground();
  drawWorld();
  drawSmoothLighting();
  drawTreeCrowns();
  drawDrops();
  drawEnemies();
  drawPlayer();MP.draw();BuildTools.draw();
  if(gamePrefs.particles)drawParticles();
  // selection outline done in drawWorld
  ctx.restore();

  // HUD
  // minimap less frequent
  if(Math.floor(now/200) !== Math.floor((now-dt*1000)/200)) updateMinimap();

  requestAnimationFrame(loop);
}

// Exploration updates. Old terrain is kept as-is; new worlds use generator v5.
function expansionBiome(x){const b=biomeWeights(x);return Object.keys(b).reduce((a,k)=>b[k]>b[a]?k:a,'forest');}
function enemyDamage(base){return gamePrefs.difficulty==='peaceful'?0:base*(gamePrefs.difficulty==='hard'?2:1);}
function healFromInventory(preferred=null){
  if(!MP.canHeal()){toast('Wait a moment before healing again.');return false;}
  if(player.health>=player.maxHealth){toast('Health is full.');return false;}
  let stack=preferred; if(!stack)stack=[...player.hotbar,...inventory].find(s=>s&&ITEMS[s.id]?.heal&&s.count>0);
  if(!stack){toast('No healing potions.');return false;}
  player.health=Math.min(player.maxHealth,player.health+ITEMS[stack.id].heal);stack.count--;
  for(const bag of [player.hotbar,inventory])for(let i=0;i<bag.length;i++)if(bag[i]?.count===0)bag[i]=null;
  MP.healed(stack.id);Achievements.note('healed');updateHearts();updateHotbar();if(inventoryOpen())updateInventoryUI();SFX.play('save');toast('Restored health');saveGame();return true;
}
function tintExpansionImage(img,color,grassOnly=false){
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const data=g.getImageData(0,0,c.width,c.height);
  for(let i=0;i<data.data.length;i+=4){const d=data.data;if(!d[i+3])continue;if(grassOnly&&!(d[i+1]>d[i]*1.12&&d[i+1]>d[i+2]*1.1))continue;const lum=(d[i]*.3+d[i+1]*.5+d[i+2]*.2)/180;for(let k=0;k<3;k++)d[i+k]=Math.min(255,color[k]*lum);}
  g.putImageData(data,0,0);return c;
}
function makeExpansionItemIcons(){
  for(const id of ['ironsword','ironpickaxe','jungleblade','healingpotion','fiber','spore']){
    const c=document.createElement('canvas');c.width=c.height=24;const g=c.getContext('2d');
    if(id==='healingpotion'){g.fillStyle='#caa983';g.fillRect(9,1,6,3);g.fillStyle='#d3ebed';g.fillRect(8,4,8,5);g.fillRect(5,9,14,12);g.fillStyle='#b54866';g.fillRect(7,11,10,8);g.fillStyle='#f58c99';g.fillRect(8,11,2,5);}
    else if(id==='fiber'){g.fillStyle='#398054';g.fillRect(11,3,2,19);for(let y=4;y<19;y+=5){g.fillRect(5,y,7,3);g.fillStyle='#68b95c';g.fillRect(13,y+2,7,3);g.fillStyle='#398054';}}
    else if(id==='spore'){g.fillStyle='#244e94';g.fillRect(6,5,12,13);g.fillStyle='#65d5eb';g.fillRect(8,3,8,17);g.fillRect(4,7,16,9);g.fillStyle='#d1ffff';g.fillRect(9,6,4,5);}
    else{g.fillStyle='#795337';g.fillRect(4,17,4,6);g.fillStyle='#d8bf75';g.fillRect(3,15,10,3);g.fillStyle=id==='jungleblade'?'#a9ed74':'#cedde5';for(let i=0;i<14;i++){g.fillRect(7+i,16-i,4,4);}if(id==='ironpickaxe'){g.clearRect(7,0,17,16);g.fillStyle='#c9d7df';g.fillRect(4,3,16,4);g.fillRect(17,5,4,8);g.fillStyle='#9d7346';g.fillRect(10,7,3,15);}}
    expandedItemSprites[id]=c;
  }
}
function installExpansionTextures(){
  if(window.__PERSONAL_PACK){installPersonalTextures();return;}
  makeExpansionItemIcons();
  const pairs=[[T.MUD,T.DIRT,[115,81,66],false],[T.JUNGLE_GRASS,T.GRASS,[78,202,53],true],[T.MUSHROOM_GRASS,T.GRASS,[58,192,237],true],[T.MOSS_BRICK,T.BRICK,[70,127,93],false]];
  for(const [id,base,color,grass]of pairs){tileCanvases[id]=tintExpansionImage(tileCanvases[base],color,grass);if(loadedPack[base]&&(!loadedPack[id]||derivedExpansionImages.has(loadedPack[id]))){loadedPack[id]=tintExpansionImage(loadedPack[base],color,grass);derivedExpansionImages.add(loadedPack[id]);}}
  for(const id of [T.MUSHROOM,T.VINE,T.GLOW_LANTERN]){
    const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');
    if(id===T.MUSHROOM){g.fillStyle='#b3e5ee';g.fillRect(7,8,3,8);g.fillStyle='#173b88';g.fillRect(2,6,12,4);g.fillStyle='#429ffa';g.fillRect(3,3,10,5);g.fillRect(5,1,6,2);g.fillStyle='#b2fcff';g.fillRect(4,4,2,2);g.fillRect(10,5,2,2);}
    if(id===T.VINE){g.fillStyle='#275c31';g.fillRect(7,0,2,16);g.fillStyle='#459348';for(let y=1;y<15;y+=5){g.fillRect(y%2?3:9,y,5,3);g.fillStyle='#68b74f';g.fillRect(y%2?3:10,y,3,1);g.fillStyle='#459348';}}
    if(id===T.GLOW_LANTERN){g.fillStyle='#374662';g.fillRect(7,0,2,4);g.fillRect(4,3,8,2);g.fillRect(4,12,8,2);g.fillStyle='#42a0c4';g.fillRect(4,5,8,7);g.fillStyle='#bafcff';g.fillRect(6,5,4,6);g.fillStyle='#f0ffff';g.fillRect(7,5,2,4);}
    tileCanvases[id]=c;
  }
  installMixedTextures();
  if(loadedPack.slime){loadedPack['slime-jungle']=tintExpansionImage(loadedPack.slime,[89,200,54]);loadedPack['slime-fungal']=tintExpansionImage(loadedPack.slime,[102,126,239]);loadedPack['slime-ice']=tintExpansionImage(loadedPack.slime,[109,206,240]);}
  spriteFrameCache.clear();biomeTileCache.clear();CaveRenderer.clear();
}
function installMixedTextures(){
  if(window.__PERSONAL_PACK){installPersonalTextures();return;}
  const pairs=[[T.STONE_SLAB,T.STONE,[140,147,152]],[T.SANDSTONE_BRICK,T.BRICK,[185,153,96]],[T.SNOW_BRICK,T.BRICK,[215,228,240]],[T.MARBLE,T.STONE,[220,219,219]],[T.GRANITE,T.STONE,[78,88,108]],[T.AMBER,T.COPPER,[242,174,65]],[T.ICE_BRICK,T.BRICK,[135,207,232]],[T.STONE_BRICK,T.BRICK,[137,149,169]],[T.TIMBER,T.WOOD,[185,129,76]]];
  for(const [id,base,color]of pairs){
    tileCanvases[id]=tintExpansionImage(tileCanvases[base],color);
    if(loadedPack[base]){loadedPack[id]=tintExpansionImage(loadedPack[base],color);derivedExpansionImages.add(loadedPack[id]);}
  }
  tileCanvases[T.AMBER_LAMP]=tintExpansionImage(tileCanvases[T.GLOW_LANTERN],[255,190,85]);
  tileCanvases[T.SUPPLY_CACHE]=tintExpansionImage(tileCanvases[T.CHEST],[208,145,67]);
  if(loadedPack[T.CHEST])loadedPack[T.SUPPLY_CACHE]=tintExpansionImage(loadedPack[T.CHEST],[208,145,67]);
  expandedItemSprites.amberblade=tintExpansionImage(loadedPack.item3507||expandedItemSprites.ironsword,[255,183,76]);
  expandedItemSprites.amberpickaxe=tintExpansionImage(loadedPack.item3509||expandedItemSprites.ironpickaxe,[255,183,76]);
  expandedItemSprites.ambertonic=tintExpansionImage(expandedItemSprites.healingpotion,[241,180,78]);
  if(loadedPack.item12)expandedItemSprites.amber=tintExpansionImage(loadedPack.item12,[255,184,68]);
  if(loadedPack.slime)loadedPack['slime-sand']=tintExpansionImage(loadedPack.slime,[225,176,94]);
  if(loadedPack.zombie)loadedPack['zombie-cave']=tintExpansionImage(loadedPack.zombie,[149,137,169]);
}
function generateMixedDiscoveries(){
  // Seeded additions apply ONLY to new worlds. Loading a saved world never calls this.
  for(let k=0;k<100;k++){
    const cx=6+Math.floor(hash2(k+worldSeed,801)*(WORLD_W-12)),cy=surfaceY[cx]+27+Math.floor(hash2(k+worldSeed,802)*90);
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const x=cx+dx,y=cy+dy;if(y>=WORLD_H-5||dx*dx+dy*dy>5)continue;
      if(world[y]?.[x]===T.STONE&&hash2(x+worldSeed,y+k)>.22)world[y][x]=T.AMBER;
    }
  }
  for(let i=0;i<12;i++){
    const x=12+Math.floor(hash2(i+worldSeed,811)*(WORLD_W-24)),y=Math.min(WORLD_H-10,surfaceY[x]+35+Math.floor(hash2(i+worldSeed,812)*65));
    let occupied=false;
    for(let dy=-5;dy<=2;dy++)for(let dx=-6;dx<=6;dx++)if([T.CHEST,T.SUPPLY_CACHE].includes(world[y+dy][x+dx]))occupied=true;
    if(occupied)continue;
    for(let dy=-4;dy<=1;dy++)for(let dx=-4;dx<=4;dx++)world[y+dy][x+dx]=dy===1?T.STONE_BRICK:dy===-4?T.TIMBER:Math.abs(dx)===4?T.STONE_BRICK:T.AIR;
    world[y][x]=T.SUPPLY_CACHE;world[y-1][x-3]=T.AMBER_LAMP;
  }
}
const baseGenerateExpanded=generateWorld;
generateWorld=function(persist=true,seed=null){
  baseGenerateExpanded(false,seed);generatorVersion=4;
  // Decorate the same seeded terrain; never replace terrain in an existing save.
  for(let x=2;x<WORLD_W-2;x++){
    const b=biomeWeights(x),h=surfaceY[x];
    if(b.jungle>.35||b.mushroom>.35){
      const mushroom=b.mushroom>b.jungle;
      for(let y=h;y<Math.min(h+8,WORLD_H);y++)if([T.DIRT,T.GRASS].includes(world[y][x]))world[y][x]=y===h?(mushroom?T.MUSHROOM_GRASS:T.JUNGLE_GRASS):T.MUD;
      if(mushroom&&hash2(x,worldSeed)> .62&&world[h-1][x]===T.AIR)world[h-1][x]=T.MUSHROOM;
      if(!mushroom)for(let y=h+12;y<WORLD_H-15;y++)if(SOLID.has(world[y-1][x])&&world[y][x]===T.AIR&&hash2(x,y+worldSeed)>.72){for(let k=0;k<2+Math.floor(hash2(y,x)*4)&&world[y+k]?.[x]===T.AIR;k++)world[y+k][x]=T.VINE;}
    }
  }
  trees=trees.filter(t=>{if(biomeWeights(t.x).mushroom>.45){for(let y=t.top;y<=t.base;y++)if(world[y][t.x]===T.TRUNK)world[y][t.x]=T.AIR;return false;}return true;});
  generateMixedDiscoveries();Mods.generate();
  // Chambers/camps may overlap during generation: discard replaced chest records.
  Containers.reset(Containers.dump().filter(r=>world[r.y]?.[r.x]===T.CHEST));generatorVersion=5;
  enemies=[];for(let i=0;i<10;i++)spawnSlime();installExpansionTextures();updateLightMap();if(persist)saveGame();
};
const baseSpawnExpanded=spawnSlime;
spawnSlime=function(){
  if(gamePrefs.difficulty==='peaceful')return;baseSpawnExpanded();const e=enemies[enemies.length-1];const biome=expansionBiome(e.x/TILE);
  if(biome==='jungle')Object.assign(e,{variant:'jungle',health:24,maxHealth:24,damage:2});
  else if(biome==='mushroom')Object.assign(e,{variant:'fungal',health:20,maxHealth:20,damage:1});
  else if(biome==='desert')Object.assign(e,{variant:'sand',health:22,maxHealth:22,damage:2});
  else if(biome==='snow')Object.assign(e,{variant:'ice',health:18,maxHealth:18,damage:1});
};
function spawnExpansionMob(type,x,y){
  if(gamePrefs.difficulty==='peaceful')return;
  if(type==='bat'){enemies.push({type:'bat',x,y,vx:0,vy:0,w:20,h:13,health:14,maxHealth:14,hurt:0,phase:Math.random()*6.28,dir:1});return;}
  if(type==='cavezombie'){enemies.push({type:'zombie',variant:'cave',x,y,vx:0,vy:0,w:14,h:28,health:40,maxHealth:40,damage:3,dir:1,hurt:0,onGround:false});return;}
  const variant=type==='desert'?'sand':type==='jungle'?'jungle':type==='mushroom'?'fungal':type==='snow'?'ice':null;
  enemies.push({type:'slime',variant,x,y,vx:0,vy:0,w:18,h:14,health:variant==='jungle'?24:variant==='sand'?22:variant?20:16,maxHealth:variant==='jungle'?24:variant==='sand'?22:variant?20:16,damage:variant==='jungle'||variant==='sand'?2:1,dir:1,jumpCooldown:.8,hurt:0,onGround:false});
}
function updateCaveBat(e,dt){
  e.hurt=Math.max(0,e.hurt-dt);e.phase+=dt*5;
  const dx=player.x-e.x,dy=player.y-e.y,dist=Math.max(1,Math.hypot(dx,dy));
  e.vx+=(dx/dist*1.5-e.vx)*.06;e.vy+=(dy/dist*1.2+Math.sin(e.phase)*.65-e.vy)*.06;
  if(!rectCollides(e.x+e.vx,e.y,e.w,e.h))e.x+=e.vx;else e.vx*=-1;
  if(!rectCollides(e.x,e.y+e.vy,e.w,e.h))e.y+=e.vy;else e.vy*=-1;
  if(dist<20&&player.hurtTime<=0){player.health-=enemyDamage(1);player.hurtTime=1;updateHearts();SFX.play('hurt');if(player.health<=0)respawn();}
  const held=player.hotbar[player.selected],meta=held&&ITEMS[held.id];
  if(mouse.downL&&player.swing>.15&&e.hurt<=0&&dist<48){e.health-=meta?.damage||3;e.hurt=.35;e.vx=Math.sign(e.x-player.x)*4;SFX.play('slimeHit');if(e.health<=0){e.dead=true;Achievements.note('bats');drops.push({id:'fiber',x:e.x,y:e.y,vx:0,vy:-1,life:18});SFX.play('slimeDeath');}}
}
let expandedSpawnClock=0,autosaveElapsed=0;
const baseUpdateExpanded=updateEnemies;
updateEnemies=function(dt){
  if(MP.active()){enemies=[];baseUpdateExpanded(dt);enemies=[];return;}
  if(gamePrefs.difficulty==='peaceful')enemies=[];baseUpdateExpanded(dt);
  if(gamePrefs.difficulty==='peaceful'){enemies=[];return;}
  expandedSpawnClock+=dt;if(expandedSpawnClock<6)return;expandedSpawnClock=0;
  if(enemies.filter(e=>Math.abs(e.x-player.x)<600).length>=6||enemies.length>=18)return;
  const px=player.x/TILE,py=player.y/TILE,depth=py-surfaceY[Math.max(0,Math.min(WORLD_W-1,px|0))];
  if(depth>12){for(let i=0;i<30;i++){const x=Math.max(2,Math.min(WORLD_W-3,Math.floor(px+(Math.random()<.5?-1:1)*(8+Math.random()*10)))),y=Math.max(2,Math.min(WORLD_H-3,Math.floor(py+(Math.random()-.5)*9)));if(world[y][x]===T.AIR&&world[y+1][x]===T.AIR){if(world[y+2]?.[x]!==undefined&&SOLID.has(world[y+2][x])&&Math.random()<.35)spawnExpansionMob('cavezombie',x*TILE,y*TILE);else spawnExpansionMob('bat',x*TILE,y*TILE);break;}}}
  else{const x=Math.max(2,Math.min(WORLD_W-3,Math.floor(px+(Math.random()<.5?-1:1)*(12+Math.random()*12))));spawnExpansionMob(expansionBiome(x),x*TILE,(surfaceY[x]-2)*TILE);}
};
function drawCaveBat(e,sx,sy,w,h){
  if(window.__PERSONAL_PACK){const img=loadedPack.bat;if(img){const fh=img.height/5,frame=Math.floor(performance.now()/100)%5;ctx.drawImage(img,0,frame*fh,img.width,fh-2,sx-w*.5,sy-h*.8,w*2,h*2);}if(e.health<e.maxHealth){ctx.fillStyle='#171b32';ctx.fillRect(sx,sy-7*zoom,w,3*zoom);ctx.fillStyle='#e05c8c';ctx.fillRect(sx,sy-7*zoom,w*e.health/e.maxHealth,2*zoom);}return;}
  const up=Math.sin(performance.now()/85+e.phase)>0;
  ctx.fillStyle=e.hurt>0?'#d787b4':'#514b7c';ctx.fillRect(sx+w*.32,sy+h*.2,w*.36,h*.75);
  ctx.beginPath();ctx.moveTo(sx+w*.4,sy+h*.5);ctx.lineTo(sx-w*.25,sy+(up?-h*.5:h*.7));ctx.lineTo(sx,sy+h*.9);ctx.lineTo(sx+w*.36,sy+h*.75);ctx.fill();
  ctx.beginPath();ctx.moveTo(sx+w*.6,sy+h*.5);ctx.lineTo(sx+w*1.25,sy+(up?-h*.5:h*.7));ctx.lineTo(sx+w,sy+h*.9);ctx.lineTo(sx+w*.64,sy+h*.75);ctx.fill();
  ctx.fillStyle='#eac177';ctx.fillRect(sx+w*.38,sy+h*.4,2*zoom,2*zoom);ctx.fillRect(sx+w*.58,sy+h*.4,2*zoom,2*zoom);
  if(e.health<e.maxHealth){ctx.fillStyle='#171b32';ctx.fillRect(sx,sy-7*zoom,w,3*zoom);ctx.fillStyle='#e05c8c';ctx.fillRect(sx,sy-7*zoom,w*e.health/e.maxHealth,2*zoom);}
}
let lastFPSUpdate=0,lastFPSFrame=performance.now(),fpsSmooth=60;
function expansionFrame(now){const delta=now-lastFPSFrame;lastFPSFrame=now;if(delta>0)fpsSmooth=fpsSmooth*.9+1000/delta*.1;if(now-lastFPSUpdate>500){lastFPSUpdate=now;document.getElementById('fpsReadout').textContent=Math.round(fpsSmooth)+' FPS';}}
function applyGamePrefs(recenter=false){
  if(Number.isFinite(gamePrefs.zoom))zoom=gamePrefs.zoom;
  document.body.classList.toggle('hide-coordinates',!gamePrefs.coordinates);document.body.classList.toggle('show-fps',gamePrefs.fps);
  document.getElementById('settingZoom').value=Math.round(zoom*100);document.getElementById('zoomReadout').textContent=zoom.toFixed(1)+'×';
  for(const id of ['particles','shake','coordinates','fps'])document.getElementById('setting-'+id).checked=gamePrefs[id];
  for(const id of ['difficulty','autosave','dayLength'])document.getElementById('setting-'+id).value=gamePrefs[id];
  const q=graphicsPreset(),particleToggle=document.getElementById('setting-particles');
  document.getElementById('setting-quality').value=gamePrefs.quality;
  particleToggle.checked=gamePrefs.particles&&q.particleRate>0;particleToggle.disabled=q.particleRate===0;particleToggle.title=q.particleRate===0?'Lowest quality turns particles off. Choose a higher preset to enable them.':'';
  document.getElementById('qualityDescription').textContent=Math.round(q.scale*100)+'% world resolution · '+(q.dprCap>1?'high-DPI up to 2×':'standard pixel density')+' · '+(gamePrefs.particles&&q.particleRate>0?Math.round(q.particleRate*100)+'% particles':'particles off')+'. Interface, smooth lighting, and biome blending stay on.';
  if(!gamePrefs.particles||q.particleCap===0)particles.length=0;else if(particles.length>q.particleCap)particles.splice(0,particles.length-q.particleCap);
  if(recenter&&gameStarted){cam.x=Math.max(0,Math.min(WORLD_W*TILE-canvas.width/DPR/zoom,player.x-canvas.width/DPR/zoom/2));cam.y=Math.max(0,Math.min(WORLD_H*TILE-canvas.height/DPR/zoom,player.y-canvas.height/DPR/zoom/2));}
}
function persistGamePrefs(){resize();gameStorage.setItem('webrraria-settings-v1',JSON.stringify(gamePrefs));applyGamePrefs(true);}
document.getElementById('setting-quality').addEventListener('change',e=>{if(!Object.hasOwn(GRAPHICS_QUALITY,e.target.value))return;gamePrefs.quality=e.target.value;persistGamePrefs();});
for(const id of ['particles','shake','coordinates','fps'])document.getElementById('setting-'+id).addEventListener('change',e=>{gamePrefs[id]=e.target.checked;persistGamePrefs();});
for(const id of ['difficulty','autosave','dayLength'])document.getElementById('setting-'+id).addEventListener('change',e=>{gamePrefs[id]=id==='difficulty'?e.target.value:Number(e.target.value);if(id==='difficulty'&&gamePrefs.difficulty==='peaceful')enemies=[];persistGamePrefs();});
document.getElementById('settingZoom').addEventListener('input',e=>{gamePrefs.zoom=Number(e.target.value)/100;persistGamePrefs();});
document.getElementById('resetSettingsBtn').addEventListener('click',()=>{Object.assign(gamePrefs,{quality:'awesome',zoom:innerWidth<900?1.7:2,particles:true,shake:true,coordinates:true,fps:false,difficulty:'classic',autosave:8,dayLength:1});persistGamePrefs();toast('Gameplay settings reset.');});
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='h'&&!e.repeat&&!e.target.matches('input,textarea,select')&&gameStarted&&!inventoryOpen()&&document.getElementById('menu').style.display==='none')healFromInventory();});
installExpansionTextures();applyGamePrefs();

// Invite-only WebRTC. Signaling via gateway or manual exchange; host-controlled PvP, separate inventories.
const ROOM_CODES_ENABLED = true; // Room codes through the reachable Pages gateway; manual remains available.
const DEFAULT_SIGNALING_URL = "https://webrraria-room-gateway.pages.dev"; // Stable deployed gateway; manual invitations do not use this service.
const CharacterParts=(()=>{
 const names=['head','hair','body','legs'],maskKeys=['partHead0','partHead1','partHead2','partLegs0','partLegs1','partLegs2','partHair'],cache=new Map(),readCache=new WeakMap();
 function clean(value){if(!value||value.v!==1||Object.keys(value).some(k=>!['v',...names].includes(k))||names.some(k=>!Number.isInteger(value[k])||value[k]<0||value[k]>2))throw Error('Invalid character parts.');return {v:1,head:value.head,hair:value.hair,body:value.body,legs:value.legs};}
 function defaults(){return {v:1,head:characterStyle,hair:characterStyle,body:characterStyle,legs:characterStyle};}
 function read(im){let data=readCache.get(im);if(!data){const c=document.createElement('canvas');c.width=40;c.height=1120;const g=c.getContext('2d');g.drawImage(im,0,0);data=g.getImageData(0,0,40,1120).data;readCache.set(im,data);}return data;}
 function sourcePart(frame,x,y,masks){const i=((frame*56+y)*40+x)*4+3,hair=((Math.min(frame,13)*56+y)*40+x)*4+3;if(masks[6][hair])return 'hair';if((masks[0][i]||masks[1][i]||masks[2][i]))return 'head';if((masks[3][i]||masks[4][i]||masks[5][i]))return 'legs';return 'body';}
 function build(value){const choice=clean(value),images=[0,1,2].map(n=>loadedPack['character'+n]),maskImages=maskKeys.map(k=>loadedPack[k]);if([...images,...maskImages].some(im=>!im))return null;const all=[...images,...maskImages],key=JSON.stringify(choice),old=cache.get(key);if(old&&old.images.every((im,i)=>im===all[i]))return old.sheet;const c=document.createElement('canvas');c.width=40;c.height=1120;const g=c.getContext('2d'),out=g.createImageData(40,1120),src=images.map(read),masks=maskImages.map(read);for(let f=0;f<20;f++)for(let y=0;y<56;y++)for(let x=0;x<40;x++){const i=((f*56+y)*40+x)*4,data=src[choice[sourcePart(f,x,y,masks)]];out.data[i]=data[i];out.data[i+1]=data[i+1];out.data[i+2]=data[i+2];out.data[i+3]=data[i+3];}g.putImageData(out,0,0);cache.set(key,{images:all,sheet:c});while(cache.size>16)cache.delete(cache.keys().next().value);return c;}
 return {names,clean,defaults,build};
})();

const Accounts=(()=>{
 const $=id=>document.getElementById(id),base=DEFAULT_SIGNALING_URL.replace(/\/$/,''),storageKey='webrraria-account-v1:'+base,enc=new TextEncoder();
 let user=null,token='',expiresAt=0,remember=false,busy=false,mode='login',currentSkin=null,readyPromise=Promise.resolve(),publicKeyPromise=null;
 const sheet=document.createElement('canvas');sheet.width=40;sheet.height=1120;const pixels=sheet.getContext('2d',{willReadFrequently:true}),canvas=$('skinCanvas'),paint=canvas.getContext('2d');let frame=0,drawing=false,editing=false,draft=CharacterParts.defaults(),savedDraft=JSON.stringify(draft),previewLeft=false,previewWalk=false,previewTimer=null;
 const from64=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const url64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 function message(text){$('accountStatus').textContent=text;}
 function stored(){try{return JSON.parse(sessionStorage.getItem(storageKey)||localStorage.getItem(storageKey)||'null');}catch{return null;}}
 function persist(){try{sessionStorage.removeItem(storageKey);localStorage.removeItem(storageKey);if(token)(remember?localStorage:sessionStorage).setItem(storageKey,JSON.stringify({token,expiresAt,username:user?.username,id:user?.id,remember}));}catch{message('Signed in for this visit. This browser could not remember the session.');}}
 async function api(path,method='GET',data,auth=true){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(base+'/accounts/'+path,{method,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',redirect:'error',headers:{...(data!==undefined?{'Content-Type':'application/json'}:{}),...(auth&&token?{Authorization:'Bearer '+token}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{}),signal:controller.signal});const text=await r.text();if(text.length>100000)throw Error('The account response is too large.');let out;try{out=JSON.parse(text);}catch{throw Error('The account service is unavailable. You can still play as a guest.');}if(!r.ok){if([401,403].includes(r.status)&&['me','ticket'].includes(path)){token='';user=null;currentSkin=null;persist();render();}const error=Error(typeof out.error==='string'?out.error.slice(0,180):'The account request failed.');error.status=r.status;throw error;}return out;}catch(e){if(e.name==='AbortError')throw Error('The account service timed out. Try again later.');throw e;}finally{clearTimeout(timer);}}
 async function verifier(username,password){if(password.length<10||password.length>128)throw Error('Use a password between 10 and 128 characters.');const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);const bytes=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:600000,salt:enc.encode('webrraria-account-v1:'+username.toLowerCase())},key,256));return Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');}
 async function image(data){if(!data)return null;if(typeof data!=='string'||data.length>87500||!data.startsWith('data:image/png;base64,'))throw Error('Invalid skin data.');const im=new Image();im.src=data;await im.decode();if(im.width!==40||im.height!==1120)throw Error('Use the 40 by 1120 PNG skin template.');return im;}
 async function setUser(profile){if(!profile||!/^[A-Za-z0-9_-]{22}$/.test(profile.id)||!/^[A-Za-z0-9_]{3,20}$/.test(profile.username))throw Error('Invalid account profile.');user={id:profile.id,username:profile.username,skinHash:profile.skinHash||'',skin:profile.skin||null,appearance:profile.appearance?CharacterParts.clean(profile.appearance):null,role:profile.role==='admin'?'admin':'player'};try{currentSkin=await image(user.skin);}catch{currentSkin=null;}render();}
 function render(){if(!user){editing=false;stopPreview();}const active=typeof MP!=='undefined'&&MP.active();$('accountSignedIn').hidden=!user||editing;$('skinEditor').hidden=!user||!editing;$('accountHeading').textContent=editing?'Edit Character':'Account';$('accountSignedOut').hidden=!!user;$('accountName').textContent=user?.username||'';$('accountMenuButton').textContent=user?'Account: '+user.username:'Account';for(const b of $('accountPanel').querySelectorAll('button,input,select'))b.disabled=busy||active;for(const b of $('accountPanel').querySelectorAll('[data-go]'))b.disabled=false;if(user)$('mpName').value=user.username;for(const tab of document.querySelectorAll('[data-account-mode]'))tab.setAttribute('aria-selected',String(tab.dataset.accountMode===mode));$('accountAdminBadge').hidden=user?.role!=='admin';$('accountAdminButton').hidden=user?.role!=='admin';$('accountAdminButton').disabled=busy||user?.role!=='admin';$('pauseAdminBtn').hidden=user?.role!=='admin';paintAvatar();if(editing){paintCharacter();if(!$('accountPanel').hidden)startPreview();}if(typeof MP!=='undefined')MP.syncUI();}
 async function action(fn){if(busy)return;if(MP.active()){message('Leave multiplayer before changing your account or skin.');return;}busy=true;render();try{await fn();}catch(e){message(e.message);}finally{busy=false;render();}}
 function setMode(value){mode=value;for(const tab of document.querySelectorAll('[data-account-mode]'))tab.setAttribute('aria-selected',String(tab.dataset.accountMode===mode));$('accountSubmit').textContent=value==='register'?'Create Account':value==='recover'?'Reset Password':'Sign In';$('accountPasswordLabel').textContent=value==='recover'?'New password':'Password';for(const id of ['accountConfirm','accountConfirmLabel'])$(id).hidden=value==='login';for(const id of ['accountRecoveryInput','accountRecoveryLabel'])$(id).hidden=value!=='recover';$('accountConfirm').required=value!=='login';$('accountRecoveryInput').required=value==='recover';$('accountPassword').autocomplete=value==='login'?'current-password':'new-password';message(value==='recover'?'Resetting your password signs out your other sessions and replaces your recovery code.':'You can play without an account.');}
 function recovery(code){$('accountRecoveryCode').value=code;$('accountRecoveryBox').hidden=false;}
 async function accept(result){if(typeof result.token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(result.token)||!Number.isFinite(result.expiresAt))throw Error('Invalid account session.');token=result.token;expiresAt=result.expiresAt;await setUser(result.user);persist();message('Signed in as '+user.username+'.');if(result.recoveryCode)recovery(result.recoveryCode);}
 for(const b of document.querySelectorAll('[data-account-mode]'))b.onclick=()=>setMode(b.dataset.accountMode);
 $('accountForm').onsubmit=e=>{e.preventDefault();action(async()=>{const username=$('accountUsername').value.trim();if(!/^[A-Za-z0-9_]{3,20}$/.test(username))throw Error('Use letters, numbers or underscores for your username.');const password=$('accountPassword').value;if(mode!=='login'&&password!==$('accountConfirm').value)throw Error('The passwords do not match.');message('Signing in…');try{const v=await verifier(username,password);remember=$('accountRemember').checked;await accept(await api(mode==='register'?'register':mode==='recover'?'recover':'login','POST',{username,verifier:v,...(mode==='recover'?{recoveryCode:$('accountRecoveryInput').value.trim()}:{})},false));}finally{$('accountPassword').value='';$('accountConfirm').value='';$('accountRecoveryInput').value='';}});};
 $('accountSignOut').onclick=()=>action(async()=>{let failed=false;try{await api('logout','POST',{});}catch{failed=true;}token='';user=null;currentSkin=null;expiresAt=0;editing=false;stopPreview();persist();$('skinEditor').hidden=true;$('accountRecoveryBox').hidden=true;$('accountRecoveryCode').value='';$('mpName').value=gameStorage.getItem('webrraria-mp-name')||'Player';message(failed?'Signed out here. The service could not revoke the old session; it expires automatically.':'Signed out.');});
 $('accountPasswordForm').onsubmit=e=>{e.preventDefault();action(async()=>{try{message('Changing password…');const currentVerifier=await verifier(user.username,$('accountOldPassword').value),v=await verifier(user.username,$('accountNewPassword').value);await accept(await api('password','POST',{currentVerifier,verifier:v}));message('Password changed. Other sessions were signed out.');}finally{$('accountOldPassword').value='';$('accountNewPassword').value='';}});};
 $('accountCopyRecovery').onclick=async()=>{try{await navigator.clipboard.writeText($('accountRecoveryCode').value);message('Recovery code copied. Keep it private.');}catch{$('accountRecoveryCode').select();message('Recovery code selected. Copy it and keep it private.');}};
 $('accountSavedRecovery').onclick=()=>{$('accountRecoveryCode').value='';$('accountRecoveryBox').hidden=true;};
 function drawEditor(){paint.imageSmoothingEnabled=false;paint.clearRect(0,0,240,336);paint.fillStyle='#18223b';paint.fillRect(0,0,240,336);paint.drawImage(sheet,0,frame*56,40,56,0,0,240,336);paint.strokeStyle='rgba(255,255,255,.12)';paint.lineWidth=1;for(let x=0;x<=40;x++){paint.beginPath();paint.moveTo(x*6+.5,0);paint.lineTo(x*6+.5,336);paint.stroke();}for(let y=0;y<=56;y++){paint.beginPath();paint.moveTo(0,y*6+.5);paint.lineTo(240,y*6+.5);paint.stroke();}}
 for(let i=0;i<20;i++){const option=document.createElement('option');option.value=i;option.textContent=i===0?'1: Idle':i===5?'6: Jump':i>=6?(i+1)+': Walk '+(i-5):(i+1)+': Extra pose';$('skinFrame').append(option);}
 $('skinFrame').onchange=()=>{frame=Number($('skinFrame').value);drawEditor();};
 function stroke(e){if(!drawing||busy)return;const r=canvas.getBoundingClientRect(),x=Math.max(0,Math.min(39,Math.floor((e.clientX-r.left)*40/r.width))),y=Math.max(0,Math.min(55,Math.floor((e.clientY-r.top)*56/r.height))),size=Number($('skinBrush').value);if($('skinErase').checked)pixels.clearRect(x,frame*56+y,Math.min(size,40-x),Math.min(size,56-y));else{pixels.fillStyle=$('skinColor').value;pixels.fillRect(x,frame*56+y,Math.min(size,40-x),Math.min(size,56-y));}drawEditor();}
 canvas.onpointerdown=e=>{e.preventDefault();drawing=true;canvas.setPointerCapture(e.pointerId);stroke(e);};canvas.onpointermove=stroke;canvas.onpointerup=canvas.onpointercancel=()=>{drawing=false;};
 function characterSheet(){return user?.appearance?CharacterParts.build(user.appearance):currentSkin;}
 function paintPreview(target,img,f=0,left=false){const g=target.getContext('2d');g.clearRect(0,0,target.width,target.height);g.imageSmoothingEnabled=false;if(!img)return;const scale=Math.min(target.width/44,(target.height-12)/56);g.save();g.translate(target.width/2,target.height-8);g.scale(left?-1:1,1);g.drawImage(img,0,f*56,40,56,-20*scale,-56*scale,40*scale,56*scale);g.restore();}
 function paintAvatar(){paintPreview($('accountAvatar'),characterSheet()||loadedPack['character'+characterStyle]);}
 function dirty(){return JSON.stringify(draft)!==savedDraft;}
 function paintCharacter(){const img=CharacterParts.build(draft),f=previewWalk?6+Math.floor(performance.now()/100)%14:0;paintPreview($('characterPreview'),img,f,previewLeft);$('characterPreviewNote').textContent=img?(user?.skin?'Preset preview. Your PNG is unchanged until you save.':''):'Load character textures in Resource Packs to preview.';for(const name of CharacterParts.names)$('characterPart_'+name).textContent='Style '+(draft[name]+1)+' / 3';$('characterDirty').textContent=dirty()?'Unsaved changes':user?.appearance?'Saved preset':'Preset preview';}
 function stopPreview(){clearInterval(previewTimer);previewTimer=null;}
 function startPreview(){stopPreview();previewTimer=setInterval(()=>{if($('accountPanel').hidden||document.getElementById('menu').style.display==='none'){stopPreview();return;}if(!$('skinEditor').hidden&&previewWalk&&!document.hidden)paintCharacter();},100);}
 for(const name of CharacterParts.names){const row=document.createElement('div'),label=document.createElement('span'),picker=document.createElement('div'),out=document.createElement('output');row.className='character-part';label.className='character-part-label';label.textContent=name[0].toUpperCase()+name.slice(1);label.id='characterLabel_'+name;picker.className='character-part-picker';picker.setAttribute('role','group');picker.setAttribute('aria-labelledby',label.id);out.id='characterPart_'+name;out.setAttribute('aria-live','polite');for(const step of [-1,1]){const button=document.createElement('button');button.type='button';button.textContent=step===-1?'◀':'▶';button.dataset.characterPart=name;button.dataset.step=step;button.setAttribute('aria-label',(step===-1?'Previous ':'Next ')+name+' style');button.onclick=()=>{if(busy||MP.active())return;draft[name]=(draft[name]+step+3)%3;paintCharacter();};if(step===-1)picker.append(button,out);else picker.append(button);}row.append(label,picker);$('characterOptions').append(row);}
 $('characterTurn').onclick=()=>{previewLeft=!previewLeft;$('characterTurn').textContent=previewLeft?'Face Right':'Face Left';paintCharacter();};
 $('characterPose').onclick=()=>{previewWalk=!previewWalk;$('characterPose').textContent=previewWalk?'Idle Preview':'Walk Preview';paintCharacter();};
 $('characterReset').onclick=()=>{draft=JSON.parse(savedDraft);paintCharacter();};
 $('characterEditorBack').onclick=()=>{editing=false;stopPreview();render();$('accountBody').scrollTop=0;message('Character changes are only used after you save.');};
 $('characterSave').onclick=()=>action(async()=>{await setUser(await api('skin','POST',{appearance:CharacterParts.clean(draft)}));savedDraft=JSON.stringify(draft);paintCharacter();message('Character saved. Other players see it when you reconnect.');});
 $('accountEditSkin').onclick=()=>{if(MP.active())return;draft=user?.appearance?CharacterParts.clean(user.appearance):CharacterParts.defaults();savedDraft=JSON.stringify(draft);editing=true;previewWalk=false;previewLeft=false;$('characterPose').textContent='Walk Preview';$('characterTurn').textContent='Face Left';$('characterAdvanced').open=false;pixels.clearRect(0,0,40,1120);if(currentSkin)pixels.drawImage(currentSkin,0,0);frame=0;$('skinFrame').value='0';render();drawEditor();paintCharacter();$('accountBody').scrollTop=0;startPreview();};
 $('skinCopyAll').onclick=()=>{const data=pixels.getImageData(0,frame*56,40,56);for(let i=0;i<20;i++)pixels.putImageData(data,0,i*56);drawEditor();};$('skinClearFrame').onclick=()=>{pixels.clearRect(0,frame*56,40,56);drawEditor();};
 function download(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();}
 $('skinTemplate').onclick=()=>{const blank=document.createElement('canvas');blank.width=40;blank.height=1120;download(blank.toDataURL('image/png'),'Webrraria-Skin-Template.png');};
 $('skinUpload').onchange=()=>action(async()=>{const f=$('skinUpload').files[0];if(!f)return;if(f.size>65536)throw Error('Use a PNG skin up to 64 KB.');const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f);});const im=await image(data);pixels.clearRect(0,0,40,1120);pixels.drawImage(im,0,0);editing=true;$('characterAdvanced').open=true;render();drawEditor();message('Skin loaded into the editor. Choose Save Skin to use it.');$('skinUpload').value='';});
 $('skinSave').onclick=()=>action(async()=>{const data=pixels.getImageData(0,0,40,1120).data;let visible=false;for(let i=3;i<data.length;i+=4)if(data[i]){visible=true;break;}if(!visible)throw Error('Draw a skin before saving it.');await setUser(await api('skin','POST',{skin:sheet.toDataURL('image/png')}));paintCharacter();message('Skin saved. Other players see it when you reconnect.');});
 window.addEventListener('pagehide',stopPreview);
 $('accountDefaultSkin').onclick=()=>action(async()=>{await setUser(await api('skin','POST',{skin:null}));message('Default skin restored.');});
 async function init(){const saved=stored();if(!saved||typeof saved.token!=='string'||saved.expiresAt<=Date.now()){persist();return;}token=saved.token;expiresAt=saved.expiresAt;remember=!!saved.remember;try{await setUser(await api('me'));message('Signed in as '+user.username+'.');}catch(e){message(e.message);}render();}
 async function getPublicKey(){if(!publicKeyPromise)publicKeyPromise=api('key','GET',undefined,false).then(r=>crypto.subtle.importKey('jwk',r.key,{name:'ECDSA',namedCurve:'P-256'},false,['verify'])).catch(e=>{publicKeyPromise=null;throw e;});return publicKeyPromise;}
 async function verify(proof,audience){if(!proof||typeof proof.payload!=='string'||proof.payload.length>1500||typeof proof.signature!=='string'||proof.signature.length>100)throw Error('Invalid account identity.');let claims;try{claims=JSON.parse(new TextDecoder().decode(from64(proof.payload)));}catch{throw Error('Invalid account identity.');}if(!claims||claims.v!==1||claims.aud!==audience||!/^[A-Za-z0-9_-]{22}$/.test(claims.sub)||!/^[A-Za-z0-9_]{3,20}$/.test(claims.name)||!Number.isFinite(claims.exp)||!Number.isFinite(claims.iat)||claims.exp<Date.now()||claims.iat>Date.now()+30000||claims.exp-claims.iat!==120000)throw Error('The account identity expired or belongs to a different connection.');if(!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},await getPublicKey(),from64(proof.signature),enc.encode(proof.payload)))throw Error('The account identity could not be verified.');const profile=await checkPeer({id:claims.sub,username:claims.name});const role=claims.role||'player';if(!['player','admin'].includes(role)||role!==(profile.role||'player'))throw Error('The account role changed. Reconnect to refresh it.');return {id:claims.sub,username:claims.name,skinHash:claims.skinHash||'',role};}
 async function checkPeer(identity){const p=await api('profile/'+identity.id,'GET',undefined,false);if(p.id!==identity.id||p.username!==identity.username)throw Error('The account profile did not match.');return p;}
 async function peerSkin(identity){if(!identity.skinHash)return null;try{const p=await api('profile/'+identity.id,'GET',undefined,false);if(p.id!==identity.id||p.username!==identity.username||p.skinHash!==identity.skinHash)return null;return p.appearance?CharacterParts.build(CharacterParts.clean(p.appearance)):await image(p.skin);}catch{return null;}}
 async function refresh(){if(!user)return null;try{await setUser(await api('me'));return user;}catch(e){if([401,403].includes(e.status)&&MP.active())MP.leave(false,'Your account session ended. Sign in again to reconnect.');throw e;}}
 setInterval(()=>{if(user&&!busy&&!document.hidden)refresh().catch(()=>{});},60000);
 return {refresh,checkPeer,moderate:(path,method='GET',data)=>api('admin/'+path,method,data),init(){readyPromise=init();return readyPromise;},ready:()=>readyPromise,render,user:()=>user?{id:user.id,username:user.username,role:user.role}:null,skin:characterSheet,nonce:()=>url64(crypto.getRandomValues(new Uint8Array(16))),ticket:audience=>api('ticket','POST',{audience}),verify,peerSkin,inspect:()=>({signedIn:!!user,id:user?.id||null,username:user?.username||null,skinHash:user?.skinHash||'',appearance:user?.appearance?{...user.appearance}:null,role:user?.role||'player',editing,busy})};
})();

const MP=(()=>{
  const $=id=>document.getElementById(id);
  const protocol=2,maxPacket=48000;
  let pc=null,channel=null,role='none',ready=false,remote=null,backup=null,received=null;
  let lastAccountCheck=0;
  let generation=0,lastSend=0,lastReceive=0,requestNumber=0,lastRequest=0,pending=null,busy=false;
  let localName='Player',remoteName='Friend';
  let localAccount=null,remoteAccount=null,remoteSkin=null,peerNonce='',ownNonce='',peerHello=false,peerVerified=false,peerWantsAccount=false,receiveQueue=Promise.resolve(),lastProfileAt=0,lastProfileSaved=0,profileSeq=0,lastProfileSeq=0,saveWaiter=null,closingPromise=null;
  // Small room-code signaling client. Gameplay continues on the existing P2P channel.
  let roomCode='',roomToken='',roomBase='',roomMode='',roomDeadline=0,roomPollTimer=0,answerApplied=false,roomPollErrors=0,roomNegotiatingAt=0;
  let relayLease=null,joinedOffer=null,relayState='idle',relayRoute='unknown',relayExpires='',routeCheckAt=0;
  function relayStatus(state){relayState=state;}
  function validLease(result,base){
    if(!result||!/^[A-HJ-NP-Z2-9]{6}$/.test(result.code)||typeof result.token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(result.token)||!Number.isFinite(result.expiresInMs)||result.expiresInMs<=0)throw Error('Invalid relay session.');
    return {code:result.code,token:result.token,base,deadline:performance.now()+Math.min(600000,result.expiresInMs)};
  }
  function closeRelayLease(lease){if(!lease)return;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3000);fetch(lease.base+'/rooms/'+lease.code,{method:'DELETE',headers:{Authorization:'Bearer '+lease.token},signal:controller.signal,keepalive:true,credentials:'omit',referrerPolicy:'no-referrer'}).catch(()=>{}).finally(()=>clearTimeout(timer));}
  function relayIce(data){
    const expires=Date.parse(data?.expiresAt);if(!Number.isFinite(expires)||expires<Date.now()+30000||expires>Date.now()+3900000||!Array.isArray(data.iceServers)||data.iceServers.length>8)throw Error('Invalid relay response.');
    let turn=false;const servers=data.iceServers.map(entry=>{
      if(!entry||typeof entry!=='object')throw Error('Invalid relay response.');
      const urls=Array.isArray(entry.urls)?entry.urls:[entry.urls];if(!urls.length||urls.length>12)throw Error('Invalid relay response.');
      let relay=false;for(const url of urls){if(typeof url!=='string'||url.length>256||!/^(stun|turn|turns):[a-z0-9.\[\]:-]+(?::\d+)?(?:\?transport=(udp|tcp))?$/i.test(url))throw Error('Invalid relay response.');if(/^turns?:/i.test(url))relay=true;}
      const out={urls};if(relay){if(typeof entry.username!=='string'||!entry.username.length||entry.username.length>256||typeof entry.credential!=='string'||!entry.credential.length||entry.credential.length>512||/[\x00-\x1f\x7f]/.test(entry.username+entry.credential))throw Error('Invalid relay response.');out.username=entry.username;out.credential=entry.credential;turn=true;}return out;
    });if(!turn)throw Error('No TURN relay in the server response.');return {servers,expiresAt:data.expiresAt};
  }
  async function checkRoute(current){
    if(pc!==current||typeof current.getStats!=='function')return;
    try{const stats=await current.getStats();if(pc!==current)return;let pair;for(const item of stats.values())if(item.type==='transport'&&item.selectedCandidatePairId)pair=stats.get(item.selectedCandidatePairId);if(!pair)for(const item of stats.values())if(item.type==='candidate-pair'&&item.state==='succeeded'&&(item.nominated||item.selected)){pair=item;break;}
      if(!pair)return;const local=stats.get(pair.localCandidateId),remote=stats.get(pair.remoteCandidateId);if(!local||!remote)return;
      relayRoute=local.candidateType==='relay'||remote.candidateType==='relay'?'relay':'direct';
      relayStatus(relayRoute==='direct'&&relayState==='unavailable'?'unavailable':'connected');
    }catch{}
  }
  const signalRequests=new Set();
  function normalizeService(value){
    const text=String(value||'').trim();if(!text)return '';
    let u;try{u=new URL(text);}catch{throw Error('Enter the HTTPS address of your room service.');}
    if(u.username||u.password||u.search||u.hash||!(u.protocol==='https:'||u.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(u.hostname)))throw Error('Use an HTTPS service URL, without passwords, query text, or a fragment.');
    return u.href.replace(/\/+$/,'');
  }
  function configuredService(){try{
    let value=normalizeService(gameStorage.getItem('webrraria-signaling-url')||DEFAULT_SIGNALING_URL);
    // Migrate only our old built-in address; preserve other custom services.
    if(value==='https://webrraria-rooms.webrraria.workers.dev'){try{gameStorage.removeItem('webrraria-signaling-url');}catch{}value=DEFAULT_SIGNALING_URL;}
    return value;
  }catch{return '';}}
  async function signalRequest(method,path,data=null,auth='',base=roomBase){
    const controller=new AbortController();signalRequests.add(controller);const timer=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(base+path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(auth?{Authorization:'Bearer '+auth}:{})},...(data?{body:JSON.stringify(data)}:{}),signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
      const raw=await response.text();if(raw.length>100000)throw Error('Invalid response from the room service.');let result;try{result=JSON.parse(raw);}catch{throw Error('That address is not a Webrraria room service.');}
      if(!response.ok){const error=Error(typeof result.error==='string'?result.error:'Room service unavailable.');error.httpStatus=response.status;throw error;}
      return result;
    }catch(e){if(e.name==='AbortError')throw Error('The room service took too long to respond. Try again, or use Manual Invite / Manual Answer.');if(e instanceof TypeError)throw Error('Could not reach the room service. Check its address and open the actual game site, not an embedded preview.');throw e;}
    finally{clearTimeout(timer);signalRequests.delete(controller);}
  }
  function stopSignaling(){
    clearTimeout(roomPollTimer);roomPollTimer=0;for(const controller of signalRequests)controller.abort();signalRequests.clear();
    const lease=relayLease;relayLease=null;joinedOffer=null;relayExpires='';relayRoute='unknown';routeCheckAt=0;
    if(lease&&lease.code!==roomCode)closeRelayLease(lease);
    const old={code:roomCode,token:roomToken,base:roomBase};roomCode=roomToken=roomBase=roomMode='';roomDeadline=0;roomPollErrors=0;answerApplied=false;roomNegotiatingAt=0;
    if(old.code&&old.token&&old.base){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3000);fetch(old.base+'/rooms/'+old.code,{method:'DELETE',headers:{Authorization:'Bearer '+old.token},signal:controller.signal,keepalive:true,credentials:'omit',referrerPolicy:'no-referrer'}).catch(()=>{}).finally(()=>clearTimeout(timer));}
  }
  function roomAction(fn){if(!ROOM_CODES_ENABLED){status('Six-character room codes are WIP. Use Manual Invite and Manual Answer.');return;}return run(fn);}
  function roomUI(){
    const service=configuredService();$('mpHostRoom').disabled=!ROOM_CODES_ENABLED||busy||active()||!service||!$('mpWorld').value;$('mpJoinRoom').disabled=!ROOM_CODES_ENABLED||busy||active()||gameStarted||!service;
    $('mpRoomInput').disabled=!ROOM_CODES_ENABLED||busy||active();$('mpServiceURL').disabled=!ROOM_CODES_ENABLED||busy||active();$('mpSaveService').disabled=!ROOM_CODES_ENABLED||busy||active();
    $('mpRoomCode').value=roomCode;$('mpCopyRoom').disabled=!roomCode||busy;
    $('mpRoomCodeLabel').textContent=guest()?'Room you are joining':'Your room code';
    $('mpManual').hidden=roomMode==='code'&&active();$('mpAccept').disabled=busy||roomMode==='code'||role!=='host'||ready||pc?.signalingState!=='have-local-offer';
    $('mpServiceNote').hidden=!!service;$('mpConnectionSetup').hidden=active();
    $('mpServiceNote').textContent=service?'Room service configured. Both players must use this same service.':'Room codes need a one-time service setup. Open Connection Setup below, or use Manual Connection for now.';
    if(!active())$('mpRoomExpiry').textContent='Codes expire after 10 minutes and admit one guest.';
  }
  function rememberRoom(result,codeValue,base){
    if(!/^[A-HJ-NP-Z2-9]{6}$/.test(codeValue)||typeof result.token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(result.token)||!Number.isFinite(result.expiresInMs)||result.expiresInMs<=0)throw Error('Invalid room response.');
    roomCode=codeValue;roomToken=result.token;roomBase=base;roomDeadline=performance.now()+Math.min(600000,result.expiresInMs);roomUI();
  }
  function roomDescription(value,type){if(!value||value.type!==type||typeof value.sdp!=='string'||value.sdp.length>80000||!value.sdp.startsWith('v=0'))throw Error('Invalid room connection details.');return {type,sdp:value.sdp};}
  function roomError(message){leave(false,message);Menu.show('multiplayer');}
  function pollRoom(current,operation){
    clearTimeout(roomPollTimer);
    roomPollTimer=setTimeout(async()=>{
      if(pc!==current||operation!==generation||!roomToken||channel?.readyState==='open')return;
      try{
        const result=await signalRequest('GET','/rooms/'+roomCode,null,roomToken);if(pc!==current||operation!==generation||channel?.readyState==='open')return;
        roomPollErrors=0;
        if(result.status==='closed')throw Error('The other player closed the room. Create a new one.');
        if(role==='host'&&result.answer&&!answerApplied){answerApplied=true;await current.setRemoteDescription(roomDescription(result.answer,'answer'));if(pc!==current||operation!==generation||channel?.readyState==='open')return;roomNegotiatingAt=performance.now();status('Connecting to your friend…');}
        else if(role==='host'&&result.status==='joining'){if(!roomNegotiatingAt)roomNegotiatingAt=performance.now();status('Your friend is joining…');}
        if(roomNegotiatingAt&&performance.now()-roomNegotiatingAt>90000)throw Error('The connection did not finish. Create a fresh room and try again.');
      }catch(e){
        if(pc!==current||operation!==generation||channel?.readyState==='open')return;
        roomPollErrors++;
        if(e.httpStatus&&e.httpStatus<500||roomPollErrors>=3){roomError(e.message);return;}
        status('Room service temporarily unavailable. Retrying…');
      }
      if(pc===current&&operation===generation&&channel?.readyState!=='open')pollRoom(current,operation);
    },1200);
  }
  function signalingConnected(){
    if(roomMode!=='code'&&relayLease){closeRelayLease(relayLease);relayLease=null;}
    clearTimeout(roomPollTimer);roomPollTimer=0;
    if(role==='host'&&roomMode==='code'&&roomToken)signalRequest('POST','/rooms/'+roomCode+'/connected',{},roomToken).catch(()=>{});
    if(roomMode==='code')$('mpRoomExpiry').textContent='Connected. Room full.';
  }
  function roomTick(now){
    if(!roomCode||!active()||channel?.readyState==='open')return;
    const seconds=Math.max(0,Math.ceil((roomDeadline-now)/1000));$('mpRoomExpiry').textContent='Code expires in '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
    if(seconds===0)roomError('The room code expired. Host a new room for a fresh code.');
  }
  $('mpServiceURL').value=configuredService();
  $('mpSaveService').addEventListener('click',()=>roomAction(async()=>{
    const base=normalizeService($('mpServiceURL').value);if(!base){gameStorage.removeItem('webrraria-signaling-url');$('mpServiceURL').value=DEFAULT_SIGNALING_URL;status('Custom room service cleared.');return;}
    status('Checking room service…');const health=await signalRequest('GET','/health',null,'',base);if(health.service!=='Webrraria Rooms'||health.apiVersion!==1||health.gameProtocol!==protocol)throw Error('This room service is not compatible with this game version.');
    gameStorage.setItem('webrraria-signaling-url',base);$('mpServiceURL').value=base;status('Room service ready. You can host or join using a six-character code.');
  }));
  $('mpHostRoom').addEventListener('click',()=>roomAction(async()=>{
    const base=configuredService();if(!base)throw Error('Set up the room service first.');const id=$('mpWorld').value;if(!id)throw Error('Create a world in Single Player first.');
    if(inventoryOpen()&&!storeInventoryCursor())throw Error('Place your held inventory item first.');
    WorldStore.play(id);Menu.show('multiplayer');if(trees.length>WORLD_W)throw Error('This world has too many trees for multiplayer.');
    const current=await setup('host','','code');roomMode='code';roomBase=base;enemies=[];attach(current.createDataChannel('webrraria',{ordered:true}));status('Creating your room…');
    await current.setLocalDescription(await current.createOffer());const offer=decode(await gathered(current),'offer');
    if(relayLease){await signalRequest('POST','/rooms/'+relayLease.code+'/offer',{offer},relayLease.token,base);if(pc!==current)throw Error('Room cancelled.');rememberRoom({token:relayLease.token,expiresInMs:relayLease.deadline-performance.now()},relayLease.code,base);}
    else{const result=await signalRequest('POST','/rooms',{protocol,offer},'',base);if(pc!==current)throw Error('Room cancelled.');rememberRoom(result,result.code,base);}
    if(pc!==current)throw Error('Room cancelled.');status('Share code '+roomCode+' with your friend. They enter it and click Join Room.');pollRoom(current,generation);
  }));
  $('mpJoinRoom').addEventListener('click',()=>roomAction(async()=>{
    if(gameStarted)throw Error('Save & Exit your own world before joining.');const base=configuredService();if(!base)throw Error('Set up the room service first.');
    const code=$('mpRoomInput').value.toUpperCase().replace(/[\s-]/g,'');if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code))throw Error('Enter the six-character room code from your friend.');
    backup=JSON.parse(JSON.stringify(captureGame()));const current=await setup('guest',code,'code');roomMode='code';roomBase=base;current.ondatachannel=e=>{if(pc===current)attach(e.channel);};status('Joining room '+code+'…');
    await current.setRemoteDescription(roomDescription(joinedOffer,'offer'));await current.setLocalDescription(await current.createAnswer());const answer=decode(await gathered(current),'answer');await signalRequest('POST','/rooms/'+code+'/answer',{answer},roomToken,base);
    if(pc!==current)throw Error('Join cancelled.');if(channel?.readyState==='open')return;roomNegotiatingAt=performance.now();status('Connecting to your friend…');pollRoom(current,generation);
  }));
  $('mpCopyRoom').addEventListener('click',async()=>{if(!roomCode)return;try{await navigator.clipboard.writeText(roomCode);status('Room code copied. Send it to your friend.');}catch{$('mpRoomCode').focus();$('mpRoomCode').select();status('Code selected. Copy these six characters and send them to your friend.');}});
  $('mpRoomInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.repeat){e.preventDefault();if(!$('mpJoinRoom').disabled)$('mpJoinRoom').click();}});
  window.addEventListener('pagehide',()=>{if(roomMode==='code')stopSignaling();});

  // Multiplayer chat is session-only; the host assigns sender names and order.
  let friendlyFire=false,guestHealth=10,combatSeq=0,lastHealthSeq=0;
  let lastAttack={host:-Infinity,guest:-Infinity},hurtUntil={host:0,guest:0},attackSeq=0,lastGuestAttack=0;
  let localAttackAt=-Infinity,lastHealAt=-Infinity,chatSeq=0,lastChatSeq=0,lastLocalChat=-Infinity,lastGuestChat=-Infinity,chatOpen=false;
  function cleanChat(text){return typeof text==='string'?text.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').replace(/\s+/g,' ').trim().slice(0,240):'';}
  function chatLine(from,text,system=false){
    const row=document.createElement('div');row.className=system?'chat-system':'chat-line';
    const sender=document.createElement('strong');sender.textContent=system?'':from+': ';row.append(sender,document.createTextNode(text));
    $('chatLog').append(row);while($('chatLog').children.length>100)$('chatLog').firstChild.remove();$('chatLog').scrollTop=$('chatLog').scrollHeight;
  }
  function closeChat(){chatOpen=false;$('chatToggle').setAttribute('aria-expanded','false');$('chatForm').hidden=true;$('chatPanel').classList.remove('chat-open');$('chatLog').scrollTop=$('chatLog').scrollHeight;if(document.activeElement===$('chatInput'))$('chatInput').blur();}
  function openChat(){if(!connected())return;chatOpen=true;$('chatToggle').setAttribute('aria-expanded','true');$('chatForm').hidden=false;$('chatPanel').classList.add('chat-open');for(const k of Object.keys(keys))keys[k]=false;mouse.downL=mouse.downR=false;$('chatInput').focus();}
  function resetSocial(){friendlyFire=false;guestHealth=10;combatSeq=lastHealthSeq=0;attackSeq=lastGuestAttack=0;lastAttack={host:-Infinity,guest:-Infinity};hurtUntil={host:0,guest:0};localAttackAt=lastHealAt=-Infinity;chatSeq=lastChatSeq=0;lastLocalChat=lastGuestChat=-Infinity;closeChat();$('chatLog').replaceChildren();$('chatInput').value='';$('chatHint').textContent='Enter to send. Esc to close.';}
  function socialUI(){
    $('chatPanel').hidden=!connected();$('pvpControl').hidden=!connected();
    $('mpFriendlyFire').checked=friendlyFire;$('mpFriendlyFire').disabled=role!=='host'||!connected();
    $('pvpToggle').disabled=role!=='host';$('pvpToggle').textContent='Friendly Fire: '+(friendlyFire?'ON':'OFF')+(role==='host'?'':' (host controls)');
    $('pvpToggle').classList.toggle('pvp-on',friendlyFire);$('pvpToggle').setAttribute('aria-pressed',String(friendlyFire));
    if(!connected())closeChat();
  }
  function announceChat(text){const from=localAccount?localName:localName+' (Guest)';const message={type:'chat',n:++chatSeq,from,text};chatLine(from,text);send(message);}
  function submitChat(e){
    e.preventDefault();if(!connected())return;const text=cleanChat($('chatInput').value);if(!text)return;
    if(performance.now()-lastLocalChat<500){$('chatHint').textContent='Please wait a moment before sending again.';return;}
    lastLocalChat=performance.now();$('chatInput').value='';$('chatHint').textContent='Enter to send. Esc to close.';
    if(role==='host')announceChat(text);else send({type:'chat-send',text});$('chatInput').focus();
  }
  function setFriendlyFire(value){
    if(role!=='host'||!connected())return;friendlyFire=!!value;send({type:'rules',friendlyFire});socialUI();chatLine('','Host turned friendly fire '+(friendlyFire?'ON. Sword hits can now hurt players.':'OFF.'),true);
  }
  function applyOwnHit(m){
    if(m.dead){respawn();player.hurtTime=1.5;for(const k of Object.keys(keys))keys[k]=false;mouse.downL=mouse.downR=false;toast('Defeated by '+m.attacker+' - respawned!');}
    else{player.health=m.health;player.hurtTime=.65;player.vy=-2;updateHearts();SFX.play('hurt');toast(m.attacker+' hit you for '+m.damage);}
  }
  function attemptHit(attacker){
    if(!connected()||!friendlyFire||!remote)return;
    const now=performance.now(),victim=attacker==='host'?'guest':'host',a=attacker==='host'?{...player,held:player.hotbar[player.selected]?.id}:remote;
    const target=victim==='host'?player:remote,weapon=ITEMS[a.held];
    if(weapon?.tool!=='sword'||now-lastAttack[attacker]<450)return;
    lastAttack[attacker]=now;
    if(now<hurtUntil[victim]||Math.abs(target.y-a.y)>40||Math.hypot(target.x-a.x,target.y-a.y)>64||(target.x-a.x)*a.dir< -8)return;
    const damage=Math.max(1,Math.ceil((weapon.damage||7)/4)),health=Math.max(0,(victim==='host'?player.health:guestHealth)-damage),dead=health<=0;
    const m={type:'pvp-hit',n:++combatSeq,victim,health,damage,dead,attacker:attacker==='host'?localName:remoteName};
    hurtUntil[victim]=now+(dead?1500:650);
    if(victim==='host')applyOwnHit(m);else{guestHealth=dead?10:health;remote.health=guestHealth;}
    send(m);if(dead)chatLine('',m.attacker+' defeated '+(victim==='host'?localName:remoteName)+'.',true);
  }
  function combat(now){
    if(!connected()||!friendlyFire||chatOpen||!mouse.downL||ITEMS[player.hotbar[player.selected]?.id]?.tool!=='sword')return;
    player.swing=.45+.5*Math.abs(Math.sin(now/100));
    if(now-localAttackAt<450)return;localAttackAt=now;
    if(role==='host')attemptHit('host');else{send({type:'state',p:playerState()});send({type:'attack',n:++attackSeq});}
  }
  function canHeal(){return !connected()||performance.now()-lastHealAt>=500;}
  function healed(id){if(!connected())return;lastHealAt=performance.now();if(guest())send({type:'pvp-heal',item:id});}
  function socialReceive(m){
    if(m.type==='rules'&&guest()&&connected()&&typeof m.friendlyFire==='boolean'){const changed=friendlyFire!==m.friendlyFire;friendlyFire=m.friendlyFire;socialUI();if(changed)chatLine('','Host turned friendly fire '+(friendlyFire?'ON. Sword hits can now hurt players.':'OFF.'),true);return true;}
    if(m.type==='chat-send'&&role==='host'&&connected()){
      if(typeof m.text!=='string'||m.text.length>240||performance.now()-lastGuestChat<500)return true;
      const text=cleanChat(m.text);if(!text)return true;lastGuestChat=performance.now();chatLine(remoteName,text);send({type:'chat',n:++chatSeq,from:remoteName,text});return true;
    }
    if(m.type==='chat'&&guest()&&connected()){
      if(!Number.isInteger(m.n)||m.n<=lastChatSeq||typeof m.from!=='string'||m.from.length>28||typeof m.text!=='string'||m.text.length>240)return true;
      const own=localAccount?localName:localName+' (Guest)';if(m.from!==remoteName&&m.from!==own&&m.from!==remoteName.replace(/ \(Guest\)$/,''))return true;lastChatSeq=m.n;chatLine(m.from===own?own:remoteName,cleanChat(m.text));return true;
    }
    if(m.type==='attack'&&role==='host'&&connected()){
      if(Number.isInteger(m.n)&&m.n>lastGuestAttack&&m.n<1000000000){lastGuestAttack=m.n;attemptHit('guest');}return true;
    }
    if(m.type==='pvp-heal'&&role==='host'&&connected()){
      const healing=ITEMS[m.item]?.heal;if(!Number.isInteger(healing)||healing<1||healing>10)return true;const now=performance.now();if(now-(lastAttack.heal||0)<500)return true;lastAttack.heal=now;guestHealth=Math.min(10,guestHealth+healing);if(remote)remote.health=guestHealth;send({type:'pvp-health',n:++combatSeq,health:guestHealth});return true;
    }
    if(m.type==='pvp-health'&&guest()&&connected()){
      if(Number.isInteger(m.n)&&m.n>lastHealthSeq&&Number.isInteger(m.health)&&m.health>=1&&m.health<=10){lastHealthSeq=m.n;player.health=m.health;updateHearts();}return true;
    }
    if(m.type==='pvp-hit'&&guest()&&connected()){
      if(!Number.isInteger(m.n)||m.n<=lastHealthSeq||!['host','guest'].includes(m.victim)||!Number.isInteger(m.health)||m.health<0||m.health>10||!Number.isInteger(m.damage)||m.damage<1||m.damage>Math.ceil(Math.max(...Object.values(ITEMS).map(it=>it.damage||0))/4)||typeof m.dead!=='boolean'||m.dead!==(m.health===0)||typeof m.attacker!=='string')return true;
      lastHealthSeq=m.n;m.attacker=name(m.attacker);
      if(m.victim==='guest')applyOwnHit(m);else if(remote)remote.health=m.dead?10:m.health;
      if(m.dead)chatLine('',m.attacker+' defeated '+(m.victim==='guest'?localName:remoteName)+'.',true);return true;
    }
    return false;
  }
  $('chatForm').addEventListener('submit',submitChat);$('chatToggle').addEventListener('click',()=>chatOpen?closeChat():openChat());
  $('mpFriendlyFire').addEventListener('change',e=>setFriendlyFire(e.target.checked));$('pvpToggle').addEventListener('click',()=>setFriendlyFire(!friendlyFire));
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&chatOpen){e.preventDefault();e.stopImmediatePropagation();closeChat();return;}
    if(e.key==='Enter'&&e.target.closest('#chatForm button'))return;
    if(!e.repeat&&connected()&&!e.target.matches('input,textarea,select')&&!inventoryOpen()&&document.getElementById('menu').style.display==='none'&&['Enter','t','T'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();openChat();}
  },true);

  function active(){return role!=='none';}
  function guest(){return role==='guest';}
  function connected(){return ready&&channel?.readyState==='open';}
  function status(text){$('mpStatus').textContent=text;}
  function name(value){return String(value||'Player').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'').trim().slice(0,20)||'Player';}
  function syncUI(){
    const select=$('mpWorld'),selected=select.value||WorldStore.active();select.replaceChildren();
    for(const record of WorldStore.list()){const option=document.createElement('option');option.value=record.id;option.textContent=record.name;select.append(option);}
    if(selected)select.value=selected;
    $('mpHost').disabled=busy||active()||!select.value;
    $('mpJoin').disabled=busy||active()||gameStarted;
    $('mpAccept').disabled=busy||role!=='host'||ready||pc?.signalingState!=='have-local-offer';
    $('mpWorld').disabled=active()||busy;$('mpName').disabled=active()||busy||!!Accounts.user();if(!active()&&Accounts.user())$('mpName').value=Accounts.user().username;
    $('mpRemoteCode').disabled=busy||ready;
    $('mpCopy').disabled=!$('mpLocalCode').value;
    $('mpLeave').hidden=!active();$('mpResume').hidden=!gameStarted;
    $('mpBadge').hidden=!active();
    if(active())$('mpBadge').textContent=(connected()?'2 / 2. '+remoteName:'1 / 2. Waiting')+'. '+(guest()?'Guest':'Host');
    for(const id of ['pauseSaveBtn','inventorySaveBtn','btnSave'])$(id).disabled=guest();
    $('pauseExitBtn').textContent=guest()?'Leave Session':'Save & Exit';socialUI();roomUI();
  }
  function send(message){
    if(channel?.readyState!=='open')return false;
    const text=JSON.stringify(message);
    if(text.length>maxPacket||channel.bufferedAmount>1024*1024)throw Error('Connection is too slow. Please reconnect.');
    channel.send(text);return true;
  }
  function playerState(){return {x:player.x,y:player.y,vx:player.vx,dir:player.dir,onGround:!!player.onGround,swing:player.swing,style:characterStyle,health:Math.max(1,Math.min(10,player.health)),held:player.hotbar[player.selected]?.id||null};}
  function readPlayer(p){
    if(!p||![p.x,p.y,p.vx,p.swing].every(Number.isFinite)||p.x<0||p.y<0||p.x>WORLD_W*TILE||p.y>WORLD_H*TILE)throw Error('Invalid player state.');
    return {x:p.x,y:p.y,health:Number.isInteger(p.health)?Math.max(1,Math.min(10,p.health)):10,vx:Math.max(-15,Math.min(15,p.vx)),dir:p.dir===-1?-1:1,onGround:!!p.onGround,swing:Math.max(0,Math.min(1,p.swing)),style:Number.isInteger(p.style)&&p.style>=0&&p.style<3?p.style:0,held:Object.hasOwn(ITEMS,p.held)?p.held:null};
  }
  function applyCells(cells,treeData){
    if(!Array.isArray(cells)||cells.length>WORLD_H)throw Error('Invalid tile update.');
    for(const cell of cells)if(!Array.isArray(cell)||cell.length!==3||!cell.every(Number.isInteger)||cell[0]<0||cell[0]>=WORLD_W||cell[1]<0||cell[1]>=WORLD_H||!Object.hasOwn(TILE_NAME,cell[2]))throw Error('Invalid tile coordinates.');
    if(treeData){if(!Array.isArray(treeData)||treeData.length>WORLD_W)throw Error('Invalid tree update.');for(const t of treeData)if(!t||![t.x,t.top,t.base].every(Number.isInteger)||t.x<0||t.x>=WORLD_W||t.top<0||t.top>t.base||t.base>=WORLD_H)throw Error('Invalid tree update.');}
    for(const [x,y,t]of cells)world[y][x]=t;
    if(treeData)trees=treeData.map(t=>({x:t.x,top:t.top,base:t.base,crown:!!t.crown,variant:Number.isInteger(t.variant)?Math.abs(t.variant)%3:0}));
    updateLightMap(cells);updateMinimap();
  }
  function rewardsFor(cells,cacheLoot=null){for(const [x,y,t]of cells){if(t===T.SUPPLY_CACHE)dropContainerLoot(cacheLoot,x,y);else spawnDrop(t,x,y);Achievements.note('mined');if(t===T.TRUNK)Achievements.note('wood');if(t===T.COPPER)Achievements.note('copper');if(t===T.IRON)Achievements.note('iron');}}
  function applyEdit(action,actor){
    const {kind,x,y,expected,id}=action;
    if(!['mine','place'].includes(kind)||![x,y,expected].every(Number.isInteger)||x<0||y<0||x>=WORLD_W||y>=WORLD_H)return null;
    if(world[y][x]!==expected||Math.hypot(x*TILE+8-(actor.x+player.w/2),y*TILE+8-(actor.y+player.h/2))>128)return null;
    const cells=[],mined=[];let cacheLoot=null;
    if(kind==='mine'){
      if(expected===T.AIR)return null;
      if(expected===T.CHEST&&!Containers.canBreak(x,y))return null;
      if(Containers.isType(expected))cacheLoot=Containers.breakAt(x,y);
      cells.push([x,y,T.AIR]);mined.push([x,y,expected]);world[y][x]=T.AIR;
      if(expected===T.TRUNK){const tree=trees.find(t=>t.x===x&&y>=t.top&&y<=t.base);if(tree){for(let yy=tree.top;yy<y;yy++)if(world[yy][x]===T.TRUNK){cells.push([x,yy,T.AIR]);mined.push([x,yy,T.TRUNK]);world[yy][x]=T.AIR;}tree.crown=false;tree.top=y+1;trees=trees.filter(t=>t.top<=t.base);}}
    }else{
      const tile=ITEMS[id]?.tile;
      if(expected!==T.AIR||!Number.isInteger(tile)||!Containers.canPlace(x,y,tile,[player,remote]))return null;
      if(x===Math.floor((actor.x+player.w/2)/TILE)&&y===Math.floor((actor.y+player.h/2)/TILE))return null;
      // Do not put a solid block inside either player.
      if((SOLID.has(tile)||tile===T.CHEST)&&[player,remote].filter(Boolean).some(p=>x*TILE<p.x+player.w&&(x+1)*TILE>p.x&&y*TILE<p.y+player.h&&(y+1)*TILE>p.y))return null;
      let support=tile===T.TORCH||tile===T.PLATFORM;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(world[y+dy]?.[x+dx]!==undefined&&world[y+dy][x+dx]!==T.AIR)support=true;
      if(tile===T.TORCH?torchMount(x,y)<0:!support)return null;
      world[y][x]=tile;cells.push([x,y,tile]);
    }
    updateLightMap(cells);updateMinimap();
    send({type:'patch',cells,trees});
    SFX.play(kind==='mine'?materialSound(expected):'place',{x:x*TILE,y:y*TILE});
    return {mined,cacheLoot};
  }
  function reserve(id){const stack=player.hotbar[player.selected];if(!stack||stack.id!==id||stack.count<1)return false;if(!--stack.count)player.hotbar[player.selected]=null;updateHotbar();return true;}
  function refund(id){if(addToInventory(id,1))drops.push({id,x:player.x,y:player.y,vx:0,vy:-1,life:30});}
  function edit(kind,x,y,id=null){
    if(!connected())return; // Waiting rooms do not accept edits.
    if(pending)return;
    const action={kind,x,y,expected:world[y][x],id};
    if(kind==='place'&&!reserve(id))return;
    if(role==='host'){
      const result=applyEdit(action,player);
      if(!result){if(kind==='place')refund(id);return;}
      if(kind==='mine')rewardsFor(result.mined,result.cacheLoot);else{Achievements.note('placed');if(ITEMS[id].tile===T.TORCH)Achievements.note('torchesPlaced');}
    }else{
      pending={...action,n:++requestNumber,started:performance.now()};send({type:'edit',...action,n:pending.n});
    }
  }
  function freshPlayer(data){return {x:data.spawn.x,y:data.spawn.y,health:10,selected:0,hotbar:[{id:'pickaxe',count:1},{id:'axe',count:1},{id:'sword',count:1},{id:'dirt',count:150},{id:'wood',count:80},{id:'platform',count:40},{id:'torch',count:60},null,null,null],inv:Array(40).fill(null),cursor:null,cursorOrigin:null};}
  function worldSend(){
    const data=captureGame();let character=null;if(remoteAccount){character=GuestProfiles.get(remoteAccount)||freshPlayer(data);GuestProfiles.set(remoteAccount,character);guestHealth=character.health;}const text=JSON.stringify({...data,player:undefined,guestProfiles:undefined});
    if(text.length>2*1024*1024)throw Error('This world is too large for this multiplayer version.');
    send({type:'world-start',length:text.length});
    for(let at=0;at<text.length;at+=12000)send({type:'world-part',text:text.slice(at,at+12000)});
    send({type:'world-end',...(character?{character}:{})});
  }
  async function receive(event){
    const operation=generation,current=pc;const stillCurrent=()=>{if(operation!==generation||pc!==current)throw Error('Connection cancelled.');};
    try{
      if(typeof event.data!=='string'||event.data.length>maxPacket)throw Error('Invalid multiplayer message.');
      const m=JSON.parse(event.data);if(!m||typeof m.type!=='string')throw Error('Invalid multiplayer message.');
      lastReceive=performance.now();if(!peerVerified&&!['hello','identity'].includes(m.type))throw Error('The player identity has not been verified.');if(connected()&&Containers.receive(m,role,role==='host'?remote:null))return;if(socialReceive(m))return;
      if(m.type==='hello'){
        if(m.protocol!==protocol||m.content!==19)throw Error('Both players need Webrraria v0.17.4 for this update.');
        if(peerHello)throw Error('Duplicate connection greeting.');peerHello=true;
        if(typeof m.mods!=='string'||m.mods!==Mods.signature())throw Error('Both players must enable the same mod ZIPs before joining.');remoteName=name(m.name);
        if(m.accounts!==1){if(localAccount)throw Error('Update both players to use accounts, or sign out to join as a guest.');peerVerified=true;remoteName+=' (Guest)';if(role==='host')worldSend();syncUI();return;}
        if(typeof m.nonce!=='string'||!/^[A-Za-z0-9_-]{22}$/.test(m.nonce)||typeof m.authenticated!=='boolean')throw Error('Invalid account greeting.');peerNonce=m.nonce;peerWantsAccount=m.authenticated;
        const proof=localAccount?await Accounts.ticket(peerNonce):null;stillCurrent();send({type:'identity',...(proof?{proof}:{guest:true})});return;
      }
      if(m.type==='identity'){
        if(!peerHello||peerVerified)throw Error('Unexpected account identity.');
        if(peerWantsAccount){remoteAccount=await Accounts.verify(m.proof,ownNonce);stillCurrent();remoteName=remoteAccount.username;remoteSkin=await Accounts.peerSkin(remoteAccount);stillCurrent();}
        else {if(m.guest!==true||m.proof)throw Error('Invalid guest identity.');remoteName+=' (Guest)';}
        peerVerified=true;send({type:'state',p:playerState(),...(role==='host'?{time,day}:{})});if(role==='host')worldSend();syncUI();return;
      }
      if(!peerVerified)throw Error('The player identity has not been verified.');
      if(m.type==='character-save'&&role==='host'){
        if(!ready||!remoteAccount||!Number.isSafeInteger(m.n)||m.n<=lastProfileSeq||m.n>1e9)throw Error('Invalid character checkpoint.');lastProfileSeq=m.n;GuestProfiles.set(remoteAccount,{...m.character,health:guestHealth});
        if(m.flush||performance.now()-lastProfileSaved>4000){const saved=saveGame();lastProfileSaved=performance.now();send({type:'character-ack',n:m.n,saved});}return;
      }
      if(m.type==='character-ack'&&guest()){
        if(saveWaiter&&m.n>=saveWaiter.n){saveWaiter.resolve(m.saved===true);saveWaiter=null;}return;
      }
      if(m.type==='world-start'&&guest()&&!ready){if(!Number.isInteger(m.length)||m.length<1||m.length>2*1024*1024)throw Error('Invalid world transfer.');received={length:m.length,text:''};return;}
      if(m.type==='world-part'&&guest()&&!ready){if(!received||typeof m.text!=='string'||m.text.length>12000||received.text.length+m.text.length>received.length)throw Error('Invalid world transfer.');received.text+=m.text;return;}
      if(m.type==='world-end'&&guest()&&!ready){
        if(!received||received.text.length!==received.length)throw Error('World transfer was interrupted.');
        const input=JSON.parse(received.text);if(!input.spawn||!Array.isArray(input.trees)||input.trees.length>WORLD_W)throw Error('Invalid shared world.');
        const data=WorldStore.validate({...input,guestProfiles:undefined,player:localAccount&&peerVerified&&m.character?m.character:freshPlayer(input)});
        if(!loadGame(data))throw Error('Could not open the shared world.');
        received=null;enemies=[];ready=true;startGame();closeMenu();send({type:'ready'});send({type:'state',p:playerState()});status('Connected to '+remoteName+'.');checkpoint(true);syncUI();toast('Joined '+remoteName);return;
      }
      if(m.type==='ready'&&role==='host'){ready=true;enemies=[];send({type:'rules',friendlyFire});closeMenu();status('Connected to '+remoteName+'. Your browser saves the world.');syncUI();toast(remoteName+' joined!');return;}
      if(m.type==='state'){
        remote=readPlayer(m.p);if(role==='host')remote.health=guestHealth;
        if(guest()&&Number.isFinite(m.time)&&Number.isInteger(m.day)&&m.day>=1&&m.day<=100000){time=Math.max(0,Math.min(23999,m.time));day=m.day;}
        return;
      }
      if(m.type==='patch'&&guest()&&ready){applyCells(m.cells,m.trees);return;}
      if(m.type==='edit'&&role==='host'&&ready){
        if(!Number.isInteger(m.n)||m.n<=lastRequest||m.n>1000000000||!remote)throw Error('Invalid edit request.');
        lastRequest=m.n;const result=applyEdit(m,remote);send({type:'edit-result',n:m.n,ok:!!result,mined:result?.mined||[],cacheLoot:result?.cacheLoot||null});return;
      }
      if(m.type==='edit-result'&&guest()&&ready){
        if(!pending||m.n!==pending.n)return;
        const action=pending;pending=null;
        if(!m.ok){if(action.kind==='place')refund(action.id);toast('That block changed. Try again.');return;}
        if(action.kind==='mine'){
          if(!Array.isArray(m.mined)||m.mined.length>WORLD_H||m.mined.some(c=>!Array.isArray(c)||c.length!==3||!c.every(Number.isInteger)||c[0]<0||c[0]>=WORLD_W||c[1]<0||c[1]>=WORLD_H||c[2]===T.AIR||!Object.hasOwn(TILE_NAME,c[2])))throw Error('Invalid mining result.');
          if(m.cacheLoot!==null&&m.cacheLoot!==undefined&&(!Array.isArray(m.cacheLoot)||m.cacheLoot.length>40||m.cacheLoot.some(s=>!s||!Object.hasOwn(ITEMS,s.id)||!Number.isInteger(s.count)||s.count<1||s.count>stackLimit(s.id))))throw Error('Invalid cache loot.');
          rewardsFor(m.mined,m.cacheLoot);SFX.play(materialSound(action.expected),{x:action.x*TILE,y:action.y*TILE});
        }else{Achievements.note('placed');if(ITEMS[action.id].tile===T.TORCH)Achievements.note('torchesPlaced');SFX.play('place');}
        updateHotbar();return;
      }
    }catch(e){if(operation===generation&&pc===current)fail(e.message);}
  }
  function checkpoint(flush=false){if(!guest()||!ready||!localAccount||!peerVerified||channel?.readyState!=='open')return 0;const n=++profileSeq;send({type:'character-save',n,flush,character:{x:player.x,y:player.y,health:player.health,selected:player.selected,hotbar:player.hotbar,inv:inventory,cursor:inventoryCursor,cursorOrigin}});lastProfileAt=performance.now();return n;}
  async function leaveSafely(show=true){if(closingPromise)return closingPromise;closingPromise=(async()=>{let message='Session closed.';if(guest()&&ready&&localAccount&&channel?.readyState==='open'){try{const n=checkpoint(true);if(n){const saved=await new Promise(resolve=>{saveWaiter={n,resolve};setTimeout(()=>{if(saveWaiter?.n===n){saveWaiter=null;resolve(false);}},2500);});if(!saved)message='Left the session. The host did not confirm the latest character save.';}}catch{message='Left the session. The last checkpoint may be used when you return.';}}leave(show,message);})();try{await closingPromise;}finally{closingPromise=null;}}
  function leave(show=true,message='Session closed.'){
    if(!active()&&!pc)return;
    if(role==='host'&&remoteAccount&&GuestProfiles.has(remoteAccount.id)){const saved=GuestProfiles.get(remoteAccount);GuestProfiles.set(remoteAccount,{...saved,health:guestHealth});}
    const wasGuest=guest();generation++;stopSignaling();ready=false;received=null;remote=null;pending=null;
    const old=pc;pc=null;if(channel){channel.onclose=channel.onmessage=channel.onopen=null;channel.close();channel=null;}if(old){old.onconnectionstatechange=null;old.close();}
    role='none';resetSocial();busy=false;requestNumber=lastRequest=0;$('mpLocalCode').value='';$('mpRemoteCode').value='';
    if(wasGuest){document.getElementById('invOverlay').style.display='none';document.body.classList.remove('inventory-open');inventoryCursor=null;if(backup)loadGame(backup);gameStarted=false;}
    else if(gameStarted){saveGame();enemies=[];for(let i=0;i<10;i++)spawnSlime();}
    backup=null;localAccount=remoteAccount=remoteSkin=null;peerHello=peerVerified=false;ownNonce=peerNonce='';if(saveWaiter){saveWaiter.resolve(false);saveWaiter=null;}status(message);syncUI();if(show)Menu.show(wasGuest?'multiplayer':'pause');
  }
  function fail(message){leave(true,message);}
  async function setup(which,joinCode='',mode='manual'){
    Mods.assertMultiplayer();
    if(!window.RTCPeerConnection)throw Error('WebRTC is unavailable. Open the game in a current browser on HTTPS.');
    if(active())throw Error('Leave the current session first.');
    await Accounts.ready();if(active())throw Error('Leave the current session first.');
    localAccount=Accounts.user();remoteAccount=remoteSkin=null;peerHello=peerVerified=false;peerNonce='';ownNonce=Accounts.nonce();receiveQueue=Promise.resolve();profileSeq=lastProfileSeq=lastProfileAt=lastProfileSaved=0;
    resetSocial();role=which;roomMode=mode;localName=localAccount?localAccount.username:name($('mpName').value);gameStorage.setItem('webrraria-mp-name',localName);lastSend=lastReceive=performance.now();
    relayLease=null;joinedOffer=null;relayRoute='unknown';relayExpires='';const operation=generation,base=configuredService();
    let iceServers=[{urls:'stun:stun.l.google.com:19302'}];relayStatus('checking');syncUI();
    const stillCurrent=()=>{if(operation!==generation||role!==which)throw Error('Connection cancelled.');};
    if(mode==='code'&&which==='guest'){
      const result=await signalRequest('POST','/rooms/'+joinCode+'/join',{protocol},'',base);if(operation!==generation||role!==which){try{closeRelayLease(validLease({...result,code:joinCode},base));}catch{}}stillCurrent();
      relayLease=validLease({...result,code:joinCode},base);rememberRoom(result,joinCode,base);joinedOffer=result.offer;
    }else if(base){
      try{const result=await signalRequest('POST','/rooms/prepare',{protocol},'',base);if(operation!==generation||role!==which){try{closeRelayLease(validLease(result,base));}catch{}throw Error('Connection cancelled.');}
        relayLease=validLease(result,base);
      }catch(e){stillCurrent();relayStatus('unavailable');}
    }
    stillCurrent();
    if(relayLease){
      try{const data=await signalRequest('POST','/rooms/'+relayLease.code+'/ice',{protocol},relayLease.token,base);stillCurrent();const relay=relayIce(data);iceServers.push(...relay.servers);relayExpires=relay.expiresAt;relayStatus('available');}
      catch(e){stillCurrent();relayStatus('unavailable');}
    }else if(relayState==='checking')relayStatus('unavailable');
    stillCurrent();
    try{pc=new RTCPeerConnection({iceServers});}catch{pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});relayStatus('unavailable');}
    const current=pc;current.onconnectionstatechange=()=>{if(pc!==current)return;if(['failed','closed'].includes(current.connectionState))fail('The connection ended.');else if(current.connectionState==='disconnected')status('Connection interrupted. Keep both tabs open; waiting for it to recover…');else if(current.connectionState==='connected')checkRoute(current);};
    syncUI();return current;
  }
  function attach(dc){
    channel=dc;dc.onmessage=event=>{receiveQueue=receiveQueue.then(()=>{if(channel===dc)return receive(event);}).catch(e=>{if(channel===dc)fail(e.message);});};dc.onclose=()=>{if(channel===dc)leave(true,guest()?(localAccount?'The host closed the room. Your last character checkpoint stays in that world.':'The host closed the room.'):'Your guest disconnected. You can continue in Single Player.');};
    dc.onerror=()=>status('Connection error. Close the session and try a fresh room.');
    dc.onopen=()=>{checkRoute(pc);signalingConnected();status('Connecting to player…');send({type:'hello',protocol,content:19,mods:Mods.signature(),name:localName,accounts:1,nonce:ownNonce,authenticated:!!localAccount});};
  }
  async function gathered(current){
    if(current.iceGatheringState!=='complete')await new Promise(resolve=>{const timer=setTimeout(done,12000);function done(){clearTimeout(timer);current.removeEventListener('icegatheringstatechange',change);resolve();}function change(){if(current.iceGatheringState==='complete')done();}current.addEventListener('icegatheringstatechange',change);});
    if(pc!==current)throw Error('Invitation cancelled.');
    if(!current.localDescription?.sdp.includes('a=candidate:'))throw Error('No connection addresses found. Check your network and browser permissions.');
    return 'WR2.'+btoa(JSON.stringify({game:'Webrraria',v:protocol,type:current.localDescription.type,sdp:current.localDescription.sdp}));
  }
  function decode(text,type){
    text=text.trim();if(text.length>120000)throw Error('Invitation code is too long.');
    let value;try{value=JSON.parse(atob(text.replace(/^WR[0-9]+\./,'').replace(/\s/g,'')));}catch(e){throw Error('That code is not valid. Paste the whole Webrraria code.');}
    if(value.game!=='Webrraria'||value.v!==protocol||value.type!==type||typeof value.sdp!=='string'||value.sdp.length>80000)throw Error('Expected a Webrraria '+type+' code from this version.');
    return {type:value.type,sdp:value.sdp};
  }
  async function run(fn){if(busy)return;const operation=generation;busy=true;syncUI();try{Mods.assertMultiplayer();await fn();}catch(e){if(operation!==generation)return;if(active())leave(false,e.message);status(e.message);Menu.show('multiplayer');}finally{if(operation===generation){busy=false;syncUI();}}}
  $('mpHost').addEventListener('click',()=>run(async()=>{
    const id=$('mpWorld').value;if(!id)throw Error('Create a world in Single Player first.');
    if(inventoryOpen()&&!storeInventoryCursor())throw Error('Place the item held by your cursor first.');
    WorldStore.play(id);Menu.show('multiplayer');if(trees.length>WORLD_W)throw Error('This world has too many trees for this multiplayer version.');
    const current=await setup('host');enemies=[];attach(current.createDataChannel('webrraria',{ordered:true}));
    status('Creating invitation…');await current.setLocalDescription(await current.createOffer());$('mpLocalCode').value=await gathered(current);$('mpCodeLabel').textContent='Your invite (send to your friend)';status('Send your invite. Then paste your friend’s answer below and click Connect Answer.');
  }));
  $('mpJoin').addEventListener('click',()=>run(async()=>{
    if(gameStarted)throw Error('Save & Exit your current world before joining a friend.');
    const offer=decode($('mpRemoteCode').value,'offer');backup=JSON.parse(JSON.stringify(captureGame()));const current=await setup('guest');current.ondatachannel=e=>{if(pc===current)attach(e.channel);};
    status('Creating answer…');await current.setRemoteDescription(offer);await current.setLocalDescription(await current.createAnswer());$('mpLocalCode').value=await gathered(current);$('mpCodeLabel').textContent='Your answer (send back to the host)';status('Send your answer to the host. Keep this tab open while they connect.');
  }));
  $('mpAccept').addEventListener('click',()=>run(async()=>{const answer=decode($('mpRemoteCode').value,'answer');await pc.setRemoteDescription(answer);status('Connecting to your friend…');}));
  $('mpCopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('mpLocalCode').value);status('Code copied. Share it privately with your friend.');}catch(e){$('mpLocalCode').focus();$('mpLocalCode').select();status('Code selected. Copy it, then send it to your friend.');}});
  $('mpLeave').addEventListener('click',()=>leaveSafely());$('mpResume').addEventListener('click',closeMenu);
  $('mpName').value=name(gameStorage.getItem('webrraria-mp-name')||'Player');
  function tick(now){
    roomTick(now);if(!active())return;
    if(remoteAccount&&connected()&&now-lastAccountCheck>60000){lastAccountCheck=now;const current=pc,identity={...remoteAccount};Accounts.checkPeer(identity).then(async profile=>{if(pc!==current||remoteAccount?.id!==identity.id)return;if(profile.skinHash!==remoteAccount.skinHash){remoteAccount.skinHash=profile.skinHash||'';const skin=await Accounts.peerSkin({...remoteAccount});if(pc===current)remoteSkin=skin;}}).catch(e=>{if(pc===current&&[401,403,404].includes(e.status))fail('That account can no longer join this session.');});}

    if(connected()&&now-routeCheckAt>5000){routeCheckAt=now;checkRoute(pc);}
    if(guest()&&pending&&now-pending.started>15000){fail('The host did not confirm the edit.');return;}
    if(guest()&&connected()&&localAccount&&now-lastProfileAt>1000){try{checkpoint();}catch(e){fail(e.message);return;}}
    if(!connected()||now-lastSend<66)return;lastSend=now;
    try{send({type:'state',p:playerState(),...(role==='host'?{time,day}:{})});}catch(e){fail(e.message);}
    if(lastReceive&&now-lastReceive>4000)$('mpBadge').textContent='Waiting for '+remoteName+'. Keep both tabs open';else $('mpBadge').textContent='2 / 2. '+remoteName+'. '+(guest()?'Guest':'Host');
  }
  function draw(){
    if(!connected()||!remote)return;
    const own={...player},style=characterStyle,oldSkin=playerSkinOverride;
    try{Object.assign(player,{...remote,hotbar:[remote.held?{id:remote.held,count:1}:null],selected:0,hurtTime:0});characterStyle=remote.style;playerSkinOverride=remoteSkin;drawPlayer();}finally{Object.assign(player,own);characterStyle=style;playerSkinOverride=oldSkin;}
    ctx.save();ctx.font='18px TerrariaAndy, monospace';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#15213b';ctx.fillStyle=guest()?'#b9f5ac':'#a4deff';const x=(remote.x-cam.x+player.w/2)*zoom,y=(remote.y-cam.y)*zoom-25;const label=remoteName+(remoteAccount?.role==='admin'?' [Admin]':'')+(friendlyFire?'. '+remote.health+'/10':'');ctx.strokeText(label,x,y);ctx.fillText(label,x,y);ctx.restore();
  }
  return {containerSend:send,active,guest,connected,edit,leave,leaveSafely,checkpoint,syncUI,tick,draw,combat,canHeal,healed,closeChat,inspect:()=>({role,ready,account:localAccount?.username||null,remoteAccount:remoteAccount?.username||null,remoteRole:remoteAccount?.role||'player',peerVerified,roomCode,roomMode,relayState,relayRoute,relayExpires,roomCodesEnabled:ROOM_CODES_ENABLED,signalingConfigured:!!configuredService(),friendlyFire,guestHealth,chatOpen,peer:pc?.connectionState||'closed',channel:channel?.readyState||'closed',remote:remote?{x:remote.x,y:remote.y,name:remoteName}:null,pending:pending?.n||null})};
})();


const AdminTools=(()=>{
 const $=id=>document.getElementById(id);let busy=false,cursor=null,rows=[],revision=0;
 const isAdmin=()=>Accounts.user()?.role==='admin';
 const gameAllowed=()=>isAdmin()&&gameStarted&&!!WorldStore.active()&&!MP.guest()&&(!MP.active()||MP.connected());
 function message(text){$('adminStatus').textContent=text;}
 function render(resetCoordinates=false){const admin=isAdmin();$('pauseAdminBtn').hidden=!admin;$('accountAdminButton').hidden=!admin;for(const b of $('adminPanel').querySelectorAll('button,input,select'))b.disabled=busy||!admin;for(const b of $('adminPanel').querySelectorAll('[data-go]'))b.disabled=false;for(const b of document.querySelectorAll('#adminGiveForm button,#adminGiveForm input,#adminGiveForm select,#adminTeleportForm button,#adminTeleportForm input'))b.disabled=busy||!gameAllowed();$('adminGameHint').textContent=gameAllowed()?'These tools affect only your character in your own world.':'Open your own world to use game tools. They are disabled while joining another host.';if(!admin){rows=[];cursor=null;$('adminAccounts').replaceChildren();message('Server-verified admin access is required.');}const ids=Object.keys(ITEMS).sort((a,b)=>ITEMS[a].name.localeCompare(ITEMS[b].name));if($('adminItem').options.length!==ids.length){$('adminItem').replaceChildren();for(const id of ids){const o=document.createElement('option');o.value=id;o.textContent=ITEMS[id].name;$('adminItem').append(o);}}$('adminCount').max=String(stackLimit($('adminItem').value));$('adminMore').hidden=!cursor;if(gameStarted&&resetCoordinates){$('adminX').value=Math.floor(player.x/TILE);$('adminY').value=Math.floor(player.y/TILE);}drawRows();}
 async function action(fn){if(busy)return;busy=true;const current=++revision;render();try{if(!isAdmin())throw Error('Admin access is required.');await fn(current);}catch(e){message(e.message);}finally{busy=false;render();drawRows();}}
 async function authorize(){if(!gameAllowed())throw Error('Game tools only work in your own hosted or single-player world.');const actor=Accounts.user(),worldId=WorldStore.active(),nonce=Accounts.nonce(),proof=await Accounts.ticket(nonce),identity=await Accounts.verify(proof,nonce);if(identity.id!==actor.id||identity.role!=='admin'||!gameAllowed()||WorldStore.active()!==worldId)throw Error('Admin authorization or the current world changed.');}
 function save(text){updateHotbar();if(inventoryOpen())updateInventoryUI();const ok=saveGame();message(text+(ok?' Saved to this world.':' Browser save failed. Export a backup.'));}
 function safe(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x+player.w>WORLD_W*TILE||y+player.h>WORLD_H*TILE)return false;for(let yy=Math.floor(y/TILE);yy<=Math.floor((y+player.h-.001)/TILE);yy++)for(let xx=Math.floor(x/TILE);xx<=Math.floor((x+player.w-.001)/TILE);xx++)if(SOLID.has(world[yy]?.[xx])||Containers.at(xx,yy))return false;return true;}
 function move(x,y){if(!safe(x,y))throw Error('That destination is blocked or outside the world.');player.x=x;player.y=y;player.vx=player.vy=0;player.onGround=false;player.hurtTime=1;cam.x=Math.max(0,Math.min(WORLD_W*TILE-canvas.width/DPR/zoom,player.x-canvas.width/DPR/zoom/2));cam.y=Math.max(0,Math.min(WORLD_H*TILE-canvas.height/DPR/zoom,player.y-canvas.height/DPR/zoom/2));save('Teleported.');}
 $('adminGiveForm').onsubmit=e=>{e.preventDefault();action(async()=>{const id=$('adminItem').value,count=Number($('adminCount').value);if(!Object.hasOwn(ITEMS,id)||!Number.isInteger(count)||count<1||count>stackLimit(id))throw Error('Choose a valid item and amount.');await authorize();const hot=player.hotbar.map(cloneStack),pack=inventory.map(cloneStack);if(insertStack([hot,pack],{id,count}))throw Error('Not enough inventory space. No items were added.');player.hotbar=hot;inventory=pack;save('Added '+count+' '+ITEMS[id].name+'.');});};
 $('adminItem').onchange=()=>{const limit=stackLimit($('adminItem').value);$('adminCount').max=String(limit);$('adminCount').value=Math.min(limit,Math.max(1,Number($('adminCount').value)||1));};
 $('adminTeleportForm').onsubmit=e=>{e.preventDefault();action(async()=>{const x=Number($('adminX').value),y=Number($('adminY').value);if(!Number.isInteger(x)||!Number.isInteger(y))throw Error('Enter whole tile coordinates.');await authorize();move(x*TILE,y*TILE);});};
 $('adminToSpawn').onclick=()=>action(async()=>{await authorize();for(let r=0;r<=12;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(r&&Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=spawn.x+dx*TILE,y=spawn.y+dy*TILE;if(safe(x,y)){move(x,y);return;}}throw Error('No clear destination was found near spawn.');});
 function drawRows(){const list=$('adminAccounts');list.replaceChildren();for(const account of rows){const row=document.createElement('article');row.className='admin-account-row';const name=document.createElement('strong'),state=document.createElement('span'),tools=document.createElement('div');name.textContent=account.username;state.textContent=account.role==='admin'?'Admin (protected)':account.banned?'Banned':'Active';row.append(name,state);for(const [kind,label]of [[account.banned?'unban':'ban',account.banned?'Unban':'Ban'],['reset-skin','Reset Skin']]){const button=document.createElement('button');button.type='button';button.className='blue-button';button.textContent=label;button.disabled=busy||account.role==='admin';button.dataset.adminAction=kind;button.dataset.accountId=account.id;button.onclick=()=>{if(!confirm(label+' for '+account.username+'?'))return;action(async()=>{const result=await Accounts.moderate('action','POST',{target:account.id,action:kind});rows=rows.map(r=>r.id===result.account.id?result.account:r);drawRows();message(label+' completed for '+account.username+'.');});};tools.append(button);}row.append(tools);list.append(row);}if(!rows.length){const p=document.createElement('p');p.textContent='No accounts found.';list.append(p);}}
 async function load(next=false,search=false){const name=$('adminSearch').value.trim();if(search&&!/^[A-Za-z0-9_]{3,20}$/.test(name))throw Error('Enter the full account username.');const query=search?'?username='+encodeURIComponent(name):next&&cursor?'?cursor='+encodeURIComponent(cursor):'';const result=await Accounts.moderate('accounts'+query);if(!Array.isArray(result.accounts))throw Error('Invalid account list.');rows=next?[...rows,...result.accounts]:result.accounts;cursor=result.cursor||null;drawRows();message('Account list loaded.');}
 $('adminSearchForm').onsubmit=e=>{e.preventDefault();action(()=>load(false,true));};$('adminList').onclick=()=>action(()=>load());$('adminMore').onclick=()=>action(()=>load(true));
 return {render};
})();

// Building helpers operate through the same item counts, reach, and save rules.
const BuildTools=(()=>{
  let mode=0,start=null;const labels=['Off','Line','Box'];
  function active(){return gameStarted&&!inventoryOpen()&&document.getElementById('menu').style.display==='none';}
  function cycle(){if(MP.active()){toast('Line and box building are single-player tools.');return;}mode=(mode+1)%3;start=null;toast(mode?'Right-click a start point, then an end point. Esc cancels. Max 24 cells.':'Normal building');}
  function path(a,b,kind=mode){const cells=[],seen=new Set();const add=(x,y)=>{const k=x+','+y;if(!seen.has(k)){seen.add(k);cells.push([x,y]);}};if(Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))>24)return [];
    if(kind===2){for(let x=Math.min(a.x,b.x);x<=Math.max(a.x,b.x);x++){add(x,a.y);add(x,b.y);}for(let y=Math.min(a.y,b.y);y<=Math.max(a.y,b.y);y++){add(a.x,y);add(b.x,y);}}
    else{let x=a.x,y=a.y,dx=Math.abs(b.x-x),dy=-Math.abs(b.y-y),sx=x<b.x?1:-1,sy=y<b.y?1:-1,error=dx+dy;for(let n=0;n<25;n++){add(x,y);if(x===b.x&&y===b.y)break;const e=2*error;if(e>=dy){error+=dy;x+=sx;}if(e<=dx){error+=dx;y+=sy;}}}return cells.length<=24?cells:[];
  }
  function plan(cells,tile){const valid=[],placed=new Set();if(!Number.isInteger(tile)||Containers.isType(tile)||HomeFurniture.isType(tile))return valid;for(const [x,y]of cells){if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=WORLD_W||y>=WORLD_H||world[y][x]!==T.AIR||Containers.at(x,y)||HomeFurniture.at(x,y)||Math.hypot(x*TILE+8-player.x-player.w/2,y*TILE+8-player.y-player.h/2)>=96)continue;
      if(x*TILE<player.x+player.w&&(x+1)*TILE>player.x&&y*TILE<player.y+player.h&&(y+1)*TILE>player.y)continue;
      let supported=tile===T.TORCH||tile===T.PLATFORM;for(let yy=y-1;yy<=y+1;yy++)for(let xx=x-1;xx<=x+1;xx++)if(world[yy]?.[xx]!==undefined&&(world[yy][xx]!==T.AIR||placed.has(xx+','+yy)))supported=true;
      if(tile===T.TORCH?torchMount(x,y)>=0:supported){valid.push([x,y]);placed.add(x+','+y);}}
    return valid;
  }
  function place(cells,id,fromAnyBag=false){if(MP.active()||!active()||!Object.hasOwn(ITEMS,id))return 0;const tile=ITEMS[id].tile,valid=plan(cells,tile);if(!valid.length)return 0;
    const sources=fromAnyBag?[...player.hotbar,...inventory].filter(s=>s?.id===id&&!s.favorite):[player.hotbar[player.selected]].filter(s=>s?.id===id);if(sources.reduce((n,s)=>n+s.count,0)<valid.length){toast('Not enough items for this placement.');return 0;}
    let needed=valid.length;for(const stack of sources){const n=Math.min(needed,stack.count);stack.count-=n;needed-=n;if(!needed)break;}for(const bag of [player.hotbar,inventory])for(let i=0;i<bag.length;i++)if(bag[i]?.count===0)bag[i]=null;
    for(const [x,y]of valid)world[y][x]=tile;updateLightMap(valid);Achievements.note('placed',valid.length);if(tile===T.TORCH)Achievements.note('torchesPlaced',valid.length);updateHotbar();if(inventoryOpen())updateInventoryUI();SFX.play('place');return valid.length;
  }
  function pick(){if(!active())return;let tile=world[mouse.tileY]?.[mouse.tileX];const anchor=Containers.at(mouse.tileX,mouse.tileY)||HomeFurniture.at(mouse.tileX,mouse.tileY);if(anchor)tile=world[anchor.y][anchor.x];const match=s=>s&&(ITEMS[s.id]?.tile===tile||(tile===T.GRASS&&s.id==='dirt'));let index=player.hotbar.findIndex(match);if(index>=0){player.selected=index;updateHotbar();return;}index=inventory.findIndex(match);if(index<0){toast('No matching block in your inventory.');return;}let slot=player.hotbar.findIndex(s=>!s);if(slot<0)slot=player.hotbar[player.selected]?.favorite?-1:player.selected;if(slot<0){toast('Make room in your hotbar first.');return;}[inventory[index],player.hotbar[slot]]=[player.hotbar[slot],inventory[index]];player.selected=slot;updateHotbar();saveGame();}
  function filter(){const query=document.getElementById('inventorySearch').value.trim().toLowerCase();for(const el of document.querySelectorAll('.invslot[data-bag]')){const stack=bagArray(el.dataset.bag)[Number(el.dataset.index)];el.classList.toggle('search-dim',!!query&&(!stack||!((ITEMS[stack.id]?.name||'')+' '+stack.id).toLowerCase().includes(query)));}}
  function draw(){if(MP.active()||!active()||!mode)return;const selected=player.hotbar[player.selected],tile=selected&&ITEMS[selected.id]?.tile;if(tile===undefined||Containers.isType(tile)||HomeFurniture.isType(tile))return;const target={x:mouse.tileX,y:mouse.tileY};if(!Number.isInteger(target.x)||!Number.isInteger(target.y)||target.x<0||target.y<0)return;const cells=start?path(start,target):[[target.x,target.y]],valid=new Set(plan(cells,tile).map(([x,y])=>x+','+y));ctx.save();ctx.lineWidth=1;for(const [x,y]of cells){ctx.strokeStyle=valid.has(x+','+y)?'#98f5a2':'#ee9b91';ctx.strokeRect(Math.round((x*TILE-cam.x)*zoom)+.5,Math.round((y*TILE-cam.y)*zoom)+.5,TILE*zoom-1,TILE*zoom-1);}if(start){ctx.font='16px TerrariaAndy,monospace';ctx.fillStyle='#fff3ba';ctx.fillText(cells.length?cells.length+' cells':'Plan is too large',16,canvas.height/DPR-56);}ctx.restore();}
  window.addEventListener('keydown',e=>{if(e.target?.matches?.('input,textarea,select')||!active()||e.repeat)return;if(e.key==='Escape'&&start){start=null;e.preventDefault();e.stopImmediatePropagation();return;}if(e.key.toLowerCase()==='b'){cycle();e.preventDefault();}if(e.key.toLowerCase()==='g'){pick();e.preventDefault();}},true);
  canvas.addEventListener('pointerdown',e=>{if(e.button!==2||!mode||!active()||MP.active())return;const r=canvas.getBoundingClientRect(),target={x:Math.floor(((e.clientX-r.left)/zoom+cam.x)/TILE),y:Math.floor(((e.clientY-r.top)/zoom+cam.y)/TILE)};if(Containers.at(target.x,target.y))return;const stack=player.hotbar[player.selected];if(!stack||ITEMS[stack.id]?.tile===undefined||Containers.isType(ITEMS[stack.id].tile)||HomeFurniture.isType(ITEMS[stack.id].tile))return;e.preventDefault();e.stopImmediatePropagation();mouse.downR=false;if(MP.active()){toast('Line and box building are single-player tools. Normal building still works in multiplayer.');return;}if(!start){start=target;toast('Choose the end point. Esc cancels.');return;}const cells=path(start,target);start=null;const n=place(cells,stack.id);toast(n?'Placed '+n+' blocks.':cells.length?'No empty, supported cells within reach.':'Plan exceeds 24 cells.');},true);
  document.getElementById('inventorySearch').addEventListener('input',filter);
  return {draw,filter,place,path,plan,pick,cancel(){start=null;mode=0;},inspect:()=>({mode:labels[mode],start})};
})();

// Local ZIP content packs. Scripts never arrive through saves or multiplayer.
const Mods=(()=>{
  const $=id=>document.getElementById(id),catalog=[],workers=new Map(),baseItems=new Set(Object.keys(ITEMS)),appliedItems=[],appliedTiles=[];
  let busy=false,lastTick=0,ready=false,askScripts=false;const logs=[],scriptPermissions=new Map();
  const textDecoder=new TextDecoder('utf-8',{fatal:true}),encoder=new TextEncoder();
  const crcTable=Uint32Array.from({length:256},(_,i)=>{for(let j=0;j<8;j++)i=(i>>>1)^((i&1)?0xedb88320:0);return i>>>0;});
  function crc(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
  const string=(x,max=80)=>{if(typeof x!=='string'||!x.trim()||x.length>max||/[\x00-\x1f]/.test(x))throw Error('Invalid mod text.');return x.trim();};
  function identifier(x){x=string(x,48);if(!/^[a-z][a-z0-9_.-]*$/.test(x)||['__proto__','constructor','prototype'].includes(x))throw Error('Use lowercase mod/content IDs with letters, numbers, dots, underscores, or hyphens.');return x;}
  function integer(x,min,max){if(!Number.isInteger(x)||x<min||x>max)throw Error('A mod number is outside its supported range.');return x;}
  function list(x,max){if(x===undefined)return [];if(!Array.isArray(x)||x.length>max)throw Error('Too many mod definitions.');return x;}
  function safePath(p){if(typeof p!=='string'||p.length>180||/[\x00-\x1f]/.test(p)||p.includes('\\')||p.startsWith('/')||p.includes(':')||p.split('/').some(s=>s==='..'||s==='.'||!s))throw Error('Unsafe ZIP path.');return p;}
  function log(message){logs.push(String(message).slice(0,300));if(logs.length>15)logs.shift();$('modLog').textContent=logs.join('\n');}
  function status(message){$('modStatus').textContent=message;}
  function b64(bytes){let out='';for(let i=0;i<bytes.length;i+=8192)out+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(out);}
  async function unzip(buffer){
    if(!(buffer instanceof ArrayBuffer)||buffer.byteLength>8*1024*1024)throw Error('Mod ZIPs must be at most 8 MB.');const v=new DataView(buffer),u=new Uint8Array(buffer);let end=-1;
    for(let i=u.length-22;i>=Math.max(0,u.length-65557);i--)if(v.getUint32(i,true)===0x06054b50){end=i;break;}if(end<0)throw Error('Not a supported ZIP archive.');
    if(v.getUint16(end+4,true)||v.getUint16(end+6,true)||v.getUint16(end+8,true)!==v.getUint16(end+10,true)||end+22+v.getUint16(end+20,true)!==u.length)throw Error('Split/invalid ZIPs are not supported.');
    const count=v.getUint16(end+10,true),cdSize=v.getUint32(end+12,true),cdStart=v.getUint32(end+16,true);if(!count||count>100||cdStart+cdSize>end)throw Error('Invalid or oversized ZIP directory.');const files=new Map();let pos=cdStart,total=0;
    for(let n=0;n<count;n++){
      if(pos+46>cdStart+cdSize||v.getUint32(pos,true)!==0x02014b50)throw Error('Invalid ZIP entry.');const flags=v.getUint16(pos+8,true),method=v.getUint16(pos+10,true),checksum=v.getUint32(pos+16,true),compressed=v.getUint32(pos+20,true),size=v.getUint32(pos+24,true),nl=v.getUint16(pos+28,true),el=v.getUint16(pos+30,true),cl=v.getUint16(pos+32,true),offset=v.getUint32(pos+42,true);if(pos+46+nl+el+cl>cdStart+cdSize)throw Error('Truncated ZIP directory.');const rawName=textDecoder.decode(u.subarray(pos+46,pos+46+nl));pos+=46+nl+el+cl;
      const dir=rawName.endsWith('/'),name=safePath(dir?rawName.slice(0,-1):rawName);if(flags&1||![0,8].includes(method)||size>2*1024*1024||total+size>8*1024*1024||files.has(name)||offset+30>cdStart)throw Error('Encrypted, duplicate, or oversized mod ZIP entry.');if(dir)continue;total+=size;
      if(v.getUint32(offset,true)!==0x04034b50||v.getUint16(offset+6,true)!==flags||v.getUint16(offset+8,true)!==method)throw Error('Invalid local ZIP header.');const lnl=v.getUint16(offset+26,true),lel=v.getUint16(offset+28,true),start=offset+30+lnl+lel;if(start+compressed>cdStart||textDecoder.decode(u.subarray(offset+30,offset+30+lnl))!==name)throw Error('Invalid ZIP file boundaries.');let data;
      if(method===0){if(compressed!==size)throw Error('Invalid stored ZIP size.');data=u.slice(start,start+compressed);}
      else{if(typeof DecompressionStream==='undefined')throw Error('This browser needs ZIPs saved without compression.');let stream;try{stream=new Blob([u.subarray(start,start+compressed)]).stream().pipeThrough(new DecompressionStream('deflate-raw'));}catch{throw Error('Use a current browser or an uncompressed ZIP.');}const reader=stream.getReader(),chunks=[];let bytes=0;while(true){const result=await reader.read();if(result.done)break;bytes+=result.value.length;if(bytes>size||bytes>2*1024*1024){await reader.cancel();throw Error('ZIP decompression limit exceeded.');}chunks.push(result.value);}if(bytes!==size)throw Error('Incorrect ZIP size.');data=new Uint8Array(bytes);let at=0;for(const c of chunks){data.set(c,at);at+=c.length;}}
      if(crc(data)!==checksum)throw Error('Corrupt ZIP checksum.');files.set(name,data);
    }return files;
  }
  async function hash(files){const parts=[];let length=0;for(const name of [...files.keys()].sort()){const key=encoder.encode(name+'\0'+files.get(name).length+'\0');parts.push(key,files.get(name));length+=key.length+files.get(name).length;}const data=new Uint8Array(length);let at=0;for(const p of parts){data.set(p,at);at+=p.length;}if(globalThis.crypto?.subtle)return [...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(n=>n.toString(16).padStart(2,'0')).join('');throw Error('Mod fingerprints need a current browser on HTTPS, localhost, or a local HTML file.');}
  async function png(files,path){path=safePath(path);const bytes=files.get(path);if(!bytes||bytes.length>1024*1024||bytes.length<8||[137,80,78,71,13,10,26,10].some((n,i)=>bytes[i]!==n))throw Error('Textures must be local PNG files.');if(bytes.length<33)throw Error('Truncated PNG.');const header=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);if(header.getUint32(12)!==0x49484452||header.getUint32(16)<1||header.getUint32(16)>512||header.getUint32(20)<1||header.getUint32(20)>512)throw Error('Mod PNGs must be at most 512 × 512.');for(let at=8;at+12<=bytes.length;){const length=header.getUint32(at);if(at+12+length>bytes.length)throw Error('Truncated PNG chunk.');if(header.getUint32(at+4)===0x6163544c)throw Error('Animated PNGs are not supported.');at+=12+length;}const image=new Image();image.src='data:image/png;base64,'+b64(bytes);await image.decode();if(image.width<1||image.height<1||image.width>512||image.height>512)throw Error('Mod PNGs must be at most 512 × 512.');return image;}
  async function parse(source){
    const files=await unzip(source),raw=files.get('mod.json');if(!raw||raw.length>65536)throw Error('Place mod.json at the ZIP root (not inside another folder).');let m;try{m=JSON.parse(textDecoder.decode(raw));}catch{throw Error('Invalid mod.json.');}
    if(m?.format!=='WebrrariaMod'||m.apiVersion!==1)throw Error('This is not a Webrraria Mod API 1 pack. Terraria .tmod files are not supported.');const id=identifier(m.id),version=string(m.version,32),name=string(m.name,80),description=m.description?string(m.description,400):'',ids=new Set();
    const blocks=list(m.blocks,16),items=list(m.items,24),recipes=list(m.recipes,32),worldgen=list(m.worldgen,8),images=new Map();
    for(const entry of [...blocks,...items]){entry.id=identifier(entry.id);if(ids.has(entry.id))throw Error('Duplicate content ID.');ids.add(entry.id);entry.name=string(entry.name,80);}
    const resolve=ref=>{if(typeof ref!=='string')throw Error('Invalid item reference.');if(ids.has(ref))return id+':'+ref;if(baseItems.has(ref))return ref;throw Error('Unknown mod item: '+ref);};
    const normalizedBlocks=[];
    for(const block of blocks){const tile=integer(block.tileId,64,239);if(!baseItems.has(block.base)||ITEMS[block.base]?.tile===undefined||!CaveRenderer.isStatic(ITEMS[block.base].tile))throw Error('Blocks need a built-in base block.');if(block.solid!==undefined&&typeof block.solid!=='boolean')throw Error('Invalid block solidity.');if(block.texture)images.set(block.id,await png(files,block.texture));normalizedBlocks.push({id:id+':'+block.id,local:block.id,name:block.name,tile,base:block.base,solid:block.solid!==false,breakTime:block.breakTime===undefined?28:integer(block.breakTime,1,120)});}
    const normalizedItems=[];for(const item of items){if(!baseItems.has(item.sprite))throw Error('Items need a built-in sprite reference.');let image=null;if(item.texture)image=await png(files,item.texture);const definition={name:item.name};if(item.tool!==undefined){if(!['sword','pickaxe','axe'].includes(item.tool))throw Error('Invalid mod tool.');definition.tool=item.tool;if(item.tool==='sword')definition.damage=integer(item.damage??7,1,20);else{const power=item.power??1;if(!Number.isFinite(power)||power<.1||power>3)throw Error('Invalid tool power.');definition.power=power;}}if(item.heal!==undefined)definition.heal=integer(item.heal,1,6);normalizedItems.push({id:id+':'+item.id,sprite:item.sprite,image,definition});}
    const recipeIDs=new Set(),normalizedRecipes=recipes.map(recipe=>{const local=identifier(recipe.id);if(recipeIDs.has(local))throw Error('Duplicate recipe ID.');recipeIDs.add(local);if(!recipe.need||typeof recipe.need!=='object'||Array.isArray(recipe.need)||Object.keys(recipe.need).length<1||Object.keys(recipe.need).length>8)throw Error('Recipes need 1–8 ingredients.');const need=Object.create(null);for(const [key,n]of Object.entries(recipe.need))need[resolve(key)]=integer(n,1,999);return {id:id+':'+local,out:resolve(recipe.out),count:integer(recipe.count??1,1,99),need,modOwner:id};});
    const normalizedGen=worldgen.map(g=>{const block=normalizedBlocks.find(b=>b.local===g.block);if(!block)throw Error('Worldgen must refer to one of this mod’s blocks.');const minDepth=integer(g.minDepth??20,12,120),maxDepth=integer(g.maxDepth??80,minDepth,150);return {tile:block.tile,attempts:integer(g.attempts??20,1,100),minDepth,maxDepth};});
    let script='';if(m.script){const bytes=files.get(safePath(m.script));if(!m.script.endsWith('.js')||!bytes||bytes.length>65536)throw Error('Scripts must be local .js files up to 64 KB.');script=textDecoder.decode(bytes);}
    if(new Set(normalizedBlocks.map(b=>b.tile)).size!==normalizedBlocks.length)throw Error('Duplicate block tile IDs.');return {id,version,name,description,blocks:normalizedBlocks,items:normalizedItems,recipes:normalizedRecipes,worldgen:normalizedGen,images,script,hash:await hash(files),source,enabled:true};
  }
  const permissionKey=m=>m.id+':'+m.hash;
  function scriptAllowed(m){if(!m.script)return false;const key=permissionKey(m);return scriptPermissions.has(key)?scriptPermissions.get(key)===true:!askScripts;}
  async function requestScripts(id){assertEditable();const m=catalog.find(m=>m.id===id);if(!m||!m.script)return false;if(!m.enabled)throw Error('Enable this mod first.');
    const allowed=!askScripts||confirm(m.name+' contains JavaScript. Allow its scripts?\n\nIt can change gameplay, use CPU, and make network requests. The game has not reviewed or approved this code. Only allow files you trust.\n\nYour Allow / Block choice will be remembered for this exact mod in this browser until you change it. Cancel keeps its content enabled but blocks its scripts.');
    scriptPermissions.set(permissionKey(m),allowed);const saved=await persist();render();status((allowed?'Scripts allowed for ':'Scripts blocked for ')+m.name+'. '+(saved?'Choice remembered.':'Storage unavailable: this choice lasts only for this page session.'));return allowed;
  }
  async function blockScripts(id){assertEditable();const m=catalog.find(m=>m.id===id);if(!m)return;scriptPermissions.set(permissionKey(m),false);stopOne(id);const saved=await persist();render();status('Scripts blocked for '+m.name+'. Content stays enabled. '+(saved?'Choice remembered.':'Storage unavailable: this choice lasts only for this page session.'));}
  async function setAskScripts(value){assertEditable();askScripts=value===true;render();const saved=await persist();render();status((askScripts?'Confirmations on. Undecided mods need approval; existing Allow / Block choices stay unchanged.':'Confirmations off. Scripts run by default unless you explicitly blocked that mod.')+(saved?' Setting remembered.':' Storage unavailable: setting is session-only.'));}
  function enabled(){return catalog.filter(m=>m.enabled).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);}
  function signature(){return enabled().map(m=>m.id+'@'+m.version+':'+m.hash).join('|');}
  function requirements(){return enabled().map(m=>({id:m.id,version:m.version,hash:m.hash}));}
  function check(required){for(const need of required){if(!enabled().some(m=>m.id===need.id&&m.version===need.version&&m.hash===need.hash))throw Error('This world needs mod '+need.id+' '+need.version+'. Install and enable the same ZIP before opening it.');}}
  function assertEditable(){if(!ready)throw Error('Mods are still loading.');if(gameStarted||MP.active())throw Error('Save & Exit the world before changing mods.');}
  function validateSet(){const tiles=new Set();let blocks=0,items=0;for(const m of enabled()){blocks+=m.blocks.length;items+=m.items.length;for(const b of m.blocks){if(tiles.has(b.tile))throw Error('Enabled mods conflict on tile ID '+b.tile+'. Disable one of them.');tiles.add(b.tile);}}if(blocks>64||items>96||enabled().length>8)throw Error('Limit: 8 enabled packs, 64 blocks, and 96 items.');}
  function rebuild(){
    validateSet();for(const id of appliedItems){delete ITEMS[id];delete ITEM_TO_TILE[id];delete expandedItemSprites[id];delete itemSprites[id];}for(const tile of appliedTiles){delete TILE_NAME[tile];delete extraTileDrops[tile];delete BREAK_TIME[tile];delete loadedPack[tile];delete tileCanvases[tile];SOLID.delete(tile);terrainTypes.delete(tile);delete T['mod_'+tile];}appliedItems.length=appliedTiles.length=0;for(let i=RECIPES.length-1;i>=0;i--)if(RECIPES[i].modOwner)RECIPES.splice(i,1);
    for(const m of enabled()){for(const block of m.blocks){T['mod_'+block.tile]=block.tile;TILE_NAME[block.tile]=block.name;extraTileDrops[block.tile]=block.id;BREAK_TIME[block.tile]=block.breakTime;if(block.solid){SOLID.add(block.tile);terrainTypes.add(block.tile);}ITEMS[block.id]={name:block.name,tile:block.tile};ITEM_TO_TILE[block.id]=block.tile;const base=ITEMS[block.base].tile,image=m.images.get(block.local)||loadedPack[base]||tileCanvases[base];if(image){loadedPack[block.tile]=image;tileCanvases[block.tile]=image;}expandedItemSprites[block.id]=m.images.get(block.local)||itemSprite(block.base);appliedItems.push(block.id);appliedTiles.push(block.tile);}for(const item of m.items){ITEMS[item.id]={...item.definition};expandedItemSprites[item.id]=item.image||itemSprite(item.sprite);appliedItems.push(item.id);}RECIPES.push(...m.recipes);}
    CaveRenderer.clear();spriteFrameCache.clear();biomeTileCache.clear();tileFrameRevision=-1;updateHotbar();if(inventoryOpen())updateInventoryUI();
  }
  function database(){return new Promise((resolve,reject)=>{const r=indexedDB.open('webrraria-mods',1);r.onupgradeneeded=()=>r.result.createObjectStore('packs');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async function persist(){try{const db=await database();await new Promise((resolve,reject)=>{const tx=db.transaction('packs','readwrite'),store=tx.objectStore('packs');store.put(catalog.map(m=>({source:m.source,enabled:m.enabled,...(scriptPermissions.has(permissionKey(m))?{scriptDecision:{id:m.id,hash:m.hash,allowed:scriptPermissions.get(permissionKey(m))}}:{})})),'installed');store.put({askScripts},'preferences');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});db.close();return true;}catch{log('Mod storage is unavailable. Keep the ZIP: these changes last only for this page session.');return false;}}
  async function install(source){assertEditable();if(catalog.length>=16)throw Error('Uninstall a mod first (16 installed mods maximum).');const m=await parse(source);assertEditable();if(catalog.some(old=>old.id===m.id))throw Error('That mod ID is already installed. Keep its old ZIP for existing worlds; uninstall it before replacing it.');catalog.push(m);try{rebuild();}catch(e){catalog.pop();throw e;}await persist();render();status('Installed '+m.name+'.');if(m.script&&askScripts&&!gameStarted&&!MP.active())await requestScripts(m.id);return m.id;}
  async function toggle(id,value){assertEditable();const m=catalog.find(m=>m.id===id);if(!m)return;const old=m.enabled;m.enabled=value;try{rebuild();}catch(e){m.enabled=old;throw e;}await persist();render();if(value&&m.script&&askScripts&&!scriptPermissions.has(permissionKey(m))&&!gameStarted&&!MP.active())await requestScripts(m.id);}
  async function remove(id){assertEditable();const index=catalog.findIndex(m=>m.id===id);if(index<0)return;const m=catalog[index];scriptPermissions.delete(m.id+':'+m.hash);catalog.splice(index,1);rebuild();await persist();render();status('Uninstalled. Worlds that need this exact mod will stay protected until it is restored.');}
  function render(){const list=$('modList');list.replaceChildren();for(const m of catalog){const row=document.createElement('div');row.className='mod-row';row.dataset.modId=m.id;const title=document.createElement('strong');title.textContent=m.name+' · '+m.version;row.append(title);const detail=document.createElement('p');detail.textContent=m.id+' · '+m.hash.slice(0,12)+' · '+m.blocks.length+' blocks / '+m.recipes.length+' recipes';row.append(detail);const state=document.createElement('p');state.textContent='Content '+(m.enabled?'enabled':'disabled')+(m.script?' · Scripts '+(!m.enabled?'not running (mod disabled)':scriptAllowed(m)?'allowed'+(scriptPermissions.has(permissionKey(m))?'':' by default'):'blocked'):' · No JavaScript');row.append(state);if(m.description){const desc=document.createElement('p');desc.textContent=m.description;row.append(desc);}const enable=document.createElement('button');enable.className='blue-button';enable.textContent=m.enabled?'Disable mod':'Enable mod';enable.disabled=busy||gameStarted||!ready;enable.onclick=()=>action(()=>toggle(m.id,!m.enabled));row.append(enable);if(m.script){const scripts=document.createElement('button');scripts.className='blue-button';scripts.dataset.modScripts=m.id;scripts.textContent=scriptAllowed(m)?'Block scripts':askScripts?'Allow scripts…':'Allow scripts';scripts.disabled=busy||gameStarted||!ready||!m.enabled;scripts.onclick=()=>action(()=>scriptAllowed(m)?blockScripts(m.id):requestScripts(m.id));row.append(scripts);}const del=document.createElement('button');del.className='blue-button';del.textContent='Uninstall';del.disabled=busy||gameStarted||!ready;del.onclick=()=>{if(confirm('Uninstall '+m.name+'? Keep its ZIP: saved worlds may require it.'))action(()=>remove(m.id));};row.append(del);list.append(row);}if(!catalog.length){const p=document.createElement('p');p.textContent='No mods installed. Import a Webrraria Mod ZIP to begin.';list.append(p);} $('modImport').disabled=busy||gameStarted||!ready;$('modAskScripts').disabled=busy||gameStarted||!ready;$('modAskScripts').checked=askScripts;$('modProfile').textContent=enabled().length+' enabled · '+(gameStarted?'Save & Exit before changing mods or script permissions.':'Enabled mods become requirements of worlds you save.');}
  async function action(fn){if(busy)return;busy=true;render();try{await fn();}catch(e){status(e.message);log(e.message);}finally{busy=false;render();}}
  function assertMultiplayer(){if(!ready)throw Error('Mods are still loading.');if(enabled().some(scriptAllowed))throw Error('Block each mod’s scripts in Mods before multiplayer. Content can stay enabled when both players use the same ZIPs.');}
  function generate(){for(const m of enabled()){let seed=(worldSeed|0)^parseInt(m.hash.slice(0,8),16);const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296;};for(const g of m.worldgen)for(let i=0;i<g.attempts;i++){const x=8+(random()*(WORLD_W-16)|0),y=Math.min(WORLD_H-8,surfaceY[x]+g.minDepth+(random()*(g.maxDepth-g.minDepth+1)|0));if(world[y][x]===T.STONE)world[y][x]=g.tile;}}}
  const workerCode=`'use strict';const events=new Map();let started=false;const api=Object.freeze({on(name,fn){if(!['start','tick'].includes(name)||typeof fn!=='function')throw Error('Use start/tick handlers');events.set(name,fn);},message(text){postMessage({command:'message',text});},giveItem(id,count=1){postMessage({command:'give',id,count});},placeBlock(id,x,y){postMessage({command:'place',id,x,y});}});self.onmessage=e=>{try{if(e.data.type==='load'){new Function('api',e.data.code)(api);postMessage({type:'ready'});}else if(e.data.type==='tick'){if(!started){started=true;events.get('start')?.(e.data.state);}events.get('tick')?.(e.data.state);postMessage({type:'alive'});}}catch(error){postMessage({type:'error',message:String(error.message||error)});}};`;
  function stopOne(id,message){const r=workers.get(id);if(!r)return;r.worker.terminate();URL.revokeObjectURL(r.url);workers.delete(id);if(message)log(id+': '+message);}
  function stop(){for(const id of [...workers.keys()])stopOne(id);}
  function runnable(){return gameStarted&&!MP.active()&&!inventoryOpen()&&document.getElementById('menu').style.display==='none';}
  function start(){stop();if(MP.active())return;const scripts=enabled().filter(scriptAllowed);if(scripts.length>4)log('Only the first four enabled script mods run at once (mod ID order). Disable other mods to choose which run.');for(const m of scripts.slice(0,4)){try{const url=URL.createObjectURL(new Blob([workerCode],{type:'text/javascript'})),worker=new Worker(url),record={worker,url,ready:false,started:performance.now(),sent:0,awaiting:0,budgetAt:0,budget:0,eventsAt:0,events:0};workers.set(m.id,record);worker.onmessage=e=>{if(workers.get(m.id)!==record)return;const received=performance.now();if(received-record.eventsAt>1000){record.eventsAt=received;record.events=0;}if(++record.events>100){stopOne(m.id,'message flood terminated.');return;}const d=e.data;if(!d||typeof d!=='object')return;if(d.type==='ready'){record.ready=true;return;}if(d.type==='alive'){record.awaiting=0;return;}if(d.type==='error'){stopOne(m.id,'script stopped: '+String(d.message).slice(0,160));return;}if(!runnable())return;const now=performance.now();if(now-record.budgetAt>1000){record.budgetAt=now;record.budget=0;}if(++record.budget>10)return;if(d.command==='message'&&typeof d.text==='string')toast(d.text.replace(/[\x00-\x1f]/g,' ').slice(0,160));if(d.command==='give'&&Object.hasOwn(ITEMS,d.id)&&Number.isInteger(d.count)&&d.count>0&&d.count<=64){const left=addToInventory(d.id,d.count);if(left)dropStack(d.id,left,player.x,player.y);}if(d.command==='place'&&typeof d.id==='string'&&Number.isInteger(d.x)&&Number.isInteger(d.y))BuildTools.place([[d.x,d.y]],d.id,true);};worker.onerror=e=>{e.preventDefault();stopOne(m.id,'script error: '+e.message);};worker.postMessage({type:'load',code:m.script});}catch(e){log(m.id+': '+e.message);}}}
  function tick(now){if(!workers.size)return;for(const [id,r]of workers)if((!r.ready&&now-r.started>3000)||(r.awaiting&&now-r.awaiting>3000))stopOne(id,'unresponsive worker terminated.');if(!runnable()||now-lastTick<200)return;lastTick=now;const x=player.x/TILE|0,y=player.y/TILE|0,tiles=[];for(let yy=y-6;yy<=y+6;yy++){const row=[];for(let xx=x-8;xx<=x+8;xx++)row.push(world[yy]?.[xx]??null);tiles.push(row);}const items=Object.create(null);for(const s of [...player.hotbar,...inventory])if(s)items[s.id]=(items[s.id]||0)+s.count;const state={time,day,biome:expansionBiome(x),player:{x:player.x,y:player.y,tileX:x,tileY:y,health:player.health},inventory:items,nearby:{left:x-8,top:y-6,tiles}};for(const r of workers.values())if(r.ready&&!r.awaiting){r.awaiting=now;r.worker.postMessage({type:'tick',state});}}
  $('modImport').onclick=()=>$('modFile').click();$('modFile').onchange=e=>{const file=e.target.files[0];if(file)action(async()=>{if(file.size>8*1024*1024)throw Error('Mod ZIP exceeds 8 MB.');await install(await file.arrayBuffer());});e.target.value='';};
  $('modAskScripts').onchange=e=>{const value=e.target.checked;action(()=>setAskScripts(value));};
  async function init(){try{await artReady;const db=await database();const [saved,prefs]=await Promise.all(['installed','preferences'].map(key=>new Promise((resolve,reject)=>{const r=db.transaction('packs','readonly').objectStore('packs').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);})));db.close();askScripts=prefs?.askScripts===true;if(Array.isArray(saved))for(const record of saved.slice(0,16)){try{const m=await parse(record.source);if(catalog.some(old=>old.id===m.id))throw Error('Duplicate installed mod ID.');m.enabled=record.enabled===true;const d=record.scriptDecision;if(m.script&&d&&d.id===m.id&&d.hash===m.hash&&typeof d.allowed==='boolean')scriptPermissions.set(permissionKey(m),d.allowed);catalog.push(m);}catch(e){log('A saved mod could not load: '+e.message);}}try{rebuild();}catch(e){for(const m of catalog)m.enabled=false;rebuild();log('Packs disabled: '+e.message);}}catch(e){log('Mods available for this session: '+e.message);}ready=true;modsReady=true;updateLaunchButtons();render();status(askScripts?'Confirmations on. Saved Allow / Block choices restored.':'Scripts run by default. Confirmations are optional; saved Block choices still apply.');}
  modRuntime={check,requirements,refresh:rebuild};init();
  return {install,toggle,remove,blockScripts,setAskScripts,render,signature,requirements,check,assertMultiplayer,generate,start,stop,tick,inspect:()=>({ready,askBeforeScripts:askScripts,allowedScripts:enabled().filter(scriptAllowed).map(m=>m.id),approvedScripts:catalog.filter(m=>scriptPermissions.get(permissionKey(m))===true).map(m=>m.id),workers:workers.size,signature:signature(),installed:catalog.map(m=>({id:m.id,name:m.name,version:m.version,hash:m.hash,enabled:m.enabled,script:!!m.script,scriptsAllowed:scriptAllowed(m),scriptDecision:scriptPermissions.has(permissionKey(m))?(scriptPermissions.get(permissionKey(m))?'allow':'block'):'default',blocks:m.blocks.length,recipes:m.recipes.length})),log:[...logs]})};
})();

// Initial UI state
updateHearts(); updateMana(); updateHotbar();
updateLightMap();
// Title scenery needs no throwaway world generation. Real worlds load/create on demand.
updateMinimap();
Accounts.init();
Menu.show('home');
requestAnimationFrame(loop);
setTimeout(()=>{ // keep menu open on load
  // show world faintly behind? no, menu overlay covers
},100);

// Prevent context menu
document.addEventListener('contextmenu', e=> e.preventDefault());

// Expose for debugging
window._modInspect=()=>Mods.inspect();
window._builderInspect=()=>BuildTools.inspect();
window._caveInspect=()=>CaveRenderer.inspect();
window._biomeInspect=()=>({target:biomeWeights((player.x+player.w/2)/TILE),displayed:backgroundBlend?{...backgroundBlend}:null});
window._audioInspect=()=>SFX.inspect();
window._musicInspect=()=>MenuMusic.inspect();
window._menuInspect=()=>Menu.inspect();
window._worldStoreInspect=()=>WorldStore.inspect();
window._achievementInspect=()=>Achievements.inspect();
window._settingsInspect=()=>({...gamePrefs,zoom});
window._graphicsInspect=()=>({quality:gamePrefs.quality,...graphicsPreset(),renderScale:DPR,canvasWidth:canvas.width,canvasHeight:canvas.height,cssWidth:canvas.getBoundingClientRect().width,cssHeight:canvas.getBoundingClientRect().height,titleWidth:document.getElementById('titleSky').width,titleHeight:document.getElementById('titleSky').height,particleCount:particles.length,particlesEnabled:gamePrefs.particles&&graphicsPreset().particleRate>0});
window._expansionInspect=()=>({biome:expansionBiome(player.x/TILE),generatorVersion,mobs:enemies.map(e=>({type:e.type,variant:e.variant,health:e.health,x:e.x,y:e.y})),items:Object.keys(ITEMS),recipes:RECIPES.map(r=>r.id)});
window._world=()=>world;
window._inspect=()=>({surfaceY:[...surfaceY],trees:trees.map(t=>({...t})),seed:worldSeed,generatorVersion,time,player:{x:player.x,y:player.y},loaded:Object.keys(loadedPack)});
window._multiplayerInspect=()=>MP.inspect();
window._accountInspect=()=>Accounts.inspect();
window._player=player;
window._inventoryInspect=()=>({hotbar:player.hotbar.map(cloneStack),backpack:inventory.map(cloneStack),cursor:cloneStack(inventoryCursor),open:inventoryOpen()});

}
