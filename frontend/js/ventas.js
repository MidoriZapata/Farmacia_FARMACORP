document.addEventListener('DOMContentLoaded', () => {
  const formVenta = document.getElementById('formVenta');
  const totalField = document.getElementById('total');
  const cantidadInput = document.getElementById('cantidad');
  const precioInput = document.getElementById('precio');
  const mensajeVenta = document.getElementById('mensajeVenta');

  function calcularTotal() {
    const cantidad = parseFloat(cantidadInput.value);
    const precio = parseFloat(precioInput.value);
    if (!isNaN(cantidad) && !isNaN(precio)) {
      totalField.value = (cantidad * precio).toFixed(2);
    }
  }

  cantidadInput.addEventListener('input', calcularTotal);
  precioInput.addEventListener('input', calcularTotal);

  // Función para cargar ventas y mostrar en la tabla
  async function cargarVentas() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) return;

    let vendedorObj;
    try {
      vendedorObj = JSON.parse(usuario);
    } catch {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/ventas/mis_ventas/${vendedorObj.username}`);
      if (!response.ok) throw new Error('No se pudo obtener las ventas');

      const ventas = await response.json();

      const ventaBody = document.getElementById('ventaBody');
      const totalVentaSpan = document.getElementById('totalVenta');
      ventaBody.innerHTML = ''; // limpiar tabla

      let sumaTotal = 0;

      ventas.forEach((venta, index) => {
        const fila = document.createElement('tr');
        fila.classList.add('border-b');

        fila.innerHTML = `
  <td>${index + 1}</td>
  <td>${venta.codigo || ''}</td>
  <td>${venta.nombre_producto || 'Sin nombre'}</td>  <!-- aquí cambio -->
  <td>${venta.cliente || 'Sin cliente'}</td>
  <td>${venta.nit || ''}</td>
  <td>${venta.cantidad || 0}</td>
  <td>${(venta.total || 0).toFixed(2)}</td>
`;

        ventaBody.appendChild(fila);
        sumaTotal += venta.total;
      });

      totalVentaSpan.textContent = sumaTotal.toFixed(2);
    } catch (error) {
      console.error('Error cargando ventas:', error);
    }
  }

  if (formVenta) {
    formVenta.addEventListener('submit', async (e) => {
      e.preventDefault();

      const codigo = document.getElementById('codigo').value;
      const cantidad = parseInt(document.getElementById('cantidad').value);
      const total = parseFloat(document.getElementById('total').value);
      const cliente = document.getElementById('cliente')?.value || '';

      const vendedor = localStorage.getItem('usuario');
      if (!vendedor) {
        mensajeVenta.textContent = 'Error: No se encontró el usuario vendedor. Inicia sesión.';
        mensajeVenta.className = 'text-red-600 font-semibold';
        return;
      }

      let vendedorObj;
      try {
        vendedorObj = JSON.parse(vendedor);
      } catch {
        mensajeVenta.textContent = 'Error al interpretar datos del vendedor.';
        mensajeVenta.className = 'text-red-600 font-semibold';
        return;
      }

      const data = {
        producto_id: parseInt(codigo),
        vendedor: vendedorObj.username,  // Aquí enviamos username
        cantidad: cantidad,
        total: total,
        cliente: cliente
      };

      try {
        const response = await fetch('http://127.0.0.1:8000/ventas/registrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          mensajeVenta.textContent = 'Venta registrada correctamente';
          mensajeVenta.className = 'text-green-600 font-semibold';
          formVenta.reset();
          totalField.value = '';
          // Actualizar tabla con la nueva venta
          cargarVentas();
        } else {
          const errorData = await response.json();
          mensajeVenta.textContent = errorData.detail || 'Error al registrar venta';
          mensajeVenta.className = 'text-red-600 font-semibold';
        }
      } catch (error) {
        console.error('Error al enviar venta:', error);
        mensajeVenta.textContent = 'Error al conectar con el servidor';
        mensajeVenta.className = 'text-red-600 font-semibold';
      }
    });
  }
async function descargarFactura() {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  const usuario = localStorage.getItem('usuario');
  if (!usuario) {
    alert('Error: no se encontró usuario.');
    return;
  }
  let vendedorObj;
  try {
    vendedorObj = JSON.parse(usuario);
  } catch {
    alert('Error al interpretar datos del usuario.');
    return;
  }

  // Obtener las ventas actuales desde el backend (mis_ventas)
  let ventas;
  try {
    const res = await fetch(`http://127.0.0.1:8000/ventas/mis_ventas/${vendedorObj.username}`);
    ventas = await res.json();
  } catch (error) {
    alert('Error al cargar ventas para factura');
    return;
  }

  let y = 10;
  doc.setFontSize(16);
  doc.text("Factura de Venta - Farmacia FARMACORP", 10, y);
  y += 10;
  doc.setFontSize(12);
  doc.text(`Vendedor: ${vendedorObj.username}`, 10, y);
  y += 10;

  // Encabezado tabla
  doc.text("N°", 10, y);
  doc.text("Código", 20, y);
  doc.text("Producto", 40, y);
  doc.text("Cliente", 100, y);
  doc.text("Cantidad", 140, y);
  doc.text("Subtotal (Bs)", 170, y);
  y += 5;
  doc.line(10, y, 200, y);
  y += 5;

  let totalGeneral = 0;
  ventas.forEach((venta, i) => {
    if (y > 270) { // Salto de página si se llena
      doc.addPage();
      y = 20;
    }
    doc.text(String(i + 1), 10, y);
    doc.text(String(venta.codigo), 20, y);
    doc.text(venta.producto, 40, y);
    doc.text(venta.cliente, 100, y);
    doc.text(String(venta.cantidad), 140, y);
    doc.text(venta.total.toFixed(2), 170, y);
    y += 8;
    totalGeneral += venta.total;
  });

  doc.line(10, y, 200, y);
  y += 10;
  doc.text(`Total Venta: ${totalGeneral.toFixed(2)} Bs`, 140, y);

  // Descargar PDF
  doc.save(`Factura_${vendedorObj.username}_${Date.now()}.pdf`);
}

// Luego agrega un listener al botón para llamar esta función
document.getElementById('btnDescargarFactura')?.addEventListener('click', descargarFactura);

  // Cargar ventas cuando se abra la página
  cargarVentas();
});
