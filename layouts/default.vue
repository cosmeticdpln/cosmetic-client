<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'
import LoginModal from '~/components/LoginModal.vue'
import BottomNav from '~/components/BottomNav.vue'
import Header from '~/components/Header.vue'

const showLogin = ref(false)
const cartStore = useCartStore()
const userName = ref('')

onMounted(() => {
  if (process.client) {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Fetch user info if needed
    }
  }
})

const handleLoginSuccess = (data: any) => {
  showLogin.value = false
  if (data.user?.name) {
    userName.value = data.user.name
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    <main class="pt-[52px] pb-16">
      <slot />
    </main>

    <BottomNav />

    <LoginModal 
      v-if="showLogin" 
      @close="showLogin = false" 
      @success="handleLoginSuccess"
    />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap');

body {
  font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif;
}
</style> 