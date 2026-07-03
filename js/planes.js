// ==========================================
// DATOS INICIALES (solo se usan si localStorage está vacío)
// ==========================================

let planes = [
    {
        id: 1,
        cliente: "Dilan Bohorquez",
        objetivo: "Ganancia muscular",
        nombre: "Plan hipercalórico",
        duracion: "8 semanas",
        tipoDieta: "Alta en proteína",
        caloriasObjetivo: 2800,
        observaciones: "",
        estado: "Activo",
        dias: {
            lunes: [], martes: [], miercoles: [], jueves: [],
            viernes: [], sabado: [], domingo: []
        }
    },
    {
        id: 2,
        cliente: "Juan Martinez",
        objetivo: "Pérdida de peso",
        nombre: "Plan hipocalórico",
        duracion: "4 semanas",
        tipoDieta: "Normal",
        caloriasObjetivo: 1800,
        observaciones: "",
        estado: "Activo",
        dias: {
            lunes: [], martes: [], miercoles: [], jueves: [],
            viernes: [], sabado: [], domingo: []
        }
    },
    {
        id: 3,
        cliente: "Julian Pinto",
        objetivo: "Mantenimiento",
        nombre: "",
        duracion: "4 semanas",
        tipoDieta: "Vegetariana",
        caloriasObjetivo: 2200,
        observaciones: "",
        estado: "Activo",
        dias: {
            lunes: [], martes: [], miercoles: [], jueves: [],
            viernes: [], sabado: [], domingo: []
        }
    },
    {
        id: 4,
        cliente: "Miguel Ortiz",
        objetivo: "Definición",
        nombre: "Plan definición",
        duracion: "4 semanas",
        tipoDieta: "Keto",
        caloriasObjetivo: 2000,
        observaciones: "",
        estado: "Activo",
        dias: {
            lunes: [], martes: [], miercoles: [], jueves: [],
            viernes: [], sabado: [], domingo: []
        }
    }
];

// Plan seleccionado actualmente en los modales de Ver/Editar
let planActual = null;

// Comida que se está editando (día + índice dentro del array del día)
let comidaEditando = null;

// Historial de acciones para la card "Actividades recientes"
let actividadesPlanes = [];

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

// ==========================================
// PERSISTENCIA (localStorage)
// ==========================================

function guardarPlanes() {
    localStorage.setItem("planes", JSON.stringify(planes));
}

function cargarPlanes() {
    const data = localStorage.getItem("planes");
    if (data) {
        planes = JSON.parse(data);
    }
}

function guardarActividadesPlanes() {
    localStorage.setItem("actividadesPlanes", JSON.stringify(actividadesPlanes));
}

function cargarActividadesPlanes() {
    const data = localStorage.getItem("actividadesPlanes");
    actividadesPlanes = data ? JSON.parse(data) : [];
}

function registrarActividadPlan(tipo, cliente, icono) {

    actividadesPlanes.unshift({
        tipo,
        cliente,
        icono,
        fecha: Date.now()
    });

    actividadesPlanes = actividadesPlanes.slice(0, 15);

    guardarActividadesPlanes();
    renderActividadesPlanes();
}

function tocarPlan(p) {
    p.ultimaActualizacion = Date.now();
}

// ==========================================
// UTILIDADES
// ==========================================

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function tiempoRelativo(timestamp) {

    const segundos = Math.floor((Date.now() - timestamp) / 1000);

    if (segundos < 60) return "Hace un momento";

    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `Hace ${minutos} minuto${minutos === 1 ? "" : "s"}`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} hora${horas === 1 ? "" : "s"}`;

    const dias = Math.floor(horas / 24);
    return `Hace ${dias} día${dias === 1 ? "" : "s"}`;
}

function badgeTipoComida(tipo) {
    const colores = {
        "Desayuno": "bg-warning text-dark",
        "Almuerzo": "bg-primary",
        "Cena": "bg-info text-dark",
        "Snack": "bg-secondary"
    };
    const clase = colores[tipo] || "bg-secondary";
    return `<span class="badge ${clase}">${tipo}</span>`;
}

function totalCaloriasDia(dia, plan) {
    return plan.dias[dia].reduce((total, c) => total + (Number(c.calorias) || 0), 0);
}

// ==========================================
// TABLA PRINCIPAL DE PLANES
// ==========================================

function mostrarPlanes(lista) {

    const tabla = document.getElementById("tablaPlanes");
    if (!tabla) return;

    const datos = lista || planes;

    tabla.innerHTML = "";

    if (datos.length === 0) {
        tabla.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">No se encontraron clientes</td>
        </tr>`;
        return;
    }

    datos.forEach(p => {

        tabla.innerHTML += `
        <tr>
            <td>${p.id}</td>
            <td>${p.cliente}</td>
            <td>${p.objetivo}</td>
            <td>${p.nombre || '<span class="text-danger">Sin plan</span>'}</td>
            <td>
                <span class="badge bg-success">${p.estado || 'Activo'}</span>
            </td>
            <td class="text-center">
                <button class="btn btn-info btn-sm" onclick="verPlan(${p.id})">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="editarPlan(${p.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarPlan(${p.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
}

// ==========================================
// VER PLAN (modal de solo lectura)
// ==========================================

function verPlan(id) {

    const p = planes.find(x => x.id == id);
    if (!p) return;

    planActual = p;

    document.getElementById("verPlanCliente").textContent = p.cliente;
    document.getElementById("verPlanObjetivo").textContent = "Objetivo: " + p.objetivo;
    document.getElementById("verPlanCalorias").textContent =
        "Meta diaria: " + (p.caloriasObjetivo || 0) + " kcal · Dieta: " + p.tipoDieta;

    DIAS.forEach(dia => {

        const contenedor = document.getElementById("verPlan" + capitalize(dia));
        if (!contenedor) return;

        contenedor.innerHTML = "";

        if (p.dias[dia].length === 0) {
            contenedor.innerHTML = "<p class='sin-ejercicios'>Sin comidas asignadas</p>";
        } else {
            p.dias[dia].forEach(c => {
                contenedor.innerHTML += `
                    <div>
                        ${badgeTipoComida(c.tipo)} ${c.alimento} — ${c.cantidad} (${c.calorias} kcal)
                    </div>`;
            });

            contenedor.innerHTML += `
                <div class="mt-2"><em>Total del día: ${totalCaloriasDia(dia, p)} kcal</em></div>`;
        }
    });

    new bootstrap.Modal(document.getElementById("modalVerPlan")).show();
}

// ==========================================
// ELIMINAR PLAN
// ==========================================

function eliminarPlan(id) {

    Swal.fire({
        title: "¿Eliminar plan alimenticio?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {

        if (result.isConfirmed) {

            const eliminado = planes.find(p => p.id == id);
            planes = planes.filter(p => p.id != id);
            guardarPlanes();
            mostrarPlanes();
            renderAtencionPlanes();

            if (eliminado) {
                registrarActividadPlan("Plan eliminado", eliminado.cliente, "fa-trash");
            }

            Swal.fire({
                title: '¡Eliminado!',
                text: 'El plan fue eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#0a9696'
            });
        }
    });
}

// ==========================================
// EDITAR PLAN (modal con datos + días)
// ==========================================

function editarPlan(id) {

    const p = planes.find(x => x.id == id);
    if (!p) return;

    planActual = p;

    document.getElementById("planActualId").value = p.id;

    document.getElementById("editarPlanCliente").textContent = p.cliente;
    document.getElementById("editarPlanObjetivo").textContent = p.objetivo;

    document.getElementById("editarNombrePlan").value = p.nombre;
    document.getElementById("editarDuracionPlan").value = p.duracion;
    document.getElementById("editarTipoDieta").value = p.tipoDieta;
    document.getElementById("editarCaloriasObjetivo").value = p.caloriasObjetivo;
    document.getElementById("editarObservacionesPlan").value = p.observaciones;

    DIAS.forEach(dia => renderDiaPlan(dia, p));

    new bootstrap.Modal(document.getElementById("modalEditarPlan")).show();
}

function guardarCambiosPlan() {

    const id = document.getElementById("planActualId").value;
    const p = planes.find(x => x.id == id);
    if (!p) return;

    p.nombre = document.getElementById("editarNombrePlan").value;
    p.duracion = document.getElementById("editarDuracionPlan").value;
    p.tipoDieta = document.getElementById("editarTipoDieta").value;
    p.caloriasObjetivo = document.getElementById("editarCaloriasObjetivo").value;
    p.observaciones = document.getElementById("editarObservacionesPlan").value;

    tocarPlan(p);
    guardarPlanes();
    mostrarPlanes();
    renderAtencionPlanes();

    bootstrap.Modal.getInstance(
        document.getElementById("modalEditarPlan")
    ).hide();

    registrarActividadPlan("Plan actualizado", p.cliente, "fa-circle-check");

    Swal.fire({
        icon: "success",
        title: "Plan actualizado",
        timer: 1500,
        showConfirmButton: false
    });
}

// ==========================================
// FORMULARIO "AGREGAR COMIDA" (mostrar/ocultar)
// ==========================================

function mostrarFormulario(boton) {
    boton.style.display = "none";
    boton.nextElementSibling.style.display = "block";
}

function ocultarFormulario(boton) {
    const formulario = boton.closest(".form-agregar-ejercicio");
    formulario.style.display = "none";
    formulario.previousElementSibling.style.display = "inline-block";
}

function limpiarFormularioComida(container) {
    container.querySelector(".nuevoTipoComida").selectedIndex = 0;
    container.querySelector(".nuevoAlimento").value = "";
    container.querySelector(".nuevaCantidad").value = "";
    container.querySelector(".nuevasCalorias").value = "";
    container.querySelector(".nuevaObservacionComida").value = "";
}

function validarComida(data) {
    if (!data.alimento || !data.cantidad || !data.calorias) {
        Swal.fire({
            icon: "warning",
            title: "Faltan datos",
            text: "Completa alimento, cantidad y calorías"
        });
        return false;
    }
    return true;
}

// ==========================================
// CRUD DE COMIDAS DENTRO DE UN DÍA
// ==========================================

function agregarComida(dia) {

    const p = planActual;
    if (!p) return;

    const container = document.getElementById("collapsePlan" + capitalize(dia)).parentElement;

    const selectTipo = container.querySelector(".nuevoTipoComida");
    const tipo = selectTipo.value;
    const alimento = container.querySelector(".nuevoAlimento").value;
    const cantidad = container.querySelector(".nuevaCantidad").value;
    const calorias = container.querySelector(".nuevasCalorias").value;
    const obs = container.querySelector(".nuevaObservacionComida").value;

    if (!validarComida({ alimento, cantidad, calorias })) return;

    p.dias[dia].push({
        tipo,
        alimento,
        cantidad,
        calorias,
        observacion: obs
    });

    tocarPlan(p);
    guardarPlanes();
    renderDiaPlan(dia, p);
    limpiarFormularioComida(container);
    renderAtencionPlanes();

    registrarActividadPlan("Comida agregada", p.cliente, "fa-plus");

    Swal.fire({
        icon: "success",
        title: "Comida agregada",
        timer: 1200,
        showConfirmButton: false
    });
}

function renderDiaPlan(dia, plan) {

    const tabla = document.getElementById("tablaPlan" + capitalize(dia));
    if (!tabla) return;

    tabla.innerHTML = "";

    plan.dias[dia].forEach((c, index) => {

        tabla.innerHTML += `
        <tr>
            <td>${badgeTipoComida(c.tipo)}</td>
            <td>${c.alimento}</td>
            <td>${c.cantidad}</td>
            <td>${c.calorias}</td>
            <td class="text-center">
                <button class="btn btn-warning btn-sm"
                    onclick="editarComida('${dia}', ${index})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-danger btn-sm"
                    onclick="eliminarComida('${dia}', ${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
        `;
    });
}

function eliminarComida(dia, index) {

    Swal.fire({
        title: "¿Eliminar comida?",
        text: "No podrás revertir esto",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {

        if (result.isConfirmed) {

            planActual.dias[dia].splice(index, 1);
            tocarPlan(planActual);
            guardarPlanes();
            renderDiaPlan(dia, planActual);
            renderAtencionPlanes();

            registrarActividadPlan("Comida eliminada", planActual.cliente, "fa-trash");

            Swal.fire({
                title: '¡Eliminada!',
                text: 'La comida fue eliminada correctamente.',
                icon: 'success',
                confirmButtonColor: '#0a9696'
            });
        }
    });
}

function editarComida(dia, index) {

    const c = planActual.dias[dia][index];
    if (!c) return;

    comidaEditando = { dia, index };

    document.getElementById("editarTipoComida").value = c.tipo;
    document.getElementById("editarAlimento").value = c.alimento;
    document.getElementById("editarCantidad").value = c.cantidad;
    document.getElementById("editarCalorias").value = c.calorias;
    document.getElementById("editarObservacionComida").value = c.observacion;

    new bootstrap.Modal(document.getElementById("modalEditarComida")).show();
}

function guardarComidaEditada() {

    if (!comidaEditando) return;

    const { dia, index } = comidaEditando;

    planActual.dias[dia][index] = {
        tipo: document.getElementById("editarTipoComida").value,
        alimento: document.getElementById("editarAlimento").value,
        cantidad: document.getElementById("editarCantidad").value,
        calorias: document.getElementById("editarCalorias").value,
        observacion: document.getElementById("editarObservacionComida").value
    };

    tocarPlan(planActual);
    guardarPlanes();
    renderDiaPlan(dia, planActual);
    renderAtencionPlanes();

    bootstrap.Modal.getInstance(
        document.getElementById("modalEditarComida")
    ).hide();

    registrarActividadPlan("Comida modificada", planActual.cliente, "fa-pen");

    Swal.fire({
        icon: "success",
        title: "Comida actualizada",
        timer: 1200,
        showConfirmButton: false
    });
}

// ==========================================
// CARD: ACTIVIDADES RECIENTES
// ==========================================

function renderActividadesPlanes() {

    const contenedor = document.getElementById("listaActividadesPlanes");
    if (!contenedor) return;

    if (actividadesPlanes.length === 0) {
        contenedor.innerHTML = `<p class="sin-ejercicios">Sin actividad registrada aún.</p>`;
        return;
    }

    contenedor.innerHTML = actividadesPlanes.slice(0, 5).map(a => `
        <div class="activity-item">
            <i class="fa-solid ${a.icono}"></i>
            <div>
                <strong>${a.tipo}</strong>
                <p>${a.cliente} • ${tiempoRelativo(a.fecha)}</p>
            </div>
        </div>
    `).join("");
}

// ==========================================
// CARD: CLIENTES QUE REQUIEREN ATENCIÓN
// ==========================================

function diasSinCambiosPlan(p) {
    const ultima = p.ultimaActualizacion || 0;
    return Math.floor((Date.now() - ultima) / (1000 * 60 * 60 * 24));
}

function tieneComidas(p) {
    return DIAS.some(dia => p.dias[dia] && p.dias[dia].length > 0);
}

function renderAtencionPlanes() {

    const contenedor = document.getElementById("listaAtencionPlanes");
    if (!contenedor) return;

    const alertas = [];

    planes.forEach(p => {

        if (!p.nombre) {
            alertas.push({ cliente: p.cliente, mensaje: "No tiene un plan alimenticio asignado." });
            return;
        }

        if (!tieneComidas(p)) {
            alertas.push({ cliente: p.cliente, mensaje: "Plan sin comidas cargadas." });
            return;
        }

        const dias = diasSinCambiosPlan(p);
        if (dias >= 7) {
            alertas.push({ cliente: p.cliente, mensaje: `Sin cambios registrados en ${dias} días.` });
        }
    });

    if (alertas.length === 0) {
        contenedor.innerHTML = `<p class="sin-ejercicios">Todos los clientes están al día.</p>`;
        return;
    }

    contenedor.innerHTML = alertas.map(a => `
        <div class="attention-item">
            <i class="fa-solid fa-user"></i>
            <div>
                <strong>${a.cliente}</strong>
                <p>${a.mensaje}</p>
            </div>
        </div>
    `).join("");
}

// ==========================================
// BÚSQUEDA DE CLIENTES
// ==========================================

function filtrarPlanes() {

    const input = document.getElementById("buscarPlan");
    if (!input) return;

    const termino = normalizar(input.value.trim());

    if (termino === "") {
        mostrarPlanes();
        return;
    }

    const filtrados = planes.filter(p =>
        normalizar(p.cliente).includes(termino)
    );

    mostrarPlanes(filtrados);
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    cargarPlanes();
    cargarActividadesPlanes();
    mostrarPlanes();
    renderActividadesPlanes();
    renderAtencionPlanes();

    const inputBusqueda = document.getElementById("buscarPlan");
    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", filtrarPlanes);
    }
});
