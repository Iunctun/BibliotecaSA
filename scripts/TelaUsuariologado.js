document.addEventListener('DOMContentLoaded', async () => {

    // ── Proteção de rota ──
    let sessao = null;
    try {
        const resp = await fetch('/BibliotecaSA/backend/sessao.php');
        sessao = await resp.json();
        if (!sessao.logado) {
            window.location.href = '../pages/TelaLogin.html';
            return;
        }
    } catch {
        window.location.href = '../pages/TelaLogin.html';
        return;
    }

    // ── Carrega dados do banco ──
    let perfil = null;
    try {
        const resp = await fetch('/BibliotecaSA/backend/usuario_perfil.php');
        perfil = await resp.json();
        if (perfil.erro) {
            window.location.href = '../pages/TelaLogin.html';
            return;
        }
    } catch {
        window.location.href = '../pages/TelaLogin.html';
        return;
    }

    // ── Preenche dados pessoais ──
    const elNome  = document.getElementById('nome');
    const elEmail = document.getElementById('email');
    const elId    = document.getElementById('membroId');

    if (elNome)  elNome.value  = perfil.usuario.nome;
    if (elEmail) elEmail.value = perfil.usuario.email;
    if (elId)    elId.value    = String(perfil.usuario.id).padStart(3, '0');

    // ── Botão de gerenciamento (só admin) ──
    const btnGerenciamento = document.getElementById('btnGerenciamento');
    if (btnGerenciamento) {
        btnGerenciamento.style.display = perfil.usuario.perfil === 'admin' ? 'inline-flex' : 'none';
    }

    // ── Renderiza empréstimos ativos ──
    const containerEmprestimos = document.getElementById('listaEmprestimos');
    if (containerEmprestimos) {
        containerEmprestimos.innerHTML = '';

        if (perfil.emprestimos.length === 0) {
            containerEmprestimos.innerHTML = `
                <p class="lista-vazia">
                    <i class="fas fa-book-open"></i> Nenhum empréstimo ativo no momento.
                </p>`;
        } else {
            perfil.emprestimos.forEach(emp => {
                const capa        = emp.capa_path ? `../${emp.capa_path}` : '../img/sem-capa.webp';
                const devFormatada= new Date(emp.data_devolucao + 'T00:00:00').toLocaleDateString('pt-BR');
                const hoje        = new Date();
                const devDate     = new Date(emp.data_devolucao + 'T00:00:00');
                const atrasado    = devDate < hoje;

                const div = document.createElement('div');
                div.className = 'livro';
                div.innerHTML = `
                    <div class="livro-info">
                        <img src="${capa}" width="60" alt="Capa">
                        <div class="livro-texto">
                            <strong>${emp.titulo}</strong>
                            <span>${emp.autor}</span>
                            <span style="font-size:11px;color:${atrasado ? '#e05252' : 'rgba(255,255,255,0.3)'}">
                                ${atrasado ? '⚠ Atrasado — ' : ''}Devolução: ${devFormatada}
                            </span>
                        </div>
                    </div>
                    <button class="btn-primary btnRenovar" data-id="${emp.id}">
                        <i class="fas fa-sync-alt"></i> Renovar
                    </button>
                `;
                containerEmprestimos.appendChild(div);
            });
        }
    }

    // ── Renderiza reservas pendentes ──
    const containerReservas = document.getElementById('listaReservas');
    if (containerReservas) {
        containerReservas.innerHTML = '';

        if (perfil.reservas.length === 0) {
            containerReservas.innerHTML = `
                <p class="lista-vazia">
                    <i class="fas fa-bookmark"></i> Nenhuma reserva pendente.
                </p>`;
        } else {
            perfil.reservas.forEach(res => {
                const capa        = res.capa_path ? `../${res.capa_path}` : '../img/sem-capa.webp';
                const criadoFormatado = new Date(res.criado_em).toLocaleDateString('pt-BR');

                const div = document.createElement('div');
                div.className = 'livro';
                div.innerHTML = `
                    <div class="livro-info">
                        <img src="${capa}" width="60" alt="Capa">
                        <div class="livro-texto">
                            <strong>${res.titulo}</strong>
                            <span>${res.autor}</span>
                            <span style="font-size:11px;color:rgba(255,255,255,0.3)">
                                Reservado em: ${criadoFormatado}
                            </span>
                        </div>
                    </div>
                    <span class="badge-reserva">
                        <i class="fas fa-clock"></i> Pendente
                    </span>
                `;
                containerReservas.appendChild(div);
            });
        }
    }

    // ── Injeta estilos do toast e badge ──
    if (!document.getElementById('toast-usuario-style')) {
        const style = document.createElement('style');
        style.id = 'toast-usuario-style';
        style.textContent = `
            #toast-usuario {
                position: fixed; bottom: 40px; right: 40px;
                display: flex; align-items: center; gap: 16px;
                background: #111316; border: 1px solid rgba(29,158,117,0.4);
                border-radius: 4px; padding: 20px 28px;
                box-shadow: 0 16px 48px rgba(0,0,0,0.5);
                z-index: 9999; opacity: 0; transform: translateY(16px);
                transition: opacity 0.35s ease, transform 0.35s ease;
                pointer-events: none; min-width: 320px;
            }
            #toast-usuario.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
            #toast-usuario .toast-icon {
                width: 40px; height: 40px; border-radius: 50%;
                background: rgba(29,158,117,0.12);
                display: flex; align-items: center; justify-content: center; flex-shrink: 0;
            }
            #toast-usuario.erro .toast-icon { background: rgba(224,82,82,0.12); }
            #toast-usuario .toast-icon i { color: #1d9e75; font-size: 16px; }
            #toast-usuario.erro .toast-icon i { color: #e05252; }
            #toast-usuario .toast-body { display: flex; flex-direction: column; gap: 4px; flex: 1; }
            #toast-usuario .toast-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 400; color: #ffffff; }
            #toast-usuario .toast-sub   { font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.45); letter-spacing: 0.3px; }
            #toast-usuario .toast-close {
                margin-left: auto; background: none; border: none;
                color: rgba(255,255,255,0.25); font-size: 14px; cursor: pointer;
                padding: 4px; transition: color 0.2s ease; flex-shrink: 0;
            }
            #toast-usuario .toast-close:hover { color: rgba(255,255,255,0.6); }
            #toast-usuario .toast-progress {
                position: absolute; bottom: 0; left: 0; height: 2px;
                background: #1d9e75; border-radius: 0 0 0 4px; width: 100%; transform-origin: left;
            }
            #toast-usuario.erro .toast-progress { background: #e05252; }
            #toast-usuario.show .toast-progress { animation: toast-bar 4s linear forwards; }
            @keyframes toast-bar { from { transform: scaleX(1); } to { transform: scaleX(0); } }

            .lista-vazia {
                color: rgba(255,255,255,0.3);
                font-size: 13px;
                padding: 20px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .lista-vazia i { color: rgba(29,158,117,0.5); }

            .badge-reserva {
                font-size: 10px;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                color: rgba(112,163,240,0.8);
                border: 1px solid rgba(112,163,240,0.25);
                border-radius: 3px;
                padding: 5px 12px;
                display: flex;
                align-items: center;
                gap: 6px;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);
    }

    // ── Toast ──
    const toastEl = document.createElement('div');
    toastEl.id = 'toast-usuario';
    toastEl.innerHTML = `
        <div class="toast-icon"><i class="fas fa-check" id="toastIcon"></i></div>
        <div class="toast-body">
            <span class="toast-title"></span>
            <span class="toast-sub"></span>
        </div>
        <button class="toast-close"><i class="fas fa-xmark"></i></button>
        <div class="toast-progress"></div>
    `;
    document.body.appendChild(toastEl);

    let toastTimer = null;

    function showToast(titulo, subtitulo = '', tipo = 'ok') {
        toastEl.className = tipo === 'erro' ? 'erro' : '';
        const iconEl = document.getElementById('toastIcon');
        if (iconEl) iconEl.className = tipo === 'erro' ? 'fas fa-xmark' : 'fas fa-check';

        const bar = toastEl.querySelector('.toast-progress');
        bar.style.animation = 'none';
        bar.offsetHeight; // reflow
        bar.style.animation = '';

        toastEl.querySelector('.toast-title').textContent = titulo;
        toastEl.querySelector('.toast-sub').textContent   = subtitulo;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4000);
    }

    toastEl.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(toastTimer);
        toastEl.classList.remove('show');
    });

    // ── Renovar empréstimo (delegado) ──
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btnRenovar');
        if (!btn) return;

        const emprestimoId = btn.dataset.id;
        if (!emprestimoId) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Renovando...';

        try {
            const resp = await fetch('/BibliotecaSA/backend/emprestimo_renovar.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emprestimo_id: parseInt(emprestimoId) })
            });
            const data = await resp.json();

            if (data.erro) {
                showToast('Erro!', data.erro, 'erro');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sync-alt"></i> Renovar';
                return;
            }

            showToast('Livro renovado!', `Nova devolução: ${data.nova_devolucao}`);

            // Atualiza o texto de devolução no item
            const span = btn.closest('.livro')?.querySelector('.livro-texto span:last-child');
            if (span) span.textContent = `Devolução: ${data.nova_devolucao}`;

            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Renovar';

        } catch {
            showToast('Erro!', 'Não foi possível renovar.', 'erro');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Renovar';
        }
    });

    // ── Editar perfil ──
    const btnEditar = document.getElementById('btnEditar');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            showToast('Em breve!', 'Edição de perfil disponível em breve.');
        });
    }

    // ── Pagamento ──
    const btnPagamento = document.getElementById('btnPagamento');
    if (btnPagamento) {
        btnPagamento.addEventListener('click', () => {
            const valor = document.getElementById('valor')?.textContent || '';
            showToast('Redirecionando!', `Encaminhando para o pagamento de ${valor}.`);
        });
    }

});