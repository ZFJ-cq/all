window.MP = window.MP || {};

MP.renderAll = function(){
  const area = document.getElementById('bottle-area');
  area.innerHTML = '';
  const rows = MP.levels[MP.getCurrentLevelIdx()].rows;
  const layerPct = 100 / rows;

  MP.bottles.forEach((bottle,idx)=>{
    const unit = document.createElement('div');
    unit.className = 'bottle-unit';
    if(MP.selectedBottle===idx) unit.classList.add('selected');
    if(bottle.length===0) unit.classList.add('empty');
    unit.addEventListener('click',()=>MP.selectBottle(idx));

    const body = document.createElement('div');
    body.className = 'bottle-body';
    body.style.borderColor = MP.selectedBottle===idx ? 'var(--accent2)' : '#ccc';

    const neck = document.createElement('div');
    neck.className = 'bottle-neck';
    neck.style.borderColor = body.style.borderColor;
    body.appendChild(neck);

    bottle.forEach((colorIdx,i)=>{
      const layer = document.createElement('div');
      layer.className = 'bottle-liquid-layer';
      layer.style.backgroundColor = MP.POTIONS[colorIdx].color;
      layer.style.bottom = (i * layerPct)+'%';
      layer.style.height = layerPct+'%';
      if(i === bottle.length - 1){
        layer.style.borderRadius = '0 0 25px 25px';
      }else{
        layer.style.borderRadius = '0';
      }
      body.appendChild(layer);
    });

    unit.appendChild(body);

    const tag = document.createElement('div');
    tag.className = 'bottle-tag';
    tag.textContent = bottle.length+'/'+rows;
    unit.appendChild(tag);

    area.appendChild(unit);
  });

  document.getElementById('move-count').textContent = MP.moves;
};

MP.showWin = function(){
  const prevBest = MP.getBestMoves()[MP.getCurrentLevelIdx()] || Infinity;
  const isNewBest = MP.moves < prevBest;
  if(isNewBest){
    MP.setBestMove(MP.getCurrentLevelIdx(),MP.moves);
  }

  const rows = MP.levels[MP.getCurrentLevelIdx()].rows;
  const colors = MP.levels[MP.getCurrentLevelIdx()].colors;
  const minMoves = colors * (rows-1);
  const midMoves = minMoves * 2;
  let stars = MP.moves<=minMoves?3:MP.moves<=midMoves?2:1;

  const reactions = ['🎉','🥳','🌟','✨','💖','🏆','🦸','🎊'];
  const titles = ['太棒啦！','完美配方！','超级药师！','你是天才！','了不起！'];
  document.getElementById('mascot-reaction').textContent = reactions[Math.floor(Math.random()*reactions.length)];
  document.getElementById('win-title').textContent = titles[Math.floor(Math.random()*titles.length)];
  document.getElementById('win-sub').textContent = '用了 '+MP.moves+' 步完成药剂调配'+(isNewBest?' 🆕新纪录！':'');

  const starRow = document.getElementById('win-stars');
  starRow.innerHTML = '';
  for(let i=0;i<3;i++){
    const s = document.createElement('span');
    s.className = 'star-icon'+(i<stars?' lit':'');
    s.textContent = '⭐';
    s.style.animationDelay = (i*0.2)+'s';
    starRow.appendChild(s);
  }

  document.getElementById('best-move').textContent = MP.getBestMoves()[MP.getCurrentLevelIdx()]+'步';
  MP.addStars(stars);
  MP.updateNavStats();
  MP.saveStorage();

  document.getElementById('win-overlay').classList.add('show');
  MP.spawnConfetti();
  MP.spawnSparkles();
};

MP.closeWin = function(){
  document.getElementById('win-overlay').classList.remove('show');
};

MP.updateNavStats = function(){
  document.getElementById('total-stars').textContent = '⭐ '+MP.getTotalStars();
  document.getElementById('best-level').textContent = '🏆 '+(MP.getCurrentLevelIdx()+1);
};

MP.showLevelPicker = function(){
  const grid = document.getElementById('level-grid');
  grid.innerHTML = '';
  MP.levels.forEach((lv,i)=>{
    const cell = document.createElement('div');
    cell.className = 'level-cell';
    if(i===MP.getCurrentLevelIdx()) cell.classList.add('current');
    else if(MP.getBestMoves()[i]) cell.classList.add('completed');
    else if(i>0 && !MP.getBestMoves()[i-1]) cell.classList.add('locked');

    if(MP.getBestMoves()[i]){
      const t = MP.getBestMoves()[i];
      const rows = lv.rows;const colors = lv.colors;
      const minM = colors*(rows-1);const midM = minM*2;
      const s = t<=minM?3:t<=midM?2:1;
      cell.innerHTML = (i+1)+'<span class="cell-stars">'+('⭐'.repeat(s))+'</span>';
    }else if(i>0 && !MP.getBestMoves()[i-1]){
      cell.textContent = '🔒';
    }else{
      cell.textContent = i+1;
    }

    cell.addEventListener('click',()=>{
      if(i>0 && !MP.getBestMoves()[i-1]) return;
      MP.closePicker();
      MP.setupLevel(i);
    });

    grid.appendChild(cell);
  });
  document.getElementById('picker-overlay').classList.add('show');
};

MP.closePicker = function(){
  document.getElementById('picker-overlay').classList.remove('show');
};
