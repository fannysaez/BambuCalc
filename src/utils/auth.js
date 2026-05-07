const USER_KEY = 'bambucalc_user'
const TOKEN_KEY = 'bambucalc_token'

function randomToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function signup({ email, password, name }) {
  const user = { id: Date.now(), email, name }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  const token = randomToken()
  localStorage.setItem(TOKEN_KEY, token)
  return { user, token }
}

export function login({ email, password }) {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  const user = JSON.parse(raw)
  if (user.email === email) {
    const token = randomToken()
    localStorage.setItem(TOKEN_KEY, token)
    return { user, token }
  }
  return null
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveQuote(quote) {
  const key = 'bambucalc_quotes'
  const raw = localStorage.getItem(key)
  const list = raw ? JSON.parse(raw) : []
  const item = Object.assign({ id: Date.now() }, quote)
  list.push(item)
  localStorage.setItem(key, JSON.stringify(list))
  return item
}

export function getQuotes() {
  const raw = localStorage.getItem('bambucalc_quotes')
  return raw ? JSON.parse(raw) : []
}

export default {
  signup,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  saveQuote,
  getQuotes,
}
