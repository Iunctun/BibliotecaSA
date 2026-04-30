// ── Elementos ──
const coverArea       = document.getElementById('coverArea');
const inputCapa       = document.getElementById('inputCapa');
const capaPreview     = document.getElementById('capaPreview');
const capaPlaceholder = document.getElementById('capaPlaceholder');
const capaLabel       = document.getElementById('capaLabel');

const inputTitulo          = document.getElementById('inputTitulo');
const inputAutor           = document.getElementById('inputAutor');
const inputCategoria       = document.getElementById('inputCategoria');
const inputDataPublicacao  = document.getElementById('inputDataPublicacao');
const inputQuantidade      = document.getElementById('inputQuantidade');
const inputResumo          = document.getElementById('inputResumo');
const charCount            = document.getElementById('charCount');
const btnSalvar            = document.getElementById('btnSalvar');

// ── Preview da capa ──
let capaBase64 = null;

inputCapa.addEventListener('change', () => {
    const file = inputCapa.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5 MB.', 'erro');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        capaBase64 = e.target.result;
        capaPreview.src = capaBase64;
        coverArea.classList.add('has-image');
        capaLabel.textContent = 'Clique para trocar a capa';
    };
    reader.readAsDataURL(file);
});

// ── Contador de caracteres do resumo ──
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

// ── Gerar ID único ──
function gerarId() {
    const livros = JSON.parse(localStorage.getItem('livrosCadastrados') || '[]');
    const num = livros.length + 1;
    return 'LIV-' + String(num).padStart(3, '0');
}

// ── Validação ──
function validar() {
    let ok = true;

    [inputTitulo, inputAutor, inputCategoria, inputDataPublicacao, inputQuantidade, inputResumo].forEach(el => {
        el.classList.remove('error');
    });

    if (!inputTitulo.value.trim())         { inputTitulo.classList.add('error');         ok = false; }
    if (!inputAutor.value.trim())          { inputAutor.classList.add('error');          ok = false; }
    if (!inputCategoria.value)             { inputCategoria.classList.add('error');      ok = false; }
    if (!inputDataPublicacao.value)        { inputDataPublicacao.classList.add('error'); ok = false; }
    if (!inputQuantidade.value || +inputQuantidade.value < 1) { inputQuantidade.classList.add('error'); ok = false; }
    if (!inputResumo.value.trim())         { inputResumo.classList.add('error');         ok = false; }

    return ok;
}

// ── Salvar ──
btnSalvar.addEventListener('click', () => {
    if (!validar()) {
        showToast('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    const anoPublicacao = inputDataPublicacao.value.split('-')[0];

    const novoLivro = {
        id:             gerarId(),
        titulo:         inputTitulo.value.trim(),
        autor:          inputAutor.value.trim(),
        capa:           capaBase64 || '../img/sem-capa.webp',
        genero:         inputCategoria.value,
        dataPublicacao: anoPublicacao,
        quantidade:     parseInt(inputQuantidade.value),
        disponivel:     parseInt(inputQuantidade.value) > 0,
        resumo:         inputResumo.value.trim()
    };

    const livros = JSON.parse(localStorage.getItem('livrosCadastrados') || '[]');
    livros.push(novoLivro);
    localStorage.setItem('livrosCadastrados', JSON.stringify(livros));

    showToast(`"${novoLivro.titulo}" cadastrado com sucesso!`, 'sucesso');
});