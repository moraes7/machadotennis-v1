import { ref, computed } from 'vue'

export function useStats(matches, players, locaisLista, getLocalPhoto, FOTO_PADRAO) {
  const statsFilter = ref('oficial')
  const statsYearFilter = ref('todos')
  const historyFilter = ref('todos')

  const sortedMatches = computed(() =>
    [...matches.value].sort((a, b) => new Date(b.data) - new Date(a.data))
  )
  const dashboardMatches = computed(() =>
    sortedMatches.value.filter(m => m.tipo === 'oficial')
  )
  const filteredHistoryMatches = computed(() => {
    if (historyFilter.value === 'todos') return sortedMatches.value
    return sortedMatches.value.filter(m => m.tipo === historyFilter.value)
  })
  const isConfrontoEmpatado = computed(() =>
    players.value[0]?.wins === players.value[1]?.wins
  )
  const currentKing = computed(() =>
    players.value[0].wins >= players.value[1].wins ? players.value[0] : players.value[1]
  )
  const listaAnosDisponiveis = computed(() => {
    const anos = matches.value.map(m => m.data?.split('-')[0]).filter(Boolean)
    return [...new Set(anos)].sort((a, b) => b - a)
  })
  const filteredMatchesForStats = computed(() =>
    matches.value.filter(m => {
      if (m.tipo !== statsFilter.value) return false
      if (statsYearFilter.value === 'todos') return true
      return m.data?.split('-')[0] === statsYearFilter.value
    })
  )
  const sequenciaAtual = computed(() => {
    const lista = [...matches.value]
      .filter(m => m.tipo === 'oficial' && m.status !== 'Incompleto')
      .sort((a, b) => new Date(b.data) - new Date(a.data))
    if (!lista.length) return { jogadorId: 0, total: 0 }
    const id = lista[0].vencedor_id
    let c = 0
    for (const m of lista) { if (m.vencedor_id === id) c++; else break }
    return { jogadorId: id, total: c }
  })
  const maiorSequenciaHistorica = computed(() => {
    const lista = [...matches.value]
      .filter(m => m.tipo === 'oficial' && m.status !== 'Incompleto')
      .sort((a, b) => new Date(a.data) - new Date(b.data))
    if (!lista.length) return { jogadorId: 0, total: 0 }
    let max = 0, maxJ = 0, cur = 0, curJ = 0
    lista.forEach(m => {
      if (m.vencedor_id === curJ) cur++
      else { if (cur > max) { max = cur; maxJ = curJ } curJ = m.vencedor_id; cur = 1 }
    })
    if (cur > max) { max = cur; maxJ = curJ }
    return { jogadorId: maxJ, total: max }
  })
  const totaisClutch = computed(() => {
    const r = { terceiroSetFilho: 0, terceiroSetPai: 0, setsLongosFilho: 0, setsLongosPai: 0 }
    const isLongo = (a, b) => a === 7 && (b === 5 || b === 6)
    filteredMatchesForStats.value.forEach(m => {
      if (isLongo(m.set1_j1, m.set1_j2)) r.setsLongosFilho++
      if (isLongo(m.set1_j2, m.set1_j1)) r.setsLongosPai++
      if (isLongo(m.set2_j1, m.set2_j2)) r.setsLongosFilho++
      if (isLongo(m.set2_j2, m.set2_j1)) r.setsLongosPai++
      if (m.set3_j1 != null && m.set3_j2 != null && m.tipoTerceiroSet === 'normal') {
        if (isLongo(m.set3_j1, m.set3_j2)) r.setsLongosFilho++
        if (isLongo(m.set3_j2, m.set3_j1)) r.setsLongosPai++
      }
      if (m.status !== 'Incompleto' && m.set3_j1 != null && m.set3_j2 != null && (m.set3_j1 > 0 || m.set3_j2 > 0)) {
        if (m.vencedor_id === 1) r.terceiroSetFilho++
        if (m.vencedor_id === 2) r.terceiroSetPai++
      }
    })
    return r
  })
  const vitoriasPorcentagem = computed(() => {
    const f = filteredMatchesForStats.value.filter(m => m.vencedor_id && m.status !== 'Incompleto')
    if (!f.length) return { j1: 0, j2: 0 }
    const j1 = f.filter(m => m.vencedor_id === 1).length
    return { j1: Math.round((j1 / f.length) * 100), j2: Math.round(((f.length - j1) / f.length) * 100) }
  })
  const vitoriasSuperficie = computed(() => {
    const d = { Saibro: { filho: 0, pai: 0 }, Rápida: { filho: 0, pai: 0 }, Grama: { filho: 0, pai: 0 } }
    filteredMatchesForStats.value.forEach(m => {
      if (m.status !== 'Incompleto' && m.quadra && d[m.quadra]) {
        if (m.vencedor_id === 1) d[m.quadra].filho++
        if (m.vencedor_id === 2) d[m.quadra].pai++
      }
    })
    return d
  })
  const totaisAcumulados = computed(() => {
    const s = { jogosFilho: 0, jogosPai: 0, setsFilho: 0, setsPai: 0, gamesFilho: 0, gamesPai: 0, pneusFilho: 0, pneusPai: 0, bicicletasFilho: 0, bicicletasPai: 0 }
    const dom = (a, b, q) => { if (a === 6 && b === 0) q === 1 ? s.pneusFilho++ : s.pneusPai++; if (a === 6 && b === 1) q === 1 ? s.bicicletasFilho++ : s.bicicletasPai++ }
    filteredMatchesForStats.value.forEach(m => {
      s.gamesFilho += (m.set1_j1 || 0) + (m.set2_j1 || 0) + (m.set3_j1 || 0)
      s.gamesPai += (m.set1_j2 || 0) + (m.set2_j2 || 0) + (m.set3_j2 || 0)
      dom(m.set1_j1, m.set1_j2, 1); dom(m.set1_j2, m.set1_j1, 2)
      dom(m.set2_j1, m.set2_j2, 1); dom(m.set2_j2, m.set2_j1, 2)
      if (m.set3_j1 != null && m.set3_j2 != null && m.tipoTerceiroSet === 'normal') {
        dom(m.set3_j1, m.set3_j2, 1); dom(m.set3_j2, m.set3_j1, 2)
      }
      if ((m.set1_j1 || 0) > (m.set1_j2 || 0)) s.setsFilho++; else if ((m.set1_j2 || 0) > (m.set1_j1 || 0)) s.setsPai++
      if ((m.set2_j1 || 0) > (m.set2_j2 || 0)) s.setsFilho++; else if ((m.set2_j2 || 0) > (m.set2_j1 || 0)) s.setsPai++
      if (m.set3_j1 || m.set3_j2) {
        if ((m.set3_j1 || 0) > (m.set3_j2 || 0)) s.setsFilho++; else if ((m.set3_j2 || 0) > (m.set3_j1 || 0)) s.setsPai++
      }
      if (m.status !== 'Incompleto') {
        if (m.vencedor_id === 1) s.jogosFilho++
        else if (m.vencedor_id === 2) s.jogosPai++
      }
    })
    return s
  })
  const winRate = (p) => {
    const t = players.value[0].wins + players.value[1].wins
    return t ? Math.round((p.wins / t) * 100) : 0
  }
  const formatScore = (m) => {
    let s = `${m.set1_j1}-${m.set1_j2}, ${m.set2_j1}-${m.set2_j2}`
    if (m.set3_j1 != null && m.set3_j2 != null) s += `, ${m.set3_j1}-${m.set3_j2}`
    return s
  }
  const locaisEstatísticas = computed(() => {
    const est = {}
    locaisLista.value.forEach(l =>
      est[l.nome] = { nome: l.nome, foto: l.foto || FOTO_PADRAO, total: 0, vitoriasFilho: 0, vitoriasPai: 0 }
    )
    filteredMatchesForStats.value.forEach(m => {
      if (m.local && est[m.local]) {
        est[m.local].total++
        if (m.status !== 'Incompleto') {
          m.vencedor_id === 1 ? (est[m.local].vitoriasFilho++, est[m.local].vitoriasPai) : est[m.local].vitoriasPai++
        }
      }
    })
    return Object.values(est).filter(e => e.total > 0).sort((a, b) => b.total - a.total)
  })

  return {
    statsFilter, statsYearFilter, historyFilter, sortedMatches, dashboardMatches,
    filteredHistoryMatches, isConfrontoEmpatado, currentKing, listaAnosDisponiveis,
    filteredMatchesForStats, sequenciaAtual, maiorSequenciaHistorica, totaisClutch,
    vitoriasPorcentagem, vitoriasSuperficie, totaisAcumulados, winRate, formatScore, locaisEstatísticas
  }
}
