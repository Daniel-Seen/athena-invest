# Athena Invest — Gap Analysis & Iteration 2 Roadmap

## 🔴 Critical Gaps (P0)

| # | Gap | Current State | Target | Impact |
|---|-----|--------------|--------|--------|
| 1 | **无数据可视化** | 纯文字数字卡片 | Recharts 图表（指数走势、持仓分布饼图、收益曲线） | 核心体验缺失 |
| 2 | **A股筛选未接通** | 后端有A_STOCK_UNIVERSE但前端只筛美股 | 沪深300质量评分 + A股筛选页 | 用户主要市场 |
| 3 | **组合盈亏计算** | 只有买入成本，无当前市值 | 实时获取当前价格，计算浮动盈亏 | 核心功能不完整 |
| 4 | **交易按钮不可用** | 前端有买入/卖出按钮但未接API | 完整交易流程（买入→持仓更新→卖出→盈亏记录） | 阻塞核心流程 |

## 🟡 Important Gaps (P1)

| # | Gap | Solution |
|---|-----|----------|
| 5 | A股指数数据未在前端展示 | 统一市场切换，中美数据都从API获取 |
| 6 | 智慧页数据硬编码 | 改为从后端 API 获取 |
| 7 | 缺少 loading/empty/error 状态 | 统一三态处理 |
| 8 | 缺少响应式设计 | 移动端适配 |

## 🟢 Nice-to-have (P2)
- Recharts 历史走势图
- 新闻聚合
- 搜索功能
- 暗色/亮色切换

---

## Iteration 2 实施方案

### Phase 2.1: 后端增强
- [x] 组合持仓实时估值 API (GET /api/portfolio/valuation)
- [ ] A股质量评分引擎 (复用 scorer 模式 + akshare 财务数据)
- [ ] 历史数据 API (用于图表)

### Phase 2.2: 前端图表 + 交互
- [ ] 安装 Recharts
- [ ] 仪表盘添加指数迷你走势图
- [ ] 筛选器添加 A股/美股 Tab 切换
- [ ] 组合页添加持仓盈亏实时计算
- [ ] 买入/卖出弹窗 Modal

### Phase 2.3: 交易流程打通
- [ ] 买入 Modal (选择股票 → 输入数量 → 确认 → API调用)
- [ ] 卖出 Modal (选择持仓 → 输入数量 → 确认 → API调用)
- [ ] 交易成功后自动刷新持仓
