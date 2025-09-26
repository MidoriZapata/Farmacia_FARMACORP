from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.auth import router as auth_router  # Importa el router de auth.py
from backend.routers import usuarios, ventas, reportes


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia por tu dominio si quieres restringir acceso
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)  # Aquí incluyes las rutas del auth_router
app.include_router(usuarios.router, prefix="/usuarios")
app.include_router(ventas.router, prefix="/ventas")
app.include_router(reportes.router, prefix="/reportes")


@app.get("/")
def root():
    return {"mensaje": "Servidor de la Farmacia funcionando ✅"}
