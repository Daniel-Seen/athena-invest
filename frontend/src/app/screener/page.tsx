"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Star, TrendingUp, Shield, DollarSign } from "lucide-react";

interface StockScore {
  symbol: string;
  name: string;
  sector: string;
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "excellent" | "great" | "good">(
    "all"
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "http://localhost:8000/api/screener/quality?market=us&limit=15"
        );
        if (res.ok) {
          const data = await res.json();
          setStocks(data);
        }
      } catch {
        // Fallback data for demo
        setStocks(SAMPLE_STOCKS);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

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
          基于价值投资核心指标的多维度质量评分
        </p>
      </div>

      {/* Filters */}
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
            className="cursor-pointer"
            onClick={() => setFilter(f.key as any)}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((stock) => (
            <ScoreCard key={stock.symbol} stock={stock} />
          ))}
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
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold">{stock.name}</h3>
              <span className="text-sm text-muted-foreground font-mono">
                {stock.symbol}
              </span>
              <Badge variant="outline" className="text-xs">
                {stock.sector}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {stock.analysis}
            </p>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            </div>
          </div>

          {/* Score */}
          <div className="ml-6 text-center">
            <div
              className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center ${scoreColor}`}
            >
              <span className="text-2xl font-bold">{stock.quality_score}</span>
              <span className="text-[10px]">分</span>
            </div>
            <Badge className={`mt-2 ${scoreColor.replace("score", "bg")}`}>
              {stock.rating}
            </Badge>
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

// Sample data for demo when backend is unavailable
const SAMPLE_STOCKS: StockScore[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    quality_score: 85,
    rating: "🏆 卓越",
    metrics: {
      roe: 147.9,
      gross_margin: 45.6,
      debt_to_equity: 151.0,
      pe_ratio: 28.5,
      revenue_growth: -5.5,
    },
    analysis: "盈利能力强劲；有一定竞争优势；负债率偏高",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    sector: "Technology",
    quality_score: 82,
    rating: "🏆 卓越",
    metrics: {
      roe: 38.5,
      gross_margin: 69.8,
      debt_to_equity: 30.2,
      pe_ratio: 35.2,
      revenue_growth: 15.7,
    },
    analysis: "盈利能力强劲；具备宽阔护城河；财务结构健康",
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    quality_score: 75,
    rating: "⭐ 优秀",
    metrics: {
      roe: 36.2,
      gross_margin: 68.3,
      debt_to_equity: 42.1,
      pe_ratio: 16.8,
      revenue_growth: 6.5,
    },
    analysis: "盈利能力强劲；具备宽阔护城河；财务结构健康",
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    sector: "Financial",
    quality_score: 79,
    rating: "⭐ 优秀",
    metrics: {
      roe: 48.1,
      gross_margin: 97.8,
      debt_to_equity: 55.3,
      pe_ratio: 30.1,
      revenue_growth: 9.7,
    },
    analysis: "盈利能力强劲；具备宽阔护城河；负债水平可控",
  },
  {
    symbol: "PG",
    name: "Procter & Gamble",
    sector: "Consumer Defensive",
    quality_score: 72,
    rating: "⭐ 优秀",
    metrics: {
      roe: 30.5,
      gross_margin: 50.2,
      debt_to_equity: 65.3,
      pe_ratio: 25.1,
      revenue_growth: 3.2,
    },
    analysis: "盈利能力强劲；有一定竞争优势；负债水平可控",
  },
];
