<script setup>
import { useAuth } from '../composables/useAuth.js'

const emit = defineEmits(['login'])
const { senhaInput, verificarSenha } = useAuth()

const handleLogin = () => {
  verificarSenha(() => emit('login'))
}
</script>

<template>
  <div class="fixed inset-0 bg-tennis-dark flex justify-center items-center z-50 p-4">
    <div class="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-xs w-full border-t-4 border-tennis-neon">
      <div class="w-16 h-16 bg-tennis-light rounded-full flex items-center justify-center mx-auto mb-3 text-tennis-brand text-2xl shadow-inner">
        <i class="fa-solid fa-lock"></i>
      </div>
      <h2 class="text-lg font-bold text-tennis-brand tracking-tight mb-1">Acesso Restrito</h2>
      <p class="text-xs text-slate-500 mb-4">Insira o código de acesso para entrar no Machado's Grand Slam.</p>
      <input type="password" v-model="senhaInput" placeholder="****" maxlength="4"
        @keydown.enter="handleLogin"
        class="w-full bg-slate-50 border-2 border-slate-200 text-center text-xl p-2.5 rounded-xl font-mono tracking-widest mb-3 outline-none focus:border-tennis-brand transition">
      <button @click="handleLogin"
        class="w-full bg-tennis-brand hover:bg-tennis-accent text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md">
        Validar Senha
      </button>
    </div>
  </div>
</template>
