<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCartStore } from '~/stores/cart'
import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'
import LoginModal from '~/components/LoginModal.vue'

const router = useRouter()
const cartStore = useCartStore()
const { totalItems } = storeToRefs(cartStore)
const showLogin = ref(false)
const isLoggedIn = ref(false)

onMounted(() => {
  if (process.client) {
    isLoggedIn.value = !!localStorage.getItem('access_token')
  }
})

const navigateTo = (path: string) => {
  router.push(path)
}

const handleLogout = async () => {
  try {
    await fetch('http://localhost:8000/api/v1/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    if (process.client) {
      localStorage.removeItem('access_token')
    }
    isLoggedIn.value = false
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const handleLoginSuccess = () => {
  showLogin.value = false
  isLoggedIn.value = true
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
    <div class="w-64 mx-auto">
      <div class="flex justify-between items-center h-20 px-8">
        <!-- Home -->
        <button 
          @click="navigateTo('/')"
          class="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-sm mt-2 font-medium">خانه</span>
        </button>

        <!-- Products -->
        <button 
          @click="navigateTo('/products')"
          class="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span class="text-sm mt-2 font-medium">محصولات</span>
        </button>

        <!-- Cart -->
        <button 
          @click="navigateTo('/cart')"
          class="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span 
              v-if="totalItems > 0"
              class="absolute -top-3 -right-3 bg-blue-600 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center font-medium"
            >
              {{ totalItems }}
            </span>
          </div>
          <span class="text-sm mt-2 font-medium">سبد خرید</span>
        </button>

        <!-- Login/Logout -->
        <button 
          v-if="isLoggedIn"
          @click="handleLogout"
          class="flex flex-col items-center justify-center text-gray-600 hover:text-red-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="text-sm mt-2 font-medium">خروج</span>
        </button>
        <button 
          v-else
          @click="showLogin = true"
          class="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span class="text-sm mt-2 font-medium">ورود</span>
        </button>
      </div>
    </div>
  </nav>
  <LoginModal 
    v-if="showLogin" 
    @close="showLogin = false" 
    @success="handleLoginSuccess"
  />
</template>

<style scoped>
/* Add padding to the bottom of the page to account for the fixed nav */
:global(body) {
  padding-bottom: 5rem;
}
</style> 