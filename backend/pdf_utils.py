from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO

def generar_factura_pdf(venta_id, cliente, productos, total):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.setTitle(f"Factura_{venta_id}")

    # Encabezado
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, 750, "FARMACIA FARMACORP")
    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, 730, f"Factura Nº: {venta_id}")
    pdf.drawString(50, 710, f"Cliente: {cliente}")

    # Tabla de productos
    pdf.drawString(50, 680, "Productos:")
    y = 660
    pdf.drawString(50, y, "Código")
    pdf.drawString(150, y, "Nombre")
    pdf.drawString(300, y, "Cant.")
    pdf.drawString(350, y, "P.Unit.")
    pdf.drawString(420, y, "Subtotal")
    y -= 20

    for prod in productos:
        pdf.drawString(50, y, prod['codigo'])
        pdf.drawString(150, y, prod['nombre'])
        pdf.drawString(300, y, str(prod['cantidad']))
        pdf.drawString(350, y, f"{prod['precio_unitario']:.2f}")
        pdf.drawString(420, y, f"{prod['subtotal']:.2f}")
        y -= 20

    # Total
    pdf.drawString(50, y - 20, f"TOTAL: Bs. {total:.2f}")

    pdf.save()
    buffer.seek(0)
    return buffer
