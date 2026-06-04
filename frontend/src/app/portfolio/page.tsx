"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Plus,
  Minus,
  History,
} from "lucide-react";

interface Position {
  symbol: string;
  name: string;
  market: string;
  shares: number;
  buy_price: number;
  invested: number;
  buy_date: string;
  notes: string;
}

interface PortfolioData {
  initial_capital: number;
  total_invested: number;
  cash: number;
  positions: Position[];
  position_count: number;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:8000/api/portfolio/summary");
        if (res.ok) setPortfolio(await res.json());
      } catch {
        // Demo empty portfolio
        setPortfolio({
          initial_capital: 1000000,
          total_invested: 0,
          cash: 1000000,
          positions: [],
          position_count: 0,
        });
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (!portfolio) return null;

  const investedPercent = (portfolio.total_invested / portfolio.initial_capital) * 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">模拟投资组合</h2>
        <p className="text-muted-foreground mt-1">
          虚拟资金 ¥1,000,000 — 在实战前用模拟账户练习投资决策
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总资金
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              ¥{portfolio.initial_capital.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已投资
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-400">
              ¥{portfolio.total_invested.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              占比 {investedPercent.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              可用现金
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-green-400">
              ¥{portfolio.cash.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              持仓数量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolio.position_count}
            </div>
            <p className="text-xs text-muted-foreground mt-1">只标的</p>
          </CardContent>
        </Card>
      </div>

      {/* Positions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>当前持仓</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" />
                买入
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <History className="w-4 h-4" />
                交易记录
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {portfolio.positions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">还没有任何持仓</p>
              <p className="text-sm">
                前往"资产筛选"页面，找到优质资产后点击"买入"
                开始你的模拟投资之旅
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolio.positions.map((pos) => (
                <div
                  key={pos.symbol}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{pos.name}</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {pos.symbol}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {pos.market}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{pos.shares} 股</span>
                      <span>成本 ¥{pos.buy_price}</span>
                      <span>买入 {pos.buy_date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono">
                      ¥{pos.invested.toLocaleString()}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 gap-1 mt-1"
                    >
                      <Minus className="w-3 h-3" />
                      卖出
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Getting Started Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">💡 新手投资指南</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-secondary/30">
              <h4 className="font-medium mb-2">📚 第一步：学习</h4>
              <p className="text-muted-foreground">
                先去"投资智慧"页面，读完前5条原则。
                理解什么是价值投资。
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <h4 className="font-medium mb-2">🔍 第二步：筛选</h4>
              <p className="text-muted-foreground">
                在"资产筛选"页面，找出质量评分
                {'>'}70的优质公司，研究它们做什么生意。
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <h4 className="font-medium mb-2">💼 第三步：模拟</h4>
              <p className="text-muted-foreground">
                用虚拟资金买入你看好的公司，记录决策原因。
                3个月后回顾你的判断是否正确。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
