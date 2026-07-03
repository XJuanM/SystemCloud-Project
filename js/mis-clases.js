const CLASES = [
    { id:"c1", dia:"Lun", hora:"6:00 AM",  nombre:"CrossFit",  categoria:"crossfit", instructor:"Daniel Rojas", icon:"fa-fire",        cupoTotal:15, cupoOcupado:9  },
    { id:"c2", dia:"Lun", hora:"6:00 PM",  nombre:"Spinning",  categoria:"spinning", instructor:"Laura Gómez",  icon:"fa-bicycle",      cupoTotal:20, cupoOcupado:20 },
    { id:"c3", dia:"Lun", hora:"7:30 PM",  nombre:"Yoga",      categoria:"yoga",     instructor:"Ana Torres",   icon:"fa-leaf",         cupoTotal:12, cupoOcupado:5  },
    { id:"c4", dia:"Mar", hora:"7:00 AM",  nombre:"Funcional", categoria:"funcional",instructor:"Carlos Ibáñez",icon:"fa-person-running",cupoTotal:18, cupoOcupado:11 },
    { id:"c5", dia:"Mar", hora:"5:00 PM",  nombre:"CrossFit",  categoria:"crossfit", instructor:"Daniel Rojas", icon:"fa-fire",         cupoTotal:15, cupoOcupado:14 },
    { id:"c6", dia:"Mié", hora:"6:00 PM",  nombre:"Zumba",     categoria:"zumba",    instructor:"Paola Reyes",  icon:"fa-music",        cupoTotal:25, cupoOcupado:16 },
    { id:"c7", dia:"Mié", hora:"8:00 PM",  nombre:"Pilates",   categoria:"pilates",  instructor:"Ana Torres",   icon:"fa-spa",          cupoTotal:14, cupoOcupado:6  },
    { id:"c8", dia:"Jue", hora:"6:00 AM",  nombre:"Spinning",  categoria:"spinning", instructor:"Laura Gómez",  icon:"fa-bicycle",      cupoTotal:20, cupoOcupado:13 },
    { id:"c9", dia:"Jue", hora:"7:00 PM",  nombre:"Funcional", categoria:"funcional",instructor:"Carlos Ibáñez",icon:"fa-person-running",cupoTotal:18, cupoOcupado:18 },
    { id:"c10",dia:"Vie", hora:"8:00 AM",  nombre:"Yoga",      categoria:"yoga",     instructor:"Ana Torres",   icon:"fa-leaf",         cupoTotal:12, cupoOcupado:4  },
    { id:"c11",dia:"Vie", hora:"6:00 PM",  nombre:"CrossFit",  categoria:"crossfit", instructor:"Daniel Rojas", icon:"fa-fire",         cupoTotal:15, cupoOcupado:8  },
    { id:"c12",dia:"Sáb", hora:"9:00 AM",  nombre:"Zumba",     categoria:"zumba",    instructor:"Paola Reyes",  icon:"fa-music",        cupoTotal:25, cupoOcupado:19 },
    { id:"c13",dia:"Sáb", hora:"11:00 AM", nombre:"Pilates",   categoria:"pilates",  instructor:"Ana Torres",   icon:"fa-spa",          cupoTotal:14, cupoOcupado:10 },
    { id:"c14",dia:"Dom", hora:"9:00 AM",  nombre:"Funcional", categoria:"funcional",instructor:"Carlos Ibáñez",icon:"fa-person-running",cupoTotal:18, cupoOcupado:3  },
];

const CATEGORIAS = [
    { id:"todas",     label:"Todas",     icon:"fa-layer-group" },
    { id:"spinning",  label:"Spinning",  icon:"fa-bicycle" },
    { id:"yoga",      label:"Yoga",      icon:"fa-leaf" },
    { id:"crossfit",  label:"CrossFit",  icon:"fa-fire" },
    { id:"funcional", label:"Funcional", icon:"fa-person-running" },
    { id:"pilates",   label:"Pilates",   icon:"fa-spa" },
    { id:"zumba",     label:"Zumba",     icon:"fa-music" },
];

const DIAS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

const STORAGE_KEY = "misClasesReservas";

let state = {
    diaActivo: DIAS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
    categoriaActiva: "todas",
    busqueda: "",
    reservas: cargarReservas(),
};

function cargarReservas(){
    try{
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    }catch(e){
        return new Set();
    }
}

function guardarReservas(){
    try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.reservas]));
    }catch(e){ }
}

function cupoDisponible(clase){
    return clase.cupoTotal - clase.cupoOcupado;
}

function init(){
    renderDaySelector();
    renderCategoryFilter();
    renderAll();

    document.getElementById("buscarClase").addEventListener("input", (e) => {
        state.busqueda = e.target.value.trim().toLowerCase();
        renderClasses();
    });
}

function renderDaySelector(){
    const cont = document.getElementById("daySelector");
    cont.innerHTML = DIAS.map(dia => `
        <div class="day-pill ${dia === state.diaActivo ? "active" : ""}" data-dia="${dia}">
            ${dia}
        </div>
    `).join("");

    cont.querySelectorAll(".day-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            state.diaActivo = pill.dataset.dia;
            renderDaySelector();
            renderClasses();
        });
    });
}

function renderCategoryFilter(){
    const cont = document.getElementById("categoryFilter");
    cont.innerHTML = CATEGORIAS.map(cat => `
        <div class="category-chip ${cat.id === state.categoriaActiva ? "active" : ""}" data-cat="${cat.id}">
            <i class="fa-solid ${cat.icon}"></i>${cat.label}
        </div>
    `).join("");

    cont.querySelectorAll(".category-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            state.categoriaActiva = chip.dataset.cat;
            renderCategoryFilter();
            renderClasses();
        });
    });
}

function claseFiltradas(){
    return CLASES.filter(c => {
        if(c.dia !== state.diaActivo) return false;
        if(state.categoriaActiva !== "todas" && c.categoria !== state.categoriaActiva) return false;
        if(state.busqueda){
            const texto = (c.nombre + " " + c.instructor).toLowerCase();
            if(!texto.includes(state.busqueda)) return false;
        }
        return true;
    });
}

function renderClasses(){
    const grid = document.getElementById("classesGrid");
    const lista = claseFiltradas();

    document.getElementById("classesCount").textContent = `(${lista.length})`;

    if(lista.length === 0){
        grid.innerHTML = `
            <div class="classes-empty">
                <i class="fa-solid fa-calendar-xmark"></i>
                No hay clases que coincidan con tu búsqueda para este día.
            </div>
        `;
        return;
    }

    grid.innerHTML = lista.map(c => {
        const disponibles = cupoDisponible(c);
        const porcentaje = Math.round((c.cupoOcupado / c.cupoTotal) * 100);
        const reservada = state.reservas.has(c.id);
        const llena = disponibles <= 0 && !reservada;

        let boton;
        if(reservada){
            boton = `<button class="booked" data-id="${c.id}"><i class="fa-solid fa-xmark"></i> Cancelar reserva</button>`;
        }else if(llena){
            boton = `<button disabled>Clase llena</button>`;
        }else{
            boton = `<button data-id="${c.id}"><i class="fa-solid fa-check"></i> Reservar clase</button>`;
        }

        return `
            <div class="class-card ${llena ? "full" : ""}">
                <div class="class-card-top">
                    <div class="class-icon"><i class="fa-solid ${c.icon}"></i></div>
                    <div>
                        <h4>${c.nombre}</h4>
                        <span>${c.instructor}</span>
                    </div>
                </div>

                <div class="class-meta">
                    <span><i class="fa-solid fa-calendar-day"></i>${c.dia} • ${c.hora}</span>
                </div>

                <div class="class-capacity">
                    <div class="class-capacity-top">
                        <span>Cupo</span>
                        <span>${c.cupoOcupado}/${c.cupoTotal}</span>
                    </div>
                    <div class="capacity-track">
                        <div class="capacity-fill ${porcentaje >= 90 ? "low" : ""}" style="width:${porcentaje}%;"></div>
                    </div>
                </div>

                <div class="class-actions">${boton}</div>
            </div>
        `;
    }).join("");

    grid.querySelectorAll("button[data-id]").forEach(btn => {
        btn.addEventListener("click", () => toggleReserva(btn.dataset.id));
    });
}

function toggleReserva(id){
    const clase = CLASES.find(c => c.id === id);
    if(!clase) return;

    if(state.reservas.has(id)){
        state.reservas.delete(id);
        clase.cupoOcupado = Math.max(0, clase.cupoOcupado - 1);
        mostrarToast(`Reserva cancelada: ${clase.nombre}`, "remove");
    }else{
        if(cupoDisponible(clase) <= 0) return;
        state.reservas.add(id);
        clase.cupoOcupado += 1;
        mostrarToast(`¡Clase reservada: ${clase.nombre}!`, "add");
    }

    guardarReservas();
    renderAll();
}

function renderMyClasses(){
    const cont = document.getElementById("myClassesList");
    const reservadas = CLASES.filter(c => state.reservas.has(c.id))
        .sort((a, b) => DIAS.indexOf(a.dia) - DIAS.indexOf(b.dia));

    if(reservadas.length === 0){
        cont.innerHTML = `
            <div class="my-classes-empty">
                <i class="fa-solid fa-calendar-plus"></i>
                <p>Todavía no tienes clases reservadas.<br>Elige una clase disponible para empezar.</p>
            </div>
        `;
        return;
    }

    cont.innerHTML = reservadas.map(c => `
        <div class="my-class-item">
            <div>
                <h4>${c.nombre}</h4>
                <span>${c.dia} • ${c.hora} — ${c.instructor}</span>
            </div>
            <button data-id="${c.id}" title="Cancelar reserva">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `).join("");

    cont.querySelectorAll("button[data-id]").forEach(btn => {
        btn.addEventListener("click", () => toggleReserva(btn.dataset.id));
    });
}

function renderStats(){
    document.getElementById("statReservadas").textContent = state.reservas.size;

    const disponiblesSemana = CLASES.reduce((total, c) => total + cupoDisponible(c), 0);
    document.getElementById("statDisponibles").textContent = disponiblesSemana;

    const diasConReserva = new Set(
        CLASES.filter(c => state.reservas.has(c.id)).map(c => c.dia)
    ).size;
    document.getElementById("statDias").textContent = diasConReserva;
}

function renderAll(){
    renderClasses();
    renderMyClasses();
    renderStats();
}

let toastTimeout;
function mostrarToast(mensaje, tipo){
    const toast = document.getElementById("toast");
    const icono = tipo === "remove" ? "fa-circle-xmark" : "fa-circle-check";

    toast.className = `toast show ${tipo === "remove" ? "remove" : ""}`;
    toast.innerHTML = `<i class="fa-solid ${icono}"></i><span>${mensaje}</span>`;

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

document.addEventListener("DOMContentLoaded", init);
