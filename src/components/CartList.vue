<template>
  <div class="flex-1 bg-white rounded-2xl shadow p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-700">🧾 Cart Items</h2>
      <button
        v-if="cart.length > 0"
        @click="$emit('clear-cart')"
        class="text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
      >
        🧹 Clear All
      </button>
    </div>

    <div v-if="cart.length === 0" class="text-center text-gray-400 py-12">
      <p class="text-5xl mb-3">📭</p>
      <p class="text-lg">No items scanned yet</p>
      <p class="text-sm">Scan a barcode to get started</p>
    </div>

    <div v-else class="divide-y divide-gray-100">
      <div
        v-for="item in cart"
        :key="item.id"
        class="flex items-center justify-between py-3"
      >
        <div class="flex-1">
          <p class="font-semibold text-gray-800">{{ item.name }}</p>
          <p class="text-sm text-gray-400">₦{{ item.price }} each</p>
        </div>
        <div class="flex items-center gap-2 mx-4">
          <button @click="$emit('decrease-qty', item)"
            class="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 font-bold text-lg flex items-center justify-center transition-colors">
            −
          </button>
          <span class="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm min-w-[2.5rem] text-center">
            {{ item.quantity }}
          </span>
          <button @click="$emit('increase-qty', item)"
            class="w-7 h-7 rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-600 font-bold text-lg flex items-center justify-center transition-colors">
            +
          </button>
        </div>
        <div class="text-right flex items-center gap-3">
          <p class="font-bold text-gray-800">₦{{ item.price * item.quantity }}</p>
          <button @click="$emit('remove-item', item)"
            class="text-gray-300 hover:text-red-500 transition-colors text-xl">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cart: {
    type: Array,
    required: true
  }
})

defineEmits(['clear-cart', 'decrease-qty', 'increase-qty', 'remove-item'])
</script>
