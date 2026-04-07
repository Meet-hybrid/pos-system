<template>
  <div class="min-h-screen bg-gray-100 p-6">

    <h1 class="text-3xl font-bold text-gray-800 mb-6">🛒 POS Scanner</h1>

    <!-- Scanner Input -->
    <div class="bg-white rounded-2xl shadow p-4 mb-6">
      <label class="block text-sm font-medium text-gray-600 mb-2">Scan Barcode</label>
      <input
        ref="scannerInput"
        v-model="barcodeValue"
        @keyup.enter="handleScan"
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

    <!-- Main Layout -->
    <div class="flex gap-6">

      <!-- LEFT: Cart Items -->
      <div class="flex-1 bg-white rounded-2xl shadow p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-700">🧾 Cart Items</h2>
          <button
            v-if="cart.length > 0"
            @click="clearCart"
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
              <button @click="decreaseQty(item)"
                class="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 font-bold text-lg flex items-center justify-center transition-colors">
                −
              </button>
              <span class="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm min-w-[2.5rem] text-center">
                {{ item.quantity }}
              </span>
              <button @click="increaseQty(item)"
                class="w-7 h-7 rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-600 font-bold text-lg flex items-center justify-center transition-colors">
                +
              </button>
            </div>
            <div class="text-right flex items-center gap-3">
              <p class="font-bold text-gray-800">₦{{ item.price * item.quantity }}</p>
              <button @click="removeItem(item)"
                class="text-gray-300 hover:text-red-500 transition-colors text-xl">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Summary -->
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

        <!-- Receipt component (invisible on screen, shows when printing) -->
        <!-- <Receipt
          :cart="cart"
          :subtotal="subtotal"
          :paymentMethod="paymentMethod"
        /> -->

        <!-- Print Button -->
        <button
          :disabled="cart.length === 0"
          @click="printReceipt"
          class="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg transition-colors duration-200"
        >
          🧾 Print Receipt
        </button>

        <!-- Charge Button -->
        <button
          :disabled="cart.length === 0"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg transition-colors duration-200"
        >
          💳 Charge Customer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import products from './products.js'
// import Receipt from './components/Receipt.vue'

const barcodeValue    = ref('')
const feedbackMessage = ref('')
const scannerInput    = ref(null)
const cart            = ref([])
const scanStatus      = ref(null)
// const paymentMethod   = ref('Cash')

onMounted(() => {
  scannerInput.value.focus()
})

const totalItems = computed(() =>
  cart.value.reduce((sum, item) => sum + item.quantity, 0)
)

const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

function playBeep(type) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioCtx.createOscillator()
  oscillator.connect(audioCtx.destination)
  if (type === 'success') {
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.1)
  } else {
    oscillator.frequency.setValueAtTime(220, audioCtx.currentTime)
    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.3)
  }
}

function triggerFlash(type) {
  scanStatus.value = type
  setTimeout(() => { scanStatus.value = null }, 600)
}

function handleScan() {
  const scannedCode = barcodeValue.value.trim()
  if (!scannedCode) return

  const product = products.find(p => p.barcode === scannedCode)

  if (product) {
    feedbackMessage.value = ''
    addToCart(product)
    playBeep('success')
    triggerFlash('success')
  } else {
    feedbackMessage.value = `❌ No product found for barcode: ${scannedCode}`
    playBeep('error')
    triggerFlash('error')
  }

  barcodeValue.value = ''
  scannerInput.value.focus()
}

function addToCart(product) {
  const existingItem = cart.value.find(item => item.id === product.id)
  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.value.push({ ...product, quantity: 1 })
  }
}

function increaseQty(item) { item.quantity++ }

function decreaseQty(item) {
  if (item.quantity > 1) { item.quantity-- } else { removeItem(item) }
}

function removeItem(item) {
  cart.value = cart.value.filter(i => i.id !== item.id)
}

function clearCart() {
  cart.value = []
}

function printReceipt() {
  // Build receipt date and number
  const receiptDate = new Date().toLocaleString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
  const receiptNumber = Math.floor(Math.random() * 900000) + 100000

  // items HTML looping through cart
  const itemsHTML = cart.value.map(item => `
    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
      <div>
        <p style="font-weight:bold; margin:0;">${item.name}</p>
        <p style="font-size:11px; margin:0; color:#555;">${item.quantity} x ₦${item.price}</p>
      </div>
      <p style="font-weight:bold; margin:0;">₦${item.price * item.quantity}</p>
    </div>
  `).join('')

  //  receipt HTML
  const receiptHTML = `
    <html>
      <head>
        <title>Receipt #${receiptNumber}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 13px;
            width: 300px;
            margin: 0 auto;
            padding: 16px;
            color: #000;
          }
          .center { text-align: center; }
          .divider { text-align: center; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .total-row { font-size: 16px; font-weight: bold; }
          .footer { font-size: 11px; text-align: center; margin-top: 12px; }
          h1 { font-size: 18px; margin: 0 0 4px 0; }
          p { margin: 2px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <h1>🏪 MY POS SHOP</h1>
          <p>123 Lagos Street, Nigeria</p>
          <p>Tel: 08012345678</p>
          <p>Date: ${receiptDate}</p>
          <p>Receipt No: #${receiptNumber}</p>
        </div>

        <div class="divider">- - - - - - - - - - - - -</div>

        ${itemsHTML}

        <div class="divider">- - - - - - - - - - - - -</div>

        <div class="row total-row">
          <span>TOTAL</span>
          <span>₦${subtotal.value}</span>
        </div>

        <div class="row">
          <span>Payment</span>
          <span>Cash</span>
        </div>

        <div class="divider">- - - - - - - - - - - - -</div>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>Please come again 🙏</p>
          <p>Powered by MyPOS v1.0</p>
        </div>
      </body>
    </html>
  `

  // Open a brand new window, write receipt into it, then print it
  const printWindow = window.open('', '_blank', 'width=400,height=600')
  printWindow.document.write(receiptHTML)
  printWindow.document.close()

  // Small delay to make sure content loads before printing
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 300)
}
</script>