
//  dashboard.js — v4


const API = '/BibliotecaSA/backend';

// ── Proteção de rota ──
(async () => {
    try {
        const resp = await fetch(`${API}/sessao.php`);
        const data = await resp.json();
        if (!data.logado || data.perfil !== 'admin') {
            window.location.href = '../pages/TelaLogin.html';
        }
    } catch {
        window.location.href = '../pages/TelaLogin.html';
    }
})();

function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

const CORES = [
    '#1d9e75','#3e5bdb','#f59e0b','#e24b4a',
    '#a78bfa','#2dd4bf','#fb923c','#60a5fa',
    '#f472b6','#34d399','#fbbf24','#818cf8'
];

// Fetch seguro — nunca rejeita, retorna null em caso de erro
async function safeFetch(url) {
    try {
        const r = await fetch(url, { credentials: 'same-origin' });
        const text = await r.text();
        return JSON.parse(text);
    } catch (e) {
        console.warn('Falha ao carregar:', url, e.message);
        return null;
    }
}

async function init() {
    const [metricas, grafico, recentes, categorias] = await Promise.all([
        safeFetch(`${API}/dashboard_dados.php`),
        safeFetch(`${API}/dashboard_grafico.php`),
        safeFetch(`${API}/dashboard_recentes.php`),
        safeFetch(`${API}/dashboard_categorias.php`),
    ]);

    if (metricas)   renderMetricas(metricas);
    if (grafico)    renderGrafico(grafico);
    renderRecentes(recentes);
    if (categorias) renderCategorias(categorias);
}

// ── Cards principais ──
function renderMetricas(d) {
    if (d.erro) return;
    set('val-livros',      d.total_livros      ?? '—');
    set('val-usuarios',    d.total_usuarios     ?? '—');
    set('val-emprestados', d.livros_emprestados ?? '—');
    set('val-atrasados',   d.livros_atrasados   ?? '—');
    set('val-disponiveis', d.livros_disponiveis ?? '—');
    set('val-reservas',    d.reservas_ativas    ?? '—');
    set('val-categorias',  d.total_categorias   ?? '—');

    const taxa = d.total_livros > 0
        ? Math.round((d.livros_emprestados / d.total_livros) * 100) + '%'
        : '0%';
    set('val-taxa', taxa);
}

// ── Gráfico de barras ──
function renderGrafico(d) {
    if (!d || d.erro) return;
    const ctx = document.getElementById('emprestimosChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: d.labels,
            datasets: [
                {
                    label: 'Empréstimos',
                    data: d.emprestimos,
                    backgroundColor: 'rgba(29,158,117,0.7)',
                    borderColor: '#1d9e75',
                    borderWidth: 1,
                    borderRadius: 3,
                },
                {
                    label: 'Atrasos',
                    data: d.atrasos,
                    backgroundColor: 'rgba(226,75,74,0.55)',
                    borderColor: '#e24b4a',
                    borderWidth: 1,
                    borderRadius: 3,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e2128',
                    titleColor: '#fff',
                    bodyColor: 'rgba(255,255,255,0.6)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 }, stepSize: 1 },
                    beginAtZero: true
                }
            }
        }
    });
}

// ── Empréstimos recentes ──
function renderRecentes(lista) {
    const el    = document.getElementById('lista-recentes');
    const badge = document.getElementById('badge-recentes');
    if (!el) return;

    if (!lista || lista.erro || !Array.isArray(lista) || lista.length === 0) {
        el.innerHTML = '<div class="recent-loading" style="color:rgba(255,255,255,0.2);font-size:13px;letter-spacing:1px;">Nenhum empréstimo ativo</div>';
        if (badge) badge.textContent = '0';
        return;
    }

    if (badge) badge.textContent = lista.length;

    el.innerHTML = lista.map(item => {
        const inicial     = item.nome ? item.nome.charAt(0).toUpperCase() : '?';
        const atrasado    = item.atrasado == 1 || item.atrasado === true;
        const statusClass = atrasado ? 'atrasado' : 'ativo';
        const statusLabel = atrasado ? 'Atrasado' : 'Ativo';
        const devolucao   = item.data_devolucao
            ? new Date(item.data_devolucao + 'T00:00:00').toLocaleDateString('pt-BR')
            : '—';
        return `
            <div class="recent-item">
                <div class="recent-avatar">${inicial}</div>
                <div class="recent-info">
                    <div class="recent-name">${item.nome}</div>
                    <div class="recent-livro">${item.titulo} · dev. ${devolucao}</div>
                </div>
                <span class="recent-status ${statusClass}">${statusLabel}</span>
            </div>
        `;
    }).join('');
}

// ── Gráfico doughnut + lista de categorias ──
function renderCategorias(lista) {
    if (!lista || lista.erro || !Array.isArray(lista) || lista.length === 0) return;

    const catList = document.getElementById('cat-list');
    const ctx     = document.getElementById('categoriasChart');
    const labels  = lista.map(c => c.categoria);
    const values  = lista.map(c => parseInt(c.total));
    const colors  = lista.map((_, i) => CORES[i % CORES.length]);

    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.map(c => c + 'cc'),
                    borderColor: colors,
                    borderWidth: 1.5,
                    hoverOffset: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e2128',
                        titleColor: '#fff',
                        bodyColor: 'rgba(255,255,255,0.6)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                    }
                }
            }
        });
    }

    if (catList) {
        catList.innerHTML = lista.map((c, i) => `
            <div class="cat-item">
                <span class="cat-dot" style="background:${CORES[i % CORES.length]};"></span>
                <span class="cat-name">${c.categoria}</span>
                <span class="cat-count">${c.total}</span>
            </div>
        `).join('');
    }
}

init();
