const ctx = document.getElementById("progressChart");

console.log(ctx);

new Chart(ctx, {

    type: "line",

    data: {

        labels: ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],

        datasets: [{

            label:"Progreso semanal",

            data: [12,19,8,15,22,18,10],

            borderColor:"#0a9696",

            backgroundColor:"rgba(10,150,150,.2)",

            fill:true

        }]

    }

});