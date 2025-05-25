#!/bin/bash

echo "🚀 启动智能数据分析平台 - 简化模式（SQLite数据库）"

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "✅ 已创建 .env 文件"
fi

# 启动后端
echo "🐍 启动后端服务..."
cd backend

# 创建虚拟环境
if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境并安装依赖
source venv/bin/activate
echo "安装Python依赖..."
pip install -r requirements.txt

# 创建上传目录
mkdir -p uploads

echo "启动FastAPI服务器..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# 启动前端
echo "⚛️ 启动前端服务..."
cd frontend

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install --legacy-peer-deps
fi

npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "🌐 访问地址："
echo "  前端应用: http://localhost:5173"
echo "  后端API: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
echo ""
echo "💾 数据存储："
echo "  SQLite数据库: ./backend/data_analysis.db"
echo "  文件上传: ./backend/uploads/"
echo ""
echo "🛑 停止服务: 按 Ctrl+C"

# 等待用户中断
trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait 