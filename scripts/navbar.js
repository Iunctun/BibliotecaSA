// ============================================================
//  navbar.js  — v3
//  - Efeito de scroll no header
//  - Detecta sessão PHP e adapta o canto direito:
//      Logado    → avatar com inicial + nome + dropdown (só Meu Perfil e Sair)
//      Deslogado → botão LOGIN
//
//  IMPORTANTE: initNavbar() é chamado inline na própria página,
//  logo após o <header> estar no DOM. Não depende de include.js.
// ============================================================

function initNavbar() {
    const header = document.querySelector('.header');
    if (!header) return;

    // ── Efeito scroll ──
    function updateScroll() {
        const scrollY   = window.scrollY;
        const maxScroll = 200;
        const progress  = Math.min(scrollY / maxScroll, 1);

        header.classList.toggle('scrolled', scrollY > 0);
        header.style.setProperty('--bg-opacity',  (0.5 + progress * 0.35).toFixed(2));
        header.style.setProperty('--blur-amount', `${10 + progress * 8}px`);
        header.style.setProperty('--ui-color',    progress < 0.8 ? '#F6F5E6' : '#3A2F20');
        header.style.setProperty('--logo-filter', `brightness(${1 - progress * 0.35})`);
    }

    updateScroll();
    window.addEventListener('scroll', updateScroll);

    // ── Área do usuário ──
    const area = document.getElementById('navUserArea');
    if (!area) return;

    // Mostra um placeholder enquanto carrega (evita o flash do botão LOGIN)
    area.innerHTML = `<span style="opacity:0.3;font-size:13px;color:#fff;">...</span>`;

    // Usa path absoluto para evitar problemas de profundidade de pasta
    fetch('/BibliotecaSA/backend/sessao.php', { credentials: 'same-origin' })
        .then(r => {
            if (!r.ok) throw new Error('Sessão indisponível');
            return r.json();
        })
        .then(sessao => {
            if (!sessao.logado) {
                renderLogin(area);
                return;
            }
            renderUsuario(area, sessao);
        })
        .catch(() => {
            renderLogin(area);
        });
}

// ── Renderiza botão de login ──
function renderLogin(area) {
    area.innerHTML = `
        <button class="botao-login" onclick="window.location.href='/BibliotecaSA/pages/TelaLogin.html'">
            LOGIN
        </button>
    `;
}

// ── Renderiza avatar do usuário logado ──
function renderUsuario(area, sessao) {
    const inicial      = sessao.nome ? sessao.nome.charAt(0).toUpperCase() : '?';
    const primeiroNome = sessao.nome ? sessao.nome.split(' ')[0] : 'Usuário';

    // Dropdown agora só tem Meu Perfil e Sair (para todos os perfis)
    area.innerHTML = `
        <div class="nav-avatar-wrap" id="navAvatarWrap">
            <div class="nav-avatar" id="navAvatar">
                <span class="nav-avatar-inicial">${inicial}</span>
            </div>
            <span class="nav-username">${primeiroNome}</span>
            <i class="fa-solid fa-chevron-down nav-chevron" id="navChevron"></i>

            <div class="nav-dropdown" id="navDropdown">
                <a href="/BibliotecaSA/pages/TelaUsuariologado.html" class="nav-dropdown-item">
                    <i class="fa-solid fa-user"></i> Meu Perfil
                </a>
                <div class="nav-dropdown-sep"></div>
                <a href="/BibliotecaSA/backend/logout.php" class="nav-dropdown-item nav-dropdown-logout">
                    <i class="fa-solid fa-right-from-bracket"></i> Sair
                </a>
            </div>
        </div>
    `;

    // Toggle dropdown
    const wrap     = document.getElementById('navAvatarWrap');
    const dropdown = document.getElementById('navDropdown');
    const chevron  = document.getElementById('navChevron');

    wrap.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = dropdown.classList.toggle('open');
        chevron.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('open');
        chevron.style.transform = 'rotate(0deg)';
    });
}
