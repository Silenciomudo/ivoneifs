"use strict";

require("dotenv").config();

const express = require("express");
const path = require("path");
const { handleOpenAIRequest } = require("./lib/openai-handler");
const { getPublicConfig, isSupabaseConfigured } = require("./lib/public-config");

const app = express();
const PORT = process.env.PORT || 3456;
const ROOT = __dirname;

const CLEAN_ROUTES = {
  "/": "index.html",
  "/login": "login.html",
  "/cadastro": "cadastro.html",
  "/gerar": "gerar.html",
  "/aprimorar": "aprimorar.html",
  "/agente": "agente.html",
  "/humanizar": "humanizar.html",
  "/traduzir": "traduzir.html",
  "/imagem-prompt": "imagem-prompt.html",
};

app.use(express.json({ limit: "12mb" }));

Object.keys(CLEAN_ROUTES).forEach(function (route) {
  app.get(route, function (_req, res) {
    res.sendFile(path.join(ROOT, CLEAN_ROUTES[route]));
  });
});

app.use(express.static(ROOT));

app.get("/api/health", function (_req, res) {
  res.json({
    ok: true,
    openai: Boolean(process.env.OPENAI_API_KEY),
    supabase: isSupabaseConfigured(process.env),
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  });
});

app.get("/api/config", function (_req, res) {
  res.set("Cache-Control", "no-store");
  res.json(getPublicConfig(process.env));
});

app.post("/api/openai", async function (req, res) {
  try {
    const data = await handleOpenAIRequest(req.body || {}, process.env);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message || "Erro interno",
    });
  }
});

app.listen(PORT, function () {
  console.log("");
  console.log("  Irecê AI — servidor local");
  console.log("  http://localhost:" + PORT);
  console.log("");
  if (!process.env.OPENAI_API_KEY) {
    console.log("  ⚠  OPENAI_API_KEY não definida no .env");
  } else {
    console.log("  ✓  OpenAI API configurada");
  }
  if (!isSupabaseConfigured(process.env)) {
    console.log("  ⚠  SUPABASE_URL / SUPABASE_ANON_KEY não definidos no .env");
  } else {
    console.log("  ✓  Supabase Auth configurado");
  }
  console.log("");
});
