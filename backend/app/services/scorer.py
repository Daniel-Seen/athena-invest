"""Quality scoring engine — evaluates companies on fundamental metrics."""
from typing import Optional


# Scoring weights for value investing quality assessment
QUALITY_WEIGHTS = {
    "roe": 20,          # ROE — 盈利能力
    "roic": 15,         # ROIC — 资本运用效率
    "gross_margin": 15,  # 毛利率 — 竞争地位
    "debt_ratio": 15,    # 负债率 — 财务安全(反向)
    "fcf_yield": 15,     # 自由现金流收益率
    "revenue_growth": 10, # 营收增长
    "dividend": 10,       # 股息率
}


def score_roe(roe: Optional[float]) -> float:
    """Score ROE: >20% = excellent, >15% = good, >10% = average."""
    if roe is None:
        return 0.5
    roe_pct = roe * 100
    if roe_pct >= 20:
        return 1.0
    elif roe_pct >= 15:
        return 0.8
    elif roe_pct >= 10:
        return 0.6
    elif roe_pct >= 5:
        return 0.3
    else:
        return 0.1


def score_gross_margin(margin: Optional[float]) -> float:
    """Score gross margin: >60% = wide moat, >40% = good."""
    if margin is None:
        return 0.5
    if margin >= 0.60:
        return 1.0
    elif margin >= 0.40:
        return 0.8
    elif margin >= 0.30:
        return 0.6
    elif margin >= 0.20:
        return 0.4
    else:
        return 0.1


def score_debt(debt_to_equity: Optional[float]) -> float:
    """Score debt ratio: lower is better."""
    if debt_to_equity is None:
        return 0.5
    if debt_to_equity <= 30:
        return 1.0
    elif debt_to_equity <= 50:
        return 0.7
    elif debt_to_equity <= 80:
        return 0.5
    elif debt_to_equity <= 120:
        return 0.3
    else:
        return 0.1


def score_pe(pe: Optional[float]) -> float:
    """Score P/E ratio: premium for reasonable valuation."""
    if pe is None or pe <= 0:
        return 0.3
    if 10 <= pe <= 20:
        return 1.0
    elif 5 <= pe <= 25:
        return 0.7
    elif pe < 5:
        return 0.5
    else:
        return 0.3


async def evaluate_us_stock(symbol: str) -> dict:
    """Evaluate a US stock on quality metrics."""
    try:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        roe = info.get("returnOnEquity")
        roic = info.get("returnOnCapital")
        gross_margin = info.get("grossMargins")
        debt_to_equity = info.get("debtToEquity")
        fcf_yield = info.get("freeCashflow")
        pe = info.get("trailingPE")
        dividend_yield = info.get("dividendYield")
        revenue_growth = info.get("revenueGrowth")
        
        market_cap = info.get("marketCap", 0) or 0
        if fcf_yield and market_cap:
            fcf_yield = fcf_yield / market_cap
        else:
            fcf_yield = None
        
        # Calculate scores
        roe_score = score_roe(roe)
        margin_score = score_gross_margin(gross_margin)
        debt_score = score_debt(debt_to_equity)
        pe_score = score_pe(pe)
        
        # Composite score (0-100)
        quality_score = (
            roe_score * QUALITY_WEIGHTS["roe"] +
            (0.7 if roic and roic > 0.10 else 0.3) * QUALITY_WEIGHTS["roic"] +
            margin_score * QUALITY_WEIGHTS["gross_margin"] +
            debt_score * QUALITY_WEIGHTS["debt_ratio"] +
            (0.7 if fcf_yield and fcf_yield > 0.03 else 0.3) * QUALITY_WEIGHTS["fcf_yield"] +
            (0.7 if revenue_growth and revenue_growth > 0.10 else 0.4) * QUALITY_WEIGHTS["revenue_growth"] +
            (0.7 if dividend_yield and dividend_yield > 0.02 else 0.3) * QUALITY_WEIGHTS["dividend"]
        )
        
        return {
            "symbol": symbol,
            "name": info.get("longName", symbol),
            "sector": info.get("sector", "未知"),
            "quality_score": round(quality_score, 1),
            "metrics": {
                "roe": round(float(roe * 100), 1) if roe else None,
                "roic": round(float(roic * 100), 1) if roic else None,
                "gross_margin": round(float(gross_margin * 100), 1) if gross_margin else None,
                "debt_to_equity": round(float(debt_to_equity), 1) if debt_to_equity else None,
                "pe_ratio": round(float(pe), 1) if pe else None,
                "dividend_yield": round(float(dividend_yield * 100), 2) if dividend_yield else None,
                "revenue_growth": round(float(revenue_growth * 100), 1) if revenue_growth else None,
            },
            "rating": _get_rating(quality_score),
            "analysis": _get_analysis(roe_score, margin_score, debt_score),
        }
    except Exception as e:
        return {"symbol": symbol, "error": str(e)}


async def evaluate_cn_stock(symbol: str, name: str = "") -> dict:
    """Evaluate an A股 stock on quality metrics using akshare financial data."""
    try:
        import akshare as ak
        
        # Get financial indicators
        try:
            df = ak.stock_financial_abstract_ths(symbol=symbol, indicator="按报告期")
        except Exception:
            df = None
        
        roe = None
        gross_margin = None
        debt_to_equity = None
        revenue_growth = None
        
        if df is not None and not df.empty:
            latest = df.iloc[0]
            # Try to extract common financial fields
            for col in df.columns:
                col_lower = str(col).lower()
                if '净资产收益率' in str(col) and roe is None:
                    try:
                        val = float(str(latest[col]).replace('%', ''))
                        roe = val / 100 if val > 1 else val
                    except: pass
                if '毛利率' in str(col) and gross_margin is None:
                    try:
                        val = float(str(latest[col]).replace('%', ''))
                        gross_margin = val / 100 if val > 1 else val
                    except: pass
                if '资产负债率' in str(col) and debt_to_equity is None:
                    try:
                        val = float(str(latest[col]).replace('%', ''))
                        debt_to_equity = val
                    except: pass
                if '营业收入同比增长' in str(col) and revenue_growth is None:
                    try:
                        val = float(str(latest[col]).replace('%', ''))
                        revenue_growth = val / 100 if val > 1 else val
                    except: pass
        
        # Calculate scores with available data
        roe_score = score_roe(roe) if roe is not None else 0.5
        margin_score = score_gross_margin(gross_margin) if gross_margin is not None else 0.5
        debt_score = score_debt(debt_to_equity) if debt_to_equity is not None else 0.5
        
        quality_score = (
            roe_score * QUALITY_WEIGHTS["roe"] +
            margin_score * QUALITY_WEIGHTS["gross_margin"] +
            debt_score * QUALITY_WEIGHTS["debt_ratio"] +
            0.5 * QUALITY_WEIGHTS["roic"] +
            0.5 * QUALITY_WEIGHTS["fcf_yield"] +
            (0.7 if revenue_growth and revenue_growth > 0.10 else 0.4) * QUALITY_WEIGHTS["revenue_growth"] +
            0.5 * QUALITY_WEIGHTS["dividend"]
        )
        
        display_name = name if name else symbol
        
        return {
            "symbol": symbol,
            "name": display_name,
            "sector": "A股",
            "quality_score": round(quality_score, 1),
            "metrics": {
                "roe": round(float(roe * 100), 1) if roe else None,
                "gross_margin": round(float(gross_margin * 100), 1) if gross_margin else None,
                "debt_to_equity": round(float(debt_to_equity), 1) if debt_to_equity else None,
                "pe_ratio": None,
                "dividend_yield": None,
                "revenue_growth": round(float(revenue_growth * 100), 1) if revenue_growth else None,
            },
            "rating": _get_rating(quality_score),
            "analysis": _get_analysis(roe_score, margin_score, debt_score),
        }
    except Exception as e:
        return {"symbol": symbol, "error": str(e)}


async def get_stock_history(symbol: str, market: str = "cn", period: str = "monthly") -> list:
    """Get historical price data for charting."""
    try:
        if market == "cn":
            import akshare as ak
            df = ak.stock_zh_a_hist(symbol=symbol, period=period, adjust="qfq")
            if df.empty:
                return []
            result = []
            for _, row in df.tail(60).iterrows():
                result.append({
                    "date": str(row["日期"])[:10],
                    "close": round(float(row["收盘"]), 2),
                    "volume": int(row["成交量"]),
                })
            return result
        else:
            import yfinance as yf
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="3mo")
            if hist.empty:
                return []
            result = []
            for idx, row in hist.iterrows():
                result.append({
                    "date": str(idx)[:10],
                    "close": round(float(row["Close"]), 2),
                    "volume": int(row["Volume"]),
                })
            return result
    except Exception as e:
        return []


def _get_rating(score: float) -> str:
    if score >= 80:
        return "🏆 卓越"
    elif score >= 65:
        return "⭐ 优秀"
    elif score >= 50:
        return "👍 良好"
    elif score >= 35:
        return "📊 一般"
    else:
        return "⚠️ 需关注"


def _get_analysis(roe_score: float, margin_score: float, debt_score: float) -> str:
    parts = []
    if roe_score >= 0.8:
        parts.append("盈利能力强劲")
    elif roe_score >= 0.5:
        parts.append("盈利能力稳定")
    else:
        parts.append("盈利能力偏弱")
    
    if margin_score >= 0.8:
        parts.append("具备宽阔护城河")
    elif margin_score >= 0.5:
        parts.append("有一定竞争优势")
    
    if debt_score >= 0.7:
        parts.append("财务结构健康")
    elif debt_score >= 0.5:
        parts.append("负债水平可控")
    else:
        parts.append("负债率偏高")
    
    return "；".join(parts)
