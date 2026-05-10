<script setup>
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const { cartCount } = storeToRefs(cartStore)
</script>

<template>
  <nav class="border-b border-[#c5d7b8] bg-[#dce8d2]">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div class="text-base font-semibold tracking-tight text-[#2f4a34]">E-Commerce Team 3</div>

      <div class="flex items-center gap-2 text-sm font-medium">
        <RouterLink
          to="/"
          active-class="bg-[#6f8b63] text-[#f7f5ee]"
          class="rounded-md px-3 py-1.5 text-[#45604a] transition hover:bg-[#edf4e8] hover:text-[#2f4a34]"
        >
          Catalog
        </RouterLink>
        <RouterLink
          to="/cart"
          active-class="bg-[#6f8b63] text-[#f7f5ee]"
          class="rounded-md px-3 py-1.5 text-[#45604a] transition hover:bg-[#edf4e8] hover:text-[#2f4a34]"
        >
          Cart <span class="ml-1 rounded-full bg-[#edf4e8] px-2 py-0.5 text-xs text-[#45604a]">{{ cartCount }}</span>
        </RouterLink>
        <RouterLink
          to="/orders"
          active-class="bg-[#6f8b63] text-[#f7f5ee]"
          class="rounded-md px-3 py-1.5 text-[#45604a] transition hover:bg-[#edf4e8] hover:text-[#2f4a34]"
        >
          Orders
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
