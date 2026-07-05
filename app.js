// --- 1. CONFIGURACIÓN INICIAL ---
const contenedor = document.getElementById("catalogo-grid");

// --- 2. CARGA DE PRODUCTOS (CON LÍMITE OPCIONAL) ---
async function cargar(limite = null) {
  try {
    const res = await fetch("productos.json?v=1.1");
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

    <p style="color:#666; font-size:0.8rem; margin-bottom:8px;">
        Marca: ${prod.marca}
    </p>

   <p style="color:var(--tecnico); font-size:1rem; font-weight:bold; margin-bottom:15px;">
    ${prod.precio ? "$" + prod.precio.toLocaleString("es-AR") : "Consultar precio"}
   </p>

    <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="tag-stock ${claseCss}">${prod.stock}</div>
${prod.stock === "sin-stock"
  ? `
    <button disabled
      style="background:#222; border:1px solid #444; color:#666; cursor:not-allowed; padding:5px 10px; font-family:var(--mono); font-size:0.7rem;">
      SIN STOCK
    </button>
  `
  : `
    <button onclick='agregarAlCarrito(${JSON.stringify(prod)})'
      style="background:none; border:1px solid var(--iron); color:var(--accent); cursor:pointer; padding:5px 10px; font-family:var(--mono); font-size:0.7rem;">
      + CARRITO
    </button>
  `
}
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

  if (producto.stock === "sin-stock") {
    alert("Producto sin stock.");
    return;
  }

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  carrito.push(producto);

  localStorage.setItem("carrito", JSON.stringify(carrito));

  actualizarInterfazCarrito();
  
}

function agregarKitAlCarrito(kit) {

  const btnExtra = document.getElementById(`extra-${kit.id}`);

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  carrito.push(kit);

  localStorage.setItem("carrito", JSON.stringify(carrito));

  // Al agregar el kit, habilitamos el botón de extras
  if (btnExtra) {
    btnExtra.classList.remove("extra-disabled");
  }

  actualizarInterfazCarrito();
}

function toggleMaterialExtra(idKit) {

    const btn = document.getElementById(`extra-${idKit}`);

    if (!btn) return;

    if (btn.classList.contains("extra-disabled"))
        return;

    btn.classList.toggle("extra-activo");

}

function actualizarInterfazCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const hayKit = carrito.some(item => item.id.startsWith("KIT-"));
  const btnFloat = document.getElementById("cart-float");
  const countSpan = document.getElementById("cart-count");

  if (!btnFloat || !countSpan) return;

  countSpan.innerText = carrito.length;

  if (carrito.length > 0) {
    btnFloat.classList.remove("cart-hidden");
  } else {
    btnFloat.classList.add("cart-hidden");
  }
  document.querySelectorAll(".btn-kit-extra").forEach(btn => {

    const idKit = btn.id.replace("extra-", "");

    const existe = carrito.some(item => item.id === idKit);

    if (existe) {

        btn.classList.remove("extra-disabled");

    } else {

        btn.classList.add("extra-disabled");
        btn.classList.remove("extra-activo");

    }

  });
}

function finalizarPedido() {
  console.log("ENTRÉ A FINALIZAR");
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  console.log(carrito);

  if (carrito.length === 0) return;

  let mensaje = "Hola Gemini Cooling, consulto stock por:%0A";
  carrito.forEach((item) => {

  const titulo = item.nombre || item.titulo;

  mensaje += `- ${titulo} (ID: ${item.id})%0A`;

  if (item.extraMaterial) {
    mensaje += `  • Solicito materiales adicionales para esta instalación.%0A`;
  }

});
  const hayExtras = document.querySelector(".btn-kit-extra.extra-activo");

if (hayExtras) {
  mensaje += "%0A";
  mensaje += "• Además necesito metros/materiales adicionales para esta instalación.%0A";
}
  const nroTelefono = "5491132820735"; // Poné tu número real acá
  window.open(`https://wa.me/${nroTelefono}?text=${mensaje}`, "_blank");

  localStorage.removeItem("carrito");
  actualizarInterfazCarrito();
}

function vaciarCarrito() {
  console.log("ENTRÉ A VACIAR");

  if (confirm("¿Querés vaciar la lista de pedido?")) {
    localStorage.removeItem("carrito");

    console.log(localStorage.getItem("carrito"));

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

  cargarKits();          // ← ESTA LÍNEA FALTA

  actualizarInterfazCarrito();
});

async function cargarKits() {

  const contenedor = document.getElementById("kits-grid");

  if (!contenedor) return;

  try {

    const [resProductos, resKits] = await Promise.all([
      fetch("productos.json?v=1.1"),
      fetch("kits.json?v=1.1")
    ]);

    const productos = await resProductos.json();
    const kits = await resKits.json();

    contenedor.innerHTML = "";

    kits.forEach((kit) => {

      const descripcion = kit.componentes
        .map(id => {

          const prod = productos.find(p => p.id === id);

          return prod ? `<li>${prod.nombre}</li>` : "";

        })
        .join("");

      const card = document.createElement("div");
      card.className = "kit-card";

      card.innerHTML = `
    <h3>${kit.titulo}</h3>

    <ul>
      ${descripcion}
    </ul>

    <div class="kit-precio">
      ${kit.precio ? "$" + kit.precio.toLocaleString("es-AR") : "Consultar"}
    </div>

    <button
      onclick='agregarKitAlCarrito(${JSON.stringify(kit)})'
      class="btn-kit-carrito">
      + CARRITO
    </button>

    <button
      id="extra-${kit.id}"
      onclick="toggleMaterialExtra('${kit.id}')"
      class="btn-kit-extra extra-disabled">
      NECESITO METROS ADICIONALES
    </button>

`;

      contenedor.appendChild(card);

    });

  }
  catch(e){

    contenedor.innerHTML = "<p>Error al cargar kits.</p>";

    console.error(e);

  }

}