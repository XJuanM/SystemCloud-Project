document.addEventListener("DOMContentLoaded", () => {

    const ctx = document.getElementById("attendanceChart");

    new Chart(ctx, {
        type: "line",

        data: {
            labels: ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],

            datasets: [{
                label: "Clientes",
                data: [18,24,20,28,32,26,15],
                borderColor: "#0a9696",
                backgroundColor: "rgba(10,150,150,.15)",
                fill: true,
                tension: .4
            }]
        }
    });

});