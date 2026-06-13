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
      <CartList
        :cart="cart"
        @clear-cart="clearCart"
        @decrease-qty="decreaseQty"
        @increase-qty="increaseQty"
        @remove-item="removeItem"
      />

      <!-- RIGHT: Summary -->
      <OrderSummary
        :total-items="totalItems"
        :subtotal="subtotal"
        :is-empty="cart.length === 0"
        @print-receipt="printReceipt"
        @charge-customer="chargeCustomer"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import products from './products.ts'
import CartList from './components/CartList.vue'
import OrderSummary from './components/OrderSummary.vue'
// import Receipt from './components/Receipt.vue'

const barcodeValue    = ref('')
const feedbackMessage = ref('')
const scannerInput    = ref(null)
const cart            = ref([])
const scanStatus      = ref(null)
const customerEmail   = ref('')
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

  function chargeCustomer() {
  if (cart.value.length === 0) {
    alert('Please scan items before charging!')
    return
  }

  if (!customerEmail.value) {
    alert('Please enter customer email to proceed!')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(customerEmail.value)) {
    alert('Please enter a valid email address!')
    return
  }

  const handler = PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,

    email: customerEmail.value,

    
    amount: subtotal.value * 100,

    currency: 'NGN',

    ref: 'POS_' + Date.now(),

    onClose: function() {
      alert('Payment cancelled by customer.')
    },

    callback: function(response) {
      console.log('✅ Payment successful!', response)

      alert(`✅ Payment Successful!\n\nReference: ${response.reference}\nAmount: ₦${subtotal.value}`)

      printReceipt()

      cart.value = []
      customerEmail.value = ''
      feedbackMessage.value = ''
    }
  })

  handler.openIframe()
}

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