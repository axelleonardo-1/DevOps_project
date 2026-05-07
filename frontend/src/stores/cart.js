import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const cartItems = computed(() =>
    items.value.map((item) => ({
      ...item,
      formattedPrice: currencyFormatter.format(item.price),
      formattedLineTotal: currencyFormatter.format(item.price * item.qty),
    })),
  )

  const cartCount = computed(() => items.value.reduce((acc, item) => acc + item.qty, 0))
  const totalAmount = computed(() => items.value.reduce((acc, item) => acc + item.price * item.qty, 0))
  const formattedTotal = computed(() => currencyFormatter.format(totalAmount.value))

  function addToCart(product, quantity = 1) {
    const safeQty = Number.isFinite(quantity) ? Math.max(1, Math.trunc(quantity)) : 1
    const existing = items.value.find((item) => item.productId === product.productId)

    if (existing) {
      existing.qty += safeQty
      return
    }

    items.value.push({
      productId: product.productId,
      name: product.name,
      price: product.price,
      qty: safeQty,
    })
  }

  function increaseQty(productId) {
    const item = items.value.find((entry) => entry.productId === productId)
    if (item) item.qty += 1
  }

  function decreaseQty(productId) {
    const item = items.value.find((entry) => entry.productId === productId)
    if (!item) return

    if (item.qty === 1) {
      removeFromCart(productId)
      return
    }

    item.qty -= 1
  }

  function removeFromCart(productId) {
    items.value = items.value.filter((item) => item.productId !== productId)
  }

  function clearCart() {
    items.value = []
  }

  return {
    cartItems,
    cartCount,
    formattedTotal,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
  }
})
