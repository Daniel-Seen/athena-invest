"""Athena Invest Backend — FastAPI Application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import market, screener, wisdom, portfolio
from app.data.database import init_db

app = FastAPI(
    title="Athena Invest API",
    description="个人投资智能仪表盘后端服务",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://daniel-seen.github.io",
    ],
    allow_origin_regex="https://.*\.trycloudflare\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market.router, prefix="/api/market", tags=["市场数据"])
app.include_router(screener.router, prefix="/api/screener", tags=["资产筛选"])
app.include_router(wisdom.router, prefix="/api/wisdom", tags=["投资智慧"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["模拟组合"])


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Athena Invest API"}
