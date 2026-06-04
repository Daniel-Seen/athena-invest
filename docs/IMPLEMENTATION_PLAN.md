# 🏛️ Athena Invest — 实施计划

> **For Hermes:** 自主执行全栈开发，分阶段交付，每阶段提交到 GitHub。

**Goal:** 构建零基础投资者可用的个人投资仪表盘——市场数据+优质资产筛选+知识学习+模拟投资

**Architecture:** Next.js 14 前端 + FastAPI 后端 + SQLite 数据库，A股用 akshare，美股用 yfinance

**Tech Stack:** Next.js 14, React 18, TailwindCSS, shadcn/ui, FastAPI, Python 3.11, SQLite, akshare, yfinance, Recharts

---

## Phase 1: 项目脚手架 + 后端核心 [当前]

### Task 1.1: 后端项目初始化
- 创建 FastAPI 项目结构
- requirements.txt (fastapi, uvicorn, akshare, yfinance, pandas, aiosqlite)
- 基础 main.py + 健康检查端点
- 数据库初始化脚本

### Task 1.2: 市场数据服务
- MarketDataService: 获取 A股/美股实时数据
- 主要指数数据（上证、深证、标普500、纳斯达克）
- API 端点: GET /api/market/indices, GET /api/market/stock/{symbol}

### Task 1.3: 财务质量评分引擎
- QualityScorer: ROE, ROIC, 毛利率, 负债率, FCF yield 计算
- 综合评分系统 (0-100分)
- API 端点: GET /api/screener/quality?market=cn

### Task 1.4: 投资大师智慧引擎
- WisdomEngine: 预置巴菲特/芒格/达里奥/林奇/格雷厄姆的核心原则
- 每日学习卡片API
- API 端点: GET /api/wisdom/daily, GET /api/wisdom/principles

## Phase 2: 前端 Dashboard

### Task 2.1: Next.js 项目初始化
- create-next-app + TailwindCSS + shadcn/ui
- 基础布局（侧边栏 + 主内容区）
- 暗色模式支持

### Task 2.2: 市场仪表盘页面
- 指数卡片组件
- 市场概览图表
- API 集成

### Task 2.3: 优质资产筛选器页面
- 筛选条件面板
- 资产列表 + 评分展示
- 排序/过滤功能

### Task 2.4: 知识学习页面
- 每日学习卡片
- 投资原则列表
- 术语词典

## Phase 3: 模拟投资组合

### Task 3.1: 模拟交易系统
- 虚拟账户管理
- 买入/卖出 API
- 持仓追踪

### Task 3.2: 投资组合页面
- 持仓概览
- 收益曲线
- 交易历史

## Phase 4: 完善与部署

### Task 4.1: 新闻聚合
### Task 4.2: 响应式优化
### Task 4.3: 部署配置
