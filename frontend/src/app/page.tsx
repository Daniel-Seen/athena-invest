"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, TrendingDown, Lightbulb, Target, DollarSign, Loader2,
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { apiGet } from "@/lib/api";

interface IndexData {
  value: number;
  change_pct: number;
}

interface HistoryPoint {
  date: string;
  close: number;
}

export default function DashboardPage() {
  const [indices, setIndices] = useState<Record<string, IndexData>>({});
  const [wisdom, setWisdom] = useState<any>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [idxRes, wisdomRes, histRes] = await Promise.all([
          apiGet("/api/market/indices?market=cn") as Promise<Record<string, IndexData>>,
          apiGet("/api/wisdom/daily"),
          apiGet("/api/screener/history/000300?market=cn&period=daily") as Promise<HistoryPoint[]>,
        ]);

        if (idxRes && Object.keys(idxRes).length > 0) setIndices(idxRes);
        if (wisdomRes) setWisdom(wisdomRes);
        if (histRes && Array.isArray(histRes)) setHistory(histRes.slice(-30));
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  const cnIndices = Object.entries(indices).filter(([name]) =>
    ["上证指数", "深证成指", "沪深300", "创业板指"].includes(name)
  );

  const trendUp = history.length > 1 && history[history.length - 1].close >= history[0].close;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">市场仪表盘</h2>
          <p className="text-muted-foreground mt-1">实时追踪全球市场 + 投资智慧</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {new Date().toLocaleDateString("zh-CN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </Badge>
      </div>

      {/* Wisdom Card */}
      {wisdom && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-500/20 shrink-0">
                <Lightbulb className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    今日智慧
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {wisdom.investor} · {wisdom.principle}
                  </span>
                </div>
                <blockquote className="text-lg italic text-foreground/90 mb-2">
                  &ldquo;{wisdom.quote}&rdquo;
                </blockquote>
                <p className="text-sm text-muted-foreground">{wisdom.explanation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cnIndices.map(([name, data]) => (
          <IndexCard key={name} name={name} data={data} loading={loading} />
        ))}
      </div>

      {/* Trend Chart */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">沪深300 近30日走势</CardTitle>
              <Badge variant="outline" className={trendUp ? "text-green-400" : "text-red-400"}>
                {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {trendUp ? "上升趋势" : "下降趋势"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={history}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#888" }}
                  tickFormatter={(d: string) => d.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "#888" }}
                  width={60}
                />
                <Tooltip
                  formatter={(v: any) => [Number(v).toFixed(2), "收盘价"]}
                  labelFormatter={(l: any) => `日期: ${l}`}
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={trendUp ? "#34d399" : "#f87171"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <QuickStat icon={<Lightbulb className="w-4 h-4 text-amber-400" />} value="15条" label="投资大师原则" />
        <QuickStat icon={<Target className="w-4 h-4 text-green-400" />} value="60+只" label="覆盖A股美股" />
        <QuickStat icon={<DollarSign className="w-4 h-4 text-blue-400" />} value="¥100万" label="模拟起始资金" />
      </div>
    </div>
  );
}

function IndexCard({ name, data, loading }: { name: string; data: IndexData; loading: boolean }) {
  const isUp = data.change_pct >= 0;
  return (
    <Card className={isUp ? "border-l-green-500 border-l-4" : "border-l-red-500 border-l-4"}>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs text-muted-foreground">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-mono font-bold">
          {loading ? "---" : data.value.toLocaleString()}
        </div>
        <span className={`flex items-center gap-1 text-sm font-medium ${isUp ? "text-green-400" : "text-red-400"}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? "+" : ""}{data.change_pct}%
        </span>
      </CardContent>
    </Card>
  );
}

function QuickStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-4 flex items-center gap-3">
        {icon}
        <div>
          <div className="text-lg font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
