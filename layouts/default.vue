<template>
  <div class="min-h-screen flex flex-col font-vazir">
    <!-- Header -->
    <header 
      class="w-full z-50 transition-all duration-300 fixed top-0"
      :class="[
        isHome ? (
          isScrolled ? 'translate-y-0 opacity-100 bg-white shadow-sm' : 'translate-y-0 opacity-0 pointer-events-none'
        ) : 'bg-white shadow-sm'
      ]"
    >
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20">
        <div class="flex justify-between items-center h-full">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <NuxtLink to="/" class="flex items-center">
              <span class="text-2xl font-bold text-blue-900">Helmis</span>
              <span class="text-sm text-blue-600 mr-2">بیوتی</span>
            </NuxtLink>
          </div>

          <!-- Navigation -->
          <div class="hidden md:flex items-center space-x-8 space-x-reverse">
            <NuxtLink to="/" class="text-gray-700 hover:text-blue-900 transition-colors">خانه</NuxtLink>
            <NuxtLink to="/products" class="text-gray-700 hover:text-blue-900 transition-colors">محصولات</NuxtLink>
            <NuxtLink to="/about" class="text-gray-700 hover:text-blue-900 transition-colors">درباره ما</NuxtLink>
            <NuxtLink to="/contact" class="text-gray-700 hover:text-blue-900 transition-colors">تماس با ما</NuxtLink>
          </div>

          <!-- User Actions -->
          <div class="flex items-center space-x-4 space-x-reverse">
            <button class="text-gray-600 hover:text-blue-900 transition-colors">
              <span class="sr-only">جستجو</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button class="text-gray-600 hover:text-blue-900 transition-colors">
              <span class="sr-only">سبد خرید</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
            <div>
              <button v-if="!userName" @click="showLogin = true" class="text-gray-600 hover:text-blue-900 transition-colors flex items-center">
                <span class="sr-only">ورود</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="ml-2">ورود</span>
              </button>
              <div v-else class="flex items-center space-x-2 space-x-reverse">
                <NuxtLink to="/user" class="flex items-center space-x-2 space-x-reverse hover:underline">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="font-bold text-blue-900">{{ userName }}</span>
                </NuxtLink>
                <button @click="handleLogout" class="text-xs text-gray-500 hover:text-red-600 ml-2">خروج</button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main :class="['flex-grow', { 'mt-20': !isHome }]">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand Info -->
          <div class="col-span-1 md:col-span-2">
            <h3 class="text-2xl font-bold mb-4">Helmis Beauty</h3>
            <p class="text-gray-400 mb-4">
              ما در هلمیز با استفاده از هوش مصنوعی و تکنولوژی‌های پیشرفته، بهترین محصولات آرایشی و بهداشتی را برای شما فراهم می‌کنیم.
            </p>
            <div class="flex space-x-4 space-x-reverse">
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <span class="sr-only">Instagram</span>
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd"></path>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <span class="sr-only">Twitter</span>
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-lg font-semibold mb-4">دسترسی سریع</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">درباره ما</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">تماس با ما</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">سوالات متداول</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">قوانین و مقررات</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div>
            <h4 class="text-lg font-semibold mb-4">اطلاعات تماس</h4>
            <ul class="space-y-2 text-gray-400">
              <li>قم، خیابان </li>
              <li>تلفن: ۰۲۵-۱۲۳۴۵۶۷۸</li>
              <li>ایمیل: info@helmis.com</li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© ۱۴۰۲ هلمیز. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>

    <LoginModal v-if="showLogin" @close="showLogin = false" @success="handleLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import LoginModal from '~/components/LoginModal.vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')
const isScrolled = ref(false)
const showLogin = ref(false)
const userName = ref('')

const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

onMounted(() => {
  if (isHome.value) {
    window.addEventListener('scroll', handleScroll)
  }
  // Load user name from localStorage
  userName.value = localStorage.getItem('user_name') || ''
})

onUnmounted(() => {
  if (isHome.value) {
    window.removeEventListener('scroll', handleScroll)
  }
})

function handleLoginSuccess(data: any) {
  if (data && data.access_token) {
    localStorage.setItem('access_token', data.access_token)
    if (data.user && data.user.name) {
      localStorage.setItem('user_name', data.user.name)
      userName.value = data.user.name
    }
  }
}

function handleLogout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_name')
  userName.value = ''
}

useHead({
  htmlAttrs: {
    dir: 'rtl',
    lang: 'fa'
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap');

.font-vazir {
  font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif;
}
</style> 