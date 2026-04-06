<template>
  <div class="min-h-screen bg-gray-100 p-6">

    <!-- Header -->
    <h1 class="text-3xl font-bold text-gray-800 mb-6">
      🛒 POS Scanner
    </h1>

    <!-- Scanner Input -->
    <div class="bg-white rounded-2xl shadow p-4 mb-6">
      <label class="block text-sm font-medium text-gray-600 mb-2">
        Scan Barcode
      </label>
      <input
        ref="scannerInput"
        v-model="barcodeValue"
        @keyup.enter="handleScan"
        type="text"
        placeholder="Scan or type barcode here..."
        class="w-full border-2 border-blue-400 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-600"
      />
    </div>

    <!-- Feedback Message -->
    <p v-if="feedbackMessage" class="text-red-500 font-medium mb-4">
      {{ feedbackMessage }}
    </p>

    <!-- Cart Debug Preview -->
    <div class="bg-white rounded-2xl shadow p-4">
      <h2 class="text-lg font-bold text-gray-700 mb-3">
        Cart Preview ({{ cart.length }} items)
      </h2>
      <div v-if="cart.length === 0" class="text-gray-400">
        No items scanned yet...
      </div>
      <div
        v-for="item in cart"
        :key="item.id"
        class="flex justify-between py-2 border-b last:border-0"
      >
        <span>{{ item.name }}</span>
        <span class="text-gray-500">x{{ item.quantity }}</span>
        <span class="font-medium">₦{{ item.price * item.quantity }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import products from './products.js'

const barcodeValue = ref('')
const feedbackMessage = ref('')
const scannerInput = ref(null)

// Our cart starts as an empty array
const cart = ref([])

onMounted(() => {
  scannerInput.value.focus()
})

function handleScan() {
  const scannedCode = barcodeValue.value.trim()
  if (!scannedCode) return

  // Find product in our database
  const product = products.find(p => p.barcode === scannedCode)

  if (product) {
    feedbackMessage.value = ''
    addToCart(product)
  } else {
    feedbackMessage.value = `❌ No product found for barcode: ${scannedCode}`
  }

  barcodeValue.value = ''
  scannerInput.value.focus()
}

function addToCart(product) {
  // Check if product already exists in cart
  const existingItem = cart.value.find(item => item.id === product.id)

  if (existingItem) {
    // Product already in cart → just increase quantity
    existingItem.quantity++
  } else {
    // Product not in cart → add it with quantity 1
    cart.value.push({
      ...product,
      quantity: 1
    })
  }
}
</script>