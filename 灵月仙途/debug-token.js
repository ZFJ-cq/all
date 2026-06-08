/**
 * 诊断脚本 - 检查 Token 和登录状态
 * 在浏览器控制台执行此脚本
 */

(function() {
  console.log('=== 灵月仙途 - 登录状态诊断 ===\n');
  
  // 1. 检查 localStorage 中的所有登录相关信息
  const loginKeys = ['token', 'userId', 'username', 'currentRoleId', 'selectedCharacterId', 'currentUserId'];
  console.log('1. localStorage 检查:');
  loginKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      if (key === 'token') {
        console.log(`   ✓ ${key}: 存在 (长度：${value.length})`);
        // 简单检查 token 格式
        const parts = value.split('.');
        if (parts.length === 3) {
          console.log(`     - Token 格式正确 (3 部分)`);
        } else {
          console.log(`     - ⚠ Token 格式可能不正确`);
        }
      } else {
        console.log(`   ✓ ${key}: ${value}`);
      }
    } else {
      console.log(`   ✗ ${key}: 不存在`);
    }
  });
  
  console.log('\n2. 测试 API 请求:');
  
  // 2. 测试 API 请求
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (!token || !userId) {
    console.log('   ✗ 缺少 token 或 userId，无法测试');
    return;
  }
  
  // 测试需要认证的接口
  fetch(`http://localhost:8088/api/role/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(r => {
    if (r.ok) {
      console.log('   ✓ API 请求成功 (200)');
      return r.json();
    } else {
      console.log(`   ✗ API 请求失败 (${r.status})`);
      return r.json().catch(() => ({}));
    }
  })
  .then(d => {
    if (d.code === 200) {
      console.log('   ✓ Token 有效');
      console.log(`   - 角色数量：${d.data?.length || 0}`);
    } else if (d.code === 401) {
      console.log(`   ✗ Token 无效：${d.message}`);
    } else {
      console.log(`   - 响应：${JSON.stringify(d)}`);
    }
  })
  .catch(e => {
    console.log(`   ✗ 请求失败：${e.message}`);
  });
  
  console.log('\n3. 建议:');
  if (!token) {
    console.log('   - 未找到 token，请重新登录');
  }
  if (!userId) {
    console.log('   - 未找到 userId，请重新登录');
  }
  if (token && userId) {
    console.log('   - 登录信息完整');
  }
  
  console.log('\n=== 诊断完成 ===');
})();
