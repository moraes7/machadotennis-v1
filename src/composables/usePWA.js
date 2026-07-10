import { ref } from 'vue'

export function usePWA() {
  const deferredPrompt = ref(null)

  const inicializarPWA = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
    })
    window.addEventListener('appinstalled', () => { deferredPrompt.value = null })
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }

  const installPWA = async () => {
    if (!deferredPrompt.value) return
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') deferredPrompt.value = null
  }

  return { deferredPrompt, installPWA, inicializarPWA }
}
