document.addEventListener("DOMContentLoaded", () => {

  // ── Injeta estilos do toast uma única vez ──
  if (!document.getElementById('toast-usuario-style')) {
    const style = document.createElement('style');
    style.id = 'toast-usuario-style';
    style.textContent = `
      #toast-usuario {
        position: fixed;
        bottom: 40px;
        right: 40px;
        display: flex;
        align-items: center;
        gap: 16px;
        background: #111316;
        border: 1px solid rgba(29, 158, 117, 0.4);
        border-radius: 4px;
        padding: 20px 28px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        z-index: 9999;
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 0.35s ease, transform 0.35s ease;
        pointer-events: none;
        min-width: 320px;
      }
      #toast-usuario.show {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      #toast-usuario .toast-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(29,158,117,0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      #toast-usuario .toast-icon i {
        color: #1d9e75;
        font-size: 16px;
      }
      #toast-usuario .toast-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }
      #toast-usuario .toast-title {
        font-family: 'Playfair Display', serif;
        font-size: 16px;
        font-weight: 400;
        color: #ffffff;
      }
      #toast-usuario .toast-sub {
        font-size: 12px;
        font-weight: 300;
        color: rgba(255,255,255,0.45);
        letter-spacing: 0.3px;
      }
      #toast-usuario .toast-close {
        margin-left: auto;
        background: none;
        border: none;
        color: rgba(255,255,255,0.25);
        font-size: 14px;
        cursor: pointer;
        padding: 4px;
        transition: color 0.2s ease;
        flex-shrink: 0;
      }
      #toast-usuario .toast-close:hover { color: rgba(255,255,255,0.6); }
      #toast-usuario .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background: #1d9e75;
        border-radius: 0 0 0 4px;
        width: 100%;
        transform-origin: left;
      }
      #toast-usuario.show .toast-progress {
        animation: toast-bar 4s linear forwards;
      }
      @keyframes toast-bar {
        from { transform: scaleX(1); }
        to   { transform: scaleX(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Cria o elemento do toast no DOM ──
  const toastEl = document.createElement('div');
  toastEl.id = 'toast-usuario';
  toastEl.innerHTML = `
    <div class="toast-icon"><i class="fas fa-check"></i></div>
    <div class="toast-body">
      <span class="toast-title"></span>
      <span class="toast-sub"></span>
    </div>
    <button class="toast-close"><i class="fas fa-xmark"></i></button>
    <div class="toast-progress"></div>
  `;
  document.body.appendChild(toastEl);

  let toastTimer = null;

  function showToast(titulo, subtitulo) {
    // Reinicia a barra de progresso
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

  // ── Renovar ──
  document.querySelectorAll(".btnRenovar").forEach((botao, index) => {
    botao.addEventListener("click", () => {
      showToast("Livro renovado!", `O livro ${index + 1} foi renovado com sucesso.`);
    });
  });

  // ── Reservar ──
  document.querySelectorAll(".btnReservar").forEach((botao) => {
    botao.addEventListener("click", () => {
      showToast("Livro reservado!", "Sua reserva foi realizada com sucesso.");
    });
  });

  // ── Pagamento ──
  const btnPagamento = document.getElementById("btnPagamento");
  if (btnPagamento) {
    btnPagamento.addEventListener("click", () => {
      const valor = document.getElementById("valor").textContent;
      showToast("Redirecionando!", `Encaminhando para o pagamento de ${valor}.`);
    });
  }

  // ── Editar perfil ──
  const btnEditar = document.getElementById("btnEditar");
  if (btnEditar) {
    btnEditar.addEventListener("click", () => {
      const nome  = document.getElementById("nome").value;
      const email = document.getElementById("email").value;
      showToast("Perfil atualizado!", `${nome} — ${email}`);
    });
  }

});