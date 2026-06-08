#!/bin/bash

# 灵月仙途 - 后端服务启动脚本
# 用于在局域网内提供 API 服务

echo "======================================"
echo "  灵月仙途 - 后端服务启动脚本"
echo "======================================"
echo ""

# 获取本机局域网 IP 地址
get_local_ip() {
    # macOS 获取局域网 IP
    local_ip=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
    if [ -z "$local_ip" ]; then
        # 备用方案：使用 ifconfig
        local_ip=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -n 1)
    fi
    echo $local_ip
}

LOCAL_IP=$(get_local_ip)

echo "本机局域网 IP: $LOCAL_IP"
echo ""

# 检查 Maven 是否安装
if ! command -v mvn &> /dev/null; then
    echo "❌ 错误：未找到 Maven (mvn) 命令"
    echo ""
    echo "请先安装 Maven，可以选择以下方式之一："
    echo "  1. 使用 Homebrew 安装：brew install maven"
    echo "  2. 从官网下载：https://maven.apache.org/download.cgi"
    echo "  3. 使用 IDEA 直接运行（见下方说明）"
    echo ""
    exit 1
fi

echo "✅ Maven 版本：$(mvn --version | head -n 1)"
echo ""

# 检查 Java 是否安装
if ! command -v java &> /dev/null; then
    echo "❌ 错误：未找到 Java 命令"
    echo ""
    echo "请先安装 JDK，可以选择以下方式之一："
    echo "  1. 使用 Homebrew 安装：brew install openjdk@17"
    echo "  2. 从官网下载：https://adoptium.net/"
    echo ""
    exit 1
fi

echo "✅ Java 版本：$(java -version 2>&1 | head -n 1)"
echo ""

# 检查 MySQL 是否运行
if ! command -v mysql &> /dev/null; then
    echo "⚠️  警告：未找到 MySQL 客户端命令"
    echo "   请确保 MySQL 服务已启动"
    echo ""
else
    echo "✅ MySQL 已安装"
fi

echo ""
echo "======================================"
echo "  启动方式选择"
echo "======================================"
echo ""
echo "请选择启动方式："
echo "  1. 使用 Maven 直接运行（推荐，支持热更新）"
echo "  2. 打包后运行 JAR 文件"
echo "  3. 使用 IDEA 运行（需手动操作）"
echo ""
read -p "请输入选项 (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "======================================"
        echo "  使用 Maven 启动后端服务"
        echo "======================================"
        echo ""
        echo "后端服务将在以下地址可用："
        echo "  - 本地访问：http://localhost:8088/api"
        echo "  - 局域网访问：http://$LOCAL_IP:8088/api"
        echo ""
        echo "按 Ctrl+C 停止服务"
        echo ""
        echo "启动中..."
        echo ""
        
        # 启动服务
        mvn spring-boot:run
        
        ;;
    2)
        echo ""
        echo "======================================"
        echo "  打包并运行 JAR 文件"
        echo "======================================"
        echo ""
        
        # 检查是否已有 JAR 文件
        if [ -f "target/lingyuexiantu-server-*.jar" ]; then
            echo "✅ 发现已打包的 JAR 文件"
            read -p "是否直接使用现有 JAR 文件？(y/n): " use_existing
            if [ "$use_existing" = "y" ]; then
                JAR_FILE=$(ls target/lingyuexiantu-server-*.jar | head -n 1)
                echo "使用 JAR 文件：$JAR_FILE"
                java -jar "$JAR_FILE"
                exit 0
            fi
        fi
        
        echo "开始打包..."
        mvn clean package -DskipTests
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ 打包成功"
            JAR_FILE=$(ls target/lingyuexiantu-server-*.jar | head -n 1)
            echo "运行 JAR 文件：$JAR_FILE"
            echo ""
            echo "后端服务将在以下地址可用："
            echo "  - 本地访问：http://localhost:8088/api"
            echo "  - 局域网访问：http://$LOCAL_IP:8088/api"
            echo ""
            echo "按 Ctrl+C 停止服务"
            echo ""
            java -jar "$JAR_FILE"
        else
            echo ""
            echo "❌ 打包失败，请检查错误信息"
            exit 1
        fi
        
        ;;
    3)
        echo ""
        echo "======================================"
        echo "  使用 IDEA 运行"
        echo "======================================"
        echo ""
        echo "请按照以下步骤操作："
        echo ""
        echo "1. 打开 IntelliJ IDEA"
        echo "2. 打开项目：/Users/macbook/前端项目/灵月仙途/lingyuexiantu-server"
        echo "3. 找到主类：com.lingyue.LingyuexiantuServerApplication"
        echo "4. 右键点击，选择 'Run LingyuexiantuServerApplication'"
        echo ""
        echo "或者："
        echo "1. 在 IDEA 中打开右侧 Maven 面板"
        echo "2. 展开 lingyuexiantu-server → Plugins → spring-boot-maven-plugin"
        echo "3. 双击 'spring-boot:run'"
        echo ""
        echo "启动成功后，访问地址："
        echo "  - 本地访问：http://localhost:8088/api"
        echo "  - 局域网访问：http://$LOCAL_IP:8088/api"
        echo ""
        ;;
    *)
        echo "❌ 无效的选项"
        exit 1
        ;;
esac
