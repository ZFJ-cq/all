#!/bin/bash

echo "====================================="
echo "测试 RBAC 权限管理系统"
echo "====================================="
echo ""

# 测试 API
API_BASE="http://localhost:8088/api"

echo "1. 测试获取系统用户列表..."
curl -s ${API_BASE}/sys/user | python3 -m json.tool | head -100

echo ""
echo "2. 测试获取系统角色列表..."
curl -s ${API_BASE}/sys/role | python3 -m json.tool

echo ""
echo "3. 测试获取用户详情（包含角色）..."
curl -s ${API_BASE}/sys/user/1 | python3 -m json.tool

echo ""
echo "4. 测试获取用户的角色..."
curl -s ${API_BASE}/sys/user/1/roles | python3 -m json.tool

echo ""
echo "5. 测试获取用户的权限..."
curl -s ${API_BASE}/sys/user/1/permissions | python3 -m json.tool

echo ""
echo "====================================="
echo "测试完成"
echo "====================================="
