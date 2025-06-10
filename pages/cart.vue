<script setup lang="ts">
import { useCart } from '~/services/cart'
import { onMounted } from 'vue'

const { cart, loading, error, fetchCart } = useCart()

onMounted(() => {
  fetchCart()
})

// Define middleware for authentication
definePageMeta({
  middleware: ['auth']
})

useHead({
  htmlAttrs: {
    dir: 'rtl',
    lang: 'fa'
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8" dir="rtl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8 text-right">سبد خرید</h1>
      
      <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600">در حال بارگذاری سبد خرید...</p>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-right">
        {{ error }}
      </div>

      <div v-else>
        <Cart />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add RTL specific styles */
[dir="rtl"] {
  text-align: right;
}
</style> 