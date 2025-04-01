/// Accion del NavBar
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
  
    // Variables globales del carrito
    const carrito = [];
    const cartCount = document.getElementById('cartCount');
    const carritoItems = document.getElementById('carritoItems');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
  
    // Función para actualizar el carrito y la interfaz
    const actualizarCarrito = async () => {
        carritoItems.innerHTML = '';
        cartCount.textContent = carrito.length;
    
        if (carrito.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.classList.add('text-center', 'text-muted', 'mt-5');
            emptyMessage.textContent = 'Aquí se mostrarán las zapatillas que compres.';
            carritoItems.appendChild(emptyMessage);
        } else {
            vaciarCarritoBtn.style.display = 'block';
    
            carrito.forEach((producto, index) => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    
                const itemContainer = document.createElement('div');
                itemContainer.classList.add('d-flex', 'align-items-center', 'gap-3');
    
                const img = document.createElement('img');
                img.src = `assets/img/portfolio/${producto.image}`;
                img.alt = producto.title;
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                img.classList.add('rounded');
    
                const textContainer = document.createElement('div');
                textContainer.classList.add('d-flex', 'flex-column');
                
                const titleText = document.createElement('span');
                titleText.textContent = producto.title;
                titleText.classList.add('fw-bold');
                
                const detailsText = document.createElement('span');
                detailsText.textContent = `Talla: ${producto.talla} | Suela: ${producto.suela}`;
                detailsText.classList.add('text-muted', 'small');
                
                textContainer.appendChild(titleText);
                textContainer.appendChild(detailsText);
    
                const removeBtn = document.createElement('button');
                removeBtn.classList.add('btn-close');
                removeBtn.setAttribute('aria-label', 'Eliminar');
                removeBtn.addEventListener('click', async () => {
                    await eliminarProducto(index);
                });
    
                itemContainer.appendChild(img);
                itemContainer.appendChild(textContainer);
                li.appendChild(itemContainer);
                li.appendChild(removeBtn);
                carritoItems.appendChild(li);
            });
        }
    
        if (auth.currentUser) {
            await guardarCarritoEnFirestore(auth.currentUser.uid, carrito);
        }
    };
  
    // Función para eliminar un producto del carrito
    const eliminarProducto = async (index) => {
        carrito.splice(index, 1);
        await actualizarCarrito(); // Actualiza la interfaz y Firebase
    };
  
    // Evento para vaciar el carrito
    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', async () => {
            carrito.length = 0;
            await actualizarCarrito();
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
  
                const img = document.createElement('img');
                img.src = `assets/img/portfolio/${image}`;
                img.alt = title;
                img.classList.add('d-block', 'w-100');
  
                const container = document.createElement('div');
                container.classList.add('text-center', 'p-3');
                container.appendChild(img);
                
                // Agregar selectores de talla y suela
                const selectContainer = document.createElement('div');
                selectContainer.classList.add('mt-4', 'mb-3');
                selectContainer.style.maxWidth = '400px';
                selectContainer.style.margin = '0 auto';
                
                // Selector de talla
                const tallaContainer = document.createElement('div');
                tallaContainer.classList.add('mb-3');
                
                const tallaLabel = document.createElement('label');
                tallaLabel.textContent = 'Talla:';
                tallaLabel.classList.add('form-label');
                
                const tallaSelect = document.createElement('select');
                tallaSelect.classList.add('form-select');
                tallaSelect.innerHTML = `
                    <option value="" disabled selected>Selecciona talla</option>
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
                
                // Selector de suela
                const suelaContainer = document.createElement('div');
                suelaContainer.classList.add('mb-3');
                
                const suelaLabel = document.createElement('label');
                suelaLabel.textContent = 'Suela:';
                suelaLabel.classList.add('form-label');
                
                const suelaSelect = document.createElement('select');
                suelaSelect.classList.add('form-select');
                suelaSelect.innerHTML = `
                    <option value="" disabled selected>Selecciona suela</option>
                    <option value="natural">Natural</option>
                    <option value="sintetica">Sintética</option>
                    <option value="mixta">Mixta</option>
                `;
                
                suelaContainer.appendChild(suelaLabel);
                suelaContainer.appendChild(suelaSelect);
                
                selectContainer.appendChild(tallaContainer);
                selectContainer.appendChild(suelaContainer);
                container.appendChild(selectContainer);
                
                // Botón de seleccionar
                const button = document.createElement('button');
                button.textContent = 'Agregar al Carrito';
                button.classList.add('btn', 'btn-primary', 'btn-lg', 'mt-2');
                button.disabled = true;
                
                // Habilitar/deshabilitar botón según selección
                const validarSeleccion = () => {
                    button.disabled = !tallaSelect.value || !suelaSelect.value;
                };
                
                tallaSelect.addEventListener('change', validarSeleccion);
                suelaSelect.addEventListener('change', validarSeleccion);
                
                button.addEventListener('click', async () => {
                    console.log('Botón "Seleccionar" clickeado');
                    carrito.push({ 
                        title, 
                        image: image,
                        talla: tallaSelect.value,
                        suela: suelaSelect.value
                    });
                    console.log('Carrito actualizado:', carrito);
                    await actualizarCarrito();
                    showSuccessModal();
                });
                
                container.appendChild(button);
                carouselItem.appendChild(container);
                carouselItems.appendChild(carouselItem);
            });
  
            const modalElement = document.getElementById('portfolioModal');
            const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modal.show();
        });
    });
  
    // Función para mostrar el modal de éxito
    const showSuccessModal = () => {
        const modalTrigger = document.getElementById('successModalTrigger');
        if (modalTrigger) modalTrigger.click();
    };
  
    // Limpieza del fondo del modal al cerrarlo
    const modalElement = document.getElementById('portfolioModal');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', () => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        });
    }
  });
  
  //INICIO DE SESION
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
  
  // Variables globales
  let carrito = []; // Carrito de compras
  
  /// Función para guardar el carrito en Firestore
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
            return data.items; // Devolvemos los items tal cual están en Firestore
        } else {
            return []; // Si no hay carrito guardado, devuelve un array vacío
        }
    } catch (error) {
        console.error("Error al cargar el carrito desde Firestore:", error);
        return [];
    }
}

// Resto del código dentro del bloque DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton'); // Botón de iniciar sesión
    const logoutButton = document.getElementById('logoutButton'); // Botón de cerrar sesión
    const carritoItems = document.getElementById('carritoItems'); // Contenedor del carrito
    const cartCount = document.getElementById('cartCount'); // Contador del carrito

    if (!loginButton || !logoutButton) {
        console.error('Los botones de inicio o cierre de sesión no se encontraron en el DOM.');
        return;
    }

    // Detecta el estado de autenticación al cargar la página
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Si el usuario está autenticado, carga el carrito desde Firestore
            carrito = await cargarCarritoDesdeFirestore(user.uid);
            actualizarCarritoUI(carrito);

            // Actualiza la interfaz
            loginButton.textContent = `¡Hola, ${user.displayName}!`;
            logoutButton.classList.remove('d-none'); // Muestra el botón de cerrar sesión
        } else {
            // Si no hay usuario autenticado, limpia el carrito
            carrito = [];
            actualizarCarritoUI(carrito);

            // Actualiza la interfaz
            loginButton.textContent = 'Iniciar Sesión';
            logoutButton.classList.add('d-none'); // Oculta el botón de cerrar sesión
        }
    });

    // Iniciar sesión con Google
    loginButton.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('Usuario autenticado:', user);

            // Cierra el modal de inicio de sesión
            const loginModal = document.getElementById('loginModal'); // Selecciona el modal
            const modalInstance = bootstrap.Modal.getInstance(loginModal); // Obtén la instancia del modal
            modalInstance.hide(); // Cierra el modal
        } catch (error) {
            console.error('Error al iniciar sesión con Google:', error);
            alert('Hubo un error al iniciar sesión. Por favor, intenta nuevamente.');
        }
    });

    // Cerrar sesión
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Hubo un error al cerrar sesión. Por favor, intenta nuevamente.');
        }
    });

    // Función para actualizar la interfaz del carrito
    function actualizarCarritoUI(carrito) {
        carritoItems.innerHTML = ""; // Limpia el contenido actual
        carrito.forEach((producto, index) => {
            const li = document.createElement("li");
            li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

            const itemContainer = document.createElement("div");
            itemContainer.classList.add("d-flex", "align-items-center", "gap-3");

            const img = document.createElement("img");
            img.src = `assets/img/portfolio/${producto.image}`; // Construimos la ruta completa
            img.alt = producto.title;
            img.style.width = "100px";
            img.style.height = "100px";
            img.style.objectFit = "cover";
            img.classList.add("rounded");

            const textContainer = document.createElement('div');
            textContainer.classList.add('d-flex', 'flex-column');
            
            const titleText = document.createElement('span');
            titleText.textContent = producto.title;
            titleText.classList.add('fw-bold');
            
            const detailsText = document.createElement('span');
            detailsText.textContent = `Talla: ${producto.talla} | Suela: ${producto.suela}`;
            detailsText.classList.add('text-muted', 'small');
            
            textContainer.appendChild(titleText);
            textContainer.appendChild(detailsText);

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('btn-close');
            removeBtn.setAttribute('aria-label', 'Eliminar');
            removeBtn.addEventListener('click', async () => {
                await eliminarProducto(index);
            });

            itemContainer.appendChild(img);
            itemContainer.appendChild(textContainer);
            li.appendChild(itemContainer);
            li.appendChild(removeBtn);
            carritoItems.appendChild(li);
        });

        cartCount.textContent = carrito.length; // Actualiza el contador del carrito
    }

    // Ejemplo: Agregar un producto al carrito
    function agregarProductoAlCarrito(producto) {
        console.log("Producto agregado al carrito:", producto); // Verifica el producto
        carrito.push(producto);
        console.log("Carrito actualizado:", carrito); // Verifica el carrito actualizado
        actualizarCarritoUI(carrito);

        if (auth.currentUser) {
            console.log("Guardando carrito en Firestore para el usuario:", auth.currentUser.uid);
            guardarCarritoEnFirestore(auth.currentUser.uid, carrito);
        } else {
            console.warn("El usuario no está autenticado. No se puede guardar el carrito.");
        }
    }
});