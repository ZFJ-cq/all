#!/bin/bash

# ============================================
# 灵月仙途 - 全面功能测试脚本
# ============================================

API_BASE="http://localhost:8088/api"
PASS=0
FAIL=0
WARN=0

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "============================================"
echo "🧪 灵月仙途 - 全面功能测试"
echo "============================================"
echo "开始时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -e "${BLUE}测试：${name}${NC}"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" == "200" ]; then
        echo -e "${GREEN}✅ 通过${NC} - HTTP $http_code"
        PASS=$((PASS+1))
        # echo "响应：$body"
    elif [ "$http_code" == "404" ]; then
        echo -e "${YELLOW}⚠️ 警告${NC} - 接口不存在 (404)"
        WARN=$((WARN+1))
    elif [ "$http_code" == "500" ]; then
        echo -e "${RED}❌ 失败${NC} - 服务器错误 (500)"
        FAIL=$((FAIL+1))
        echo "错误：$body"
    else
        echo -e "${YELLOW}⚠️ 警告${NC} - HTTP $http_code"
        WARN=$((WARN+1))
    fi
    echo ""
}

# ============================================
# 1. 用户系统测试
# ============================================
echo -e "${BLUE}=== 1️⃣ 用户系统测试 ===${NC}"
test_api "用户注册" "POST" "$API_BASE/user/register" '{"username":"test_user","password":"123456"}'
test_api "用户登录" "POST" "$API_BASE/user/login" '{"username":"test_user","password":"123456"}'
test_api "获取用户信息" "GET" "$API_BASE/user/1" ""

# ============================================
# 2. 角色系统测试
# ============================================
echo -e "${BLUE}=== 2️⃣ 角色系统测试 ===${NC}"
test_api "获取角色列表" "GET" "$API_BASE/role/user/1" ""
test_api "获取角色详情" "GET" "$API_BASE/role/1" ""
test_api "获取角色属性" "GET" "$API_BASE/role/1/stats" ""

# ============================================
# 3. 修炼系统测试
# ============================================
echo -e "${BLUE}=== 3️⃣ 修炼系统测试 ===${NC}"
test_api "获取修炼信息" "GET" "$API_BASE/cultivation/1" ""
test_api "境界突破" "POST" "$API_BASE/breakthrough" '{"roleId":1}'

# ============================================
# 4. 签到系统测试
# ============================================
echo -e "${BLUE}=== 4️⃣ 签到系统测试 ===${NC}"
test_api "获取月度签到" "GET" "$API_BASE/checkin/monthly/1" ""
test_api "执行签到" "POST" "$API_BASE/checkin/do" '{"roleId":1}'

# ============================================
# 5. 任务系统测试
# ============================================
echo -e "${BLUE}=== 5️⃣ 任务系统测试 ===${NC}"
test_api "获取任务列表" "GET" "$API_BASE/task/list/1" ""

# ============================================
# 6. 成就系统测试
# ============================================
echo -e "${BLUE}=== 6️⃣ 成就系统测试 ===${NC}"
test_api "获取成就列表" "GET" "$API_BASE/achievement" ""

# ============================================
# 7. 背包系统测试
# ============================================
echo -e "${BLUE}=== 7️⃣ 背包系统测试 ===${NC}"
test_api "获取背包列表" "GET" "$API_BASE/inventory/1" ""

# ============================================
# 8. 商城系统测试
# ============================================
echo -e "${BLUE}=== 8️⃣ 商城系统测试 ===${NC}"
test_api "获取商品列表" "GET" "$API_BASE/shop/items" ""

# ============================================
# 9. 邮件系统测试
# ============================================
echo -e "${BLUE}=== 9️⃣ 邮件系统测试 ===${NC}"
test_api "获取邮件列表" "GET" "$API_BASE/mail/1" ""

# ============================================
# 10. 道友系统测试
# ============================================
echo -e "${BLUE}=== 🔟 道友系统测试 ===${NC}"
test_api "获取好友列表" "GET" "$API_BASE/friend/list/1" ""
test_api "搜索好友" "GET" "$API_BASE/friend/search?keyword=test&userId=1" ""

# ============================================
# 11. 榜单系统测试
# ============================================
echo -e "${BLUE}=== 1️⃣1️⃣ 榜单系统测试 ===${NC}"
test_api "等级榜" "GET" "$API_BASE/leaderboard/level" ""
test_api "境界榜" "GET" "$API_BASE/leaderboard/realm" ""
test_api "综合榜" "GET" "$API_BASE/leaderboard/combined" ""

# ============================================
# 12. 资源系统测试
# ============================================
echo -e "${BLUE}=== 1️⃣2️ 资源系统测试 ===${NC}"
test_api "资源类型列表" "GET" "$API_BASE/resource-type" ""
test_api "角色资源" "GET" "$API_BASE/resource/role/1" ""

# ============================================
# 测试总结
# ============================================
echo ""
echo "============================================"
echo "📊 测试总结"
echo "============================================"
echo -e "${GREEN}✅ 通过：$PASS${NC}"
echo -e "${YELLOW}⚠️  警告：$WARN${NC}"
echo -e "${RED}❌ 失败：$FAIL${NC}"
echo ""
TOTAL=$((PASS+WARN+FAIL))
echo "总测试数：$TOTAL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
else
    echo -e "${RED}⚠️  发现 $FAIL 个失败，请检查日志${NC}"
fi

echo ""
echo "结束时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================"

# 返回结果
if [ $FAIL -gt 0 ]; then
    exit 1
else
    exit 0
fi
