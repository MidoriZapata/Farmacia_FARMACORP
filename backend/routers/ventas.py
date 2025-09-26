from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.database import get_connection

router = APIRouter()

class Venta(BaseModel):
    producto_id: int
    vendedor: str        # nombre de usuario vendedor
    cantidad: int
    total: float
    cliente: str

@router.post("/registrar")
def registrar_venta(venta: Venta):
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Buscar id del vendedor por username
        cur.execute("SELECT id FROM usuarios WHERE username = %s", (venta.vendedor,))
        vendedor_row = cur.fetchone()
        if not vendedor_row:
            raise HTTPException(status_code=404, detail="Vendedor no encontrado")
        vendedor_id = vendedor_row[0]

        # Obtener stock del producto
        cur.execute("SELECT stock FROM productos WHERE id = %s", (venta.producto_id,))
        resultado = cur.fetchone()
        if not resultado:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        stock_actual = resultado[0]
        if venta.cantidad > stock_actual:
            raise HTTPException(status_code=400, detail="Stock insuficiente")

        # Insertar la venta con el id obtenido
        cur.execute("""
            INSERT INTO ventas (producto_id, vendedor_id, cantidad, total, cliente)
            VALUES (%s, %s, %s, %s, %s)
        """, (venta.producto_id, vendedor_id, venta.cantidad, venta.total, venta.cliente))

        # Actualizar stock
        nuevo_stock = stock_actual - venta.cantidad
        cur.execute("UPDATE productos SET stock = %s WHERE id = %s", (nuevo_stock, venta.producto_id))

        conn.commit()
        cur.close()
        conn.close()

        return {"mensaje": "Venta registrada correctamente"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar venta: {e}")

@router.get("/mis_ventas/{vendedor_username}")
def obtener_ventas_usuario(vendedor_username: str):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT v.cliente, v.total, v.cantidad, p.nombre, p.id
            FROM ventas v
            JOIN usuarios u ON v.vendedor_id = u.id
            JOIN productos p ON v.producto_id = p.id
            WHERE u.username = %s
            ORDER BY v.id DESC
        """, (vendedor_username,))
        
        rows = cur.fetchall()
        cur.close()
        conn.close()

        ventas = []
        for row in rows:
            ventas.append({
                "cliente": row[0],
                "total": float(row[1]),
                "cantidad": row[2],
                "nombre_producto": row[3],  # Aquí cambió el nombre para que JS lo entienda
                "codigo": row[4],
                "nit": "N/A"  # Puedes agregar el campo real si tienes
            })
        return ventas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
