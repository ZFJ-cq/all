#!/usr/bin/env python3
import os
import glob

# 查找所有缺少 CrossOrigin 导入的控制器
controller_files = glob.glob('src/main/java/com/lingyue/controller/*.java')

for file_path in controller_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否有 @CrossOrigin 但缺少导入
    if '@CrossOrigin' in content and 'import org.springframework.web.bind.annotation.CrossOrigin;' not in content:
        # 找到 @RestController 的位置
        rest_controller_pos = content.find('@RestController')
        if rest_controller_pos != -1:
            # 找到这一行的末尾
            line_end = content.find('\n', rest_controller_pos)
            # 在下一行插入导入
            new_content = content[:line_end+1] + 'import org.springframework.web.bind.annotation.CrossOrigin;\n' + content[line_end+1:]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f'Added CrossOrigin import to: {file_path}')

print('Done!')
