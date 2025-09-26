async function iniciarSesion() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const mensaje = document.getElementById('mensaje');

  // Limpiar mensaje anterior
  mensaje.textContent = '';
  mensaje.className = '';

  if (!username || !password) {
    mensaje.textContent = 'Por favor, ingresa usuario y contraseña.';
    mensaje.className = 'text-red-500 mt-4 text-center';
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    console.log('Respuesta del backend:', data);

    if (response.ok) {
      // Guardar objeto completo como JSON en localStorage
      localStorage.setItem('usuario', JSON.stringify(data));

      mensaje.textContent = 'Inicio de sesión exitoso. Redirigiendo...';
      mensaje.className = 'text-green-600 mt-4 text-center';

      setTimeout(() => {
        if (data.es_admin === true) {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'vendedor.html';
        }
      }, 1500);
    } else {
      const errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail) || 'Credenciales incorrectas.';
      mensaje.textContent = errorMsg;
      mensaje.className = 'text-red-500 mt-4 text-center';
    }

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    mensaje.textContent = 'Error de conexión con el servidor.';
    mensaje.className = 'text-red-500 mt-4 text-center';
  }
}

