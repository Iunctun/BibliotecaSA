function initNavbar() {
    const header = document.querySelector(".header");
    if (!header) return; // segurança extra

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const maxScroll = 200;
        const progress = Math.min(scrollY / maxScroll, 1);

        header.classList.toggle("scrolled", scrollY > 0);

        header.style.setProperty("--bg-opacity", (0.1 + progress * 0.7).toFixed(2));
        header.style.setProperty("--blur-amount", `${progress * 18}px`);
        header.style.setProperty("--ui-color", progress < 1 ? "#F6F5E6" : "#3A2F20");
        header.style.setProperty("--logo-filter", `brightness(${1 - progress * 0.35})`);
    });
}