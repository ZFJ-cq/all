/**
 * Admin API Service
 * 统一的 API 调用服务
 */

const API_BASE_URL = 'http://localhost:8088/api';

const apiService = {
  // GET 请求
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // 处理 Result 包装格式
      if (data.code !== undefined) {
        if (data.code === 200 || data.code === 0) {
          return data.data || [];
        } else {
          throw new Error(data.message || '请求失败');
        }
      }
      
      return data;
    } catch (error) {
      console.error(`API GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  // POST 请求
  async post(endpoint, data = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      // 处理 Result 包装格式
      if (result.code !== undefined) {
        if (result.code === 200 || result.code === 0) {
          return result.data;
        } else {
          throw new Error(result.message || '请求失败');
        }
      }
      
      return result;
    } catch (error) {
      console.error(`API POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  // PUT 请求
  async put(endpoint, data = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      // 处理 Result 包装格式
      if (result.code !== undefined) {
        if (result.code === 200 || result.code === 0) {
          return result.data;
        } else {
          throw new Error(result.message || '请求失败');
        }
      }
      
      return result;
    } catch (error) {
      console.error(`API PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  // DELETE 请求
  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      // 处理 Result 包装格式
      if (result.code !== undefined) {
        if (result.code === 200 || result.code === 0) {
          return result.data;
        } else {
          throw new Error(result.message || '请求失败');
        }
      }
      
      return result;
    } catch (error) {
      console.error(`API DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }
};

// 导出到全局
window.apiService = apiService;
window.API_BASE_URL = API_BASE_URL;
