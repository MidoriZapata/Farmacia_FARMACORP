from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.database import get_connection
import bcrypt

router = APIRouter()

# Modelo de datos para login
class LoginRequest(BaseModel):
    username: str
    password: str

# Modelo de datos para registro de usuarios
class RegisterUser(BaseModel):
    username: str
    password: str
    es_admin: bool = False

# Ruta de inicio de sesión
@router.post("/login")
def login(data: LoginRequest):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT id, username, password, es_admin FROM usuarios WHERE username = %s", (data.username,))
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

        user_id, username, hashed_password, es_admin = user

        if bcrypt.checkpw(data.password.encode(), hashed_password.encode()):
            # Normalizar es_admin
            if isinstance(es_admin, str):
                es_admin = es_admin.lower() in ("true", "1", "t", "yes")
            elif isinstance(es_admin, int):
                es_admin = es_admin == 1
            else:
                es_admin = bool(es_admin)

            usuario_data = {
                "id": user_id,
                "username": username,
                "es_admin": es_admin
            }

            return {"mensaje": "Login correcto", "es_admin": es_admin, "username": data.username}

        else:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno en login: {str(e)}")

# Ruta para registrar un nuevo usuario
@router.post("/usuarios/registro")
def registrar_usuario(data: RegisterUser):
    print("📥 Recibida solicitud para registrar usuario:", data.username)
    conn = get_connection()
    cur = conn.cursor()

    # Verificar si el usuario ya existe
    cur.execute("SELECT id FROM usuarios WHERE username = %s", (data.username,))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")

    # Hashear la contraseña
    hashed_password = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()

    try:
        cur.execute(
            "INSERT INTO usuarios (username, password, es_admin) VALUES (%s, %s, %s)",
            (data.username, hashed_password, data.es_admin)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al registrar el usuario: {e}")
    finally:
        cur.close()
        conn.close()

    return {"mensaje": "Usuario registrado correctamente"}
