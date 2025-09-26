from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.database import get_connection
import psycopg2.extras
import bcrypt

router = APIRouter()

class RegistroRequest(BaseModel):
    username: str
    password: str
    es_admin: bool = False

@router.post("/registro")
def registrar_usuario(request: RegistroRequest):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    # Verificar si el usuario ya existe
    cur.execute("SELECT * FROM usuarios WHERE username = %s", (request.username,))
    existing_user = cur.fetchone()
    if existing_user:
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    # Hashear la contraseña
    hashed_password = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt())

    try:
        cur.execute(
            "INSERT INTO usuarios (username, password, es_admin) VALUES (%s, %s, %s)",
            (request.username, hashed_password.decode('utf-8'), request.es_admin)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print("ERROR AL REGISTRAR USUARIO:", e)
        raise HTTPException(status_code=500, detail=f"Error al registrar usuario: {str(e)}")

    cur.close()
    conn.close()
    return {"mensaje": "Usuario registrado correctamente"}


@router.get("/")
def listar_usuarios():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT username, es_admin FROM usuarios")
    usuarios = cur.fetchall()
    cur.close()
    conn.close()
    # Convertir booleano es_admin a texto rol
    return [{"username": u["username"], "rol": "admin" if u["es_admin"] else "vendedor"} for u in usuarios]
