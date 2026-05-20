// ============================================================
//  include.js  — v4
//  Carrega footer e carrossel via fetch.
//  Detecta automaticamente o path correto baseado na URL.
// ============================================================

function loadComponent(id, file, callback) {
    fetch(file)
        .then(res => {
            if (!res.ok) throw new Error('Componente não encontrado: ' + file);
            return res.text();
        })
        .then(data => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = data;
            if (callback) callback();
        })
        .catch(err => console.warn('[include.js]', err.message));
}

// Detecta se está em /pages/ ou na raiz para usar path correto
const emPages = window.location.pathname.includes('/pages/');
const base    = emPages ? '../' : '';

loadComponent('footer', `${base}components/footer.html`);

if (document.getElementById('sessaolivros')) {
    loadComponent('sessaolivros', `${base}components/SessaoLivros.html`, initCarousels);
}
