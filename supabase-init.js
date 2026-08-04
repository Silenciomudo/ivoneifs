(function (global) {
  "use strict";

  var client = null;
  var initPromise = null;

  function loadConfig() {
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

      var cfg = loadConfig();

      if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
        throw new Error(
          "Supabase não configurado. Edite config.public.js com supabaseUrl e supabaseAnonKey."
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

  function getConfig() {
    return loadConfig();
  }

  global.PromptSupabase = {
    init: init,
    getClient: getClient,
    getConfig: getConfig,
  };
})(window);
