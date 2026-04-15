const labels =  ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];

new Chart(document.getElementById("loginChart"), {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label:"Gerencia Usuários",
                data:[30, 45, 80, 72, 78, 85, 120],
                borderColor: " #1a1f3c",
                backgroundColor: "transparent",
                tension: 0.3,
                pointRadius: 5,
                borderWidth: 2,
            },
            {
                label: "Livros Emprestados",
                data:[20, 38, 90, 65, 78, 85, 82, 110],
                borderColor: " #6b7fc4",
                backgroundColor: "rgba (107, 127, 196, 0.08",
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
    }
}