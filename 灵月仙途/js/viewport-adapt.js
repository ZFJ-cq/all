(function() {
  var DESIGN_WIDTH = 375;
  var BASE_FONT_SIZE = 16;

  function setScale() {
    var clientWidth = document.documentElement.clientWidth || window.innerWidth;
    var scale = clientWidth / DESIGN_WIDTH;
    scale = Math.max(0.7, Math.min(1.5, scale));
    document.documentElement.style.fontSize = BASE_FONT_SIZE * scale + 'px';

    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }

  setScale();

  var timer;
  window.addEventListener('resize', function() {
    clearTimeout(timer);
    timer = setTimeout(setScale, 100);
  });

  window.addEventListener('orientationchange', function() {
    setTimeout(setScale, 300);
  });

  document.addEventListener('DOMContentLoaded', function() {
    setScale();
    if (!document.getElementById('landscape-warning')) {
      var el = document.createElement('div');
      el.id = 'landscape-warning';
      el.innerHTML = '<div class="lw-icon">\uD83D\uDCF1</div><div class="lw-text">\u8BF7\u65CB\u8F6C\u624B\u673A\u81F3\u7AD6\u5C4F\u6A21\u5F0F</div>';
      document.body.appendChild(el);
    }
  });
})();
