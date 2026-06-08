window.MP = window.MP || {};

MP.shuffle = function(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
};

MP.showToast = function(msg,icon){
  icon = icon || '';
  const el = document.createElement('div');
  el.className = 'tooltip-bubble';
  el.textContent = icon+' '+msg;
  el.style.left = '50%';el.style.top = '50%';
  el.style.transform = 'translate(-50%,-50%)';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1600);
};
