"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Star, TrendingUp, Shield, DollarSign, Loader2 } from "lucide-react";

interface StockScore {
  symbol: string;
  name: string;
  sector?: string;
  quality_score: number;
  rating: string;
  metrics: {
    roe?: number;
    gross_margin?: number;
    debt_to_equity?: number;
    pe_ratio?: number;
    dividend_yield?: number;
    revenue_growth?: number;
  };
  analysis: string;
}

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<StockScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [market, setMarket] = useState<"us" | "cn">("us");
  const [filter, setFilter] = useState<"all" | "excellent" | "great" | "good">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `http://localhost:8000/api/screener/quality?market=${market}&limit=20`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStocks(data);
        } else {
          throw new Error("No data returned");
        }
      } catch (e: any) {
        setError(e.message || "Failed to load data");
        // Use sample data as fallback
        setStocks(market === "us" ? SAMPLE_US : SAMPLE_CN);
      }
      setLoading(false);
    }
    fetchData();
  }, [market]);

  const filtered =
    filter === "all"
      ? stocks
      : stocks.filter((s) => {
          if (filter === "excellent") return s.quality_score >= 80;
          if (filter === "great") return s.quality_score >= 65;
          if (filter === "good") return s.quality_score >= 50;
          return true;
        });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">优质资产筛选器</h2>
        <p className="text-muted-foreground mt-1">
          基于 ROE · 毛利率 · 负债率 · PE · 自由现金流 的多维质量评分
        </p>
      </div>

      {/* Market Tabs */}
      <Tabs value={market} onValueChange={(v) => setMarket(v as "us" | "cn")}>
        <TabsList className="mb-4">
          <TabsTrigger value="us">🇺🇸 美股</TabsTrigger>
          <TabsTrigger value="cn">🇨🇳 A股</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Quality Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: "all", label: "全部" },
          { key: "excellent", label: "🏆 卓越 (80+)" },
          { key: "great", label: "⭐ 优秀 (65+)" },
          { key: "good", label: "👍 良好 (50+)" },
        ].map((f) => (
          <Badge
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            className="cursor-pointer hover:opacity-80"
            onClick={() => setFilter(f.key as typeof filter)}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">正在获取实时数据...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && stocks.length === 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-6 text-center">
            <p className="text-red-400">⚠️ 数据获取失败: {error}</p>
            <p className="text-sm text-muted-foreground mt-1">请确保后端服务已启动</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading && (
        <div className="grid gap-4">
          {filtered.map((stock) => (
            <ScoreCard key={`${market}-${stock.symbol}`} stock={stock} />
          ))}
          {filtered.length === 0 && !error && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>没有符合条件的结果</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreCard({ stock }: { stock: StockScore }) {
  const scoreColor =
    stock.quality_score >= 80
      ? "score-excellent"
      : stock.quality_score >= 65
      ? "score-great"
      : stock.quality_score >= 50
      ? "score-good"
      : "score-fair";

  return (
    <Card className="hover:bg-secondary/5 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold truncate">{stock.name}</h3>
              <span className="text-sm text-muted-foreground font-mono shrink-0">
                {stock.symbol}
              </span>
              {stock.sector && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {stock.sector}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">{stock.analysis}</p>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stock.metrics.roe != null && (
                <MetricBadge
                  icon={<TrendingUp className="w-3 h-3" />}
                  label="ROE"
                  value={`${stock.metrics.roe}%`}
                />
              )}
              {stock.metrics.gross_margin != null && (
                <MetricBadge
                  icon={<Shield className="w-3 h-3" />}
                  label="毛利率"
                  value={`${stock.metrics.gross_margin}%`}
                />
              )}
              {stock.metrics.pe_ratio != null && (
                <MetricBadge
                  icon={<DollarSign className="w-3 h-3" />}
                  label="P/E"
                  value={`${stock.metrics.pe_ratio}`}
                />
              )}
              {stock.metrics.revenue_growth != null && (
                <MetricBadge
                  icon={<Star className="w-3 h-3" />}
                  label="营收增长"
                  value={`${stock.metrics.revenue_growth}%`}
                />
              )}
              {stock.metrics.debt_to_equity != null && (
                <MetricBadge
                  icon={<Shield className="w-3 h-3" />}
                  label="负债率"
                  value={`${stock.metrics.debt_to_equity}%`}
                />
              )}
            </div>
          </div>

          {/* Score */}
          <div className="ml-6 text-center shrink-0">
            <div
              className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center ${scoreColor}`}
            >
              <span className="text-2xl font-bold">{stock.quality_score}</span>
              <span className="text-[10px]">分</span>
            </div>
            <Badge className="mt-2 text-xs">{stock.rating}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 text-xs">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

const SAMPLE_US: StockScore[] = [
  {
    symbol: "AAPL", name: "Apple Inc.", sector: "Technology", quality_score: 85,
    rating: "🏆 卓越",
    metrics: { roe: 147.9, gross_margin: 45.6, debt_to_equity: 151, pe_ratio: 28.5, revenue_growth: -5.5 },
    analysis: "盈利能力强劲；有一定竞争优势；负债率偏高",
  },
  {
    symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology", quality_score: 82,
    rating: "🏆 卓越",
    metrics: { roe: 38.5, gross_margin: 69.8, debt_to_equity: 30, pe_ratio: 35.2, revenue_growth: 15.7 },
    analysis: "盈利能力强劲；具备宽阔护城河；财务结构健康",
  },
  {
    symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", quality_score: 75,
    rating: "⭐ 优秀",
    metrics: { roe: 36.2, gross_margin: 68.3, debt_to_equity: 42, pe_ratio: 16.8, revenue_growth: 6.5 },
    analysis: "盈利能力强劲；具备宽阔护城河；财务结构健康",
  },
];

const SAMPLE_CN: StockScore[] = [
  {
    symbol: "600519", name: "贵州茅台", sector: "白酒", quality_score: 88,
    rating: "🏆 卓越",
    metrics: { roe: 30.2, gross_margin: 91.5, debt_to_equity: 18, pe_ratio: 25.3, revenue_growth: 15.8 },
    analysis: "盈利能力强劲；具备宽阔护城河；财务结构健康",
  },
  {
    symbol: "000858", name: "五粮液", sector: "白酒", quality_score: 79,
    rating: "⭐ 优秀",
    metrics: { roe: 25.1, gross_margin: 75.3, debt_to_equity: 22, pe_ratio: 18.5, revenue_growth: 12.1 },
    analysis: "盈利能力强劲；具备宽阔护城河；财务结构健康",
  },
  {
    symbol: "600036", name: "招商银行", sector: "银行", quality_score: 72,
    rating: "⭐ 优秀",
    metrics: { roe: 15.8, gross_margin: 45.2, debt_to_equity: 85, pe_ratio: 6.5, revenue_growth: 8.2 },
    analysis: "盈利能力稳定；有一定竞争优势；负债率偏高",
  },
];
