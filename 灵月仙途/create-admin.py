#!/usr/bin/env python3
"""
创建 admin 用户到 game_user 表
"""

import subprocess
import json

# 通过 curl 调用后端 API 来检查用户是否存在
def check_user_exists(username):
    try:
        result = subprocess.run(
            ['curl', '-s', '-X', 'POST', 
             'http://127.0.0.1:8088/api/auth/login',
             '-H', 'Content-Type: application/json',
             '-d', json.dumps({'username': username, 'password': 'wrong'})],
            capture_output=True,
            text=True,
            timeout=5
        )
        response = json.loads(result.stdout)
        return response.get('message') != '用户不存在'
    except:
        return False

# 使用 MySQL 命令插入用户（如果 MySQL 可用）
def create_admin_user():
    # 检查 MySQL 是否运行
    try:
        result = subprocess.run(
            ['lsof', '-i', ':3306'],
            capture_output=True,
            text=True
        )
        if not result.stdout.strip():
            print("❌ MySQL 未运行")
            return False
    except:
        print("❌ 无法检查 MySQL 状态")
        return False
    
    # SQL 语句
    sql = """
    INSERT INTO game_user (username, password, nickname, phone, status, created_at, updated_at)
    VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', 
            '系统管理员', '13800138000', 1, NOW(), NOW())
    ON DUPLICATE KEY UPDATE username=username;
    """
    
    print("请手动执行以下 SQL 语句来创建 admin 用户：")
    print("=" * 80)
    print(sql)
    print("=" * 80)
    print("\n如果已安装 MySQL 客户端，可以运行：")
    print("mysql -u root -p lingyuexiantu -e \"{}\"".format(sql.replace('\n', ' ')))
    
    return True

if __name__ == '__main__':
    print("检查 admin 用户是否存在...")
    
    if check_user_exists('admin'):
        print("✅ admin 用户已存在")
    else:
        print("❌ admin 用户不存在")
        print("\n需要创建 admin 用户。")
        create_admin_user()
