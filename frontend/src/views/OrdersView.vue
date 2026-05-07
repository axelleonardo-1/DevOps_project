<template>
  <section class="space-y-8">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight text-[#2f4a34] sm:text-3xl">My orders</h1>
      <p class="text-sm text-[#5a725f] sm:text-base">Track your recent purchases.</p>
    </header>

    <div v-if="loading" class="flex justify-center py-12">
      <p class="text-sm text-[#5a725f]">Loading orders...</p>
    </div>

    <div v-else-if="error" class="rounded-lg border border-[#f1c7c7] bg-[#fff5f5] p-4">
      <p class="text-sm font-medium text-[#7a4d4d]">Could not load orders.</p>
      <p class="mt-1 text-sm text-[#7a4d4d]">{{ error }}</p>
    </div>

    <div
      v-else-if="orders.length === 0"
      class="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-[#c5d7b8] bg-[#fffdf7] p-6 text-center"
    >
      <div class="space-y-2">
        <p class="text-base font-medium text-[#48624d]">No orders yet</p>
        <p class="text-sm text-[#5a725f]">When you complete checkout, your orders will appear here.</p>
      </div>
    </div>

    <div v-else class="overflow-hidden rounded-lg border border-[#d6e2cc] bg-[#fffdf7]">
      <div class="grid grid-cols-3 bg-[#f2f7ef] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#5a725f] sm:text-sm">
        <span>Order</span>
        <span>Date</span>
        <span class="text-right">Status</span>
      </div>

      <router-link
        v-for="order in orders"
        :key="order.orderId"
        :to="{ name: 'order-detail', params: { id: order.orderId } }"
        class="grid grid-cols-3 items-center border-t border-[#e7eee1] px-4 py-3 text-sm transition hover:bg-[#f8fbf5]"
      >
        <span class="font-medium text-[#2f4a34]">#{{ order.orderId }}</span>
        <span class="text-[#617966]">{{ formatDate(order.createdAt) }}</span>
        <span class="text-right">
          <span class="rounded-md px-2 py-1 text-xs font-medium" :class="statusClass(order.status)">{{ order.status }}</span>
        </span>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ordersApi } from '@/services/api'

const orders = ref([])
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
  return Number.isNaN(date.getTime()) ? isoDate : date.toLocaleDateString('es-MX')
}

onMounted(async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await ordersApi.get('/orders')
    orders.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    error.value = err?.response?.data?.message || err?.response?.data?.error || 'Unknown error'
    orders.value = []
  } finally {
    loading.value = false
  }
})
</script>
