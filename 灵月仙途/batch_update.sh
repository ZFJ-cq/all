#!/bin/bash

# 批量添加 UI 组件引用的脚本
echo "开始批量添加 UI 组件引用..."

# 查找所有 HTML 文件（排除已修改的）
find . -name "*.html" -type f ! -path "./node_modules/*" | while read file; do
  # 检查是否已包含 ui-components.js
  if ! grep -q "ui-components.js" "$file"; then
    # 在</body>标签前添加引用
    sed -i '' 's|</body>|  <script src="js/ui-components.js"></script>\n</body>|g' "$file"
    echo "✅ 已更新：$file"
  fi
done

echo "批量更新完成！"
