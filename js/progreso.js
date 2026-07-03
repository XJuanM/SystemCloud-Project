(function () {
    'use strict';

    const HOY = new Date();

    const META = {
        pesoInicial: 88,
        pesoObjetivo: 76,
        grasaInicial: 28,
        grasaObjetivo: 18,
        cinturaInicial: 96,
        cinturaObjetivo: 84,
        entrenamientosMeta: 20
    };

    function generarHistorialPeso() {
        const dias = 365;
        const historial = [];
        let peso = META.pesoInicial;
        for (let i = dias; i >= 0; i--) {
            const fecha = new Date(HOY);
            fecha.setDate(fecha.getDate() - i);
            const progreso = (dias - i) / dias;
            const tendencia = META.pesoInicial - (META.pesoInicial - 79) * progreso;
            const ruido = (Math.sin(i * 0.7) + Math.random() - 0.5) * 0.6;
            peso = Math.max(76, tendencia + ruido);
            historial.push({
                fecha: fecha.toISOString().slice(0, 10),
                peso: Number(peso.toFixed(1))
            });
        }
        return historial;
    }

    function generarAsistencia() {
        const dias = 84;
        const asistencia = {};
        for (let i = dias; i >= 0; i--) {
            const fecha = new Date(HOY);
            fecha.setDate(fecha.getDate() - i);
            const key = fecha.toISOString().slice(0, 10);
            const diaSemana = fecha.getDay();
            const prob = (diaSemana === 0) ? 0.25 : 0.7;
            asistencia[key] = Math.random() < prob ? 1 : 0;
        }
        return asistencia;
    }

    const RECORDS = [
        { nombre: 'Press banca', categoria: 'fuerza', valor: '92 kg', fecha: '18 jun 2026', icono: 'fa-dumbbell' },
        { nombre: 'Sentadilla',  categoria: 'fuerza', valor: '128 kg', fecha: '25 jun 2026', icono: 'fa-dumbbell' },
        { nombre: 'Peso muerto', categoria: 'fuerza', valor: '150 kg', fecha: '30 jun 2026', icono: 'fa-dumbbell' },
        { nombre: 'Dominadas estrictas', categoria: 'fuerza', valor: '14 reps', fecha: '12 jun 2026', icono: 'fa-hand-fist' },
        { nombre: '5 km en cinta', categoria: 'cardio', valor: '22:41 min', fecha: '28 jun 2026', icono: 'fa-person-running' },
        { nombre: 'Remo 2000 m', categoria: 'cardio', valor: '7:58 min', fecha: '20 jun 2026', icono: 'fa-person-swimming' },
        { nombre: 'Plancha', categoria: 'cardio', valor: '3:45 min', fecha: '15 jun 2026', icono: 'fa-stopwatch' }
    ];

    let historialPeso = generarHistorialPeso();
    let asistencia = generarAsistencia();
    let rangoActivo = 30;
    let filtroRecords = 'todos';


    function toast(msg, icono = 'fa-circle-check') {
        const el = document.getElementById('toast');
        el.innerHTML = `<i class="fa-solid ${icono}"></i><span>${msg}</span>`;
        el.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => el.classList.remove('show'), 2800);
    }

    function formatoFecha(iso) {
        const d = new Date(iso + 'T00:00:00');
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    }

    function contarEntrenamientosMes() {
        const inicioMes = new Date(HOY.getFullYear(), HOY.getMonth(), 1);
        return Object.entries(asistencia).filter(([fecha, val]) => {
            return val === 1 && new Date(fecha + 'T00:00:00') >= inicioMes;
        }).length;
    }

    function calcularRachaActual() {
        let racha = 0;
        for (let i = 0; i < 400; i++) {
            const fecha = new Date(HOY);
            fecha.setDate(fecha.getDate() - i);
            const key = fecha.toISOString().slice(0, 10);
            if (asistencia[key]) {
                racha++;
            } else if (i === 0) {
                continue; 
            } else {
                break;
            }
        }
        return racha;
    }

    function calcularRachaMax() {
        const claves = Object.keys(asistencia).sort();
        let max = 0, actual = 0;
        claves.forEach(k => {
            if (asistencia[k]) {
                actual++;
                max = Math.max(max, actual);
            } else {
                actual = 0;
            }
        });
        return max;
    }


    function renderStats() {
        const pesoActual = historialPeso[historialPeso.length - 1].peso;
        document.getElementById('statEntrenamientos').textContent = contarEntrenamientosMes();
        document.getElementById('statRacha').textContent = calcularRachaActual();
        document.getElementById('statPeso').textContent = `${pesoActual.toFixed(1)} kg`;
        document.getElementById('statRecords').textContent = RECORDS.length;
    }


    function renderMeta() {
        const pesoActual = historialPeso[historialPeso.length - 1].peso;
        const entrenamientosMes = contarEntrenamientosMes();

        const pctEntrenos = Math.min(100, Math.round((entrenamientosMes / META.entrenamientosMeta) * 100));
        const circ = 2 * Math.PI * 80;
        const ring = document.getElementById('ringProgress');
        ring.style.strokeDasharray = circ;
        ring.style.strokeDashoffset = circ - (circ * pctEntrenos) / 100;
        document.getElementById('ringPercent').textContent = `${pctEntrenos}%`;
        document.getElementById('ringLabel').textContent = `${entrenamientosMes}/${META.entrenamientosMeta}`;

        const perdido = Math.max(0, META.pesoInicial - pesoActual);
        document.getElementById('resumenPerdido').textContent = `${perdido.toFixed(1)} kg`;

        const faltante = Math.max(0, pesoActual - META.pesoObjetivo);
        const ritmoSemanal = 0.4; 
        const semanas = faltante > 0 ? Math.ceil(faltante / ritmoSemanal) : 0;
        document.getElementById('resumenTiempo').textContent = semanas > 0 ? `${semanas} semanas` : '¡meta alcanzada!';

        const pctPeso = Math.min(100, Math.max(0,
            ((META.pesoInicial - pesoActual) / (META.pesoInicial - META.pesoObjetivo)) * 100));
        document.getElementById('barPeso').style.width = `${pctPeso}%`;
        document.getElementById('barPesoValor').textContent = `${pesoActual.toFixed(1)} / ${META.pesoObjetivo} kg`;

        const avance = pctPeso / 100;
        const grasaActual = META.grasaInicial - (META.grasaInicial - META.grasaObjetivo) * avance;
        const cinturaActual = META.cinturaInicial - (META.cinturaInicial - META.cinturaObjetivo) * avance;

        document.getElementById('barGrasa').style.width = `${avance * 100}%`;
        document.getElementById('barGrasaValor').textContent = `${grasaActual.toFixed(1)} / ${META.grasaObjetivo}%`;

        document.getElementById('barCintura').style.width = `${avance * 100}%`;
        document.getElementById('barCinturaValor').textContent = `${cinturaActual.toFixed(0)} / ${META.cinturaObjetivo} cm`;
    }

    function renderHeatmap() {
        const cont = document.getElementById('heatmap');
        cont.innerHTML = '';

        const claves = Object.keys(asistencia).sort();
        claves.forEach(key => {
            const cell = document.createElement('div');
            cell.className = 'heat-cell';
            if (asistencia[key]) {
                // variar intensidad un poco para dar textura visual
                const nivel = 1 + Math.floor(Math.random() * 4);
                cell.classList.add(`level-${nivel}`);
            }
            cell.title = `${formatoFecha(key)} · ${asistencia[key] ? 'Entrenaste' : 'Descanso'}`;
            cont.appendChild(cell);
        });

        document.getElementById('rachaMax').textContent = `${calcularRachaMax()} días`;
    }

    function datosEnRango(dias) {
        return historialPeso.slice(-dias);
    }

    function renderChart() {
        const datos = datosEnRango(rangoActivo);
        const svg = document.getElementById('pesoChart');
        svg.innerHTML = '';

        if (datos.length < 2) return;

        const W = 800, H = 260, PAD_X = 20, PAD_Y = 30;
        const pesos = datos.map(d => d.peso);
        const min = Math.min(...pesos) - 1;
        const max = Math.max(...pesos) + 1;

        const x = i => PAD_X + (i / (datos.length - 1)) * (W - PAD_X * 2);
        const y = p => H - PAD_Y - ((p - min) / (max - min)) * (H - PAD_Y * 2);

        for (let i = 0; i <= 3; i++) {
            const val = min + ((max - min) * i) / 3;
            const yy = y(val);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', PAD_X);
            line.setAttribute('x2', W - PAD_X);
            line.setAttribute('y1', yy);
            line.setAttribute('y2', yy);
            line.setAttribute('stroke', 'rgba(255,255,255,.06)');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', 4);
            label.setAttribute('y', yy + 4);
            label.setAttribute('fill', '#8a8a8a');
            label.setAttribute('font-size', '10');
            label.textContent = `${val.toFixed(0)}kg`;
            svg.appendChild(label);
        }

        const puntos = datos.map((d, i) => `${x(i)},${y(d.peso)}`).join(' ');
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', puntos);
        polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', '#43e6e6');
        polyline.setAttribute('stroke-width', '3');
        polyline.setAttribute('stroke-linecap', 'round');
        polyline.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(polyline);

        const areaPts = `${x(0)},${H - PAD_Y} ${puntos} ${x(datos.length - 1)},${H - PAD_Y}`;
        const area = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        area.setAttribute('points', areaPts);
        area.setAttribute('fill', 'rgba(10,150,150,.12)');
        svg.appendChild(area);

        const paso = Math.max(1, Math.floor(datos.length / 60));
        const tooltip = document.getElementById('chartTooltip');
        const wrap = svg.parentElement;

        datos.forEach((d, i) => {
            if (i % paso !== 0 && i !== datos.length - 1) return;
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x(i));
            circle.setAttribute('cy', y(d.peso));
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', '#43e6e6');
            circle.classList.add('chart-point');
            circle.addEventListener('mouseenter', (e) => {
                const rect = wrap.getBoundingClientRect();
                const px = (x(i) / W) * rect.width;
                const py = (y(d.peso) / H) * rect.height;
                tooltip.style.left = `${px}px`;
                tooltip.style.top = `${py}px`;
                tooltip.textContent = `${formatoFecha(d.fecha)} · ${d.peso} kg`;
                tooltip.classList.add('show');
            });
            circle.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
            svg.appendChild(circle);
        });
    }


    function renderRecords() {
        const cont = document.getElementById('recordsList');
        cont.innerHTML = '';

        const filtrados = RECORDS.filter(r => filtroRecords === 'todos' || r.categoria === filtroRecords);

        if (filtrados.length === 0) {
            cont.innerHTML = '<p style="color:#9a9a9a; font-size:.85rem;">No hay récords en esta categoría todavía.</p>';
            return;
        }

        filtrados.forEach(r => {
            const item = document.createElement('div');
            item.className = 'record-item';
            item.innerHTML = `
                <i class="fa-solid ${r.icono}"></i>
                <div class="record-body">
                    <h5>${r.nombre}</h5>
                    <span class="record-date">${r.fecha}</span>
                </div>
                <span class="record-value">${r.valor}</span>
            `;
            cont.appendChild(item);
        });
    }

    function initRangeSelector() {
        document.getElementById('rangeSelector').addEventListener('click', (e) => {
            const btn = e.target.closest('.range-btn');
            if (!btn) return;
            document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            rangoActivo = Number(btn.dataset.range);
            renderChart();
        });
    }

    function initRecordsFilter() {
        document.getElementById('recordsFilter').addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtroRecords = btn.dataset.cat;
            renderRecords();
        });
    }

    function initLogForm() {
        document.getElementById('logForm').addEventListener('submit', (e) => {
            e.preventDefault();

            const pesoInput = document.getElementById('inputPeso');
            const entrenoInput = document.getElementById('inputEntreno');

            const peso = parseFloat(pesoInput.value);
            if (isNaN(peso) || peso <= 0) {
                toast('Ingresa un peso válido', 'fa-circle-exclamation');
                return;
            }

            const hoyKey = HOY.toISOString().slice(0, 10);

            const idxHoy = historialPeso.findIndex(d => d.fecha === hoyKey);
            if (idxHoy >= 0) {
                historialPeso[idxHoy].peso = peso;
            } else {
                historialPeso.push({ fecha: hoyKey, peso });
            }

            asistencia[hoyKey] = entrenoInput.checked ? 1 : 0;

            renderStats();
            renderMeta();
            renderHeatmap();
            renderChart();

            toast('Registro guardado con éxito');
            pesoInput.value = '';
            document.getElementById('inputGrasa').value = '';
        });
    }


    function init() {
        renderStats();
        renderMeta();
        renderHeatmap();
        renderChart();
        renderRecords();

        initRangeSelector();
        initRecordsFilter();
        initLogForm();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
