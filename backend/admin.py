from backend.auth import registrar_usuario
from backend.database import get_connection

def agregar_preferencias(usuario_id, tema, idioma, notificaciones=True):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO preferencias (usuario_id, tema, idioma, notificaciones)
            VALUES (%s, %s, %s, %s)
        """, (usuario_id, tema, idioma, notificaciones))
        conn.commit()
        print("✅ Preferencias guardadas.")
    except Exception as e:
        print(f"❌ Error al guardar preferencias: {e}")
    finally:
        cur.close()
        conn.close()
