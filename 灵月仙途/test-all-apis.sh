#!/bin/bash

# 灵月仙途 - 全功能 API 测试脚本
# 用于测试所有后端接口的正常性

API_BASE="http://localhost:8088/api"

echo "======================================"
echo "灵月仙途 - 全功能 API 测试"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}测试 ${TOTAL_TESTS}. ${name}${NC}"
    echo "  请求：${method} ${endpoint}"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${API_BASE}${endpoint}")
    elif [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "${API_BASE}${endpoint}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    echo "  响应码：${http_code}"
    
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        echo -e "  状态：${GREEN}✓ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  状态：${RED}✗ 失败${NC}"
        echo "  响应：${body}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

echo "======================================"
echo "1. 用户系统测试"
echo "======================================"

# 测试 1: 获取资源类型列表
test_api "获取资源类型列表" "GET" "/resource/types"

# 测试 2: 获取所有活动
test_api "获取所有活动" "GET" "/activity"

# 测试 3: 获取系统日志
test_api "获取系统日志" "GET" "/logs"

# 测试 4: 获取所有宗门
test_api "获取所有宗门" "GET" "/clan"

echo "======================================"
echo "2. 用户注册测试"
echo "======================================"

# 生成随机手机号和测试数据
RANDOM_PHONE="138$(date +%S)$(shuf -i 1000-9999 -n 1)"
TEST_USERNAME="testuser$(date +%S)"
TEST_PASSWORD="test123456"
TEST_NICKNAME="测试大侠${RANDOM}"

echo -e "${YELLOW}使用测试数据:${NC}"
echo "  手机号：${RANDOM_PHONE}"
echo "  用户名：${TEST_USERNAME}"
echo "  密码：${TEST_PASSWORD}"
echo "  昵称：${TEST_NICKNAME}"
echo ""

# 测试 5: 发送验证码（模拟）
test_api "发送验证码" "POST" "/auth/send-code" "phone=${RANDOM_PHONE}"

# 测试 6: 用户注册
REGISTER_DATA="{\"phone\":\"${RANDOM_PHONE}\",\"code\":\"123456\",\"password\":\"${TEST_PASSWORD}\",\"nickname\":\"${TEST_NICKNAME}\"}"
test_api "用户注册" "POST" "/auth/register" "$REGISTER_DATA"

echo "======================================"
echo "3. 用户登录测试"
echo "======================================"

# 测试 7: 用户登录
LOGIN_DATA="{\"username\":\"${RANDOM_PHONE}\",\"password\":\"${TEST_PASSWORD}\"}"
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$LOGIN_DATA" "${API_BASE}/auth/login")
echo -e "${YELLOW}登录测试:${NC}"
echo "  请求：POST /auth/login"

if echo "$LOGIN_RESPONSE" | grep -q "userId"; then
    USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"userId":[0-9]*' | cut -d':' -f2)
    echo -e "  响应码：${GREEN}200${NC}"
    echo -e "  状态：${GREEN}✓ 通过${NC}"
    echo "  用户 ID: ${USER_ID}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    echo "  响应：${LOGIN_RESPONSE}"
    echo -e "  状态：${RED}✗ 失败${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
fi
echo ""

echo "======================================"
echo "4. 角色系统测试"
echo "======================================"

# 测试 8: 获取用户角色列表
if [ ! -z "$USER_ID" ]; then
    test_api "获取用户角色列表" "GET" "/role/user/${USER_ID}"
    
    # 测试 9: 创建角色
    CREATE_ROLE_DATA="{\"userId\":${USER_ID},\"roleName\":\"测试角色\",\"spiritRoot\":\"金灵根\",\"realm\":\"炼气期\",\"level\":1}"
    test_api "创建角色" "POST" "/role/create" "$CREATE_ROLE_DATA"
    
    # 测试 10: 获取角色详情（假设创建了 ID 为 1 的角色）
    test_api "获取角色详情" "GET" "/role/1"
fi

echo "======================================"
echo "5. 资源系统测试"
echo "======================================"

# 测试 11: 获取角色资源（假设角色 ID 为 1）
test_api "获取角色资源" "GET" "/resource/role/1"

echo "======================================"
echo "6. 修炼系统测试"
echo "======================================"

# 测试 12: 获取修炼状态
test_api "获取修炼状态" "GET" "/cultivation/status/1"

# 测试 13: 开始修炼
test_api "开始修炼" "POST" "/cultivation/start?roleId=1&duration=1" ""

# 测试 14: 获取突破所需修为
test_api "获取突破所需修为" "GET" "/cultivation/required-xiuwei?realm=炼气期"

# 测试 15: 境界突破
test_api "境界突破" "POST" "/cultivation/breakthrough?roleId=1" ""

echo "======================================"
echo "7. 宗门系统测试"
echo "======================================"

# 测试 16: 获取角色宗门信息
test_api "获取角色宗门信息" "GET" "/clan/member/role/1"

# 测试 17: 获取宗门详情
test_api "获取宗门详情" "GET" "/clan/1"

# 测试 18: 获取宗门成员列表
test_api "获取宗门成员列表" "GET" "/clan/1/members"

# 测试 19: 获取角色的宗门关系
test_api "获取角色的宗门关系" "GET" "/role/clans/1"

echo "======================================"
echo "8. 邮件系统测试"
echo "======================================"

# 测试 20: 获取用户邮件（假设用户 ID 为 1）
test_api "获取用户邮件" "GET" "/mail/user/1"

echo "======================================"
echo "9. 其他系统测试"
echo "======================================"

# 测试 21: 获取所有物品
test_api "获取所有物品" "GET" "/item"

# 测试 22: 获取所有装备
test_api "获取所有装备" "GET" "/equipment"

# 测试 23: 获取所有技能
test_api "获取所有技能" "GET" "/skill"

# 测试 24: 获取所有任务
test_api "获取所有任务" "GET" "/task"

echo "======================================"
echo "测试总结"
echo "======================================"
echo "总测试数：${TOTAL_TESTS}"
echo -e "通过：${GREEN}${PASSED_TESTS}${NC}"
echo -e "失败：${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}部分测试失败，请检查日志。${NC}"
    exit 1
fi
