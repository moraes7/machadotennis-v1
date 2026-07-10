<script setup>
import { useMatchForm } from '../composables/useMatchForm.js'

const props = defineProps({
  matches: Array, locaisLista: Array, loggedInUser: Number, FOTO_PADRAO: String,
  calcularVitorias: Function
})

const emit = defineEmits(['saved'])

const { form, validarInputSet, registerMatch, carregarParaEdicao, resetForm, apagarPartida } =
  useMatchForm(props.matches, props.locaisLista, props.calcularVitorias, props.FOTO_PADRAO)

const handleSave = () => {
  registerMatch(props.loggedInUser, () => emit('saved'))
}
</script>

<template>
  <div class="space-y-4 text-left">
    <h2 class="text-xl font-bold text-tennis-brand">{{ form.id ? 'Editar Partida' : 'Registrar Nova Partida' }}</h2>
    <div class="bg-white p-4 rounded-xl border border-tennis-border space-y-4 shadow-sm">
      <div>
        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Objetivo</label>
        <div class="grid grid-cols-2 gap-2">
          <button v-for="t in ['oficial', 'treino']" :key="t" @click="form.tipo = t"
            :class="['py-2 px-2 rounded-lg text-xs font-semibold border capitalize transition',
              form.tipo === t ? 'bg-tennis-brand text-white border-tennis-brand' : 'bg-slate-50 text-slate-600 border-slate-200']">
            {{ t }}
          </button>
        </div>
      </div>
      <div>
        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Local / Clube</label>
        <select v-model="form.localSelecionado" class="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none mb-2">
          <option value="">-- Selecione um local --</option>
          <option v-for="loc in locaisLista" :key="loc.id" :value="loc.nome">{{ loc.nome }}</option>
          <option value="novo">Novo Local</option>
        </select>
        <input v-if="form.localSelecionado === 'novo'" type="text" v-model="form.novoLocalNome"
          placeholder="Nome do novo clube/local" class="w-full bg-slate-50 border border-tennis-brand text-xs rounded-lg p-2.5">
      </div>
      <div>
        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Tipo de Quadra</label>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="surface in ['Saibro', 'Rápida', 'Grama']" :key="surface" @click="form.quadra = surface"
            :class="['py-2 rounded-lg text-xs font-semibold border transition',
              form.quadra === surface ? 'bg-tennis-brand text-white border-tennis-brand' : 'bg-slate-50 text-slate-600 border-slate-200']">
            {{ surface }}
          </button>
        </div>
      </div>
      <div>
        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Formato do 3º Set</label>
        <select v-model="form.tipoTerceiroSet" class="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none">
          <option value="super">Super Tie-break (Até 10 pontos)</option>
          <option value="normal">Set Normal (Até 6 games)</option>
        </select>
      </div>
      <div class="space-y-3 pt-2">
        <div class="text-[10px] font-bold text-slate-400 pb-1 border-b">GAMES (GUSTAVO VS OTÁVIO)</div>
        <div v-for="s in [1, 2, 3]" :key="s" class="flex justify-between items-center text-xs">
          <span class="font-bold text-slate-600">
            {{ s }}º Set
            <span v-if="s === 3" class="text-[10px] text-tennis-accent">({{ form.tipoTerceiroSet === 'super' ? 'Super Tie' : 'Normal' }})</span>
          </span>
          <div class="flex gap-2">
            <input type="number" min="0" max="99" v-model.number="form['set'+s+'_j1']"
              @input="validarInputSet('set'+s+'_j1')" class="w-12 border text-center font-mono py-1 rounded">
            <span>:</span>
            <input type="number" min="0" max="99" v-model.number="form['set'+s+'_j2']"
              @input="validarInputSet('set'+s+'_j2')" class="w-12 border text-center font-mono py-1 rounded">
          </div>
        </div>
      </div>
      <div>
        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Data</label>
        <input type="date" v-model="form.data" class="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 font-mono">
      </div>
    </div>
    <div class="flex gap-2">
      <button v-if="form.id" @click="resetForm" class="w-1/3 bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-xs uppercase">Cancelar</button>
      <button @click="handleSave"
        :class="[form.id ? 'w-2/3' : 'w-full', 'bg-tennis-brand hover:bg-tennis-accent text-white py-3.5 rounded-xl font-bold text-xs uppercase shadow-md']">
        Salvar Placar
      </button>
    </div>
  </div>
</template>
