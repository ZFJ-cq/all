window.MP = window.MP || {};

MP.levels = [];
MP.moves = 0;
MP.selectedBottle = null;
MP.bottles = [];
MP.moveHistory = [];
MP.hintBottles = null;

MP.setupLevel = function(idx){
  if(idx>=MP.levels.length){
    MP.showToast('🎉 你已经是传奇大魔导师了！');
    MP.setupLevel(MP.levels.length-1);
    return;
  }
  MP.setCurrentLevelIdx(idx);
  const lv = MP.levels[idx];
  MP.moves = 0;
  MP.selectedBottle = null;
  MP.moveHistory = [];
  MP.hintBottles = null;

  document.getElementById('level-badge').textContent = '第 '+(idx+1)+' 关 · '+lv.name;
  document.getElementById('move-count').textContent = '0';
  document.getElementById('best-move').textContent = MP.getBestMoves()[idx] ? MP.getBestMoves()[idx]+'步' : '-';
  MP.updateProgress();

  MP.createBottles(lv);
  MP.renderAll();
};

MP.createBottles = function(lv){
  const {bottles:nBottles,rows,colors} = lv;
  const allColors = [];
  for(let i=0;i<colors;i++){
    for(let j=0;j<rows;j++){
      allColors.push(i);
    }
  }
  MP.shuffle(allColors);

  MP.bottles = [];
  for(let i=0;i<nBottles;i++){
    MP.bottles.push([]);
  }

  let bi = 0;
  for(let ci=0;ci<allColors.length;ci++){
    MP.bottles[bi].push(allColors[ci]);
    bi = (bi + 1) % nBottles;
  }

  for(let i=0;i<MP.bottles.length;i++){
    MP.shuffle(MP.bottles[i]);
  }

  if(!MP.isSolvable()){MP.createBottles(lv);}
};

MP.isSolvable = function(){
  const rows = MP.levels[MP.getCurrentLevelIdx()].rows;
  const cnt = {};
  for(const b of MP.bottles)for(const c of b)cnt[c]=(cnt[c]||0)+1;
  return Object.values(cnt).every(v=>v===rows);
};

MP.selectBottle = function(idx){
  if(MP.selectedBottle===null){
    if(MP.bottles[idx].length===0) return;
    MP.selectedBottle=idx;
    MP.renderAll();
  }else if(MP.selectedBottle===idx){
    MP.selectedBottle=null;
    MP.renderAll();
  }else{
    MP.doPour(MP.selectedBottle,idx);
  }
};

MP.doPour = function(from,to){
  const fromB = MP.bottles[from];
  const toB = MP.bottles[to];
  const rows = MP.levels[MP.getCurrentLevelIdx()].rows;

  if(toB.length>=rows || fromB.length===0){
    const unit = document.querySelectorAll('.bottle-unit')[to];
    if(unit){unit.classList.add('shake');setTimeout(()=>unit.classList.remove('shake'),400);}
    MP.selectedBottle=null;MP.renderAll();return;
  }

  const topColor = fromB[fromB.length-1];
  if(toB.length>0 && toB[toB.length-1]!==topColor){
    const unit = document.querySelectorAll('.bottle-unit')[to];
    if(unit){unit.classList.add('shake');setTimeout(()=>unit.classList.remove('shake'),400);}
    MP.selectedBottle=null;MP.renderAll();return;
  }

  const maxPour = rows - toB.length;
  let pourCount=0;
  for(let i=fromB.length-1;i>=0 && pourCount<maxPour;i--){
    if(fromB[i]===topColor) pourCount++;
    else break;
  }

  MP.moveHistory.push({from,to,color:topColor,count:pourCount});

  for(let i=0;i<pourCount;i++){
    toB.push(fromB.pop());
  }

  MP.moves++;
  MP.hintBottles=null;
  MP.selectedBottle=null;
  MP.renderAll();
  MP.updateProgress();
  MP.checkWin();
};

MP.updateProgress = function(){
  const rows = MP.levels[MP.getCurrentLevelIdx()].rows;
  const colors = MP.levels[MP.getCurrentLevelIdx()].colors;
  let done=0;
  for(const b of MP.bottles){
    if(b.length===rows){
      if(b.every(c=>c===b[0])) done++;
    }
  }
  const pct = Math.round((done/colors)*100);
  document.getElementById('progress-bar').style.width = pct+'%';
};

MP.checkWin = function(){
  const rows = MP.levels[MP.getCurrentLevelIdx()].rows;
  const colors = MP.levels[MP.getCurrentLevelIdx()].colors;
  let done=0;
  for(const b of MP.bottles){
    if(b.length===rows && b.every(c=>c===b[0])) done++;
  }
  if(done===colors){
    setTimeout(()=>MP.showWin(),400);
  }
};

MP.doUndo = function(){
  if(MP.moveHistory.length===0){MP.showToast('没有可以撤回的步骤哦','🙈');return;}
  const last = MP.moveHistory.pop();
  const fromB = MP.bottles[last.from];
  const toB = MP.bottles[last.to];
  for(let i=0;i<last.count;i++){
    fromB.push(toB.pop());
  }
  MP.moves--;
  MP.selectedBottle=null;
  MP.renderAll();
  MP.updateProgress();
  MP.showToast('已撤回','↩');
};

MP.doHint = function(){
  const rows = MP.levels[MP.getCurrentLevelIdx()].rows;

  for(let from=0;from<MP.bottles.length;from++){
    const fb = MP.bottles[from];
    if(fb.length===0) continue;
    const tc = fb[fb.length-1];
    let same=0;
    for(let k=fb.length-1;k>=0 && fb[k]===tc;k--) same++;

    for(let to=0;to<MP.bottles.length;to++){
      if(from===to) continue;
      const tb = MP.bottles[to];
      if(tb.length===rows) continue;
      if(tb.length===0 || tb[tb.length-1]===tc){
        const space = rows - tb.length;
        if(space>=same && fb.length===same) continue;
        MP.hintBottles = [from,to];
        MP.showToast('试试这个组合吧！','💡');
        MP.selectedBottle=null;
        MP.renderAll();
        setTimeout(()=>{
          const units = document.querySelectorAll('.bottle-unit');
          if(units[from]) units[from].style.boxShadow = '0 0 0 4px #fdcb6e';
          if(units[to]) units[to].style.boxShadow = '0 0 0 4px #fdcb6e';
          setTimeout(()=>{
            if(units[from]) units[from].style.boxShadow = '';
            if(units[to]) units[to].style.boxShadow = '';
          },1500);
        },100);
        return;
      }
    }
  }

  for(let from=0;from<MP.bottles.length;from++){
    const fb = MP.bottles[from];
    if(fb.length===0) continue;
    for(let to=0;to<MP.bottles.length;to++){
      if(from===to) continue;
      const tb = MP.bottles[to];
      if(tb.length>=rows) continue;
      if(tb.length===0 || tb[tb.length-1]===fb[fb.length-1]){
        MP.hintBottles = [from,to];
        MP.showToast('试试这个吧！','💡');
        MP.selectedBottle=null;
        MP.renderAll();
        setTimeout(()=>{
          const units = document.querySelectorAll('.bottle-unit');
          if(units[from]) units[from].style.boxShadow = '0 0 0 4px #fdcb6e';
          if(units[to]) units[to].style.boxShadow = '0 0 0 4px #fdcb6e';
          setTimeout(()=>{
            if(units[from]) units[from].style.boxShadow = '';
            if(units[to]) units[to].style.boxShadow = '';
          },1500);
        },100);
        return;
      }
    }
  }
  MP.showToast('没有找到可用的移动','😅');
};

MP.doReset = function(){
  MP.moveHistory=[];
  MP.setupLevel(MP.getCurrentLevelIdx());
};

MP.goNextLevel = function(){
  if(MP.getCurrentLevelIdx()+1 < MP.levels.length){
    MP.setupLevel(MP.getCurrentLevelIdx()+1);
  }else{
    MP.showToast('🎓 你已经是最强魔导师了！');
  }
};
