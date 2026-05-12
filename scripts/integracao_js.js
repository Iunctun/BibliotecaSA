// ============================================================
//  INTEGRAÇÃO FRONT-END → PHP
//  Substitua apenas os trechos indicados em cada arquivo JS
// ============================================================


// ──────────────────────────────────────────────────────────
//  1. TelaLogin.js — substitua o bloco "form.addEventListener submit"
// ──────────────────────────────────────────────────────────

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = validateEmail() & validateSenha();
    if (!ok) return;

    btnSubmit.disabled = true;
    btnLabel.style.display = 'none';
    btnSpin.style.display = 'inline-block';

    const resp = await fetch('../php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: emailIn.value.trim(),
            senha: senhaIn.value
        })
    });
    const data = await resp.json();

    btnSubmit.disabled = false;
    btnLabel.style.display = 'inline';
    btnSpin.style.display = 'none';

    if (data.erro) {
        showToast(data.erro, 'err');
        return;
    }

    showToast('Bem-vindo, ' + data.nome + '!', 'ok');
    setTimeout(() => {
        // Redireciona admin para dashboard, usuário para perfil
        if (data.perfil === 'admin') {
            window.location.href = '../pages/dashboard.html';
        } else {
            window.location.href = '../pages/TelaUsuarioLogado.html';
        }
    }, 1000);
});


// ──────────────────────────────────────────────────────────
//  2. TelaCadastrarUser.js — substitua o bloco "form.addEventListener submit"
// ──────────────────────────────────────────────────────────

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    btnSubmit.disabled = true;
    btnLabel.style.display = 'none';
    btnSpinner.style.display = 'inline-block';

    const resp = await fetch('../php/cadastrar_usuario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome:       fields.nome.el.value.trim(),
            email:      fields.email.el.value.trim(),
            telefone:   fields.telefone.el.value.trim(),
            cpf:        fields.cpf.el.value.trim(),
            nascimento: fields.nascimento.el.value,
            estado:     fields.estado.el.value.trim(),
            senha:      fields.senha.el.value
        })
    });
    const data = await resp.json();

    btnSubmit.disabled = false;
    btnLabel.style.display = 'inline';
    btnSpinner.style.display = 'none';

    if (data.erro) {
        showToast(data.erro, 'err');
        return;
    }

    showToast('Conta criada! Redirecionando...', 'ok');
    setTimeout(() => {
        window.location.href = '../pages/TelaLogin.html';
    }, 2000);
});


// ──────────────────────────────────────────────────────────
//  3. TelaADDLivro.js — substitua o listener "btnSalvar"
// ──────────────────────────────────────────────────────────

btnSalvar.addEventListener('click', async () => {
    if (!validar()) {
        showToast('Preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    const formData = new FormData();
    formData.append('titulo',           inputTitulo.value.trim());
    formData.append('autor',            inputAutor.value.trim());
    formData.append('categoria',        inputCategoria.value);
    formData.append('data_publicacao',  inputDataPublicacao.value);
    formData.append('quantidade',       inputQuantidade.value);
    formData.append('resumo',           inputResumo.value.trim());

    if (inputCapa.files[0]) {
        formData.append('capa', inputCapa.files[0]);
    }

    const resp = await fetch('../php/livros_salvar.php', {
        method: 'POST',
        body: formData    // multipart automático, não setar Content-Type
    });
    const data = await resp.json();

    if (data.erro) {
        showToast(data.erro, 'erro');
        return;
    }

    showToast(`"${inputTitulo.value.trim()}" cadastrado com sucesso!`, 'sucesso');
});


// ──────────────────────────────────────────────────────────
//  4. TelaLivro.js — substitua o bloco DOMContentLoaded e confirmarAluguel
//  (o livro agora vem do banco pelo id na URL: ?id=5)
// ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    const params  = new URLSearchParams(window.location.search);
    const livroId = params.get('id');

    if (!livroId) {
        window.location.href = '../pages/TelaCatalogoLivros.html';
        return;
    }

    const resp  = await fetch(`../php/livros_detalhe.php?id=${livroId}`);
    const livro = await resp.json();

    if (livro.erro) {
        window.location.href = '../pages/TelaCatalogoLivros.html';
        return;
    }

    preencherPagina(livro);
    configurarModal(livro);
});

// Substitua confirmarAluguel:
async function confirmarAluguel(livro, modal) {
    const nome    = document.getElementById('input-nome').value.trim();
    const cpf     = document.getElementById('input-cpf').value.trim();
    const data    = document.getElementById('input-data').value;
    const contato = document.getElementById('fContato') ? document.getElementById('fContato').value.trim() : '';

    if (!nome)           { showToast('Informe seu nome completo.');  return; }
    if (!validarCPF(cpf)){ showToast('Informe um CPF válido.');      return; }
    if (!data)           { showToast('Informe a data de retirada.'); return; }

    // Calcula devolução (+15 dias)
    const dt = new Date(data + 'T00:00:00');
    dt.setDate(dt.getDate() + 15);
    const devolucao = dt.toISOString().split('T')[0];

    const resp = await fetch('../php/emprestimo_salvar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            livro_id:       livro.id,
            nome:           nome,
            cpf:            cpf,
            contato:        contato || nome,
            data_retirada:  data,
            data_devolucao: devolucao
        })
    });
    const result = await resp.json();

    if (result.erro) {
        showToast(result.erro);
        return;
    }

    fecharModal(modal);
    showToast(`Reserva confirmada! Devolução até ${devolucao.split('-').reverse().join('/')}.`, 'sucesso');
}


// ──────────────────────────────────────────────────────────
//  5. sessaolivros.js — substitua a função que monta os cards
//  (busca do banco em vez do localStorage)
// ──────────────────────────────────────────────────────────

async function carregarLivros() {
    const resp   = await fetch('../php/livros_listar.php');
    const livros = await resp.json();

    const container = document.getElementById('sessaolivros');
    if (!container || !livros.length) return;

    // Monte os cards com os mesmos elementos do seu sessaolivros.js original,
    // substituindo apenas a fonte dos dados.
    // Ao clicar no card, redirecione para:
    //   window.location.href = `TelaDoLivro.html?id=${livro.id}`;
    // Em vez de usar sessionStorage.

    livros.forEach(livro => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="book-card-capa">
                <img src="${livro.capa_path || '../img/sem-capa.webp'}" alt="${livro.titulo}">
                <div class="book-card-overlay"></div>
                <span class="book-card-status ${livro.disponivel ? 'disponivel' : 'indisponivel'}">
                    ${livro.disponivel ? 'Disponível' : 'Indisponível'}
                </span>
                <span class="book-card-year">${livro.ano}</span>
            </div>
            <div class="book-card-info">
                <p class="book-card-titulo">${livro.titulo}</p>
                <p class="book-card-autor">${livro.autor}</p>
                <div class="book-card-sep"></div>
                <span class="book-card-genero">${livro.categoria}</span>
            </div>
        `;
        card.addEventListener('click', () => {
            window.location.href = `TelaDoLivro.html?id=${livro.id}`;
        });
        container.appendChild(card);
    });
}

carregarLivros();


// ──────────────────────────────────────────────────────────
//  6. TelaUsuariologado.js — no DOMContentLoaded, carregue dados reais
// ──────────────────────────────────────────────────────────

// No início do DOMContentLoaded, adicione:
const respPerfil = await fetch('../php/usuario_perfil.php');
const perfil     = await respPerfil.json();

if (perfil.erro) {
    window.location.href = '../pages/TelaLogin.html';
    return;
}

// Preencha os campos de dados pessoais:
document.getElementById('nome').value  = perfil.usuario.nome;
document.getElementById('email').value = perfil.usuario.email;

// Para empréstimos e reservas: itere sobre perfil.emprestimos e perfil.reservas
// e monte o HTML igual ao que já existe no HTML estático.


// ──────────────────────────────────────────────────────────
//  7. dashboard.js — carregue os cards com dados reais
// ──────────────────────────────────────────────────────────

// Adicione antes do new Chart(...):
async function carregarMetricas() {
    const resp = await fetch('../php/dashboard_dados.php');
    const data = await resp.json();

    if (data.erro) return;

    const valores = document.querySelectorAll('.card-value');
    // A ordem dos cards no HTML é: total_livros, total_usuarios, livros_emprestados, livros_atrasados
    if (valores[0]) valores[0].textContent = data.total_livros;
    if (valores[1]) valores[1].textContent = data.total_usuarios;
    if (valores[2]) valores[2].textContent = data.livros_emprestados;
    if (valores[3]) valores[3].textContent = data.livros_atrasados;
}

carregarMetricas();
