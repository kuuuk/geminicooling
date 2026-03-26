// --- 1. CONFIGURACIÓN INICIAL ---
const contenedor = document.getElementById("catalogo-grid");

// --- 2. CARGA DE PRODUCTOS (CON LÍMITE OPCIONAL) ---
async function cargar(limite = null) {
  try {
    const res = await fetch("productos.json");
    let data = await res.json();

    if (limite) {
      data = data.slice(0, limite);
    }

    if (contenedor) {
      contenedor.innerHTML = "";
      data.forEach((prod) => {
        const card = document.createElement("div");
        card.className = "producto-card";
        const claseCss = prod.stock.toLowerCase().replace(" ", "-");

        card.innerHTML = `
            <div style="color:var(--accent); font-size:0.7rem; margin-bottom:5px;">SKU: ${prod.id}</div>
            <h3>${prod.nombre}</h3>
            <p style="color:#666; font-size:0.8rem; margin-bottom:15px;">Marca: ${prod.marca}</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div class="tag-stock ${claseCss}">${prod.stock}</div>
                <button onclick='agregarAlCarrito(${JSON.stringify(prod)})' 
                        style="background:none; border:1px solid var(--iron); color:var(--accent); cursor:pointer; padding:5px 10px; font-family:var(--mono); font-size:0.7rem;">
                        + CARRITO
                </button>
            </div>
        `;
        contenedor.appendChild(card);
      });
    }
  } catch (e) {
    if (contenedor) contenedor.innerHTML = "<p>Error al cargar el catálogo.</p>";
  }
}

// --- 3. LÓGICA DEL CARRITO ---
function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push(producto);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarInterfazCarrito();
}

function actualizarInterfazCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const btnFloat = document.getElementById("cart-float");
  const countSpan = document.getElementById("cart-count");

  if (btnFloat && countSpan) {
    if (carrito.length > 0) {
      btnFloat.classList.remove("cart-hidden");
      countSpan.innerText = carrito.length;
    } else {
      btnFloat.classList.add("cart-hidden");
    }
  }
}

function finalizarPedido() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (carrito.length === 0) return;

  let mensaje = "Hola Gemini Cooling, consulto stock por:%0A";
  carrito.forEach((item) => {
    mensaje += `- ${item.nombre} (ID: ${item.id})%0A`;
  });

  const nroTelefono = "54911XXXXXXXX"; // Poné tu número real acá
  window.open(`https://wa.me/${nroTelefono}?text=${mensaje}`, "_blank");

  localStorage.removeItem("carrito");
  actualizarInterfazCarrito();
}

function vaciarCarrito() {
  if (confirm("¿Querés vaciar la lista de pedido?")) {
    localStorage.removeItem("carrito");
    actualizarInterfazCarrito();
  }
}

// --- 4. MENÚ MOBILE ---
const menuBtn = document.getElementById("mobile-menu");
const navList = document.getElementById("nav-list");

if (menuBtn && navList) {
  menuBtn.addEventListener("click", () => {
    navList.classList.toggle("active");
    menuBtn.classList.toggle("open");
  });

  navList.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navList.classList.remove("active");
      menuBtn.classList.remove("open");
    });
  });
}

// --- 5. DISPARADOR DE INICIO (DETECTAR PÁGINA) ---
document.addEventListener("DOMContentLoaded", () => {
  // Convertimos toda la URL a minúsculas y buscamos "catalogo"
  const urlActual = window.location.href.toLowerCase();
  const esPaginaCatalogo = urlActual.includes("catalogo");

  if (esPaginaCatalogo) {
    console.log("Detectado: Página de Catálogo. Cargando todo el stock.");
    cargar(); // Sin número = Carga todo
  } else {
    console.log("Detectado: Home. Cargando 6 destacados.");
    cargar(6); // Con número = Límite
  }

  actualizarInterfazCarrito();
});