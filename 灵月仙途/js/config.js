/**
 * 灵月仙途 - 全局配置
 * 
 * 功能：
 * 1. 统一管理 API 基础路径
 * 2. 自动获取和存储角色 ID
 * 3. 错误处理和提示
 */

// 环境配置
const environments = {
    development: {
        API_BASE_URL: 'http://localhost:8088/api',  // 后端配置了 context-path: /api
        DEBUG_MODE: true
    },
    test: {
        API_BASE_URL: 'http://test-api.lingyuexiantu.com/api',
        DEBUG_MODE: true
    },
    production: {
        API_BASE_URL: 'https://api.lingyuexiantu.com/api',
        DEBUG_MODE: false
    }
};

// 获取当前服务器的完整地址（用于局域网访问）
function getServerAddress() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return null;
    }
    
    if (hostname.match(/^192\.168\./) || hostname.match(/^10\./) || hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
        return `http://${hostname}:8088/api`;
    }
    
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:8088/api`;
    }
    
    return null;
}

// 改进的环境检测逻辑
function detectEnvironment() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    }
    
    // 局域网 IP 访问也使用开发环境配置
    if (hostname.match(/^192\.168\./) || hostname.match(/^10\./) || hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
        return 'development';
    }
    
    if (hostname.includes('test') || port === '8081') {
        return 'test';
    }
    
    return 'production';
}

const currentEnvironment = detectEnvironment();
const envConfig = environments[currentEnvironment];

const serverAddress = getServerAddress();

console.log(`当前环境：${currentEnvironment}`);

window.getApiBaseUrl = function() {
    if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
        return window.APP_CONFIG.API_BASE_URL;
    }
    const hostname = window.location.hostname;
    if (hostname.match(/^192\.168\./) || hostname.match(/^10\./) || hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
        return `http://${hostname}:8088/api`;
    }
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:8088/api`;
    }
    return 'http://localhost:8088/api';
};

window.getApiBaseHost = function() {
    return window.getApiBaseUrl().replace(/\/api$/, '');
};

// 全局配置
window.APP_CONFIG = {
    API_BASE_URL: serverAddress || envConfig.API_BASE_URL,
    DEBUG_MODE: envConfig.DEBUG_MODE,
    ENVIRONMENT: currentEnvironment,
    currentUserId: null,
    currentRoleId: null,
    userInfo: null,
    _initialized: false,
    
    async init() {
        if (this._initialized) {
            console.log('=== APP_CONFIG 已经初始化，跳过 ===');
            return;
        }
        
        console.log('=== APP_CONFIG 初始化 ===');
        this._initialized = true;
        
        // 始终优先从 localStorage 读取，确保数据可靠性
        const storedUserId = localStorage.getItem('userId');
        const storedRoleId = localStorage.getItem('roleId') || localStorage.getItem('currentRoleId');
        
        this.currentUserId = (storedUserId && storedUserId !== 'undefined' && storedUserId !== 'null') ? storedUserId : null;
        this.currentRoleId = (storedRoleId && storedRoleId !== 'undefined' && storedRoleId !== 'null') ? storedRoleId : null;
        
        // 如果 localStorage 没有数据，再尝试从 roleStore 获取（作为后备）
        if (!this.currentUserId && window.roleStore) {
            try {
                const user = window.roleStore.getUser();
                const role = window.roleStore.getRole();
                if (user && user.id) {
                    this.currentUserId = user.id;
                    this.currentRoleId = role ? role.id : null;
                }
            } catch (e) {
                console.log('从 roleStore 获取失败，使用 localStorage');
            }
        }
        
        // 最后尝试从 RoleValidator 获取（作为最后的后备）
        if (!this.currentUserId && window.RoleValidator) {
            this.currentUserId = window.RoleValidator.getUserId();
            this.currentRoleId = window.RoleValidator.getRoleId();
        }
        
        if (this.DEBUG_MODE) {
            console.log('从 localStorage 加载:', {
                userId: this.currentUserId,
                roleId: this.currentRoleId
            });
        }
        
        if (!this.currentRoleId && this.currentUserId) {
            console.log('角色 ID 不存在，尝试从服务器获取...');
            await this.fetchUserInfo();
        }
        
        if (this.DEBUG_MODE) {
            console.log('APP_CONFIG 初始化完成:', {
                userId: this.currentUserId,
                roleId: this.currentRoleId
            });
        }
    },
    
    async fetchUserInfo() {
        try {
            if (this.DEBUG_MODE) {
                console.log('获取用户信息，userId:', this.currentUserId);
            }
            
            const roles = await window.apiService.getRole(this.currentUserId);
            
            if (this.DEBUG_MODE) {
                console.log('获取到的角色列表:', roles);
            }
            
            if (roles && roles.length > 0) {
                this.currentRoleId = roles[0].id;
                localStorage.setItem('roleId', this.currentRoleId);
                
                this.userInfo = await window.apiService.getUserInfo(this.currentUserId);
                
                if (window.roleStore) {
                    const userData = {
                        id: this.currentUserId,
                        username: this.userInfo.username,
                        token: this.userInfo.token
                    };
                    
                    const roleData = {
                        id: roles[0].id,
                        name: roles[0].name,
                        realm: roles[0].realm,
                        assets: roles[0].assets || {},
                        level: roles[0].level || 0,
                        experience: roles[0].experience || 0,
                        attributes: roles[0].attributes || {
                            qi: 0,
                            mana: 0,
                            strength: 0,
                            agility: 0,
                            intelligence: 0
                        }
                    };
                    
                    await window.roleStore.initialize(userData, roleData);
                }
                
                return true;
            } else {
                console.warn('用户没有角色，需要创建角色');
                return false;
            }
        } catch (error) {
            if (this.DEBUG_MODE) {
                console.error('获取用户信息失败:', error);
            }
            return false;
        }
    },
    
    clearUserInfo() {
        this.currentUserId = null;
        this.currentRoleId = null;
        this.userInfo = null;
        
        if (this.DEBUG_MODE) {
            console.log('用户信息已清除（保留 localStorage 数据）');
        }
    }
};

/**
 * UI 工具函数
 */
window.uiUtils = {
    /**
     * 显示加载提示
     */
    showLoading(containerId, message = '加载中...') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--gold-primary); padding: 50px 0;">
                    <div style="font-size: 1rem;">${message}</div>
                </div>
            `;
        }
    },
    
    /**
     * 显示错误提示
     */
    showError(containerId, message, showRetry = true) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--danger); padding: 50px 0;">
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">加载失败</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">${message}</div>
                    ${showRetry ? `<button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: var(--gold-primary); border: none; border-radius: 5px; cursor: pointer; color: #000;">重新加载</button>` : ''}
                </div>
            `;
        }
    },
    
    /**
     * 显示提示消息
     */
    showToast(message, type = 'info') {
        const colors = {
            info: 'var(--gold-primary)',
            success: 'var(--success)',
            error: 'var(--danger)'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type] || colors.info};
            color: #000;
            padding: 12px 24px;
            border-radius: 5px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },
    
    /**
     * 显示确认对话框
     */
    showConfirm(message, onConfirm, onCancel) {
        const confirmDialog = document.createElement('div');
        confirmDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        confirmDialog.innerHTML = `
            <div style="background: #fff; padding: 30px; border-radius: 10px; width: 90%; max-width: 400px; text-align: center;">
                <div style="margin-bottom: 20px; color: #333;">${message}</div>
                <div style="display: flex; justify-content: space-between;">
                    <button id="confirmCancel" style="padding: 10px 20px; border: 1px solid #ccc; border-radius: 5px; background: #f0f0f0; cursor: pointer;">取消</button>
                    <button id="confirmOk" style="padding: 10px 20px; border: none; border-radius: 5px; background: var(--gold-primary); color: #000; cursor: pointer;">确认</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmDialog);
        
        document.getElementById('confirmOk').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            confirmDialog.remove();
        });
        
        document.getElementById('confirmCancel').addEventListener('click', () => {
            if (onCancel) onCancel();
            confirmDialog.remove();
        });
    }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 先加载状态管理和API拦截器
    const loadScripts = async () => {
        console.log('开始加载脚本...');
        
        // 加载store.js
        if (!window.store) {
            console.log('加载 store.js...');
            const storeScript = document.createElement('script');
            storeScript.src = '/js/store.js';
            await new Promise(resolve => {
                storeScript.onload = () => {
                    console.log('store.js 加载成功');
                    resolve();
                };
                document.head.appendChild(storeScript);
            });
        } else {
            console.log('store.js 已经加载');
        }
        
        // 加载api-interceptor.js
        if (!window.apiInterceptor) {
            console.log('加载 api-interceptor.js...');
            const interceptorScript = document.createElement('script');
            interceptorScript.src = '/js/api-interceptor.js';
            await new Promise((resolve, reject) => {
                interceptorScript.onload = () => {
                    if (window.apiInterceptor) {
                        console.log('api-interceptor.js 加载成功');
                        resolve();
                    } else {
                        console.error('api-interceptor.js 加载失败');
                        reject(new Error('api-interceptor.js 加载失败'));
                    }
                };
                interceptorScript.onerror = () => {
                    console.error('api-interceptor.js 加载失败');
                    reject(new Error('api-interceptor.js 加载失败'));
                };
                document.head.appendChild(interceptorScript);
            });
        } else {
            console.log('api-interceptor.js 已经加载');
        }
        
        // 加载api-service.js
        if (!window.apiService) {
            console.log('加载 api-service.js...');
            const apiServiceScript = document.createElement('script');
            apiServiceScript.src = '/js/api-service.js';
            await new Promise((resolve, reject) => {
                apiServiceScript.onload = () => {
                    if (window.apiService) {
                        console.log('api-service.js 加载成功');
                        resolve();
                    } else {
                        console.error('api-service.js 加载失败');
                        reject(new Error('api-service.js 加载失败'));
                    }
                };
                apiServiceScript.onerror = () => {
                    console.error('api-service.js 加载失败');
                    reject(new Error('api-service.js 加载失败'));
                };
                document.head.appendChild(apiServiceScript);
            });
        } else {
            console.log('api-service.js 已经加载');
        }
        
        // 初始化配置
        console.log('初始化配置...');
        await window.APP_CONFIG.init();
        console.log('配置初始化完成');
    };
    
    loadScripts().catch(console.error);
});
