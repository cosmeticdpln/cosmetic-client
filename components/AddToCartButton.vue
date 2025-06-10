<template>
  <div>
    <button
      v-motion
      :initial="{ scale: 1 }"
      :hover="{ scale: 1.05 }"
      :tap="{ scale: 0.95 }"
      @click="handleAddToCart"
      class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      :disabled="loading"
    >
      <svg 
        v-motion
        :initial="{ rotate: 0 }"
        :animate="{ rotate: loading ? 360 : 0 }"
        :transition="{ duration: 1000, repeat: loading ? Infinity : 0 }"
        xmlns="http://www.w3.org/2000/svg" 
        class="h-5 w-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span>{{ loading ? 'در حال افزودن...' : 'افزودن به سبد خرید' }}</span>
    </button>

    <!-- Success Popup -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="showSuccess"
        v-motion
        :initial="{ y: -20, opacity: 0 }"
        :enter="{ y: 0, opacity: 1, transition: { duration: 300 } }"
        :leave="{ y: -20, opacity: 0, transition: { duration: 200 } }"
        class="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white border-2 border-green-500 text-gray-800 px-6 py-6 rounded-2xl shadow-2xl min-w-[280px] max-w-[600px] w-full">
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <div 
              v-motion
              :initial="{ scale: 0 }"
              :enter="{ scale: 1, transition: { type: 'spring', stiffness: 200, delay: 100 } }"
              class="flex-shrink-0"
            >
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg 
                  v-motion
                  :initial="{ scale: 0, rotate: -180 }"
                  :enter="{ scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, delay: 200 } }"
                  class="w-8 h-8 text-green-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div 
              v-motion
              :initial="{ x: -20, opacity: 0 }"
              :enter="{ x: 0, opacity: 1, transition: { delay: 300 } }"
              class="flex-grow text-center sm:text-right"
            >
              <h3 class="text-xl font-bold text-gray-900 mb-1">محصول با موفقیت اضافه شد</h3>
              <p class="text-gray-600">محصول مورد نظر به سبد خرید شما اضافه شد</p>
            </div>
            <NuxtLink
              v-motion
              :initial="{ y: 20, opacity: 0 }"
              :enter="{ y: 0, opacity: 1, transition: { delay: 400 } }"
              :hover="{ scale: 1.05 }"
              :tap="{ scale: 0.95 }"
              to="/cart"
              class="w-full sm:w-auto flex-shrink-0 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl text-center"
            >
              مشاهده سبد خرید
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCart } from '../services/cart'

const props = defineProps<{
  productId: number
}>()

const emit = defineEmits<{
  (e: 'showLogin'): void
}>()

const { addToCart } = useCart()
const loading = ref(false)
const showSuccess = ref(false)

async function handleAddToCart() {
  loading.value = true
  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      // Emit event to show login modal
      emit('showLogin')
      return
    }
    await addToCart(props.productId)
    // Show success popup
    showSuccess.value = true
    // Hide popup after 3 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to add to cart:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style> 