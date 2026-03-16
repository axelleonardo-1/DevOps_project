<template>
  <section class="space-y-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-[#5a725f]">Product detail</p>
        <h1 class="text-2xl font-semibold tracking-tight text-[#2f4a34] sm:text-3xl">{{ product?.name || 'Product' }}</h1>
      </div>

      <router-link
        to="/"
        class="rounded-md border border-[#c5d7b8] px-3 py-2 text-sm font-medium text-[#45604a] transition hover:bg-[#edf4e8]"
      >
        Back to catalog
      </router-link>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <p class="text-sm text-[#5a725f]">Loading product...</p>
    </div>

    <div v-else-if="error" class="rounded-lg border border-[#f1c7c7] bg-[#fff5f5] p-4">
      <p class="text-sm font-medium text-[#7a4d4d]">Could not load product.</p>
      <p class="mt-1 text-sm text-[#7a4d4d]">{{ error }}</p>
    </div>

    <div v-else-if="product" class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="overflow-hidden rounded-xl border border-[#d6e2cc] bg-[#fffdf7] p-4">
        <div class="overflow-hidden rounded-lg border border-[#e7eee1] bg-[#f2f7ef]">
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="h-80 w-full object-cover"
            @error="product.imageUrl = null"
          />
          <div v-else class="flex h-80 items-center justify-center bg-gradient-to-br from-[#f2f7ef] to-[#fffdf7]">
            <p class="text-sm font-medium uppercase tracking-wide text-[#5a725f]">No image available</p>
          </div>
        </div>
      </div>

      <div class="space-y-5 rounded-xl border border-[#d6e2cc] bg-[#fffdf7] p-6">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide">
            <span class="rounded-full bg-[#edf4e8] px-3 py-1 text-[#45604a]">{{ product.category }}</span>
            <span
              class="rounded-full px-3 py-1"
              :class="product.isActive ? 'bg-[#e6efe0] text-[#47604b]' : 'bg-[#fde8e8] text-[#a33a3a]'"
            >
              {{ product.isActive ? 'Available' : 'Unavailable' }}
            </span>
          </div>

          <p class="text-3xl font-bold text-[#2f4a34]">{{ formatMoney(product.price, product.currency) }}</p>
          <p class="text-sm leading-6 text-[#617966]">{{ product.description }}</p>
        </div>

        <div class="grid gap-3 rounded-lg border border-[#e7eee1] bg-[#f8fbf5] p-4 text-sm text-[#48624d] sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-wide text-[#7b8f7c]">Product ID</p>
            <p class="mt-1 break-all font-medium">{{ product.productId }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-[#7b8f7c]">Stock</p>
            <p class="mt-1 font-medium">{{ product.stock }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-[#7b8f7c]">Currency</p>
            <p class="mt-1 font-medium">{{ product.currency || 'MXN' }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-[#7b8f7c]">Updated</p>
            <p class="mt-1 font-medium">{{ formatDate(product.updatedAt) }}</p>
          </div>
        </div>

        <div class="space-y-4 border-t border-[#e7eee1] pt-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-[#48624d]">Quantity</span>
            <button
              type="button"
              class="h-8 w-8 rounded-md border border-[#c5d7b8] text-[#4d6953] transition hover:bg-[#edf4e8]"
              @click="decreaseQty"
            >
              -
            </button>
            <input
              v-model.number="selectedQty"
              type="number"
              min="1"
              class="w-16 rounded-md border border-[#c5d7b8] bg-[#fffdf7] px-2 py-1 text-center text-sm text-[#2f4a34] focus:border-[#6f8b63] focus:outline-none"
              @blur="normalizeQty"
            />
            <button
              type="button"
              class="h-8 w-8 rounded-md border border-[#c5d7b8] text-[#4d6953] transition hover:bg-[#edf4e8]"
              @click="increaseQty"
            >
              +
            </button>
          </div>

          <button
            type="button"
            class="w-full rounded-md bg-[#6f8b63] px-4 py-3 text-sm font-medium text-[#f8f5ee] transition hover:bg-[#5f7855] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!product.isActive || product.stock <= 0"
            @click="addProduct"
          >
            {{ product.isActive && product.stock > 0 ? 'Add to cart' : 'Unavailable' }}
          </button>

          <p v-if="addedMessage" class="text-sm font-medium text-[#48624d]">{{ addedMessage }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import api from '@/services/api'

const route = useRoute()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(false)
const error = ref('')
const selectedQty = ref(1)
const addedMessage = ref('')

const formatMoney = (amount, currency = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

const formatDate = (isoDate) => {
  if (!isoDate) return '—'
  const date = new Date(isoDate)
  return Number.isNaN(date.getTime()) ? isoDate : date.toLocaleDateString('es-MX')
}

const normalizeQty = () => {
  const value = Number(selectedQty.value)
  selectedQty.value = Number.isFinite(value) && value > 0 ? Math.trunc(value) : 1
}

const increaseQty = () => {
  normalizeQty()
  selectedQty.value += 1
}

const decreaseQty = () => {
  normalizeQty()
  selectedQty.value = Math.max(1, selectedQty.value - 1)
}

const addProduct = () => {
  if (!product.value) return
  normalizeQty()
  cartStore.addToCart(product.value, selectedQty.value)
  selectedQty.value = 1
  addedMessage.value = 'Product added to cart successfully.'

  setTimeout(() => {
    addedMessage.value = ''
  }, 1800)
}

onMounted(async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(`/products/${route.params.id}`)
    product.value = response.data
  } catch (err) {
    error.value = err?.response?.data?.error || err?.message || 'Unknown error'
    product.value = null
  } finally {
    loading.value = false
  }
})
</script>