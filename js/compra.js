import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQ",
    authDomain: "hat-trick-9319c.firebaseapp.com",
    projectId: "hat-trick-9319c",
    storageBucket: "hat-trick-9319c.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
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

// Función para cargar los datos del usuario y el carrito
async function cargarDatosUsuario() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            usuarioActual = user;
            nombreCliente.value = user.displayName || '';
            emailCliente.value = user.email || '';

            // Cargar carrito desde Firestore
            const docRef = doc(db, "carritos", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const datos = docSnap.data();
                carritoActual = datos.items || [];
                window.userInfo = datos.userInfo || {};
                
                // Actualizar UI
                actualizarResumenCarrito();
            }
        } else {
            // Redirigir a la página principal si no hay usuario autenticado
            window.location.href = 'index.html';
        }
    });
}

// Función para actualizar el resumen del carrito
function actualizarResumenCarrito() {
    let total = 0;
    resumenProductos.innerHTML = '';

    carritoActual.forEach(item => {
        const precio = parseFloat(item.precio);
        const subtotal = precio * item.cantidad;
        total += subtotal;

        const productoHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h6 class="mb-0">${item.nombre}</h6>
                    <small class="text-muted">
                        Talla: ${item.talla} | 
                        Suela: ${item.suela}
                        ${item.personalizado ? `<br>Personalizado: ${item.personalizado.nombre} - ${item.personalizado.numero}` : ''}
                    </small>
                </div>
                <div class="text-end">
                    <div>$${precio.toFixed(2)} x ${item.cantidad}</div>
                    <div class="fw-bold">$${subtotal.toFixed(2)}</div>
                </div>
            </div>
        `;
        resumenProductos.innerHTML += productoHTML;
    });

    totalPedido.textContent = `$${total.toFixed(2)}`;
}

// Manejar el envío del formulario
formularioEntrega.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!usuarioActual) {
        alert('Debes iniciar sesión para continuar');
        return;
    }

    const direccionEntrega = {
        direccion: document.getElementById('direccion').value,
        ciudad: document.getElementById('ciudad').value,
        estado: document.getElementById('estado').value,
        codigoPostal: document.getElementById('codigoPostal').value,
        telefono: document.getElementById('telefono').value,
        instrucciones: document.getElementById('instrucciones').value
    };

    try {
        // Actualizar el documento en Firestore con la dirección de entrega
        const docRef = doc(db, "carritos", usuarioActual.uid);
        await updateDoc(docRef, {
            direccionEntrega: direccionEntrega,
            fechaActualizacion: new Date()
        });

        // Aquí iría la redirección a la pasarela de pagos
        alert('¡Gracias por tu compra! Serás redirigido al pago...');
        // window.location.href = 'URL_DE_LA_PASARELA_DE_PAGOS';
    } catch (error) {
        console.error("Error al guardar la dirección:", error);
        alert('Hubo un error al procesar tu pedido. Por favor, intenta nuevamente.');
    }
});

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosUsuario();
}); 