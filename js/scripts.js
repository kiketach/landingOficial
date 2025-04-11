document.addEventListener('DOMContentLoaded', () => {
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
  
// Variables globales
window.carrito = [];
    const cartCount = document.getElementById('cartCount');
    const carritoItems = document.getElementById('carritoItems');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
  
    // Función para actualizar el carrito
    window.actualizarCarrito = async function() {
        const carritoItems = document.getElementById('carritoItems');
        const cartCount = document.getElementById('cartCount');
        
        if (!carritoItems || !cartCount) return;

        carritoItems.innerHTML = '';
        cartCount.textContent = window.carrito.length;

        if (window.carrito.length === 0) {
            carritoItems.innerHTML = `
                <div class="text-center text-muted mt-5">
                    Aquí se mostrarán las zapatillas que compres.
                </div>
            `;
            return;
        }

        let totalCompra = 0;
        let itemsHTML = '';

        window.carrito.forEach((producto, index) => {
            const precio = producto.title?.toLowerCase().includes('sintetik') || 
                          producto.title?.toLowerCase().includes('sala') || 
                          producto.title?.toLowerCase().includes('copa') 
                          ? 89900 : 99900;
            
            totalCompra += precio;

            const personalizacionHTML = producto.personalizado === true ? 
                `<div class="text-primary small fw-bold">
                    Personalización: ${producto.nombre || ''} | #${producto.numero || ''}
                </div>` : '';

            itemsHTML += `
                <div class="list-group-item mb-2 border rounded">
                    <div class="d-flex justify-content-between align-items-start gap-3">
                        <div class="d-flex gap-3 flex-grow-1">
                            <img src="assets/img/portfolio/${producto.image}" 
                                 alt="${producto.title}" 
                                 class="rounded" 
                                 style="width: 100px; height: 100px; object-fit: cover;">
                            <div class="flex-grow-1">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <h6 class="mb-0">${producto.title}</h6>
                                    <span class="text-success fw-bold">$${precio.toLocaleString('es-CO')}</span>
                                </div>
                                <div class="text-muted small mb-1">
                                    Talla: ${producto.talla} | Suela: ${producto.suela}
                                </div>
                                ${personalizacionHTML}
                            </div>
                        </div>
                        <button class="btn-close" onclick="window.eliminarProducto(${index})" aria-label="Eliminar"></button>
                    </div>
                </div>
            `;
        });

        carritoItems.innerHTML = `
            ${itemsHTML}
            <div class="mt-3 p-3 bg-light rounded border">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold fs-5">Total de la compra:</span>
                    <span class="fw-bold text-success fs-4">$${totalCompra.toLocaleString('es-CO')}</span>
                </div>
            </div>
        `;

        if (auth.currentUser) {
            await window.guardarCarritoEnFirestore(auth.currentUser.uid);
        }
    };
  
    // Función para eliminar un producto del carrito
    window.eliminarProducto = async function(index) {
        window.carrito.splice(index, 1);
        await window.actualizarCarrito();
    };
  
    // Evento para vaciar el carrito
    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', async () => {
            window.carrito = [];
            if (auth.currentUser) {
                try {
                    const carritoRef = doc(db, "carritos", auth.currentUser.uid);
                    const docSnap = await getDoc(carritoRef);
                    
                    if (docSnap.exists()) {
                        const datosActuales = docSnap.data();
                        // Mantener los datos existentes pero actualizar solo los items
                        await setDoc(carritoRef, {
                            ...datosActuales,
                            items: [],
                            userInfo: {
                                ...datosActuales.userInfo,
                                lastUpdated: new Date()
                            }
                        }, { merge: true });
                    } else {
                        // Si no existe el documento, crear uno nuevo solo con items vacíos
                        await setDoc(carritoRef, {
                            items: [],
                            userInfo: {
                                nombre: auth.currentUser.displayName || 'Usuario',
                                email: auth.currentUser.email,
                                lastUpdated: new Date()
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error al vaciar el carrito en Firebase:", error);
                }
            }
            await window.actualizarCarrito();
            const carritoModal = bootstrap.Modal.getInstance(document.getElementById('carritoModal'));
            if (carritoModal) {
                carritoModal.hide();
            }
        });
    }
  
    // Manejo de los productos seleccionados desde las zapatillas
    document.querySelectorAll('.portfolio-item').forEach((item) => {
        item.addEventListener('click', function () {
            const title = this.getAttribute('data-title');
            const description = this.getAttribute('data-description');
            const images = this.getAttribute('data-images').split(',');
  
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalDescription').textContent = description;
  
            // Configuración de la imagen principal
            const mainImage = document.getElementById('mainProductImage');
            mainImage.src = `assets/img/portfolio/${images[0]}`;
            mainImage.alt = title;
            
            // Limpiamos los event listeners antiguos para evitar duplicados
            const mainImageClone = mainImage.cloneNode(true);
            mainImage.parentNode.replaceChild(mainImageClone, mainImage);
            
            // Funcionalidad de zoom para la imagen principal
            mainImageClone.addEventListener('click', () => {
                showZoomedImage(mainImageClone.src);
            });
            
            // Generar las miniaturas
            const thumbnailsContainer = document.getElementById('thumbnailsContainer');
            thumbnailsContainer.innerHTML = '';
            
            images.forEach((image, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.style.width = '70px';
                thumbnail.style.height = '70px';
                thumbnail.style.cursor = 'pointer';
                thumbnail.style.border = index === 0 ? '2px solid #ffc800' : '2px solid transparent';
                thumbnail.style.borderRadius = '4px';
                thumbnail.style.overflow = 'hidden';
                thumbnail.style.transition = 'all 0.2s ease';
                thumbnail.setAttribute('data-image-index', index);
                
                const thumbImg = document.createElement('img');
                thumbImg.src = `assets/img/portfolio/${image}`;
                thumbImg.alt = `Miniatura ${index + 1}`;
                thumbImg.style.width = '100%';
                thumbImg.style.height = '100%';
                thumbImg.style.objectFit = 'cover';
                
                thumbnail.appendChild(thumbImg);
                
                // Evento al hacer clic en una miniatura
                thumbnail.addEventListener('click', (e) => {
                    // Actualizar la imagen principal
                    mainImageClone.src = `assets/img/portfolio/${image}`;
                    
                    // Actualizar el borde de las miniaturas
                    thumbnailsContainer.querySelectorAll('div').forEach(thumb => {
                        thumb.style.border = '2px solid transparent';
                    });
                    thumbnail.style.border = '2px solid #ffc800';
                });
                
                thumbnailsContainer.appendChild(thumbnail);
            });

            // Función para mostrar imagen ampliada
            function showZoomedImage(src) {
                const modal = document.createElement('div');
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                modal.style.display = 'flex';
                modal.style.justifyContent = 'center';
                modal.style.alignItems = 'center';
                modal.style.zIndex = '9999';
                modal.style.cursor = 'pointer';

                const enlargedImg = document.createElement('img');
                enlargedImg.src = src;
                enlargedImg.style.maxWidth = '90%';
                enlargedImg.style.maxHeight = '90vh';
                enlargedImg.style.objectFit = 'contain';

                modal.appendChild(enlargedImg);
                document.body.appendChild(modal);

                // Cerrar al hacer clic en cualquier parte
                modal.addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
            }
            
            // Configurar los campos de formulario y validaciones
            const tallaSelect = document.getElementById('tallaSelect');
            const suelaSelect = document.getElementById('suelaSelect');
            const personalizacionSi = document.getElementById('personalizacionSi');
            const personalizacionNo = document.getElementById('personalizacionNo');
            const camposPersonalizacion = document.getElementById('camposPersonalizacion');
            const nombreJugador = document.getElementById('nombreJugador');
            const numeroJugador = document.getElementById('numeroJugador');
            const btnAgregarCarrito = document.getElementById('btnAgregarCarrito');
            
            // Clonar y reemplazar el botón para eliminar event listeners antiguos
            const btnAgregarCarritoClone = btnAgregarCarrito.cloneNode(true);
            btnAgregarCarrito.parentNode.replaceChild(btnAgregarCarritoClone, btnAgregarCarrito);
            
            // Limpiar valores anteriores
            tallaSelect.value = '';
            suelaSelect.value = '';
            personalizacionSi.checked = false;
            personalizacionNo.checked = false;
            nombreJugador.value = '';
            numeroJugador.value = '';
            camposPersonalizacion.style.display = 'none';
            btnAgregarCarritoClone.disabled = true;
            btnAgregarCarritoClone.className = 'btn btn-secondary w-100';
            
            // Configurar eventos
            personalizacionSi.addEventListener('change', () => {
                camposPersonalizacion.style.display = 'block';
                validarFormulario();
            });
            
            personalizacionNo.addEventListener('change', () => {
                camposPersonalizacion.style.display = 'none';
                nombreJugador.value = '';
                numeroJugador.value = '';
                validarFormulario();
            });
            
            // Validación del formulario
            function validarFormulario() {
                const personalizacionSeleccionada = document.querySelector('input[name="personalizacionRadio"]:checked')?.value;
                
                if (!tallaSelect.value || !suelaSelect.value || !personalizacionSeleccionada) {
                    btnAgregarCarritoClone.disabled = true;
                    btnAgregarCarritoClone.className = 'btn btn-secondary w-100';
                    return;
                }
                
                if (personalizacionSeleccionada === 'si') {
                    if (!nombreJugador.value.trim() || !numeroJugador.value.trim()) {
                        btnAgregarCarritoClone.disabled = true;
                        btnAgregarCarritoClone.className = 'btn btn-secondary w-100';
                    } else {
                        btnAgregarCarritoClone.disabled = false;
                        btnAgregarCarritoClone.className = 'btn btn-success w-100';
                    }
                } else {
                    btnAgregarCarritoClone.disabled = false;
                    btnAgregarCarritoClone.className = 'btn btn-success w-100';
                }
            }
            
            // Agregar eventos de validación
            tallaSelect.addEventListener('change', validarFormulario);
            suelaSelect.addEventListener('change', validarFormulario);
            nombreJugador.addEventListener('input', validarFormulario);
            numeroJugador.addEventListener('input', validarFormulario);
            
            // Evento de agregar al carrito
            btnAgregarCarritoClone.addEventListener('click', async () => {
                const personalizacionSeleccionada = document.querySelector('input[name="personalizacionRadio"]:checked')?.value;
                
                // Validación adicional antes de agregar al carrito
                if (!personalizacionSeleccionada || !tallaSelect.value || !suelaSelect.value) {
                    alert('Por favor, completa todos los campos requeridos');
                    return;
                }
                
                if (personalizacionSeleccionada === 'si' && (!nombreJugador.value.trim() || !numeroJugador.value.trim())) {
                    alert('Por favor, completa los campos de personalización');
                    return;
                }
                
                // Obtener la imagen seleccionada actualmente
                const imagenActual = mainImageClone.src.split('/').pop();
                
                // Crear el objeto del producto
                const producto = {
                    title,
                    image: imagenActual,
                    talla: tallaSelect.value,
                    suela: suelaSelect.value,
                    personalizado: personalizacionSeleccionada === 'si'
                };
                
                // Agregar datos de personalización si corresponde
                if (personalizacionSeleccionada === 'si') {
                    producto.nombre = nombreJugador.value.trim();
                    producto.numero = numeroJugador.value.trim();
                }
                
                if (!verificarLoginYAgregar(producto)) {
                    return;
                }
                
                window.carrito.push(producto);
                await window.actualizarCarrito();
                showSuccessModal();
            });
            
            const modalElement = document.getElementById('portfolioModal');
            const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modal.show();
        });
    });
  
    // Función para mostrar el modal de éxito
    const showSuccessModal = () => {
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Cerrar el modal del catálogo
        const catalogModal = bootstrap.Modal.getInstance(document.getElementById('portfolioModal'));
        if (catalogModal) {
            catalogModal.hide();
        }
    };
  
    // Limpieza del fondo del modal al cerrarlo
    const modalElement = document.getElementById('portfolioModal');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', () => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        });
    }

    // Agregar funcionalidad de zoom a las imágenes de suelas
    document.querySelectorAll('#services img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '9999';
            modal.style.cursor = 'pointer';

            const enlargedImg = document.createElement('img');
            enlargedImg.src = img.src;
            enlargedImg.style.maxWidth = '90%';
            enlargedImg.style.maxHeight = '90vh';
            enlargedImg.style.objectFit = 'contain';
            enlargedImg.style.transition = 'transform 0.3s ease';

            modal.appendChild(enlargedImg);
            document.body.appendChild(modal);

            // Cerrar al hacer clic
            modal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
    });

    // Manejador del botón de compra
    const btnComprar = document.getElementById('btnComprar');
    if (btnComprar) {
        btnComprar.addEventListener('click', () => {
            const user = auth.currentUser;
            if (!user) {
                // Mostrar modal de alerta estilizado en lugar de alert()
                const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
                document.getElementById('alertMessage').textContent = 'Debes iniciar sesión para realizar una compra.';
                document.getElementById('alertTitle').textContent = 'Inicio de sesión requerido';
                
                // Obtener el botón Aceptar
                const btnAceptar = document.querySelector('#alertModal .btn-dark');
                
                // Eliminar cualquier evento anterior
                const nuevoBtn = btnAceptar.cloneNode(true);
                btnAceptar.parentNode.replaceChild(nuevoBtn, btnAceptar);
                
                // Agregar evento para mostrar el modal de inicio de sesión
                nuevoBtn.addEventListener('click', () => {
                    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                    loginModal.show();
                });
                
                alertModal.show();
                
                // Cerrar el modal del carrito
                const carritoModal = bootstrap.Modal.getInstance(document.getElementById('carritoModal'));
                if (carritoModal) {
                    carritoModal.hide();
                }
                
                return;
            }
            
            if (!window.carrito || window.carrito.length === 0) {
                // Mostrar modal de alerta estilizado en lugar de alert()
                const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
                document.getElementById('alertMessage').textContent = 'Tu carrito está vacío. Por favor, agrega productos antes de proceder con la compra.';
                document.getElementById('alertTitle').textContent = 'Carrito vacío';
                alertModal.show();
                return;
            }
            
            // Guardar el carrito en localStorage antes de redirigir
            localStorage.setItem('carritoTemp', JSON.stringify(window.carrito));
            window.location.href = 'compra.html#formulario-compra';
        });
    }
});
  
//INICIO DE SESION
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import firebaseConfig from './config.js';

// Variables globales
window.carrito = [];
let firebaseInitialized = false;
let auth = null;
let db = null;

// Inicializar Firebase usando la configuración local
async function initializeFirebase() {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    return { app, auth, db };
  } catch (error) {
    console.error('Error de inicialización');
    return null;
  }
}

// Inicializar Firebase y manejar errores
initializeFirebase()
  .then(({ app }) => {
    firebaseInitialized = true;
    
    // Eventos de inicio de sesión
    const googleLoginBtn = document.getElementById('googleLogin');
    const facebookLoginBtn = document.getElementById('facebookLogin');

    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', () => {
        console.log('Intentando iniciar sesión con Google');
        const provider = new GoogleAuthProvider();
        window.handleLogin(provider);
      });
    }

    if (facebookLoginBtn) {
      facebookLoginBtn.addEventListener('click', () => {
        console.log('Intentando iniciar sesión con Facebook');
        const provider = new FacebookAuthProvider();
        window.handleLogin(provider);
      });
    }

    // Eventos de cierre de sesión
    const logoutButton = document.getElementById('logoutButton');
    const logoutButtonMobile = document.getElementById('logoutButtonMobile');

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.carrito = [];
            window.actualizarCarrito();
            window.actualizarUIAutenticacion(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Hubo un error al cerrar sesión. Por favor, intenta nuevamente.');
        }
    };

    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (logoutButtonMobile) logoutButtonMobile.addEventListener('click', handleLogout);

    // Observador del estado de autenticación
    onAuthStateChanged(auth, async (user) => {
        window.actualizarUIAutenticacion(user);
        if (user) {
            await window.cargarCarritoDesdeFirestore(user.uid);
        }
    });

    /// Función para guardar el carrito en Firestore
    window.guardarCarritoEnFirestore = async function(uid) {
        try {
            const carritoRef = doc(db, "carritos", uid);
            const user = auth.currentUser;
            
            // Obtener datos del carrito actual
            const datosCarrito = {
                items: window.carrito,
                userInfo: {
                    nombre: user.displayName || 'Usuario',
                    email: user.email,
                    lastUpdated: new Date()
                }
            };
            
            // Verificar si hay dirección de entrega guardada en localStorage
            const direccionGuardada = localStorage.getItem(`direccionEntrega_${uid}`);
            if (direccionGuardada) {
                datosCarrito.direccionEntrega = JSON.parse(direccionGuardada);
            }
            
            await setDoc(carritoRef, datosCarrito, { merge: true });
            
            console.log("Carrito guardado en Firestore");
        } catch (error) {
            console.error("Error al guardar en Firestore:", error);
        }
    };

    // Función para cargar el carrito desde Firestore
    window.cargarCarritoDesdeFirestore = async function(uid) {
        try {
            const docRef = doc(db, "carritos", uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.items && Array.isArray(data.items)) {
                    window.carrito = data.items;
                    await window.actualizarCarrito();
                }
                
                // Cargar dirección de entrega si existe
                if (data.direccionEntrega) {
                    localStorage.setItem(`direccionEntrega_${uid}`, JSON.stringify(data.direccionEntrega));
                }
            }
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
        }
    };

    // Función para actualizar la UI basada en el estado de autenticación
    window.actualizarUIAutenticacion = function(user) {
        const loginButton = document.getElementById('loginButton');
        const loginButtonMobile = document.getElementById('loginButtonMobile');
        const logoutButton = document.getElementById('logoutButton');
        const logoutButtonMobile = document.getElementById('logoutButtonMobile');

        if (user) {
            const displayName = user.displayName || 'Usuario';
            if (loginButton) {
                loginButton.textContent = `¡Hola, ${displayName}!`;
                loginButton.removeAttribute('data-bs-toggle');
                loginButton.removeAttribute('data-bs-target');
            }
            if (loginButtonMobile) {
                loginButtonMobile.textContent = `¡Hola, ${displayName}!`;
                loginButtonMobile.removeAttribute('data-bs-toggle');
                loginButtonMobile.removeAttribute('data-bs-target');
            }
            if (logoutButton) logoutButton.classList.remove('d-none');
            if (logoutButtonMobile) logoutButtonMobile.classList.remove('d-none');
        } else {
            if (loginButton) {
                loginButton.textContent = 'Iniciar Sesión';
                loginButton.setAttribute('data-bs-toggle', 'modal');
                loginButton.setAttribute('data-bs-target', '#loginModal');
            }
            if (loginButtonMobile) {
                loginButtonMobile.textContent = 'Iniciar Sesión';
                loginButtonMobile.setAttribute('data-bs-toggle', 'modal');
                loginButtonMobile.setAttribute('data-bs-target', '#loginModal');
            }
            if (logoutButton) logoutButton.classList.add('d-none');
            if (logoutButtonMobile) logoutButtonMobile.classList.add('d-none');
        }
    };

    // Función para manejar el inicio de sesión
    window.handleLogin = async function(provider) {
        try {
            // Si es Facebook, verificar si estamos en HTTPS
            if (provider instanceof FacebookAuthProvider && window.location.protocol !== 'https:') {
                // Mostrar un modal de alerta personalizado
                const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
                document.getElementById('alertTitle').textContent = 'Error de Autenticación';
                document.getElementById('alertMessage').innerHTML = 
                    'Facebook requiere una conexión segura (HTTPS) para el inicio de sesión.<br><br>' +
                    'Por favor:<br>' +
                    '1. Utiliza Google para iniciar sesión localmente, o<br>' +
                    '2. Accede a la versión en línea con HTTPS de la aplicación.';
                alertModal.show();
                return;
            }
            
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('Usuario autenticado:', user);

            // Cerrar el modal de inicio de sesión
            const loginModal = document.getElementById('loginModal');
            const modalInstance = bootstrap.Modal.getInstance(loginModal);
            if (modalInstance) modalInstance.hide();

            // Actualizar la UI
            window.actualizarUIAutenticacion(user);

            // Cargar el carrito del usuario
            await window.cargarCarritoDesdeFirestore(user.uid);

        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            let errorMessage = 'Hubo un error al iniciar sesión. Por favor, intenta nuevamente.';
            let errorTitle = 'Error de Autenticación';
            
            if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'Ya existe una cuenta con este email usando otro método de inicio de sesión.';
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'La ventana de inicio de sesión fue cerrada antes de completar el proceso.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'El navegador bloqueó la ventana emergente. Por favor, permita ventanas emergentes para este sitio.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                return; // No mostrar error si el usuario canceló
            } else if (error.code && error.code.includes('facebook')) {
                errorTitle = 'Error con Facebook';
                errorMessage = 
                    'Facebook detectó que la aplicación no usa una conexión segura (HTTPS).<br><br>' +
                    'Por favor:<br>' +
                    '1. Utiliza Google para iniciar sesión localmente, o<br>' +
                    '2. Accede a la versión en línea con HTTPS de la aplicación.';
            }
            
            // Mostrar modal de alerta personalizado
            const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
            document.getElementById('alertTitle').textContent = errorTitle;
            document.getElementById('alertMessage').innerHTML = errorMessage;
            alertModal.show();
        }
    };

    // Función para abrir el modal de login desde el modal de requerimiento
    function abrirModalLogin() {
        // Cerrar el modal de requerimiento
        const requireLoginModal = bootstrap.Modal.getInstance(document.getElementById('requireLoginModal'));
        requireLoginModal.hide();
        
        // Abrir el modal de login
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }

    // Función para verificar si el usuario está logueado antes de agregar al carrito
    function verificarLoginYAgregar(producto) {
        // Verificar si el usuario está logueado usando Firebase Auth
        const user = auth.currentUser;
        
        if (!user) {
            // Mostrar el modal de requerimiento de login
            const requireLoginModal = new bootstrap.Modal(document.getElementById('requireLoginModal'));
            requireLoginModal.show();
            return false;
        }
        
        // Si está logueado, proceder con la adición al carrito
        return true;
    }

    // Exponer la función para que esté disponible globalmente
    window.abrirModalLogin = abrirModalLogin;
    window.verificarLoginYAgregar = verificarLoginYAgregar;
  })
  .catch(error => {
    console.error('Error en la inicialización de Firebase:', error);
  });