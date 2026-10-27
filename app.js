const products = [
  {
    id: "stretch-film",
    index: "01",
    name: "Stretch film industrial",
    category: "empaque",
    categoryLabel: "Empaque y protección",
    description: "Película de alta resistencia que protege la mercancía y brinda estabilidad y seguridad a la carga.",
    image: "assets/stretch-film.jpg",
    specs: [
      ["Calibre", "50"],
      ["Altura", "18 pulgadas"],
      ["Largos", "800, 1,000 y 1,200 pies"]
    ]
  },
  {
    id: "gabacha-industrial",
    index: "02",
    name: "Gabacha industrial",
    category: "proteccion",
    categoryLabel: "Protección para la jornada",
    description: "Gabacha de lona gruesa con tirantes resistentes, bolsillo frontal y ajuste de amarre.",
    image: "assets/gabacha-industrial.jpg",
    specs: [
      ["Material", "Lona gruesa"],
      ["Ajuste", "Tiras de amarre"],
      ["Detalle", "Bolsillo frontal"]
    ]
  },
  {
    id: "locker-metalico",
    index: "03",
    name: "Locker metálico",
    category: "organizacion",
    categoryLabel: "Organización y seguridad",
    description: "Gabinetes metálicos resistentes y funcionales para organizar el espacio de trabajo.",
    image: "assets/locker-metalico.jpg",
    specs: [
      ["Configuraciones", "2, 3, 4 y 5 puertas"],
      ["Alto", "1.80 m"],
      ["Ancho / fondo", "0.28 m / 0.38 m"]
    ]
  },
  {
    id: "guante-carnaza",
    index: "04",
    name: "Guante de carnaza",
    category: "proteccion",
    categoryLabel: "Protección industrial",
    description: "Guante reforzado para trabajos de alto esfuerzo en industria, construcción y talleres.",
    image: "assets/guante-carnaza.jpg",
    specs: [
      ["Material", "Carnaza con costuras reforzadas"],
      ["Tallas", "XS, S, M, L, XL y LL"],
      ["Uso", "Industria, construcción y talleres"]
    ]
  },
  {
    id: "fleje-polipropileno",
    index: "05",
    name: "Fleje de polipropileno",
    category: "empaque",
    categoryLabel: "Empaque y paletizado",
    description: "Fleje ligero, resistente y fácil de manejar, disponible en cuatro colores para identificar cargas.",
    image: "assets/fleje-polipropileno.jpg",
    specs: [
      ["Colores", "Azul, blanco, negro y amarillo"],
      ["Ancho / espesor", "1/2 pulg (12.7 mm) / 0.8 mm"],
      ["Longitud", "1,000 m"]
    ]
  }
];

const state = {
  filter: "todos",
  query: "",
  selected: new Set(),
  activeProduct: null
};

const grid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const search = document.querySelector("#product-search");
const dialog = document.querySelector("#product-dialog");
const quoteCount = document.querySelector("#quote-count");
const quoteItems = document.querySelector("#quote-items");
const toast = document.querySelector("#toast");

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function renderProducts() {
  const visible = products.filter((product) => {
    const matchesFilter = state.filter === "todos" || product.category === state.filter;
    const haystack = normalize(`${product.name} ${product.categoryLabel} ${product.description}`);
    return matchesFilter && haystack.includes(normalize(state.query));
  });

  grid.innerHTML = visible.map((product) => `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-tag">${product.categoryLabel}</span>
        <span class="product-index">${product.index}</span>
      </div>
      <div class="product-body">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-actions">
          <button class="details-button" type="button" data-details="${product.id}">Ver detalles ↗</button>
          <button class="add-button ${state.selected.has(product.id) ? "is-added" : ""}" type="button" data-add="${product.id}" aria-label="${state.selected.has(product.id) ? "Quitar" : "Agregar"} ${product.name} ${state.selected.has(product.id) ? "de" : "a"} la cotización">${state.selected.has(product.id) ? "✓" : "+"}</button>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.hidden = visible.length > 0;
}

function renderQuote() {
  const selectedProducts = products.filter((product) => state.selected.has(product.id));
  quoteCount.textContent = selectedProducts.length;

  if (!selectedProducts.length) {
    quoteItems.innerHTML = "<p>Agrega productos desde el catálogo para personalizar tu solicitud.</p>";
    return;
  }

  quoteItems.innerHTML = `<ul>${selectedProducts.map((product) => `<li>${product.name}</li>`).join("")}</ul>`;
}

function toggleProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  if (state.selected.has(id)) {
    state.selected.delete(id);
    showToast(`${product.name} se quitó de la solicitud.`);
  } else {
    state.selected.add(id);
    showToast(`${product.name} se agregó a la solicitud.`);
  }

  renderProducts();
  renderQuote();
  syncDialogButton();
}

function openDialog(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  state.activeProduct = product;
  document.querySelector("#dialog-category").textContent = product.categoryLabel;
  document.querySelector("#dialog-title").textContent = product.name;
  document.querySelector("#dialog-description").textContent = product.description;
  const image = document.querySelector("#dialog-image");
  image.src = product.image;
  image.alt = `Ficha completa de ${product.name}`;
  document.querySelector("#dialog-specs").innerHTML = product.specs.map(([label, value]) => `
    <div class="spec-row"><span>${label}</span><strong>${value}</strong></div>
  `).join("");
  syncDialogButton();
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function syncDialogButton() {
  const button = document.querySelector("#dialog-add");
  if (!state.activeProduct) return;
  const isAdded = state.selected.has(state.activeProduct.id);
  button.textContent = isAdded ? "Quitar de cotización" : "Agregar a cotización";
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2300);
}

function buildWhatsAppMessage(source) {
  const selected = products.filter((product) => state.selected.has(product.id));
  const active = source === "dialog" && state.activeProduct ? [state.activeProduct] : [];
  const items = selected.length ? selected : active;
  const lines = ["Hola, me gustaría solicitar una cotización de Suministros Clave."];

  if (items.length) {
    lines.push("", "Productos de interés:");
    items.forEach((product) => lines.push(`• ${product.name}`));
  } else {
    lines.push("", "Quisiera recibir información sobre su catálogo de insumos industriales y EPP.");
  }

  lines.push("", "¿Podrían apoyarme con disponibilidad y precio? Gracias.");
  return lines.join("\n");
}

function openWhatsApp(source) {
  const message = encodeURIComponent(buildWhatsAppMessage(source));
  window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
}

grid.addEventListener("click", (event) => {
  const details = event.target.closest("[data-details]");
  const add = event.target.closest("[data-add]");
  if (details) openDialog(details.dataset.details);
  if (add) toggleProduct(add.dataset.add);
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts();
  });
});

search.addEventListener("input", () => {
  state.query = search.value.trim();
  renderProducts();
});

document.querySelector("#dialog-add").addEventListener("click", () => {
  if (state.activeProduct) toggleProduct(state.activeProduct.id);
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

document.querySelectorAll(".js-whatsapp").forEach((button) => {
  button.addEventListener("click", () => openWhatsApp(button.dataset.source));
});

const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => header.classList.toggle("is-scrolled", window.scrollY > 20), { passive: true });

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
menuButton.addEventListener("click", () => {
  const open = !nav.classList.contains("is-open");
  nav.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
renderQuote();
