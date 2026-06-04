"""Market data API routes."""
from fastapi import APIRouter, Query
from app.services import market as market_service

router = APIRouter()


@router.get("/indices")
async def get_indices(market: str = Query("cn", description="市场: cn=中国, us=美国, hk=香港")):
    """获取主要指数数据"""
    return await market_service.get_index_data(market)


@router.get("/stock/{symbol}")
async def get_stock(symbol: str, market: str = Query("cn")):
    """获取个股数据"""
    return await market_service.get_stock_data(symbol, market)


@router.get("/sectors")
async def get_sectors():
    """获取板块表现"""
    return await market_service.get_sector_performance()


@router.get("/universe")
async def get_stock_universe():
    """获取A股精选股票池"""
    return [
        {"symbol": s[0], "name": s[1]}
        for s in market_service.A_STOCK_UNIVERSE
    ]
