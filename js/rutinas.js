let rutinas = [
    {
        id: 1,
        cliente: "Dilan Bohorquez",
        objetivo: "Hipertrofia",
        nombre: "Intermedia",
        duracion: "8 semanas",
        nivel: "Intermedio",
        observaciones: "",
        estado: "Activa",
        dias: {
            lunes: [],
            martes: [],
            miercoles: [],
            jueves: [],
            viernes: [],
            sabado: [],
            domingo: []
        }
    },
    {
        id: 2,
        cliente: "Juan Martinez",
        objetivo: "Fuerza",
        nombre: "Principiante",
        duracion: "4 semanas",
        nivel: "Principiante",
        observaciones: "",
        estado: "Activa",
        dias: {
            lunes: [],
            martes: [],
            miercoles: [],
            jueves: [],
            viernes: [],
            sabado: [],
            domingo: []
        }
    },
    {
        id: 3,
        cliente: "Julian Pinto",
        objetivo: "Cardio",
        nombre: "Avanzado",
        duracion: "4 semanas",
        nivel: "Intermedio",
        observaciones: "",
        estado: "Activa",
        dias: {
            lunes: [],
            martes: [],
            miercoles: [],
            jueves: [],
            viernes: [],
            sabado: [],
            domingo: []
        }
    },
    {
        id: 4,
        cliente: "Miguel Ortiz",
        objetivo: "Resistencia",
        nombre: "Principiante",
        duracion: "4 semanas",
        nivel: "Principiante",
        observaciones: "",
        estado: "Activa",
        dias: {
            lunes: [],
            martes: [],
            miercoles: [],
            jueves: [],
            viernes: [],
            sabado: [],
            domingo: []
        }
    }
];


let rutinaActual = null;

let ejercicioEditando = null;


let actividades = [];

function guardar() {
    localStorage.setItem("rutinas", JSON.stringify(rutinas));
}

function cargar() {
    const data = localStorage.getItem("rutinas");
    if (data) {
        rutinas = JSON.parse(data);
    }
}

function guardarActividades() {
    localStorage.setItem("actividades", JSON.stringify(actividades));
}

function cargarActividades() {
    const data = localStorage.getItem("actividades");
    actividades = data ? JSON.parse(data) : [];
}

function registrarActividad(tipo, cliente, icono) {

    actividades.unshift({
        tipo,
        cliente,
        icono,
        fecha: Date.now()
    });

    actividades = actividades.slice(0, 15);

    guardarActividades();
    renderActividades();
}

function tocarRutina(r) {
    r.ultimaActualizacion = Date.now();
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


function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];


function mostrarRutinas(lista) {

    const tabla = document.getElementById("tablaRutinas");

    if (!tabla) {
        console.error('No se encontró el elemento con id "tablaRutinas"');
        return;
    }

    const datos = lista || rutinas;

    tabla.innerHTML = "";

    if (datos.length === 0) {
        tabla.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">No se encontraron clientes</td>
        </tr>`;
        return;
    }

    datos.forEach(r => {

        tabla.innerHTML += `
        <tr>
            <td>${r.id}</td>
            <td>${r.cliente}</td>
            <td>${r.objetivo}</td>
            <td>${r.nombre || '<span class="text-danger">Sin rutina</span>'}</td>
            <td>
                <span class="badge bg-success">${r.estado || 'Activa'}</span>
            </td>
            <td class="text-center">
                <button class="btn btn-info btn-sm" onclick="verRutina(${r.id})">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="editarRutina(${r.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarRutina(${r.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
}

function verRutina(id) {

    const r = rutinas.find(x => x.id == id);
    if (!r) return;

    rutinaActual = r;

    document.getElementById("verCliente").textContent = r.cliente;
    document.getElementById("verObjetivo").textContent = "Objetivo: " + r.objetivo;

    DIAS.forEach(dia => {

        const contenedor = document.getElementById("ver" + capitalize(dia));
        if (!contenedor) return;

        contenedor.innerHTML = "";

        if (r.dias[dia].length === 0) {
            contenedor.innerHTML = "<p class='sin-ejercicios'>Sin ejercicios</p>";
        } else {
            r.dias[dia].forEach(e => {
                contenedor.innerHTML += `
                    <div>
                        • ${e.ejercicio} (${e.series}x${e.repeticiones})
                    </div>`;
            });
        }
    });

    new bootstrap.Modal(document.getElementById("modalVerRutina")).show();
}


function eliminarRutina(id) {

    Swal.fire({
        title: "¿Eliminar rutina?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {

        if (result.isConfirmed) {

            const rutinaEliminada = rutinas.find(r => r.id == id);
            rutinas = rutinas.filter(r => r.id != id);
            guardar();
            mostrarRutinas();
            renderAtencion();

            if (rutinaEliminada) {
                registrarActividad("Rutina eliminada", rutinaEliminada.cliente, "fa-trash");
            }

            Swal.fire({
                title: '¡Eliminada!',
                text: 'La rutina fue eliminada correctamente.',
                icon: 'success',
                confirmButtonColor: '#0a9696'
            });
        }
    });
}


function editarRutina(id) {

    const r = rutinas.find(x => x.id == id);
    if (!r) return;

    rutinaActual = r;

    document.getElementById("rutinaActual").value = r.id;

    document.getElementById("editarCliente").textContent = r.cliente;
    document.getElementById("editarObjetivo").textContent = r.objetivo;

    document.getElementById("editarNombreRutina").value = r.nombre;
    document.getElementById("editarDuracion").value = r.duracion;
    document.getElementById("editarNivel").value = r.nivel;
    document.getElementById("editarObservaciones").value = r.observaciones;

    DIAS.forEach(dia => renderDia(dia, r));

    new bootstrap.Modal(document.getElementById("modalEditarRutina")).show();
}

function guardarCambios() {

    const id = document.getElementById("rutinaActual").value;
    const r = rutinas.find(x => x.id == id);
    if (!r) return;

    r.nombre = document.getElementById("editarNombreRutina").value;
    r.duracion = document.getElementById("editarDuracion").value;
    r.nivel = document.getElementById("editarNivel").value;
    r.observaciones = document.getElementById("editarObservaciones").value;

    tocarRutina(r);
    guardar();
    mostrarRutinas();
    renderAtencion();

    bootstrap.Modal.getInstance(
        document.getElementById("modalEditarRutina")
    ).hide();

    registrarActividad("Rutina actualizada", r.cliente, "fa-circle-check");

    Swal.fire({
        icon: "success",
        title: "Rutina actualizada",
        timer: 1500,
        showConfirmButton: false
    });
}


function mostrarFormulario(boton) {
    boton.style.display = "none";
    boton.nextElementSibling.style.display = "block";
}

function ocultarFormulario(boton) {
    const formulario = boton.closest(".form-agregar-ejercicio");
    formulario.style.display = "none";
    formulario.previousElementSibling.style.display = "inline-block";
}

function limpiarFormulario(container) {
    container.querySelector(".nuevoEjercicio").value = "";
    container.querySelector(".nuevasSeries").value = "";
    container.querySelector(".nuevasRepeticiones").value = "";
    container.querySelector(".nuevoDescanso").value = "";
    container.querySelector(".nuevaObservacion").value = "";
}

function validarEjercicio(data) {
    if (!data.ejercicio || !data.series || !data.repeticiones) {
        Swal.fire({
            icon: "warning",
            title: "Faltan datos",
            text: "Completa ejercicio, series y repeticiones"
        });
        return false;
    }
    return true;
}


function agregarEjercicio(dia) {

    const r = rutinaActual;
    if (!r) return;

    const container = document.getElementById("collapse" + capitalize(dia)).parentElement;

    const selectEjercicio = container.querySelector(".nuevoEjercicio");
    const ejercicio = selectEjercicio.options[selectEjercicio.selectedIndex].text;
    const series = container.querySelector(".nuevasSeries").value;
    const reps = container.querySelector(".nuevasRepeticiones").value;
    const descanso = container.querySelector(".nuevoDescanso").value;
    const obs = container.querySelector(".nuevaObservacion").value;

    if (!validarEjercicio({ ejercicio, series, repeticiones: reps })) return;

    r.dias[dia].push({
        ejercicio,
        series,
        repeticiones: reps,
        descanso,
        observacion: obs
    });

    tocarRutina(r);
    guardar();
    renderDia(dia, r);
    limpiarFormulario(container);
    renderAtencion();

    registrarActividad("Ejercicio agregado", r.cliente, "fa-plus");

    Swal.fire({
        icon: "success",
        title: "Ejercicio agregado",
        timer: 1200,
        showConfirmButton: false
    });
}

function renderDia(dia, rutina) {

    const tabla = document.getElementById("tabla" + capitalize(dia));
    if (!tabla) return;

    tabla.innerHTML = "";

    rutina.dias[dia].forEach((e, index) => {

        tabla.innerHTML += `
        <tr>
            <td>${e.ejercicio}</td>
            <td>${e.series}</td>
            <td>${e.repeticiones}</td>
            <td class="text-center">
                <button class="btn btn-warning btn-sm"
                    onclick="editarEjercicio('${dia}', ${index})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-danger btn-sm"
                    onclick="eliminarEjercicio('${dia}', ${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
        `;
    });
}

function eliminarEjercicio(dia, index) {

    Swal.fire({
        title: "¿Eliminar ejercicio?",
        text: "No podrás revertir esto",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {

        if (result.isConfirmed) {

            rutinaActual.dias[dia].splice(index, 1);
            tocarRutina(rutinaActual);
            guardar();
            renderDia(dia, rutinaActual);
            renderAtencion();

            registrarActividad("Ejercicio eliminado", rutinaActual.cliente, "fa-trash");

            Swal.fire({
                title: '¡Eliminado!',
                text: 'El ejercicio fue eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#0a9696'
            });
        }
    });
}

function editarEjercicio(dia, index) {

    const e = rutinaActual.dias[dia][index];
    if (!e) return;

    ejercicioEditando = { dia, index };

    document.getElementById("editarEjercicio").value = e.ejercicio;
    document.getElementById("editarSeries").value = e.series;
    document.getElementById("editarRepeticiones").value = e.repeticiones;
    document.getElementById("editarDescanso").value = e.descanso;
    document.getElementById("editarObservacion").value = e.observacion;

    new bootstrap.Modal(document.getElementById("modalEditarEjercicio")).show();
}

function guardarEjercicioEditado() {

    if (!ejercicioEditando) return;

    const { dia, index } = ejercicioEditando;

    rutinaActual.dias[dia][index] = {
        ejercicio: document.getElementById("editarEjercicio").value,
        series: document.getElementById("editarSeries").value,
        repeticiones: document.getElementById("editarRepeticiones").value,
        descanso: document.getElementById("editarDescanso").value,
        observacion: document.getElementById("editarObservacion").value
    };

    tocarRutina(rutinaActual);
    guardar();
    renderDia(dia, rutinaActual);
    renderAtencion();

    bootstrap.Modal.getInstance(
        document.getElementById("modalEditarEjercicio")
    ).hide();

    registrarActividad("Ejercicio modificado", rutinaActual.cliente, "fa-pen");

    Swal.fire({
        icon: "success",
        title: "Ejercicio actualizado",
        timer: 1200,
        showConfirmButton: false
    });
}

function cancelarEditarEjercicio(boton) {
    boton.closest(".form-editar-ejercicio").style.display = "none";
}

function mostrarEditarEjercicio(boton) {
    const accordionBody = boton.closest(".accordion-body");
    const formulario = accordionBody.querySelector(".form-editar-ejercicio");
    if (formulario) formulario.style.display = "block";
}


function renderActividades() {

    const contenedor = document.getElementById("listaActividades");
    if (!contenedor) return;

    if (actividades.length === 0) {
        contenedor.innerHTML = `<p class="sin-ejercicios">Sin actividad registrada aún.</p>`;
        return;
    }

    contenedor.innerHTML = actividades.slice(0, 5).map(a => `
        <div class="activity-item">
            <i class="fa-solid ${a.icono}"></i>
            <div>
                <strong>${a.tipo}</strong>
                <p>${a.cliente} • ${tiempoRelativo(a.fecha)}</p>
            </div>
        </div>
    `).join("");
}


function diasSinCambios(r) {
    const ultima = r.ultimaActualizacion || 0;
    return Math.floor((Date.now() - ultima) / (1000 * 60 * 60 * 24));
}

function tieneEjercicios(r) {
    return DIAS.some(dia => r.dias[dia] && r.dias[dia].length > 0);
}

function renderAtencion() {

    const contenedor = document.getElementById("listaAtencion");
    if (!contenedor) return;

    const alertas = [];

    rutinas.forEach(r => {

        if (!r.nombre) {
            alertas.push({ cliente: r.cliente, mensaje: "No tiene una rutina asignada." });
            return;
        }

        if (!tieneEjercicios(r)) {
            alertas.push({ cliente: r.cliente, mensaje: "Rutina sin ejercicios cargados." });
            return;
        }

        const dias = diasSinCambios(r);
        if (dias >= 7) {
            alertas.push({ cliente: r.cliente, mensaje: `Sin cambios registrados en ${dias} días.` });
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

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); 
}

function filtrarRutinas() {

    const input = document.getElementById("buscarRutina");
    if (!input) return;

    const termino = normalizar(input.value.trim());

    if (termino === "") {
        mostrarRutinas();
        return;
    }

    const filtradas = rutinas.filter(r =>
        normalizar(r.cliente).includes(termino)
    );

    mostrarRutinas(filtradas);
}


document.addEventListener("DOMContentLoaded", () => {
    cargar();
    cargarActividades();
    mostrarRutinas();
    renderActividades();
    renderAtencion();

    const inputBusqueda = document.getElementById("buscarRutina");
    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", filtrarRutinas);
    }
});
