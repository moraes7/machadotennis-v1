<script setup>
const props = defineProps({
  activeTab: String, loggedInUser: Number
})
const emit = defineEmits(['update:activeTab'])

const tabs = [
  { id: 'dashboard', icon: 'chart-simple', label: 'Dashboard' },
  { id: 'new-game', icon: 'circle-plus', label: 'Novo Jogo' },
  { id: 'stats', icon: 'ranking-star', label: 'Estatísticas' },
  { id: 'history', icon: 'list-check', label: 'Histórico' },
]
</script>

<template>
  <nav class="bg-white border-t border-tennis-border fixed bottom-0 left-0 right-0 py-2.5 flex justify-around items-center shadow-lg z-40 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
    <template v-for="tab in tabs" :key="tab.id">
      <button v-if="tab.id !== 'new-game' || loggedInUser !== 0" @click="$emit('update:activeTab', tab.id)"
        :class="['flex flex-col items-center gap-1 text-[10px]', activeTab === tab.id ? 'text-tennis-brand font-bold' : 'text-slate-400']">
        <i :class="'fa-solid fa-' + tab.icon + ' text-lg'"></i>
        {{ tab.label }}
      </button>
    </template>
  </nav>
</template>
