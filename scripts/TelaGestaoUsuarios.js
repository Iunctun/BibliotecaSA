// =============================================================
//  TelaGestaoUsuarios.js — exclusivo para perfil "admin"
// =============================================================

const API = "/BibliotecaSA/backend";
let toastTimer = null;
let usuariosCache = [];
let idParaRemover = null;
let idDetalhesAtual = null; // usuário atualmente no modal de detalhes

const corpoTabela = document.getElementById("corpoTabela");
const campoBusca = document.getElementById("campoBusca");
const filtroPerfil = document.getElementById("filtroPerfil");
const totalUsuarios = document.getElementById("totalUsuarios");
const modalOverlay = document.getElementById("modalOverlay");
const modalConfirmOverlay = document.getElementById("modalConfirmOverlay");
const confirmNomeEl = document.getElementById("confirmNome");

// ── Init ──
document.addEventListener("DOMContentLoaded", async () => {
  await verificarAcesso();
  await carregarUsuarios();
  registrarEventos();
});

// ── 1. Proteção de rota ──
async function verificarAcesso() {
  try {
    const resp = await fetch(`${API}/sessao.php`, {
      credentials: "same-origin",
    });
    const dados = await resp.json();

    // Bloqueia quem não está logado
    if (!dados.logado) {
      window.location.href = "/BibliotecaSA/pages/TelaLogin.html";
      return;
    }

    // Permite apenas admin e desenvolvedor
    if (dados.perfil !== "admin" && dados.perfil !== "desenvolvedor") {
      window.location.href = "/BibliotecaSA/pages/TelaLogin.html";
      return;
    }

    // Itens visíveis para admin e desenvolvedor
    if (dados.perfil === "admin" || dados.perfil === "desenvolvedor") {
      document
        .querySelectorAll(".admin-only")
        .forEach((el) => (el.style.display = "flex"));
    }

    // Itens exclusivos do desenvolvedor
    if (dados.perfil === "desenvolvedor") {
      document
        .querySelectorAll(".dev-only")
        .forEach((el) => (el.style.display = "flex"));
    }
  } catch {
    window.location.href = "/BibliotecaSA/pages/TelaLogin.html";
  }
}

// ── 2. Carrega usuários ──
async function carregarUsuarios() {
  mostrarSkeleton();
  try {
    const resp = await fetch(`${API}/gestao_usuarios.php`, {
      credentials: "same-origin",
    });
    const dados = await resp.json();
    if (dados.erro) {
      mostrarToast(dados.erro, true);
      return;
    }
    usuariosCache = dados.usuarios || [];
    renderTabela(usuariosCache);
  } catch {
    mostrarToast("Falha ao carregar usuários.", true);
  }
}

// ── 3. Renderiza tabela — apenas ID, Nome, Email, Perfil, Ações ──
function renderTabela(lista) {
  totalUsuarios.textContent = `${lista.length} usuário${lista.length !== 1 ? "s" : ""}`;

  if (lista.length === 0) {
    corpoTabela.innerHTML = `
            <tr class="empty-row">
                <td colspan="5"><i class="fas fa-users-slash"></i> Nenhum usuário encontrado.</td>
            </tr>`;
    return;
  }

  corpoTabela.innerHTML = lista
    .map((u) => {
      const badgeClass =
        u.perfil === "admin"
          ? "badge-admin"
          : u.perfil === "desenvolvedor"
            ? "badge-dev"
            : "badge-usuario";
      const badgeLabel =
        u.perfil === "admin"
          ? "Admin"
          : u.perfil === "desenvolvedor"
            ? "Dev"
            : "Usuário";

      return `
        <tr class="row-clicavel" data-id="${u.id}" title="Clique para ver detalhes">
            <td class="col-id">#${String(u.id).padStart(5, "0")}</td>
            <td class="col-nome">${escapeHtml(u.nome)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>
                <span class="badge-perfil ${badgeClass}">
                    <i class="fa-solid fa-circle" style="font-size:6px;"></i> ${badgeLabel}
                </span>
            </td>
            <td class="col-acoes" onclick="event.stopPropagation()">
                <button class="btn-acao btn-edit" data-id="${u.id}" title="Editar">
                    <i class="fas fa-pen-to-square"></i> Editar
                </button>
                <button class="btn-acao btn-historico" data-id="${u.id}" data-nome="${escapeHtml(u.nome)}" title="Ver empréstimos">
                    <i class="fas fa-clock-rotate-left"></i> Histórico
                </button>
                <button class="btn-acao btn-remove" data-id="${u.id}" data-nome="${escapeHtml(u.nome)}" title="Remover">
                    <i class="fas fa-trash-alt"></i> Remover
                </button>
            </td>
        </tr>`;
    })
    .join("");

  // Clique na linha → abre modal de detalhes
  corpoTabela
    .querySelectorAll(".row-clicavel")
    .forEach((tr) =>
      tr.addEventListener("click", () =>
        abrirModalDetalhes(parseInt(tr.dataset.id)),
      ),
    );

  corpoTabela
    .querySelectorAll(".btn-edit")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        abrirModalEdicao(parseInt(btn.dataset.id)),
      ),
    );
  corpoTabela
    .querySelectorAll(".btn-historico")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        abrirModalHistorico(parseInt(btn.dataset.id), btn.dataset.nome),
      ),
    );
  corpoTabela
    .querySelectorAll(".btn-remove")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        abrirModalConfirm(parseInt(btn.dataset.id), btn.dataset.nome),
      ),
    );
}

// ── 4. Filtro ──
function filtrarTabela() {
  const termo = campoBusca.value.toLowerCase().trim();
  const perfil = filtroPerfil.value;

  const filtrada = usuariosCache.filter((u) => {
    const buscaOk =
      !termo ||
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      String(u.id).includes(termo);
    const perfilOk = !perfil || u.perfil === perfil;
    return buscaOk && perfilOk;
  });
  renderTabela(filtrada);
}

// ── 5. Modal Detalhes ──
function abrirModalDetalhes(id) {
  const u = usuariosCache.find((u) => u.id === id);
  if (!u) return;

  idDetalhesAtual = id;

  const criado = u.criado_em
    ? u.criado_em.split(" ")[0].split("-").reverse().join("/")
    : "—";
  const nascimento = u.nascimento
    ? u.nascimento.split("-").reverse().join("/")
    : "—";
  const badgeClass =
    u.perfil === "admin"
      ? "badge-admin"
      : u.perfil === "desenvolvedor"
        ? "badge-dev"
        : "badge-usuario";
  const badgeLabel =
    u.perfil === "admin"
      ? "Admin"
      : u.perfil === "desenvolvedor"
        ? "Dev"
        : "Usuário";

  document.getElementById("detalhesNomeTitle").textContent = escapeHtml(u.nome);

  document.getElementById("detalhesConteudo").innerHTML = `
        <div class="detalhe-item">
            <span class="detalhe-label">ID</span>
            <span class="detalhe-valor col-id">#${String(u.id).padStart(5, "0")}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Nome</span>
            <span class="detalhe-valor">${escapeHtml(u.nome)}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Email</span>
            <span class="detalhe-valor">${escapeHtml(u.email)}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Telefone</span>
            <span class="detalhe-valor">${escapeHtml(u.telefone || "—")}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">CPF</span>
            <span class="detalhe-valor">${escapeHtml(u.cpf || "—")}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Data de Nascimento</span>
            <span class="detalhe-valor">${nascimento}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Estado</span>
            <span class="detalhe-valor">${escapeHtml(u.estado || "—")}</span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Perfil de Acesso</span>
            <span class="detalhe-valor">
                <span class="badge-perfil ${badgeClass}">
                    <i class="fa-solid fa-circle" style="font-size:6px;"></i> ${badgeLabel}
                </span>
            </span>
        </div>
        <div class="detalhe-item">
            <span class="detalhe-label">Data de Cadastro</span>
            <span class="detalhe-valor">${criado}</span>
        </div>`;

  document.getElementById("modalDetalhesOverlay").classList.add("open");
}

function fecharModalDetalhes() {
  idDetalhesAtual = null;
  document.getElementById("modalDetalhesOverlay").classList.remove("open");
}

// ── 6. Modal Editar ──
function abrirModalEdicao(id) {
  const u = usuariosCache.find((u) => u.id === id);
  if (!u) return;

  const criado = u.criado_em
    ? u.criado_em.split(" ")[0].split("-").reverse().join("/")
    : "—";

  document.getElementById("editId").value = u.id;
  document.getElementById("editNome").value = u.nome || "";
  document.getElementById("editEmail").value = u.email || "";
  document.getElementById("editTelefone").value = u.telefone || "";
  document.getElementById("editCpf").value = u.cpf || "";
  document.getElementById("editNascimento").value = u.nascimento || "";
  document.getElementById("editEstado").value = u.estado || "";
  document.getElementById("editPerfil").value = u.perfil || "usuario";
  document.getElementById("editCadastro").value = criado;
  document.getElementById("editSenha").value = "";

  modalOverlay.classList.add("open");
}

function fecharModalEdicao() {
  modalOverlay.classList.remove("open");
}

async function salvarEdicao() {
  const id = parseInt(document.getElementById("editId").value);
  const nome = document.getElementById("editNome").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const telefone = document.getElementById("editTelefone").value.trim();
  const cpf = document.getElementById("editCpf").value.trim();
  const nascimento = document.getElementById("editNascimento").value;
  const estado = document.getElementById("editEstado").value;
  const perfil = document.getElementById("editPerfil").value;
  const senha = document.getElementById("editSenha").value;

  if (!nome || !email) {
    mostrarToast("Nome e e-mail são obrigatórios.", true);
    return;
  }

  const btn = document.getElementById("btnSalvarEdicao");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Salvando...';

  try {
    const payload = {
      id,
      nome,
      email,
      telefone,
      cpf,
      nascimento,
      estado,
      perfil,
    };
    if (senha) payload.senha = senha;

    const resp = await fetch(`${API}/gestao_usuarios.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    const dados = await resp.json();

    if (dados.erro) {
      mostrarToast(dados.erro, true);
      return;
    }

    // Atualiza cache local
    const idx = usuariosCache.findIndex((u) => u.id === id);
    if (idx !== -1) {
      usuariosCache[idx] = {
        ...usuariosCache[idx],
        nome,
        email,
        telefone,
        cpf,
        nascimento,
        estado,
        perfil,
      };
    }

    fecharModalEdicao();
    filtrarTabela();
    mostrarToast("Usuário atualizado com sucesso.");
  } catch {
    mostrarToast("Falha ao conectar ao servidor.", true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
  }
}

// ── 7. Modal Histórico de Empréstimos ──
async function abrirModalHistorico(id, nome) {
  document.getElementById("historicoNome").textContent = nome;
  document.getElementById("historicoLista").innerHTML = `
        <div class="hist-loading"><i class="fas fa-circle-notch fa-spin"></i> Carregando...</div>`;
  document.getElementById("modalHistoricoOverlay").classList.add("open");

  try {
    const resp = await fetch(
      `${API}/emprestimos_usuario.php?usuario_id=${id}`,
      { credentials: "same-origin" },
    );
    const dados = await resp.json();

    if (dados.erro) {
      document.getElementById("historicoLista").innerHTML =
        `<p class="hist-vazio">${dados.erro}</p>`;
      return;
    }

    const lista = dados.emprestimos || [];
    if (lista.length === 0) {
      document.getElementById("historicoLista").innerHTML =
        `<p class="hist-vazio"><i class="fas fa-inbox"></i> Nenhum empréstimo encontrado.</p>`;
      return;
    }

    document.getElementById("historicoLista").innerHTML = lista
      .map((e) => {
        const retirada = e.data_retirada
          ? e.data_retirada.split("-").reverse().join("/")
          : "—";
        const devolucao = e.data_devolucao
          ? e.data_devolucao.split("-").reverse().join("/")
          : "—";
        const valor =
          e.valor_cobrado > 0
            ? `R$ ${parseFloat(e.valor_cobrado).toFixed(2).replace(".", ",")}`
            : "Gratuito";
        const statusMap = {
          ativo: ["badge-ativo", "Ativo"],
          devolvido: ["badge-devolvido", "Devolvido"],
          cancelado: ["badge-cancelado", "Cancelado"],
        };
        const [badgeCls, badgeLabel] = statusMap[e.status] || [
          "badge-ativo",
          e.status,
        ];
        const capa = e.capa_path
          ? `/BibliotecaSA/${e.capa_path}`
          : "../img/livro-placeholder.webp";

        const btnCancelar =
          e.status !== "cancelado"
            ? `
                <button class="btn-cancelar-emp" data-id="${e.id}" data-valor="${e.valor_cobrado}">
                    <i class="fas fa-ban"></i> Cancelar
                </button>`
            : "";

        return `
            <div class="hist-item" id="hist-emp-${e.id}">
                <img class="hist-capa" src="${capa}" onerror="this.src='../img/livro-placeholder.webp'" alt="${escapeHtml(e.livro_titulo)}">
                <div class="hist-info">
                    <div class="hist-titulo">${escapeHtml(e.livro_titulo)}</div>
                    <div class="hist-autor">${escapeHtml(e.livro_autor)}</div>
                    <div class="hist-datas">
                        <span><i class="fas fa-arrow-right-from-bracket"></i> ${retirada}</span>
                        <span><i class="fas fa-arrow-right-to-bracket"></i> ${devolucao}</span>
                        <span><i class="fas fa-tag"></i> ${valor}</span>
                    </div>
                </div>
                <div class="hist-actions">
                    <span class="badge-status ${badgeCls}">${badgeLabel}</span>
                    ${btnCancelar}
                </div>
            </div>`;
      })
      .join("");

    // Eventos de cancelamento
    document.querySelectorAll(".btn-cancelar-emp").forEach((btn) => {
      btn.addEventListener("click", () =>
        cancelarEmprestimo(
          parseInt(btn.dataset.id),
          parseFloat(btn.dataset.valor),
          btn,
        ),
      );
    });
  } catch {
    document.getElementById("historicoLista").innerHTML =
      `<p class="hist-vazio">Falha ao carregar empréstimos.</p>`;
  }
}

function fecharModalHistorico() {
  document.getElementById("modalHistoricoOverlay").classList.remove("open");
}

async function cancelarEmprestimo(empId, valor, btn) {
  const valorStr =
    valor > 0
      ? ` O valor de R$ ${valor.toFixed(2).replace(".", ",")} será estornado em créditos.`
      : "";
  if (!confirm(`Cancelar este empréstimo?${valorStr}`)) return;

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

  try {
    const resp = await fetch(`${API}/emprestimos_usuario.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ acao: "cancelar", emprestimo_id: empId }),
    });
    const dados = await resp.json();

    if (dados.sucesso) {
      const item = document.getElementById(`hist-emp-${empId}`);
      if (item) {
        item.querySelector(".badge-status").className =
          "badge-status badge-cancelado";
        item.querySelector(".badge-status").textContent = "Cancelado";
        btn.remove();
      }
      mostrarToast("Empréstimo cancelado. Créditos estornados.", false);
    } else {
      mostrarToast(dados.erro || "Erro ao cancelar.", true);
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-ban"></i> Cancelar';
    }
  } catch {
    mostrarToast("Falha ao conectar ao servidor.", true);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-ban"></i> Cancelar';
  }
}

// ── 8. Modal Confirmar Remoção ──
function abrirModalConfirm(id, nome) {
  idParaRemover = id;
  confirmNomeEl.textContent = nome;
  modalConfirmOverlay.classList.add("open");
}

function fecharModalConfirm() {
  idParaRemover = null;
  modalConfirmOverlay.classList.remove("open");
}

async function removerUsuario() {
  if (!idParaRemover) return;

  const btn = document.getElementById("btnConfirmarRemocao");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Removendo...';

  try {
    const resp = await fetch(`${API}/gestao_usuarios.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id: idParaRemover }),
    });
    const dados = await resp.json();

    if (dados.erro) {
      mostrarToast(dados.erro, true);
      return;
    }

    usuariosCache = usuariosCache.filter((u) => u.id !== idParaRemover);
    fecharModalConfirm();
    filtrarTabela();
    mostrarToast("Usuário removido com sucesso.");
  } catch {
    mostrarToast("Falha ao conectar ao servidor.", true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-trash-alt"></i> Remover';
  }
}

// ── 9. Skeleton ──
function mostrarSkeleton() {
  corpoTabela.innerHTML = [1, 2, 3, 4]
    .map(
      () => `
        <tr class="skeleton-row"><td colspan="5"><div class="skeleton-linha"></div></td></tr>`,
    )
    .join("");
}

// ── 10. Toast ──
function mostrarToast(msg, erro = false) {
  clearTimeout(toastTimer);
  const toast = document.getElementById("toastGestao");
  const iconEl = document.getElementById("toastIconEl");
  document.getElementById("toastMsg").textContent = msg;
  iconEl.className = erro ? "fa-solid fa-xmark" : "fa-solid fa-check";
  toast.classList.toggle("erro", erro);
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ── 11. Escape HTML ──
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── 12. Eventos ──
function registrarEventos() {
  campoBusca.addEventListener("input", filtrarTabela);
  filtroPerfil.addEventListener("change", filtrarTabela);

  // Modal Detalhes
  document
    .getElementById("btnFecharDetalhes")
    .addEventListener("click", fecharModalDetalhes);
  document
    .getElementById("modalDetalhesOverlay")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("modalDetalhesOverlay"))
        fecharModalDetalhes();
    });
  document.getElementById("btnDetalhesEditar").addEventListener("click", () => {
    const id = idDetalhesAtual;
    fecharModalDetalhes();
    abrirModalEdicao(id);
  });
  document
    .getElementById("btnDetalhesHistorico")
    .addEventListener("click", () => {
      const u = usuariosCache.find((u) => u.id === idDetalhesAtual);
      if (!u) return;
      fecharModalDetalhes();
      abrirModalHistorico(u.id, u.nome);
    });

  // Modal Histórico
  document
    .getElementById("btnFecharHistorico")
    .addEventListener("click", fecharModalHistorico);
  document
    .getElementById("modalHistoricoOverlay")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("modalHistoricoOverlay"))
        fecharModalHistorico();
    });

  // Modal Editar
  document
    .getElementById("btnFecharModal")
    .addEventListener("click", fecharModalEdicao);
  document
    .getElementById("btnCancelarModal")
    .addEventListener("click", fecharModalEdicao);
  document
    .getElementById("btnSalvarEdicao")
    .addEventListener("click", salvarEdicao);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) fecharModalEdicao();
  });

  // Modal Confirmar Remoção
  document
    .getElementById("btnFecharConfirm")
    .addEventListener("click", fecharModalConfirm);
  document
    .getElementById("btnCancelarConfirm")
    .addEventListener("click", fecharModalConfirm);
  document
    .getElementById("btnConfirmarRemocao")
    .addEventListener("click", removerUsuario);
  modalConfirmOverlay.addEventListener("click", (e) => {
    if (e.target === modalConfirmOverlay) fecharModalConfirm();
  });
}
