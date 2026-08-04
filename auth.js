(function (global) {
  "use strict";

  var cachedUser = null;

  function translateError(message) {
    var msg = String(message || "");
    if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
    if (msg.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
    if (msg.includes("User already registered")) return "Este e-mail já está cadastrado.";
    if (msg.includes("Password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
    if (msg.includes("Unable to validate email")) return "E-mail inválido.";
    return msg || "Ocorreu um erro. Tente novamente.";
  }

  function mapUser(user) {
    if (!user) return null;
    var meta = user.user_metadata || {};
    return {
      id: user.id,
      email: user.email,
      name: meta.full_name || meta.name || (user.email ? user.email.split("@")[0] : "Usuário"),
    };
  }

  async function init() {
    await PromptSupabase.init();
    cachedUser = mapUser((await getRawSession())?.user);
    return cachedUser;
  }

  async function getRawSession() {
    var sb = PromptSupabase.getClient();
    if (!sb) return null;
    var result = await sb.auth.getSession();
    if (result.error) throw result.error;
    return result.data.session;
  }

  async function getSession() {
    if (cachedUser) return cachedUser;
    var session = await getRawSession();
    cachedUser = mapUser(session?.user);
    return cachedUser;
  }

  async function isLoggedIn() {
    return Boolean(await getSession());
  }

  async function login(email, password) {
    var normalized = String(email || "").trim();
    var pass = String(password || "");

    if (!normalized) return { error: "Informe seu e-mail." };
    if (!pass) return { error: "Informe sua senha." };

    try {
      await init();
      var sb = PromptSupabase.getClient();
      var result = await sb.auth.signInWithPassword({
        email: normalized,
        password: pass,
      });

      if (result.error) return { error: translateError(result.error.message) };

      cachedUser = mapUser(result.data.user);
      return { ok: true, user: cachedUser };
    } catch (e) {
      return { error: translateError(e.message) };
    }
  }

  async function register(name, email, password, confirm) {
    var displayName = String(name || "").trim();
    var normalized = String(email || "").trim();
    var pass = String(password || "");
    var confirmPass = String(confirm || "");

    if (!displayName) return { error: "Informe seu nome." };
    if (!normalized) return { error: "Informe seu e-mail." };
    if (pass.length < 6) return { error: "A senha deve ter pelo menos 6 caracteres." };
    if (pass !== confirmPass) return { error: "As senhas não coincidem." };

    try {
      await init();
      var sb = PromptSupabase.getClient();
      var result = await sb.auth.signUp({
        email: normalized,
        password: pass,
        options: {
          data: { full_name: displayName },
        },
      });

      if (result.error) return { error: translateError(result.error.message) };

      if (result.data.session) {
        cachedUser = mapUser(result.data.user);
        return { ok: true, user: cachedUser, confirmed: true };
      }

      return {
        ok: true,
        confirmed: false,
        message: "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
      };
    } catch (e) {
      return { error: translateError(e.message) };
    }
  }

  async function resetPassword(email) {
    var normalized = String(email || "").trim();
    if (!normalized) return { error: "Informe seu e-mail." };

    try {
      await init();
      var sb = PromptSupabase.getClient();
      var result = await sb.auth.resetPasswordForEmail(normalized, {
        redirectTo: location.origin + location.pathname.replace(/[^/]+$/, "login.html"),
      });

      if (result.error) return { error: translateError(result.error.message) };
      return { ok: true, message: "Enviamos um link de recuperação para seu e-mail." };
    } catch (e) {
      return { error: translateError(e.message) };
    }
  }

  async function logout() {
    try {
      var sb = PromptSupabase.getClient();
      if (sb) await sb.auth.signOut();
    } catch (e) {}
    cachedUser = null;
  }

  async function requireAuth(redirectTo) {
    if (await isLoggedIn()) return true;
    var next = redirectTo || location.pathname.split("/").pop() || "index.html";
    location.href = "login.html?redirect=" + encodeURIComponent(next);
    return false;
  }

  global.PromptAuth = {
    init: init,
    login: login,
    register: register,
    resetPassword: resetPassword,
    logout: logout,
    getSession: getSession,
    isLoggedIn: isLoggedIn,
    requireAuth: requireAuth,
  };
})(window);
