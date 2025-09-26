document.addEventListener('DOMContentLoaded', () => {
  obtenerProductos();

  const form = document.getElementById('formProducto');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombreProducto').value;
      const descripcion = document.getElementById('descripcion').value;
      const stock = parseInt(document.getElementById('stock').value);
      const precio = parseFloat(document.getElementById('precio').value);
      const fecha_vencimiento = document.getElementById('fecha').value;

      try {
        const res = await fetch('http://localhost:8000/productos/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, descripcion, stock, precio, fecha_vencimiento })
        });

        if (res.ok) {
          alert('Producto registrado');
          form.reset();
          obtenerProductos();
        } else {
          alert('Error al registrar producto');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  }
});

async function obtenerProductos() {
  try {
    const res = await fetch('http://localhost:8000/productos/');
    const productos = await res.json();
    const tabla = document.getElementById('tablaProductos');
    if (tabla) {
      tabla.innerHTML = '';
      productos.forEach((p, i) => {
        tabla.innerHTML += `
          <tr class="border-b">
            <td class="py-2 px-4">${i + 1}</td>
            <td class="py-2 px-4">${p.nombre}</td>
            <td class="py-2 px-4">${p.descripcion}</td>
            <td class="py-2 px-4">${p.stock}</td>
            <td class="py-2 px-4">${p.precio}</td>
            <td class="py-2 px-4">${p.fecha_vencimiento}</td>
          </tr>`;
      });
    }
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
}
async function verificarStockBajo() {
  const res = await fetch("http://localhost:8000/alertas/stock_bajo");
  const data = await res.json();

  if (data.productos_bajo_stock.length > 0) {
    alert("¡Alerta! Hay productos con stock bajo.");
    console.log(data.productos_bajo_stock); // puedes mostrar en tabla también
  }
}

document.addEventListener("DOMContentLoaded", verificarStockBajo);
