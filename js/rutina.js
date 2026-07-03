(() => {

    const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const NOMBRES_DIA = {
        lunes: "Lunes", martes: "Martes", miercoles: "Miércoles",
        jueves: "Jueves", viernes: "Viernes", sabado: "Sábado", domingo: "Domingo"
    };
    const INDICE_HOY = [6, 0, 1, 2, 3, 4, 5][new Date().getDay()];

    const NOMBRE_CLIENTE = "Miguel Ortiz";

    function cargarRutinaCliente() {
        try {
            const data = localStorage.getItem("rutinas");
            if (data) {
                const rutinas = JSON.parse(data);
                const propia = rutinas.find(r => r.cliente === NOMBRE_CLIENTE);
                if (propia && DIAS.some(d => (propia.dias[d] || []).length > 0)) {
                    return propia;
                }
            }
        } catch (e) {
            console.warn("No se pudo leer la rutina guardada, se usa una de ejemplo.", e);
        }

        return {
            cliente: NOMBRE_CLIENTE,
            objetivo: "Resistencia",
            nombre: "Principiante",
            duracion: "4 semanas",
            nivel: "Principiante",
            dias: {
                lunes: [
                    { ejercicio: "Sentadillas", series: 4, repeticiones: 12, descanso: 60, observacion: "Mantén la espalda recta" },
                    { ejercicio: "Zancadas", series: 3, repeticiones: 10, descanso: 45, observacion: "" },
                    { ejercicio: "Plancha", series: 3, repeticiones: "40 seg", descanso: 30, observacion: "Core siempre activado" }
                ],
                martes: [],
                miercoles: [
                    { ejercicio: "Press banca", series: 4, repeticiones: 10, descanso: 60, observacion: "" },
                    { ejercicio: "Remo con mancuerna", series: 3, repeticiones: 12, descanso: 45, observacion: "Controla la bajada" }
                ],
                jueves: [],
                viernes: [
                    { ejercicio: "Trote continuo", series: 1, repeticiones: "25 min", descanso: 0, observacion: "Ritmo moderado" },
                    { ejercicio: "Burpees", series: 3, repeticiones: 15, descanso: 45, observacion: "" }
                ],
                sabado: [
                    { ejercicio: "Estiramiento full body", series: 1, repeticiones: "15 min", descanso: 0, observacion: "Enfócate en la respiración" }
                ],
                domingo: []
            }
        };
    }

    const rutina = cargarRutinaCliente();

    let diaSeleccionado = DIAS[INDICE_HOY];

    function getISOWeekKey(d = new Date()) {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
        const week1 = new Date(date.getFullYear(), 0, 4);
        const semana = 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
        return `${date.getFullYear()}-W${semana}`;
    }

    const PROGRESO_KEY = `rutinaProgreso_${NOMBRE_CLIENTE}_${getISOWeekKey()}`;

    function cargarProgreso() {
        try {
            const data = localStorage.getItem(PROGRESO_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    function guardarProgreso(progreso) {
        localStorage.setItem(PROGRESO_KEY, JSON.stringify(progreso));
    }

    let progreso = cargarProgreso();

    function estaCompletado(dia, index) {
        return !!(progreso[dia] && progreso[dia][index]);
    }

    function toggleCompletado(dia, index) {
        if (!progreso[dia]) progreso[dia] = {};
        progreso[dia][index] = !progreso[dia][index];
        guardarProgreso(progreso);
    }


    const $ = (id) => document.getElementById(id);

    function totalEjercicios() {
        return DIAS.reduce((acc, d) => acc + (rutina.dias[d] || []).length, 0);
    }

    function totalCompletados() {
        return DIAS.reduce((acc, d) => {
            const marcados = progreso[d] || {};
            return acc + Object.values(marcados).filter(Boolean).length;
        }, 0);
    }

    function diasConRutina() {
        return DIAS.filter(d => (rutina.dias[d] || []).length > 0).length;
    }


    let toastTimer = null;

    function showToast(message) {
        const toast = $("toast");
        $("toastMessage").textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
    }


    const RADIUS = 86;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    function renderHero() {
        $("clienteNombre").textContent = `Hola, ${rutina.cliente.split(" ")[0]}`;
        $("objetivoText").textContent = rutina.objetivo;
        $("nivelText").textContent = rutina.nivel;
        $("duracionText").textContent = rutina.duracion;
        $("routineBadge").textContent = `RUTINA · ${(rutina.nombre || "").toUpperCase()}`;

        const total = totalEjercicios();
        const hechos = totalCompletados();
        const porcentaje = total === 0 ? 0 : Math.round((hechos / total) * 100);

        const ring = $("ringProgress");
        ring.style.strokeDasharray = `${CIRCUMFERENCE}`;
        ring.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - porcentaje / 100)}`;
        $("ringPercent").textContent = `${porcentaje}%`;

        $("statCompletados").textContent = hechos;
        $("statTotal").textContent = total;
        $("statDias").textContent = diasConRutina();
    }


    function renderDaySelector() {
        const cont = $("daySelector");
        cont.innerHTML = "";

        DIAS.forEach((dia, i) => {
            const ejercicios = rutina.dias[dia] || [];
            const hechos = ejercicios.filter((_, idx) => estaCompletado(dia, idx)).length;

            const pill = document.createElement("div");
            pill.className = "day-pill";
            if (dia === diaSeleccionado) pill.classList.add("active");
            if (i === INDICE_HOY) pill.classList.add("today");
            if (ejercicios.length === 0) pill.classList.add("rest");
            if (ejercicios.length > 0 && hechos === ejercicios.length) pill.classList.add("done");

            pill.innerHTML = `
                <span class="pill-name">${NOMBRES_DIA[dia].slice(0, 3)}</span>
                <span class="pill-count">${ejercicios.length === 0 ? "Descanso" : `${hechos}/${ejercicios.length}`}</span>
            `;

            pill.addEventListener("click", () => {
                diaSeleccionado = dia;
                renderAll();
            });

            cont.appendChild(pill);
        });
    }


    function formatDescanso(segundos) {
        if (!segundos) return null;
        const m = Math.floor(segundos / 60);
        const s = segundos % 60;
        return m > 0 ? `${m}m ${s > 0 ? s + "s" : ""}`.trim() : `${s}s`;
    }

    function renderDayPanel() {
        $("dayTitle").textContent = NOMBRES_DIA[diaSeleccionado];
        const ejercicios = rutina.dias[diaSeleccionado] || [];
        $("dayCount").textContent = `${ejercicios.length} ejercicio${ejercicios.length === 1 ? "" : "s"}`;

        const lista = $("exerciseList");
        lista.innerHTML = "";

        if (ejercicios.length === 0) {
            lista.innerHTML = `
                <div class="empty-day">
                    <i class="fa-solid fa-mug-hot"></i>
                    <p>Día de descanso. Aprovecha para recuperar energía.</p>
                </div>
            `;
            return;
        }

        ejercicios.forEach((ej, index) => {
            const completado = estaCompletado(diaSeleccionado, index);

            const card = document.createElement("div");
            card.className = "exercise-card" + (completado ? " completed" : "");

            const descansoTxt = formatDescanso(Number(ej.descanso));

            card.innerHTML = `
                <div class="exercise-check" data-dia="${diaSeleccionado}" data-index="${index}">
                    <i class="fa-solid fa-check"></i>
                </div>

                <div class="exercise-body">
                    <h4>${ej.ejercicio}</h4>
                    <div class="exercise-meta">
                        <span><i class="fa-solid fa-layer-group"></i>${ej.series} series</span>
                        <span><i class="fa-solid fa-repeat"></i>${ej.repeticiones} reps</span>
                        ${descansoTxt ? `<span><i class="fa-solid fa-clock"></i>${descansoTxt} descanso</span>` : ""}
                    </div>
                    ${ej.observacion ? `<div class="exercise-obs"><i class="fa-solid fa-note-sticky"></i> ${ej.observacion}</div>` : ""}
                </div>

                <div class="exercise-actions">
                    ${Number(ej.descanso) > 0
                        ? `<button class="rest-btn" data-descanso="${ej.descanso}">
                             <i class="fa-solid fa-hourglass-start"></i> Iniciar descanso
                           </button>`
                        : ""}
                </div>
            `;

            lista.appendChild(card);
        });

        lista.querySelectorAll(".exercise-check").forEach((el) => {
            el.addEventListener("click", () => {
                const dia = el.dataset.dia;
                const index = Number(el.dataset.index);
                toggleCompletado(dia, index);
                const nombreEj = ejercicios[index].ejercicio;
                showToast(
                    estaCompletado(dia, index)
                        ? `"${nombreEj}" marcado como completado`
                        : `"${nombreEj}" marcado como pendiente`
                );
                renderAll();
            });
        });

        lista.querySelectorAll(".rest-btn").forEach((btn) => {
            btn.addEventListener("click", () => iniciarDescanso(btn));
        });
    }

    function iniciarDescanso(btn) {
        if (btn.dataset.running === "1") return;

        let restante = Number(btn.dataset.descanso);
        btn.dataset.running = "1";
        btn.classList.add("counting");

        const actualizar = () => {
            const m = Math.floor(restante / 60).toString().padStart(2, "0");
            const s = (restante % 60).toString().padStart(2, "0");
            btn.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> ${m}:${s}`;
        };

        actualizar();

        const intervalo = setInterval(() => {
            restante--;
            if (restante <= 0) {
                clearInterval(intervalo);
                btn.innerHTML = `<i class="fa-solid fa-hourglass-start"></i> Iniciar descanso`;
                btn.classList.remove("counting");
                btn.dataset.running = "0";
                showToast("Descanso terminado, ¡a seguir!");
                return;
            }
            actualizar();
        }, 1000);
    }


    function renderAll() {
        renderHero();
        renderDaySelector();
        renderDayPanel();
    }

    document.addEventListener("DOMContentLoaded", renderAll);

})();
