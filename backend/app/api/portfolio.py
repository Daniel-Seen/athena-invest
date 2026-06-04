"""Portfolio simulator API routes."""
from fastapi import APIRouter
from pydantic import BaseModel
from app.services import portfolio as portfolio_service

router = APIRouter()


class TradeRequest(BaseModel):
    symbol: str
    name: str = ""
    market: str = "cn"
    shares: float
    price: float
    notes: str = ""


@router.get("/summary")
async def get_summary():
    """获取投资组合概览"""
    return await portfolio_service.get_portfolio_summary()


@router.post("/buy")
async def buy_stock(trade: TradeRequest):
    """模拟买入"""
    return await portfolio_service.buy_stock(
        trade.symbol, trade.name, trade.market, trade.shares, trade.price, trade.notes
    )


@router.post("/sell")
async def sell_stock(trade: TradeRequest):
    """模拟卖出"""
    return await portfolio_service.sell_stock(
        trade.symbol, trade.shares, trade.price, trade.notes
    )


@router.get("/trades")
async def get_trades(limit: int = 50):
    """获取交易历史"""
    return await portfolio_service.get_trade_history(limit)


@router.get("/watchlist")
async def get_watchlist():
    """获取自选列表"""
    return await portfolio_service.get_watchlist()


class WatchlistRequest(BaseModel):
    symbol: str
    name: str
    market: str = "cn"
    notes: str = ""


@router.post("/watchlist")
async def add_watchlist(item: WatchlistRequest):
    """添加到自选"""
    return await portfolio_service.add_to_watchlist(
        item.symbol, item.name, item.market, item.notes
    )
