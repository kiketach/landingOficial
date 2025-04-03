// Accion del NavBar
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
  
            const carouselItems = document.getElementById('carouselItems');
            carouselItems.innerHTML = '';
  
            images.forEach((image, index) => {
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                if (index === 0) carouselItem.classList.add('active');

                const modalContent = document.createElement('div');
                modalContent.classList.add('modal-content');

                // Imagen con funcionalidad de ampliación
                const imgContainer = document.createElement('div');
                imgContainer.style.textAlign = 'center';
                imgContainer.style.marginBottom = '15px';
                imgContainer.style.cursor = 'pointer';

                const img = document.createElement('img');
                img.src = `assets/img/portfolio/${image}`;
                img.alt = title;
                img.style.maxHeight = '220px';
                img.style.width = 'auto';
                img.style.transition = 'transform 0.3s ease';
                
                // Agregar evento de clic para ampliar la imagen
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

                    modal.appendChild(enlargedImg);
                    document.body.appendChild(modal);

                    // Cerrar al hacer clic en cualquier parte
                    modal.addEventListener('click', () => {
                        document.body.removeChild(modal);
                    });
                });

                imgContainer.appendChild(img);
                modalContent.appendChild(imgContainer);

                // Contenedor de selección
                const selectionContainer = document.createElement('div');
                selectionContainer.style.maxWidth = '300px';
                selectionContainer.style.margin = '0 auto';
                selectionContainer.style.padding = '0 15px';

                // Talla
                const tallaContainer = document.createElement('div');
                tallaContainer.style.marginBottom = '15px';

                const tallaLabel = document.createElement('label');
                tallaLabel.textContent = 'Talla:';
                tallaLabel.style.display = 'block';
                tallaLabel.style.marginBottom = '5px';
                tallaLabel.style.fontWeight = 'bold';

                const tallaSelect = document.createElement('select');
                tallaSelect.className = 'form-select';
                tallaSelect.style.height = '35px';
                tallaSelect.innerHTML = `
                    <option value="" disabled selected>Selecciona talla</option>
                    <option value="32">32</option>
                    <option value="33">33</option>
                    <option value="34">34</option>
                    <option value="35">35</option>
                    <option value="36">36</option>
                    <option value="37">37</option>
                    <option value="38">38</option>
                    <option value="39">39</option>
                    <option value="40">40</option>
                    <option value="41">41</option>
                    <option value="42">42</option>
                    <option value="43">43</option>
                `;

                tallaContainer.appendChild(tallaLabel);
                tallaContainer.appendChild(tallaSelect);
                selectionContainer.appendChild(tallaContainer);

                // Suela
                const suelaContainer = document.createElement('div');
                suelaContainer.style.marginBottom = '15px';

                const suelaLabel = document.createElement('label');
                suelaLabel.textContent = 'Suela:';
                suelaLabel.style.display = 'block';
                suelaLabel.style.marginBottom = '5px';
                suelaLabel.style.fontWeight = 'bold';

                const suelaSelect = document.createElement('select');
                suelaSelect.className = 'form-select';
                suelaSelect.style.height = '35px';
                suelaSelect.innerHTML = `
                    <option value="" disabled selected>Selecciona suela</option>
                    <option value="Goma">Goma</option>
                    <option value="Colores">Colores</option>
                    <option value="Negra">Negra</option>
                    <option value="Sintética>Sintética</option>
                `;

                suelaContainer.appendChild(suelaLabel);
                suelaContainer.appendChild(suelaSelect);
                selectionContainer.appendChild(suelaContainer);

                // Contenedor de opciones de personalización
                const personalizacionOptionsContainer = document.createElement('div');
                personalizacionOptionsContainer.style.marginBottom = '15px';
                personalizacionOptionsContainer.style.textAlign = 'left';

                const personalizacionLabel = document.createElement('label');
                personalizacionLabel.textContent = '¿Deseas ponerle nombre y número de jugador a tus zapatillas?';
                personalizacionLabel.style.display = 'block';
                personalizacionLabel.style.marginBottom = '5px';
                personalizacionLabel.style.fontWeight = 'light';

                // Radio buttons
                const radioContainer = document.createElement('div');
                radioContainer.style.marginBottom = '15px';
                radioContainer.style.display = 'flex';
                radioContainer.style.gap = '20px';

                // Opción Sí
                const siContainer = document.createElement('div');
                siContainer.style.display = 'flex';
                siContainer.style.alignItems = 'center';
                const siRadio = document.createElement('input');
                siRadio.type = 'radio';
                siRadio.name = 'personalizacion';
                siRadio.id = 'personalizacionSi';
                siRadio.value = 'si';
                const siLabel = document.createElement('label');
                siLabel.htmlFor = 'personalizacionSi';
                siLabel.textContent = ' Sí';
                siLabel.style.marginLeft = '5px';
                siContainer.appendChild(siRadio);
                siContainer.appendChild(siLabel);

                // Opción No
                const noContainer = document.createElement('div');
                noContainer.style.display = 'flex';
                noContainer.style.alignItems = 'center';
                const noRadio = document.createElement('input');
                noRadio.type = 'radio';
                noRadio.name = 'personalizacion';
                noRadio.id = 'personalizacionNo';
                noRadio.value = 'no';
                const noLabel = document.createElement('label');
                noLabel.htmlFor = 'personalizacionNo';
                noLabel.textContent = ' No';
                noLabel.style.marginLeft = '5px';
                noContainer.appendChild(noRadio);
                noContainer.appendChild(noLabel);

                radioContainer.appendChild(siContainer);
                radioContainer.appendChild(noContainer);

                personalizacionOptionsContainer.appendChild(personalizacionLabel);
                personalizacionOptionsContainer.appendChild(radioContainer);
                selectionContainer.appendChild(personalizacionOptionsContainer);

                // Contenedor de campos de personalización (inicialmente oculto)
                const personalizacionContainer = document.createElement('div');
                personalizacionContainer.style.display = 'none';
                personalizacionContainer.style.marginBottom = '15px';

                const nombreLabel = document.createElement('label');
                nombreLabel.textContent = 'Nombre del Jugador:';
                nombreLabel.style.display = 'block';
                nombreLabel.style.marginBottom = '5px';
                nombreLabel.style.fontWeight = 'bold';

                const nombreInput = document.createElement('input');
                nombreInput.type = 'text';
                nombreInput.className = 'form-control';
                nombreInput.placeholder = 'Ingresa el nombre';
                nombreInput.style.marginBottom = '10px';

                const numeroLabel = document.createElement('label');
                numeroLabel.textContent = 'Número del Jugador:';
                numeroLabel.style.display = 'block';
                numeroLabel.style.marginBottom = '5px';
                numeroLabel.style.fontWeight = 'bold';

                const numeroInput = document.createElement('input');
                numeroInput.type = 'number';
                numeroInput.className = 'form-control';
                numeroInput.placeholder = 'Ingresa el número';

                personalizacionContainer.appendChild(nombreLabel);
                personalizacionContainer.appendChild(nombreInput);
                personalizacionContainer.appendChild(numeroLabel);
                personalizacionContainer.appendChild(numeroInput);
                selectionContainer.appendChild(personalizacionContainer);

                // Botón
                const buttonContainer = document.createElement('div');
                buttonContainer.style.textAlign = 'center';
                buttonContainer.style.marginTop = '15px';

                const button = document.createElement('button');
                button.textContent = 'Agregar al Carrito!';
                button.className = 'btn btn-secondary';  // Inicia gris
                button.style.width = '100%';
                button.style.height = '35px';
                button.style.transition = 'all 0.3s ease';
                button.disabled = true;

                // Función para validar la selección
                const validarSeleccion = () => {
                    const personalizacionSeleccionada = document.querySelector('input[name="personalizacion"]:checked')?.value;
                    
                    if (!tallaSelect.value || !suelaSelect.value || !personalizacionSeleccionada) {
                        button.disabled = true;
                        button.className = 'btn btn-secondary';
                        button.style.backgroundColor = '#6c757d';
                        return;
                    }

                    if (personalizacionSeleccionada === 'si') {
                        if (!nombreInput.value.trim() || !numeroInput.value.trim()) {
                            button.disabled = true;
                            button.className = 'btn btn-secondary';
                            button.style.backgroundColor = '#6c757d';
                        } else {
                            button.disabled = false;
                            button.className = 'btn btn-success';
                            button.style.backgroundColor = '#198754';
                        }
                    } else {
                        button.disabled = false;
                        button.className = 'btn btn-success';
                        button.style.backgroundColor = '#198754';
                    }
                };

                // Event listeners para la personalización
                siRadio.addEventListener('change', () => {
                    personalizacionContainer.style.display = 'block';
                    validarSeleccion();
                });

                noRadio.addEventListener('change', () => {
                    personalizacionContainer.style.display = 'none';
                    nombreInput.value = '';
                    numeroInput.value = '';
                    validarSeleccion();
                });

                tallaSelect.addEventListener('change', validarSeleccion);
                suelaSelect.addEventListener('change', validarSeleccion);
                nombreInput.addEventListener('input', validarSeleccion);
                numeroInput.addEventListener('input', validarSeleccion);

                button.addEventListener('click', async () => {
                    const personalizacionSeleccionada = document.querySelector('input[name="personalizacion"]:checked')?.value;
                    
                    // Validación adicional antes de agregar al carrito
                    if (!personalizacionSeleccionada || !tallaSelect.value || !suelaSelect.value) {
                        alert('Por favor, completa todos los campos requeridos');
                        return;
                    }

                    if (personalizacionSeleccionada === 'si' && (!nombreInput.value.trim() || !numeroInput.value.trim())) {
                        alert('Por favor, completa los campos de personalización');
                        return;
                    }

                    // Crear el objeto del producto
                    const producto = {
                        title,
                        image: image,
                        talla: tallaSelect.value,
                        suela: suelaSelect.value,
                        personalizado: personalizacionSeleccionada === 'si'
                    };

                    // Agregar datos de personalización si corresponde
                    if (personalizacionSeleccionada === 'si') {
                        producto.nombre = nombreInput.value.trim();
                        producto.numero = numeroInput.value.trim();
                    }

                    window.carrito.push(producto);
                    await window.actualizarCarrito();
                    showSuccessModal();
                });

                buttonContainer.appendChild(button);
                selectionContainer.appendChild(buttonContainer);
                modalContent.appendChild(selectionContainer);

                carouselItem.appendChild(modalContent);
                carouselItems.appendChild(carouselItem);
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
                alert('Debes iniciar sesión para realizar una compra.');
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
                return;
            }
            
            if (!window.carrito || window.carrito.length === 0) {
                alert('Tu carrito está vacío. Por favor, agrega productos antes de proceder con la compra.');
                return;
            }
            
            // Guardar el carrito en localStorage antes de redirigir
            localStorage.setItem('carritoTemp', JSON.stringify(window.carrito));
            window.location.href = 'compra.html';
        });
    }
});
  
//INICIO DE SESION
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
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
  
/// Función para guardar el carrito en Firestore
window.guardarCarritoEnFirestore = async function(uid) {
    try {
        const carritoRef = doc(db, "carritos", uid);
        const user = auth.currentUser;
        
        await setDoc(carritoRef, {
            items: window.carrito,
            userInfo: {
                nombre: user.displayName || 'Usuario',
                email: user.email,
                lastUpdated: new Date()
            }
        }, { merge: true });
        
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
            loginButton.textContent = 'Entrar';
            loginButton.setAttribute('data-bs-toggle', 'modal');
            loginButton.setAttribute('data-bs-target', '#loginModal');
        }
        if (loginButtonMobile) {
            loginButtonMobile.textContent = 'Entrar';
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
        
        if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = 'Ya existe una cuenta con este email usando otro método de inicio de sesión.';
        }
        
        alert(errorMessage);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Eventos de inicio de sesión
    const googleLoginBtn = document.getElementById('googleLogin');
    const facebookLoginBtn = document.getElementById('facebookLogin');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            window.handleLogin(provider);
        });
    }

    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', () => {
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
});