import { ref } from 'vue'
import { db, collection, getDocs, doc, setDoc } from '../firebase/index.js'

const FOTO_PADRAO = "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=400&q=80"

const players = ref([
  { id: 1, docId: "filho", name: "Gustavo Machado (Filho)", wins: 0, photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
  { id: 2, docId: "pai", name: "Otávio Machado (Pai)", wins: 0, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" }
])
const matches = ref([])
const locaisLista = ref([])

export function useFirebase() {
  const carregarDadosDoBanco = async () => {
    try {
      const qPlayers = await getDocs(collection(db, "jogadores"))
      if (qPlayers.empty) {
        for (const p of players.value) {
          await setDoc(doc(db, "jogadores", p.docId), { name: p.name, photo: p.photo })
        }
      } else {
        qPlayers.forEach(docSnap => {
          const idx = players.value.findIndex(p => p.docId === docSnap.id)
          if (idx !== -1 && docSnap.data().photo) players.value[idx].photo = docSnap.data().photo
        })
      }
      const qLocais = await getDocs(collection(db, "locais"))
      locaisLista.value = qLocais.docs.map(d => ({ id: d.id, ...d.data() }))
      const qMatches = await getDocs(collection(db, "partidas"))
      matches.value = qMatches.docs.map(d => ({ id: d.id, ...d.data() }))
      calcularVitorias()
    } catch (e) { console.error(e) }
  }

  const calcularVitorias = () => {
    let f = 0, p = 0
    matches.value.forEach(m => {
      if (m.tipo === 'oficial' && m.status !== 'Incompleto') {
        m.vencedor_id === 1 ? f++ : (m.vencedor_id === 2 ? p++ : 0)
      }
    })
    players.value[0].wins = f
    players.value[1].wins = p
  }

  const getLocalPhoto = (nome) => {
    const l = locaisLista.value.find(l => l.nome.toLowerCase() === nome.toLowerCase())
    return l?.foto || FOTO_PADRAO
  }

  return { players, matches, locaisLista, FOTO_PADRAO, carregarDadosDoBanco, calcularVitorias, getLocalPhoto }
}
