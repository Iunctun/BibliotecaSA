// ── Proteção de rota — apenas admin ──
(async () => {
    try {
        const resp = await fetch('/BibliotecaSA/backend/sessao.php');
        const data = await resp.json();
        if (!data.logado || data.perfil !== 'admin') {
            window.location.href = '../pages/TelaLogin.html';
        }
    } catch {
        window.location.href = '../pages/TelaLogin.html';
    }
})();

// ── Carrega métricas reais do banco ──
async function carregarMetricas() {
    try {
        const resp = await fetch('/BibliotecaSA/backend/dashboard_dados.php');
        const data = await resp.json();

        if (data.erro) return;

        const valores = document.querySelectorAll('.card-value');
        // Ordem dos cards no HTML: total_livros, total_usuarios, livros_emprestados, livros_atrasados
        if (valores[0]) valores[0].textContent = data.total_livros;
        if (valores[1]) valores[1].textContent = data.total_usuarios;
        if (valores[2]) valores[2].textContent = data.livros_emprestados;
        if (valores[3]) valores[3].textContent = data.livros_atrasados;
    } catch (err) {
        console.error('Erro ao carregar métricas:', err);
    }
}

carregarMetricas();

// ── Gráfico (dados estáticos de atividade — sem alteração) ──
const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];

new Chart(document.getElementById("loginChart"), {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: "Gerencia Usuários",
                data: [30, 45, 80, 72, 78, 85, 120],
                borderColor: "#1a1f3c",
                backgroundColor: "transparent",
                tension: 0.3,
                pointRadius: 5,
                borderWidth: 2,
            },
            {
                label: "Livros Emprestados",
                data: [20, 38, 90, 65, 78, 85, 82, 110],
                borderColor: "#6b7fc4",
                backgroundColor: "transparent",
                tension: 0.3,
                pointRadius: 5,
                borderWidth: 2,
                fill: true
            },
            {
                label: "Controle de Empréstimos",
                data: [5, 10, 20, 30, 40, 38, 50],
                borderColor: "#a8b4e0",
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
        plugins: { legend: { display: false } },
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
