from fastapi import APIRouter
from fastapi.responses import FileResponse
from backend.database import get_connection
import psycopg2.extras
import openpyxl
from openpyxl.styles import Font
import os

router = APIRouter()

@router.get("/reporte/ventas/excel")
def generar_reporte_excel():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    cur.execute("SELECT * FROM ventas")
    ventas = cur.fetchall()
    conn.close()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Reporte Ventas"

    encabezado = ["ID", "Cliente", "Total", "Fecha"]
    ws.append(encabezado)

    for celda in ws[1]:
        celda.font = Font(bold=True)

    for v in ventas:
        ws.append([v["id"], v["cliente"], v["total"], v["fecha"]])

    nombre_archivo = "reporte_ventas.xlsx"
    ruta = f"/mnt/data/{nombre_archivo}"
    wb.save(ruta)

    return FileResponse(path=ruta, filename=nombre_archivo, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
