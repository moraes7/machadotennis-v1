<script setup>
import { useImageUtils } from '../composables/useImageUtils.js'
import { useMigracao } from '../composables/useMigracao.js'

const props = defineProps({
  show: Boolean, players: Array, loggedInUser: Number,
  locaisLista: Array, FOTO_PADRAO: String, onLogout: Function, onClose: Function
})

defineEmits(['close', 'logout', 'uploaded'])

const { uploadProfilePhoto, uploadCourtPhoto, apagarLocal } = useImageUtils(props.locaisLista)
const { status, total, processados, erros, migracaoConcluida, migrarPartidas } = useMigracao()

const isAdmin = props.loggedInUser === 1 || props.loggedInUser === 2
</script>

<template>
  <div v-if="show && loggedInUser !== 0"
    class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl text-left flex flex-col max-h-[85vh]">
      <div class="mb-3">
        <h3 class="text-base font-bold text-tennis-brand">Configurações do Sistema</h3>
        <p class="text-[11px] text-slate-500">Gerencie perfis e mídias do sistema.</p>
      </div>
      <div class="flex-grow overflow-y-auto space-y-4 pr-1">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Jogador Conectado</span>
          <div class="space-y-2">
            <div v-for="player in players" :key="player.id"
              :class="['flex items-center gap-3 p-2.5 rounded-xl border opacity-90 select-none bg-slate-50',
                loggedInUser === player.id ? 'border-tennis-brand ring-2 ring-tennis-brand/10' : 'border-slate-200 bg-slate-100/50']">
              <img :src="player.photo" class="w-9 h-9 rounded-full object-cover border">
              <div class="flex-grow min-w-0">
                <p class="text-xs font-bold text-slate-800 truncate">{{ player.name }}</p>
                <p class="text-[10px] text-slate-500">{{ player.wins }} Vitórias Oficiais</p>
              </div>
              <div v-if="loggedInUser === player.id" class="text-tennis-accent">
                <i class="fa-solid fa-circle-check"></i>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isAdmin">
          <button @click="$emit('logout')"
            class="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair da Conta
          </button>
        </div>

        <hr v-if="isAdmin && !migracaoConcluida" class="border-slate-100">

        <div v-if="isAdmin && !migracaoConcluida">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Migração do Banco</span>
          <p class="text-[11px] text-slate-500 mb-2">
            Necessário para expandir o app para novos usuários. Adiciona identificadores nas partidas existentes.
          </p>

          <div v-if="status === 'idle'">
            <button @click="migrarPartidas"
              class="w-full bg-tennis-accent hover:bg-tennis-brand text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm">
              <i class="fa-solid fa-database"></i> Migrar Partidas
            </button>
          </div>

          <div v-if="status === 'running'" class="space-y-2">
            <div class="w-full bg-slate-200 rounded-full h-2.5">
              <div class="bg-tennis-accent h-2.5 rounded-full transition-all duration-300"
                :style="{ width: total > 0 ? (processados / total * 100) + '%' : '0%' }">
              </div>
            </div>
            <p class="text-[11px] text-slate-500 text-center">
              Migrando {{ processados }} de {{ total }} partidas...
            </p>
          </div>

          <div v-if="status === 'done'" class="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl text-center font-semibold">
            <i class="fa-solid fa-check-circle text-emerald-500"></i> Migração concluída! {{ total }} partidas atualizadas.
          </div>

          <div v-if="status === 'error'" class="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl text-center space-y-2">
            <p class="font-semibold"><i class="fa-solid fa-exclamation-circle"></i> {{ erros }} erro(s) na migração.</p>
            <button @click="migrarPartidas"
              class="bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 rounded-lg font-bold text-[10px] uppercase">
              Tentar novamente
            </button>
          </div>
        </div>

        <div v-if="isAdmin || (loggedInUser !== 0)">
          <hr class="border-slate-100">
          <div class="mt-4">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Imagens e Exclusão de Locais</span>
            <div class="space-y-2 mt-2">
              <div v-for="loc in locaisLista" :key="loc.id"
                class="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <img :src="loc.foto || FOTO_PADRAO" class="w-8 h-8 object-cover rounded shadow-sm shrink-0">
                  <span class="text-xs font-semibold text-slate-700 truncate">{{ loc.nome }}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <label class="bg-tennis-brand hover:bg-tennis-accent text-white text-[10px] px-2.5 py-1.5 rounded font-bold cursor-pointer">
                    <i class="fa-solid fa-upload"></i>
                    <input type="file" accept="image/*" class="hidden" @change="e => uploadCourtPhoto(e, loc, loggedInUser)">
                  </label>
                  <button @click="apagarLocal(loc, loggedInUser)"
                    class="bg-red-50 hover:bg-red-100 text-red-600 text-xs p-1.5 rounded border border-red-200" title="Apagar Local">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button @click="$emit('close')"
        class="w-full bg-tennis-brand text-white mt-4 py-2 rounded-lg font-bold text-xs text-center shadow">
        Fechar
      </button>
    </div>
  </div>
</template>
