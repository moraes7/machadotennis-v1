import { ref } from 'vue'
import { db, collection, getDocs, doc, updateDoc } from '../firebase/index.js'

const STORAGE_KEY = 'app_machado_migracao'

const status = ref('idle')
const total = ref(0)
const processados = ref(0)
const erros = ref(0)

export function useMigracao() {
  const migracaoConcluida = localStorage.getItem(STORAGE_KEY) === 'true'

  const migrarPartidas = async () => {
    if (status.value === 'running') return
    status.value = 'running'
    processados.value = 0
    erros.value = 0

    try {
      const snapshot = await getDocs(collection(db, 'partidas'))
      total.value = snapshot.docs.length
      let count = 0

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        if (!data.jogador1_id && !data.jogador2_id) {
          try {
            await updateDoc(doc(db, 'partidas', docSnap.id), {
              jogador1_id: 'filho',
              jogador2_id: 'pai'
            })
            count++
          } catch (e) {
            erros.value++
            console.error('Erro ao migrar partida', docSnap.id, e)
          }
        }
        processados.value++
      }

      if (erros.value === 0) {
        localStorage.setItem(STORAGE_KEY, 'true')
        status.value = 'done'
      } else {
        status.value = 'error'
      }
    } catch (e) {
      console.error(e)
      status.value = 'error'
    }
  }

  const resetMigracao = () => {
    localStorage.removeItem(STORAGE_KEY)
    status.value = 'idle'
    total.value = 0
    processados.value = 0
    erros.value = 0
  }

  return { status, total, processados, erros, migracaoConcluida, migrarPartidas, resetMigracao }
}
