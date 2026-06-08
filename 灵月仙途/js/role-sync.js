window.RoleSync = {
  init() {
    this._syncRoleId();
    this._setupStorageListener();
    this._setupWalkFireSync();
  },
  
  _syncRoleId() {
    const sources = {
      currentRoleId: localStorage.getItem('currentRoleId'),
      roleId: localStorage.getItem('roleId'),
      selectedCharacterId: localStorage.getItem('selectedCharacterId')
    };
    
    const validIds = Object.values(sources).filter(id => id && id !== 'null' && id !== 'undefined');
    
    if (validIds.length === 0) return;
    
    let targetId = sources.currentRoleId || sources.roleId || sources.selectedCharacterId;
    
    localStorage.setItem('currentRoleId', targetId);
    localStorage.setItem('roleId', targetId);
    localStorage.setItem('selectedCharacterId', targetId);
    
    if (window.APP_CONFIG) {
      window.APP_CONFIG.currentRoleId = targetId;
    }
  },
  
  _setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'currentRoleId' || e.key === 'roleId' || e.key === 'selectedCharacterId') {
        this._syncRoleId();
      }
      if (e.key === 'walkFireUntil' || e.key === 'walkFireActive') {
        this._notifyWalkFireChange();
      }
    });
  },
  
  _setupWalkFireSync() {
    this._walkFireTimer = null;
    this._checkWalkFireStatus();
    this._walkFireCheckInterval = setInterval(() => {
      this._checkWalkFireStatus();
    }, 30000);
  },
  
  _checkWalkFireStatus() {
    const walkFireUntil = localStorage.getItem('walkFireUntil');
    const isActive = walkFireUntil && new Date(walkFireUntil).getTime() > Date.now();
    
    if (isActive) {
      this._showWalkFireIndicator(walkFireUntil);
    } else {
      this._hideWalkFireIndicator();
    }
  },
  
  setWalkFireStatus(isActive, walkFireUntil) {
    if (isActive && walkFireUntil) {
      localStorage.setItem('walkFireUntil', walkFireUntil);
      localStorage.setItem('walkFireActive', 'true');
    } else {
      localStorage.removeItem('walkFireUntil');
      localStorage.removeItem('walkFireActive');
    }
    this._notifyWalkFireChange();
  },
  
  isWalkFireActive() {
    const walkFireUntil = localStorage.getItem('walkFireUntil');
    return walkFireUntil && new Date(walkFireUntil).getTime() > Date.now();
  },
  
  _notifyWalkFireChange() {
    this._checkWalkFireStatus();
    window.dispatchEvent(new CustomEvent('walkFireStatusChanged', {
      detail: { isActive: this.isWalkFireActive(), walkFireUntil: localStorage.getItem('walkFireUntil') }
    }));
  },
  
  _showWalkFireIndicator(walkFireUntil) {
    let indicator = document.getElementById('globalWalkFireIndicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'globalWalkFireIndicator';
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        background: linear-gradient(90deg, rgba(255,68,68,0.9), rgba(255,136,0,0.9), rgba(255,68,68,0.9));
        color: white;
        text-align: center;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 700;
        font-family: 'Microsoft YaHei', sans-serif;
        letter-spacing: 2px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(255,68,68,0.5);
        animation: walkFireSlideIn 0.3s ease-out;
      `;
      indicator.onclick = () => {
        const basePath = window.location.pathname.includes('/') ? 
          window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) : '';
        const prefix = basePath.includes('/') ? '' : '';
        const isSubDir = window.location.pathname.split('/').length > 3;
        window.location.href = isSubDir ? '../cultivation.html' : 'cultivation.html';
      };
      document.body.appendChild(indicator);
      
      if (!document.getElementById('walkFireIndicatorStyle')) {
        const style = document.createElement('style');
        style.id = 'walkFireIndicatorStyle';
        style.textContent = `
          @keyframes walkFireSlideIn {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes walkFirePulse {
            0%, 100% { opacity: 0.85; }
            50% { opacity: 1; }
          }
          #globalWalkFireIndicator { animation: walkFirePulse 2s ease-in-out infinite; }
        `;
        document.head.appendChild(style);
      }
    }
    
    const endTime = new Date(walkFireUntil).getTime();
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 60000));
    indicator.textContent = `🔥 走火入魔中 · 剩余${remaining}分钟 · 点击前往修炼`;
    indicator.style.display = 'block';
  },
  
  _hideWalkFireIndicator() {
    const indicator = document.getElementById('globalWalkFireIndicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  },
  
  getCurrentRoleId() {
    return localStorage.getItem('currentRoleId') || 
           localStorage.getItem('roleId') || 
           localStorage.getItem('selectedCharacterId');
  },
  
  setCurrentRoleId(roleId) {
    localStorage.setItem('currentRoleId', roleId);
    localStorage.setItem('roleId', roleId);
    localStorage.setItem('selectedCharacterId', roleId);
    
    if (window.APP_CONFIG) {
      window.APP_CONFIG.currentRoleId = roleId;
    }
  }
};

window.RoleSync.init();
