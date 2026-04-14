function initNavbar() {
    const header = document.querySelector(".header");
    if (!header) return;

    function update() {
        const scrollY = window.scrollY;
        const maxScroll = 200;
        const progress = Math.min(scrollY / maxScroll, 1);

        header.classList.toggle("scrolled", scrollY > 0);

        // Base 0.5 → vai até 0.85 com scroll
        header.style.setProperty("--bg-opacity",  (0.5 + progress * 0.35).toFixed(2));
        // Base 10px → vai até 18px com scroll
        header.style.setProperty("--blur-amount", `${10 + progress * 8}px`);
        header.style.setProperty("--ui-color",    progress < 0.8 ? "#F6F5E6" : "#3A2F20");
        header.style.setProperty("--logo-filter", `brightness(${1 - progress * 0.35})`);
    }

    update(); // ← essencial: aplica o estado inicial
    window.addEventListener("scroll", update);
}