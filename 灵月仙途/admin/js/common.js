// 通用函数和工具方法

// 显示状态消息
function showMessage(elementId, message, type = 'success') {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = `status-message ${type}`;
    setTimeout(() => {
      element.className = 'status-message';
    }, 3000);
  }
}

// 格式化数字
function formatNumber(num) {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + ' 亿';
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + 'w';
  }
  return num.toString();
}

// 生成随机ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 验证邮箱格式
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// 验证手机号格式
function validatePhone(phone) {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// 节流函数
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 深拷贝对象
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 时间格式化
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 计算时间差
function getTimeDiff(startTime, endTime) {
  const diff = Math.abs(endTime - startTime);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

// 生成随机颜色
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 滚动到指定元素
function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// 检查元素是否在视口中
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// 本地存储操作
const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};

// API请求封装
async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        // 未授权，跳转到登录页面
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '../login.html';
        return;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// 表格分页
function setupPagination(total, pageSize, currentPage, callback) {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    total,
    pageSize,
    currentPage,
    totalPages,
    next() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        callback(this.currentPage);
      }
    },
    prev() {
      if (this.currentPage > 1) {
        this.currentPage--;
        callback(this.currentPage);
      }
    },
    goTo(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        callback(this.currentPage);
      }
    }
  };
}

// 导出Excel
function exportToExcel(data, filename) {
  const csvContent = "data:text/csv;charset=utf-8," + data.map(row => row.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 导入Excel
function importFromExcel(inputId, callback) {
  const input = document.getElementById(inputId);
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        callback(event.target.result);
      };
      reader.readAsText(file);
    }
  });
}

// 图片上传预览
function previewImage(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        preview.src = event.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
}

// 初始化所有模块
function initAllModules() {
  // 初始化所有模块的函数
  const modules = [
    'dashboard', 'users', 'realmBreak', 'assetTypes', 'roleAssets',
    'sysUsers', 'sysRoles', 'sysMenus', 'permissions', 'skills',
    'roleSkills', 'maps', 'leaderboard', 'background', 'settings',
    'mail', 'activities', 'logs'
  ];
  
  modules.forEach(module => {
    const initFunction = window[`init${module.charAt(0).toUpperCase() + module.slice(1)}`];
    if (typeof initFunction === 'function') {
      try {
        initFunction();
      } catch (error) {
        console.error(`Error initializing ${module}:`, error);
      }
    }
  });
}

// 监听页面加载完成
window.addEventListener('DOMContentLoaded', () => {
  // 初始化通用功能
  console.log('Admin common functions initialized');
});

// 暴露全局变量
window.Common = {
  showMessage,
  formatNumber,
  generateId,
  validateEmail,
  validatePhone,
  debounce,
  throttle,
  deepClone,
  formatDate,
  getTimeDiff,
  getRandomColor,
  scrollToElement,
  isElementInViewport,
  Storage,
  apiRequest,
  setupPagination,
  exportToExcel,
  importFromExcel,
  previewImage,
  initAllModules
};

// 统一的 API 响应处理函数
function handleApiResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json().then(data => {
    // 处理 Result 包装格式
    if (data.code !== undefined) {
      if (data.code === 200 || data.code === 0) {
        return data.data;
      } else {
        throw new Error(data.message || '请求失败');
      }
    }
    // 直接返回数据（兼容旧格式）
    return data;
  });
}

function handleResponse(response) {
  return handleApiResponse(response);
}

function showSuccessMessage(message) {
  const msgEl = document.getElementById('globalMessage') || document.getElementById('assetMessage') || document.getElementById('sysMenuMessage') || document.getElementById('realmBreakMessage');
  if (msgEl) {
    showMessage(msgEl.id, message, 'success');
  } else {
    console.log('[Success]', message);
  }
}

function showErrorMessage(message) {
  const msgEl = document.getElementById('globalMessage') || document.getElementById('assetMessage') || document.getElementById('sysMenuMessage') || document.getElementById('realmBreakMessage');
  if (msgEl) {
    showMessage(msgEl.id, message, 'error');
  } else {
    console.error('[Error]', message);
  }
}

function formatDateTime(date) {
  return formatDate(date);
}

function logEvent(level, message) {
  const timestamp = formatDate(new Date());
  if (level === 'error') {
    console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  } else if (level === 'warning') {
    console.warn(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  } else {
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
}

window.handleResponse = handleResponse;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.formatDateTime = formatDateTime;
window.logEvent = logEvent;

window.handleApiResponse = handleApiResponse;