/**
 * 批量为 HTML 页面添加 AuthService 支持
 * 
 * 使用方法：
 * node add-auth-service.js
 */

const fs = require('fs');
const path = require('path');

// 需要添加 AuthService 的页面列表（主要业务页面）
const pages = [
  'index.html',
  'cultivation.html',
  'body-cultivation/index.html',
  'skills/skills.html',
  'character/character.html',
  'inventory/inventory.html',
  'equipment/equipment.html',
  'tasks/tasks.html',
  'shop.html',
  'leaderboard.html',
  'restaurant.html',
  'fuben.html',
  'body-training.html',
  'test-center.html',
  'checkin.html',
  'mail.html',
  'achievements.html',
  'assets/assets.html',
  'map/map.html',
  'trade/trade.html',
  'partner/partner.html',
  'news/news-list.html',
  'techniques/techniques.html',
  'settings/settings.html',
  'social/social.html',
  'combat/combat.html',
  'clan/my-clan.html',
  'clan/clan.html',
  'clan/clan-home.html',
  'clan/members.html',
  'clan/tasks.html',
  'clan/contribution.html',
  'clan/shop.html',
  'clan/buildings.html',
  'guild/index.html',
  'guild/liandan.html',
  'guild/forge.html',
  'guild/cave.html',
  'beast-island/index.html',
  'word/world.html',
  'home/zhongtian.html',
  'avatar-shop/avatar-shop.html',
  'friends.html',
  'inventory.html'
];

// 要添加的 script 标签
const authScriptTag = '  <script src="../js/auth-service.js"></script>\n';

// 处理每个文件
let successCount = 0;
let skipCount = 0;
let errorCount = 0;

pages.forEach(pagePath => {
  const fullPath = path.join(__dirname, '..', pagePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  跳过（文件不存在）: ${pagePath}`);
    skipCount++;
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 检查是否已经包含 auth-service.js
    if (content.includes('auth-service.js')) {
      console.log(`⏭️  跳过（已包含）: ${pagePath}`);
      skipCount++;
      return;
    }
    
    // 查找 token-manager.js 的位置
    const tokenManagerPattern = /(<script src=["']\.\.\/js\/token-manager\.js["']><\/script>)/;
    
    if (content.match(tokenManagerPattern)) {
      // 在 token-manager.js 后面添加 auth-service.js
      content = content.replace(tokenManagerPattern, '$1\n' + authScriptTag.trim());
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ 已添加：${pagePath}`);
      successCount++;
    } else {
      console.log(`⚠️  跳过（未找到 token-manager.js）: ${pagePath}`);
      skipCount++;
    }
  } catch (error) {
    console.error(`❌ 处理失败：${pagePath}`, error.message);
    errorCount++;
  }
});

console.log('\n========== 处理完成 ==========');
console.log(`✅ 成功：${successCount} 个文件`);
console.log(`⏭️  跳过：${skipCount} 个文件`);
console.log(`❌ 失败：${errorCount} 个文件`);
