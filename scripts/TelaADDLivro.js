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

// ── Elementos ──
const coverArea       = document.getElementById('coverArea');
const inputCapa       = document.getElementById('inputCapa');
const capaPreview     = document.getElementById('capaPreview');
const capaPlaceholder = document.getElementById('capaPlaceholder');
const capaLabel       = document.getElementById('capaLabel');

const inputTitulo         = document.getElementById('inputTitulo');
const inputAutor          = document.getElementById('inputAutor');
const inputCategoria      = document.getElementById('inputCategoria');
const inputDataPublicacao = document.getElementById('inputDataPublicacao');
const inputQuantidade     = document.getElementById('inputQuantidade');
const inputResumo         = document.getElementById('inputResumo');
const charCount           = document.getElementById('charCount');
const btnSalvar           = document.getElementById('btnSalvar');

// ── Preview da capa ──
inputCapa.addEventListener('change', () => {
    const file = inputCapa.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5 MB.', 'erro');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        capaPreview.src = e.target.result;
        coverArea.classList.add('has-image');
        capaLabel.textContent = 'Clique para trocar a capa';
    };
    reader.readAsDataURL(file);
});

// ── Contador de caracteres ──
inputResumo.addEventListener('input', () => {
    charCount.textContent = `${inputResumo.value.length} / 600`;
});

// ── Toast ──
function showToast(mensagem, tipo = 'erro') {
    const toast = document.getElementById('toast-add');
    const icon  = document.getElementById('toast-icon');
    const msg   = document.getElementById('toast-msg');

    toast.className = '';
    icon.className  = tipo === 'sucesso'
        ? 'fa-solid fa-circle-check'
        : 'fa-solid fa-circle-exclamation';

    msg.textContent = mensagem;
    toast.classList.add(tipo, 'show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Validação ──
function validar() {
    let ok = true;
    [inputTitulo, inputAutor, inputCategoria, inputDataPublicacao, inputQuantidade, inputResumo].forEach(el => {
        el.classList.remove('error');
    });

    if (!inputTitulo.value.trim())                                { inputTitulo.classList.add('error');         ok = false; }
    if (!inputAutor.value.trim())                                 { inputAutor.classList.add('error');          ok = false; }
    if (!inputCategoria.value)                                    { inputCategoria.classList.add('error');      ok = false; }
    if (!inputDataPublicacao.value)                               { inputDataPublicacao.classList.add('error'); ok = false; }
    if (!inputQuantidade.value || +inputQuantidade.value < 1)     { inputQuantidade.classList.add('error');     ok = false; }
    if (!inputResumo.value.trim())                                { inputResumo.classList.add('error');         ok = false; }

    return ok;
}

// ── Salvar — envia para o banco ──
btnSalvar.addEventListener('click', async () => {
    if (!validar()) {
        showToast('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    btnSalvar.disabled = true;

    try {
        const formData = new FormData();
        formData.append('titulo',          inputTitulo.value.trim());
        formData.append('autor',           inputAutor.value.trim());
        formData.append('categoria',       inputCategoria.value);
        formData.append('data_publicacao', inputDataPublicacao.value);
        formData.append('quantidade',      inputQuantidade.value);
        formData.append('resumo',          inputResumo.value.trim());

        if (inputCapa.files[0]) {
            formData.append('capa', inputCapa.files[0]);
        }

        const resp = await fetch('/BibliotecaSA/backend/livros_salvar.php', {
            method: 'POST',
            body: formData
        });

        const data = await resp.json();

        if (data.erro) {
            showToast(data.erro, 'erro');
            return;
        }

        showToast(`"${inputTitulo.value.trim()}" cadastrado com sucesso!`, 'sucesso');

        // Limpa o formulário após salvar
        setTimeout(() => {
            inputTitulo.value = '';
            inputAutor.value = '';
            inputCategoria.value = '';
            inputDataPublicacao.value = '';
            inputQuantidade.value = '';
            inputResumo.value = '';
            charCount.textContent = '0 / 600';
            coverArea.classList.remove('has-image');
            capaPreview.src = '';
            capaLabel.textContent = 'Foto da capa';
            inputCapa.value = '';
        }, 1500);

    } catch (err) {
        showToast('Erro ao conectar com o servidor.', 'erro');
    } finally {
        btnSalvar.disabled = false;
    }
});
