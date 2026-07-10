import { ref, computed } from 'vue'

const STORAGE_AUTH = 'app_machado_auth'
const STORAGE_USER = 'app_machado_user'

const autenticado = ref(sessionStorage.getItem(STORAGE_AUTH) === 'true')
const loggedInUser = ref(parseInt(sessionStorage.getItem(STORAGE_USER) || '1', 10))

export function useAuth() {
  const senhaInput = ref('')

  const verificarSenha = (onSuccess) => {
    const s = senhaInput.value
    if (s === '1998') { login(1); onSuccess?.() }
    else if (s === '1977') { login(2); onSuccess?.() }
    else if (s === '0000') { login(0); onSuccess?.() }
    else { alert('Senha incorreta!'); senhaInput.value = '' }
  }

  const login = (userId) => {
    loggedInUser.value = userId
    autenticado.value = true
    sessionStorage.setItem(STORAGE_AUTH, 'true')
    sessionStorage.setItem(STORAGE_USER, String(userId))
  }

  const logout = () => {
    autenticado.value = false
    loggedInUser.value = 0
    senhaInput.value = ''
    sessionStorage.removeItem(STORAGE_AUTH)
    sessionStorage.removeItem(STORAGE_USER)
  }

  return { autenticado, loggedInUser, senhaInput, verificarSenha, login, logout }
}
