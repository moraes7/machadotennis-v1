import { ref } from 'vue'
import { db, collection, addDoc, doc, updateDoc, deleteDoc } from '../firebase/index.js'

const empty = () => ({
  id: null, tipo: 'oficial', localSelecionado: '', novoLocalNome: '', quadra: 'Saibro',
  tipoTerceiroSet: 'super', set1_j1: 0, set1_j2: 0, set2_j1: 0, set2_j2: 0,
  set3_j1: 0, set3_j2: 0, data: new Date().toISOString().split('T')[0]
})

export function useMatchForm(matches, locaisLista, calcularVitorias, FOTO_PADRAO) {
  const form = ref(empty())

  const validarInputSet = (campo) => {
    let val = parseInt(form.value[campo], 10)
    if (isNaN(val) || val < 0) form.value[campo] = 0
    if (val > 99) form.value[campo] = 99
  }

  const setNormalOK = (a, b) => ((a === 6 && b <= 4) || (b === 6 && a <= 4)) || ((a === 7 && (b === 5 || b === 6)) || (b === 7 && (a === 5 || a === 6)))
  const superTieOK = (a, b) => (a >= 10 && (a - b) >= 2) || (b >= 10 && (b - a) >= 2)

  const registerMatch = async (loggedInUser, onSuccess) => {
    if (loggedInUser === 0) return
    let lf = form.value.localSelecionado
    if (lf === 'novo') {
      lf = form.value.novoLocalNome.trim()
      if (!lf) return alert("Digite o nome do novo local!")
      const d = await addDoc(collection(db, "locais"), { nome: lf, foto: FOTO_PADRAO })
      locaisLista.value.push({ id: d.id, nome: lf, foto: FOTO_PADRAO })
    }
    if (!lf) return alert("Selecione um local.")

    const [s1G, s1O, s2G, s2O, s3G, s3O] = [
      form.value.set1_j1, form.value.set1_j2,
      form.value.set2_j1, form.value.set2_j2,
      form.value.set3_j1, form.value.set3_j2
    ]
    let completo = setNormalOK(s1G, s1O) && setNormalOK(s2G, s2O)
    const precisa3 = ((s1G > s1O ? 1 : 0) + (s2G > s2O ? 1 : 0)) === 1
    const tem3 = s3G > 0 || s3O > 0
    if (precisa3 || tem3) {
      if (form.value.tipoTerceiroSet === 'super') { if (!superTieOK(s3G, s3O)) completo = false }
      else { if (!setNormalOK(s3G, s3O)) completo = false }
    }
    const setsG = (s1G > s1O ? 1 : 0) + (s2G > s2O ? 1 : 0) + (s3G > s3O ? 1 : 0)
    const setsO = (s1O > s1G ? 1 : 0) + (s2O > s2G ? 1 : 0) + (s3O > s3G ? 1 : 0)
    let ven = setsG > setsO ? 1 : 2
    if (!completo && setsG === setsO) ven = (s1G + s2G + s3G) >= (s1O + s2O + s3O) ? 1 : 2

    const data = {
      data: form.value.data, local: lf, quadra: form.value.quadra, tipo: form.value.tipo,
      tipoTerceiroSet: form.value.tipoTerceiroSet,
      status: completo ? "Finalizado" : "Incompleto",
      vencedor_id: ven,
      set1_j1: s1G, set1_j2: s1O, set2_j1: s2G, set2_j2: s2O,
      set3_j1: (s3G || s3O) ? s3G : null, set3_j2: (s3G || s3O) ? s3O : null
    }
    if (form.value.id) {
      await updateDoc(doc(db, "partidas", form.value.id), data)
      const idx = matches.value.findIndex(m => m.id === form.value.id)
      if (idx !== -1) matches.value[idx] = { id: form.value.id, ...data }
    } else {
      const dRef = await addDoc(collection(db, "partidas"), data)
      matches.value.push({ id: dRef.id, ...data })
    }
    calcularVitorias()
    form.value = empty()
    onSuccess?.()
  }

  const carregarParaEdicao = (m) => {
    form.value = {
      id: m.id, tipo: m.tipo, localSelecionado: m.local, novoLocalNome: '', quadra: m.quadra,
      tipoTerceiroSet: m.tipoTerceiroSet || 'super',
      set1_j1: m.set1_j1, set1_j2: m.set1_j2, set2_j1: m.set2_j1, set2_j2: m.set2_j2,
      set3_j1: m.set3_j1 || 0, set3_j2: m.set3_j2 || 0, data: m.data
    }
  }
  const resetForm = () => { form.value = empty() }

  const apagarPartida = async (m) => {
    if (!confirm("Deseja apagar essa partida?")) return
    await deleteDoc(doc(db, "partidas", m.id))
    matches.value = matches.value.filter(x => x.id !== m.id)
    calcularVitorias()
  }

  return { form, validarInputSet, registerMatch, carregarParaEdicao, resetForm, apagarPartida }
}
