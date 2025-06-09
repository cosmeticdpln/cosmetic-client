<template>
  <button
    @click="handleAddToCart"
    class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    :disabled="loading"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    <span>{{ loading ? 'در حال افزودن...' : 'افزودن به سبد خرید' }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCart } from '../services/cart'
import { useRouter } from 'vue-router'

const props = defineProps<{
  productId: number
}>()

const router = useRouter()
const { addToCart } = useCart()
const loading = ref(false)

async function handleAddToCart() {
  loading.value = true
  try {
    await addToCart(props.productId)
    // Redirect to cart page after successful addition
    router.push('/cart')
  } catch (error) {
    console.error('Failed to add to cart:', error)
  } finally {
    loading.value = false
  }
}
</script> 