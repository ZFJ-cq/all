window.MP = window.MP || {};

MP.spawnConfetti = function(){
  const colors = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0'];
  for(let i=0;i<40;i++){
    setTimeout(()=>{
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random()*100+'%';
      el.style.top = -(Math.random()*20)+'px';
      el.style.width = (6+Math.random()*10)+'px';
      el.style.height = (6+Math.random()*10)+'px';
      el.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
      el.style.borderRadius = Math.random()>.5?'50%':'2px';
      el.style.animationDuration = (1.5+Math.random()*2)+'s';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),3500);
    },i*30);
  }
};

MP.spawnSparkles = function(){
  const container = document.getElementById('sparkle-container');
  const emojis = ['✨','🌟','💫','🎉','💖','🧪','⭐','🎀'];
  for(let i=0;i<12;i++){
    setTimeout(()=>{
      const el = document.createElement('div');
      el.className = 'sparkle';
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      el.style.left = (10+Math.random()*80)+'%';
      el.style.top = (10+Math.random()*60)+'%';
      el.style.animationDuration = (1+Math.random()*1.5)+'s';
      container.appendChild(el);
      setTimeout(()=>el.remove(),2000);
    },i*100);
  }
};
