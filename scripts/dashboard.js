const labels =  ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];

new Chart(document.getElementById("loginChart"), {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label:"Gerencia Usuários",
                data:[30, 45, 80, 72, 78, 85, 120],
                borderColor: "#1a1f3c",
                backgroundColor: "transparent",
                tension: 0.3,
                pointRadius: 5,
                borderWidth: 2,
            },
            {
                label: "Livros Emprestados",
                data:[20, 38, 90, 65, 78, 85, 82, 110],
                borderColor: " #6b7fc4",
                backgroundColor: "transparent",
                tension: 0.3,
                pointRadius: 5,
                borderWidth: 2,
                fill: true
            },
            {
                label: "Controle de Emprestimos",
                data:[5, 10, 20, 30, 40, 38, 50],
                borderColor: " #a8b4e0",
                backgroundColor: "transparent",
                tension: 0.3,
                pointRadius: 5,
                borderWidth: 1.5,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                grid: { color: "rgba(0,0,0,0.05)" },
                ticks: { font: { size: 12 }, color: "#888" }
            },
            y: {
                grid: { color: "rgba(0,0,0,0.05)" },
                ticks: { font: { size: 12 }, color: "#888" },
                beginAtZero: true
                }
        }
    }            
});
