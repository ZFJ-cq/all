#!/bin/bash

# 批量为 HTML 页面添加 AuthService 支持（增强版）

cd /Users/macbook/前端项目/灵月仙途

# 主要业务页面列表
pages=(
  "inventory/inventory.html"
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
  "techniques/techniques.html"
  "settings/settings.html"
  "social/social.html"
  "combat/combat.html"
  "clan/clan.html"
  "guild/index.html"
  "guild/liandan.html"
  "guild/forge.html"
  "guild/cave.html"
  "beast-island/index.html"
  "home/zhongtian.html"
  "friends.html"
  "clan/members.html"
  "clan/tasks.html"
  "clan/contribution.html"
  "clan/shop.html"
  "clan/buildings.html"
  "body-cultivation/index.html"
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
  
  # 在 </head> 前添加 auth-service.js
  if grep -q "</head>" "$page"; then
    # 找到最后一个 js 文件，在它之后添加
    if grep -q '<script src=".*\.js"></script>' "$page"; then
      # 找到最后一个 script 标签，在它之后添加
      sed -i.bak '/<script src=".*\.js"><\/script>/a\
  <script src="../js/auth-service.js"></script>' "$page"
      echo "✅ 已添加：$page"
      ((success++))
    else
      # 没有 js 文件，在 </head> 前添加
      sed -i.bak 's|</head>|  <script src="../js/auth-service.js"></script>\n</head>|g' "$page"
      echo "✅ 已添加：$page"
      ((success++))
    fi
  else
    echo "⚠️  跳过（未找到</head>）: $page"
    ((skip++))
  fi
done

echo ""
echo "========== 处理完成 =========="
echo "✅ 成功：$success 个文件"
echo "⏭️  跳过：$skip 个文件"
