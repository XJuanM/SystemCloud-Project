/* ============================================
   inventario.js
   Lógica funcional del panel de Inventario:
   - Alta, edición y eliminación de productos
   - Búsqueda en tiempo real
   - Estados de stock automáticos (En stock / Bajo / Agotado)
   - Alertas de stock generadas dinámicamente
   - Distribución por categoría
   - Persistencia en localStorage
   ============================================ */

(function () {
    'use strict';

    const STORAGE_KEY = 'sc_inventario_productos';
    const MOVEMENTS_KEY = 'sc_inventario_movimientos';
    const LOW_STOCK_THRESHOLD = 5;

    const ICONS_BY_CATEGORY = {
        'Equipamiento': 'fa-dumbbell',
        'Suplementos': 'fa-flask',
        'Merchandising': 'fa-shirt',
        'Limpieza e higiene': 'fa-spray-can-sparkles'
    };

    // Datos iniciales (solo se usan la primera vez, si no hay nada guardado)
    const DEFAULT_PRODUCTS = [
        { sku: 'SKU-1042', name: 'Mancuernas 10kg (par)', category: 'Equipamiento', stock: 18, price: 185000 },
        { sku: 'SKU-2071', name: 'Proteína Whey 2kg', category: 'Suplementos', stock: 4, price: 210000 },
        { sku: 'SKU-3305', name: 'Camiseta System Cloud M', category: 'Merchandising', stock: 0, price: 45000 },
        { sku: 'SKU-1587', name: 'Banda elástica resistencia alta', category: 'Equipamiento', stock: 32, price: 28000 },
        { sku: 'SKU-2089', name: 'Creatina monohidratada 300g', category: 'Suplementos', stock: 3, price: 95000 }
    ];

    let products = [];
    let editingSku = null; // sku del producto en edición, null si es "nuevo"

    // ---------- Referencias del DOM ----------

    const tableBody = document.getElementById('inventoryTableBody');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const alertsList = document.getElementById('alertsList');
    const categoryList = document.getElementById('categoryList');

    const statTotalProducts = document.getElementById('statTotalProducts');
    const statLowStock = document.getElementById('statLowStock');
    const statTotalValue = document.getElementById('statTotalValue');
    const statMovements = document.getElementById('statMovements');
    const headerSummary = document.getElementById('headerSummary');

    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const formError = document.getElementById('formError');

    const inputName = document.getElementById('inputName');
    const inputSku = document.getElementById('inputSku');
    const inputCategory = document.getElementById('inputCategory');
    const inputStock = document.getElementById('inputStock');
    const inputPrice = document.getElementById('inputPrice');

    const btnAddProduct = document.getElementById('btnAddProduct');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnSaveProduct = document.getElementById('btnSaveProduct');

    const toast = document.getElementById('toast');

    // ---------- Persistencia ----------

    function loadProducts() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                products = JSON.parse(raw);
                return;
            } catch (e) {
                products = [];
            }
        }
        products = DEFAULT_PRODUCTS.slice();
        saveProducts();
    }

    function saveProducts() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }

    function getMovements() {
        const today = new Date().toISOString().slice(0, 10);
        const raw = localStorage.getItem(MOVEMENTS_KEY);
        let data = raw ? JSON.parse(raw) : { date: today, count: 0 };

        if (data.date !== today) {
            data = { date: today, count: 0 };
        }
        return data;
    }

    function registerMovement() {
        const data = getMovements();
        data.count += 1;
        localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(data));
        return data.count;
    }

    // ---------- Utilidades ----------

    function formatCOP(value) {
        return '$' + Number(value).toLocaleString('es-CO');
    }

    function getStatus(stock) {
        if (stock <= 0) return { label: 'Agotado', className: 'badge-out' };
        if (stock < LOW_STOCK_THRESHOLD) return { label: 'Stock bajo', className: 'badge-low' };
        return { label: 'En stock', className: 'badge-ok' };
    }

    function getIcon(category) {
        return ICONS_BY_CATEGORY[category] || 'fa-box';
    }

    function showToast(message, icon) {
        toast.innerHTML = '<i class="fa-solid ' + (icon || 'fa-circle-check') + '"></i><span>' + message + '</span>';
        toast.classList.add('show');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () {
            toast.classList.remove('show');
        }, 2600);
    }

    // ---------- Render: tabla ----------

    function renderTable() {
        const query = (searchInput.value || '').trim().toLowerCase();

        const filtered = products.filter(function (p) {
            return p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
        });

        tableBody.innerHTML = '';

        if (filtered.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        filtered.forEach(function (p) {
            const status = getStatus(p.stock);
            const tr = document.createElement('tr');

            tr.innerHTML =
                '<td>' +
                    '<div class="product-cell">' +
                        '<div class="product-icon"><i class="fa-solid ' + getIcon(p.category) + '"></i></div>' +
                        '<div>' +
                            '<span class="product-name">' + escapeHTML(p.name) + '</span>' +
                            '<span class="product-sku">' + escapeHTML(p.sku) + '</span>' +
                        '</div>' +
                    '</div>' +
                '</td>' +
                '<td>' + escapeHTML(p.category) + '</td>' +
                '<td><span class="stock-qty">' + p.stock + '</span><span class="stock-unit">unid.</span></td>' +
                '<td>' + formatCOP(p.price) + '</td>' +
                '<td><span class="badge ' + status.className + '">' + status.label + '</span></td>' +
                '<td>' +
                    '<div class="row-actions">' +
                        '<button class="btn-edit" title="Editar" data-sku="' + escapeHTML(p.sku) + '"><i class="fa-solid fa-pen"></i></button>' +
                        '<button class="btn-delete" title="Eliminar" data-sku="' + escapeHTML(p.sku) + '"><i class="fa-solid fa-trash"></i></button>' +
                    '</div>' +
                '</td>';

            tableBody.appendChild(tr);
        });

        // Enlazar acciones de cada fila
        tableBody.querySelectorAll('.btn-edit').forEach(function (btn) {
            btn.addEventListener('click', function () {
                openModal(btn.getAttribute('data-sku'));
            });
        });

        tableBody.querySelectorAll('.btn-delete').forEach(function (btn) {
            btn.addEventListener('click', function () {
                deleteProduct(btn.getAttribute('data-sku'));
            });
        });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- Render: estadísticas del encabezado ----------

    function renderStats() {
        const total = products.length;
        const lowOrOut = products.filter(function (p) { return p.stock < LOW_STOCK_THRESHOLD; }).length;
        const outOfStock = products.filter(function (p) { return p.stock <= 0; }).length;
        const totalValue = products.reduce(function (sum, p) { return sum + (p.stock * p.price); }, 0);

        statTotalProducts.textContent = total;
        statLowStock.textContent = lowOrOut;
        statTotalValue.textContent = formatValueShort(totalValue);
        statMovements.textContent = getMovements().count;

        headerSummary.textContent =
            'Tienes ' + total + ' producto' + (total === 1 ? '' : 's') + ' registrado' + (total === 1 ? '' : 's') + ', ' +
            lowOrOut + ' con stock bajo' +
            (outOfStock > 0 ? ' y ' + outOfStock + ' agotado' + (outOfStock === 1 ? '' : 's') + ' que necesita' + (outOfStock === 1 ? '' : 'n') + ' reposición.' : '.');
    }

    function formatValueShort(value) {
        if (value >= 1000000) return '$' + (value / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (value >= 1000) return '$' + (value / 1000).toFixed(1).replace('.0', '') + 'K';
        return '$' + value;
    }

    // ---------- Render: alertas de stock ----------

    function renderAlerts() {
        const alerts = products
            .filter(function (p) { return p.stock < LOW_STOCK_THRESHOLD; })
            .sort(function (a, b) { return a.stock - b.stock; });

        alertsList.innerHTML = '';

        if (alerts.length === 0) {
            alertsList.innerHTML = '<p class="empty-state">Sin alertas de stock por ahora.</p>';
            return;
        }

        alerts.forEach(function (p) {
            const isOut = p.stock <= 0;
            const div = document.createElement('div');
            div.className = 'alert-card';
            div.innerHTML =
                '<div class="alert-icon ' + (isOut ? 'danger' : 'warn') + '">' +
                    '<i class="fa-solid ' + (isOut ? 'fa-circle-exclamation' : 'fa-triangle-exclamation') + '"></i>' +
                '</div>' +
                '<div>' +
                    '<h4>' + escapeHTML(p.name) + '</h4>' +
                    '<span>' + (isOut ? 'Agotado — reponer cuanto antes' : 'Quedan ' + p.stock + ' unidades') + '</span>' +
                '</div>';
            alertsList.appendChild(div);
        });
    }

    // ---------- Render: distribución por categoría ----------

    function renderCategoryDistribution() {
        const totals = {};
        let grandTotal = 0;

        products.forEach(function (p) {
            totals[p.category] = (totals[p.category] || 0) + p.stock;
            grandTotal += p.stock;
        });

        categoryList.innerHTML = '';

        const categories = Object.keys(totals);

        if (categories.length === 0 || grandTotal === 0) {
            categoryList.innerHTML = '<p class="empty-state">Aún no hay stock registrado.</p>';
            return;
        }

        categories.forEach(function (cat) {
            const pct = Math.round((totals[cat] / grandTotal) * 100);
            const row = document.createElement('div');
            row.className = 'category-row';
            row.innerHTML =
                '<span>' + escapeHTML(cat) + '</span>' +
                '<div class="progress"><div style="width:' + pct + '%;"></div></div>' +
                '<span>' + pct + '%</span>';
            categoryList.appendChild(row);
        });
    }

    // ---------- Render general ----------

    function renderAll() {
        renderTable();
        renderStats();
        renderAlerts();
        renderCategoryDistribution();
    }

    // ---------- Modal: alta / edición ----------

    function openModal(sku) {
        formError.textContent = '';

        if (sku) {
            const p = products.find(function (item) { return item.sku === sku; });
            if (!p) return;

            editingSku = sku;
            modalTitle.textContent = 'Editar producto';
            btnSaveProduct.textContent = 'Guardar cambios';

            inputName.value = p.name;
            inputSku.value = p.sku;
            inputSku.disabled = true;
            inputCategory.value = p.category;
            inputStock.value = p.stock;
            inputPrice.value = p.price;
        } else {
            editingSku = null;
            modalTitle.textContent = 'Nuevo producto';
            btnSaveProduct.textContent = 'Guardar producto';

            inputName.value = '';
            inputSku.value = '';
            inputSku.disabled = false;
            inputCategory.value = 'Equipamiento';
            inputStock.value = '';
            inputPrice.value = '';
        }

        modalOverlay.classList.add('active');
        inputName.focus();
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        editingSku = null;
    }

    function saveProductFromForm() {
        const name = inputName.value.trim();
        const sku = inputSku.value.trim();
        const category = inputCategory.value;
        const stock = parseInt(inputStock.value, 10);
        const price = parseFloat(inputPrice.value);

        if (!name || !sku) {
            formError.textContent = 'El nombre y el SKU son obligatorios.';
            return;
        }
        if (isNaN(stock) || stock < 0) {
            formError.textContent = 'Ingresa una cantidad de stock válida.';
            return;
        }
        if (isNaN(price) || price < 0) {
            formError.textContent = 'Ingresa un precio válido.';
            return;
        }

        if (editingSku) {
            const p = products.find(function (item) { return item.sku === editingSku; });
            p.name = name;
            p.category = category;
            p.stock = stock;
            p.price = price;
            showToast('Producto actualizado', 'fa-pen');
        } else {
            const exists = products.some(function (item) { return item.sku.toLowerCase() === sku.toLowerCase(); });
            if (exists) {
                formError.textContent = 'Ya existe un producto con ese SKU.';
                return;
            }
            products.push({ sku: sku, name: name, category: category, stock: stock, price: price });
            showToast('Producto agregado', 'fa-circle-check');
        }

        saveProducts();
        registerMovement();
        closeModal();
        renderAll();
    }

    function deleteProduct(sku) {
        const p = products.find(function (item) { return item.sku === sku; });
        if (!p) return;

        const confirmed = window.confirm('¿Eliminar "' + p.name + '" del inventario?');
        if (!confirmed) return;

        products = products.filter(function (item) { return item.sku !== sku; });
        saveProducts();
        registerMovement();
        showToast('Producto eliminado', 'fa-trash');
        renderAll();
    }

    // ---------- Eventos ----------

    btnAddProduct.addEventListener('click', function () { openModal(null); });
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    btnSaveProduct.addEventListener('click', saveProductFromForm);

    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
    });

    searchInput.addEventListener('input', renderTable);

    // ---------- Inicio ----------

    loadProducts();
    renderAll();

})();
