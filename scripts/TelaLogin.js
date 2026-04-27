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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ok = validateEmail() & validateSenha();
        if (!ok) return;

        btnSubmit.disabled = true;
        btnLabel.style.display = 'none';
        btnSpin.style.display = 'inline-block';

        await new Promise(r => setTimeout(r, 1500)); // substitua pelo fetch real

        btnSubmit.disabled = false;
        btnLabel.style.display = 'inline';
        btnSpin.style.display = 'none';

        showToast('Bem-vindo de volta!', 'ok');
        // window.location.href = '/dashboard';
    });

    btnCad.addEventListener('click', () => {
        showToast('Redirecionando...', '');
        // window.location.href = '/cadastro';
    });

    let toastTimer;
    function showToast(msg, type) {
        clearTimeout(toastTimer);
        toast.textContent = msg;
        toast.className = 'toast show ' + type;
        toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3000);
    }
});