import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD8804T_OzHWiaS3AxuUwFe5QCRP0E9GIs",
    authDomain: "hat-trick-9319c.firebaseapp.com",
    projectId: "hat-trick-9319c",
    storageBucket: "hat-trick-9319c.appspot.com",
    messagingSenderId: "303428148607",
    appId: "1:303428148607:web:84294bbe953e9911a64e4a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Elementos del DOM
const resumenProductos = document.getElementById('resumenProductos');
const totalPedido = document.getElementById('totalPedido');
const nombreCliente = document.getElementById('nombreCliente');
const emailCliente = document.getElementById('emailCliente');
const formularioEntrega = document.getElementById('formularioEntrega');

// Variables globales
let carritoActual = [];
let usuarioActual = null;

// Función para mostrar alerta estilizada
function mostrarAlerta(titulo, mensaje, redirigir = false) {
    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    document.getElementById('alertTitle').textContent = titulo;
    document.getElementById('alertMessage').textContent = mensaje;
    
    // Obtener el botón Aceptar
    const btnAceptar = document.querySelector('#alertModal .btn-dark');
    
    // Eliminar cualquier evento anterior
    const nuevoBtn = btnAceptar.cloneNode(true);
    btnAceptar.parentNode.replaceChild(nuevoBtn, btnAceptar);
    
    // Agregar evento para redirigir si es necesario
    if (redirigir) {
        nuevoBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    alertModal.show();
}

// Función para cargar los datos del usuario y el carrito
async function cargarDatosUsuario(user) {
    if (!user) return;

    try {
        usuarioActual = user;
        nombreCliente.value = user.displayName || '';
        emailCliente.value = user.email || '';

        // Intentar cargar el carrito desde localStorage primero
        const carritoTemp = localStorage.getItem('carritoTemp');
        if (carritoTemp) {
            carritoActual = JSON.parse(carritoTemp);
            localStorage.removeItem('carritoTemp');
        } else {
            // Si no hay carrito en localStorage, cargar desde Firestore
            const docRef = doc(db, "carritos", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const datos = docSnap.data();
                carritoActual = datos.items || [];
                
                // Cargar datos de dirección si existen
                if (datos.direccionEntrega) {
                    const direccionEntrega = datos.direccionEntrega;
                    document.getElementById('direccion').value = direccionEntrega.direccion || '';
                    document.getElementById('ciudad').value = direccionEntrega.ciudad || '';
                    document.getElementById('estado').value = direccionEntrega.estado || '';
                    document.getElementById('telefono').value = direccionEntrega.telefono || '';
                    document.getElementById('instrucciones').value = direccionEntrega.instrucciones || '';
                    
                    // Guardar en localStorage para futuras compras
                    localStorage.setItem(`direccionEntrega_${user.uid}`, JSON.stringify(direccionEntrega));
                }
            }
        }

        // Intentar cargar datos de dirección desde localStorage
        const direccionGuardada = localStorage.getItem(`direccionEntrega_${user.uid}`);
        if (direccionGuardada) {
            const direccionEntrega = JSON.parse(direccionGuardada);
            document.getElementById('direccion').value = direccionEntrega.direccion || '';
            document.getElementById('ciudad').value = direccionEntrega.ciudad || '';
            document.getElementById('estado').value = direccionEntrega.estado || '';
            document.getElementById('telefono').value = direccionEntrega.telefono || '';
            document.getElementById('instrucciones').value = direccionEntrega.instrucciones || '';
        }

        if (!carritoActual || carritoActual.length === 0) {
            mostrarAlerta('Carrito vacío', 'Tu carrito está vacío. Serás redirigido a la página principal.', true);
            return;
        }

        // Actualizar UI
        actualizarResumenCarrito();
    } catch (error) {
        console.error("Error al cargar datos:", error);
        mostrarAlerta('Error', 'Hubo un error al cargar tu carrito. Por favor, intenta nuevamente.', true);
    }
}

// Función para actualizar el resumen del carrito
function actualizarResumenCarrito() {
    if (!resumenProductos || !totalPedido) return;

    let total = 0;
    let html = '';

    carritoActual.forEach(producto => {
        const precio = producto.title?.toLowerCase().includes('sintetik') || 
                      producto.title?.toLowerCase().includes('sala') || 
                      producto.title?.toLowerCase().includes('copa') 
                      ? 89900 : 99900;

        total += precio;

        html += `
            <div class="producto-resumen d-flex align-items-center mb-3">
                <img src="assets/img/portfolio/${producto.image}" 
                     alt="${producto.title}" 
                     class="producto-imagen me-3" 
                     style="width: 80px; height: 80px; object-fit: cover;">
                <div class="producto-detalles flex-grow-1">
                    <h6 class="mb-0">${producto.title}</h6>
                    <small class="text-muted">
                        Talla: ${producto.talla} | 
                        Suela: ${producto.suela}
                        ${producto.personalizado ? `<br>Personalizado: ${producto.nombre} - #${producto.numero}` : ''}
                    </small>
                    <div class="text-end">
                        <div class="fw-bold">$${precio.toLocaleString('es-CO')}</div>
                    </div>
                </div>
            </div>
        `;
    });

    resumenProductos.innerHTML = html;
    totalPedido.textContent = `$${total.toLocaleString('es-CO')}`;
}

// Función para generar un número de pedido aleatorio
function generarNumeroPedido() {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().substr(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const aleatorio = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `HT-${año}${mes}${dia}-${aleatorio}`;
}

// Manejar el envío del formulario
if (formularioEntrega) {
    formularioEntrega.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!usuarioActual) {
            mostrarAlerta('Error de sesión', 'Debes iniciar sesión para continuar');
            return;
        }

        const direccionEntrega = {
            direccion: document.getElementById('direccion').value,
            ciudad: document.getElementById('ciudad').value,
            estado: document.getElementById('estado').value,
            telefono: document.getElementById('telefono').value,
            instrucciones: document.getElementById('instrucciones').value || 'Sin instrucciones adicionales'
        };

        try {
            // Mostrar indicador de carga
            const btnPagar = document.getElementById('btnPagar');
            if (btnPagar) {
                btnPagar.disabled = true;
                btnPagar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
            }

            // Generar número de pedido
            const numeroPedido = generarNumeroPedido();

            // Guardar en Firestore - Colección carritos
            const carritoDocRef = doc(db, "carritos", usuarioActual.uid);
            await updateDoc(carritoDocRef, {
                direccionEntrega: direccionEntrega,
                fechaActualizacion: new Date(),
                estado: 'pendiente_pago',
                numeroPedido: numeroPedido
            });

            // Guardar en localStorage para futuras compras
            localStorage.setItem(`direccionEntrega_${usuarioActual.uid}`, JSON.stringify(direccionEntrega));

            // Mostrar mensaje de éxito
            mostrarAlerta('Éxito', '¡Datos de entrega guardados correctamente!');
            
            // Mostrar el número de pedido en el modal
            const numeroPedidoElement = document.getElementById('numeroPedido');
            if (numeroPedidoElement) {
                numeroPedidoElement.textContent = numeroPedido;
            }
            
            // Mostrar el modal de pago
            const modalPago = new bootstrap.Modal(document.getElementById('modalPago'));
            modalPago.show();
            
            // Restaurar el botón
            if (btnPagar) {
                btnPagar.disabled = false;
                btnPagar.innerHTML = 'Proceder al Pago';
            }
        } catch (error) {
            console.error("Error al guardar la dirección:", error);
            mostrarAlerta('Error', 'Hubo un error al procesar tu pedido. Por favor, intenta nuevamente.');
            
            // Restaurar el botón en caso de error
            const btnPagar = document.getElementById('btnPagar');
            if (btnPagar) {
                btnPagar.disabled = false;
                btnPagar.innerHTML = 'Proceder al Pago';
            }
        }
    });
}

// Esperar a que Firebase inicialice antes de cargar los datos
let authInitialized = false;
onAuthStateChanged(auth, (user) => {
    if (!authInitialized) {
        authInitialized = true;
        if (user) {
            cargarDatosUsuario(user);
        } else {
            mostrarAlerta('Inicio de sesión requerido', 'Debes iniciar sesión para realizar una compra. Serás redirigido a la página principal.', true);
        }
    }
}); 