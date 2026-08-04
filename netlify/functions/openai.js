const { handleOpenAIRequest } = require("../../lib/openai-handler");

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Método não permitido" });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const data = await handleOpenAIRequest(body, process.env);
    return json(200, data);
  } catch (err) {
    return json(err.status || 500, { error: err.message || "Erro interno" });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: corsHeaders(),
    body: JSON.stringify(body),
  };
}

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
