"""Investment wisdom engine — curated principles from top investors."""
import random
from datetime import date


# Curated wisdom from the greatest investors
PRINCIPLES = [
    {
        "id": 1,
        "investor": "沃伦·巴菲特",
        "investor_en": "Warren Buffett",
        "principle": "能力圈原则",
        "quote": "风险来自于你不知道自己在做什么。",
        "explanation": "只投资你真正理解的生意。如果你不能用一句话说清楚这家公司怎么赚钱，就不要买它的股票。",
        "category": "投资心态",
        "book": "《巴菲特致股东的信》",
    },
    {
        "id": 2,
        "investor": "沃伦·巴菲特",
        "investor_en": "Warren Buffett",
        "principle": "护城河理论",
        "quote": "我们要找的是那种有宽阔护城河围绕的城堡。",
        "explanation": "优质公司拥有持久的竞争优势（品牌、规模效应、网络效应、专利等），竞争对手难以复制。护城河越宽，长期盈利能力越有保障。",
        "category": "选股策略",
        "book": "《巴菲特致股东的信》",
    },
    {
        "id": 3,
        "investor": "沃伦·巴菲特",
        "investor_en": "Warren Buffett",
        "principle": "市场先生",
        "quote": "在别人恐惧时贪婪，在别人贪婪时恐惧。",
        "explanation": "本杰明·格雷厄姆的'市场先生'比喻：市场每天给你报价，有时高得离谱，有时低得可笑。聪明的投资者利用市场先生的情绪，而不是被它左右。",
        "category": "市场心理",
        "book": "《聪明的投资者》",
    },
    {
        "id": 4,
        "investor": "查理·芒格",
        "investor_en": "Charlie Munger",
        "principle": "逆向思维",
        "quote": "反过来想，总是反过来想。",
        "explanation": "与其想'如何选到好股票'，不如先想'如何避免选到烂股票'。排除所有明显的错误后，剩下的选择就清晰多了。",
        "category": "思维模型",
        "book": "《穷查理宝典》",
    },
    {
        "id": 5,
        "investor": "查理·芒格",
        "investor_en": "Charlie Munger",
        "principle": "耐心等待",
        "quote": "赚大钱的诀窍不在于买和卖，而在于等待。",
        "explanation": "伟大投资机会不是每天都有。大部分时间你应该什么都不做，只在最确定的机会出现时才扣动扳机。",
        "category": "投资心态",
        "book": "《穷查理宝典》",
    },
    {
        "id": 6,
        "investor": "彼得·林奇",
        "investor_en": "Peter Lynch",
        "principle": "投资你懂的",
        "quote": "投资你了解的。最好的股票往往就在你身边。",
        "explanation": "你每天使用的产品和服务，可能就是最好的投资标的。作为消费者，你比华尔街分析师更早发现好公司。",
        "category": "选股策略",
        "book": "《彼得·林奇的成功投资》",
    },
    {
        "id": 7,
        "investor": "彼得·林奇",
        "investor_en": "Peter Lynch",
        "principle": "PEG估值法",
        "quote": "市盈率应该与增长率相匹配。PEG = PE / 增长率，小于1才值得关注。",
        "explanation": "光看PE不够，要结合增长率。一个PE为30但年增长40%的公司，比PE为10但零增长的公司更便宜。",
        "category": "估值方法",
        "book": "《彼得·林奇的成功投资》",
    },
    {
        "id": 8,
        "investor": "本杰明·格雷厄姆",
        "investor_en": "Benjamin Graham",
        "principle": "安全边际",
        "quote": "安全边际是投资的基石。",
        "explanation": "即使公司非常优质，也要以低于内在价值的价格买入。你付出的价格越低，犯错的空间就越大，长期收益就越好。永远留足安全边际。",
        "category": "估值方法",
        "book": "《聪明的投资者》",
    },
    {
        "id": 9,
        "investor": "雷·达里奥",
        "investor_en": "Ray Dalio",
        "principle": "分散投资",
        "quote": "不要把所有鸡蛋放在一个篮子里——但也不要把它们放在太多篮子里。",
        "explanation": "找到15-20个不相关的优质资产，分散风险但不分散收益。过度集中是赌博，过度分散是平庸。找到那个甜蜜点。",
        "category": "资产配置",
        "book": "《原则》",
    },
    {
        "id": 10,
        "investor": "雷·达里奥",
        "investor_en": "Ray Dalio",
        "principle": "全天候策略",
        "quote": "不同经济环境需要不同资产。优秀投资者为四季做准备。",
        "explanation": "经济周期分四个阶段：增长上升/下降，通胀上升/下降。真正的优质组合在任何环境下都能表现稳定——股票、债券、黄金、商品各司其职。",
        "category": "资产配置",
        "book": "《原则》",
    },
    {
        "id": 11,
        "investor": "菲利普·费雪",
        "investor_en": "Philip Fisher",
        "principle": "成长股投资",
        "quote": "买那些利润和销售持续增长、具有卓越管理层的公司。",
        "explanation": "好公司的标准：持续的收入增长、高研发投入、优秀的管理团队、行业领先地位。这些公司可能不便宜，但长期回报惊人。",
        "category": "选股策略",
        "book": "《怎样选择成长股》",
    },
    {
        "id": 12,
        "investor": "约翰·博格",
        "investor_en": "John Bogle",
        "principle": "指数投资",
        "quote": "不要试图在干草堆里找针——买下整个干草堆。",
        "explanation": "对大多数人来说，长期定投标普500或沪深300指数基金，就是最简单有效的投资策略。低费率、分散化、自动跟随经济增长。",
        "category": "投资策略",
        "book": "《长赢投资》",
    },
    {
        "id": 13,
        "investor": "霍华德·马克斯",
        "investor_en": "Howard Marks",
        "principle": "第二层思维",
        "quote": "第一层思维：'这是一家好公司，我们买吧。'第二层思维：'这是一家好公司，但大家都这么认为，所以太贵了。'",
        "explanation": "普通投资者看到表面，优秀投资者看到更深一层。永远问自己：'市场已经反映了什么？还有什么被忽略了？'",
        "category": "思维模型",
        "book": "《投资最重要的事》",
    },
    {
        "id": 14,
        "investor": "霍华德·马克斯",
        "investor_en": "Howard Marks",
        "principle": "周期意识",
        "quote": "了解我们在周期中的位置，比预测未来更重要。",
        "explanation": "市场永远在乐观与悲观间摆动。你无法预测拐点，但可以识别极端——当所有人都在喊'这次不一样'时，通常是最危险的时刻。",
        "category": "市场心理",
        "book": "《周期》",
    },
    {
        "id": 15,
        "investor": "段永平",
        "investor_en": "Duan Yongping",
        "principle": "买股票就是买公司",
        "quote": "买股票就是买公司，就是买未来现金流的折现。",
        "explanation": "不要盯着股价看，要盯着公司看。如果你不愿意持有它十年，那就不要持有它十分钟。真正的好公司，买了就拿着。",
        "category": "投资心态",
        "book": "段永平投资访谈",
    },
]


def get_daily_wisdom() -> dict:
    """Get a daily wisdom card based on today's date for consistency."""
    today = date.today()
    idx = (today.year * 365 + today.timetuple().tm_yday) % len(PRINCIPLES)
    return PRINCIPLES[idx]


def get_random_wisdom() -> dict:
    """Get a random wisdom card."""
    return random.choice(PRINCIPLES)


def get_all_principles() -> list:
    """Get all principles."""
    return PRINCIPLES


def get_principles_by_category(category: str) -> list:
    """Get principles filtered by category."""
    return [p for p in PRINCIPLES if p["category"] == category]


def get_principles_by_investor(investor: str) -> list:
    """Get principles filtered by investor."""
    return [p for p in PRINCIPLES if investor in p["investor"]]


def get_categories() -> list:
    """Get all unique categories."""
    return list(set(p["category"] for p in PRINCIPLES))


def get_investors() -> list:
    """Get all unique investors."""
    return list(set(p["investor"] for p in PRINCIPLES))
