"""Investment wisdom API routes."""
from fastapi import APIRouter, Query
from app.services import wisdom as wisdom_service

router = APIRouter()


@router.get("/daily")
async def get_daily_wisdom():
    """获取每日投资智慧卡片"""
    return wisdom_service.get_daily_wisdom()


@router.get("/random")
async def get_random_wisdom():
    """随机获取一条投资智慧"""
    return wisdom_service.get_random_wisdom()


@router.get("/principles")
async def get_principles(
    category: str = Query(None, description="按分类筛选"),
    investor: str = Query(None, description="按投资大师筛选"),
):
    """获取投资原则列表"""
    if investor:
        return wisdom_service.get_principles_by_investor(investor)
    if category:
        return wisdom_service.get_principles_by_category(category)
    return wisdom_service.get_all_principles()


@router.get("/categories")
async def get_categories():
    """获取所有分类"""
    return wisdom_service.get_categories()


@router.get("/investors")
async def get_investors():
    """获取所有投资大师"""
    return wisdom_service.get_investors()
