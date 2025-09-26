import psycopg2

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "BD_FARMACIA"
DB_USER = "usuarios"
DB_PASSWORD = "Midori59194"

def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

