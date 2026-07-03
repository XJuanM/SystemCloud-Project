const STORAGE_KEY = "planAlimenticio_v1";

const planBase = {
    cliente: "Camila",
    objetivo: "Definición muscular",
    kcalMeta: 2100,
    macros: {
        protein: { goal: 150 },
        carbs:   { goal: 220 },
        fat:     { goal: 60  }
    },
    waterGoal: 8,
    comidas: {
        desayuno: {
            nombre: "Desayuno",
            icono: "fa-mug-hot",
            alimentos: [
                { id: "d1", nombre: "Avena con leche descremada", cantidad: "60 g", kcal: 230, protein: 9,  carbs: 38, fat: 4,  obs: "Puedes agregar canela al gusto", eaten: false },
                { id: "d2", nombre: "Claras de huevo revueltas",   cantidad: "4 unid.", kcal: 100, protein: 20, carbs: 1,  fat: 1,  obs: "", eaten: false },
                { id: "d3", nombre: "Banano",                      cantidad: "1 unid.", kcal: 105, protein: 1,  carbs: 27, fat: 0,  obs: "", eaten: false }
            ]
        },
        almuerzo: {
            nombre: "Almuerzo",
            icono: "fa-bowl-food",
            alimentos: [
                { id: "a1", nombre: "Pechuga de pollo a la plancha", cantidad: "150 g", kcal: 250, protein: 46, carbs: 0,  fat: 6,  obs: "Sin piel, cocinada con poco aceite", eaten: false },
                { id: "a2", nombre: "Arroz integral",                cantidad: "100 g", kcal: 130, protein: 3,  carbs: 27, fat: 1,  obs: "", eaten: false },
                { id: "a3", nombre: "Ensalada verde mixta",          cantidad: "1 taza", kcal: 45,  protein: 2,  carbs: 8,  fat: 0,  obs: "Aderezo: limón y sal", eaten: false },
                { id: "a4", nombre: "Aguacate",                      cantidad: "1/4 unid.", kcal: 80, protein: 1, carbs: 4,  fat: 7,  obs: "", eaten: false }
            ]
        },
        cena: {
            nombre: "Cena",
            icono: "fa-utensils",
            alimentos: [
                { id: "c1", nombre: "Salmón al horno",   cantidad: "120 g", kcal: 230, protein: 25, carbs: 0,  fat: 14, obs: "", eaten: false },
                { id: "c2", nombre: "Brócoli al vapor",  cantidad: "1 taza", kcal: 55,  protein: 4,  carbs: 11, fat: 0,  obs: "", eaten: false },
                { id: "c3", nombre: "Batata asada",      cantidad: "100 g", kcal: 90,  protein: 2,  carbs: 21, fat: 0,  obs: "", eaten: false }
            ]
        },
        snacks: {
            nombre: "Snacks",
            icono: "fa-apple-whole",
            alimentos: [
                { id: "s1", nombre: "Yogur griego natural", cantidad: "170 g", kcal: 100, protein: 17, carbs: 6,  fat: 0, obs: "", eaten: false },
                { id: "s2", nombre: "Almendras",            cantidad: "20 g",  kcal: 115, protein: 4,  carbs: 4,  fat: 10, obs: "Porción medida, no al gusto", eaten: false },
                { id: "s3", nombre: "Manzana verde",        cantidad: "1 unid.", kcal: 80, protein: 0, carbs: 21, fat: 0, obs: "", eaten: false }
            ]
        }
    }
};

/* ---- Estado en memoria (se hidrata desde localStorage si existe) ---- */
let plan = loadState();
let mealActual = "desayuno";
let waterCount = loadWater();

/* ============================================================
   PERSISTENCIA
   ============================================================ */

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return structuredClone(planBase);
        const parsed = JSON.parse(saved);
        // Fusiona por si el plan base cambió (nuevos alimentos, metas, etc.)
        return parsed.comidas ? parsed : structuredClone(planBase);
    } catch (e) {
        return structuredClone(planBase);
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    localStorage.setItem(STORAGE_KEY + "_water", String(waterCount));
}

function loadWater() {
    const saved = localStorage.getItem(STORAGE_KEY + "_water");
    return saved ? parseInt(saved, 10) : 0;
}

function calcularTotales() {
    let kcal = 0, protein = 0, carbs = 0, fat = 0;
    Object.values(plan.comidas).forEach(comida => {
        comida.alimentos.forEach(a => {
            if (a.eaten) {
                kcal += a.kcal;
                protein += a.protein;
                carbs += a.carbs;
                fat += a.fat;
            }
        });
    });
    return { kcal, protein, carbs, fat };
}

function calcularKcalComida(comida) {
    return comida.alimentos.reduce((sum, a) => sum + a.kcal, 0);
}

function renderHero() {
    document.getElementById("clienteNombre").textContent = `Hola, ${plan.cliente || planBase.cliente}`;
    document.getElementById("objetivoText").textContent = planBase.objetivo;
    document.getElementById("metaText").textContent = `${planBase.kcalMeta} kcal`;
    document.getElementById("comidasText").textContent = Object.keys(plan.comidas).length;

    const totales = calcularTotales();

    const pct = Math.min(100, Math.round((totales.kcal / planBase.kcalMeta) * 100));
    const circle = document.getElementById("ringProgress");
    const radius = 86;
    const circunferencia = 2 * Math.PI * radius;
    circle.style.strokeDasharray = circunferencia;
    circle.style.strokeDashoffset = circunferencia - (pct / 100) * circunferencia;

    document.getElementById("ringKcal").textContent = totales.kcal;
    document.getElementById("ringKcalGoal").textContent = planBase.kcalMeta;

    setMacro("protein", totales.protein, planBase.macros.protein.goal);
    setMacro("carbs", totales.carbs, planBase.macros.carbs.goal);
    setMacro("fat", totales.fat, planBase.macros.fat.goal);

    renderAgua();
}

function setMacro(tipo, valor, meta) {
    document.getElementById(`${tipo}Val`).textContent = valor;
    document.getElementById(`${tipo}Goal`).textContent = meta;
    const pct = Math.min(100, Math.round((valor / meta) * 100));
    document.getElementById(`${tipo}Fill`).style.width = pct + "%";
}

function renderAgua() {
    const cont = document.getElementById("waterGlasses");
    cont.innerHTML = "";
    for (let i = 0; i < planBase.waterGoal; i++) {
        const glass = document.createElement("div");
        glass.className = "water-glass" + (i < waterCount ? " filled" : "");
        glass.addEventListener("click", () => toggleAgua(i));
        cont.appendChild(glass);
    }
    document.getElementById("waterCount").textContent = waterCount;
    document.getElementById("waterGoal").textContent = planBase.waterGoal;
}

function toggleAgua(index) {
    waterCount = (index + 1 === waterCount) ? index : index + 1;
    renderAgua();
    saveState();
    if (waterCount === planBase.waterGoal) {
        mostrarToast("¡Meta de hidratación alcanzada!");
    }
}

function renderMealSelector() {
    const cont = document.getElementById("mealSelector");
    cont.innerHTML = "";

    Object.entries(plan.comidas).forEach(([key, comida]) => {
        const total = comida.alimentos.length;
        const completados = comida.alimentos.filter(a => a.eaten).length;
        const kcalComida = calcularKcalComida(comida);

        const pill = document.createElement("div");
        pill.className = "meal-pill";
        if (key === mealActual) pill.classList.add("active");
        if (total > 0 && completados === total) pill.classList.add("complete");

        pill.innerHTML = `
            <i class="fa-solid ${comida.icono} pill-icon"></i>
            <span class="pill-name">${comida.nombre}</span>
            <span class="pill-kcal">${completados}/${total} · ${kcalComida} kcal</span>
        `;

        pill.addEventListener("click", () => {
            mealActual = key;
            renderMealSelector();
            renderMealPanel();
        });

        cont.appendChild(pill);
    });
}

function renderMealPanel() {
    const comida = plan.comidas[mealActual];
    document.getElementById("mealTitle").textContent = comida.nombre;

    const kcalComida = calcularKcalComida(comida);
    document.getElementById("mealCount").textContent = `${comida.alimentos.length} alimentos · ${kcalComida} kcal`;

    const lista = document.getElementById("foodList");
    lista.innerHTML = "";

    if (comida.alimentos.length === 0) {
        lista.innerHTML = `
            <div class="empty-meal">
                <i class="fa-solid fa-utensils"></i>
                <p>No hay alimentos asignados para esta comida.</p>
            </div>
        `;
        return;
    }

    comida.alimentos.forEach(alimento => {
        const card = document.createElement("div");
        card.className = "food-card" + (alimento.eaten ? " eaten" : "");

        card.innerHTML = `
            <div class="food-check" data-id="${alimento.id}">
                <i class="fa-solid fa-check"></i>
            </div>
            <div class="food-body">
                <h4>${alimento.nombre}</h4>
                <div class="food-meta">
                    <span><i class="fa-solid fa-scale-balanced"></i>${alimento.cantidad}</span>
                    <span><i class="fa-solid fa-drumstick-bite"></i>${alimento.protein}g prot.</span>
                    <span><i class="fa-solid fa-wheat-awn"></i>${alimento.carbs}g carbs</span>
                    <span><i class="fa-solid fa-droplet"></i>${alimento.fat}g grasa</span>
                </div>
                ${alimento.obs ? `<div class="food-obs">${alimento.obs}</div>` : ""}
            </div>
            <div class="food-kcal-tag">
                <b>${alimento.kcal}</b>
                <span>kcal</span>
            </div>
        `;

        card.querySelector(".food-check").addEventListener("click", () => toggleAlimento(alimento.id));

        lista.appendChild(card);
    });
}

function toggleAlimento(id) {
    const comida = plan.comidas[mealActual];
    const alimento = comida.alimentos.find(a => a.id === id);
    if (!alimento) return;

    alimento.eaten = !alimento.eaten;

    saveState();
    renderHero();
    renderMealSelector();
    renderMealPanel();

    if (alimento.eaten) {
        mostrarToast(`${alimento.nombre} registrado`);
    }

    const totales = calcularTotales();
    if (totales.kcal >= planBase.kcalMeta) {
        setTimeout(() => mostrarToast("¡Meta calórica del día alcanzada!"), 900);
    }
}


let toastTimeout = null;

function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    document.getElementById("toastMessage").textContent = mensaje;
    toast.classList.add("show");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}


function init() {
    renderHero();
    renderMealSelector();
    renderMealPanel();
}

document.addEventListener("DOMContentLoaded", init);
