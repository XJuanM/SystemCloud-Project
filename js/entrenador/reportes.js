$(document).ready(function () {
  const ctx = document.getElementById("alumnosChart").getContext("2d");
  $("#tablaReportes").DataTable({
    // Configuración de idioma al español
    language: {
      sProcessing: "Procesando...",
      sLengthMenu: "Mostrar _MENU_ alumnos",
      sZeroRecords: "No se encontraron resultados",
      sEmptyTable: "Ningún dato disponible en esta tabla",
      sInfo:
        "Mostrando alumnos del _START_ al _END_ de un total de _TOTAL_ alumnos",
      sInfoEmpty: "Mostrando alumnos del 0 al 0 de un total de 0 alumnos",
      sInfoFiltered: "(filtrado de un total de _MAX_ alumnos)",
      sSearch: "Buscar:",
      oPaginate: {
        sFirst: "Primero",
        sLast: "Último",
        sNext: "Siguiente",
        sPrevious: "Anterior",
      },
    },
    // Configuración para elegir la cantidad de alumnos a ver
    lengthMenu: [
      [5, 10, 25, 50, -1],
      [5, 10, 25, 50, "Todos"],
    ],
    pageLength: 5, // Cantidad por defecto
    order: [[0, "asc"]], // Ordenar por la primera columna
  });
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      datasets: [
        {
          label: "Asistencia Alumnos",
          data: [12, 19, 15, 22, 28, 25],
          borderColor: "#0a9696",
          backgroundColor: "rgba(10, 150, 150, 0.2)",
          fill: true,
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });
});
