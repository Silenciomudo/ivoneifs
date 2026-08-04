(function () {
  "use strict";

  const STORAGE_THEME = "prompt-atelier-theme";

  function showToast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function copyText(text) {
    if (!text || !text.trim()) {
      showToast("Nada para copiar.");
      return;
    }
    navigator.clipboard.writeText(text).then(
      function () {
        showToast("Copiado para a área de transferência!");
      },
      function () {
        showToast("Não foi possível copiar.");
      }
    );
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_THEME);
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = saved || (prefersLight ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", theme);

    const btn = document.getElementById("themeBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem(STORAGE_THEME, next);
      });
    }
  }

  function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menuBtn");
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);

    function open() {
      sidebar?.classList.add("open");
      overlay.classList.add("show");
    }
    function close() {
      sidebar?.classList.remove("open");
      overlay.classList.remove("show");
    }

    menuBtn?.addEventListener("click", open);
    document.body.addEventListener("click", function (e) {
      if (e.target.id === "sidebarClose" || e.target.closest("#sidebarClose")) close();
    });
    overlay.addEventListener("click", close);
  }

  function initCopyButtons() {
    document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const sel = btn.getAttribute("data-copy-target");
        const node = document.querySelector(sel);
        if (node) copyText(node.textContent.trim());
      });
    });

    document.querySelectorAll("[data-copy-from]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-copy-from");
        const node = document.getElementById(id);
        if (node) copyText(node.textContent.trim());
      });
    });
  }

  function setActiveNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    const params = new URLSearchParams(location.search);
    const tipo = params.get("tipo");

    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.classList.remove("active");
      const href = link.getAttribute("href") || "";
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("active");
      }
      if (path === "gerar.html" && tipo && href.includes("tipo=" + tipo)) {
        link.classList.add("active");
      }
    });
  }

  window.PromptAtelier = {
    showToast: showToast,
    copyText: copyText,
  };

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initSidebar();
    initCopyButtons();
  });
})();
