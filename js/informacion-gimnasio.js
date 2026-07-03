const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const sedes = {
    centro: {
        nombre: "System Cloud · Sede Centro",
        badge: "SEDE PRINCIPAL",
        descripcion: "Nuestra sede insignia: la más grande, con la zona de pesas más completa y el mayor número de clases grupales por semana.",
        direccion: "Dg. 41 Sur, Bogotá",
        telefono: "+57 601 555 0110",
        correo: "centro@systemcloud.com",
        redes: "@systemcloud.centro",
        horario: [0, 0, 360, 360, 360, 360, 300],
        horarioTexto: ["Cerrado", "Cerrado", "6:00 - 22:00", "6:00 - 22:00", "6:00 - 22:00", "6:00 - 22:00", "7:00 - 15:00"],
        aforoActual: 78,
        aforoMax: 120
    },
};

const facilities = [
    { icon: "fa-solid fa-dumbbell", titulo: "Sala de pesas", desc: "Zona libre y máquinas guiadas, mantenimiento diario." },
    { icon: "fa-solid fa-person-running", titulo: "Zona de cardio", desc: "Cintas, elípticas y bicicletas con pantallas individuales." },
    { icon: "fa-solid fa-people-group", titulo: "Clases grupales", desc: "Funcional, spinning, yoga y más, todos los días." },
    { icon: "fa-solid fa-water-ladder", titulo: "Piscina climatizada", desc: "Disponible en sede Centro, carriles para todos los niveles." },
    { icon: "fa-solid fa-spa", titulo: "Zona de recuperación", desc: "Estiramiento, sauna y rodillos de espuma." },
    { icon: "fa-solid fa-square-parking", titulo: "Parqueadero", desc: "Cupos gratuitos para miembros con membresía activa." },
    { icon: "fa-solid fa-shower", titulo: "Vestidores y duchas", desc: "Lockers diarios y duchas con agua caliente." },
    { icon: "fa-solid fa-shield-heart", titulo: "Primeros auxilios", desc: "Personal certificado y desfibrilador en todas las sedes." }
];

const reglamento = [
    { pregunta: "¿Qué debo traer para entrenar?", respuesta: "Ropa deportiva, toalla propia y una botella de agua. El calzado debe ser deportivo, no se permite entrenar en sandalias o descalzo." },
    { pregunta: "¿Debo reservar clases con anticipación?", respuesta: "Sí, las clases grupales se reservan desde la app con máximo 48 horas de anticipación y hasta 2 horas antes del inicio." },
    { pregunta: "¿Puedo llevar invitados?", respuesta: "Cada miembro tiene derecho a 2 pases de invitado al mes, sujetos a disponibilidad de aforo en la sede." },
    { pregunta: "¿Qué pasa si llego tarde a una clase?", respuesta: "Se permite el ingreso hasta 5 minutos después del inicio; pasado ese tiempo el cupo se libera para la lista de espera." },
    { pregunta: "¿Cómo cancelo o congelo mi membresía?", respuesta: "Puedes hacerlo desde la sección Mi membresía con al menos 5 días hábiles de anticipación al próximo cobro." },
    { pregunta: "¿Hay política de uso de equipos?", respuesta: "Se pide limpiar el equipo después de usarlo y reponerlo en su lugar. El uso máximo por máquina en horas pico es de 20 minutos." }
];

const equipo = [
    { nombre: "Camila Rojas", rol: "Entrenadora de fuerza", cat: "fuerza", icon: "fa-solid fa-dumbbell" },
    { nombre: "Andrés Muñoz", rol: "Coach de powerlifting", cat: "fuerza", icon: "fa-solid fa-weight-hanging" },
    { nombre: "Laura Gómez", rol: "Instructora de spinning", cat: "cardio", icon: "fa-solid fa-person-biking" },
    { nombre: "Julián Torres", rol: "Coach de running", cat: "cardio", icon: "fa-solid fa-person-running" },
    { nombre: "Valentina Ríos", rol: "Instructora de yoga", cat: "yoga", icon: "fa-solid fa-spa" },
    { nombre: "Sofía Herrera", rol: "Instructora de pilates", cat: "yoga", icon: "fa-solid fa-om" },
    { nombre: "Daniel Castro", rol: "Nutricionista deportivo", cat: "nutricion", icon: "fa-solid fa-apple-whole" },
    { nombre: "Mariana López", rol: "Nutricionista clínica", cat: "nutricion", icon: "fa-solid fa-carrot" }
];


let sedeActual = "centro";
let filtroEquipoActual = "todos";
const RING_CIRCUNFERENCIA = 502.4;


function showToast(mensaje, icono = "fa-solid fa-circle-check") {
    const toast = document.getElementById("toast");
    toast.innerHTML = `<i class="${icono}"></i><span>${mensaje}</span>`;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
}


function pintarStatsGenerales() {
    document.getElementById("statHorario").textContent = "6:00 - 23:00";
    document.getElementById("statSedes").textContent = Object.keys(sedes).length;
    document.getElementById("statEntrenadores").textContent = equipo.length;
    document.getElementById("statClases").textContent = "28";
}


function pintarSede(sedeKey) {
    const sede = sedes[sedeKey];
    if (!sede) return;

    document.getElementById("sedeBadge").textContent = sede.badge;
    document.getElementById("sedeNombre").textContent = sede.nombre;
    document.getElementById("sedeDescripcion").textContent = sede.descripcion;
    document.getElementById("sedeDireccion").textContent = sede.direccion;
    document.getElementById("sedeTelefono").textContent = sede.telefono;
    document.getElementById("sedeCorreo").textContent = sede.correo;
    document.getElementById("sedeRedes").textContent = sede.redes;

    pintarAforo(sede);
    pintarHorario(sede);
}

function pintarAforo(sede) {
    const porcentaje = Math.round((sede.aforoActual / sede.aforoMax) * 100);
    const offset = RING_CIRCUNFERENCIA - (RING_CIRCUNFERENCIA * porcentaje) / 100;

    const ring = document.getElementById("ringAforo");
    ring.style.strokeDashoffset = RING_CIRCUNFERENCIA;
    requestAnimationFrame(() => {
        ring.style.strokeDashoffset = offset;
    });

    document.getElementById("ringAforoPercent").textContent = `${porcentaje}%`;
    document.getElementById("ringAforoLabel").textContent = `${sede.aforoActual}/${sede.aforoMax}`;
}

function pintarHorario(sede) {
    const lista = document.getElementById("hoursList");
    const hoyIndex = new Date().getDay();

    lista.innerHTML = "";
    DIAS.forEach((dia, i) => {
        const row = document.createElement("div");
        row.className = "hour-row" + (i === hoyIndex ? " today" : "");
        row.innerHTML = `<span>${dia}</span><span>${sede.horarioTexto[i]}</span>`;
        lista.appendChild(row);
    });

    const abiertoHoy = sede.horario[hoyIndex] > 0;
    document.getElementById("hoyEstado").textContent = abiertoHoy
        ? `Abierto · ${sede.horarioTexto[hoyIndex]}`
        : "Cerrado hoy";
}


function initSelectorSede() {
    const contenedor = document.getElementById("sedeSelector");
    contenedor.querySelectorAll(".range-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            contenedor.querySelectorAll(".range-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            sedeActual = btn.dataset.sede;
            pintarSede(sedeActual);
            showToast(`Mostrando ${sedes[sedeActual].nombre}`, "fa-solid fa-location-dot");
        });
    });
}


function pintarFacilities() {
    const grid = document.getElementById("facilitiesGrid");
    grid.innerHTML = facilities.map(f => `
        <div class="facility-card">
            <i class="${f.icon}"></i>
            <div>
                <h5>${f.titulo}</h5>
                <p>${f.desc}</p>
            </div>
        </div>
    `).join("");
}


function pintarReglamento() {
    const contenedor = document.getElementById("reglamentoAccordion");
    contenedor.innerHTML = reglamento.map((item, i) => `
        <div class="accordion-item" data-index="${i}">
            <button class="accordion-question">
                ${item.pregunta}
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-answer">
                <p>${item.respuesta}</p>
            </div>
        </div>
    `).join("");

    contenedor.querySelectorAll(".accordion-item").forEach(item => {
        const boton = item.querySelector(".accordion-question");
        const respuesta = item.querySelector(".accordion-answer");

        boton.addEventListener("click", () => {
            const yaAbierto = item.classList.contains("open");

            contenedor.querySelectorAll(".accordion-item.open").forEach(otro => {
                otro.classList.remove("open");
                otro.querySelector(".accordion-answer").style.maxHeight = null;
            });

            if (!yaAbierto) {
                item.classList.add("open");
                respuesta.style.maxHeight = respuesta.scrollHeight + "px";
            }
        });
    });
}


function pintarEquipo() {
    const lista = document.getElementById("teamList");
    const filtrados = filtroEquipoActual === "todos"
        ? equipo
        : equipo.filter(e => e.cat === filtroEquipoActual);

    lista.innerHTML = filtrados.map(e => `
        <div class="team-item">
            <i class="${e.icon}"></i>
            <div class="team-body">
                <h5>${e.nombre}</h5>
                <span class="team-role">${e.rol}</span>
            </div>
            <span class="team-tag">${e.cat}</span>
        </div>
    `).join("");
}

function initFiltroEquipo() {
    const contenedor = document.getElementById("teamFilter");
    contenedor.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            contenedor.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filtroEquipoActual = btn.dataset.cat;
            pintarEquipo();
        });
    });
}


document.addEventListener("DOMContentLoaded", () => {
    pintarStatsGenerales();
    pintarSede(sedeActual);
    initSelectorSede();
    pintarFacilities();
    pintarReglamento();
    pintarEquipo();
    initFiltroEquipo();
});
