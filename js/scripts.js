// INICIO DE SESION Y CONFIGURACIÓN DE FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD8804T_OzHWiaS3AxuUwFe5QCRP0E9GIs",
    authDomain: "hat-trick-9319c.firebaseapp.com",
    projectId: "hat-trick-9319c",
    storageBucket: "hat-trick-9319c.firebasestorage.app",
    messagingSenderId: "303428148607",
    appId: "1:303428148607:web:84294bbe953e9911a64e4a",
    measurementId: "G-XENSCPPQ18"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// VARIABLES GLOBALES
let carrito = []; // Carrito de compras

// FUNCIONES GLOBALES

// Función para actualizar la interfaz del carrito
function actualizarCarritoUI(carrito) {
    const carritoItems = document.getElementById('carritoItems');
    const cartCount = document.getElementById('cartCount');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');

    carritoItems.innerHTML = ""; // Limpia el contenido actual
    cartCount.textContent = carrito.length; // Actualiza el contador del carrito

    if (carrito.length === 0) {
        vaciarCarritoBtn.style.display = 'none'; // Oculta el botón si el carrito está vacío
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('text-center', 'text-muted', 'mt-5');
        emptyMessage.textContent = 'Aquí se mostrarán las zapatillas que compres.';
        carritoItems.appendChild(emptyMessage);
    } else {
        vaciarCarritoBtn.style.display = 'block'; // Muestra el botón si hay productos
        carrito.forEach((producto, index) => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

            const itemContainer = document.createElement('div');
            itemContainer.classList.add('d-flex', 'align-items-center', 'gap-3');

            const img = document.createElement('img');
            img.src = producto.image;
            img.alt = producto.title;
            img.style.width = "100px";
            img.style.height = "100px";
            img.style.objectFit = "cover";
            img.classList.add('rounded');

            const text = document.createElement('span');
            text.textContent = producto.title;

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('btn-close');
            removeBtn.setAttribute('aria-label', 'Eliminar');
            removeBtn.addEventListener('click', () => {
                eliminarProducto(index);
            });

            itemContainer.appendChild(img);
            itemContainer.appendChild(text);
            li.appendChild(itemContainer);
            li.appendChild(removeBtn);
            carritoItems.appendChild(li);
        });
    }
}

// Función para guardar el carrito en Firestore
async function guardarCarritoEnFirestore(uid, carrito) {
    try {
        const carritoRef = doc(db, "carritos", uid);
        await setDoc(carritoRef, {
            items: carrito,
            lastUpdated: new Date()
        });
        console.log("Carrito guardado en Firestore");
    } catch (error) {
        console.error("Error al guardar el carrito en Firestore:", error);
    }
}

// Función para cargar el carrito desde Firestore
async function cargarCarritoDesdeFirestore(uid) {
    try {
        const carritoRef = doc(db, "carritos", uid);
        const carritoSnap = await getDoc(carritoRef);

        if (carritoSnap.exists()) {
            const data = carritoSnap.data();
            console.log("Carrito cargado desde Firestore:", data.items);
            return data.items;
        } else {
            console.log("No hay carrito guardado para este usuario.");
            return [];
        }
    } catch (error) {
        console.error("Error al cargar el carrito desde Firestore:", error);
        return [];
    }
}

// Función para agregar un producto al carrito
function agregarProductoAlCarrito(producto) {
    console.log("Producto agregado al carrito:", producto);
    carrito.push(producto);
    actualizarCarritoUI(carrito);

    if (auth.currentUser) {
        guardarCarritoEnFirestore(auth.currentUser.uid, carrito);
    } else {
        console.warn("El usuario no está autenticado. No se puede guardar el carrito.");
    }
}

// Función para eliminar un producto del carrito
function eliminarProducto(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI(carrito);

    if (auth.currentUser) {
        guardarCarritoEnFirestore(auth.currentUser.uid, carrito);
    }
}

// EVENTOS DEL DOM
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');

    // Detecta el estado de autenticación
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            carrito = await cargarCarritoDesdeFirestore(user.uid);
            actualizarCarritoUI(carrito);
            loginButton.textContent = `¡Hola, ${user.displayName}!`;
            logoutButton.classList.remove('d-none');
        } else {
            carrito = [];
            actualizarCarritoUI(carrito);
            loginButton.textContent = 'Iniciar Sesión';
            logoutButton.classList.add('d-none');
        }
    });

    // Iniciar sesión con Google
    loginButton.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('Usuario autenticado:', user);
 } catch (error) {
            console.error('Error al iniciar sesión con Google:', error);
        }
    });

    // Cerrar sesión
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    });

    // Vaciar carrito
    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', () => {
            carrito = [];
            actualizarCarritoUI(carrito);
            if (auth.currentUser) {
                guardarCarritoEnFirestore(auth.currentUser.uid, carrito);
            }
        });
    }

    // Navbar shrink function
    const navbarShrink = () => {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) return;
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink');
        } else {
            navbarCollapsible.classList.add('navbar-shrink');
        }
    };

    navbarShrink();
    document.addEventListener('scroll', navbarShrink);

    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    }

    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.forEach((responsiveNavItem) => {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
});