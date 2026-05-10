<template>
  <section class="space-y-8 max-w-4xl mx-auto">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight text-[#2f4a34] sm:text-3xl">Checkout</h1>
      <p class="text-sm text-[#5a725f] sm:text-base">Review products before finalizing your order.</p>
    </header>

    <div
      v-if="cartItems.length === 0"
      class="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-[#c5d7b8] bg-[#fffdf7] p-6 text-center"
    >
      <div class="space-y-2">
        <p class="text-base font-medium text-[#48624d]">Your cart is empty</p>
        <p class="text-sm text-[#5a725f]">Add products from the Catalog to start shopping.</p>
        <router-link to="/" class="inline-block mt-4 text-[#6f8b63] font-bold underline">Go to Catalog</router-link>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="rounded-lg border border-[#d6e2cc] bg-[#fffdf7] p-4 space-y-3">
        <div
          v-for="product in cartItems"
          :key="product.productId"
          class="flex flex-col gap-3 border-b border-[#e7eee1] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-[#2f4a34]">{{ product.name }}</p>
            <p class="text-sm text-[#617966]">{{ product.formattedPrice }} each</p>
          </div>
          <div class="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              class="h-7 w-7 rounded-md border border-[#c5d7b8] text-[#4d6953] transition hover:bg-[#edf4e8]"
              @click="cartStore.decreaseQty(product.productId)"
            >
              -
            </button>
            <span class="w-8 text-center text-sm font-medium text-[#2f4a34]">{{ product.qty }}</span>
            <button
              type="button"
              class="h-7 w-7 rounded-md border border-[#c5d7b8] text-[#4d6953] transition hover:bg-[#edf4e8]"
              @click="cartStore.increaseQty(product.productId)"
            >
              +
            </button>
          </div>
          <div class="flex items-center gap-3 self-start sm:self-center">
            <p class="text-sm font-semibold text-[#2f4a34]">{{ product.formattedLineTotal }}</p>
            <button
              type="button"
              class="text-xs font-medium text-[#7a4d4d] transition hover:text-[#5f3535]"
              @click="cartStore.removeFromCart(product.productId)"
            >
              Remove
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-[#dfe8d7] pt-4 text-base">
          <span class="text-[#5a725f] font-medium">Order Total</span>
          <span class="font-bold text-[#2f4a34] text-lg">{{ formattedTotal }}</span>
        </div>
      </div>

      <p v-if="successMessage" class="rounded-md border border-[#cfe3c1] bg-[#eef7e7] px-4 py-3 text-sm text-[#48624d]">
        {{ successMessage }}
      </p>

      <p v-if="checkoutError" class="rounded-md border border-[#f1c7c7] bg-[#fff5f5] px-4 py-3 text-sm text-[#7a4d4d]">
        {{ checkoutError }}
      </p>

      <button
        type="button"
        @click="handleCheckout"
        :disabled="isProcessing"
        class="w-full rounded-md bg-[#6f8b63] px-6 py-3 text-base font-bold text-[#f8f5ee] transition hover:bg-[#5f7855] shadow-lg shadow-[#6f8b63]/20 disabled:opacity-50 flex justify-center items-center gap-3"
      >
        <span
          v-if="isProcessing"
          class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
        ></span>
        {{ isProcessing ? 'Processing Order...' : 'Confirm and Pay' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { ordersApi } from '@/services/api'

const cartStore = useCartStore()
const router = useRouter()
const { cartItems, formattedTotal } = storeToRefs(cartStore)

const isProcessing = ref(false)
const checkoutError = ref('')
const successMessage = ref('')

const handleCheckout = async () => {
  if (cartItems.value.length === 0 || isProcessing.value) return

  isProcessing.value = true
  checkoutError.value = ''
  successMessage.value = ''

  const orderData = {
    userId: 'frontend-user-demo',
    items: cartItems.value.map((item) => ({
      productId: item.productId,
      quantity: item.qty,
    })),
    currency: 'MXN',
  }

  try {
    const response = await ordersApi.post('/orders', orderData)
    const order = response?.data?.order
    const status = response?.data?.status || order?.status || 'PENDING'

    cartStore.clearCart()
    successMessage.value = `Order created successfully. Status: ${status}`

    setTimeout(() => {
      router.push('/orders')
    }, 900)
  } catch (error) {
    checkoutError.value = error?.response?.data?.message || error?.response?.data?.error || 'Error processing your order. Please try again later.'
  } finally {
    isProcessing.value = false
  }
}
</script>
