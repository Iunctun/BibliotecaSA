// ============================================================
//  Tela do Livro — carrega dados do banco pelo ?id= na URL
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {

    const params  = new URLSearchParams(window.location.search);
    const livroId = params.get('id');

    if (!livroId) {
        window.location.href = '../pages/TelaCatalogoLivros.html';
        return;
    }

    try {
        const resp  = await fetch(`/BibliotecaSA/backend/livros_detalhe.php?id=${livroId}`);
        const livro = await resp.json();

        if (livro.erro) {
            window.location.href = '../pages/TelaCatalogoLivros.html';
            return;
        }

        preencherPagina(livro);
        configurarModal(livro);

    } catch {
        window.location.href = '../pages/TelaCatalogoLivros.html';
    }

});

// ============================================================
//  Toast
// ============================================================

function showToast(mensagem, tipo = 'erro') {
    const toastExistente = document.getElementById('toast-notificacao');
    if (toastExistente) toastExistente.remove();

    const toast   = document.createElement('div');
    toast.id      = 'toast-notificacao';
    const isErro  = tipo === 'erro';

    toast.style.cssText = `
        position: fixed; bottom: 2rem; right: 2rem; z-index: 9999;
        display: flex; align-items: center; gap: 0.75rem;
        padding: 1rem 1.4rem; border-radius: 10px;
        background: ${isErro ? '#fff1f1' : '#f0faf4'};
        border-left: 4px solid ${isErro ? '#e53e3e' : '#2c6e49'};
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        font-size: 0.95rem; color: ${isErro ? '#c53030' : '#276749'};
        font-weight: 500; max-width: 360px;
        opacity: 0; transform: translateY(12px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;

    const icone = isErro ? 'fa-circle-exclamation' : 'fa-circle-check';
    toast.innerHTML = `<i class="fa-solid ${icone}" style="font-size:1.2rem;"></i><span>${mensagem}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }));

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ============================================================
//  Máscara e validação de CPF
// ============================================================

function aplicarMascaraCPF(input) {
    input.addEventListener('input', () => {
        let valor = input.value.replace(/\D/g, '').slice(0, 11);
        if (valor.length > 9)      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
        else if (valor.length > 6) valor = valor.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        else if (valor.length > 3) valor = valor.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        input.value = valor;
    });
}

function validarCPF(cpf) {
    return cpf.replace(/\D/g, '').length === 11;
}

// ============================================================
//  Preenche a página com dados do livro
// ============================================================

function preencherPagina(livro) {
    document.title = `${livro.titulo} - Biblioteca`;

    document.getElementById('livro-capa').src            = livro.capa_path ? `../${livro.capa_path}` : '../img/sem-capa.webp';
    document.getElementById('livro-capa').alt            = `Capa do livro ${livro.titulo}`;
    document.getElementById('livro-titulo').textContent  = livro.titulo;
    document.getElementById('livro-autor').textContent   = `Por ${livro.autor}`;
    document.getElementById('livro-publicacao').textContent        = `Publicado em ${livro.ano}`;
    document.getElementById('livro-publicacao-footer').textContent = livro.ano;
    document.getElementById('livro-resumo').textContent  = livro.resumo;
    document.getElementById('livro-genero').textContent  = livro.categoria;
    document.getElementById('livro-id').textContent      = `Código: LIV-${String(livro.id).padStart(3,'0')}`;

    const statusEl = document.getElementById('livro-status');
    statusEl.textContent = livro.disponivel ? 'Disponível' : 'Indisponível';
    statusEl.classList.add(livro.disponivel ? 'disponivel' : 'indisponivel');

    if (!livro.disponivel) {
        const btnAlugar = document.getElementById('btn-alugar');
        btnAlugar.disabled    = true;
        btnAlugar.textContent = 'Livro indisponível';
    }
}

// ============================================================
//  Modal de locação
// ============================================================

function configurarModal(livro) {
    const modal       = document.getElementById('modal-aluguel');
    const btnAlugar   = document.getElementById('btn-alugar');
    const btnFechar   = document.getElementById('modal-fechar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnConfirmar= document.getElementById('btn-confirmar');
    const inputCPF    = document.getElementById('input-cpf');

    document.getElementById('modal-capa').src               = livro.capa_path ? `../${livro.capa_path}` : '../img/sem-capa.webp';
    document.getElementById('modal-titulo-livro').textContent = livro.titulo;
    document.getElementById('modal-autor-livro').textContent  = livro.autor;

    aplicarMascaraCPF(inputCPF);

    btnAlugar.addEventListener('click', () => {
        // Verifica se está logado antes de abrir o modal
        fetch('/BibliotecaSA/backend/sessao.php')
            .then(r => r.json())
            .then(s => {
                if (!s.logado) {
                    showToast('Você precisa estar logado para locar um livro.');
                    setTimeout(() => window.location.href = '../pages/TelaLogin.html', 1500);
                    return;
                }
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
    });

    btnFechar.addEventListener('click',   () => fecharModal(modal));
    btnCancelar.addEventListener('click', () => fecharModal(modal));
    modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(modal); });
    btnConfirmar.addEventListener('click', () => confirmarAluguel(livro, modal));
}

function fecharModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('input-nome').value = '';
    document.getElementById('input-cpf').value  = '';
    document.getElementById('input-data').value = '';
}

async function confirmarAluguel(livro, modal) {
    const nome = document.getElementById('input-nome').value.trim();
    const cpf  = document.getElementById('input-cpf').value.trim();
    const data = document.getElementById('input-data').value;

    if (!nome)           { showToast('Informe seu nome completo.');  return; }
    if (!validarCPF(cpf)){ showToast('Informe um CPF válido.');      return; }
    if (!data)           { showToast('Informe a data de retirada.'); return; }

    // Devolução = retirada + 15 dias
    const dtRetirada   = new Date(data + 'T00:00:00');
    const dtDevolucao  = new Date(dtRetirada);
    dtDevolucao.setDate(dtDevolucao.getDate() + 15);
    const devolucaoISO = dtDevolucao.toISOString().split('T')[0];

    try {
        const resp = await fetch('/BibliotecaSA/backend/emprestimo_salvar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                livro_id:       livro.id,
                nome:           nome,
                cpf:            cpf,
                contato:        nome,
                data_retirada:  data,
                data_devolucao: devolucaoISO
            })
        });

        const result = await resp.json();

        if (result.erro) {
            showToast(result.erro);
            return;
        }

        fecharModal(modal);
        showToast(
            `Reserva confirmada! Devolução até ${dtDevolucao.toLocaleDateString('pt-BR')}.`,
            'sucesso'
        );

    } catch {
        showToast('Erro ao conectar com o servidor.');
    }
}
