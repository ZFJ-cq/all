/**
 * 401 错误统一处理脚本
 * 在所有页面加载时自动执行
 * 
 * 功能：
 * 1. 拦截所有 401 错误
 * 2. 不弹窗、不跳转
 * 3. 只在控制台记录日志
 * 4. 允许页面继续执行
 */

(function() {
  console.log('️ 401 错误统一处理已加载');
  
  // 配置：哪些页面需要特殊处理
  const CONFIG = {
    // 公开页面（不需要登录）
    publicPages: [
      '/login.html',
      '/register.html',
      '/clear-token.html',
      '/fix-token.html',
      '/debug.html',
      '/test-localstorage.html',
      '/news/news-list.html'
    ],
    
    // 需要登录的页面
    protectedPages: [
      '/index.html',
      '/skills/skills.html',
      '/cultivation.html',
      '/clan/clan-list.html',
      '/word/world.html',
      '/assets/assets.html',
      '/body-training.html',
      '/friends.html',
      '/character/character.html'
    ]
  };
  
  /**
   * 检查当前页面是否是公开页面
   */
  function isPublicPage() {
    const path = window.location.pathname;
    return CONFIG.publicPages.some(publicPath => path.endsWith(publicPath));
  }
  
  /**
   * 统一的 401 错误处理
   */
  function handle401Error(endpoint, errorData) {
    // 只记录日志，不弹窗，不跳转
    console.log(`⚠️ 401 错误 [${endpoint}]:`, errorData?.message || 'Token 无效');
    
    // 不执行任何操作，让页面继续运行
    // 页面应该使用默认数据或本地计算
  }
  
  /**
   * 检查登录状态（不强制跳转）
   */
  function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      console.log('📝 未登录状态，但允许继续浏览');
      return false;
    }
    
    console.log('✅ 已登录，用户 ID:', userId);
    return true;
  }
  
  /**
   * 页面加载时执行
   */
  function onPageLoad() {
    console.log('🚀 页面加载完成');
    
    // 检查登录状态（不强制跳转）
    checkLoginStatus();
    
    // 如果是公开页面，跳过检查
    if (isPublicPage()) {
      console.log('📄 公开页面，跳过登录检查');
      return;
    }
  }
  
  // 暴露到全局，供其他脚本使用
  window.Global401Handler = {
    handle401Error,
    checkLoginStatus,
    isPublicPage,
    CONFIG
  };
  
  // 页面加载时执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onPageLoad);
  } else {
    onPageLoad();
  }
  
  console.log('✅ 401 错误统一处理已激活');
})();
