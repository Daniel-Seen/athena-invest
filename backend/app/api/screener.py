"""Stock screener API routes."""
from fastapi import APIRouter, Query
from app.services import scorer

router = APIRouter()


@router.get("/quality")
async def screen_quality(
    market: str = Query("us", description="市场"),
    limit: int = Query(10, ge=1, le=50, description="返回数量"),
):
    """筛选优质资产（基于质量评分）"""
    # US stocks to screen (representative quality companies)
    us_tickers = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "META", "BRK-B", "JNJ", "JPM",
        "V", "PG", "UNH", "HD", "MA", "NVDA", "DIS", "ADBE", "CRM",
        "NFLX", "INTC", "PEP", "KO", "COST", "WMT", "TMO", "ABT",
        "MRK", "LLY", "AVGO", "ORCL", "CSCO", "ACN", "TXN", "QCOM",
        "AMD", "INTU", "AMGN", "NOW", "UBER", "SPGI", "BLK", "GS",
    ]
    
    results = []
    for ticker in us_tickers[:limit]:
        result = await scorer.evaluate_us_stock(ticker)
        results.append(result)
    
    # Sort by quality score descending
    results.sort(key=lambda x: x.get("quality_score", 0), reverse=True)
    
    return results


@router.get("/stock/{symbol}")
async def evaluate_stock(symbol: str):
    """评估单只股票质量"""
    return await scorer.evaluate_us_stock(symbol)
