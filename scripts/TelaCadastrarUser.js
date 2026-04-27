document.addEventListener('DOMContentLoaded', () => {

    const form        = document.getElementById('cadastroForm');
    const btnSubmit   = document.getElementById('btnSubmit');
    const btnLabel    = document.getElementById('btnLabel');
    const btnSpinner  = document.getElementById('btnSpinner');
    const toast       = document.getElementById('toast');

    // ── Máscaras ──
    document.getElementById('cpf').addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        this.value = v;
    });

    document.getElementById('telefone').addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '').slice(0, 11);
        if (v.length <= 10) {
            v = v.replace(/(\d{2})(\d)/, '($1) $2');
            v = v.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            v = v.replace(/(\d{2})(\d)/, '($1) $2');
            v = v.replace(/(\d{5})(\d)/, '$1-$2');
        }
        this.value = v;
    });

    // ── Toggle senha ──
    document.querySelectorAll('.toggle-pw').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            const pw = target.type === 'password';
            target.type = pw ? 'text' : 'password';
            btn.querySelector('i').className = pw ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    });

    // ── Validações ──
    const fields = {
        nome:        { el: null, err: null },
        email:       { el: null, err: null },
        telefone:    { el: null, err: null },
        cpf:         { el: null, err: null },
        nascimento:  { el: null, err: null },
        localizacao: { el: null, err: null },
        senha:       { el: null, err: null },
        confirmar:   { el: null, err: null },
    };

    Object.keys(fields).forEach(id => {
        fields[id].el  = document.getElementById(id);
        fields[id].err = document.getElementById(id + 'Err');
        fields[id].el.addEventListener('input', () => validate(id));
        fields[id].el.addEventListener('blur',  () => validate(id));
    });

    function validate(id) {
        const el  = fields[id].el;
        const err = fields[id].err;
        const v   = el.value.trim();

        switch (id) {
            case 'nome':
                if (!v)              return setErr(el, err, 'Nome obrigatório.');
                if (v.length < 3)    return setErr(el, err, 'Nome muito curto.');
                break;
            case 'email':
                if (!v)              return setErr(el, err, 'Email obrigatório.');
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setErr(el, err, 'Email inválido.');
                break;
            case 'telefone':
                if (!v)              return setErr(el, err, 'Telefone obrigatório.');
                if (v.replace(/\D/g,'').length < 10) return setErr(el, err, 'Telefone inválido.');
                break;
            case 'cpf':
                if (!v)              return setErr(el, err, 'CPF obrigatório.');
                if (v.replace(/\D/g,'').length < 11) return setErr(el, err, 'CPF inválido.');
                break;
            case 'nascimento':
                if (!v)              return setErr(el, err, 'Data obrigatória.');
                if (new Date(v) > new Date()) return setErr(el, err, 'Data inválida.');
                break;
            case 'localizacao':
                if (!v)              return setErr(el, err, 'Localização obrigatória.');
                break;
            case 'senha':
                if (!v)              return setErr(el, err, 'Senha obrigatória.');
                if (v.length < 6)    return setErr(el, err, 'Mínimo 6 caracteres.');
                // revalida confirmar se já preenchida
                if (fields.confirmar.el.value) validate('confirmar');
                break;
            case 'confirmar':
                if (!v)              return setErr(el, err, 'Confirme a senha.');
                if (v !== fields.senha.el.value) return setErr(el, err, 'Senhas não coincidem.');
                break;
        }
        return clrErr(el, err);
    }

    function validateAll() {
        return Object.keys(fields).map(id => validate(id)).every(Boolean);
    }

    function setErr(el, span, msg) { el.classList.add('is-err'); span.textContent = msg; return false; }
    function clrErr(el, span)      { el.classList.remove('is-err'); span.textContent = ''; return true; }

    // ── Submit ──
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        btnSubmit.disabled = true;
        btnLabel.style.display = 'none';
        btnSpinner.style.display = 'inline-block';

        // substitua pelo fetch real
        await new Promise(r => setTimeout(r, 1600));

        btnSubmit.disabled = false;
        btnLabel.style.display = 'inline';
        btnSpinner.style.display = 'none';

        showToast('Conta criada! Redirecionando...', 'ok');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });

    let toastTimer;
    function showToast(msg, type) {
        clearTimeout(toastTimer);
        toast.textContent = msg;
        toast.className = 'toast show ' + type;
        toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3500);
    }
});