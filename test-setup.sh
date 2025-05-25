#!/bin/bash

echo "🔍 检查智能数据分析平台项目设置..."

# 检查必要文件
echo "📁 检查项目文件结构..."

required_files=(
    "README.md"
    "docker-compose.yml"
    "env.example"
    "start.sh"
    "start-dev.sh"
    "backend/main.py"
    "backend/requirements.txt"
    "frontend/package.json"
    "frontend/src/App.tsx"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    else
        echo "✅ $file"
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ 缺少以下文件："
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

# 检查Python环境
echo ""
echo "🐍 检查Python环境..."
if command -v python3 &> /dev/null; then
    echo "✅ Python3: $(python3 --version)"
else
    echo "❌ Python3 未安装"
fi

# 检查Node.js环境
echo ""
echo "⚛️ 检查Node.js环境..."
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js 未安装"
fi

if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm 未安装"
fi

# 检查Docker环境
echo ""
echo "🐳 检查Docker环境..."
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version)"
else
    echo "❌ Docker 未安装"
fi

if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose: $(docker-compose --version)"
else
    echo "❌ Docker Compose 未安装"
fi

echo ""
echo "🎉 项目设置检查完成！"
echo ""
echo "🚀 快速启动选项："
echo "  开发模式: ./start-dev.sh"
echo "  Docker模式: ./start.sh" 