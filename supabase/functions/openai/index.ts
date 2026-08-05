import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SYSTEM_BASE =
  "Você é um especialista em engenharia de prompt. Responda sempre em português do Brasil. " +
  "Retorne apenas o texto solicitado, sem explicações extras, sem markdown desnecessário.";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function imagePromptForType(type: string) {
  const map: Record<string, string> = {
    describe: "Descreva detalhadamente o que você vê nesta imagem.",
    prompt: "Gere um prompt detalhado de arte IA para recriar uma imagem similar.",
    detailed: "Faça análise completa: objetos, cores, composição, estilo e mood.",
    creative: "Escreva uma história criativa inspirada nesta imagem.",
  };
  return map[type] || map.describe;
}

function buildMessages(action: string, payload: Record<string, unknown>) {
  const input = String(payload.input || payload.text || "").trim();
  const type = String(payload.type || payload.enhanceType || "improve");
  const role = String(payload.role || "assistant");
  const tone = String(payload.tone || "professional");
  const task = String(payload.task || "").trim();
  const context = String(payload.context || "").trim();
  const topic = String(payload.topic || input).trim();
  const analysisType = String(payload.analysisType || "describe");

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
          content: `Aprimore este prompt usando o estilo "${type}":\n\n"${input}"\n\nRetorne somente o prompt aprimorado.`,
        },
      ];
    case "humanize":
      return [
        { role: "system", content: SYSTEM_BASE },
        {
          role: "user",
          content: `Reescreva o texto abaixo com tom natural e humano, preservando o significado:\n\n${input}\n\nRetorne somente o texto reescrito.`,
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
          content: SYSTEM_BASE + " Analise a imagem e responda conforme o tipo solicitado.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: imagePromptForType(analysisType) },
            { type: "image_url", image_url: { url: String(payload.imageDataUrl) } },
          ],
        },
      ];
    default:
      throw new Error("Ação inválida: " + action);
  }
}

async function callOpenAI(apiKey: string, model: string, messages: unknown[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Erro na API OpenAI");
  }
  return String(data.choices?.[0]?.message?.content || "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "OPENAI_API_KEY não configurada. Supabase → Project Settings → Edge Functions → Secrets",
        }),
        { status: 503, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const model = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";
    const body = await req.json();
    const action = body.action as string;

    if (!action) {
      return new Response(JSON.stringify({ error: "Campo 'action' é obrigatório." }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const messages = buildMessages(action, body);
    const result = await callOpenAI(apiKey, model, messages);

    if (action === "suggest") {
      const lines = result
        .split("\n")
        .map((l) => l.replace(/^\d+[\).\-\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 5);
      return new Response(JSON.stringify({ result: lines.join("\n"), suggestions: lines }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
