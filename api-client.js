(function (global) {
  "use strict";

  var _hasOpenAI = null;
  var _cfg = null;

  function getConfig() {
    if (_cfg) return _cfg;
    var pub = global.PROMPT_ATELIER_PUBLIC || {};
    _cfg = {
      supabaseUrl: (pub.supabaseUrl || "").replace(/\/$/, ""),
      supabaseAnonKey: pub.supabaseAnonKey || "",
    };
    return _cfg;
  }

  function apiBase() {
    var cfg = getConfig();
    return cfg.supabaseUrl ? cfg.supabaseUrl + "/functions/v1" : "";
  }

  function supabaseHeaders() {
    var cfg = getConfig();
    return {
      "Content-Type": "application/json",
      apikey: cfg.supabaseAnonKey,
      Authorization: "Bearer " + cfg.supabaseAnonKey,
    };
  }

  function parseError(res, data) {
    return (data && data.error) || "Erro na requisição (" + res.status + ")";
  }

  async function checkHealth() {
    var base = apiBase();
    var cfg = getConfig();

    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      _hasOpenAI = false;
      return { ok: false, openai: false, server: false, supabase: false };
    }

    try {
      var res = await fetch(base + "/health", { headers: supabaseHeaders() });
      if (!res.ok) {
        _hasOpenAI = false;
        return { ok: false, openai: false, server: true, supabase: true };
      }
      var data = await res.json();
      _hasOpenAI = Boolean(data.openai);
      return Object.assign({ server: true, supabase: true }, data);
    } catch (e) {
      _hasOpenAI = false;
      return { ok: false, openai: false, server: false, supabase: true };
    }
  }

  function showApiBanner(health) {
    var existing = document.getElementById("apiBanner");
    if (existing) existing.remove();

    var msg = "";
    if (!health.supabase) {
      msg = "Configure config.public.js com supabaseUrl e supabaseAnonKey do seu projeto Supabase.";
    } else if (!health.server) {
      msg =
        "Edge Functions não encontradas. No Supabase, faça deploy: supabase functions deploy openai health";
    } else if (!health.openai) {
      msg =
        "OpenAI não configurada. Supabase Dashboard → Edge Functions → Secrets → adicione OPENAI_API_KEY";
    } else {
      return;
    }

    var bar = document.createElement("div");
    bar.id = "apiBanner";
    bar.className = "api-banner";
    bar.setAttribute("role", "status");
    bar.textContent = msg;
    document.body.prepend(bar);
  }

  async function request(action, payload) {
    var base = apiBase();
    if (!base) throw new Error("Supabase não configurado em config.public.js");

    var res = await fetch(base + "/openai", {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify(Object.assign({ action: action }, payload || {})),
    });
    var data = await res.json();
    if (!res.ok) throw new Error(parseError(res, data));
    return data;
  }

  async function generate(input, promptType) {
    return request("generate", { input: input, promptType: promptType });
  }

  async function enhance(input, enhanceType) {
    return request("enhance", { input: input, enhanceType: enhanceType });
  }

  async function humanize(input) {
    return request("humanize", { input: input });
  }

  async function agent(payload) {
    return request("agent", payload);
  }

  async function suggest(topic) {
    return request("suggest", { topic: topic });
  }

  async function translate(input, fromLang, toLang) {
    return request("translate", { input: input, fromLang: fromLang, toLang: toLang });
  }

  async function analyzeImage(imageDataUrl, analysisType) {
    return request("image", { imageDataUrl: imageDataUrl, analysisType: analysisType });
  }

  async function withFallback(apiFn, fallbackFn) {
    try {
      var health = await checkHealth();
      if (!health.openai) throw new Error("OpenAI não configurada no Supabase Secrets");
      return await apiFn();
    } catch (err) {
      if (typeof fallbackFn === "function") {
        var fb = await fallbackFn(err);
        if (fb && fb.error) throw new Error(fb.error);
        return Object.assign({ fallback: true }, fb);
      }
      throw err;
    }
  }

  global.PromptAPI = {
    checkHealth: checkHealth,
    hasOpenAI: function () {
      return _hasOpenAI;
    },
    generate: generate,
    enhance: enhance,
    humanize: humanize,
    agent: agent,
    suggest: suggest,
    translate: translate,
    analyzeImage: analyzeImage,
    withFallback: withFallback,
  };

  document.addEventListener("DOMContentLoaded", function () {
    checkHealth().then(function (h) {
      if (h.openai) {
        document.documentElement.setAttribute("data-api", "openai");
      } else {
        showApiBanner(h);
      }
    });
  });
})(window);
