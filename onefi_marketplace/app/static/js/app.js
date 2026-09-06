const state = {
    category: "All",
    search: "",
    products: [],
    currentProduct: null,
    selectedVariant: null,
    selectedEmi: null,
};

const $ = (selector) => document.querySelector(selector);

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

function showShop() {
    $("#marketplace-view").classList.add("hidden");
    $("#shop-view").classList.remove("hidden");
    document.querySelectorAll(".shop-tab").forEach(btn => btn.classList.remove("active"));
    document.querySelector('[data-view="top-brands"]').classList.add("active");
}

function showPlaceholder(type) {
    $("#marketplace-view").classList.add("hidden");
    $("#shop-view").classList.remove("hidden");

    document.querySelectorAll(".shop-tab").forEach(btn => btn.classList.remove("active"));
    const button = document.querySelector(`[data-view="${type}"]`);
    if (button) button.classList.add("active");

    $("#placeholder-title").textContent =
        type === "nearby" ? "Nearby Stores" : "Top Brands";
}

async function showMarketplace() {
    $("#shop-view").classList.add("hidden");
    $("#marketplace-view").classList.remove("hidden");

    document.querySelectorAll(".shop-tab").forEach(btn => btn.classList.remove("active"));
    document.querySelector('[data-view="marketplace"]').classList.add("active");

    if (!state.products.length) {
        await loadProducts();
    }
}

function setLoading(message = "Loading marketplace...") {
    $("#products-state").innerHTML = `
        <div class="state">
            <div>
                <div class="spinner"></div>
                <strong>${message}</strong>
            </div>
        </div>
    `;
}

function setError(message) {
    $("#products-state").innerHTML = `
        <div class="state">
            <div>
                <div style="font-size:28px;margin-bottom:8px;">!</div>
                <strong>Unable to load products</strong>
                <p style="color:#6f747b;font-size:13px;">${message}</p>
                <button class="card-button" style="max-width:150px;" onclick="loadProducts()">Retry</button>
            </div>
        </div>
    `;
}

async function loadProducts() {
    setLoading();
    $("#product-grid").innerHTML = "";

    try {
        const params = new URLSearchParams();
        if (state.category !== "All") params.set("category", state.category);
        if (state.search) params.set("search", state.search);

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();
        state.products = data.products || [];

        $("#products-state").innerHTML = "";
        renderProducts();
    } catch (error) {
        setError("Please check your connection and try again.");
    }
}

function renderProducts() {
    if (!state.products.length) {
        $("#products-state").innerHTML = `
            <div class="state">
                <div>
                    <strong>No products found</strong>
                    <p style="color:#6f747b;font-size:13px;">Try another search or category.</p>
                </div>
            </div>
        `;
        return;
    }

    $("#product-grid").innerHTML = state.products.map(product => {
        const startingPrice = Math.min(...product.variants.map(v => v.price));
        const shortestPlan = product.emi_plans[0];
        const startingEmi = Math.round(startingPrice / shortestPlan.months);

        return `
            <article class="product-card">
                <div class="product-image-wrap">
                    <img class="product-image"
                         src="${product.image}"
                         alt="${product.name}"
                         loading="lazy"
                         onerror="this.src='https://placehold.co/900x700/f4f5f6/17191c?text=1Fi+Marketplace'">
                    <span class="badge">${product.badge}</span>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand} · ${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="rating">★ ${product.rating} · ${product.reviews.toLocaleString("en-IN")} reviews</div>
                    <div class="price-row">
                        <div class="price">${money(startingPrice)}</div>
                        <div class="emi-from">EMI from<br>${money(startingEmi)}/mo</div>
                    </div>
                    <button class="card-button" onclick="openProduct('${product.id}')">View details</button>
                </div>
            </article>
        `;
    }).join("");
}

async function openProduct(productId) {
    $("#product-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    $("#modal-content").innerHTML = `
        <div class="state" style="margin:0;border:0;">
            <div><div class="spinner"></div><strong>Loading product...</strong></div>
        </div>
    `;

    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error("Product request failed");

        const data = await response.json();
        state.currentProduct = data.product;
        state.selectedVariant = state.currentProduct.variants[0];
        state.selectedEmi = null;

        await renderProductDetails();
    } catch (error) {
        $("#modal-content").innerHTML = `
            <div class="state" style="margin:0;border:0;">
                <div><strong>Could not load this product.</strong></div>
            </div>
        `;
    }
}

async function renderProductDetails() {
    const p = state.currentProduct;
    const v = state.selectedVariant;

    $("#modal-content").innerHTML = `
        <div class="detail-layout">
            <div class="detail-image">
                <img src="${p.image}" alt="${p.name}"
                     onerror="this.src='https://placehold.co/900x900/f4f5f6/17191c?text=1Fi'">
            </div>

            <div class="detail-body">
                <div class="product-brand">${p.brand} · ${p.category}</div>
                <h2 id="modal-title">${p.name}</h2>
                <div class="rating">★ ${p.rating} · ${p.reviews.toLocaleString("en-IN")} reviews</div>
                <p class="detail-description">${p.description}</p>

                <div class="detail-price">${money(v.price)}</div>

                <div class="section-label">Choose variant</div>
                <div class="variant-list">
                    ${p.variants.map(variant => `
                        <button
                            class="variant-button ${variant.id === v.id ? "selected" : ""}"
                            onclick="selectVariant('${variant.id}')">
                            ${variant.name} · ${variant.color}
                        </button>
                    `).join("")}
                </div>

                <div class="section-label">Available EMI plans</div>
                <div id="emi-container">
                    <div class="spinner" style="margin:15px auto;"></div>
                </div>

                <ul class="features">
                    ${p.features.map(feature => `<li>✓ ${feature}</li>`).join("")}
                </ul>

                <button id="proceed-button" class="proceed-button" disabled onclick="proceed()">
                    Select an EMI plan
                </button>
            </div>
        </div>
    `;

    await loadEmiPlans();
}

async function selectVariant(variantId) {
    state.selectedVariant = state.currentProduct.variants.find(v => v.id === variantId);
    state.selectedEmi = null;
    await renderProductDetails();
}

async function loadEmiPlans() {
    const p = state.currentProduct;
    const v = state.selectedVariant;

    try {
        const response = await fetch(`/api/products/${p.id}/emi?variant_id=${encodeURIComponent(v.id)}`);
        if (!response.ok) throw new Error("EMI request failed");

        const data = await response.json();

        $("#emi-container").innerHTML = `
            <div class="emi-list">
                ${data.plans.map(plan => `
                    <label class="emi-option" id="emi-${plan.id}">
                        <div class="emi-main">
                            <input type="radio" name="emi-plan" value="${plan.id}"
                                   onchange="selectEmi('${plan.id}')">
                            <div>
                                <div class="emi-monthly">${money(plan.monthly_amount)}/month</div>
                                <div class="emi-meta">${plan.months} months · ${plan.label}</div>
                            </div>
                        </div>
                        <div class="emi-meta">${plan.processing_fee ? `₹${plan.processing_fee} fee` : "No extra fee"}</div>
                    </label>
                `).join("")}
            </div>
        `;
    } catch (error) {
        $("#emi-container").innerHTML = `
            <div style="font-size:12px;color:#b33;">EMI plans could not be loaded.</div>
        `;
    }
}

function selectEmi(emiId) {
    const p = state.currentProduct;
    state.selectedEmi = p.emi_plans.find(plan => plan.id === emiId);

    document.querySelectorAll(".emi-option").forEach(el => el.classList.remove("selected"));
    const selected = document.querySelector(`#emi-${emiId}`);
    if (selected) selected.classList.add("selected");

    const button = $("#proceed-button");
    button.disabled = false;
    button.textContent = "Proceed with selected plan";
}

function proceed() {
    if (!state.selectedVariant || !state.selectedEmi) return;

    const p = state.currentProduct;
    showToast(
        `Selected ${p.name} · ${state.selectedVariant.name} · ${state.selectedEmi.months}-month EMI`
    );
}

function closeProduct() {
    $("#product-modal").classList.add("hidden");
    document.body.style.overflow = "";
}

let searchTimer;
$("#search-input").addEventListener("input", (event) => {
    state.search = event.target.value.trim();

    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadProducts(), 300);
});

document.querySelectorAll(".filter-chip").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-chip").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        state.category = button.dataset.category;
        loadProducts();
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProduct();
});

function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 3000);
}
