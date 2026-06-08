/**
 * 登录状态检查模块 - 同步检查版本
 * 在所有需要登录的页面中引入
 * 
 * 使用方法：
 * <script src="js/auth-check.js"></script>
 */
(function() {
  const PUBLIC_PAGES = [
    '/login.html',
    '/register.html',
    '/clear-token.html',
    '/fix-token.html',
    '/news/news-list.html',
    '/admin/login.html'
  ];
  
  function isPublicPage() {
    const path = window.location.pathname;
    return PUBLIC_PAGES.some(publicPath => path.endsWith(publicPath));
  }
  
  function checkLoginStatusSync() {
    if (isPublicPage()) {
      return true;
    }
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      console.warn('未登录，但不强制跳转');
      // 不跳转，允许用户继续浏览
      // const redirect = encodeURIComponent(window.location.href);
      // window.location.href = '/login.html?redirect=' + redirect;
      return false;
    }
    
    try {
      // 安全的 Token 解析
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const tokenPayload = JSON.parse(atob(parts[1]));
          const now = Date.now() / 1000;
          if (tokenPayload.exp && tokenPayload.exp < now) {
            console.warn('Token 已过期，但不清除数据');
            // 不清除数据，允许用户继续浏览
            // localStorage.removeItem('token');
            // localStorage.removeItem('userId');
            // localStorage.removeItem('roleId');
            // const redirect = encodeURIComponent(window.location.href);
            // window.location.href = '/login.html?redirect=' + redirect;
            return false;
          }
        } catch (e) {
          console.warn('Token 解析失败，但不清除数据');
        }
      }
      console.log('已登录，用户 ID:', userId);
    } catch (e) {
      console.error('Token 检查失败:', e);
      // 解析失败时不清除数据，允许继续执行
      console.warn('Token 解析失败，但不清除数据，允许继续执行');
    }
    
    return true;
  }
  
  const script = document.currentScript;
  if (script && !script.hasAttribute('defer-check')) {
    checkLoginStatusSync();
  }
  
  window.AuthCheck = {
    checkLoginStatusSync,
    isPublicPage,
    checkLoginStatus: checkLoginStatusSync
  };
})();
