(function () {
  "use strict";

  var LINKS = [
    { group: "Popular", items: [
      { href: "index.html", label: "Início" },
      { href: "gerar.html", label: "Gerar Prompts" },
      { href: "imagem-prompt.html", label: "Imagem para Prompt" },
      { href: "aprimorar.html", label: "Aprimorador" },
      { href: "agente.html", label: "Prompt de Agente" },
    ]},
    { group: "Ferramentas", items: [
      { href: "humanizar.html", label: "Humanizador" },
      { href: "traduzir.html", label: "Tradutor" },
    ]},
    { group: "Por Categoria", items: [
      { href: "gerar.html?tipo=escrita", label: "Escrita" },
      { href: "gerar.html?tipo=arte", label: "Arte de IA" },
      { href: "gerar.html?tipo=codigo", label: "Codificação" },
      { href: "gerar.html?tipo=video", label: "Vídeo" },
      { href: "gerar.html?tipo=musica", label: "Música" },
      { href: "gerar.html?tipo=personagem", label: "Personagem" },
    ]},
    { group: "Por Modelo", items: [
      { href: "gerar.html?tipo=chatgpt", label: "ChatGPT" },
      { href: "gerar.html?tipo=claude", label: "Claude" },
      { href: "gerar.html?tipo=gemini", label: "Gemini" },
      { href: "gerar.html?tipo=midjourney", label: "Midjourney" },
      { href: "gerar.html?tipo=dalle", label: "DALL·E" },
      { href: "gerar.html?tipo=stable-diffusion", label: "Stable Diffusion" },
    ]},
  ];

  function buildNavHtml() {
    var path = location.pathname.split("/").pop() || "index.html";
    var params = new URLSearchParams(location.search);
    var tipo = params.get("tipo");
    var current = path + location.search;

    return LINKS.map(function (section) {
      var items = section.items.map(function (item) {
        var active = item.href === current || item.href === path;
        if (path === "gerar.html" && tipo && item.href === "gerar.html?tipo=" + tipo) active = true;
        return '<a href="' + item.href + '" class="nav-link' + (active ? " active" : "") + '">' + item.label + "</a>";
      }).join("");
      return '<p class="nav-group-title">' + section.group + '</p>' + items;
    }).join("");
  }

  function renderAuthBlock(user) {
    if (user && user.email) {
      var name = user.name || user.email.split("@")[0];
      return (
        '<div class="nav-auth">' +
        '<p class="nav-group-title">Conta</p>' +
        '<p class="nav-user">' + name + '</p>' +
        '<a href="#" class="nav-link nav-logout" id="navLogout">Sair</a>' +
        "</div>"
      );
    }

    return (
      '<div class="nav-auth">' +
      '<p class="nav-group-title">Conta</p>' +
      '<a href="/login" class="nav-link nav-login">Entrar</a>' +
      '<a href="/cadastro" class="nav-link">Criar conta</a>' +
      "</div>"
    );
  }

  function renderSidebar(user) {
    var el = document.getElementById("sidebar");
    if (!el) return;

    el.innerHTML =
      '<div class="sidebar-header">' +
      '<a href="index.html" class="logo"><span class="logo-mark">◈</span><span class="logo-text">Prompt Atelier</span></a>' +
      '<button type="button" class="sidebar-close" id="sidebarClose" aria-label="Fechar menu">×</button>' +
      "</div><nav class=\"sidebar-nav\">" + buildNavHtml() + renderAuthBlock(user) + "</nav>";
  }

  function bindLogout() {
    var btn = document.getElementById("navLogout");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.PromptAuth) {
        PromptAuth.logout().then(function () {
          location.href = "/login";
        });
      } else {
        location.href = "login.html";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    renderSidebar(null);
    bindLogout();

    if (window.PromptAuth) {
      try {
        await PromptAuth.init();
        var user = await PromptAuth.getSession();
        renderSidebar(user);
        bindLogout();
      } catch (e) {}
    }
  });
})();
