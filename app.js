const contenedor = document.getElementById("catalogo-grid");

async function cargar() {
  try {
    const res = await fetch("productos.json");
    const data = await res.json();

    contenedor.innerHTML = "";
    data.forEach((prod) => {
      const card = document.createElement("div");
      card.className = "producto-card";

      // Crea la clase para el CSS (disponible, consultar, sin-stock)
      const claseCss = prod.stock.toLowerCase().replace(" ", "-");

      card.innerHTML = `
                <div style="color:var(--accent); font-size:0.7rem; margin-bottom:5px;">SKU: ${prod.id}</div>
                <h3>${prod.nombre}</h3>
                <p style="color:#666; font-size:0.8rem; margin-bottom:15px;">Marca: ${prod.marca}</p>
                <div class="tag-stock ${claseCss}">${prod.stock}</div>
            `;
      contenedor.appendChild(card);
    });
  } catch (e) {
    contenedor.innerHTML = "<p>Error de conexión.</p>";
  }
}

document.addEventListener("DOMContentLoaded", cargar);
