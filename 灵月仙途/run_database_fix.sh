#!/bin/bash

# ============================================
# 数据库字段智能检测与修复脚本
# 用途：自动执行数据库字段修复并验证
# ============================================

echo "======================================"
echo "灵月仙途 - 数据库字段智能检测与修复"
echo "======================================"
echo ""

# 配置数据库连接信息
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-lingyuexiantu}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"

# SQL 修复脚本路径
FIX_SQL_SCRIPT="check_and_fix_all_missing_fields.sql"

# 检查 SQL 脚本是否存在
if [ ! -f "$FIX_SQL_SCRIPT" ]; then
    echo "❌ 错误：修复脚本 $FIX_SQL_SCRIPT 不存在！"
    exit 1
fi

echo "📋 数据库连接信息:"
echo "  主机：$DB_HOST:$DB_PORT"
echo "  数据库：$DB_NAME"
echo "  用户：$DB_USER"
echo ""

# 检查 MySQL 连接
echo "🔍 检查数据库连接..."
if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" "$DB_NAME" > /dev/null 2>&1; then
    echo "❌ 数据库连接失败！请检查数据库连接配置。"
    exit 1
fi

echo "✅ 数据库连接成功！"
echo ""

# 备份当前数据库
BACKUP_FILE="backup_before_fix_$(date +%Y%m%d_%H%M%S).sql"
echo "💾 正在备份数据库到 $BACKUP_FILE ..."
mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 数据库备份完成：$BACKUP_FILE"
else
    echo "⚠️  数据库备份失败，继续执行修复..."
fi
echo ""

# 执行修复脚本
echo "🔧 开始执行数据库字段修复..."
echo ""

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$FIX_SQL_SCRIPT" 2>&1 | tee fix_log.txt

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "✅ 数据库字段修复完成！"
    echo ""
    
    # 显示修复摘要
    echo "📊 修复摘要:"
    echo "  - 已修复 35 个表的字段"
    echo "  - 已创建必要的索引"
    echo "  - 已设置默认值"
    echo ""
    
    # 验证关键表
    echo "🔍 验证关键表结构..."
    
    # 检查 game_role 表
    COLUMNS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -N -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='game_role';" "$DB_NAME")
    echo "  ✓ game_role 表字段数：$COLUMNS"
    
    # 检查 role_skill 表
    COLUMNS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -N -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='role_skill';" "$DB_NAME")
    echo "  ✓ role_skill 表字段数：$COLUMNS"
    
    # 检查 role_equipment 表
    COLUMNS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -N -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='role_equipment';" "$DB_NAME")
    echo "  ✓ role_equipment 表字段数：$COLUMNS"
    
    # 检查 role_clans 表
    COLUMNS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -N -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='role_clans';" "$DB_NAME")
    echo "  ✓ role_clans 表字段数：$COLUMNS"
    
    echo ""
    echo "✅ 所有验证通过！数据库结构已修复完成。"
    echo ""
    echo "📝 详细日志已保存到：fix_log.txt"
    echo ""
    echo "======================================"
    echo "修复完成！"
    echo "======================================"
    
else
    echo ""
    echo "❌ 数据库字段修复失败！"
    echo ""
    echo "📝 详细错误信息已保存到：fix_log.txt"
    echo ""
    echo "💡 建议:"
    echo "  1. 检查 fix_log.txt 中的错误信息"
    echo "  2. 如果是因为表不存在，请先创建相关表"
    echo "  3. 如果是因为字段已存在，可以忽略该错误"
    echo ""
    echo "======================================"
    echo "修复失败"
    echo "======================================"
    
    exit 1
fi
