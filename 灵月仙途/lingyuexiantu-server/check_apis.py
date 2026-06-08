#!/usr/bin/env python3
"""
检查前端 API 调用和后端接口是否匹配
"""
import re
import glob

# 提取前端 API 调用
frontend_apis = set()
modules_dir = 'src/main/java/../admin/modules'

for html_file in glob.glob(f'{modules_dir}/*.html'):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        # 匹配 apiService.get('...') 调用
        matches = re.findall(r"apiService\.get\(['\"](/[^'\"]+)['\"]", content)
        for match in matches:
            # 移除路径参数，如 /role/user/${userId} -> /role/user/
            clean_path = re.sub(r'\$\{[^}]+\}', ':param', match)
            frontend_apis.add(clean_path)

print("前端 API 调用:")
for api in sorted(frontend_apis):
    print(f"  {api}")

print(f"\n总计：{len(frontend_apis)} 个 API 调用")
