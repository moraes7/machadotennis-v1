import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Carrega dados do JSON extraído do site original ───
const RAW_DATA = resolve(__dirname, '../tennis_data_clean.json')

// Atualiza o JSON com os dados frescos
// Se quiser pular a extração manual, o seed usa o JSON já salvo
let data
try {
  data = JSON.parse(readFileSync(RAW_DATA, 'utf-8'))
} catch {
  console.error('❌ tennis_data_clean.json não encontrado na raiz do projeto')
  process.exit(1)
}

// ─── Firebase Admin ───
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, '../serviceAccountKey.json'), 'utf-8')
)

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) })
}
const db = getFirestore()

const FOTO_GUSTAVO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
const FOTO_OTAVIO  = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
const FOTO_LOCAL   = 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=400&q=80'

async function deleteAll(collectionName) {
  const snapshot = await db.collection(collectionName).get()
  const batch = db.batch()
  snapshot.docs.forEach(doc => batch.delete(doc.ref))
  await batch.commit()
  console.log(`   🗑️  ${snapshot.size} docs removidos de "${collectionName}"`)
}

async function seed() {
  console.log('📖 Lendo tennis_data_clean.json...')

  // ─── Limpa coleções existentes ───
  console.log('\n🧹 Limpando banco anterior...')
  await deleteAll('partidas')
  await deleteAll('locais')
  await deleteAll('jogadores')

  // ─── Locais ───
  console.log('\n🏟️  Inserindo locais...')
  const nomesLocais = [...new Set(data.partidas.map(p => p.local).filter(Boolean))]
  for (const nome of nomesLocais) {
    await db.collection('locais').add({ nome, foto: FOTO_LOCAL })
    console.log(`   ✓ ${nome}`)
  }

  // ─── Jogadores ───
  console.log('\n👤 Inserindo jogadores...')
  await db.collection('jogadores').doc('filho').set({
    name: 'Gustavo Machado (Filho)',
    photo: FOTO_GUSTAVO
  })
  await db.collection('jogadores').doc('pai').set({
    name: 'Otávio Machado (Pai)',
    photo: FOTO_OTAVIO
  })
  console.log('   ✓ filho + pai criados')

  // ─── Partidas com jogador1_id / jogador2_id ───
  console.log('\n🎾 Inserindo partidas...')
  let count = 0
  for (const p of data.partidas) {
    await db.collection('partidas').add({
      data: p.data,
      local: p.local,
      quadra: p.quadra,
      tipo: p.tipo,
      tipoTerceiroSet: p.tipoTerceiroSet || 'super',
      status: p.status,
      vencedor_id: p.vencedor_id,
      set1_j1: p.set1_j1,
      set1_j2: p.set1_j2,
      set2_j1: p.set2_j1,
      set2_j2: p.set2_j2,
      set3_j1: p.set3_j1 ?? null,
      set3_j2: p.set3_j2 ?? null,
      jogador1_id: 'filho',
      jogador2_id: 'pai'
    })
    count++
  }
  console.log(`   ✓ ${count} partidas inseridas`)
  console.log('\n✅ Seed concluído!')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Erro:', err)
  process.exit(1)
})
