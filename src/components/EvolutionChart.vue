<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  matches: Array,
  statsFilter: String,
  statsYearFilter: String
})

const canvasRef = ref(null)
let chartInstance = null

const filteredMatches = computed(() => {
  return props.matches.filter(m => {
    if (m.tipo !== props.statsFilter || m.status === 'Incompleto') return false
    if (props.statsYearFilter === 'todos') return true
    return m.data?.split('-')[0] === props.statsYearFilter
  })
})

const renderChart = () => {
  if (!canvasRef.value) return
  if (chartInstance) chartInstance.destroy()

  const sorted = [...filteredMatches.value].sort((a, b) => new Date(a.data) - new Date(b.data))
  let accF = 0, accP = 0
  const labels = ['Início']
  const dataF = [0], dataP = [0]

  sorted.forEach((m, i) => {
    if (m.vencedor_id === 1) accF++
    if (m.vencedor_id === 2) accP++
    labels.push(m.data || `J${i + 1}`)
    dataF.push(accF)
    dataP.push(accP)
  })

  chartInstance = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Gustavo', data: dataF, borderColor: '#306c42', backgroundColor: 'rgba(48,108,66,0.05)', fill: true, tension: 0.15, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5 },
        { label: 'Otávio', data: dataP, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.05)', fill: true, tension: 0.15, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { family: 'Poppins', size: 10 } } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'JetBrains Mono', size: 8 } } },
        y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'JetBrains Mono', size: 9 }, stepSize: 1 } }
      }
    }
  })
}

onMounted(renderChart)
watch(() => [props.statsFilter, props.statsYearFilter], renderChart, { deep: true })
</script>

<template>
  <div class="bg-white p-4 rounded-xl border border-tennis-border shadow-sm">
    <div class="flex items-center gap-1.5 mb-3">
      <h3 class="text-xs font-bold uppercase text-slate-500">Evolução Temporal do Confronto</h3>
      <div class="tooltip relative inline-block cursor-pointer text-slate-400 hover:text-tennis-accent">
        <i class="fa-solid fa-circle-info text-[11px]"></i>
        <span class="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl font-normal leading-relaxed z-50">
          <strong>Evolução Temporal:</strong> Exibe o acúmulo de vitórias ao longo do tempo.
        </span>
      </div>
    </div>
    <div class="relative w-full h-48">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
