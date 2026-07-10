import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Font Awesome
const faLink = document.createElement('link')
faLink.rel = 'stylesheet'
faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
document.head.appendChild(faLink)

createApp(App).mount('#app')
