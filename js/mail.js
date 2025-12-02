document.addEventListener("DOMContentLoaded", () => {
  // Header + Footer Mail-Links beide abdecken
  const links = document.querySelectorAll(".contact-link, .contact-link-footer");

  links.forEach(link => {
    const user = link.dataset.user;
    const domain = link.dataset.domain;

    if (user && domain) {
      link.href = `mailto:${user}@${domain}`;
    }
  });
});