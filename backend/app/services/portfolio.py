"""Portfolio simulator — virtual trading and tracking."""
from datetime import datetime, date
from typing import Optional
from app.data.database import get_db


INITIAL_CAPITAL = 1_000_000  # 100万虚拟资金


async def get_portfolio_summary() -> dict:
    """Get current portfolio state."""
    db = await get_db()
    try:
        cursor = await db.execute("""
            SELECT symbol, name, market, shares, buy_price, buy_date, notes
            FROM portfolio
        """)
        holdings = await cursor.fetchall()
        
        total_invested = 0
        positions = []
        for h in holdings:
            invested = h["shares"] * h["buy_price"]
            total_invested += invested
            positions.append({
                "symbol": h["symbol"],
                "name": h["name"],
                "market": h["market"],
                "shares": h["shares"],
                "buy_price": h["buy_price"],
                "invested": round(invested, 2),
                "buy_date": h["buy_date"],
                "notes": h["notes"],
            })
        
        cash = INITIAL_CAPITAL - total_invested
        
        return {
            "initial_capital": INITIAL_CAPITAL,
            "total_invested": round(total_invested, 2),
            "cash": round(cash, 2),
            "positions": positions,
            "position_count": len(positions),
        }
    finally:
        await db.close()


async def buy_stock(
    symbol: str, name: str, market: str, shares: float, price: float, notes: str = ""
) -> dict:
    """Execute a simulated buy order."""
    db = await get_db()
    try:
        # Check cash
        summary = await get_portfolio_summary()
        cost = shares * price
        if cost > summary["cash"]:
            return {"error": "资金不足", "available": summary["cash"], "needed": cost}
        
        today = date.today().isoformat()
        
        # Check existing position
        cursor = await db.execute(
            "SELECT id, shares, buy_price FROM portfolio WHERE symbol = ?",
            (symbol,)
        )
        existing = await cursor.fetchone()
        
        if existing:
            # Average down/up
            new_shares = existing["shares"] + shares
            new_cost = existing["shares"] * existing["buy_price"] + shares * price
            new_avg_price = new_cost / new_shares
            await db.execute(
                "UPDATE portfolio SET shares = ?, buy_price = ? WHERE id = ?",
                (new_shares, new_avg_price, existing["id"])
            )
        else:
            await db.execute(
                "INSERT INTO portfolio (symbol, name, market, shares, buy_price, buy_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (symbol, name, market, shares, price, today, notes)
            )
        
        # Record trade
        await db.execute(
            "INSERT INTO trades (symbol, type, shares, price, trade_date, reason) VALUES (?, 'buy', ?, ?, ?, ?)",
            (symbol, shares, price, today, notes)
        )
        
        await db.commit()
        return await get_portfolio_summary()
    finally:
        await db.close()


async def sell_stock(symbol: str, shares: float, price: float, notes: str = "") -> dict:
    """Execute a simulated sell order."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, shares FROM portfolio WHERE symbol = ?", (symbol,)
        )
        existing = await cursor.fetchone()
        
        if not existing:
            return {"error": f"未持有 {symbol}"}
        if shares > existing["shares"]:
            return {"error": f"卖出数量超过持仓 ({existing['shares']})"}
        
        today = date.today().isoformat()
        
        if shares == existing["shares"]:
            await db.execute("DELETE FROM portfolio WHERE id = ?", (existing["id"],))
        else:
            await db.execute(
                "UPDATE portfolio SET shares = shares - ? WHERE id = ?",
                (shares, existing["id"])
            )
        
        await db.execute(
            "INSERT INTO trades (symbol, type, shares, price, trade_date, reason) VALUES (?, 'sell', ?, ?, ?, ?)",
            (symbol, shares, price, today, notes)
        )
        
        await db.commit()
        return await get_portfolio_summary()
    finally:
        await db.close()


async def get_trade_history(limit: int = 50) -> list:
    """Get trade history."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM trades ORDER BY trade_date DESC, id DESC LIMIT ?",
            (limit,)
        )
        trades = await cursor.fetchall()
        return [dict(t) for t in trades]
    finally:
        await db.close()


async def get_watchlist() -> list:
    """Get watchlist."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM watchlist ORDER BY added_date DESC")
        items = await cursor.fetchall()
        return [dict(i) for i in items]
    finally:
        await db.close()


async def add_to_watchlist(symbol: str, name: str, market: str, notes: str = "") -> dict:
    """Add a stock to watchlist."""
    db = await get_db()
    try:
        today = date.today().isoformat()
        await db.execute(
            "INSERT OR IGNORE INTO watchlist (symbol, name, market, added_date, notes) VALUES (?, ?, ?, ?, ?)",
            (symbol, name, market, today, notes)
        )
        await db.commit()
        return {"status": "ok", "symbol": symbol}
    finally:
        await db.close()


async def get_valuation() -> dict:
    """Get portfolio valuation with current prices."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT symbol, name, market, shares, buy_price, buy_date FROM portfolio"
        )
        holdings = await cursor.fetchall()
        
        if not holdings:
            return {
                "total_cost": 0,
                "total_value": 0,
                "total_pnl": 0,
                "total_pnl_pct": 0,
                "positions": [],
            }
        
        positions = []
        total_cost = 0
        total_value = 0
        
        for h in holdings:
            cost = h["shares"] * h["buy_price"]
            total_cost += cost
            
            # Get current price
            current_price = await _get_current_price(h["symbol"], h["market"])
            value = h["shares"] * current_price
            total_value += value
            pnl = value - cost
            pnl_pct = (pnl / cost * 100) if cost > 0 else 0
            
            positions.append({
                "symbol": h["symbol"],
                "name": h["name"],
                "shares": h["shares"],
                "buy_price": h["buy_price"],
                "current_price": current_price,
                "cost": round(cost, 2),
                "value": round(value, 2),
                "pnl": round(pnl, 2),
                "pnl_pct": round(pnl_pct, 2),
                "buy_date": h["buy_date"],
            })
        
        total_pnl = total_value - total_cost
        total_pnl_pct = (total_pnl / total_cost * 100) if total_cost > 0 else 0
        
        return {
            "total_cost": round(total_cost, 2),
            "total_value": round(total_value, 2),
            "total_pnl": round(total_pnl, 2),
            "total_pnl_pct": round(total_pnl_pct, 2),
            "positions": positions,
        }
    finally:
        await db.close()


async def _get_current_price(symbol: str, market: str) -> float:
    """Get current price for a symbol."""
    try:
        if market == "cn":
            import akshare as ak
            df = ak.stock_zh_a_hist(symbol=symbol, period="daily", adjust="qfq")
            if not df.empty:
                return round(float(df.iloc[-1]["收盘"]), 2)
        else:
            import yfinance as yf
            ticker = yf.Ticker(symbol)
            info = ticker.info
            price = info.get("currentPrice") or info.get("regularMarketPrice")
            if price:
                return round(float(price), 2)
            # Fallback to last close
            hist = ticker.history(period="1d")
            if not hist.empty:
                return round(float(hist.iloc[-1]["Close"]), 2)
    except Exception:
        pass
    return 0.0
