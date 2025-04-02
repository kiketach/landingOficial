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

                // Botón
                const buttonContainer = document.createElement('div');
                buttonContainer.style.textAlign = 'center';
                buttonContainer.style.marginTop = '15px';

                const button = document.createElement('button');
                button.textContent = 'Agregar al Carrito!';
                button.className = 'btn btn-dark';
                button.style.width = '100%';
                button.style.height = '25px';
                button.disabled = true;

                const validarSeleccion = () => {
                    button.disabled = !tallaSelect.value || !suelaSelect.value;
                };

                tallaSelect.addEventListener('change', validarSeleccion);
                suelaSelect.addEventListener('change', validarSeleccion);

                button.addEventListener('click', async () => {
                    carrito.push({ 
                        title, 
                        image: image,
                        talla: tallaSelect.value,
                        suela: suelaSelect.value
                    });
                    await actualizarCarrito();
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
    const loginButton = document.getElementById('loginButton');
    const loginButtonMobile = document.getElementById('loginButtonMobile');
    const logoutButton = document.getElementById('logoutButton');
    const logoutButtonMobile = document.getElementById('logoutButtonMobile');
    const carritoItems = document.getElementById('carritoItems');
    const cartCount = document.getElementById('cartCount');

    if (!loginButton || !loginButtonMobile || !logoutButton || !logoutButtonMobile) {
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
            const displayName = user.displayName || 'Usuario';
            loginButton.textContent = `¡Hola, ${displayName}!`;
            loginButtonMobile.textContent = `¡Hola, ${displayName}!`;
            logoutButton.classList.remove('d-none');
            logoutButtonMobile.classList.remove('d-none');
        } else {
            // Si no hay usuario autenticado, limpia el carrito
            carrito = [];
            actualizarCarritoUI(carrito);

            // Actualiza la interfaz
            loginButton.textContent = 'Entrar';
            loginButtonMobile.textContent = 'Entrar';
            logoutButton.classList.add('d-none');
            logoutButtonMobile.classList.add('d-none');
        }
    });

    // Función para manejar el inicio de sesión
    const handleLogin = async (provider) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('Usuario autenticado:', user);

            // Cierra el modal de inicio de sesión
            const loginModal = document.getElementById('loginModal');
            const modalInstance = bootstrap.Modal.getInstance(loginModal);
            modalInstance.hide();
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert('Hubo un error al iniciar sesión. Por favor, intenta nuevamente.');
        }
    };

    // Eventos de inicio de sesión
    loginButton.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        handleLogin(provider);
    });

    loginButtonMobile.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        handleLogin(provider);
    });

    // Eventos de cierre de sesión
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Hubo un error al cerrar sesión. Por favor, intenta nuevamente.');
        }
    };

    logoutButton.addEventListener('click', handleLogout);
    logoutButtonMobile.addEventListener('click', handleLogout);

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