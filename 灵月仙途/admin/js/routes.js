// 路由管理系统 - v1.1
class Router {
  constructor() {
    this.routes = {
      dashboard: { title: '数据统计', module: 'dashboard' },
      users: { title: '玩家管理', module: 'users' },
      configs: { title: '游戏配置', module: 'configs' },
      realmBreak: { title: '境界突破', module: 'realmBreak' },
      assetTypes: { title: '资产管理', module: 'assetTypes' },
      assetTypeConfig: { title: '资产类型配置', module: 'assetTypeConfig' },
      roleAssets: { title: '角色资产', module: 'roleAssets' },
      assetRecords: { title: '资产记录', module: 'assetRecords' },
      bodyCultivation: { title: '体修管理', module: 'bodyCultivation' },
      checkin: { title: '签到管理', module: 'checkin' },
      cultivation: { title: '修为管理', module: 'cultivation' },
      equipment: { title: '装备管理', module: 'equipment' },
      inventory: { title: '背包管理', module: 'inventory' },
      items: { title: '物品管理', module: 'items' },
      newbieGift: { title: '新手礼包', module: 'newbieGift' },
      resources: { title: '资源管理', module: 'resources' },
      rewards: { title: '奖励管理', module: 'rewards' },
      tasks: { title: '任务管理', module: 'tasks' },
      trade: { title: '交易管理', module: 'trade' },
      sysUsers: { title: '系统用户', module: 'sysUsers' },
      sysRoles: { title: '系统角色', module: 'sysRoles' },
      clanManagement: { title: '宗门管理', module: 'clanManagement' },
      sysMenus: { title: '公共菜单', module: 'sysMenus' },
      permissions: { title: '权限管理', module: 'permissions' },
      skills: { title: '技能管理', module: 'skills' },
      roleSkills: { title: '角色技能', module: 'roleSkills' },
      maps: { title: '地图管理', module: 'maps' },
      leaderboard: { title: '排行榜', module: 'leaderboard' },
      background: { title: '背景设置', module: 'background' },
      settings: { title: '参数配置', module: 'settings' },
      mail: { title: '邮件管理', module: 'mail' },
      activities: { title: '活动管理', module: 'activities' },
      achievements: { title: '成就管理', module: 'achievements' },
      chat: { title: '聊天管理', module: 'chat' },
      logs: { title: '系统日志', module: 'logs' }
    };
    this.currentModule = null;
    this.init();
  }

  init() {
    // 监听哈希变化
    window.addEventListener('hashchange', () => this.handleHashChange());
    // 初始化时处理当前哈希
    this.handleHashChange();
    // 绑定导航链接点击事件
    this.bindNavLinks();
  }

  bindNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const module = link.getAttribute('data-module');
        if (module) {
          this.navigateTo(module);
          // 点击菜单时滚动到页面顶部
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 50);
        }
      });
    });
  }

  handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      this.loadModule(hash);
    } else {
      this.navigateTo('dashboard');
    }
  }

  navigateTo(module) {
    window.location.hash = module;
  }

  async loadModule(moduleName) {
    if (!this.routes[moduleName]) {
      console.error(`Module ${moduleName} not found`);
      return;
    }

    // 权限检查
    if (!this.checkPermission(moduleName)) {
      const contentArea = document.getElementById('content-area');
      contentArea.innerHTML = `<div style="text-align: center; padding: 50px; color: #e74c3c;">您没有权限访问此模块</div>`;
      return;
    }

    // 更新页面标题
    document.getElementById('page-title').textContent = this.routes[moduleName].title;

    // 标记当前导航项为活动状态
    this.updateNavActive(moduleName);

    // 加载模块内容
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">加载中...</div>';

    try {
      // 动态构建模块路径
      const basePath = window.location.pathname.replace(/[^/]+$/, '');
      const response = await fetch(`${basePath}modules/${moduleName}.html`);
      if (response.ok) {
        let content = await response.text();
        
        // 提取并执行所有内联脚本
        const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
        const scripts = [];
        let match;
        while ((match = scriptRegex.exec(content)) !== null) {
          const scriptContent = match[1];
          if (scriptContent && scriptContent.trim()) {
            scripts.push(scriptContent);
          }
        }
        // 移除所有 script 标签
        content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
        
        // 移除完整HTML文件的结构（如果存在）
        content = content.replace(/^<!DOCTYPE[^>]*>/i, '');
        content = content.replace(/^<html[^>]*>/i, '');
        content = content.replace(/^<head[^>]*>[\s\S]*?<\/head>/i, '');
        content = content.replace(/^<body[^>]*>/i, '');
        content = content.replace(/<\/body>\s*<\/html>$/i, '');
        
        // 设置 HTML 内容（不含 script 标签）
        contentArea.innerHTML = content;
        this.currentModule = moduleName;
        
        // 执行所有脚本 - 使用更安全的方式
        scripts.forEach((scriptContent, index) => {
          try {
            // 清理脚本内容
            const cleanedScript = scriptContent
              .replace(/<!--[\s\S]*?-->/g, '') // 移除 HTML 注释
              .replace(/^\s*[\r\n]/gm, '') // 移除空行
              .trim();
            
            if (cleanedScript) {
              console.log(`Executing script ${index + 1}:`);
              console.log('Script length:', cleanedScript.length);
              
              // 验证脚本内容是否完整
              if (cleanedScript.length < 5) {
                console.warn(`Script ${index + 1} is too short, skipping execution`);
                return;
              }
              
              // 创建 script 元素执行，避免使用 eval
              const scriptEl = document.createElement('script');
              scriptEl.textContent = cleanedScript;
              try {
                // 先验证脚本语法是否正确
                new Function(cleanedScript);
                
                document.head.appendChild(scriptEl);
                document.head.removeChild(scriptEl); // 执行后移除
                console.log(`Script ${index + 1} executed successfully`);
              } catch (execError) {
                console.error(`Error executing script ${index + 1}:`, execError);
                console.error('Script content:', cleanedScript.substring(0, 1000));
              }
            }
          } catch (e) {
            console.error(`Error processing script ${index + 1}:`, e);
            console.error('Script content:', scriptContent.substring(0, 500));
          }
        });
        
        // 延迟执行模块初始化
        setTimeout(() => {
          this.initModule(moduleName);
        }, 100);
      } else {
        contentArea.innerHTML = `<div style="text-align: center; padding: 50px; color: #e74c3c;">加载模块失败: ${response.status}</div>`;
      }
    } catch (error) {
      console.error('Error loading module:', error);
      contentArea.innerHTML = `<div style="text-align: center; padding: 50px; color: #e74c3c;">加载模块失败: ${error.message}</div>`;
    }
  }

  // 检查权限
  checkPermission(moduleName) {
    // 这里可以实现更复杂的权限检查逻辑
    // 暂时返回true，后续可以从后端获取用户权限
    return true;
  }

  updateNavActive(moduleName) {
    // 移除所有活动状态
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    // 添加当前模块的活动状态
    const activeLink = document.querySelector(`.nav-link[data-module="${moduleName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  initModule(moduleName) {
    // 执行模块特定的初始化函数
    const initFunction = window[`init${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`];
    if (typeof initFunction === 'function') {
      initFunction();
    }
  }
}

// 初始化路由
window.addEventListener('DOMContentLoaded', () => {
  window.router = new Router();
});

// 辅助函数
function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function logout() {
  if (confirm('确定要退出登录吗？')) {
    // 调用AdminAPI的logout方法，确保退出逻辑的一致性
    if (window.AdminAPI && window.AdminAPI.logout) {
      AdminAPI.logout();
    } else {
      // 备用方案
      localStorage.removeItem('adminSession');
      window.location.href = '/admin/login.html';
    }
  }
}

function searchData() {
  const searchTerm = document.getElementById('globalSearch').value.toLowerCase();
  console.log('搜索:', searchTerm);
  // 这里可以实现全局搜索逻辑
}

// 模态框管理
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeModal() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
}

// 点击模态框外部关闭
window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });
};