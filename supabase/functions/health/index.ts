import "@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      openai: Boolean(Deno.env.get("OPENAI_API_KEY")),
      supabase: true,
      model: Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini",
    }),
    { headers: { ...cors, "Content-Type": "application/json" } },
  );
});
