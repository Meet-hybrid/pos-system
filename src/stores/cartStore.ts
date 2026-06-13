import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Product, CartItem } from '../types'

export const useCartStore = defineStore('cart', () => {
  const cart = ref<CartItem[]>([])

  const totalItems = computed(() =>
    cart.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() =>
    cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  function addToCart(product: Product) {
    const existingItem = cart.value.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      cart.value.push({ ...product, quantity: 1 })
    }
  }

  function increaseQty(item: CartItem) {
    item.quantity++
  }

  function decreaseQty(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--
    } else {
      removeItem(item)
    }
  }

  function removeItem(item: CartItem) {
    cart.value = cart.value.filter(i => i.id !== item.id)
  }

  function clearCart() {
    cart.value = []
  }

  return {
    cart,
    totalItems,
    subtotal,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart
  }
})
