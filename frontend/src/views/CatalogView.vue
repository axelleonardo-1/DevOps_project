<template>
  <section class="space-y-8">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight text-[#2f4a34] sm:text-3xl">Catalog</h1>
      <p class="text-sm text-[#5a725f] sm:text-base">Explore our of products</p>
    </header>

    <div class="grid gap-4 rounded-lg border border-[#d6e2cc] bg-[#fffdf7] p-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5a725f]">Search</label>
        <input
          v-model.trim="searchTerm"
          type="text"
          placeholder="Search by name or description"
          class="w-full rounded-md border border-[#c5d7b8] bg-[#fffdf7] px-3 py-2 text-sm text-[#2f4a34] focus:border-[#6f8b63] focus:outline-none"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5a725f]">Category</label>
        <select
          v-model="filters.category"
          class="w-full rounded-md border border-[#c5d7b8] bg-[#fffdf7] px-3 py-2 text-sm text-[#2f4a34] focus:border-[#6f8b63] focus:outline-none"
        >
          <option value="">All</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
      </div>

      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5a725f]">Min price</label>
        <input
          v-model.number="filters.minPrice"
          type="number"
          min="0"
          placeholder="0"
          class="w-full rounded-md border border-[#c5d7b8] bg-[#fffdf7] px-3 py-2 text-sm text-[#2f4a34] focus:border-[#6f8b63] focus:outline-none"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5a725f]">Max price</label>
        <input
          v-model.number="filters.maxPrice"
          type="number"
          min="0"
          placeholder="5000"
          class="w-full rounded-md border border-[#c5d7b8] bg-[#fffdf7] px-3 py-2 text-sm text-[#2f4a34] focus:border-[#6f8b63] focus:outline-none"
        />
      </div>

      <div class="flex items-end">
        <label class="flex items-center gap-2 rounded-md border border-[#c5d7b8] bg-[#f8fbf5] px-3 py-2 text-sm text-[#45604a]">
          <input v-model="filters.onlyAvailable" type="checkbox" class="accent-[#6f8b63]" />
          Available only
        </label>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <p class="text-sm text-[#5a725f]">Loading products...</p>
    </div>

    <div v-else-if="error" class="rounded-lg border border-[#f1c7c7] bg-[#fff5f5] p-4">
      <p class="text-sm font-medium text-[#7a4d4d]">Could not load products.</p>
      <p class="mt-1 text-sm text-[#7a4d4d]">{{ error }}</p>
    </div>

    <div
      v-else-if="filteredProducts.length === 0"
      class="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-[#c5d7b8] bg-[#fffdf7] p-6 text-center"
    >
      <div class="space-y-2">
        <p class="text-base font-medium text-[#48624d]">No products found</p>
        <p class="text-sm text-[#5a725f]">Try changing your filters or seed the database.</p>
      </div>
    </div>

    <div v-else class="space-y-5">
      <div class="flex items-center justify-between text-sm text-[#5a725f]">
        <p>Showing {{ paginatedProducts.length }} of {{ filteredProducts.length }} products</p>
        <p>Page {{ currentPage }} of {{ totalPages }}</p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="item in paginatedProducts"
        :key="item.productId"
        class="rounded-lg border border-[#d6e2cc] bg-[#fffdf7] p-4"
      >
        <div class="mb-3 overflow-hidden rounded-md border border-[#e7eee1] bg-[#f2f7ef]">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.name"
            class="h-40 w-full object-cover"
            loading="lazy"
            @error="item.imageUrl = null"
          />
          <div v-else class="flex h-40 w-full items-center justify-center bg-gradient-to-br from-[#f2f7ef] to-[#fffdf7]">
            <p class="text-xs font-medium uppercase tracking-wide text-[#5a725f]">No image</p>
          </div>
        </div>

        <router-link
          :to="{ name: 'product-detail', params: { id: item.productId } }"
          class="text-base font-medium text-[#2f4a34] transition hover:text-[#5f7855] hover:underline"
        >
          {{ item.name }}
        </router-link>
        <p class="mt-2 text-sm text-[#617966]">{{ item.description }}</p>
        <p class="mt-4 text-sm font-semibold text-[#48624d]">${{ item.price }}</p>
        <p class="mt-2 text-xs text-[#5a725f]">Stock: {{ item.stock }} · {{ item.category }}</p>
        <div class="mt-4 flex items-center gap-2">
          <span class="text-xs text-[#617966]">Quantity</span>
          <button
            type="button"
            class="h-7 w-7 rounded-md border border-[#c5d7b8] text-[#4d6953] transition hover:bg-[#edf4e8]"
            @click="decreaseSelectedQty(item.productId)"
          >
            -
          </button>
          <input
            v-model.number="selectedQty[item.productId]"
            type="number"
            min="1"
            class="w-14 rounded-md border border-[#c5d7b8] bg-[#fffdf7] px-2 py-1 text-center text-sm text-[#2f4a34] focus:border-[#6f8b63] focus:outline-none"
            @blur="normalizeSelectedQty(item.productId)"
          />
          <button
            type="button"
            class="h-7 w-7 rounded-md border border-[#c5d7b8] text-[#4d6953] transition hover:bg-[#edf4e8]"
            @click="increaseSelectedQty(item.productId)"
          >
            +
          </button>
        </div>
        <button
          type="button"
          class="mt-4 w-full rounded-md bg-[#6f8b63] px-3 py-2 text-sm font-medium text-[#f8f5ee] transition hover:bg-[#5f7855]"
          @click="addProduct(item)"
        >
          Add to cart
        </button>
      </article>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-3">
        <button
          type="button"
          class="rounded-md border border-[#c5d7b8] px-3 py-2 text-sm font-medium text-[#45604a] transition hover:bg-[#edf4e8] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="currentPage -= 1"
        >
          Previous
        </button>

        <span class="text-sm text-[#5a725f]">{{ currentPage }} / {{ totalPages }}</span>

        <button
          type="button"
          class="rounded-md border border-[#c5d7b8] px-3 py-2 text-sm font-medium text-[#45604a] transition hover:bg-[#edf4e8] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentPage === totalPages"
          @click="currentPage += 1"
        >
          Next
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import api from '@/services/api'

const products = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = 6

const filters = reactive({
  category: '',
  minPrice: null,
  maxPrice: null,
  onlyAvailable: false,
})

const cartStore = useCartStore()

// Will be populated once products load
const selectedQty = reactive({})

const categories = computed(() => {
  return [...new Set(products.value.map((item) => item.category).filter(Boolean))].sort()
})

const filteredProducts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  return products.value.filter((item) => {
    const matchesSearch =
      !term ||
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)

    const matchesCategory = !filters.category || item.category === filters.category
    const matchesMinPrice = filters.minPrice === null || filters.minPrice === '' || Number(item.price) >= Number(filters.minPrice)
    const matchesMaxPrice = filters.maxPrice === null || filters.maxPrice === '' || Number(item.price) <= Number(filters.maxPrice)
    const matchesAvailability = !filters.onlyAvailable || item.isActive

    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesAvailability
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / pageSize)))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProducts.value.slice(start, start + pageSize)
})

const ensureSelectedQty = (productId) => {
  if (selectedQty[productId] === undefined) selectedQty[productId] = 1
}

watch([searchTerm, () => filters.category, () => filters.minPrice, () => filters.maxPrice, () => filters.onlyAvailable], () => {
  currentPage.value = 1
})

watch(totalPages, (value) => {
  if (currentPage.value > value) currentPage.value = value
})

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const res = await api.get('/products')
    products.value = Array.isArray(res.data) ? res.data : []

    // initialize quantities for all products
    for (const p of products.value) {
      if (p?.productId) ensureSelectedQty(p.productId)
    }
  } catch (err) {
    error.value = err?.response?.data?.error || err?.message || 'Unknown error'
    products.value = []
  } finally {
    loading.value = false
  }
})

const normalizeSelectedQty = (productId) => {
  ensureSelectedQty(productId)
  const value = Number(selectedQty[productId])
  selectedQty[productId] = Number.isFinite(value) && value > 0 ? Math.trunc(value) : 1
}

const increaseSelectedQty = (productId) => {
  normalizeSelectedQty(productId)
  selectedQty[productId] += 1
}

const decreaseSelectedQty = (productId) => {
  normalizeSelectedQty(productId)
  selectedQty[productId] = Math.max(1, selectedQty[productId] - 1)
}

const addProduct = (product) => {
  normalizeSelectedQty(product.productId)
  cartStore.addToCart(product, selectedQty[product.productId])
  selectedQty[product.productId] = 1
}
</script>
