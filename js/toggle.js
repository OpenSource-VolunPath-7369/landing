// === Toggle Menú ===
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".header__nav");
  const body = document.body;

  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    body.classList.toggle("no-scroll");

    // Accesibilidad
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", !expanded);
  });
});
