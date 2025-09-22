// very tiny local auth "backend"
const KEY = "moodify_user";

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}

export function signUpLocal({ first, last, email, password }) {
  const user = { id: crypto.randomUUID?.() || String(Date.now()), first, last, email };
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-changed"));
  return Promise.resolve(user);
}

export function signInLocal({ email }) {
  const cur = getCurrentUser();
  if (cur?.email === email) {
    window.dispatchEvent(new Event("auth-changed"));
    return Promise.resolve(cur);
  }
  // for demo: sign you in with just the email (or fetch server here)
  const user = { id: crypto.randomUUID?.() || String(Date.now()), first: email.split("@")[0], last: "", email };
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-changed"));
  return Promise.resolve(user);
}

export function signOutLocal() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("auth-changed"));
}
