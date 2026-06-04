"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Minus,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

interface Position {
  symbol: string;
  name: string;
  shares: number;
  buy_price: number;
  current_price: number;
  cost: number;
  value: number;
  pnl: number;
  pnl_pct: number;
  buy_date: string;
}

interface Valuation {
  total_cost: number;
  total_value: number;
  total_pnl: number;
  total_pnl_pct: number;
  positions: Position[];
}

const COLORS = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];

export default function PortfolioPage() {
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuy, setShowBuy] = useState(false);
  const [showSell, setShowSell] = useState<Position | null>(null);
  const [tradeMsg, setTradeMsg] = useState("");

  const fetchValuation = useCallback(async () => {
    try {
      const data = await apiGet("/api/portfolio/valuation") as Valuation;
      setValuation(data);
    } catch (e) {
      // backend not ready
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchValuation();
  }, [fetchValuation]);

  const doTrade = async (type: "buy" | "sell", symbol: string, name: string, shares: number, price: number, notes: string) => {
    setTradeMsg("");
    try {
      const data: any = await apiPost(`/api/portfolio/${type}`, { symbol, name, market: "us", shares, price, notes });
      if (data.error) {
        setTradeMsg(`❌ ${data.error}`);
      } else {
        setTradeMsg(`✅ ${type === "buy" ? "买入" : "卖出"}成功`);
        setShowBuy(false);
        setShowSell(null);
        await fetchValuation();
      }
    } catch {
      setTradeMsg("❌ 网络错误");
    }
  };

  if (!valuation) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="text-center py-20 text-muted-foreground">
          <Wallet className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">正在连接后端服务...</p>
          <p className="text-sm mt-2">请确保后端已启动: python3 -m uvicorn app.main:app --port 8000</p>
        </div>
      </div>
    );
  }

  const initCapital = 1_000_000;
  const cash = initCapital - valuation.total_cost;
  const investedPct = valuation.total_cost > 0 ? (valuation.total_cost / initCapital * 100) : 0;

  // Pie data: holdings breakdown
  const pieData = valuation.positions.map((p, i) => ({
    name: p.symbol,
    value: p.value,
    fill: COLORS[i % COLORS.length],
  }));

  // Bar data: P&L per position
  const barData = valuation.positions.map((p) => ({
    name: p.symbol,
    盈亏: p.pnl,
    成本: p.cost,
    市值: p.value,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">模拟投资组合</h2>
          <p className="text-muted-foreground mt-1">虚拟资金 ¥{initCapital.toLocaleString()}</p>
        </div>
        <Button onClick={() => setShowBuy(true)} className="gap-2">
          <Plus className="w-4 h-4" /> 买入
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="总市值"
          value={`¥${valuation.total_value.toLocaleString()}`}
          icon={<Wallet className="w-4 h-4" />}
        />
        <StatCard
          label="总成本"
          value={`¥${valuation.total_cost.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          label="可用现金"
          value={`¥${cash.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          label="总盈亏"
          value={`${valuation.total_pnl >= 0 ? "+" : ""}¥${valuation.total_pnl.toLocaleString()}`}
          icon={valuation.total_pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          className={valuation.total_pnl >= 0 ? "text-green-400" : "text-red-400"}
        />
        <StatCard
          label="收益率"
          value={`${valuation.total_pnl_pct >= 0 ? "+" : ""}${valuation.total_pnl_pct}%`}
          icon={<BarChart3 className="w-4 h-4" />}
          className={valuation.total_pnl_pct >= 0 ? "text-green-400" : "text-red-400"}
        />
      </div>

      {/* Charts Row */}
      {valuation.positions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Holdings Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">持仓分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `¥${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* P&L Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">各持仓盈亏</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip formatter={(v: any) => `¥${Number(v).toLocaleString()}`} />
                  <Bar dataKey="成本" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="市值" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Positions */}
      <Card>
        <CardHeader>
          <CardTitle>当前持仓 ({valuation.positions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {valuation.positions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">还没有任何持仓</p>
              <p className="text-sm">
                点击右上角"买入"按钮，开始你的模拟投资之旅
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {valuation.positions.map((pos) => (
                <div
                  key={pos.symbol}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{pos.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{pos.symbol}</span>
                      <Badge variant="outline" className="text-xs">US</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{pos.shares} 股 × ¥{pos.buy_price}</span>
                      <span>→ 现价 ¥{pos.current_price}</span>
                      <span>买入 {pos.buy_date}</span>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="font-mono font-bold">¥{pos.value.toLocaleString()}</div>
                    <div className={`text-sm font-mono ${pos.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {pos.pnl >= 0 ? "+" : ""}¥{pos.pnl.toLocaleString()}
                      <span className="ml-1">({pos.pnl_pct >= 0 ? "+" : ""}{pos.pnl_pct}%)</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => setShowSell(pos)}
                  >
                    <Minus className="w-4 h-4 mr-1" /> 卖出
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trade Message */}
      {tradeMsg && (
        <div className={`text-center text-sm p-2 rounded ${tradeMsg.startsWith("✅") ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
          {tradeMsg}
        </div>
      )}

      {/* Buy Modal */}
      {showBuy && (
        <TradeModal
          title="买入股票"
          onClose={() => { setShowBuy(false); setTradeMsg(""); }}
          onSubmit={(symbol, name, shares, price) => doTrade("buy", symbol, name, shares, price, "")}
          tradeMsg={tradeMsg}
        />
      )}

      {/* Sell Modal */}
      {showSell && (
        <TradeModal
          title={`卖出 ${showSell.name}`}
          onClose={() => { setShowSell(null); setTradeMsg(""); }}
          onSubmit={(symbol, name, shares, price) => doTrade("sell", symbol, name, shares, price, "")}
          tradeMsg={tradeMsg}
          initialSymbol={showSell.symbol}
          initialName={showSell.name}
          maxShares={showSell.shares}
          initialPrice={showSell.current_price}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className={`text-lg font-bold font-mono ${className}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function TradeModal({
  title,
  onClose,
  onSubmit,
  tradeMsg,
  initialSymbol = "",
  initialName = "",
  maxShares,
  initialPrice = 0,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (s: string, n: string, sh: number, p: number) => void;
  tradeMsg: string;
  initialSymbol?: string;
  initialName?: string;
  maxShares?: number;
  initialPrice?: number;
}) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [name, setName] = useState(initialName);
  const [shares, setShares] = useState(1);
  const [price, setPrice] = useState(initialPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold">{title}</h3>

        {!initialSymbol && (
          <>
            <div>
              <label className="text-xs text-muted-foreground">股票代码</label>
              <input
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-mono"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">股票名称</label>
              <input
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Apple Inc."
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">
              数量 {maxShares ? `(最多 ${maxShares})` : ""}
            </label>
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-mono"
              value={shares}
              onChange={(e) => setShares(Math.max(1, Math.min(Number(e.target.value), maxShares || 99999)))}
              min={1}
              max={maxShares || 99999}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">价格 (¥)</label>
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-mono"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              step="0.01"
              min={0.01}
            />
          </div>
        </div>

        {shares > 0 && price > 0 && (
          <div className="text-sm text-muted-foreground">
            预计金额: <span className="font-mono font-bold text-foreground">¥{(shares * price).toLocaleString()}</span>
          </div>
        )}

        {tradeMsg && (
          <div className={`text-sm p-2 rounded ${tradeMsg.startsWith("✅") ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
            {tradeMsg}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button
            onClick={() => onSubmit(symbol, name || symbol, shares, price)}
            disabled={!symbol || shares <= 0 || price <= 0}
          >
            确认{title.includes("买入") ? "买入" : "卖出"}
          </Button>
        </div>
      </div>
    </div>
  );
}
