/**
 * 自动调试和修复脚本
 * 在浏览器控制台中直接运行此脚本
 */
(function() {
  console.log('=== 🛠️ 灵月仙途 - 自动调试修复脚本 ===\n');
  
  // 1. 检查存储状态
  console.log('📊 检查 localStorage 存储状态...');
  const storage = {
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    roleId: localStorage.getItem('roleId'),
    currentRoleId: localStorage.getItem('currentRoleId'),
    selectedCharacterId: localStorage.getItem('selectedCharacterId'),
    username: localStorage.getItem('username'),
    backup: localStorage.getItem('_token_backup_')
  };
  
  console.log('存储状态:', storage);
  
  // 2. 诊断问题
  const issues = [];
  
  if (!storage.token) {
    issues.push('❌ Token 不存在');
  } else {
    console.log('✅ Token 存在');
  }
  
  if (!storage.userId) {
    issues.push('❌ userId 不存在');
  } else {
    console.log('✅ userId 存在:', storage.userId);
  }
  
  if (!storage.roleId && !storage.currentRoleId) {
    issues.push('❌ roleId 不存在');
  } else {
    console.log('✅ roleId 存在:', storage.roleId || storage.currentRoleId);
  }
  
  // 检查数据一致性
  if (!storage.token && (storage.userId || storage.roleId)) {
    issues.push('❌ 数据不一致：有 userId/roleId 但没有 Token');
  }
  
  // 检查角色 ID 一致性
  const roleIds = [storage.roleId, storage.currentRoleId, storage.selectedCharacterId].filter(id => id);
  if (roleIds.length > 0) {
    const uniqueIds = [...new Set(roleIds)];
    if (uniqueIds.length > 1) {
      issues.push(`⚠️ 角色 ID 不一致：${uniqueIds.join(', ')}`);
    }
  }
  
  console.log('\n诊断结果:');
  if (issues.length === 0) {
    console.log('✅ 未发现问题');
  } else {
    issues.forEach(issue => console.log('  ' + issue));
  }
  
  // 3. 自动修复
  console.log('\n🔧 开始自动修复...\n');
  
  // 修复 1: 同步角色 ID
  if (roleIds.length > 0) {
    const targetId = roleIds[0];
    console.log(`同步角色 ID: ${targetId}`);
    localStorage.setItem('roleId', targetId);
    localStorage.setItem('currentRoleId', targetId);
    localStorage.setItem('selectedCharacterId', targetId);
    console.log('✅ 角色 ID 已同步\n');
  }
  
  // 修复 2: 从备份恢复 Token
  if (!storage.token && storage.backup) {
    try {
      const backupData = JSON.parse(storage.backup);
      if (backupData.token) {
        console.log('从备份恢复 Token...');
        localStorage.setItem('token', backupData.token);
        if (backupData.userId) localStorage.setItem('userId', backupData.userId);
        if (backupData.roleId) localStorage.setItem('roleId', backupData.roleId);
        console.log('✅ Token 已从备份恢复\n');
      }
    } catch (e) {
      console.log('❌ 备份数据解析失败:', e.message, '\n');
    }
  }
  
  // 修复 3: 从 AuthManager 恢复 Token
  if (!localStorage.getItem('token') && window.AuthManager) {
    const authToken = window.AuthManager.getToken();
    if (authToken) {
      console.log('从 AuthManager 恢复 Token...');
      localStorage.setItem('token', authToken);
      console.log('✅ Token 已从 AuthManager 恢复\n');
    }
  }
  
  // 修复 4: 清理不一致数据
  if (!localStorage.getItem('token')) {
    console.log('无法恢复 Token，清理不一致数据...');
    localStorage.removeItem('userId');
    localStorage.removeItem('roleId');
    localStorage.removeItem('currentRoleId');
    localStorage.removeItem('selectedCharacterId');
    localStorage.removeItem('_token_backup_');
    console.log('✅ 不一致数据已清理\n');
    console.log('⚠️ 请重新登录\n');
  }
  
  // 4. 测试 API
  console.log('🌐 测试 API 接口...\n');
  
  if (window.apiService && localStorage.getItem('token')) {
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log(`测试获取角色列表 (userId: ${userId})...`);
      window.apiService.getRole(userId)
        .then(roles => {
          console.log('✅ 角色列表获取成功:', roles);
          console.log(`角色数量：${roles.length}`);
          
          if (roles.length > 0) {
            const roleId = roles[0].id;
            console.log(`\n测试获取角色资产 (roleId: ${roleId})...`);
            return window.apiService.getAssets(roleId);
          }
        })
        .then(assets => {
          if (assets) {
            console.log('✅ 角色资产获取成功:', assets);
            console.log(`资产数量：${assets.length}`);
          }
          console.log('\n=== 🎉 调试完成 ===');
        })
        .catch(error => {
          console.error('❌ API 测试失败:', error.message);
          console.log('\n=== ⚠️ 调试完成，但发现错误 ===');
        });
    }
  } else {
    console.log('⚠️ 无法测试 API：缺少 apiService 或 Token');
    console.log('\n=== ⚠️ 调试完成 ===');
  }
  
  // 5. 最终状态
  console.log('\n📊 最终存储状态:');
  console.log({
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    roleId: localStorage.getItem('roleId'),
    currentRoleId: localStorage.getItem('currentRoleId'),
    selectedCharacterId: localStorage.getItem('selectedCharacterId')
  });
})();
