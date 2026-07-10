<script setup>
import { computed } from 'vue'
import { useStats } from '../composables/useStats.js'

const props = defineProps({
  players: Array, matches: Array, locaisLista: Array, loggedInUser: Number,
  getLocalPhoto: Function, formatScore: Function, winRate: Function
})

const emit = defineEmits(['navigate', 'showProfile'])

const {
  dashboardMatches, currentKing, isConfrontoEmpatado,
  sequenciaAtual, maiorSequenciaHistorica
} = useStats(
  computed(() => props.matches),
  computed(() => props.players),
  computed(() => props.locaisLista),
  props.getLocalPhoto,
  null
)

const king = computed(() => {
  if (isConfrontoEmpatado.value) return null
  return currentKing.value
})
const loser = computed(() => {
  if (isConfrontoEmpatado.value || !props.players.length) return null
  return props.players[0]?.wins < props.players[1]?.wins ? props.players[0] : props.players[1]
})
</script>

<template>
  <div class="space-y-4">
    <div class="text-left">
      <h2 class="text-lg font-bold text-tennis-brand tracking-tight">Machado's Grand Slam</h2>
      <p class="text-xs text-slate-500 font-medium">Histórico oficial de duelos</p>
    </div>

    <div class="bg-gradient-to-br from-tennis-brand to-tennis-accent text-white p-5 rounded-2xl shadow-md border border-tennis-accent/30 text-left relative">
      <p class="text-[10px] text-tennis-neon uppercase tracking-wider font-extrabold mb-1">Atual Detentor da Coroa</p>
      <div v-if="isConfrontoEmpatado">
        <h3 class="text-xl font-bold flex items-center gap-2 text-tennis-neon">
          <i class="fa-solid fa-scale-balanced text-amber-400"></i> Confronto Empatado!
        </h3>
        <p class="text-xs text-slate-200 mt-1">Ambos possuem <span class="font-mono font-bold">{{ players[0]?.wins }} vitórias</span> oficiais.</p>
      </div>
      <div v-else>
        <h3 class="text-xl font-bold flex items-center gap-2 text-white">
          <i class="fa-solid fa-crown text-amber-400"></i> {{ king?.name }}
        </h3>
        <p class="text-xs text-slate-200 mt-1">Liderando com <span class="text-tennis-neon font-bold font-mono">{{ king?.wins }} vitórias oficiais</span> contra {{ loser?.wins }}.</p>
      </div>
    </div>

    <div class="bg-white border border-tennis-border p-4 rounded-xl shadow-sm text-left relative">
      <div class="flex items-center gap-1.5 mb-2">
        <h4 class="text-xs font-bold text-tennis-brand uppercase tracking-wider">Sequências Atuais & Recordes</h4>
        <div class="tooltip relative inline-block cursor-pointer text-slate-400 hover:text-tennis-accent">
          <i class="fa-solid fa-circle-info text-[11px]"></i>
          <span class="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl font-normal leading-relaxed z-50">
            <strong>Rachas e Sequências:</strong> Mostra quem está em uma sequência de vitórias consecutivas no momento e qual foi a maior sequência de vitórias consecutivas registrada na história do app.
          </span>
        </div>
      </div>
      <div class="space-y-2 text-xs">
        <div class="flex items-center gap-2">
          <span class="inline-block px-2 py-0.5 rounded font-extrabold text-[10px]"
            :class="sequenciaAtual.jogadorId === 1 ? 'bg-tennis-brand text-white' : 'bg-tennis-neon text-tennis-dark'"
          >ATUAL</span>
          <p class="text-slate-700 font-medium">
            {{ sequenciaAtual.total > 0
              ? (sequenciaAtual.jogadorId === 1 ? 'Gustavo' : 'Otávio') + ' vem de uma sequência de ' + sequenciaAtual.total + ' vitória(s)!'
              : 'Nenhuma sequência ativa.' }}
          </p>
        </div>
        <div class="flex items-center gap-2 border-t pt-2 border-slate-100">
          <span class="inline-block bg-amber-500 text-tennis-dark px-2 py-0.5 rounded font-extrabold text-[10px]">RECORDE</span>
          <p class="text-slate-600">
            A maior sequência histórica é de <strong>{{ maiorSequenciaHistorica.total }} vitórias</strong>,
            conquistada por {{ maiorSequenciaHistorica.jogadorId === 1 ? 'Gustavo' : 'Otávio' }}.
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 text-left">
      <div v-for="p in players" :key="p.id" class="bg-white p-4 rounded-xl border border-tennis-border shadow-sm">
        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vitórias ({{ p.id === 1 ? 'Gustavo' : 'Otávio' }})</span>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="text-2xl font-bold text-tennis-brand">{{ p.wins }}</span>
          <span class="text-xs font-bold font-mono" :class="p.id === 1 ? 'text-emerald-600' : 'text-amber-600'">({{ winRate(p) }}%)</span>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <h4 class="text-xs font-bold text-tennis-brand uppercase tracking-wider">Últimos Confrontos Oficiais</h4>
        <button @click="$emit('navigate', 'history')" class="text-xs text-tennis-accent font-semibold flex items-center gap-1">
          Ver todos <i class="fa-solid fa-chevron-right text-[9px]"></i>
        </button>
      </div>
      <div class="flex overflow-x-auto gap-4 pb-3 snap-x scrollbar-thin">
        <div v-if="dashboardMatches.length === 0" class="w-full text-center text-xs text-slate-400 py-12 bg-white rounded-xl border border-dashed">
          Nenhuma partida oficial registrada.
        </div>
        <div v-for="match in dashboardMatches.slice(0, 5)" :key="match.id"
          class="w-64 aspect-square bg-white rounded-xl border border-tennis-border overflow-hidden flex flex-col shadow-sm flex-shrink-0 snap-start">
          <div class="relative flex-grow min-h-0 bg-slate-200">
            <img :src="getLocalPhoto(match.local)" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <span class="absolute top-2 left-2 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
              :class="match.status === 'Incompleto' ? 'bg-amber-500 text-tennis-dark' : (match.tipo === 'oficial' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white')">
              {{ match.status === 'Incompleto' ? 'Incompleto' : match.tipo }}
            </span>
            <div class="absolute bottom-2 left-3 text-white text-left">
              <p class="text-xs font-bold truncate"><i class="fa-solid fa-map-pin text-tennis-neon"></i> {{ match.local }}</p>
              <p class="text-[9px] text-slate-300">Quadra: {{ match.quadra }} | {{ match.data }}</p>
            </div>
          </div>
          <div class="p-3 flex justify-between items-center bg-white border-t shrink-0">
            <div class="flex items-center gap-2 min-w-0">
              <div v-if="match.status !== 'Incompleto'"
                :class="['w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0', match.vencedor_id === 1 ? 'bg-tennis-brand text-white' : 'bg-tennis-neon text-tennis-dark']">
                {{ match.vencedor_id === 1 ? 'G' : 'O' }}
              </div>
              <div v-else class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-amber-100 text-amber-700">
                <i class="fa-solid fa-hourglass-half text-[10px]"></i>
              </div>
              <p class="text-xs font-bold text-slate-700 truncate">
                {{ match.status === 'Incompleto' ? 'Em aberto' : (match.vencedor_id === 1 ? 'Gustavo!' : 'Otávio!') }}
              </p>
            </div>
            <div class="font-mono text-[11px] font-bold bg-tennis-light px-2 py-1 rounded border border-tennis-border text-slate-700">
              {{ formatScore(match) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
