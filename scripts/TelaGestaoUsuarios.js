// =============================================================
//  TelaGestaoUsuarios.js — exclusivo para perfil "admin"
// =============================================================

const API = '/BibliotecaSA/backend';
let toastTimer    = null;
let usuariosCache = [];
let idParaRemover = null;

const corpoTabela         = document.getElementById('corpoTabela');
const campoBusca          = document.getElementById('campoBusca');
const filtroPerfil        = document.getElementById('filtroPerfil');
const totalUsuarios       = document.getElementById('totalUsuarios');
const modalOverlay        = document.getElementById('modalOverlay');
const modalConfirmOverlay = document.getElementById('modalConfirmOverlay');
const confirmNomeEl       = document.getElementById('confirmNome');

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
    await verificarAcesso();
    await carregarUsuarios();
    registrarEventos();
});

// ── 1. Proteção de rota ──
async function verificarAcesso() {
    try {
        const resp  = await fetch(`${API}/sessao.php`, { credentials: 'same-origin' });
        const dados = await resp.json();
        if (!dados.logado || dados.perfil !== 'admin') {
            window.location.href = '/BibliotecaSA/pages/TelaLogin.html';
            return;
        }
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
    } catch {
        window.location.href = '/BibliotecaSA/pages/TelaLogin.html';
    }
}

// ── 2. Carrega usuários ──
async function carregarUsuarios() {
    mostrarSkeleton();
    try {
        const resp  = await fetch(`${API}/gestao_usuarios.php`, { credentials: 'same-origin' });
        const dados = await resp.json();
        if (dados.erro) { mostrarToast(dados.erro, true); return; }
        usuariosCache = dados.usuarios || [];
        renderTabela(usuariosCache);
    } catch {
        mostrarToast('Falha ao carregar usuários.', true);
    }
}

// ── 3. Renderiza tabela ──
function renderTabela(lista) {
    totalUsuarios.textContent = `${lista.length} usuário${lista.length !== 1 ? 's' : ''}`;

    if (lista.length === 0) {
        corpoTabela.innerHTML = `
            <tr class="empty-row">
                <td colspan="9"><i class="fas fa-users-slash"></i> Nenhum usuário encontrado.</td>
            </tr>`;
        return;
    }

    corpoTabela.innerHTML = lista.map(u => {
        const criado     = u.criado_em ? u.criado_em.split(' ')[0].split('-').reverse().join('/') : '—';
        const badgeClass = u.perfil === 'admin' ? 'badge-admin' : 'badge-usuario';
        const badgeLabel = u.perfil === 'admin' ? 'Admin' : 'Usuário';
        const cpfMask    = u.cpf || '—';
        const tel        = u.telefone || '—';
        const estado     = u.estado || '—';

        return `
        <tr data-id="${u.id}">
            <td class="col-id">#${String(u.id).padStart(5,'0')}</td>
            <td class="col-nome">${escapeHtml(u.nome)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${escapeHtml(tel)}</td>
            <td>${escapeHtml(cpfMask)}</td>
            <td>${escapeHtml(estado)}</td>
            <td>
                <span class="badge-perfil ${badgeClass}">
                    <i class="fa-solid fa-circle" style="font-size:6px;"></i> ${badgeLabel}
                </span>
            </td>
            <td>${criado}</td>
            <td class="col-acoes">
                <button class="btn-acao btn-edit" data-id="${u.id}" title="Editar">
                    <i class="fas fa-pen-to-square"></i> Editar
                </button>
                <button class="btn-acao btn-remove" data-id="${u.id}" data-nome="${escapeHtml(u.nome)}" title="Remover">
                    <i class="fas fa-trash-alt"></i> Remover
                </button>
            </td>
        </tr>`;
    }).join('');

    corpoTabela.querySelectorAll('.btn-edit').forEach(btn =>
        btn.addEventListener('click', () => abrirModalEdicao(parseInt(btn.dataset.id)))
    );
    corpoTabela.querySelectorAll('.btn-remove').forEach(btn =>
        btn.addEventListener('click', () => abrirModalConfirm(parseInt(btn.dataset.id), btn.dataset.nome))
    );
}

// ── 4. Filtro ──
function filtrarTabela() {
    const termo  = campoBusca.value.toLowerCase().trim();
    const perfil = filtroPerfil.value;

    const filtrada = usuariosCache.filter(u => {
        const buscaOk  = !termo ||
            u.nome.toLowerCase().includes(termo)  ||
            u.email.toLowerCase().includes(termo) ||
            String(u.id).includes(termo);
        const perfilOk = !perfil || u.perfil === perfil;
        return buscaOk && perfilOk;
    });
    renderTabela(filtrada);
}

// ── 5. Modal Editar ──
function abrirModalEdicao(id) {
    const u = usuariosCache.find(u => u.id === id);
    if (!u) return;

    document.getElementById('editId').value         = u.id;
    document.getElementById('editNome').value        = u.nome        || '';
    document.getElementById('editEmail').value       = u.email       || '';
    document.getElementById('editTelefone').value    = u.telefone    || '';
    document.getElementById('editCpf').value         = u.cpf         || '';
    document.getElementById('editNascimento').value  = u.nascimento  || '';
    document.getElementById('editEstado').value      = u.estado      || '';
    document.getElementById('editPerfil').value      = u.perfil      || 'usuario';
    document.getElementById('editSenha').value       = '';

    modalOverlay.classList.add('open');
}

function fecharModalEdicao() { modalOverlay.classList.remove('open'); }

async function salvarEdicao() {
    const id         = parseInt(document.getElementById('editId').value);
    const nome       = document.getElementById('editNome').value.trim();
    const email      = document.getElementById('editEmail').value.trim();
    const telefone   = document.getElementById('editTelefone').value.trim();
    const cpf        = document.getElementById('editCpf').value.trim();
    const nascimento = document.getElementById('editNascimento').value;
    const estado     = document.getElementById('editEstado').value;
    const perfil     = document.getElementById('editPerfil').value;
    const senha      = document.getElementById('editSenha').value;

    if (!nome || !email) { mostrarToast('Nome e e-mail são obrigatórios.', true); return; }

    const btn = document.getElementById('btnSalvarEdicao');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Salvando...';

    try {
        const payload = { id, nome, email, telefone, cpf, nascimento, estado, perfil };
        if (senha) payload.senha = senha;

        const resp  = await fetch(`${API}/gestao_usuarios.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        });
        const dados = await resp.json();

        if (dados.erro) { mostrarToast(dados.erro, true); return; }

        // Atualiza cache local
        const idx = usuariosCache.findIndex(u => u.id === id);
        if (idx !== -1) {
            usuariosCache[idx] = { ...usuariosCache[idx], nome, email, telefone, cpf, nascimento, estado, perfil };
        }

        fecharModalEdicao();
        filtrarTabela();
        mostrarToast('Usuário atualizado com sucesso.');
    } catch {
        mostrarToast('Falha ao conectar ao servidor.', true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
    }
}

// ── 6. Modal Confirmar Remoção ──
function abrirModalConfirm(id, nome) {
    idParaRemover = id;
    confirmNomeEl.textContent = nome;
    modalConfirmOverlay.classList.add('open');
}

function fecharModalConfirm() {
    idParaRemover = null;
    modalConfirmOverlay.classList.remove('open');
}

async function removerUsuario() {
    if (!idParaRemover) return;

    const btn = document.getElementById('btnConfirmarRemocao');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Removendo...';

    try {
        const resp  = await fetch(`${API}/gestao_usuarios.php`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id: idParaRemover })
        });
        const dados = await resp.json();

        if (dados.erro) { mostrarToast(dados.erro, true); return; }

        usuariosCache = usuariosCache.filter(u => u.id !== idParaRemover);
        fecharModalConfirm();
        filtrarTabela();
        mostrarToast('Usuário removido com sucesso.');
    } catch {
        mostrarToast('Falha ao conectar ao servidor.', true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-trash-alt"></i> Remover';
    }
}

// ── 7. Skeleton ──
function mostrarSkeleton() {
    corpoTabela.innerHTML = [1,2,3,4].map(() => `
        <tr class="skeleton-row"><td colspan="9"><div class="skeleton-linha"></div></td></tr>`).join('');
}

// ── 8. Toast ──
function mostrarToast(msg, erro = false) {
    clearTimeout(toastTimer);
    const toast  = document.getElementById('toastGestao');
    const iconEl = document.getElementById('toastIconEl');
    document.getElementById('toastMsg').textContent = msg;
    iconEl.className = erro ? 'fa-solid fa-xmark' : 'fa-solid fa-check';
    toast.classList.toggle('erro', erro);
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── 9. Escape HTML ──
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── 10. Eventos ──
function registrarEventos() {
    campoBusca.addEventListener('input', filtrarTabela);
    filtroPerfil.addEventListener('change', filtrarTabela);

    document.getElementById('btnFecharModal').addEventListener('click', fecharModalEdicao);
    document.getElementById('btnCancelarModal').addEventListener('click', fecharModalEdicao);
    document.getElementById('btnSalvarEdicao').addEventListener('click', salvarEdicao);
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) fecharModalEdicao(); });

    document.getElementById('btnFecharConfirm').addEventListener('click', fecharModalConfirm);
    document.getElementById('btnCancelarConfirm').addEventListener('click', fecharModalConfirm);
    document.getElementById('btnConfirmarRemocao').addEventListener('click', removerUsuario);
    modalConfirmOverlay.addEventListener('click', e => { if (e.target === modalConfirmOverlay) fecharModalConfirm(); });
}
