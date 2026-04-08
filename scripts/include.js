function loadComponent(id, file, callback) {
    fetch(file)
        .then(res => res.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback(); // ← dispara só após injetar o HTML
        });
}

loadComponent("header", "./components/navbar.html", initNavbar);