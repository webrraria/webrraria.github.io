// Works before ES module imports, so a mistaken file double-click has clear guidance.
(()=>{
  const panel=document.getElementById('localLaunchMessage');
  function show(text){
    document.getElementById('localLaunchText').textContent=text;
    panel.hidden=false;
    document.getElementById('game-wrap').hidden=true;
  }
  if(window.__WEBRRARIA_MOBILE_BLOCKED__){
    if(window.FontFace){
      const font=new URL('../assets/fonts/ANDYB.TTF',document.currentScript.src);
      new FontFace('WebrrariaNotice',`url(${font.href})`).load().then(face=>document.fonts.add(face)).catch(()=>{});
    }
    return;
  }
  if(location.protocol==='file:'){
    show('Close this tab, then double-click START-GAME.cmd in the extracted game folder. Keep its window open while playing.');
    return;
  }
  import('./boot.js').then(()=>{document.getElementById('game-wrap').inert=false;}).catch(()=>show('The game files could not load. Extract the entire ZIP, keep its folders together, and start it with START-GAME.cmd.'));
})();
