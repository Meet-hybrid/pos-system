<template>
  <div class="bg-white rounded-2xl shadow p-4 mb-6">
    <label class="block text-sm font-medium text-gray-600 mb-2">Scan Barcode</label>
    <input
      ref="scannerInput"
      v-model="barcodeValue"
      @keyup.enter="$emit('scan', barcodeValue)"
      type="text"
      placeholder="Scan or type barcode here..."
      :class="[
        'w-full border-2 rounded-xl px-4 py-3 text-lg focus:outline-none transition-colors duration-300',
        scanStatus === 'success' ? 'border-green-400 bg-green-50' :
        scanStatus === 'error'   ? 'border-red-400 bg-red-50' :
                                   'border-blue-400 bg-white'
      ]"
    />
    <p v-if="feedbackMessage" class="text-red-500 font-medium mt-2">
      {{ feedbackMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  feedbackMessage: String,
  scanStatus: String
})

const emit = defineEmits(['scan'])
const barcodeValue = ref('')
const scannerInput = ref(null)

onMounted(() => {
  scannerInput.value.focus()
})

// Expose focus method to parent
defineExpose({
  focus: () => scannerInput.value.focus(),
  clear: () => (barcodeValue.value = '')
})
</script>
