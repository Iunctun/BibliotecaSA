// ============================================================
//  include.js  — v3
//  Carrega APENAS o footer via fetch.
//
//  O navbar NÃO é mais carregado aqui: cada página declara
//  o <header> inline e chama initNavbar() diretamente,
//  eliminando race conditions de timing e paths relativos.
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
        .catch(err => console.warn('[include.js]', err));
}

// Só o footer é carregado via componente
loadComponent('footer', '../components/footer.html');

// SessaoLivros (carrossel) — só injeta se o elemento existir na página
if (document.getElementById('sessaolivros')) {
    loadComponent('sessaolivros', '../components/SessaoLivros.html', initCarousels);
}