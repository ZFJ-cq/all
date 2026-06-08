/**
 * 全局 localStorage 监控
 * 用于跟踪 Token 存储和清除的情况
 */
(function() {
  'use strict';
  
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  const originalClear = Storage.prototype.clear;
  
  Storage.prototype.setItem = function(key, value) {
    console.log(`✅ localStorage.setItem: ${key} = ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
    originalSetItem.call(this, key, value);
  };
  
  Storage.prototype.removeItem = function(key) {
    console.log(`❌ localStorage.removeItem: ${key}`);
    originalRemoveItem.call(this, key);
  };
  
  Storage.prototype.clear = function() {
    console.log(`🚨 localStorage.clear()`);
    originalClear.call(this);
  };
  
  console.log('🔍 localStorage 监控已启用');
  
  // 页面加载时检查当前存储状态
  window.addEventListener('load', function() {
    console.log('=== 页面加载完成，检查存储状态 ===');
    console.log('Token:', localStorage.getItem('token') ? '存在' : '不存在');
    console.log('userId:', localStorage.getItem('userId') ? '存在' : '不存在');
    console.log('roleId:', localStorage.getItem('roleId') ? '存在' : '不存在');
  });
  
  // 页面卸载时检查存储状态
  window.addEventListener('beforeunload', function() {
    console.log('=== 页面即将卸载，检查存储状态 ===');
    console.log('Token:', localStorage.getItem('token') ? '存在' : '不存在');
  });
})();
