(function (global) {
  "use strict";

  var client = null;
  var initPromise = null;

  async function loadConfig() {
    try {
      var res = await fetch("/api/config");
      if (res.ok) {
        var data = await res.json();
        if (data.supabaseUrl && data.supabaseAnonKey) return data;
      }
    } catch (e) {}

    var pub = global.PROMPT_ATELIER_PUBLIC || {};
    return {
      supabaseUrl: pub.supabaseUrl || "",
      supabaseAnonKey: pub.supabaseAnonKey || "",
    };
  }

  async function init() {
    if (client) return client;
    if (initPromise) return initPromise;

    initPromise = (async function () {
      if (!global.supabase || !global.supabase.createClient) {
        throw new Error("Biblioteca Supabase não carregada. Recarregue a página.");
      }

      var cfg = await loadConfig();

      if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
        throw new Error(
          "Supabase não configurado. Cole SUPABASE_ANON_KEY no .env e rode npm run dev, " +
          "ou preencha config.public.js com a chave anon do dashboard Supabase."
        );
      }

      client = global.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });

      return client;
    })();

    return initPromise;
  }

  function getClient() {
    return client;
  }

  global.PromptSupabase = {
    init: init,
    getClient: getClient,
  };
})(window);
