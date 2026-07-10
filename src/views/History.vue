<script setup>
import { computed } from 'vue'
import { useStats } from '../composables/useStats.js'

const props = defineProps({
  matches: Array, players: Array, locaisLista: Array, loggedInUser: Number,
  getLocalPhoto: Function, formatScore: Function, winRate: Function,
  carregarParaEdicao: Function, apagarPartida: Function
})

const {
  historyFilter, filteredHistoryMatches
} = useStats(
  computed(() => props.matches),
  computed(() => props.players),
  computed(() => props.locaisLista),
  props.getLocalPhoto, null
)
</script>

<template>
  <div class="space-y-4 text-left">
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-tennis-brand">Histórico Geral</h2>
          <p class="text-xs text-slate-500">Gerenciamento completo das partidas.</p>
        </div>
        <span class="bg-tennis-light border text-tennis-brand font-mono text-xs px-2.5 py-1 rounded-full font-bold">
          {{ filteredHistoryMatches.length }} Jogos
        </span>
      </div>
      <div class="bg-slate-100 p-1 rounded-xl flex gap-1 w-full border">
        <button @click="historyFilter = 'todos'"
          :class="['flex-1 py-1.5 text-xs font-semibold rounded-lg transition', historyFilter === 'todos' ? 'bg-tennis-brand text-white shadow' : 'text-slate-500']">Todas</button>
        <button @click="historyFilter = 'oficial'"
          :class="['flex-1 py-1.5 text-xs font-semibold rounded-lg transition', historyFilter === 'oficial' ? 'bg-tennis-brand text-white shadow' : 'text-slate-500']">Oficiais</button>
        <button @click="historyFilter = 'treino'"
          :class="['flex-1 py-1.5 text-xs font-semibold rounded-lg transition', historyFilter === 'treino' ? 'bg-tennis-brand text-white shadow' : 'text-slate-500']">Treino</button>
      </div>
    </div>
    <div class="space-y-3">
      <div v-if="filteredHistoryMatches.length === 0" class="text-xs text-slate-400 text-center py-8 bg-white border border-dashed rounded-xl">
        Nenhum jogo encontrado com este filtro.
      </div>
      <div v-for="match in filteredHistoryMatches" :key="match.id"
        class="bg-white p-4 rounded-xl border border-tennis-border flex justify-between items-center shadow-sm">
        <div class="space-y-1 min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span v-if="match.status === 'Incompleto'"
              class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-tennis-dark">Incompleto</span>
            <span v-else class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
              :class="match.vencedor_id === 1 ? 'bg-tennis-brand text-white' : 'bg-tennis-neon text-tennis-dark'">
              {{ match.vencedor_id === 1 ? 'Gustavo Venceu' : 'Otávio Venceu' }}
            </span>
            <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border text-slate-600 bg-slate-50">{{ match.tipo }}</span>
            <span class="text-[9px] text-slate-400 font-mono">{{ match.data }}</span>
          </div>
          <p class="text-sm font-bold text-slate-800 truncate">
            {{ match.local }} <span class="text-xs font-normal text-slate-400">({{ match.quadra }})</span>
          </p>
          <p class="text-xs font-mono font-bold text-tennis-accent bg-tennis-light px-2 py-0.5 rounded inline-block">
            {{ formatScore(match) }}
          </p>
        </div>
        <div v-if="loggedInUser !== 0" class="flex gap-1 shrink-0">
          <button @click="carregarParaEdicao(match)" class="text-slate-500 hover:text-tennis-brand p-2 transition">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button @click="apagarPartida(match)" class="text-slate-400 hover:text-red-600 p-2 transition">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
