const { isSupabaseConfigured } = require("../../lib/public-config");

exports.handler = async function () {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ok: true,
      openai: Boolean(process.env.OPENAI_API_KEY),
      supabase: isSupabaseConfigured(process.env),
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    }),
  };
};
