// ============================================
// 角色数据修复脚本
// 在浏览器控制台执行此代码即可修复角色数据
// ============================================

console.log(' 开始修复角色数据...');

// 修复角色 ID 为 1 的数据
fetch('http://localhost:8088/api/fix/role/1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('📡 响应状态:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ 修复结果:', data);
  
  if (data.code === 200) {
    console.log('🎉 修复成功！');
    console.log('📊 角色数据:', data.data);
    
    if (data.data) {
      console.log('  - 角色 ID:', data.data.id);
      console.log('  - 角色名:', data.data.roleName);
      console.log('  - 性别:', data.data.gender === 1 ? '男' : '女');
      console.log('  - 境界:', data.data.realm);
      console.log('  - 等级:', data.data.level);
    }
    
    console.log('\n🔄 正在刷新页面...');
    setTimeout(() => {
      location.reload();
    }, 2000);
  } else {
    console.log('❌ 修复失败:', data.message);
  }
})
.catch(error => {
  console.error('❌ 网络错误:', error);
  console.log('\n💡 提示：请确保后端服务器正在运行（http://localhost:8088）');
});
