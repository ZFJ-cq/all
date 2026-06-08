/**
 * 页面跳转工具函数
 * 提供页面跳转、参数传递、加载动画等功能
 */
const pageUtils = {
  // 跳转到指定页面，支持传递参数
  navigateTo(page, params = {}) {
    // 添加加载动画
    this.showLoading();
    
    // 构建带参数的URL
    const url = new URL(page, window.location.href);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    // 延迟跳转，显示加载动画
    setTimeout(() => {
      window.location.href = url.toString();
    }, 300);
  },
  
  // 显示加载动画
  showLoading() {
    // 检查是否已存在加载动画
    if (document.querySelector('.page-loading')) {
      return;
    }
    
    const loading = document.createElement('div');
    loading.className = 'page-loading';
    loading.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    `;
    loading.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: #e6c749;
    `;
    
    // 添加加载动画样式
    const style = document.createElement('style');
    style.textContent = `
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(230, 199, 73, 0.3);
        border-top-color: #e6c749;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 15px;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .loading-text {
        font-size: 16px;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(loading);
  },
  
  // 隐藏加载动画
  hideLoading() {
    const loading = document.querySelector('.page-loading');
    if (loading) {
      loading.remove();
    }
  },
  
  // 从URL获取参数
  getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },
  
  // 显示提示信息
  showToast(message, duration = 2000) {
    // 检查是否已存在toast
    if (document.querySelector('.page-toast')) {
      return;
    }
    
    const toast = document.createElement('div');
    toast.className = 'page-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: #e6c749;
      padding: 15px 30px;
      border-radius: 8px;
      border: 1px solid #e6c749;
      font-size: 14px;
      z-index: 10000;
      animation: toastFade 0.3s ease;
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes toastFade {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    
    // 自动隐藏
    setTimeout(() => {
      toast.remove();
    }, duration);
  },
  
  // 页面初始化时隐藏加载动画
  initPage() {
    this.hideLoading();
    
    // 添加页面进入动画
    const mainContent = document.querySelector('.main-container, .container');
    if (mainContent) {
      mainContent.style.opacity = '0';
      mainContent.style.transform = 'translateY(20px)';
      mainContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      setTimeout(() => {
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'translateY(0)';
      }, 100);
    }
  }
};

// 暴露给全局
if (typeof window !== 'undefined') {
  window.pageUtils = pageUtils;
}
