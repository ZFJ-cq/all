#!/bin/bash

# 批量为 HTML 页面添加 AuthService 支持

cd /Users/macbook/前端项目/灵月仙途

# 主要业务页面列表
pages=(
  "index.html"
  "cultivation.html"
  "skills/skills.html"
  "character/character.html"
  "inventory/inventory.html"
  "equipment/equipment.html"
  "tasks/tasks.html"
  "shop.html"
  "leaderboard.html"
  "restaurant.html"
  "fuben.html"
  "body-training.html"
  "test-center.html"
  "checkin.html"
  "mail.html"
  "achievements.html"
  "assets/assets.html"
  "map/map.html"
  "trade/trade.html"
  "partner/partner.html"
  "news/news-list.html"
  "techniques/techniques.html"
  "settings/settings.html"
  "social/social.html"
  "combat/combat.html"
  "clan/my-clan.html"
  "clan/clan.html"
  "guild/index.html"
  "guild/liandan.html"
  "guild/forge.html"
  "guild/cave.html"
  "beast-island/index.html"
  "word/world.html"
  "home/zhongtian.html"
  "avatar-shop/avatar-shop.html"
  "friends.html"
)

success=0
skip=0

for page in "${pages[@]}"; do
  if [ ! -f "$page" ]; then
    echo "⚠️  跳过（文件不存在）: $page"
    ((skip++))
    continue
  fi
  
  # 检查是否已包含 auth-service.js
  if grep -q "auth-service.js" "$page"; then
    echo "⏭️  跳过（已包含）: $page"
    ((skip++))
    continue
  fi
  
  # 在 token-manager.js 后添加 auth-service.js
  if grep -q "token-manager.js" "$page"; then
    sed -i.bak 's|\(<script src="\.\./js/token-manager\.js"></script>\)|\1\n  <script src="../js/auth-service.js"></script>|g' "$page"
    echo "✅ 已添加：$page"
    ((success++))
  else
    echo "⚠️  跳过（未找到 token-manager.js）: $page"
    ((skip++))
  fi
done

echo ""
echo "========== 处理完成 =========="
echo "✅ 成功：$success 个文件"
echo "⏭️  跳过：$skip 个文件"
