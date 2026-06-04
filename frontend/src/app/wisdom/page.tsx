"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, BookOpen, GraduationCap, Quote } from "lucide-react";

interface Principle {
  id: number;
  investor: string;
  principle: string;
  quote: string;
  explanation: string;
  category: string;
  book: string;
}

const PRINCIPLES: Principle[] = [
  {
    id: 1,
    investor: "沃伦·巴菲特",
    principle: "能力圈原则",
    quote: "风险来自于你不知道自己在做什么。",
    explanation:
      "只投资你真正理解的生意。如果你不能用一句话说清楚这家公司怎么赚钱，就不要买它的股票。",
    category: "投资心态",
    book: "《巴菲特致股东的信》",
  },
  {
    id: 2,
    investor: "沃伦·巴菲特",
    principle: "护城河理论",
    quote: "我们要找的是那种有宽阔护城河围绕的城堡。",
    explanation:
      "优质公司拥有持久的竞争优势（品牌、规模效应、网络效应、专利等），竞争对手难以复制。护城河越宽，长期盈利能力越有保障。",
    category: "选股策略",
    book: "《巴菲特致股东的信》",
  },
  {
    id: 3,
    investor: "沃伦·巴菲特",
    principle: "市场先生",
    quote: "在别人恐惧时贪婪，在别人贪婪时恐惧。",
    explanation:
      "本杰明·格雷厄姆的'市场先生'比喻：市场每天给你报价，有时高得离谱，有时低得可笑。聪明的投资者利用市场先生的情绪，而不是被它左右。",
    category: "市场心理",
    book: "《聪明的投资者》",
  },
  {
    id: 4,
    investor: "查理·芒格",
    principle: "逆向思维",
    quote: "反过来想，总是反过来想。",
    explanation:
      "与其想'如何选到好股票'，不如先想'如何避免选到烂股票'。排除所有明显的错误后，剩下的选择就清晰多了。",
    category: "思维模型",
    book: "《穷查理宝典》",
  },
  {
    id: 5,
    investor: "查理·芒格",
    principle: "耐心等待",
    quote: "赚大钱的诀窍不在于买和卖，而在于等待。",
    explanation:
      "伟大投资机会不是每天都有。大部分时间你应该什么都不做，只在最确定的机会出现时才扣动扳机。",
    category: "投资心态",
    book: "《穷查理宝典》",
  },
  {
    id: 6,
    investor: "彼得·林奇",
    principle: "投资你懂的",
    quote: "投资你了解的。最好的股票往往就在你身边。",
    explanation:
      "你每天使用的产品和服务，可能就是最好的投资标的。作为消费者，你比华尔街分析师更早发现好公司。",
    category: "选股策略",
    book: "《彼得·林奇的成功投资》",
  },
  {
    id: 7,
    investor: "彼得·林奇",
    principle: "PEG估值法",
    quote: "市盈率应该与增长率相匹配。PEG = PE / 增长率，小于1才值得关注。",
    explanation:
      "光看PE不够，要结合增长率。一个PE为30但年增长40%的公司，比PE为10但零增长的公司更便宜。",
    category: "估值方法",
    book: "《彼得·林奇的成功投资》",
  },
  {
    id: 8,
    investor: "本杰明·格雷厄姆",
    principle: "安全边际",
    quote: "安全边际是投资的基石。",
    explanation:
      "即使公司非常优质，也要以低于内在价值的价格买入。你付出的价格越低，犯错的空间就越大，长期收益就越好。永远留足安全边际。",
    category: "估值方法",
    book: "《聪明的投资者》",
  },
];

const CATEGORIES = ["全部", "投资心态", "选股策略", "市场心理", "思维模型", "估值方法"];
const INVESTORS = ["全部", "沃伦·巴菲特", "查理·芒格", "彼得·林奇", "本杰明·格雷厄姆"];

export default function WisdomPage() {
  const [daily, setDaily] = useState<Principle | null>(null);
  const [allPrinciples, setAllPrinciples] = useState<Principle[]>(PRINCIPLES);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [activeInvestor, setActiveInvestor] = useState("全部");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [dailyRes, principlesRes] = await Promise.all([
          fetch("http://localhost:8000/api/wisdom/daily"),
          fetch("http://localhost:8000/api/wisdom/principles"),
        ]);
        if (dailyRes.ok) setDaily(await dailyRes.json());
        if (principlesRes.ok) {
          const data = await principlesRes.json();
          setAllPrinciples(data);
        }
      } catch {
        // Fallback to local data
        setDaily(PRINCIPLES[new Date().getDate() % PRINCIPLES.length]);
        setAllPrinciples(PRINCIPLES);
      }
    }
    fetchAll();
  }, []);

  const filtered = allPrinciples.filter(
    (p) =>
      (activeCategory === "全部" || p.category === activeCategory) &&
      (activeInvestor === "全部" || p.investor === activeInvestor)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">投资智慧</h2>
        <p className="text-muted-foreground mt-1">
          汇聚巴菲特、芒格、林奇、格雷厄姆等顶级投资大师的核心原则
        </p>
      </div>

      {/* Daily Wisdom Hero */}
      {daily && (
        <Card className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border-amber-500/20">
          <CardContent className="p-8">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Lightbulb className="w-3 h-3 mr-1" />
                今日投资智慧
              </Badge>
              <h3 className="text-2xl font-bold mb-2">{daily.principle}</h3>
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <GraduationCap className="w-4 h-4" />
                <span>{daily.investor}</span>
                <span>·</span>
                <BookOpen className="w-4 h-4" />
                <span>{daily.book}</span>
              </div>
              <blockquote className="text-xl italic border-l-2 border-amber-400 pl-4 mb-4">
                &ldquo;{daily.quote}&rdquo;
              </blockquote>
              <p className="text-muted-foreground leading-relaxed">
                {daily.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-1">分类：</span>
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-1">大师：</span>
          {INVESTORS.map((inv) => (
            <Badge
              key={inv}
              variant={activeInvestor === inv ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveInvestor(inv)}
            >
              {inv}
            </Badge>
          ))}
        </div>
      </div>

      {/* Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <Card
            key={p.id}
            className="hover:bg-secondary/5 transition-colors group"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{p.principle}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {p.investor} · {p.book}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {p.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <Quote className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
                <div>
                  <p className="text-sm italic text-foreground/80 mb-2">
                    &ldquo;{p.quote}&rdquo;
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {p.explanation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
