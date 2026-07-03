(() => {

    const state = {
        client: "Miguel",
        planName: "Premium",
        startDate: new Date(2026, 6, 3),        
        expirationDate: new Date(2026, 7, 28),  
        monthlyPrice: 99900,
        paymentMethod: "Tarjeta terminada en 4521",
        location: "Sede Norte",
        frozen: false,
        benefits: [
            { icon: "fa-dumbbell", text: "Acceso ilimitado a sala de pesas y cardio" },
            { icon: "fa-calendar-days", text: "Reserva de clases grupales sin costo extra" },
            { icon: "fa-user-doctor", text: "Evaluación física mensual" },
            { icon: "fa-utensils", text: "Plan alimenticio personalizado" },
            { icon: "fa-users", text: "Invitado gratis una vez al mes" },
            { icon: "fa-shower", text: "Uso de casilleros y duchas premium" }
        ],
        payments: [
            { date: new Date(2026, 5, 3), concept: "Renovación mensual Premium", amount: 120000, status: "pagado" },
            { date: new Date(2026, 4, 3), concept: "Renovación mensual Premium", amount: 120000, status: "pagado" },
            { date: new Date(2026, 3, 3), concept: "Renovación mensual Premium", amount: 120000, status: "pagado" }
        ]
    };

    const renewalPlans = [
        { id: "mensual", name: "1 mes", days: 30, price: 99900 },
        { id: "trimestral", name: "6 meses", days: 90, price: 529900 },
        { id: "anual", name: "12 meses", days: 365, price: 979900 }
    ];

    let selectedPlanId = renewalPlans[0].id;

    const $ = (id) => document.getElementById(id);

    const formatMoney = (n) =>
        "$" + n.toLocaleString("es-CO");

    const formatDate = (d) =>
        d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

    const daysBetween = (a, b) =>
        Math.ceil((b.setHours(0,0,0,0) - a.setHours(0,0,0,0)) / 86400000);


    const RADIUS = 95;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    function renderRing() {
        const today = new Date();
        const totalDays = daysBetween(new Date(state.startDate), new Date(state.expirationDate));
        const daysLeft = state.frozen
            ? daysBetween(new Date(), new Date(state.expirationDate))
            : daysBetween(new Date(), new Date(state.expirationDate));

        const clampedLeft = Math.max(0, daysLeft);
        const ratio = Math.min(1, Math.max(0, clampedLeft / totalDays));

        const ring = $("ringProgress");
        ring.style.strokeDasharray = `${CIRCUMFERENCE}`;
        ring.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - ratio)}`;

        $("daysLeftLabel").textContent = clampedLeft;

        const badge = $("statusBadge");
        badge.classList.remove("badge-warning", "badge-danger");

        if (state.frozen) {
            badge.textContent = `${state.planName.toUpperCase()} · CONGELADA`;
            badge.classList.add("badge-warning");
        } else if (clampedLeft <= 0) {
            badge.textContent = `${state.planName.toUpperCase()} · VENCIDA`;
            badge.classList.add("badge-danger");
        } else if (clampedLeft <= 7) {
            badge.textContent = `${state.planName.toUpperCase()} · POR VENCER`;
            badge.classList.add("badge-warning");
        } else {
            badge.textContent = `${state.planName.toUpperCase()} · ACTIVA`;
        }
    }


    function renderHeroText() {
        $("planNameText").textContent = state.planName;
        $("startDateText").textContent = formatDate(state.startDate);
        $("expirationDateText").textContent = formatDate(state.expirationDate);
        $("freezeBtn").innerHTML = state.frozen
            ? '<i class="fa-solid fa-play"></i> Reactivar membresía'
            : '<i class="fa-solid fa-snowflake"></i> Congelar membresía';
    }


    function renderBenefits() {
        const list = $("benefitsList");
        list.innerHTML = "";
        state.benefits.forEach((b) => {
            const li = document.createElement("li");
            li.innerHTML = `<i class="fa-solid ${b.icon}"></i><span>${b.text}</span>`;
            list.appendChild(li);
        });
    }

    function renderPlanCard() {
        $("planAmount").textContent = formatMoney(state.monthlyPrice);
        $("paymentMethod").textContent = state.paymentMethod;
        $("nextBilling").textContent = formatDate(state.expirationDate);
        $("planStatus").textContent = state.frozen ? "Congelada" : "Activa";
        $("planLocation").textContent = state.location;
    }


    function renderPayments() {
        const body = $("paymentTableBody");
        body.innerHTML = "";

        state.payments
            .slice()
            .sort((a, b) => b.date - a.date)
            .forEach((p) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${formatDate(p.date)}</td>
                    <td>${p.concept}</td>
                    <td>${formatMoney(p.amount)}</td>
                    <td><span class="status-pill ${p.status}">${p.status === "pagado" ? "Pagado" : "Pendiente"}</span></td>
                `;
                body.appendChild(tr);
            });
    }


    function renderAll() {
        renderRing();
        renderHeroText();
        renderBenefits();
        renderPlanCard();
        renderPayments();
    }


    let toastTimer = null;

    function showToast(message) {
        const toast = $("toast");
        $("toastMessage").textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
    }


    function renderPlanOptions() {
        const container = $("planOptions");
        container.innerHTML = "";

        renewalPlans.forEach((plan) => {
            const div = document.createElement("div");
            div.className = "plan-option" + (plan.id === selectedPlanId ? " selected" : "");
            div.dataset.planId = plan.id;
            div.innerHTML = `
                <span class="opt-name">${plan.name}</span>
                <span class="opt-price">${formatMoney(plan.price)}</span>
            `;
            div.addEventListener("click", () => {
                selectedPlanId = plan.id;
                renderPlanOptions();
                updateModalTotal();
            });
            container.appendChild(div);
        });
    }

    function updateModalTotal() {
        const plan = renewalPlans.find((p) => p.id === selectedPlanId);
        $("modalTotal").textContent = formatMoney(plan.price);
    }

    function openModal() {
        renderPlanOptions();
        updateModalTotal();
        $("renewModal").classList.add("active");
    }

    function closeModal() {
        $("renewModal").classList.remove("active");
    }

    function confirmRenewal() {
        const plan = renewalPlans.find((p) => p.id === selectedPlanId);

        const base = state.expirationDate > new Date() ? state.expirationDate : new Date();
        const newExpiration = new Date(base);
        newExpiration.setDate(newExpiration.getDate() + plan.days);

        state.expirationDate = newExpiration;
        state.frozen = false;

        state.payments.unshift({
            date: new Date(),
            concept: `Renovación ${plan.name} · ${state.planName}`,
            amount: plan.price,
            status: "pagado"
        });

        closeModal();
        renderAll();
        showToast(`Membresía renovada hasta el ${formatDate(newExpiration)}`);
    }


    function toggleFreeze() {
        state.frozen = !state.frozen;
        renderAll();
        showToast(state.frozen ? "Tu membresía fue congelada" : "Tu membresía fue reactivada");
    }


    function bindEvents() {
        $("renewBtn").addEventListener("click", openModal);
        $("cancelRenew").addEventListener("click", closeModal);
        $("confirmRenew").addEventListener("click", confirmRenewal);
        $("freezeBtn").addEventListener("click", toggleFreeze);

        $("renewModal").addEventListener("click", (e) => {
            if (e.target.id === "renewModal") closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeModal();
        });
    }


    document.addEventListener("DOMContentLoaded", () => {
        bindEvents();
        renderAll();
    });

})();
