// 公共函数库

// 导航到宗门相关页面的公共函数
async function navigateToGuildPage() {
  try {
    console.log('=== navigateToGuildPage 开始执行 ===');
    
    // 获取角色 ID
    let roleId = localStorage.getItem('currentRoleId') || localStorage.getItem('roleId');
    console.log('获取到的 roleId:', roleId);
    
    if (!roleId) {
      console.warn('⚠️ navigateToGuildPage: 未检测到 roleId，跳转到角色创建页面');
      // 没有角色，跳转到角色创建页面
      window.location.href = '/character-create/character-create-step1.html';
      return;
    }

    // 获取当前页面路径
    const currentPath = window.location.pathname;
    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    console.log('当前页面:', currentPage);
    
    // 如果当前已经在我的宗门页面，不跳转
    if (currentPage === 'my-clan.html') {
      console.log('已在宗门页面，不跳转');
      return;
    }

    console.log('跳转到我的宗门页面');
    // 直接跳转到我的宗门页面
    window.location.href = '/clan/my-clan.html';
  } catch (error) {
    console.error('❌ navigateToGuildPage 执行失败:', error);
    // 发生错误时跳转到我的宗门页面
    window.location.href = '/clan/my-clan.html';
  }
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    navigateToGuildPage
  };
}

// 全局对象
if (typeof window !== 'undefined') {
  window.pageUtils = window.pageUtils || {};
  window.pageUtils.navigateToGuildPage = navigateToGuildPage;
}
