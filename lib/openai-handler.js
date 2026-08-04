"use strict";

const SYSTEM_BASE =
  "Você é um especialista em engenharia de prompt. Responda sempre em português do Brasil. " +
  "Retorne apenas o texto solicitado, sem explicações extras, sem markdown desnecessário.";

function buildMessages(action, payload) {
  const input = (payload.input || payload.text || "").trim();
  const type = payload.type || payload.enhanceType || "improve";
  const role = payload.role || "assistant";
  const tone = payload.tone || "professional";
  const task = (payload.task || "").trim();
  const context = (payload.context || "").trim();
  const topic = (payload.topic || input).trim();
  const analysisType = payload.analysisType || "describe";

  switch (action) {
    case "generate":
      return [
        { role: "system", content: SYSTEM_BASE },
        {
          role: "user",
          content:
            `Crie um prompt profissional e detalhado para IA com base nesta ideia: "${input}". ` +
            `Tipo/categoria: ${payload.promptType || "geral"}. ` +
            "Inclua objetivo, contexto, tom, formato de saída e detalhes relevantes. " +
            "Retorne somente o prompt final pronto para copiar.",
        },
      ];

    case "enhance":
      return [
        { role: "system", content: SYSTEM_BASE },
        {
          role: "user",
          content:
            `Aprimore este prompt usando o estilo "${type}":\n\n"${input}"\n\n` +
            "Retorne somente o prompt aprimorado.",
        },
      ];

    case "humanize":
      return [
        { role: "system", content: SYSTEM_BASE },
        {
          role: "user",
          content:
            `Reescreva o texto abaixo com tom natural e humano, preservando o significado:\n\n${input}\n\n` +
            "Retorne somente o texto reescrito.",
        },
      ];

    case "agent":
      return [
        { role: "system", content: SYSTEM_BASE },
        {
          role: "user",
          content:
            `Crie um prompt de sistema para um agente de IA com:\n` +
            `- Papel: ${role}\n- Tom: ${tone}\n- Tarefa: ${task}\n` +
            (context ? `- Contexto: ${context}\n` : "") +
            "\nInclua diretrizes de comportamento. Retorne somente o prompt do agente.",
        },
      ];

    case "suggest":
      return [
        { role: "system", content: SYSTEM_BASE },
        {
          role: "user",
          content:
            `Gere exatamente 5 ideias de prompt criativas sobre o tópico: "${topic}". ` +
            "Uma ideia por linha, numeradas 1 a 5. Sem introdução.",
        },
      ];

    case "translate":
      return [
        { role: "system", content: "Você é um tradutor profissional. Retorne apenas a tradução." },
        {
          role: "user",
          content: `Traduza do ${payload.fromLang} para ${payload.toLang}:\n\n${input}`,
        },
      ];

    case "image":
      return [
        {
          role: "system",
          content:
            SYSTEM_BASE +
            " Analise a imagem e responda conforme o tipo solicitado.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: imagePromptForType(analysisType),
            },
            {
              type: "image_url",
              image_url: { url: payload.imageDataUrl },
            },
          ],
        },
      ];

    default:
      throw new Error("Ação inválida: " + action);
  }
}

function imagePromptForType(type) {
  const map = {
    describe: "Descreva detalhadamente o que você vê nesta imagem.",
    prompt: "Gere um prompt detalhado de arte IA para recriar uma imagem similar.",
    detailed: "Faça análise completa: objetos, cores, composição, estilo e mood.",
    creative: "Escreva uma história criativa inspirada nesta imagem.",
  };
  return map[type] || map.describe;
}

async function callOpenAI(apiKey, model, messages) {
  if (!apiKey) {
    const err = new Error("OPENAI_API_KEY não configurada. Edite o arquivo .env");
    err.status = 503;
    throw err;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message || "Erro na API OpenAI";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return (data.choices?.[0]?.message?.content || "").trim();
}

async function handleOpenAIRequest(body, env) {
  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_MODEL || "gpt-4o-mini";
  const action = body.action;

  if (!action) {
    const err = new Error("Campo 'action' é obrigatório.");
    err.status = 400;
    throw err;
  }

  const messages = buildMessages(action, body);
  const result = await callOpenAI(apiKey, model, messages);

  if (action === "suggest") {
    const lines = result
      .split("\n")
      .map(function (l) {
        return l.replace(/^\d+[\).\-\s]+/, "").trim();
      })
      .filter(Boolean)
      .slice(0, 5);
    return { result: lines.join("\n"), suggestions: lines };
  }

  return { result: result };
}

module.exports = { handleOpenAIRequest };
