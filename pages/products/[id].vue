<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead, useRoute } from '#imports'

const config = useRuntimeConfig()
const route = useRoute()
const product = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchProduct = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${config.public.apiBase}/api/v1/products/${route.params.id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch product')
    }
    const result = await response.json()
    console.log('Raw API response:', result)
    console.log('Product data:', result.data)
    product.value = result.data
  } catch (err) {
    console.error('Error fetching product:', err)
    error.value = err
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProduct()
})

useHead(() => ({
  title: product.value?.name || 'Product Details',
  meta: [
    {
      name: 'description',
      content: product.value?.description || 'Product description'
    },
    {
      property: 'og:title',
      content: product.value?.name
    },
    {
      property: 'og:description',
      content: product.value?.description
    }
  ]
}))
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p class="text-gray-600">Loading product...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center text-red-600">
        <p class="text-xl mb-2">Error loading product</p>
        <p class="text-sm">Please try again later</p>
      </div>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Product Info -->
      <div class="flex flex-col">
        <h1 class="text-3xl font-bold text-gray-900">{{ product.name }}</h1>
        <div class="mt-4">
          <span class="text-2xl font-semibold text-gray-900">${{ product.price }}</span>
          <span v-if="product.compare_at_price" class="ml-2 text-lg text-gray-500 line-through">
            ${{ product.compare_at_price }}
          </span>
        </div>

        <div class="mt-4 space-y-6">
          <div v-html="product.description" class="text-gray-700"></div>

          <!-- Stock Status -->
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-700">Availability:</span>
            <span :class="product.stock > 0 ? 'text-green-600' : 'text-red-600'">
              {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
            </span>
          </div>

          <!-- Volume and Expiry -->
          <div class="space-y-2">
            <p v-if="product.volume" class="text-sm text-gray-700">
              Volume: {{ product.volume }}
            </p>
            <p v-if="product.expiry_date" class="text-sm text-gray-700">
              Expiry Date: {{ new Date(product.expiry_date).toLocaleDateString() }}
            </p>
          </div>

          <!-- Additional Info -->
          <div class="pt-4 border-t">
            <p v-if="product.sku" class="text-sm text-gray-600">
              SKU: {{ product.sku }}
            </p>
          </div>
        </div>
      </div>

      <!-- Product Details -->
      <div class="space-y-6">
        <div class="bg-gray-50 p-6 rounded-lg">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Product Details</h2>
          <dl class="space-y-3">
            <div v-if="product.volume" class="flex justify-between">
              <dt class="text-sm text-gray-500">Volume</dt>
              <dd class="text-sm text-gray-900">{{ product.volume }}</dd>
            </div>
            <div v-if="product.stock" class="flex justify-between">
              <dt class="text-sm text-gray-500">Stock</dt>
              <dd class="text-sm text-gray-900">{{ product.stock }} units</dd>
            </div>
            <div v-if="product.sku" class="flex justify-between">
              <dt class="text-sm text-gray-500">SKU</dt>
              <dd class="text-sm text-gray-900">{{ product.sku }}</dd>
            </div>
            <div v-if="product.expiry_date" class="flex justify-between">
              <dt class="text-sm text-gray-500">Expiry Date</dt>
              <dd class="text-sm text-gray-900">{{ new Date(product.expiry_date).toLocaleDateString() }}</dd>
            </div>
          </dl>
        </div>

        <!-- Back to Products -->
        <div class="text-center">
          <NuxtLink 
            to="/products" 
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Products
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- No Product Found -->
    <div v-else class="flex justify-center items-center min-h-[400px]">
      <div class="text-center text-gray-600">
        <p class="text-xl mb-2">Product not found</p>
        <NuxtLink to="/products" class="text-blue-600 hover:underline">
          Return to products
        </NuxtLink>
      </div>
    </div>
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