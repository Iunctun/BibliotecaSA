// TelaLeitorLivro.js
// Leitor digital com animação de troca de páginas e persistência de progresso

const API = '/BibliotecaSA/backend';
const TOTAL_PAGINAS = 10;

let empId       = null;
let livroId     = null;
let livro       = null;
let paginaAtual = 1;
let animando    = false;
let toastTimer  = null;

// ── Conteúdo fictício das páginas 2 a 9 ──
const CONTEUDO_PAGINAS = [
    // índice 0 = página 2
    {
        titulo: 'Capítulo I — O Começo',
        texto: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed perspiciatis unde omnis iste natus error sit voluptatem.'
        ]
    },
    {
        titulo: 'Capítulo II — O Encontro',
        texto: [
            'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit.',
            'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.'
        ]
    },
    {
        titulo: 'Capítulo III — A Revelação',
        texto: [
            'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.',
            'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.'
        ]
    },
    {
        titulo: 'Capítulo IV — A Viagem',
        texto: [
            'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? Ut enim ad minima veniam.',
            'Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo.'
        ]
    },
    {
        titulo: 'Capítulo V — O Confronto',
        texto: [
            'Nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?'
        ]
    },
    {
        titulo: 'Capítulo VI — A Transformação',
        texto: [
            'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum dolorem eum fugiat quo voluptas nulla pariatur at vero eos et accusamus.',
            'Et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt.'
        ]
    },
    {
        titulo: 'Capítulo VII — O Retorno',
        texto: [
            'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.',
            'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae itaque earum rerum hic tenetur.'
        ]
    },
    {
        titulo: 'Capítulo VIII — O Desfecho',
        texto: [
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae.',
            'Vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'
        ]
    },
];

// ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

    // ── Lê parâmetros da URL ──
    const params = new URLSearchParams(window.location.search);
    empId   = params.get('emp');
    livroId = params.get('livro');

    if (!empId || !livroId) {
        window.location.href = '../pages/TelaMeusLivros.html';
        return;
    }

    // ── Proteção de rota e sessão ──
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

    // Sidebar: exibe itens de admin/dev
    if (sessao.perfil === 'admin' || sessao.perfil === 'desenvolvedor') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
    }
    if (sessao.perfil === 'desenvolvedor') {
        document.querySelectorAll('.dev-only').forEach(el => el.style.display = 'flex');
    }

    // ── Carrega dados do livro ──
    try {
        const r = await fetch(`${API}/livros_detalhe.php?id=${livroId}`, { credentials: 'same-origin' });
        livro = await r.json();
        if (livro.erro) throw new Error(livro.erro);
    } catch {
        window.location.href = '../pages/TelaMeusLivros.html';
        return;
    }

    // ── Valida que o empréstimo pertence ao usuário (via meus_livros) ──
    try {
        const r = await fetch(`${API}/meus_livros.php`, { credentials: 'same-origin' });
        const data = await r.json();
        const meus = data.livros || [];
        const encontrado = meus.find(l => String(l.emprestimo_id) === String(empId) && String(l.livro_id) === String(livroId));

        if (!encontrado) {
            // Acesso inválido: redireciona com aviso
            sessionStorage.setItem('meuslvr_aviso', 'Você não tem permissão para acessar este livro.');
            window.location.href = '../pages/TelaMeusLivros.html';
            return;
        }

        // Restaura a última página salva
        paginaAtual = parseInt(encontrado.pagina_atual) || 1;

    } catch {
        window.location.href = '../pages/TelaMeusLivros.html';
        return;
    }

    // ── Monta o leitor ──
    document.title = `Lendo: ${livro.titulo} — Biblioteca`;
    document.getElementById('loadingState').style.display = 'none';

    const leitorConteudo = document.getElementById('leitorConteudo');
    leitorConteudo.style.display = 'flex';

    // Preenche o header
    const capa = livro.capa_path ? `/BibliotecaSA/${livro.capa_path}` : '../img/livro-placeholder.webp';
    document.getElementById('leitorCapaMini').src = capa;
    document.getElementById('leitorTitulo').textContent = livro.titulo;
    document.getElementById('leitorAutor').textContent  = `Por ${livro.autor}`;

    // Constrói todas as páginas no DOM
    construirPaginas();

    // Vai direto para a página salva (sem animação)
    irParaPagina(paginaAtual, false);

    // ── Botões de navegação ──
    document.getElementById('btnAnterior').addEventListener('click', () => {
        if (animando || paginaAtual <= 1) return;
        navegarPara(paginaAtual - 1, 'esquerda');
    });

    document.getElementById('btnProxima').addEventListener('click', () => {
        if (animando || paginaAtual >= TOTAL_PAGINAS) return;
        navegarPara(paginaAtual + 1, 'direita');
    });

    // ── Aviso de acesso inválido (vindo de redirect) ──
    const aviso = sessionStorage.getItem('meuslvr_aviso');
    if (aviso) {
        sessionStorage.removeItem('meuslvr_aviso');
        mostrarToast(aviso, true);
    }
});

// ── Constrói todas as 10 páginas no DOM ──
function construirPaginas() {
    const wrapper = document.getElementById('paginasWrapper');
    wrapper.innerHTML = '';

    for (let i = 1; i <= TOTAL_PAGINAS; i++) {
        const div = document.createElement('div');
        div.className = 'pagina pagina-entrando-direita';
        div.id = `pagina-${i}`;
        div.innerHTML = htmlPagina(i);
        wrapper.appendChild(div);
    }

    // Botão "Começar Leitura" na página 1
    const btnComecar = document.getElementById('btnComecar');
    if (btnComecar) {
        btnComecar.addEventListener('click', () => {
            if (animando) return;
            navegarPara(2, 'direita');
        });
    }

    // Botão "Voltar à biblioteca" na página 10
    const btnVoltarBib = document.getElementById('btnVoltarBiblioteca');
    if (btnVoltarBib) {
        btnVoltarBib.addEventListener('click', () => {
            window.location.href = '../pages/TelaMeusLivros.html';
        });
    }
}

// ── Gera o HTML de cada página ──
function htmlPagina(num) {
    const capa = livro.capa_path ? `/BibliotecaSA/${livro.capa_path}` : '../img/livro-placeholder.webp';
    const ano  = livro.data_publicacao ? livro.data_publicacao.substring(0, 4) : '—';

    // Página 1: apresentação
    if (num === 1) {
        return `
            <div class="pagina-apresentacao">
                <img class="pag-capa-grande" src="${capa}" alt="Capa" onerror="this.src='../img/livro-placeholder.webp'" />
                <p class="pag-numero">Página 1 de ${TOTAL_PAGINAS}</p>
                <h2 class="pag-titulo-livro">${livro.titulo}</h2>
                <p class="pag-autor-livro">${livro.autor}</p>
                <p class="pag-publicacao">Publicado em ${ano}</p>
                <div class="pag-divisor"></div>
                <button class="btn-comecar" id="btnComecar">
                    <i class="fa-solid fa-book-open-reader"></i> Começar Leitura
                </button>
            </div>
        `;
    }

    // Página 10: conclusão
    if (num === TOTAL_PAGINAS) {
        return `
            <div class="pagina-final">
                <div class="pag-final-icone"><i class="fa-solid fa-trophy"></i></div>
                <p class="pag-numero">Página ${num} de ${TOTAL_PAGINAS}</p>
                <h2 class="pag-final-titulo">Fim da Leitura</h2>
                <p class="pag-final-sub">
                    Você concluiu <em>${livro.titulo}</em>. Esperamos que tenha aproveitado esta leitura!
                </p>
                <button class="btn-voltar-biblioteca" id="btnVoltarBiblioteca">
                    <i class="fa-solid fa-arrow-left"></i> Voltar à Biblioteca
                </button>
            </div>
        `;
    }

    // Páginas 2–9: conteúdo fictício
    const conteudo = CONTEUDO_PAGINAS[num - 2] || CONTEUDO_PAGINAS[0];
    const parasHtml = conteudo.texto.map(p => `<p>${p}</p>`).join('');

    return `
        <div class="pag-conteudo">
            <p class="pag-numero">Página ${num} de ${TOTAL_PAGINAS}</p>
            <h3 class="pag-titulo-secao">${conteudo.titulo}</h3>
            <div class="pag-texto">${parasHtml}</div>
        </div>
    `;
}

// ── Vai para a página sem animação (restauração de progresso) ──
function irParaPagina(num, animar = false) {
    document.querySelectorAll('.pagina').forEach(el => {
        el.className = 'pagina pagina-entrando-direita';
    });

    const alvo = document.getElementById(`pagina-${num}`);
    if (!alvo) return;
    alvo.className = 'pagina pagina-ativa';

    paginaAtual = num;
    atualizarUI();

    if (!animar) {
        // Re-vincula eventos da página atual (botão comecar / voltar)
        revinculaBotoesPagina();
    }
}

// ── Navega com animação ──
function navegarPara(novaPag, direcao) {
    if (animando) return;
    if (novaPag < 1 || novaPag > TOTAL_PAGINAS) return;

    animando = true;

    const paginaAtualEl = document.getElementById(`pagina-${paginaAtual}`);
    const proximaEl     = document.getElementById(`pagina-${novaPag}`);

    // Posiciona a próxima página fora do viewport (direita ou esquerda)
    if (direcao === 'direita') {
        proximaEl.className = 'pagina pagina-entrando-direita';
    } else {
        proximaEl.className = 'pagina pagina-entrando-esquerda';
    }

    // Força reflow para que a posição inicial seja aplicada antes da transição
    proximaEl.offsetHeight;

    // Inicia a animação
    requestAnimationFrame(() => {
        // Página atual sai
        if (direcao === 'direita') {
            paginaAtualEl.className = 'pagina pagina-saindo-esquerda';
        } else {
            paginaAtualEl.className = 'pagina pagina-saindo-direita';
        }

        // Próxima página entra
        proximaEl.className = 'pagina pagina-ativa';

        // Aguarda a transição terminar (380ms)
        setTimeout(() => {
            paginaAtualEl.className = 'pagina pagina-entrando-direita'; // reseta sem animação
            paginaAtual = novaPag;
            animando = false;

            atualizarUI();
            salvarProgresso();
            revinculaBotoesPagina();

            // Se chegou na última página, marca como concluído
            if (paginaAtual === TOTAL_PAGINAS) {
                salvarProgresso('concluido');
                mostrarToast('Leitura concluída! Parabéns!');
            }
        }, 400);
    });
}

// ── Revincular eventos dos botões dentro das páginas (re-renderizados) ──
function revinculaBotoesPagina() {
    const btnComecar = document.getElementById('btnComecar');
    if (btnComecar) {
        btnComecar.onclick = () => {
            if (animando) return;
            navegarPara(2, 'direita');
        };
    }
    const btnVoltarBib = document.getElementById('btnVoltarBiblioteca');
    if (btnVoltarBib) {
        btnVoltarBib.onclick = () => {
            window.location.href = '../pages/TelaMeusLivros.html';
        };
    }
}

// ── Atualiza header, barra de progresso e botões ──
function atualizarUI() {
    const pct      = Math.round((paginaAtual / TOTAL_PAGINAS) * 100);
    const concluido = paginaAtual === TOTAL_PAGINAS;

    // Progresso
    const fillEl = document.getElementById('leitorProgressoFill');
    const pctEl  = document.getElementById('leitorProgressoPct');
    fillEl.style.width = `${pct}%`;
    fillEl.classList.toggle('concluido', concluido);
    pctEl.textContent = `${pct}%`;
    pctEl.classList.toggle('concluido', concluido);

    // Pagina info
    document.getElementById('leitorPaginaInfo').textContent = `Página ${paginaAtual} de ${TOTAL_PAGINAS}`;

    // Numeração na nav
    document.getElementById('navPagAtual').textContent = paginaAtual;
    document.getElementById('navPagTotal').textContent = `de ${TOTAL_PAGINAS}`;

    // Botões de nav
    document.getElementById('btnAnterior').disabled = paginaAtual <= 1;
    document.getElementById('btnProxima').disabled  = paginaAtual >= TOTAL_PAGINAS;

    // Status badge
    let statusClass = 'leitor-status status-nao-iniciado';
    let statusLabel = 'Não Iniciado';
    if (paginaAtual > 1 && paginaAtual < TOTAL_PAGINAS) {
        statusClass = 'leitor-status status-em-leitura';
        statusLabel = 'Em Leitura';
    } else if (paginaAtual === TOTAL_PAGINAS) {
        statusClass = 'leitor-status status-concluido';
        statusLabel = 'Concluído';
    }
    const badge = document.getElementById('leitorStatusBadge');
    badge.className = statusClass;
    badge.textContent = statusLabel;
}

// ── Salva progresso no backend ──
async function salvarProgresso(forcarStatus = null) {
    let statusLeitura = 'nao_iniciado';
    if (paginaAtual > 1 && paginaAtual < TOTAL_PAGINAS) statusLeitura = 'em_leitura';
    if (paginaAtual === TOTAL_PAGINAS)                  statusLeitura = 'concluido';
    if (forcarStatus) statusLeitura = forcarStatus;

    try {
        await fetch(`${API}/meus_livros.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                acao:            'salvar_progresso',
                emprestimo_id:   parseInt(empId),
                pagina_atual:    paginaAtual,
                total_paginas:   TOTAL_PAGINAS,
                status_leitura:  statusLeitura,
            })
        });
    } catch {
        // Salvar silencioso — não interrompe a leitura
    }
}

// ── Toast ──
function mostrarToast(msg, erro = false) {
    clearTimeout(toastTimer);
    const toast = document.getElementById('toastLeitor');
    const icon  = document.getElementById('tlIconEl');
    document.getElementById('tlMsg').textContent = msg;
    icon.className = erro ? 'fa-solid fa-xmark' : 'fa-solid fa-check';
    toast.classList.toggle('erro', erro);
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}
