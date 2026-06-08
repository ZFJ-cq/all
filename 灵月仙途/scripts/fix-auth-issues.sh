#!/bin/bash

# 修复重复的 auth-service.js 引用和 roleId 默认值问题

cd /Users/macbook/前端项目/灵月仙途

echo "=== 修复重复的 auth-service.js 引用 ==="

# 查找有重复 auth-service.js 的文件
for file in $(grep -rl "auth-service.js" --include="*.html" . 2>/dev/null); do
  count=$(grep -c "auth-service.js" "$file" 2>/dev/null)
  if [ "$count" -gt 1 ]; then
    echo "修复重复引用: $file (共 $count 次)"
    # 只保留第一个 auth-service.js 引用，删除后面的
    awk '!seen && /auth-service\.js/ { print; seen=1; next } !/auth-service\.js/' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
done

echo ""
echo "=== 修复 roleId 默认值问题 ==="

# 查找 roleId 默认值为 1 的文件
for file in $(grep -rl "currentRoleId.*||.*1" --include="*.html" . 2>/dev/null); do
  echo "修复 roleId 默认值: $file"
  sed -i.bak "s/localStorage.getItem('currentRoleId') || 1/window.AuthService ? window.AuthService.getCurrentRoleId() : localStorage.getItem('currentRoleId')/g" "$file"
  sed -i.bak "s/localStorage.getItem('currentRoleId') || localStorage.getItem('roleId') || 1/window.AuthService ? window.AuthService.getCurrentRoleId() : (localStorage.getItem('currentRoleId') || localStorage.getItem('roleId'))/g" "$file"
done

echo ""
echo "=== 清理备份文件 ==="
find . -name "*.bak" -delete 2>/dev/null

echo ""
echo "=== 修复完成 ==="
