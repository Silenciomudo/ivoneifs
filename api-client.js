(function (global) {
  "use strict";

  var API_URL = "/api/openai";
  var HEALTH_URL = "/api/health";
  var _hasOpenAI = null;

  function parseError(res, data) {
    return (data && data.error) || "Erro na requisição (" + res.status + ")";
  }

  async function checkHealth() {
    try {
      var res = await fetch(HEALTH_URL);
      if (!res.ok) {
        _hasOpenAI = false;
        return { ok: false, openai: false, server: false };
      }
      var data = await res.json();
      _hasOpenAI = Boolean(data.openai);
      return Object.assign({ server: true }, data);
    } catch (e) {
      _hasOpenAI = false;
      return { ok: false, openai: false, server: false };
    }
  }

  function showApiBanner(health) {
    var existing = document.getElementById("apiBanner");
    if (existing) existing.remove();

    var msg = "";
    if (!health.server) {
      msg =
        "Servidor API não encontrado. Feche Live Server/serve e rode: npm run dev — depois acesse http://localhost:3456";
    } else if (!health.openai) {
      msg =
        "OpenAI não configurada: edite o arquivo .env, coloque sua OPENAI_API_KEY (sk-...) e reinicie com npm run dev";
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
    var res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      if (!health.openai) throw new Error("API OpenAI não configurada no .env");
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
