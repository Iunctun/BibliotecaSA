// TelaMeusLivros.js
// Carrega empréstimos ativos do usuário logado e renderiza os cards

const API = '/BibliotecaSA/backend';
let toastTimer = null;

document.addEventListener('DOMContentLoaded', async () => {

    // ── Proteção de rota ──
    let sessao = null;
    try {
        const r = await fetch(`${API}/sessao.php`, { credentials: 'same-origin' });
        sessao = await r.json();
        if (!sessao.logado) {
            window.location.href = '../pages/TelaLogin.html';
            return;
        }
    } catch {
        window.location.href = '../pages/TelaLogin.html';
        return;
    }

    // Exibe itens de admin/dev na sidebar
    if (sessao.perfil === 'admin' || sessao.perfil === 'desenvolvedor') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
    }
    if (sessao.perfil === 'desenvolvedor') {
        document.querySelectorAll('.dev-only').forEach(el => el.style.display = 'flex');
    }

    // ── Carrega livros ──
    try {
        const r = await fetch(`${API}/meus_livros.php`, { credentials: 'same-origin' });
        const data = await r.json();

        document.getElementById('loadingState').style.display = 'none';

        if (data.erro) {
            mostrarToast(data.erro, true);
            return;
        }

        const livros = data.livros || [];

        if (livros.length === 0) {
            document.getElementById('estadoVazio').style.display = 'flex';
            return;
        }

        const grid = document.getElementById('livrosGrid');
        grid.style.display = 'grid';
        grid.innerHTML = livros.map(livro => renderCard(livro)).join('');

        // Delegar cliques nos cards e botões
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.card-livro');
            if (!card) return;
            const empId  = card.dataset.empId;
            const livroId = card.dataset.livroId;
            abrirLeitor(empId, livroId);
        });

    } catch {
        document.getElementById('loadingState').style.display = 'none';
        mostrarToast('Erro ao carregar seus livros.', true);
    }
});

// ── Render de um card ──
function renderCard(livro) {
    const capa   = livro.capa_path ? `/BibliotecaSA/${livro.capa_path}` : '../img/livro-placeholder.webp';
    const dtLoc  = livro.data_retirada
        ? new Date(livro.data_retirada + 'T00:00:00').toLocaleDateString('pt-BR')
        : '—';

    const pct        = parseInt(livro.percentual) || 0;
    const paginaAtual = parseInt(livro.pagina_atual) || 1;
    const totalPags   = parseInt(livro.total_paginas) || 10;
    const status      = livro.status_leitura || 'nao_iniciado';

    const { badgeClass, badgeLabel, badgeIcon } = infoStatus(status);
    const concluido = status === 'concluido';
    const fillClass = concluido ? 'progresso-barra-fill concluido' : 'progresso-barra-fill';

    let btnLabel = 'Ler Livro';
    let btnClass = 'btn-ler btn-ler-primario';
    let btnIcon  = 'fa-solid fa-book-open-reader';
    if (status === 'em_leitura') { btnLabel = 'Continuar Leitura'; }
    if (concluido)               { btnLabel = 'Ler Novamente'; btnClass = 'btn-ler btn-ler-concluido'; btnIcon = 'fa-solid fa-rotate-right'; }

    return `
        <div class="card-livro"
             data-emp-id="${livro.emprestimo_id}"
             data-livro-id="${livro.livro_id}"
             title="Abrir ${livro.titulo}">
          <div class="card-capa-wrap">
            <img class="card-capa"
                 src="${capa}"
                 alt="Capa de ${livro.titulo}"
                 onerror="this.src='../img/livro-placeholder.webp'" />
            <span class="card-status-badge ${badgeClass}">
              <i class="${badgeIcon}" style="font-size:8px;margin-right:4px;"></i>${badgeLabel}
            </span>
          </div>
          <div class="card-body">
            <div class="card-titulo">${livro.titulo}</div>
            <div class="card-autor">${livro.autor}</div>
            <div class="card-locacao">
              <i class="fa-regular fa-calendar" style="margin-right:5px;opacity:.5;"></i>Locado em ${dtLoc}
            </div>
            <div class="progresso-wrap">
              <div class="progresso-labels">
                <span>Progresso</span>
                <span class="progresso-pct">${pct}%</span>
              </div>
              <div class="progresso-barra-bg">
                <div class="${fillClass}" style="width:${pct}%"></div>
              </div>
            </div>
            <div class="card-pagina">
              <i class="fa-regular fa-file-lines" style="margin-right:5px;opacity:.4;"></i>
              Página ${paginaAtual} de ${totalPags}
            </div>
            <button class="${btnClass}">
              <i class="${btnIcon}"></i> ${btnLabel}
            </button>
          </div>
        </div>
    `;
}

// ── Status helpers ──
function infoStatus(status) {
    switch (status) {
        case 'em_leitura':
            return { badgeClass: 'badge-em-leitura', badgeLabel: 'Em Leitura', badgeIcon: 'fa-solid fa-book-open-reader' };
        case 'concluido':
            return { badgeClass: 'badge-concluido', badgeLabel: 'Concluído', badgeIcon: 'fa-solid fa-check' };
        default:
            return { badgeClass: 'badge-nao-iniciado', badgeLabel: 'Não Iniciado', badgeIcon: 'fa-regular fa-clock' };
    }
}

// ── Abre o leitor ──
function abrirLeitor(empId, livroId) {
    window.location.href = `../pages/TelaLeitorLivro.html?emp=${empId}&livro=${livroId}`;
}

// ── Toast ──
function mostrarToast(msg, erro = false) {
    clearTimeout(toastTimer);
    const toast = document.getElementById('toastML');
    const icon  = document.getElementById('tmIconEl');
    document.getElementById('tmMsg').textContent = msg;
    icon.className = erro ? 'fa-solid fa-xmark' : 'fa-solid fa-check';
    toast.classList.toggle('erro', erro);
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}
