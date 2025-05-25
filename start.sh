#!/bin/bash

echo "🚀 启动智能数据分析平台..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "✅ 已创建 .env 文件，请根据需要修改配置"
fi

# 启动服务
echo "🐳 启动Docker服务..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 10

echo "✅ 服务启动完成！"
echo ""
echo "🌐 访问地址："
echo "  前端应用: http://localhost:3000"
echo "  后端API: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
echo ""
echo "📊 数据库信息："
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo ""
echo "🛑 停止服务: docker-compose down"
echo "📋 查看日志: docker-compose logs -f" 