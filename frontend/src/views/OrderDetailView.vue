<template>
  <section class="space-y-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-[#5a725f]">Order detail</p>
        <h1 class="text-2xl font-semibold tracking-tight text-[#2f4a34] sm:text-3xl">#{{ order?.orderId || route.params.id }}</h1>
      </div>

      <router-link
        to="/orders"
        class="rounded-md border border-[#c5d7b8] px-3 py-2 text-sm font-medium text-[#45604a] transition hover:bg-[#edf4e8]"
      >
        Back to orders
      </router-link>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <p class="text-sm text-[#5a725f]">Loading order...</p>
    </div>

    <div v-else-if="error" class="rounded-lg border border-[#f1c7c7] bg-[#fff5f5] p-4">
      <p class="text-sm font-medium text-[#7a4d4d]">Could not load order.</p>
      <p class="mt-1 text-sm text-[#7a4d4d]">{{ error }}</p>
    </div>

    <div v-else-if="order" class="space-y-6">
      <div class="grid gap-4 rounded-xl border border-[#d6e2cc] bg-[#fffdf7] p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-[#7b8f7c]">Status</p>
          <p class="mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium" :class="statusClass(order.status)">
            {{ order.status }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-wide text-[#7b8f7c]">User</p>
          <p class="mt-2 text-sm font-medium text-[#2f4a34]">{{ order.userId || '—' }}</p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-wide text-[#7b8f7c]">Created</p>
          <p class="mt-2 text-sm font-medium text-[#2f4a34]">{{ formatDate(order.createdAt) }}</p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-wide text-[#7b8f7c]">Updated</p>
          <p class="mt-2 text-sm font-medium text-[#2f4a34]">{{ formatDate(order.updatedAt) }}</p>
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-[#d6e2cc] bg-[#fffdf7]">
        <div class="grid grid-cols-4 bg-[#f2f7ef] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#5a725f] sm:text-sm">
          <span>Product</span>
          <span class="text-center">Qty</span>
          <span class="text-center">Price</span>
          <span class="text-right">Line total</span>
        </div>

        <div
          v-for="item in order.items"
          :key="`${order.orderId}-${item.productId}`"
          class="grid grid-cols-4 items-center border-t border-[#e7eee1] px-4 py-3 text-sm"
        >
          <span class="min-w-0 break-all font-medium text-[#2f4a34]">{{ item.productId }}</span>
          <span class="text-center text-[#617966]">{{ item.quantity }}</span>
          <span class="text-center text-[#617966]">{{ formatMoney(item.price, order.currency) }}</span>
          <span class="text-right font-semibold text-[#2f4a34]">{{ formatMoney(item.total, order.currency) }}</span>
        </div>
      </div>

      <div class="ml-auto w-full max-w-sm rounded-xl border border-[#d6e2cc] bg-[#fffdf7] p-5">
        <div class="flex items-center justify-between text-sm text-[#617966]">
          <span>Subtotal</span>
          <span>{{ formatMoney(order.subtotal, order.currency) }}</span>
        </div>
        <div class="mt-3 flex items-center justify-between border-t border-[#e7eee1] pt-3 text-base font-semibold text-[#2f4a34]">
          <span>Total</span>
          <span>{{ formatMoney(order.total, order.currency) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ordersApi } from '@/services/api'

const route = useRoute()
const order = ref(null)
const loading = ref(false)
const error = ref('')

const statusClass = (status) => {
  switch (status) {
    case 'PAID':
      return 'bg-[#e6efe0] text-[#47604b]'
    case 'CONFIRMED':
      return 'bg-[#eef4ff] text-[#415f91]'
    case 'PENDING':
      return 'bg-[#fff5dd] text-[#8a6a1f]'
    case 'CANCELLED':
      return 'bg-[#fde8e8] text-[#a33a3a]'
    default:
      return 'bg-[#ececec] text-[#5c5c5c]'
  }
}

const formatDate = (isoDate) => {
  if (!isoDate) return '—'
  const date = new Date(isoDate)
  return Number.isNaN(date.getTime()) ? isoDate : `${date.toLocaleDateString('es-MX')} ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
}

const formatMoney = (amount, currency = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

onMounted(async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await ordersApi.get(`/orders/${route.params.id}`)
    order.value = response.data
  } catch (err) {
    error.value = err?.response?.data?.message || err?.response?.data?.error || 'Unknown error'
    order.value = null
  } finally {
    loading.value = false
  }
})
</script>