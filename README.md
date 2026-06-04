# 🏛️ Athena Invest

> **个人投资智能仪表盘** — 零基础投资者的价值投资副驾驶

汇聚巴菲特、芒格、彼得·林奇、格雷厄姆等顶级投资大师的核心智慧，结合实时市场数据和量化质量评分，帮助你从零开始学会"钱生钱"。

---

## ✨ 核心功能

### 📊 市场仪表盘
- 全球主要指数实时追踪（上证、深证、标普500、纳斯达克）
- 行业板块涨跌热力图
- 每日市场情绪概览

### 🔍 优质资产筛选器
- 基于 ROE / 毛利率 / 负债率 / 自由现金流的**多维质量评分系统**
- 护城河分析（竞争优势持久性评估）
- 估值分析（PE/PB/PEG 综合判断）
- A股沪深300 + 美股权重股覆盖

### 💡 投资智慧
- 15 条精选投资原则，来自巴菲特、芒格、林奇、格雷厄姆、达里奥、段永平等
- 每日推送一条投资智慧卡片
- 按大师 / 分类筛选学习

### 💼 模拟投资组合
- ¥1,000,000 虚拟资金 — 零风险练习投资决策
- 买入 / 卖出模拟，实时追踪盈亏
- 交易日志与决策记录

---

## 🛠️ 技术栈

| 层   | 技术                                  |
| ---- | ------------------------------------- |
| 前端 | Next.js 14 + React 18 + TailwindCSS + shadcn/ui |
| 后端 | Python FastAPI                        |
| 数据 | akshare (A股) + yfinance (美股)        |
| 数据库 | SQLite                              |
| 图表 | Recharts（计划中）                    |

---

## 🚀 快速启动

### 1. 克隆项目
```bash
git clone https://github.com/Daniel-Seen/athena-invest.git
cd athena-invest
```

### 2. 启动后端
```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 启动前端
```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000 即可使用。

---

## 📋 项目结构

```
athena-invest/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 应用入口
│   │   ├── api/               # API 路由
│   │   │   ├── market.py      # 市场数据 API
│   │   │   ├── screener.py    # 资产筛选 API
│   │   │   ├── wisdom.py      # 投资智慧 API
│   │   │   └── portfolio.py   # 模拟组合 API
│   │   ├── services/          # 业务逻辑
│   │   │   ├── market.py      # 市场数据服务
│   │   │   ├── scorer.py      # 质量评分引擎
│   │   │   ├── wisdom.py      # 投资智慧引擎
│   │   │   └── portfolio.py   # 组合管理引擎
│   │   └── data/
│   │       └── database.py    # 数据库初始化
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router 页面
│   │   │   ├── page.tsx       # 仪表盘首页
│   │   │   ├── screener/      # 资产筛选页
│   │   │   ├── wisdom/        # 投资智慧页
│   │   │   └── portfolio/     # 模拟组合页
│   │   ├── components/        # 共享组件
│   │   └── lib/               # 工具函数
│   └── package.json
├── docs/
│   └── IMPLEMENTATION_PLAN.md
├── PRD.md
└── README.md
```

---

## 🎯 投资哲学

本项目遵循**价值投资（Value Investing）**的核心理念：

1. **能力圈** — 只投资你懂的
2. **护城河** — 寻找有持久竞争优势的公司
3. **安全边际** — 以低于内在价值的价格买入
4. **长期主义** — 最好的持有期限是永远
5. **市场先生** — 利用市场情绪，不被市场左右

---

## 📝 License

MIT
