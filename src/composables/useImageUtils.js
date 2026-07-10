import imageCompression from 'browser-image-compression'
import { db, doc, setDoc, updateDoc, deleteDoc } from '../firebase/index.js'

export function useImageUtils(locaisLista) {
  const comprimir = async (file) => {
    const opts = { maxSizeMB: 0.15, maxWidthOrHeight: 600, useWebWorker: true, fileType: 'image/jpeg' }
    try {
      const compressed = await imageCompression(file, opts)
      return await new Promise(r => { const rd = new FileReader(); rd.readAsDataURL(compressed); rd.onloadend = () => r(rd.result) })
    } catch {
      return await new Promise(r => { const rd = new FileReader(); rd.readAsDataURL(file); rd.onload = e => r(e.target.result) })
    }
  }

  const uploadProfilePhoto = async (ev, player, loggedInUser) => {
    if (loggedInUser === 0) return
    const f = ev.target.files[0]
    if (!f) return
    const b64 = await comprimir(f)
    try {
      await setDoc(doc(db, "jogadores", player.docId), { photo: b64 }, { merge: true })
      player.photo = b64
      alert("Foto de perfil atualizada!")
    } catch { alert("Erro ao salvar foto.") }
  }

  const uploadCourtPhoto = async (ev, loc, loggedInUser) => {
    if (loggedInUser === 0) return
    const f = ev.target.files[0]
    if (!f) return
    const b64 = await comprimir(f)
    try {
      await updateDoc(doc(db, "locais", loc.id), { foto: b64 })
      loc.foto = b64
      alert("Foto da quadra atualizada!")
    } catch { alert("Erro ao salvar foto.") }
  }

  const apagarLocal = async (loc, loggedInUser) => {
    if (loggedInUser === 0) return
    if (!confirm(`Apagar "${loc.nome}" permanentemente?`)) return
    await deleteDoc(doc(db, "locais", loc.id))
    locaisLista.value = locaisLista.value.filter(l => l.id !== loc.id)
  }

  return { uploadProfilePhoto, uploadCourtPhoto, apagarLocal }
}
