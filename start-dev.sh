#!/bin/bash

echo "🚀 启动智能数据分析平台 - 开发模式"

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "✅ 已创建 .env 文件"
fi

# 检查是否已安装conda
if ! command -v conda &> /dev/null; then
    echo "❌ 未检测到conda，请先安装Anaconda或Miniconda"
    exit 1
fi

# 启动后端
echo "🐍 启动后端服务..."
cd backend

# 检查并创建conda环境
if ! conda env list | grep -q "^analysis "; then
    echo "创建conda环境 'analysis'..."
    conda create -n analysis python=3.10 -y
fi

echo "激活conda环境..."
source $(conda info --base)/etc/profile.d/conda.sh
conda activate analysis

echo "安装Python依赖..."
pip install -r requirements.txt

echo "启动FastAPI服务器..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# 启动前端
echo "⚛️ 启动前端服务..."
cd frontend
npm install --legacy-peer-deps
npm run dev &
FRONTEND_PID=$!

cd ..

echo "✅ 服务启动完成！"
echo ""
echo "🌐 访问地址："
echo "  前端应用: http://localhost:5173"
echo "  后端API: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
echo ""
echo "🛑 停止服务: 按 Ctrl+C"

# 等待用户中断
trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 