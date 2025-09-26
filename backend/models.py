from sqlalchemy import Column, Integer, String, Float, DateTime
from backend.database import Base

class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    codigo_producto = Column(String, index=True)
    nombre_producto = Column(String)
    cliente = Column(String)
    cantidad = Column(Integer)
    precio_unitario = Column(Float)
    subtotal = Column(Float)
    fecha = Column(DateTime)
