window.MP = window.MP || {};

var _bestMoves = {};
var _currentLevelIdx = 0;
var _totalStars = 0;

MP.loadStorage = function(){
  try{
    const saved = JSON.parse(localStorage.getItem('ws_best')||'{}');
    _bestMoves = saved.bestMoves || {};
    _currentLevelIdx = saved.currentLevel || 0;
    _totalStars = saved.totalStars || 0;
  }catch(e){
    _bestMoves={};_currentLevelIdx=0;_totalStars=0;
  }
  if(_currentLevelIdx>=MP.levels.length) _currentLevelIdx=0;
  MP.updateNavStats();
};

MP.saveStorage = function(){
  try{
    localStorage.setItem('ws_best',JSON.stringify({
      bestMoves:_bestMoves,
      currentLevel:_currentLevelIdx,
      totalStars:_totalStars,
    }));
  }catch(_){}
};

MP.getBestMoves = function(){ return _bestMoves; };
MP.setBestMove = function(idx,moves){ _bestMoves[idx]=moves; };
MP.getCurrentLevelIdx = function(){ return _currentLevelIdx; };
MP.setCurrentLevelIdx = function(idx){ _currentLevelIdx=idx; };
MP.getTotalStars = function(){ return _totalStars; };
MP.addStars = function(n){ _totalStars+=n; };
