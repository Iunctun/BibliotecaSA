document.addEventListener('DOMContentLoaded', () => {

    const form      = document.getElementById('loginForm');
    const emailIn   = document.getElementById('email');
    const senhaIn   = document.getElementById('senha');
    const emailErr  = document.getElementById('emailErr');
    const senhaErr  = document.getElementById('senhaErr');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnLabel  = document.getElementById('btnLabel');
    const btnSpin   = document.getElementById('btnSpinner');
    const togglePw  = document.getElementById('togglePw');
    const eyeIco    = document.getElementById('eyeIco');
    const toast     = document.getElementById('toast');
    const btnCad    = document.getElementById('btnCad');

    // ── Toggle senha ──
    togglePw.addEventListener('click', () => {
        const pw = senhaIn.type === 'password';
        senhaIn.type = pw ? 'text' : 'password';
        eyeIco.className = pw ? 'fas fa-eye-slash' : 'fas fa-eye';
    });

    emailIn.addEventListener('input', () => validateEmail());
    senhaIn.addEventListener('input', () => validateSenha());

    function validateEmail() {
        const v = emailIn.value.trim();
        if (!v) return setErr(emailIn, emailErr, 'Email obrigatório.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setErr(emailIn, emailErr, 'Email inválido.');
        return clrErr(emailIn, emailErr);
    }

    function validateSenha() {
        const v = senhaIn.value;
        if (!v) return setErr(senhaIn, senhaErr, 'Senha obrigatória.');
        if (v.length < 6) return setErr(senhaIn, senhaErr, 'Mínimo 6 caracteres.');
        return clrErr(senhaIn, senhaErr);
    }

    function setErr(el, span, msg) { el.classList.add('is-err'); span.textContent = msg; return false; }
    function clrErr(el, span)      { el.classList.remove('is-err'); span.textContent = ''; return true; }

    let toastTimer;
    function showToast(msg, type) {
        clearTimeout(toastTimer);
        toast.textContent = msg;
        toast.className = 'toast show ' + type;
        toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3000);
    }

    // ── Submit — autenticação real ──
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ok = validateEmail() & validateSenha();
        if (!ok) return;

        btnSubmit.disabled = true;
        btnLabel.style.display = 'none';
        btnSpin.style.display = 'inline-block';

        try {
            const resp = await fetch('/BibliotecaSA/backend/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailIn.value.trim(),
                    senha: senhaIn.value
                })
            });

            const data = await resp.json();

            if (data.erro) {
                showToast(data.erro, 'err');
                return;
            }

            showToast('Bem-vindo, ' + data.nome + '!', 'ok');

            setTimeout(() => {
                // Admin vai para o dashboard, usuário vai para o perfil
                if (data.perfil === 'admin') {
                    window.location.href = '../pages/dashboard.html';
                } else {
                    window.location.href = '../pages/TelaUsuarioLogado.html';
                }
            }, 1000);

        } catch (err) {
            showToast('Erro ao conectar com o servidor.', 'err');
        } finally {
            btnSubmit.disabled = false;
            btnLabel.style.display = 'inline';
            btnSpin.style.display = 'none';
        }
    });

    btnCad.addEventListener('click', () => {
        window.location.href = '../pages/TelaCadastrarUser.html';
    });

});
