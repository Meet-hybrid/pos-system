<template>
  <div class="w-72 flex flex-col gap-4">
    <div class="bg-white rounded-2xl shadow p-4">
      <h2 class="text-xl font-bold text-gray-700 mb-4">📋 Order Summary</h2>
      <div class="flex justify-between text-gray-600 mb-2">
        <span>Items</span><span>{{ totalItems }}</span>
      </div>
      <div class="border-t border-gray-100 my-3"></div>
      <div class="flex justify-between text-gray-600 mb-2">
        <span>Subtotal</span><span>₦{{ subtotal }}</span>
      </div>
      <div class="border-t border-dashed border-gray-300 my-3"></div>
      <div class="flex justify-between items-center">
        <span class="text-xl font-bold text-gray-800">Total</span>
        <span class="text-2xl font-extrabold text-blue-600">₦{{ subtotal }}</span>
      </div>
    </div>

    <!-- Print Button -->
    <button
      :disabled="isEmpty"
      @click="$emit('print-receipt')"
      class="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg transition-colors duration-200"
    >
      🧾 Print Receipt
    </button>

    <!-- Charge Button -->
    <button 
      :disabled="isEmpty"
      @click="$emit('charge-customer')"
      class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg transition-colors duration-200"
    >
      💳 Charge Customer
    </button>
  </div>
</template>

<script setup>
defineProps({
  totalItems: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  isEmpty: {
    type: Boolean,
    required: true
  }
})

defineEmits(['print-receipt', 'charge-customer'])
</script>
