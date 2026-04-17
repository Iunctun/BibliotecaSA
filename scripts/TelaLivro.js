// ============================================================
//  Tela do Livro — carrega os dados e controla o modal
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    const livroJSON = sessionStorage.getItem('livroSelecionado');

    if (!livroJSON) {
        window.location.href = '../index.html';
        return;
    }

    const livro = JSON.parse(livroJSON);

    preencherPagina(livro);
    configurarModal(livro);

});

// ============================================================
//  Toast de notificação (substitui alert)
// ============================================================

function showToast(mensagem, tipo = 'erro') {
    const toastExistente = document.getElementById('toast-notificacao');
    if (toastExistente) toastExistente.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-notificacao';

    const isErro = tipo === 'erro';

    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.4rem;
        border-radius: 10px;
        background: ${isErro ? '#fff1f1' : '#f0faf4'};
        border-left: 4px solid ${isErro ? '#e53e3e' : '#2c6e49'};
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        font-size: 0.95rem;
        color: ${isErro ? '#c53030' : '#276749'};
        font-weight: 500;
        max-width: 360px;
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;

    const icone = isErro ? 'fa-circle-exclamation' : 'fa-circle-check';
    toast.innerHTML = `
        <i class="fa-solid ${icone}" style="font-size:1.2rem;"></i>
        <span>${mensagem}</span>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
    });

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
        if (valor.length > 9) {
            valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
        } else if (valor.length > 6) {
            valor = valor.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        } else if (valor.length > 3) {
            valor = valor.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        }
        input.value = valor;
    });
}

function validarCPF(cpf) {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.length === 11;
}

// ============================================================
//  Preenche as informações na página
// ============================================================

function preencherPagina(livro) {
    document.title = `${livro.titulo} - Biblioteca`;

    document.getElementById('livro-capa').src = livro.capa;
    document.getElementById('livro-capa').alt = `Capa do livro ${livro.titulo}`;
    document.getElementById('livro-titulo').textContent = livro.titulo;
    document.getElementById('livro-autor').textContent = `Por ${livro.autor}`;
    document.getElementById('livro-publicacao').textContent = `Publicado em ${livro.dataPublicacao}`;
    document.getElementById('livro-publicacao-footer').textContent = livro.dataPublicacao;
    document.getElementById('livro-resumo').textContent = livro.resumo;
    document.getElementById('livro-genero').textContent = livro.genero;
    document.getElementById('livro-id').textContent = `Código: ${livro.id}`;

    const statusEl = document.getElementById('livro-status');
    statusEl.textContent = livro.disponivel ? 'Disponível' : 'Indisponível';
    statusEl.classList.add(livro.disponivel ? 'disponivel' : 'indisponivel');

    if (!livro.disponivel) {
        const btnAlugar = document.getElementById('btn-alugar');
        btnAlugar.disabled = true;
        btnAlugar.textContent = 'Livro indisponível';
    }
}

// ============================================================
//  Controla abertura, fechamento e confirmação do modal
// ============================================================

function configurarModal(livro) {
    const modal = document.getElementById('modal-aluguel');
    const btnAlugar = document.getElementById('btn-alugar');
    const btnFechar = document.getElementById('modal-fechar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const inputCPF = document.getElementById('input-cpf');

    document.getElementById('modal-capa').src = livro.capa;
    document.getElementById('modal-titulo-livro').textContent = livro.titulo;
    document.getElementById('modal-autor-livro').textContent = livro.autor;

    aplicarMascaraCPF(inputCPF);

    btnAlugar.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    btnFechar.addEventListener('click', () => fecharModal(modal));
    btnCancelar.addEventListener('click', () => fecharModal(modal));

    modal.addEventListener('click', (event) => {
        if (event.target === modal) fecharModal(modal);
    });

    btnConfirmar.addEventListener('click', () => confirmarAluguel(livro, modal));
}

function fecharModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('input-nome').value = '';
    document.getElementById('input-cpf').value = '';
    document.getElementById('input-data').value = '';
}

function confirmarAluguel(livro, modal) {
    const nome = document.getElementById('input-nome').value.trim();
    const cpf = document.getElementById('input-cpf').value.trim();
    const data = document.getElementById('input-data').value;

    if (!nome) {
        showToast('Por favor, informe seu nome completo.');
        return;
    }

    if (!validarCPF(cpf)) {
        showToast('Por favor, informe um CPF válido.');
        return;
    }

    if (!data) {
        showToast('Por favor, informe a data de locação.');
        return;
    }

    const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');

    fecharModal(modal);
    showToast(`Reserva confirmada! "${livro.titulo}" será retirado em ${dataFormatada}.`, 'sucesso');
}