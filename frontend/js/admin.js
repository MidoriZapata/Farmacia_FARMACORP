// Mostrar nombre del usuario y foto (si hay)
document.addEventListener("DOMContentLoaded", () => {
  // Obtener usuario almacenado en sessionStorage o localStorage
  const usuario = sessionStorage.getItem("usuario") || localStorage.getItem("usuario") || "Admin";
  document.getElementById("nombreUsuario").textContent = usuario;

  // Mostrar sección usuarios por defecto y cargar la lista
  mostrarSeccion("usuarios");
  obtenerUsuarios();
});

// Cambiar entre secciones
function mostrarSeccion(id) {
  document.querySelectorAll("main section").forEach(seccion => {
    seccion.classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

// Cerrar sesión
function cerrarSesion() {
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "login.html";
}

// Obtener usuarios registrados desde backend
async function obtenerUsuarios() {
  try {
    const res = await fetch("http://localhost:8000/usuarios");
    if (!res.ok) throw new Error("Error al obtener usuarios");
    const usuarios = await res.json();

    const tabla = document.getElementById("tablaUsuarios");
    tabla.innerHTML = "";

    usuarios.forEach((u, index) => {
      const fila = `<tr>
        <td class="border px-4 py-2">${index + 1}</td>
        <td class="border px-4 py-2">${u.username}</td>
        <td class="border px-4 py-2">${u.es_admin ? "Administrador" : "Vendedor"}</td>
      </tr>`;
      tabla.innerHTML += fila;
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    alert("No se pudo cargar la lista de usuarios.");
  }
}

// Registrar nuevo usuario
async function registrarUsuario(e) {
  e.preventDefault();
  const username = document.getElementById("nuevoUsuario").value.trim();
  const password = document.getElementById("nuevoPassword").value.trim();
  const es_admin = document.getElementById("nuevoEsAdmin").checked;

  if (!username || !password) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/registro", { // <-- OJO aquí la ruta debe coincidir con tu backend
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, es_admin })
    });

    if (res.ok) {
      alert("Usuario registrado correctamente.");
      document.querySelector("form").reset();
      mostrarSeccion("usuarios");
      obtenerUsuarios();
    } else {
      const error = await res.json();
      alert("Error: " + (error.detail || "No se pudo registrar"));
    }
  } catch (error) {
    console.error("Error al registrar:", error);
    alert("Error en la comunicación con el servidor.");
  }
}

async function mostrarContenido(seccion) {
  document.querySelectorAll('main section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(seccion).classList.remove('hidden');

  if (seccion === 'usuarios') {
    const contenedor = document.getElementById('usuarios');
    contenedor.innerHTML = '<p class="text-white">Cargando usuarios...</p>';

    try {
      const response = await fetch('http://127.0.0.1:8000/usuarios');
      const usuarios = await response.json();

      if (Array.isArray(usuarios)) {
        let tabla = `
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Usuarios Registrados</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white shadow rounded-lg">
              <thead class="bg-yellow-400 text-blue-900 font-bold">
                <tr>
                  <th class="py-2 px-4 border">ID</th>
                  <th class="py-2 px-4 border">Usuario</th>
                  <th class="py-2 px-4 border">¿Es Admin?</th>
                </tr>
              </thead>
              <tbody>
        `;

        usuarios.forEach(u => {
          tabla += `
            <tr class="text-center border-b">
              <td class="py-2 px-4 border">${u.id}</td>
              <td class="py-2 px-4 border">${u.username}</td>
              <td class="py-2 px-4 border">${u.es_admin ? 'Sí' : 'No'}</td>
            </tr>
          `;
        });

        tabla += `</tbody></table></div>`;
        contenedor.innerHTML = tabla;
      } else {
        contenedor.innerHTML = '<p class="text-red-500">No se pudieron cargar los usuarios.</p>';
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      contenedor.innerHTML = '<p class="text-red-500">Error al conectar con el servidor.</p>';
    }
  }
}

function cerrarSesion() {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}
