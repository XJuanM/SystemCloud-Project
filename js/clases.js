
let clases = [
    {
        id: 1,
        nombre: "Yoga Flow",
        categoria: "Yoga",
        instructor: "Laura Gómez",
        cupo: 15,
        estado: "Activa",
        observaciones: "",
        horario: {
            lunes: [{ horaInicio: "07:00", horaFin: "08:00", sala: "Sala 2" }],
            martes: [],
            miercoles: [{ horaInicio: "07:00", horaFin: "08:00", sala: "Sala 2" }],
            jueves: [],
            viernes: [],
            sabado: [],
            domingo: []
        },
        inscritos: [
            { nombre: "Camila Rojas", telefono: "3001234567" },
            { nombre: "Andrés Salazar", telefono: "3009876543" }
        ]
    },
    {
        id: 2,
        nombre: "Spinning Extremo",
        categoria: "Spinning",
        instructor: "Carlos Peña",
        cupo: 20,
        estado: "Activa",
        observaciones: "",
        horario: {
            lunes: [],
            martes: [{ horaInicio: "18:00", horaFin: "19:00", sala: "Sala Spinning" }],
            miercoles: [],
            jueves: [{ horaInicio: "18:00", horaFin: "19:00", sala: "Sala Spinning" }],
            viernes: [],
            sabado: [],
            domingo: []
        },
        inscritos: []
    },
    {
        id: 3,
        nombre: "CrossFit WOD",
        categoria: "CrossFit",
        instructor: "",
        cupo: 12,
        estado: "Inactiva",
        observaciones: "Pendiente asignar instructor",
        horario: {
            lunes: [], martes: [], miercoles: [], jueves: [],
            viernes: [], sabado: [], domingo: []
        },
        inscritos: []
    },
    {
        id: 4,
        nombre: "Zumba Party",
        categoria: "Zumba",
        instructor: "Daniela Ríos",
        cupo: 25,
        estado: "Activa",
        observaciones: "",
        horario: {
            lunes: [],
            martes: [],
            miercoles: [],
            jueves: [],
            viernes: [{ horaInicio: "17:00", horaFin: "18:00", sala: "Sala 1" }],
            sabado: [{ horaInicio: "09:00", horaFin: "10:00", sala: "Sala 1" }],
            domingo: []
        },
        inscritos: [
            { nombre: "Julian Pinto", telefono: "3012223344" }
        ]
    }
];

let claseActual = null;

let sesionEditando = null;

let actividadesClases = [];

const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];


function guardarClases() {
    localStorage.setItem("clases", JSON.stringify(clases));
}

function cargarClases() {
    const data = localStorage.getItem("clases");
    if (data) {
        clases = JSON.parse(data);
    }
}

function guardarActividadesClases() {
    localStorage.setItem("actividadesClases", JSON.stringify(actividadesClases));
}

function cargarActividadesClases() {
    const data = localStorage.getItem("actividadesClases");
    actividadesClases = data ? JSON.parse(data) : [];
}

function registrarActividadClase(tipo, nombreClase, icono) {

    actividadesClases.unshift({
        tipo,
        cliente: nombreClase,
        icono,
        fecha: Date.now()
    });

    actividadesClases = actividadesClases.slice(0, 15);

    guardarActividadesClases();
    renderActividadesClases();
}

function tocarClase(c) {
    c.ultimaActualizacion = Date.now();
}



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

function badgeCategoria(categoria) {
    const colores = {
        "Yoga": "bg-info text-dark",
        "Spinning": "bg-warning text-dark",
        "CrossFit": "bg-danger",
        "Zumba": "bg-primary",
        "Funcional": "bg-success",
        "Pilates": "bg-secondary"
    };
    const clase = colores[categoria] || "bg-secondary";
    return `<span class="badge ${clase}">${categoria}</span>`;
}

function badgeEstado(estado) {
    const colores = {
        "Activa": "bg-success",
        "Inactiva": "bg-secondary",
        "Cancelada": "bg-danger"
    };
    const clase = colores[estado] || "bg-secondary";
    return `<span class="badge ${clase}">${estado}</span>`;
}

function totalSesionesSemana(clase) {
    return DIAS.reduce((total, dia) => total + clase.horario[dia].length, 0);
}

function totalInscritos(clase) {
    return clase.inscritos.length;
}

function cupoDisponible(clase) {
    return clase.cupo - totalInscritos(clase);
}

function barraCupo(clase) {

    const ocupacion = clase.cupo > 0 ? (totalInscritos(clase) / clase.cupo) * 100 : 0;
    let claseColor = "";

    if (ocupacion >= 100) claseColor = "lleno";
    else if (ocupacion >= 70) claseColor = "medio";

    return `
        <div>${totalInscritos(clase)}/${clase.cupo || 0}</div>
        <div class="cupo-bar">
            <div class="cupo-bar-fill ${claseColor}" style="width:${Math.min(ocupacion, 100)}%"></div>
        </div>
    `;
}



function mostrarClases(lista) {

    const tabla = document.getElementById("tablaClases");
    if (!tabla) return;

    const datos = lista || clases;

    tabla.innerHTML = "";

    if (datos.length === 0) {
        tabla.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">No se encontraron clases</td>
        </tr>`;
        return;
    }

    datos.forEach(c => {

        tabla.innerHTML += `
        <tr>
            <td>${c.id}</td>
            <td>${c.nombre || '<span class="text-danger">Sin nombre</span>'}</td>
            <td>${badgeCategoria(c.categoria)}</td>
            <td>${c.instructor || '<span class="text-danger">Sin instructor</span>'}</td>
            <td>${totalSesionesSemana(c)} sesión${totalSesionesSemana(c) === 1 ? "" : "es"}/semana</td>
            <td>${barraCupo(c)}</td>
            <td>${badgeEstado(c.estado)}</td>
            <td class="text-center">
                <button class="btn btn-info btn-sm" onclick="verClase(${c.id})">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="editarClase(${c.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarClase(${c.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
}

function verClase(id) {

    const c = clases.find(x => x.id == id);
    if (!c) return;

    claseActual = c;

    document.getElementById("verClaseNombre").textContent = c.nombre;
    document.getElementById("verClaseCategoria").textContent = "Categoría: " + c.categoria;
    document.getElementById("verClaseInfo").textContent =
        "Instructor: " + (c.instructor || "Sin asignar") +
        " · Cupo: " + totalInscritos(c) + "/" + (c.cupo || 0);

    DIAS.forEach(dia => {

        const contenedor = document.getElementById("verHorario" + capitalize(dia));
        if (!contenedor) return;

        contenedor.innerHTML = "";

        if (c.horario[dia].length === 0) {
            contenedor.innerHTML = "<p class='sin-ejercicios'>Sin sesiones programadas</p>";
        } else {
            c.horario[dia].forEach(s => {
                contenedor.innerHTML += `
                    <div>
                        ${s.horaInicio} - ${s.horaFin} · ${s.sala}
                    </div>`;
            });
        }
    });

    const contenedorInscritos = document.getElementById("verInscritos");
    if (c.inscritos.length === 0) {
        contenedorInscritos.innerHTML = "<p class='sin-ejercicios'>Sin clientes inscritos</p>";
    } else {
        contenedorInscritos.innerHTML = c.inscritos.map(i => `
            <div>${i.nombre} — ${i.telefono || "Sin teléfono"}</div>
        `).join("");
    }

    new bootstrap.Modal(document.getElementById("modalVerClase")).show();
}



function eliminarClase(id) {

    Swal.fire({
        title: "¿Eliminar clase?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {

        if (result.isConfirmed) {

            const eliminada = clases.find(c => c.id == id);
            clases = clases.filter(c => c.id != id);
            guardarClases();
            mostrarClases();
            renderAtencionClases();

            if (eliminada) {
                registrarActividadClase("Clase eliminada", eliminada.nombre, "fa-trash");
            }

            Swal.fire({
                title: '¡Eliminada!',
                text: 'La clase fue eliminada correctamente.',
                icon: 'success',
                confirmButtonColor: '#0a9696'
            });
        }
    });
}



function horarioVacio() {
    return {
        lunes: [], martes: [], miercoles: [], jueves: [],
        viernes: [], sabado: [], domingo: []
    };
}

function nuevaClase() {

    claseActual = null;

    document.getElementById("tituloModalClase").textContent = "Nueva clase";
    document.getElementById("claseActualId").value = "";

    document.getElementById("editarNombreClase").value = "";
    document.getElementById("editarCategoriaClase").selectedIndex = 0;
    document.getElementById("editarInstructorClase").value = "";
    document.getElementById("editarCupoClase").value = "";
    document.getElementById("editarEstadoClase").value = "Activa";
    document.getElementById("editarObservacionesClase").value = "";

    const claseTemporal = {
        horario: horarioVacio(),
        inscritos: [],
        cupo: 0
    };

    claseActual = claseTemporal;

    DIAS.forEach(dia => renderDiaClase(dia, claseActual));
    renderInscritos(claseActual);

    new bootstrap.Modal(document.getElementById("modalEditarClase")).show();
}

function editarClase(id) {

    const c = clases.find(x => x.id == id);
    if (!c) return;

    claseActual = c;

    document.getElementById("tituloModalClase").textContent = "Editar clase";
    document.getElementById("claseActualId").value = c.id;

    document.getElementById("editarNombreClase").value = c.nombre;
    document.getElementById("editarCategoriaClase").value = c.categoria;
    document.getElementById("editarInstructorClase").value = c.instructor;
    document.getElementById("editarCupoClase").value = c.cupo;
    document.getElementById("editarEstadoClase").value = c.estado;
    document.getElementById("editarObservacionesClase").value = c.observaciones;

    DIAS.forEach(dia => renderDiaClase(dia, c));
    renderInscritos(c);

    new bootstrap.Modal(document.getElementById("modalEditarClase")).show();
}

function validarClase(data) {
    if (!data.nombre || !data.categoria) {
        Swal.fire({
            icon: "warning",
            title: "Faltan datos",
            text: "El nombre y la categoría de la clase son obligatorios"
        });
        return false;
    }
    return true;
}

function guardarCambiosClase() {

    const idInput = document.getElementById("claseActualId").value;

    const datos = {
        nombre: document.getElementById("editarNombreClase").value.trim(),
        categoria: document.getElementById("editarCategoriaClase").value,
        instructor: document.getElementById("editarInstructorClase").value.trim(),
        cupo: Number(document.getElementById("editarCupoClase").value) || 0,
        estado: document.getElementById("editarEstadoClase").value,
        observaciones: document.getElementById("editarObservacionesClase").value
    };

    if (!validarClase(datos)) return;

    if (!idInput) {
        const nuevoId = clases.length ? Math.max(...clases.map(c => c.id)) + 1 : 1;

        const nueva = {
            id: nuevoId,
            ...datos,
            horario: claseActual ? claseActual.horario : horarioVacio(),
            inscritos: claseActual ? claseActual.inscritos : []
        };

        tocarClase(nueva);
        clases.push(nueva);
        claseActual = nueva;

        registrarActividadClase("Clase creada", nueva.nombre, "fa-plus");

    } else {

        const c = clases.find(x => x.id == idInput);
        if (!c) return;

        c.nombre = datos.nombre;
        c.categoria = datos.categoria;
        c.instructor = datos.instructor;
        c.cupo = datos.cupo;
        c.estado = datos.estado;
        c.observaciones = datos.observaciones;

        tocarClase(c);
        claseActual = c;

        registrarActividadClase("Clase actualizada", c.nombre, "fa-circle-check");
    }

    guardarClases();
    mostrarClases();
    renderAtencionClases();

    bootstrap.Modal.getInstance(
        document.getElementById("modalEditarClase")
    ).hide();

    Swal.fire({
        icon: "success",
        title: "Clase guardada",
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

function limpiarFormularioSesion(container) {
    container.querySelector(".nuevaHoraInicio").value = "";
    container.querySelector(".nuevaHoraFin").value = "";
    container.querySelector(".nuevaSala").value = "";
}

function validarSesion(data) {
    if (!data.horaInicio || !data.horaFin || !data.sala) {
        Swal.fire({
            icon: "warning",
            title: "Faltan datos",
            text: "Completa hora de inicio, hora de fin y sala"
        });
        return false;
    }
    return true;
}



function agregarSesion(dia) {

    const c = claseActual;
    if (!c) return;

    const container = document.getElementById("collapseHorario" + capitalize(dia)).parentElement;

    const horaInicio = container.querySelector(".nuevaHoraInicio").value;
    const horaFin = container.querySelector(".nuevaHoraFin").value;
    const sala = container.querySelector(".nuevaSala").value;

    if (!validarSesion({ horaInicio, horaFin, sala })) return;

    c.horario[dia].push({ horaInicio, horaFin, sala });

    tocarClase(c);
    if (clases.includes(c)) guardarClases();

    renderDiaClase(dia, c);
    limpiarFormularioSesion(container);
    renderAtencionClases();

    registrarActividadClase("Sesión agregada", c.nombre || "Nueva clase", "fa-plus");

    Swal.fire({
        icon: "success",
        title: "Sesión agregada",
        timer: 1200,
        showConfirmButton: false
    });
}

function renderDiaClase(dia, clase) {

    const tabla = document.getElementById("tablaHorario" + capitalize(dia));
    if (!tabla) return;

    tabla.innerHTML = "";

    clase.horario[dia].forEach((s, index) => {

        tabla.innerHTML += `
        <tr>
            <td>${s.horaInicio} - ${s.horaFin}</td>
            <td>${s.sala}</td>
            <td class="text-center">
                <button class="btn btn-warning btn-sm"
                    onclick="editarSesion('${dia}', ${index})">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-danger btn-sm"
                    onclick="eliminarSesion('${dia}', ${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
        `;
    });
}

function eliminarSesion(dia, index) {

    Swal.fire({
        title: "¿Eliminar sesión?",
        text: "No podrás revertir esto",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {

        if (result.isConfirmed) {

            claseActual.horario[dia].splice(index, 1);
            tocarClase(claseActual);
            if (clases.includes(claseActual)) guardarClases();

            renderDiaClase(dia, claseActual);
            renderAtencionClases();

            registrarActividadClase("Sesión eliminada", claseActual.nombre || "Clase", "fa-trash");

            Swal.fire({
                title: '¡Eliminada!',
                text: 'La sesión fue eliminada correctamente.',
                icon: 'success',
                confirmButtonColor: '#0a9696'
            });
        }
    });
}

function editarSesion(dia, index) {

    const s = claseActual.horario[dia][index];
    if (!s) return;

    sesionEditando = { dia, index };

    document.getElementById("editarHoraInicio").value = s.horaInicio;
    document.getElementById("editarHoraFin").value = s.horaFin;
    document.getElementById("editarSala").value = s.sala;

    new bootstrap.Modal(document.getElementById("modalEditarSesion")).show();
}

function guardarSesionEditada() {

    if (!sesionEditando) return;

    const { dia, index } = sesionEditando;

    const horaInicio = document.getElementById("editarHoraInicio").value;
    const horaFin = document.getElementById("editarHoraFin").value;
    const sala = document.getElementById("editarSala").value;

    if (!validarSesion({ horaInicio, horaFin, sala })) return;

    claseActual.horario[dia][index] = { horaInicio, horaFin, sala };

    tocarClase(claseActual);
    if (clases.includes(claseActual)) guardarClases();

    renderDiaClase(dia, claseActual);
    renderAtencionClases();

    bootstrap.Modal.getInstance(
        document.getElementById("modalEditarSesion")
    ).hide();

    registrarActividadClase("Sesión modificada", claseActual.nombre || "Clase", "fa-pen");

    Swal.fire({
        icon: "success",
        title: "Sesión actualizada",
        timer: 1200,
        showConfirmButton: false
    });
}


function renderInscritos(clase) {

    const tabla = document.getElementById("tablaInscritos");
    if (!tabla) return;

    tabla.innerHTML = "";

    clase.inscritos.forEach((i, index) => {
        tabla.innerHTML += `
        <tr>
            <td>${i.nombre}</td>
            <td>${i.telefono || ""}</td>
            <td class="text-center">
                <button class="btn btn-danger btn-sm" onclick="eliminarInscrito(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });

    const contador = document.getElementById("contadorCupo");
    if (contador) {
        contador.textContent = `${totalInscritos(clase)}/${clase.cupo || 0}`;
    }
}

function agregarInscrito() {

    const c = claseActual;
    if (!c) return;

    const nombreInput = document.getElementById("nuevoInscritoNombre");
    const telefonoInput = document.getElementById("nuevoInscritoTelefono");

    const nombre = nombreInput.value.trim();
    const telefono = telefonoInput.value.trim();

    if (!nombre) {
        Swal.fire({
            icon: "warning",
            title: "Falta el nombre",
            text: "Ingresa el nombre del cliente a inscribir"
        });
        return;
    }

    if (c.cupo > 0 && totalInscritos(c) >= c.cupo) {
        Swal.fire({
            icon: "error",
            title: "Cupo lleno",
            text: "Esta clase ya alcanzó su cupo máximo"
        });
        return;
    }

    c.inscritos.push({ nombre, telefono });

    tocarClase(c);
    if (clases.includes(c)) guardarClases();

    renderInscritos(c);
    mostrarClases();
    renderAtencionClases();

    nombreInput.value = "";
    telefonoInput.value = "";

    registrarActividadClase("Cliente inscrito", c.nombre || "Clase", "fa-user-plus");

    Swal.fire({
        icon: "success",
        title: "Cliente inscrito",
        timer: 1200,
        showConfirmButton: false
    });
}

function eliminarInscrito(index) {

    Swal.fire({
        title: "¿Quitar inscripción?",
        text: "El cliente será removido de esta clase",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "Sí, quitar",
        cancelButtonText: "Cancelar"
    }).then((result) => {

        if (result.isConfirmed) {

            claseActual.inscritos.splice(index, 1);
            tocarClase(claseActual);
            if (clases.includes(claseActual)) guardarClases();

            renderInscritos(claseActual);
            mostrarClases();
            renderAtencionClases();

            registrarActividadClase("Inscripción eliminada", claseActual.nombre || "Clase", "fa-trash");

            Swal.fire({
                title: '¡Listo!',
                text: 'El cliente fue removido de la clase.',
                icon: 'success',
                confirmButtonColor: '#0a9696'
            });
        }
    });
}


function renderActividadesClases() {

    const contenedor = document.getElementById("listaActividadesClases");
    if (!contenedor) return;

    if (actividadesClases.length === 0) {
        contenedor.innerHTML = `<p class="sin-ejercicios">Sin actividad registrada aún.</p>`;
        return;
    }

    contenedor.innerHTML = actividadesClases.slice(0, 5).map(a => `
        <div class="activity-item">
            <i class="fa-solid ${a.icono}"></i>
            <div>
                <strong>${a.tipo}</strong>
                <p>${a.cliente} • ${tiempoRelativo(a.fecha)}</p>
            </div>
        </div>
    `).join("");
}


function renderAtencionClases() {

    const contenedor = document.getElementById("listaAtencionClases");
    if (!contenedor) return;

    const alertas = [];

    clases.forEach(c => {

        if (!c.instructor) {
            alertas.push({ nombre: c.nombre, mensaje: "No tiene instructor asignado." });
        }

        if (totalSesionesSemana(c) === 0) {
            alertas.push({ nombre: c.nombre, mensaje: "No tiene sesiones programadas." });
        }

        if (c.cupo > 0 && totalInscritos(c) >= c.cupo) {
            alertas.push({ nombre: c.nombre, mensaje: "Cupo lleno, considera abrir otro horario." });
        }

        if (c.estado === "Cancelada") {
            alertas.push({ nombre: c.nombre, mensaje: "La clase está cancelada." });
        }
    });

    if (alertas.length === 0) {
        contenedor.innerHTML = `<p class="sin-ejercicios">Todas las clases están al día.</p>`;
        return;
    }

    contenedor.innerHTML = alertas.map(a => `
        <div class="attention-item">
            <i class="fa-solid fa-people-group"></i>
            <div>
                <strong>${a.nombre}</strong>
                <p>${a.mensaje}</p>
            </div>
        </div>
    `).join("");
}


function filtrarClases() {

    const input = document.getElementById("buscarClase");
    if (!input) return;

    const termino = normalizar(input.value.trim());

    if (termino === "") {
        mostrarClases();
        return;
    }

    const filtradas = clases.filter(c =>
        normalizar(c.nombre || "").includes(termino) ||
        normalizar(c.categoria || "").includes(termino) ||
        normalizar(c.instructor || "").includes(termino)
    );

    mostrarClases(filtradas);
}


document.addEventListener("DOMContentLoaded", () => {
    cargarClases();
    cargarActividadesClases();
    mostrarClases();
    renderActividadesClases();
    renderAtencionClases();

    const inputBusqueda = document.getElementById("buscarClase");
    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", filtrarClases);
    }
});
