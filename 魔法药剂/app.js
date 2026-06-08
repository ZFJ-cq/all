window.MP = window.MP || {};

async function fetchLevelsFromNetwork(){
  try {
    const resp = await fetch('https://raw.githubusercontent.com/user-attachments/water-sort-levels/main/levels.json');
    if(!resp.ok) throw new Error('HTTP '+resp.status);
    return await resp.json();
  }catch(e){
    try{
      const r2 = await fetch('https://api.jsonbin.io/v3/b/67f8a123e41b4d34e488b123');
      if(r2.ok){
        const j = await r2.json();
        return j.record || j;
      }
    }catch(_){}
    return null;
  }
}

async function initLevels(){
  const loadOverlay = document.getElementById('load-overlay');
  const loadMsg = document.getElementById('load-msg');

  const netData = await fetchLevelsFromNetwork();

  if(netData && Array.isArray(netData) && netData.length>0){
    MP.levels = netData.map((l,i)=>({
      bottles:l.bottles||l.b||4,
      rows:l.rows||l.r||2,
      colors:l.colors||l.c||2,
      name:l.name||l.n||('第'+(i+1)+'关'),
    }));
    loadMsg.textContent = '网络数据加载成功！✨';
    MP.showToast('云端关卡已就绪','🌐');
  }else{
    MP.levels = MP.LOCAL_LEVELS.map(l=>({...l}));
    loadMsg.textContent = '使用本地配方书';
    MP.showToast('使用本地关卡','📖');
  }

  await new Promise(r=>setTimeout(r,600));
  loadOverlay.classList.remove('show');
  startGame();
}

function startGame(){
  MP.loadStorage();
  MP.setupLevel(MP.getCurrentLevelIdx());
}

window.doHint = function(){ MP.doHint(); };
window.doUndo = function(){ MP.doUndo(); };
window.doReset = function(){ MP.doReset(); };
window.showLevelPicker = function(){ MP.showLevelPicker(); };
window.closeWin = function(){ MP.closeWin(); };
window.goNextLevel = function(){ MP.goNextLevel(); };
window.closePicker = function(){ MP.closePicker(); };

initLevels();
