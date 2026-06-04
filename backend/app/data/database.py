"""Database initialization and management."""
import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "athena.db")


async def get_db():
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_db():
    """Initialize database tables."""
    db = await get_db()
    try:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS portfolio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                name TEXT NOT NULL,
                market TEXT NOT NULL,
                shares REAL NOT NULL,
                buy_price REAL NOT NULL,
                buy_date TEXT NOT NULL,
                notes TEXT DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('buy', 'sell')),
                shares REAL NOT NULL,
                price REAL NOT NULL,
                trade_date TEXT NOT NULL,
                reason TEXT DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS watchlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                name TEXT NOT NULL,
                market TEXT NOT NULL,
                added_date TEXT NOT NULL,
                notes TEXT DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS daily_learnings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                principle_id INTEGER NOT NULL,
                completed INTEGER DEFAULT 0
            );
        """)
        await db.commit()
    finally:
        await db.close()
