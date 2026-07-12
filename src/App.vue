<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useAuth } from './composables/useAuth.js'
import { useFirebase } from './composables/useFirebase.js'
import { useStats } from './composables/useStats.js'
import { usePWA } from './composables/usePWA.js'
import { useMatchForm } from './composables/useMatchForm.js'
import { useImageUtils } from './composables/useImageUtils.js'
import { usePDF } from './composables/usePDF.js'
import { useMigracao } from './composables/useMigracao.js'
import LoginScreen from './views/LoginScreen.vue'
import Dashboard from './views/Dashboard.vue'
import NewGame from './views/NewGame.vue'
import Statistics from './views/Statistics.vue'
import History from './views/History.vue'
import BottomNav from './components/BottomNav.vue'
import ProfileModal from './components/ProfileModal.vue'

const { autenticado, loggedInUser, logout, login } = useAuth()
const { players, matches, locaisLista, FOTO_PADRAO, carregarDadosDoBanco, calcularVitorias, getLocalPhoto } = useFirebase()
const { formatScore, winRate } = useStats(matches, players, locaisLista, getLocalPhoto, FOTO_PADRAO)
const { deferredPrompt, installPWA, inicializarPWA } = usePWA()
const { form, validarInputSet, registerMatch, carregarParaEdicao, resetForm, apagarPartida } =
  useMatchForm(matches, locaisLista, calcularVitorias, FOTO_PADRAO)
const { uploadProfilePhoto, uploadCourtPhoto, apagarLocal } = useImageUtils(locaisLista)
const { exportarParaPDF } = usePDF()
const { status: migracaoStatus } = useMigracao()

watch(migracaoStatus, (val) => {
  if (val === 'done') {
    carregarDadosDoBanco()
  }
})

const activeTab = ref('dashboard')
const showProfileModal = ref(false)

// Refs needed by child components
const statsFilter = ref('oficial')
const statsYearFilter = ref('todos')
const historyFilter = ref('todos')

const activePlayer = computed(() => {
  if (loggedInUser.value === 0) return { id: 0, name: "Visitante (Visualizador)", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" }
  return players.value.find(p => p.id === loggedInUser.value)
})

const onLoginSuccess = () => {
  carregarDadosDoBanco()
}

const handleLogout = () => {
  logout()
  showProfileModal.value = false
}

const handleSaved = () => {
  activeTab.value = 'dashboard'
}

const handleNavigate = (tab) => {
  activeTab.value = tab
}

onMounted(() => {
  if (autenticado.value) carregarDadosDoBanco()
  inicializarPWA()
})
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-xl md:max-w-2xl lg:max-w-4xl">
    <LoginScreen v-if="!autenticado" @login="onLoginSuccess" />

    <template v-if="autenticado">
      <header class="bg-tennis-brand text-white px-4 py-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div class="flex items-center gap-3">
          <div class="relative group"
            :class="loggedInUser !== 0 ? 'cursor-pointer' : ''"
            @click="loggedInUser !== 0 ? $refs.profileFile.click() : null">
            <img :src="activePlayer?.photo" class="w-10 h-10 rounded-full border-2 border-tennis-neon object-cover hover:opacity-85 transition">
            <div v-if="loggedInUser !== 0" class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px]">
              <i class="fa-solid fa-camera text-white"></i>
            </div>
            <input v-if="loggedInUser !== 0" type="file" ref="profileFile" class="hidden" accept="image/*" @change="e => uploadProfilePhoto(e, activePlayer, loggedInUser)">
          </div>
          <div class="text-left">
            <p class="text-[9px] text-tennis-neon uppercase tracking-wider font-extrabold leading-none mb-0.5">
              {{ loggedInUser === 0 ? 'Acesso Convidado' : 'Jogador Ativo' }}
            </p>
            <p class="text-sm font-bold leading-tight">{{ activePlayer?.name }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="deferredPrompt" @click="installPWA"
            class="text-xs bg-tennis-neon hover:bg-tennis-neon/80 px-2.5 py-1.5 rounded-lg text-tennis-dark font-extrabold flex items-center gap-1 transition animate-bounce">
            <i class="fa-solid fa-download"></i> Instalar App
          </button>
          <button v-if="loggedInUser !== 0" @click="showProfileModal = true"
            class="text-xs bg-tennis-accent hover:bg-tennis-accent/80 px-3 py-1.5 rounded-lg text-tennis-neon font-bold flex items-center gap-1 transition">
            <i class="fa-solid fa-sliders"></i> Configurações
          </button>
          <button v-if="loggedInUser !== 0" @click="handleLogout"
            class="text-xs bg-red-600 hover:bg-red-700 px-2.5 py-1.5 rounded-lg text-white font-bold transition"
            title="Sair">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
          <button v-if="loggedInUser === 0" @click="handleLogout"
            class="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-white font-bold flex items-center gap-1 transition">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair
          </button>
        </div>
      </header>

      <main class="flex-grow p-4 pb-24 overflow-y-auto">
        <Dashboard v-if="activeTab === 'dashboard'"
          :players="players" :matches="matches" :locaisLista="locaisLista"
          :loggedInUser="loggedInUser" :getLocalPhoto="getLocalPhoto"
          :formatScore="formatScore" :winRate="winRate"
          @navigate="handleNavigate" />

        <NewGame v-if="activeTab === 'new-game'"
          :matches="matches" :locaisLista="locaisLista"
          :loggedInUser="loggedInUser" :FOTO_PADRAO="FOTO_PADRAO"
          :calcularVitorias="calcularVitorias"
          @saved="handleSaved" />

        <Statistics v-if="activeTab === 'stats'"
          :matches="matches" :players="players" :locaisLista="locaisLista"
          :loggedInUser="loggedInUser" :getLocalPhoto="getLocalPhoto"
          :formatScore="formatScore" :winRate="winRate"
          :FOTO_PADRAO="FOTO_PADRAO" :statsFilter="statsFilter" :statsYearFilter="statsYearFilter" />

        <History v-if="activeTab === 'history'"
          :matches="matches" :players="players" :locaisLista="locaisLista"
          :loggedInUser="loggedInUser" :getLocalPhoto="getLocalPhoto"
          :formatScore="formatScore" :winRate="winRate"
          :carregarParaEdicao="carregarParaEdicao" :apagarPartida="apagarPartida" />
      </main>

      <BottomNav :activeTab="activeTab" :loggedInUser="loggedInUser" @update:activeTab="activeTab = $event" />

      <ProfileModal :show="showProfileModal" :players="players"
        :loggedInUser="loggedInUser" :locaisLista="locaisLista"
        :FOTO_PADRAO="FOTO_PADRAO"
        @close="showProfileModal = false" @logout="handleLogout" />
    </template>
  </div>
</template>
