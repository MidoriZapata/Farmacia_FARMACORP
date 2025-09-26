import psycopg2
import bcrypt

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "BD_FARMACIA"
DB_USER = "usuarios"
DB_PASSWORD = "Midori59194"

def migrar_contrasenas_planas_a_bcrypt():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT,
        database=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )
    cur = conn.cursor()

    # Traer todos los usuarios y sus contraseñas
    cur.execute("SELECT id, password FROM usuarios")
    usuarios = cur.fetchall()

    for usuario_id, contrasena in usuarios:
        try:
            # Intentar detectar si ya está en bcrypt (empieza con $2b$ o $2a$)
            if not contrasena.startswith("$2b$") and not contrasena.startswith("$2a$"):
                print(f"Actualizando usuario ID {usuario_id}")

                # Hashear la contraseña antigua
                contrasena_hashed = bcrypt.hashpw(contrasena.encode(), bcrypt.gensalt()).decode()

                # Actualizar en la base
                cur.execute(
                    "UPDATE usuarios SET password = %s WHERE id = %s",
                    (contrasena_hashed, usuario_id)
                )
                conn.commit()
        except Exception as e:
            print(f"Error con usuario ID {usuario_id}: {e}")
            conn.rollback()

    cur.close()
    conn.close()
    print("Migración finalizada.")

if __name__ == "__main__":
    migrar_contrasenas_planas_a_bcrypt()
