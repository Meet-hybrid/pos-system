<template>
  <div class="min-h-screen bg-bg-app p-6">

    <h1 class="text-3xl font-bold text-gray-800 mb-6">🛒 POS Scanner</h1>

    <!-- Scanner Input -->
    <ScannerInput
      ref="scannerRef"
      :feedback-message="feedbackMessage"
      :scan-status="scanStatus"
      @scan="handleScan"
    />

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
        :is-processing="cartStore.isProcessing"
        @print-receipt="printReceipt"
        @charge-customer="chargeCustomer"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import products from './products.ts'
import ScannerInput from './components/ScannerInput.vue'
import CartList from './components/CartList.vue'
import OrderSummary from './components/OrderSummary.vue'
import { useCartStore } from './stores/cartStore'
import { generateReceiptHTML } from './utils/receiptGenerator'

const cartStore = useCartStore()
const { cart, totalItems, subtotal } = storeToRefs(cartStore)
const { addToCart, increaseQty, decreaseQty, removeItem, clearCart } = cartStore

const feedbackMessage = ref('')
const scanStatus      = ref(null)
const scannerRef      = ref(null)

onMounted(() => {
  scannerRef.value.focus()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(event) {
  if (event.altKey && event.key === 'c') {
    chargeCustomer()
  }
  if (event.altKey && event.key === 'p') {
    printReceipt()
  }
}

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

function handleScan(scannedCode) {
  const code = scannedCode.trim()
  if (!code) return

  const product = products.find(p => p.barcode === code)

  if (product) {
    feedbackMessage.value = ''
    addToCart(product)
    playBeep('success')
    triggerFlash('success')
  } else {
    feedbackMessage.value = `❌ No product found for barcode: ${code}`
    playBeep('error')
    triggerFlash('error')
  }

  scannerRef.value.clear()
  scannerRef.value.focus()
}

function printReceipt() {
  const receiptHTML = generateReceiptHTML(cart.value, subtotal.value);

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

function chargeCustomer() {
  if (cart.value.length === 0) {
    alert('Please scan items before charging!')
    return
  }

  cartStore.isProcessing = true;

  const handler = PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: 'customer@example.com',
    amount: subtotal.value * 100,
    currency: 'NGN',
    ref: 'POS_' + Date.now(),
    onClose: function() {
      cartStore.isProcessing = false;
      alert('Payment cancelled by customer.')
    },
    callback: function(response) {
      console.log('✅ Payment successful!', response)
      alert(`✅ Payment Successful!\n\nReference: ${response.reference}\nAmount: ₦${subtotal.value}`)
      printReceipt()
      cart.value = []
      feedbackMessage.value = ''
      cartStore.isProcessing = false;
    }
  })

  handler.openIframe()
}

</script>
