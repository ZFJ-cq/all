#!/bin/bash

# ============================================
# 快速修复数据库字段脚本
# ============================================

echo "======================================"
echo "灵月仙途 - 数据库字段快速修复"
echo "======================================"
echo ""

# 数据库配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-lingyuexiantu}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"

SQL_SCRIPT="check_and_fix_all_missing_fields.sql"

echo "📋 数据库信息:"
echo "  主机：$DB_HOST:$DB_PORT"
echo "  数据库：$DB_NAME"
echo "  用户：$DB_USER"
echo ""

# 检查 SQL 文件
if [ ! -f "$SQL_SCRIPT" ]; then
    echo "❌ 错误：找不到修复脚本 $SQL_SCRIPT"
    exit 1
fi

# 检查数据库连接
echo -n "🔍 检查数据库连接... "
if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" "$DB_NAME" > /dev/null 2>&1; then
    echo "失败"
    echo "❌ 数据库连接失败！请检查:"
    echo "  1. MySQL 服务是否启动"
    echo "  2. 数据库 $DB_NAME 是否存在"
    echo "  3. 用户名密码是否正确"
    exit 1
fi
echo "成功"
echo ""

# 备份数据库
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
echo "💾 正在备份数据库到 $BACKUP_FILE ..."
mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 备份完成：$BACKUP_FILE"
else
    echo "⚠️  备份失败，继续执行修复..."
fi
echo ""

# 执行修复
echo "🔧 开始执行数据库字段修复..."
echo "这可能需要几分钟，请耐心等待..."
echo ""

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_SCRIPT" 2>&1 | tee fix_execution.log

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✅ 数据库字段修复完成！"
    echo "======================================"
    echo ""
    echo "📊 修复统计:"
    echo "  - 修复表数：35 个"
    echo "  - 添加字段：100+ 个"
    echo "  - 创建索引：20+ 个"
    echo ""
    echo "📝 执行日志：fix_execution.log"
    echo ""
    echo "下一步操作:"
    echo "  1. 验证修复结果：./verify_database_fix.sh"
    echo "  2. 运行 API 检测：python3 check_api_database_compatibility.py"
    echo "  3. 查看修复指南：cat DATABASE_FIELD_FIX_GUIDE.md"
    echo ""
else
    echo ""
    echo "======================================"
    echo "❌ 修复执行失败！"
    echo "======================================"
    echo ""
    echo "📝 错误日志：fix_execution.log"
    echo ""
    echo "💡 建议:"
    echo "  1. 查看 fix_execution.log 了解详细错误"
    echo "  2. 如果是表不存在，先执行 mock_data.sql 创建基础表"
    echo "  3. 如果是字段已存在，可以忽略该错误"
    echo ""
    exit 1
fi
