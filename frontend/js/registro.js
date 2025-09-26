document.addEventListener('DOMContentLoaded', () => {
  obtenerUsuarios();

  const form = document.getElementById('formRegistro');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value.trim();
      const contrasena = document.getElementById('contrasena').value.trim();
      const rol = document.getElementById('rol').value;

      try {
        const res = await fetch('http://localhost:8000/usuarios/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: nombre,
            password: contrasena,
            es_admin: rol === 'admin'
          })
        });

        if (res.ok) {
          alert('✅ Usuario registrado correctamente');
          form.reset();
          obtenerUsuarios();
        } else {
          const data = await res.json();
          alert('❌ Error al registrar usuario: ' + (data.detail || ''));
        }
      } catch (error) {
        console.error('Error en el registro:', error);
        alert('❌ Error en el registro (ver consola)');
      }
    });
  }
});

async function obtenerUsuarios() {
  try {
    const res = await fetch('http://localhost:8000/usuarios/');
    const usuarios = await res.json();
    const tabla = document.getElementById('tablaUsuarios');

    if (tabla) {
      tabla.innerHTML = '';
      usuarios.forEach((u, i) => {
        tabla.innerHTML += `
          <tr class="border-b">
            <td class="py-2 px-4">${i + 1}</td>
            <td class="py-2 px-4">${u.username}</td>
            <td class="py-2 px-4">${u.rol === 'admin' ? 'Administrador' : 'Vendedor'}</td>
          </tr>`;
      });
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
  }
}
