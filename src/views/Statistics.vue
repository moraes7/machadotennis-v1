<script setup>
import { computed, nextTick, watch } from 'vue'
import { useStats } from '../composables/useStats.js'
import { usePDF } from '../composables/usePDF.js'
import EvolutionChart from '../components/EvolutionChart.vue'

const props = defineProps({
  matches: Array, players: Array, locaisLista: Array, loggedInUser: Number,
  getLocalPhoto: Function, formatScore: Function, winRate: Function,
  FOTO_PADRAO: String, statsFilter: Object, statsYearFilter: Object
})

const {
  filteredMatchesForStats, totaisClutch, vitoriasPorcentagem,
  vitoriasSuperficie, totaisAcumulados, locaisEstatísticas,
  listaAnosDisponiveis
} = useStats(
  computed(() => props.matches),
  computed(() => props.players),
  computed(() => props.locaisLista),
  props.getLocalPhoto, props.FOTO_PADRAO
)

const { exportarParaPDF } = usePDF()

const handleExportPDF = () => {
  exportarParaPDF(
    filteredMatchesForStats, props.statsFilter, props.statsYearFilter,
    totaisAcumulados, vitoriasPorcentagem, props.formatScore
  )
}

const calcularAproveitamentoLocal = (estat) => {
  const usr = props.loggedInUser === 2 ? 2 : 1
  const v = usr === 1 ? estat.vitoriasFilho : estat.vitoriasPai
  return estat.total ? Math.round((v / estat.total) * 100) : 0
}
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-bold text-tennis-brand">Estatísticas Head-to-Head</h2>
        <p class="text-xs text-slate-500">Dados acumulados em tempo real.</p>
      </div>
      <button @click="handleExportPDF"
        class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow">
        <i class="fa-solid fa-file-pdf"></i> Exportar PDF
      </button>
    </div>

    <div class="bg-white p-1.5 rounded-xl border border-tennis-border flex gap-1">
      <button v-for="t in ['oficial', 'treino']" :key="t" @click="statsFilter = t"
        :class="['flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition', statsFilter === t ? 'bg-tennis-brand text-white' : 'text-slate-500']">
        Partidas {{ t }}s
      </button>
    </div>

    <div class="space-y-1">
      <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Filtrar por Ano</label>
      <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
        <button @click="statsYearFilter = 'todos'"
          :class="['px-3 py-1.5 text-xs rounded-lg font-medium border transition shrink-0 snap-start',
            statsYearFilter === 'todos' ? 'bg-tennis-accent text-white border-tennis-accent' : 'bg-white text-slate-600 border-tennis-border']">
          Todos
        </button>
        <button v-for="ano in listaAnosDisponiveis" :key="ano" @click="statsYearFilter = ano"
          :class="['px-4 py-1.5 text-xs rounded-lg font-mono font-medium border transition shrink-0 snap-start',
            statsYearFilter === ano ? 'bg-tennis-accent text-white border-tennis-accent' : 'bg-white text-slate-600 border-tennis-border']">
          {{ ano }}
        </button>
      </div>
    </div>

    <EvolutionChart :matches="matches" :statsFilter="statsFilter" :statsYearFilter="statsYearFilter" :key="'chart-' + statsFilter + '-' + statsYearFilter" />

    <div class="grid grid-cols-3 gap-2">
      <div class="bg-white p-3 rounded-xl border border-tennis-border shadow-sm flex flex-col justify-between">
        <h4 class="text-[9px] font-bold uppercase text-slate-400 mb-1 leading-tight">Jogos Ganhos</h4>
        <div>
          <p class="text-[11px] font-bold text-tennis-brand">G: <span class="font-mono text-sm text-tennis-accent">{{ totaisAcumulados.jogosFilho }} <span class="text-[10px] font-sans text-slate-400 font-normal">({{ vitoriasPorcentagem.j1 }}%)</span></span></p>
          <p class="text-[11px] font-bold text-slate-700 mt-0.5">O: <span class="font-mono text-sm text-amber-600">{{ totaisAcumulados.jogosPai }} <span class="text-[10px] font-sans text-slate-400 font-normal">({{ vitoriasPorcentagem.j2 }}%)</span></span></p>
        </div>
      </div>
      <div class="bg-white p-3 rounded-xl border border-tennis-border shadow-sm flex flex-col justify-between">
        <h4 class="text-[9px] font-bold uppercase text-slate-400 mb-1 leading-tight">Sets Vencidos</h4>
        <div>
          <p class="text-[11px] font-bold text-tennis-brand">G: <span class="font-mono text-sm text-tennis-accent">{{ totaisAcumulados.setsFilho }}</span></p>
          <p class="text-[11px] font-bold text-slate-700 mt-0.5">O: <span class="font-mono text-sm text-amber-600">{{ totaisAcumulados.setsPai }}</span></p>
        </div>
      </div>
      <div class="bg-white p-3 rounded-xl border border-tennis-border shadow-sm flex flex-col justify-between">
        <h4 class="text-[9px] font-bold uppercase text-slate-400 mb-1 leading-tight">Games Vencidos</h4>
        <div>
          <p class="text-[11px] font-bold text-tennis-brand">G: <span class="font-mono text-sm text-tennis-accent">{{ totaisAcumulados.gamesFilho }}</span></p>
          <p class="text-[11px] font-bold text-slate-700 mt-0.5">O: <span class="font-mono text-sm text-amber-600">{{ totaisAcumulados.gamesPai }}</span></p>
        </div>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-tennis-border shadow-sm">
      <div class="flex items-center gap-1.5 mb-3">
        <h3 class="text-xs font-bold uppercase text-slate-500">Vitórias por Tipo de Quadra</h3>
        <div class="tooltip relative inline-block cursor-pointer text-slate-400 hover:text-tennis-accent">
          <i class="fa-solid fa-circle-info text-[11px]"></i>
          <span class="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl font-normal leading-relaxed z-50">
            <strong>Superfícies:</strong> Registra as vitórias de cada jogador de acordo com o piso da quadra (Saibro, Rápida ou Grama) no período selecionado.
          </span>
        </div>
      </div>
      <div class="space-y-2 text-xs">
        <div v-for="sup in ['Saibro', 'Rápida', 'Grama']" :key="sup"
          class="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span class="font-bold text-slate-700 flex items-center gap-1.5">
            <i class="fa-solid fa-circle text-[8px]" :class="sup==='Saibro'?'text-orange-600':(sup==='Rápida'?'text-blue-500':'text-emerald-500')"></i>
            Quadra de {{ sup }}
          </span>
          <div class="flex gap-4 font-semibold">
            <span class="text-tennis-brand">Gustavo: <span class="font-mono font-bold text-tennis-accent">{{ vitoriasSuperficie[sup].filho }}</span></span>
            <span class="text-amber-600">Otávio: <span class="font-mono font-bold text-amber-600">{{ vitoriasSuperficie[sup].pai }}</span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-tennis-border shadow-sm">
      <div class="flex items-center gap-1.5 mb-3">
        <h3 class="text-xs font-bold uppercase text-slate-500">Desempenho sob Pressão (Clutch Factor)</h3>
        <div class="tooltip relative inline-block cursor-pointer text-slate-400 hover:text-tennis-accent">
          <i class="fa-solid fa-circle-info text-[11px]"></i>
          <span class="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl font-normal leading-relaxed z-50">
            <strong>Clutch Factor:</strong> Avalia o lado mental. O "3º Set Decisivo" mostra quem ganha as partidas que vão para o desempate. "Sets Longos" mostra o aproveitamento em sets disputados no limite (7-5 ou tie-breaks).
          </span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p class="font-semibold text-slate-500 text-[10px] uppercase mb-1.5">3º Set Decisivo (Negra)</p>
          <p class="text-tennis-brand font-bold">Gustavo: <span class="font-mono font-medium text-slate-700">{{ totaisClutch.terceiroSetFilho }} vits</span></p>
          <p class="text-amber-600 font-bold mt-0.5">Otávio: <span class="font-mono font-medium text-slate-700">{{ totaisClutch.terceiroSetPai }} vits</span></p>
        </div>
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p class="font-semibold text-slate-500 text-[10px] uppercase mb-1.5">Sets Longos (7-5 / Tie)</p>
          <p class="text-tennis-brand font-bold">Gustavo: <span class="font-mono font-medium text-slate-700">{{ totaisClutch.setsLongosFilho }} vits</span></p>
          <p class="text-amber-600 font-bold mt-0.5">Otávio: <span class="font-mono font-medium text-slate-700">{{ totaisClutch.setsLongosPai }} vits</span></p>
        </div>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-tennis-border shadow-sm">
      <div class="flex items-center gap-1.5 mb-3">
        <h3 class="text-xs font-bold uppercase text-slate-500">Placares Dominantes (Pneus & Bicicletas)</h3>
        <div class="tooltip relative inline-block cursor-pointer text-slate-400 hover:text-tennis-accent">
          <i class="fa-solid fa-circle-info text-[11px]"></i>
          <span class="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl font-normal leading-relaxed z-50">
            <strong>Pneus e Bicicletas:</strong> Registra as vitórias mais avassaladoras de sets. Um set ganho por 6-0 é classificado como "Pneu" (Bagel) e um set ganho por 6-1 como "Bicicleta" (Breadstick).
          </span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p class="font-bold text-tennis-brand border-b pb-1 mb-1.5">Gustavo Machado</p>
          <p class="text-slate-600">Pneus aplicados: <span class="font-mono font-bold text-tennis-accent">{{ totaisAcumulados.pneusFilho }}</span></p>
          <p class="text-slate-600 mt-0.5">Bicicletas: <span class="font-mono font-bold text-tennis-accent">{{ totaisAcumulados.bicicletasFilho }}</span></p>
        </div>
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p class="font-bold text-amber-600 border-b pb-1 mb-1.5">Otávio Machado</p>
          <p class="text-slate-600">Pneus aplicados: <span class="font-mono font-bold text-amber-600">{{ totaisAcumulados.pneusPai }}</span></p>
          <p class="text-slate-600 mt-0.5">Bicicletas: <span class="font-mono font-bold text-amber-600">{{ totaisAcumulados.bicicletasPai }}</span></p>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-xs font-bold uppercase text-tennis-brand tracking-wider flex items-center gap-1">
        <i class="fa-solid fa-map-location-dot"></i> Desempenho por Clube
      </h3>
      <div v-if="locaisEstatísticas.length === 0" class="text-center text-xs text-slate-400 py-6 bg-white rounded-xl border border-dashed">
        Sem dados disponíveis para este período.
      </div>
      <div v-for="estat in locaisEstatísticas" :key="estat.nome"
        class="bg-white border border-tennis-border rounded-xl p-3 flex gap-3 items-center shadow-sm">
        <img :src="estat.foto" class="w-16 h-16 rounded-lg object-cover shadow-sm">
        <div class="flex-grow min-w-0 text-xs text-slate-500 font-medium grid grid-cols-2 gap-y-0.5">
          <h4 class="text-sm font-bold text-slate-800 col-span-2 truncate">{{ estat.nome }}</h4>
          <p>Jogos: <span class="font-mono text-slate-700 font-bold">{{ estat.total }}</span></p>
          <p>Aproveitamento: <span class="font-mono text-tennis-accent font-bold">{{ calcularAproveitamentoLocal(estat) }}%</span></p>
          <p>Gustavo ganhou: <span class="font-mono text-emerald-600 font-bold">{{ estat.vitoriasFilho }}</span></p>
          <p>Otávio ganhou: <span class="font-mono text-amber-600 font-bold">{{ estat.vitoriasPai }}</span></p>
        </div>
      </div>
    </div>
  </div>
</template>
