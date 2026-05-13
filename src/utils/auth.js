import { supabase } from '../lib/supabase'

export async function signup({ email, password, firstName, lastName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: `${firstName} ${lastName}`.trim() },
    },
  })
  if (error) throw error
  return data
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function resetPasswordForEmail(email) {
  const redirectTo = `${window.location.origin}/reset-password`
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/calculator` },
  })
  if (error) throw error
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function isAuthenticated() {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(!!session)
  })
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export async function saveQuote(quote) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('quotes')
    .insert({ ...quote, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateQuote(id, quote) {
  const { data, error } = await supabase
    .from('quotes')
    .update(quote)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getQuotes() {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ── Admin ──────────────────────────────────────

export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return !!data
}

export async function getAllQuotesAdmin() {
  const { data, error } = await supabase.rpc('admin_get_all_quotes')
  if (error) throw error
  return data ?? []
}

export async function getAllProfilesAdmin() {
  const { data, error } = await supabase.rpc('admin_get_all_profiles')
  if (error) throw error
  return data ?? []
}

export async function adminDeleteQuote(id) {
  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) throw error
}

export async function adminDeleteUser(userId) {
  const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId })
  if (error) throw error
}

export default {
  signup,
  login,
  loginWithGoogle,
  logout,
  isAuthenticated,
  onAuthStateChange,
  getCurrentUser,
  saveQuote,
  getQuotes,
  checkIsAdmin,
  getAllQuotesAdmin,
  getAllProfilesAdmin,
  adminDeleteQuote,
  adminDeleteUser,
}
