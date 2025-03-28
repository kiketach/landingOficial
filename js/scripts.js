/// Importa Firebase desde el CDN como módulos ES6
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";


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

  // Shrink the navbar on load and scroll
  navbarShrink();
  document.addEventListener('scroll', navbarShrink);

  // Activate Bootstrap scrollspy on the main nav element
  const mainNav = document.body.querySelector('#mainNav');
  if (mainNav) {
      new bootstrap.ScrollSpy(document.body, {
          target: '#mainNav',
          rootMargin: '0px 0px -40%',
      });
  }

  // Collapse responsive navbar when toggler is visible
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

        const actualizarCarrito = () => {
        carritoItems.innerHTML = ''; // Limpia el contenido del carrito en el DOM
        cartCount.textContent = carrito.length; // Actualiza el contador del carrito
    
        // Controla la visibilidad del botón "Vaciar Carrito"
        if (carrito.length === 0) {
            vaciarCarritoBtn.style.display = 'none'; // Oculta el botón si el carrito está vacío
    
            // Agrega un mensaje cuando el carrito esté vacío
            const emptyMessage = document.createElement('div');
            emptyMessage.classList.add('text-center', 'text-muted', 'mt-5'); // Estilo centrado y con margen superior
            emptyMessage.textContent = 'Aquí se mostrarán las zapatillas que compres.';
            carritoItems.appendChild(emptyMessage);
    
            console.log('Mensaje de carrito vacío agregado al DOM');
        } else {
            vaciarCarritoBtn.style.display = 'block'; // Muestra el botón si hay productos en el carrito
    
            // Agrega cada producto al carrito en el modal
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
    };

  // Función para eliminar un producto del carrito
  const eliminarProducto = (index) => {
      carrito.splice(index, 1);
      actualizarCarrito();
  };

  // Evento para vaciar el carrito
  if (vaciarCarritoBtn) {
      vaciarCarritoBtn.addEventListener('click', () => {
          carrito.length = 0;
          actualizarCarrito();
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

              const button = document.createElement('button');
              button.textContent = 'Seleccionar';
              button.classList.add('btn', 'btn-dark', 'mt-3');
              button.addEventListener('click', () => {
                  carrito.push({ title, image });
                  actualizarCarrito();
                  showSuccessModal();
              });

              const container = document.createElement('div');
              container.classList.add('text-center');
              container.appendChild(img);
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

// Iniciar sesión con Google
const googleLogin = document.getElementById('googleLogin');
googleLogin.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log('Usuario autenticado:', user);
        alert(`¡Bienvenido, ${user.displayName}!`);
    } catch (error) {
        console.error('Error al iniciar sesión con Google:', error);
        alert('Hubo un error al iniciar sesión. Por favor, intenta nuevamente.');
    }
});