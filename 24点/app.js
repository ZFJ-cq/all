window.G24 = window.G24 || {};

G24.init = function () {
  G24.initServerInfo();
  G24.tryResumeRoomSession();
};

document.addEventListener('DOMContentLoaded', function () {
  G24.init();
});