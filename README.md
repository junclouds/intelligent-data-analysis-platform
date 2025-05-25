# 智能数据分析平台

一个现代化的数据分析平台，支持自然语言查询、数据可视化和智能洞察生成。

## 🚀 功能特性

- **自然语言查询**: 用中文提问，获得数据分析结果
- **多数据源支持**: 支持CSV、Excel、JSON文件上传，以及数据库连接
- **智能可视化**: 自动生成图表和数据可视化
- **AI洞察**: 基于数据自动生成分析报告和建议
- **现代化UI**: 毛玻璃效果、动画交互、响应式设计

## 🛠 技术栈

### 前端
- **React 18** + **TypeScript**
- **Vite** (构建工具)
- **Tailwind CSS** (样式框架)
- **ECharts** (图表库)
- **Framer Motion** (动画库)
- **React Query** (数据获取)

### 后端
- **FastAPI** (Python Web框架)
- **SQLAlchemy** (ORM)
- **Pandas** (数据处理)
- **OpenAI API** (AI分析)
- **PostgreSQL** (数据库)
- **Redis** (缓存)

## 📁 项目结构

```
intelligent-data-analysis-platform/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/          # 页面
│   │   ├── hooks/          # 自定义Hook
│   │   ├── services/       # API服务
│   │   ├── types/          # TypeScript类型
│   │   └── utils/          # 工具函数
│   ├── public/
│   └── package.json
├── backend/                  # FastAPI后端应用
│   ├── app/
│   │   ├── api/            # API路由
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── requirements.txt
│   └── main.py
├── docker-compose.yml        # Docker编排
├── start.sh                 # Docker启动脚本
├── start-dev.sh            # 开发环境启动脚本
└── README.md
```

## 🚀 快速开始

### 方法一：开发模式启动 (推荐用于测试)

```bash
# 克隆项目
git clone <repository-url>
cd intelligent-data-analysis-platform

# 创建并激活 conda 环境
conda create -n analysis python=3.10
conda activate analysis

# 一键启动开发环境
./start-dev.sh
```

这将会：
1. 安装后端依赖
2. 启动FastAPI服务器 (http://localhost:8000)
3. 安装前端依赖
4. 启动Vite开发服务器 (http://localhost:5173)

### 方法二：Docker启动 (推荐用于生产)

#### 环境要求
- Docker & Docker Compose
- Node.js 18+ (可选)
- Python 3.9+ (可选)
- Conda (可选，用于开发环境)

```bash
# 克隆项目
git clone <repository-url>
cd intelligent-data-analysis-platform

# 一键启动所有服务
./start.sh
```

### 方法三：手动启动

#### 1. 启动后端
```bash
cd backend
conda create -n analysis python=3.10  # 创建conda环境
conda activate analysis               # 激活环境
pip install -r requirements.txt       # 安装依赖
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. 启动前端
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## 🌐 访问地址

- **前端应用**: http://localhost:5173 (开发模式) 或 http://localhost:3000 (Docker)
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

## 📊 使用说明

### 1. 上传数据
- 支持 CSV、Excel、JSON 格式
- 最大文件大小：50MB
- 可以拖拽文件或点击上传

### 2. 选择示例数据
- 电商销售数据
- 用户行为数据  
- 财务数据

### 3. 自然语言分析
输入问题示例：
- "销售额趋势如何？"
- "哪个地区表现最好？"
- "用户年龄分布情况？"
- "产品销量排行榜？"

### 4. 查看结果
- 自动生成图表可视化
- AI智能洞察分析
- 数据详情表格

## 🔧 配置说明

### 环境变量
复制 `env.example` 为 `.env` 并根据需要修改：

```bash
# 数据库配置
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/data_analysis

# Redis配置  
REDIS_URL=redis://localhost:6379

# OpenAI配置 (可选，用于AI分析功能)
OPENAI_API_KEY=your-openai-api-key-here

# 应用密钥
SECRET_KEY=your-secret-key-change-in-production

# 前端API地址
VITE_API_BASE_URL=http://localhost:8000
```

### AI功能配置
- 如果有OpenAI API Key，设置 `OPENAI_API_KEY` 环境变量可启用AI智能分析
- 如果没有API Key，系统会使用基于规则的默认分析

## 🐳 Docker命令

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建
docker-compose up --build
```

## 🛠 开发指南

### 后端开发
```bash
cd backend
conda activate analysis
pip install -r requirements.txt
uvicorn main:app --reload
```

### 前端开发
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### 数据库迁移
```bash
cd backend
alembic upgrade head
```

## 📝 API文档

启动后端服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 常见问题

### Q: 前端启动失败？
A: 尝试删除 `node_modules` 和 `package-lock.json`，然后重新安装：
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Q: 后端数据库连接失败？
A: 检查 `.env` 文件中的数据库配置，确保PostgreSQL服务正在运行。

### Q: Docker启动失败？
A: 确保Docker和Docker Compose已正确安装，并且端口3000、8000、5432、6379未被占用。

### Q: 文件上传失败？
A: 检查文件格式是否支持（CSV、Excel、JSON），文件大小是否超过50MB限制。 