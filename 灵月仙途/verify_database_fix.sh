#!/bin/bash

# ============================================
# 数据库字段修复状态快速验证脚本
# ============================================

echo "======================================"
echo "数据库字段修复状态验证"
echo "======================================"
echo ""

# 数据库配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-lingyuexiantu}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查数据库连接
echo -n "检查数据库连接... "
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" "$DB_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 连接成功${NC}"
else
    echo -e "${RED}✗ 连接失败${NC}"
    echo "请检查数据库配置或使用以下命令测试:"
    echo "mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASSWORD $DB_NAME"
    exit 1
fi
echo ""

# 验证函数
check_table_columns() {
    local table=$1
    local expected_min_columns=$2
    local critical_fields=$3
    
    # 获取字段数量
    local column_count=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -N -e \
        "SELECT COUNT(*) FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='$table';" "$DB_NAME" 2>/dev/null)
    
    if [ -z "$column_count" ]; then
        echo -e "${RED}✗ $table: 表不存在${NC}"
        return 1
    fi
    
    # 检查关键字段
    local missing_fields=""
    if [ -n "$critical_fields" ]; then
        for field in $critical_fields; do
            field_exists=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -N -e \
                "SELECT COUNT(*) FROM information_schema.COLUMNS 
                 WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='$table' AND COLUMN_NAME='$field';" "$DB_NAME" 2>/dev/null)
            
            if [ "$field_exists" -eq 0 ]; then
                missing_fields="$missing_fields $field"
            fi
        done
    fi
    
    # 显示结果
    if [ "$column_count" -ge "$expected_min_columns" ] && [ -z "$missing_fields" ]; then
        echo -e "${GREEN}✓ $table${NC} ($column_count 个字段)"
        return 0
    else
        echo -e "${YELLOW}⚠ $table${NC} ($column_count 个字段，缺失:$missing_fields)"
        return 1
    fi
}

echo "======================================"
echo "核心表验证"
echo "======================================"
echo ""

# 验证核心表
total=0
passed=0

# game_role 表 (应该有 20+ 字段)
check_table_columns "game_role" 20 "age max_age life_status death_time reincarnation_count cultivation_base longevity_bonus"
((total++))
[ $? -eq 0 ] && ((passed++))

# role_skill 表 (应该有 10+ 字段)
check_table_columns "role_skill" 10 "equipped"
((total++))
[ $? -eq 0 ] && ((passed++))

# role_equipment 表 (应该有 15+ 字段)
check_table_columns "role_equipment" 15 "item_id quantity acquired_at durability"
((total++))
[ $? -eq 0 ] && ((passed++))

# role_clans 表 (应该有 10+ 字段)
check_table_columns "role_clans" 10 "position contribution join_date rank"
((total++))
[ $? -eq 0 ] && ((passed++))

# role_asset 表 (应该有 10+ 字段)
check_table_columns "role_asset" 10 "subtype rarity description effect affixes"
((total++))
[ $? -eq 0 ] && ((passed++))

# role_item 表
check_table_columns "role_item" 10 "item_name item_type subtype quantity rarity"
((total++))
[ $? -eq 0 ] && ((passed++))

# role_task 表
check_table_columns "role_task" 10 "task_type reward_claimed"
((total++))
[ $? -eq 0 ] && ((passed++))

# inventory 表
check_table_columns "inventory" 8 "item_name item_type rarity stack_size"
((total++))
[ $? -eq 0 ] && ((passed++))

# clan 表
check_table_columns "clan" 12 "level members_count max_members leader_id leader_name"
((total++))
[ $? -eq 0 ] && ((passed++))

# asset_types 表
check_table_columns "asset_types" 15 "icon icon_path decimal_precision tradable droppable max_stack"
((total++))
[ $? -eq 0 ] && ((passed++))

echo ""
echo "======================================"
echo "验证摘要"
echo "======================================"
echo "总表数：$total"
echo -e "通过：${GREEN}$passed${NC}"
echo -e "未通过：${YELLOW}$((total-passed))${NC}"
echo ""

if [ "$passed" -eq "$total" ]; then
    echo -e "${GREEN}✅ 所有表验证通过！数据库结构完整。${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  部分表字段不完整，建议执行修复脚本。${NC}"
    echo ""
    echo "执行修复命令:"
    echo "  ./run_database_fix.sh"
    echo ""
    echo "或查看修复指南:"
    echo "  cat DATABASE_FIELD_FIX_GUIDE.md"
    exit 1
fi
