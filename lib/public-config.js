"use strict";

function getPublicConfig(env) {
  return {
    supabaseUrl: env.SUPABASE_URL || "",
    supabaseAnonKey: env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || "",
  };
}

function isSupabaseConfigured(env) {
  return Boolean(env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY));
}

module.exports = {
  getPublicConfig: getPublicConfig,
  isSupabaseConfigured: isSupabaseConfigured,
};
