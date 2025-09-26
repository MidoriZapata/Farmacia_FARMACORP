from fastapi import APIRouter
from backend.database import get_connection
import psycopg2.extras

router = APIRouter()

@router.get("/alertas/stock_bajo")
def alerta_stock_bajo():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    cur.execute("SELECT * FROM productos WHERE stock < 10")
    productos = cur.fetchall()

    cur.close()
    conn.close()

    return {"productos_bajo_stock": [dict(p) for p in productos]}
