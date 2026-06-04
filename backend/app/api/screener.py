"""Stock screener API routes."""
from fastapi import APIRouter, Query
from app.services import scorer
from app.services.market import A_STOCK_UNIVERSE

router = APIRouter()

US_TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META", "BRK-B", "JNJ", "JPM",
    "V", "PG", "UNH", "HD", "MA", "NVDA", "DIS", "ADBE", "CRM",
    "NFLX", "INTC", "PEP", "KO", "COST", "WMT", "TMO", "ABT",
    "MRK", "LLY", "AVGO", "ORCL", "CSCO", "ACN", "TXN", "QCOM",
    "AMD", "INTU", "AMGN", "NOW", "UBER", "SPGI", "BLK", "GS",
]


@router.get("/quality")
async def screen_quality(
    market: str = Query("us", description="市场: us=美股, cn=A股"),
    limit: int = Query(10, ge=1, le=50, description="返回数量"),
):
    """筛选优质资产（基于质量评分）"""
    results = []

    if market == "cn":
        for symbol, name in A_STOCK_UNIVERSE[:limit]:
            result = await scorer.evaluate_cn_stock(symbol, name)
            results.append(result)
    else:
        for ticker in US_TICKERS[:limit]:
            result = await scorer.evaluate_us_stock(ticker)
            results.append(result)

    results.sort(key=lambda x: x.get("quality_score", 0), reverse=True)
    return results


@router.get("/stock/{symbol}")
async def evaluate_stock(
    symbol: str,
    market: str = Query("us", description="市场"),
):
    """评估单只股票质量"""
    if market == "cn":
        return await scorer.evaluate_cn_stock(symbol)
    return await scorer.evaluate_us_stock(symbol)


@router.get("/history/{symbol}")
async def stock_history(
    symbol: str,
    market: str = Query("cn", description="市场"),
    period: str = Query("monthly", description="数据周期: daily, weekly, monthly"),
):
    """获取股票历史价格数据（用于图表）"""
    return await scorer.get_stock_history(symbol, market, period)
