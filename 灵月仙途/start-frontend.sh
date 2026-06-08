#!/bin/bash

# 灵月仙途 - 前端服务启动脚本
# 使用 Live Server 并监听局域网

echo "======================================"
echo "  灵月仙途 - 前端服务启动"
echo "======================================"
echo ""

# 获取本机局域网 IP
LOCAL_IP=$(ipconfig getifaddr en0)
echo "本机局域网 IP: $LOCAL_IP"
echo ""

# 检查 VS Code 是否安装 Live Server 插件
echo "请确保 VS Code 已安装 Live Server 插件"
echo ""
echo "启动方式："
echo "1. 打开 VS Code"
echo "2. 打开项目文件夹：/Users/macbook/前端项目/灵月仙途"
echo "3. 右键点击 index.html 或任意 HTML 文件"
echo "4. 选择 'Open with Live Server'"
echo ""
echo "或者使用以下命令启动静态服务器："
echo ""
echo "使用 Python 内置服务器（推荐）："
echo "  cd /Users/macbook/前端项目/灵月仙途"
echo "  python3 -m http.server 5502 --bind 0.0.0.0"
echo ""
echo "启动后访问地址："
echo "  - 本地：http://localhost:5502"
echo "  - 局域网：http://$LOCAL_IP:5502"
echo ""

# 提供 Python 服务器启动选项
read -p "是否使用 Python 启动静态服务器？(y/n): " choice

if [ "$choice" = "y" ]; then
    cd /Users/macbook/前端项目/灵月仙途
    python3 -m http.server 5502 --bind 0.0.0.0
else
    echo ""
    echo "请在 VS Code 中手动启动 Live Server"
fi
