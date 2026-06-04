"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PLACEHOLDER } from "@/lib/placeholder";
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Target,
  DollarSign,
} from "lucide-react";

interface IndexData {
  value: number;
  change_pct: number;
}

export default function DashboardPage() {
  const [indices, setIndices] = useState<Record<string, IndexData>>({});
  const [wisdom, setWisdom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [idxRes, wisdomRes] = await Promise.all([
          fetch("http://localhost:8000/api/market/indices?market=cn").then((r) =>
            r.json()
          ),
          fetch("http://localhost:8000/api/wisdom/daily").then((r) => r.json()),
        ]);
        if (idxRes && Object.keys(idxRes).length > 0) setIndices(idxRes);
        if (wisdomRes) setWisdom(wisdomRes);
      } catch {
        // Use placeholder data
        setIndices(PLACEHOLDER.indices);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const cnIndices = Object.entries(indices).filter(([name]) =>
    ["上证指数", "深证成指", "沪深300", "创业板指"].includes(name)
  );
  const usIndices = Object.entries(indices).filter(([name]) =>
    ["标普500", "纳斯达克"].includes(name)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">市场仪表盘</h2>
          <p className="text-muted-foreground mt-1">
            实时追踪全球市场动态与投资智慧
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {new Date().toLocaleDateString("zh-CN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Badge>
      </div>

      {/* Wisdom Card */}
      {wisdom && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-500/20">
                <Lightbulb className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
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
                <p className="text-sm text-muted-foreground">
                  {wisdom.explanation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Indices */}
      <Tabs defaultValue="cn" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="cn">🇨🇳 A股市场</TabsTrigger>
          <TabsTrigger value="us">🇺🇸 美股市场</TabsTrigger>
        </TabsList>

        <TabsContent value="cn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cnIndices.map(([name, data]) => (
              <IndexCard key={name} name={name} data={data} loading={loading} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="us">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usIndices.map(([name, data]) => (
              <IndexCard key={name} name={name} data={data} loading={loading} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              投资大师智慧
            </CardTitle>
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground mt-1">
              条精选投资原则
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              可筛选资产
            </CardTitle>
            <Target className="w-4 h-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">40+</div>
            <p className="text-xs text-muted-foreground mt-1">只美股优质标的</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              模拟资金
            </CardTitle>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥1,000,000</div>
            <p className="text-xs text-muted-foreground mt-1">虚拟起始资金</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IndexCard({
  name,
  data,
  loading,
}: {
  name: string;
  data: IndexData;
  loading: boolean;
}) {
  const isUp = data.change_pct >= 0;

  return (
    <Card className={isUp ? "border-l-green-500 border-l-4" : "border-l-red-500 border-l-4"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-mono font-bold">
            {loading ? "---" : data.value.toLocaleString()}
          </span>
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              isUp ? "text-green-400" : "text-red-400"
            }`}
          >
            {isUp ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {isUp ? "+" : ""}
            {data.change_pct}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
