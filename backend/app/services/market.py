"""Market data service — fetches A股 and US stock data."""
import asyncio
from typing import Optional


# Major indices mapping
INDICES = {
    "cn": {
        "上证指数": "000001",
        "深证成指": "399001",
        "沪深300": "000300",
        "创业板指": "399006",
    },
    "us": {
        "标普500": "^GSPC",
        "纳斯达克": "^IXIC",
        "道琼斯": "^DJI",
    },
    "hk": {
        "恒生指数": "^HSI",
    },
}

# Quality stock candidates — A股沪深300精选
A_STOCK_UNIVERSE = [
    ("600519", "贵州茅台"), ("000858", "五粮液"), ("000568", "泸州老窖"),
    ("600036", "招商银行"), ("601318", "中国平安"), ("000333", "美的集团"),
    ("000651", "格力电器"), ("600276", "恒瑞医药"), ("300750", "宁德时代"),
    ("002415", "海康威视"), ("600900", "长江电力"), ("601899", "紫金矿业"),
    ("600809", "山西汾酒"), ("002714", "牧原股份"), ("300760", "迈瑞医疗"),
    ("601888", "中国中免"), ("600887", "伊利股份"), ("000001", "平安银行"),
    ("002594", "比亚迪"), ("601166", "兴业银行"),
]


async def get_index_data(market: str = "cn") -> dict:
    """Fetch major indices data."""
    indices = INDICES.get(market, {})
    results = {}
    
    for name, code in indices.items():
        try:
            if market == "cn":
                # Use akshare for A股 indices
                import akshare as ak
                df = ak.stock_zh_index_daily(symbol=f"sh{code}" if code.startswith("0") or code.startswith("6") else f"sz{code}")
                if not df.empty:
                    latest = df.iloc[-1]
                    prev = df.iloc[-2] if len(df) > 1 else latest
                    change_pct = ((latest["close"] - prev["close"]) / prev["close"] * 100)
                    results[name] = {
                        "value": round(float(latest["close"]), 2),
                        "change_pct": round(float(change_pct), 2),
                        "volume": int(latest["volume"]) if "volume" in latest else 0,
                    }
            else:
                import yfinance as yf
                ticker = yf.Ticker(code)
                hist = ticker.history(period="5d")
                if not hist.empty:
                    latest = hist.iloc[-1]
                    prev = hist.iloc[-2] if len(hist) > 1 else latest
                    change_pct = ((latest["Close"] - prev["Close"]) / prev["Close"] * 100)
                    results[name] = {
                        "value": round(float(latest["Close"]), 2),
                        "change_pct": round(float(change_pct), 2),
                        "volume": int(latest["Volume"]),
                    }
        except Exception as e:
            results[name] = {"error": str(e)}
    
    return results


async def get_stock_data(symbol: str, market: str = "cn") -> dict:
    """Fetch individual stock data."""
    try:
        if market == "cn":
            import akshare as ak
            df = ak.stock_zh_a_hist(symbol=symbol, period="monthly", adjust="qfq")
            if df.empty:
                return {"error": f"No data for {symbol}"}
            
            latest = df.iloc[-1]
            return {
                "symbol": symbol,
                "price": round(float(latest["收盘"]), 2),
                "open": round(float(latest["开盘"]), 2),
                "high": round(float(latest["最高"]), 2),
                "low": round(float(latest["最低"]), 2),
                "volume": int(latest["成交量"]),
                "change_pct": round(float(latest.get("涨跌幅", 0)), 2),
            }
        else:
            import yfinance as yf
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            return {
                "symbol": symbol,
                "name": info.get("longName", symbol),
                "price": round(float(info.get("currentPrice", 0)), 2),
                "market_cap": info.get("marketCap"),
                "pe_ratio": round(float(info.get("trailingPE", 0)), 2) if info.get("trailingPE") else None,
                "sector": info.get("sector", ""),
                "industry": info.get("industry", ""),
            }
    except Exception as e:
        return {"error": str(e)}


async def get_sector_performance() -> list:
    """Get sector performance data."""
    try:
        import akshare as ak
        df = ak.stock_board_concept_name_em()
        if not df.empty:
            top = df.nlargest(10, "涨跌幅")
            return [
                {"name": row["板块名称"], "change_pct": round(float(row["涨跌幅"]), 2)}
                for _, row in top.iterrows()
            ]
    except Exception:
        pass
    return []
