#!/usr/bin/env python3
import os
import glob

# 查找所有控制器文件
controller_files = glob.glob('src/main/java/com/lingyue/controller/*.java')

for file_path in controller_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 检查是否有错误的导入位置
    needs_fix = False
    fixed_lines = []
    
    for i, line in enumerate(lines):
        # 检查是否在 @RestController 之后有 import 语句
        if '@RestController' in line and i < len(lines) - 1:
            next_line = lines[i + 1]
            if next_line.strip().startswith('import '):
                # 需要修复
                needs_fix = True
                # 收集所有错位的 import
                misplaced_imports = []
                j = i + 1
                while j < len(lines) and lines[j].strip().startswith('import '):
                    misplaced_imports.append(lines[j])
                    j += 1
                
                # 找到第一个 import 的位置
                first_import_idx = -1
                for k, l in enumerate(lines):
                    if l.strip().startswith('import ') and k < i:
                        first_import_idx = k
                        break
                
                if first_import_idx != -1:
                    # 在第一个 import 之前插入
                    fixed_lines = lines[:first_import_idx] + misplaced_imports + lines[first_import_idx:i+1] + lines[j:]
                break
    
    if needs_fix:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(fixed_lines)
        print(f'Fixed: {file_path}')

print('Done!')
