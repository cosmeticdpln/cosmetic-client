<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead } from '#imports'

const config = useRuntimeConfig()
const products = ref([])
const categories = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const selectedCategory = ref(null)
const searchQuery = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')
const loading = ref(true)
const error = ref(null)

const fetchProducts = async () => {
  loading.value = true
  error.value = null
  try {
    let url = `${config.public.apiBase}/api/v1/products?page=${currentPage.value}&sort=${sortOrder.value === 'desc' ? '-' : ''}${sortBy.value}`
    
    if (selectedCategory.value) {
      url += `&filter[category]=${selectedCategory.value}`
    }
    
    if (searchQuery.value) {
      url += `&filter[name]=${searchQuery.value}`
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    const data = await response.json()
    console.log('Products data:', data) // Debug log
    products.value = data.data
    totalPages.value = Math.ceil(data.meta.total / data.meta.per_page)
  } catch (err) {
    console.error('Error fetching products:', err)
    error.value = err
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await fetch(`${config.public.apiBase}/api/v1/categories`)
    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }
    const data = await response.json()
    console.log('Categories data:', data) // Debug log
    categories.value = data
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})

watch([selectedCategory, searchQuery, sortBy, sortOrder], () => {
  currentPage.value = 1
  fetchProducts()
})

useHead({
  title: 'Our Products - Cosmetic Store',
  meta: [
    {
      name: 'description',
      content: 'Browse our wide selection of beauty and cosmetic products'
    },
    {
      property: 'og:title',
      content: 'Our Products - Cosmetic Store'
    },
    {
      property: 'og:description',
      content: 'Browse our wide selection of beauty and cosmetic products'
    }
  ]
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading && !products.length" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p class="text-gray-600">Loading products...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center text-red-600">
        <p class="text-xl mb-2">Error loading products</p>
        <p class="text-sm">Please try again later</p>
      </div>
    </div>

    <template v-else>
      <!-- Filters and Search -->
      <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          v-model="selectedCategory"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option :value="null">All Categories</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>

        <select
          v-model="sortBy"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="created_at">Newest</option>
          <option value="price">Price</option>
          <option value="name">Name</option>
        </select>
      </div>

      <!-- Products Grid -->
      <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="product in products"
          :key="product.id"
          :to="`/products/${product.id}`"
          class="group"
        >
          <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
            <img
              v-if="product.media?.length"
              :src="product.media[0].url"
              :alt="product.name"
              class="h-full w-full object-cover object-center group-hover:opacity-75"
            />
          </div>
          <div class="mt-4 flex justify-between">
            <div>
              <h3 class="text-sm text-gray-700">{{ product.name }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ product.category?.name }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">${{ product.price }}</p>
              <p v-if="product.compare_at_price" class="text-sm text-gray-500 line-through">
                ${{ product.compare_at_price }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- No Products Found -->
      <div v-else class="flex justify-center items-center min-h-[200px]">
        <p class="text-gray-500">No products found</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center space-x-2">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page; fetchProducts()"
          :class="[
            'px-4 py-2 rounded-lg',
            currentPage === page
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ page }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.aspect-w-1 {
  position: relative;
  padding-bottom: 100%;
}

.aspect-w-1 > img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style> 