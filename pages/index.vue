<script setup lang="ts">
import { ref, onMounted } from 'vue'

const videoRef = ref<HTMLVideoElement | null>(null)

const handleVideoLoaded = () => {
  if (videoRef.value) {
    videoRef.value.play().catch((error) => {
      console.error('Video autoplay failed:', error)
    })
  }
}

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.play().catch((error) => {
      console.error('Video autoplay failed:', error)
    })
  }
})

useHead({
  title: 'هلمیز - محصولات آرایشی و بهداشتی هوشمند',
  meta: [
    {
      name: 'description',
      content: 'هلمیز، ارائه دهنده محصولات آرایشی و بهداشتی هوشمند با استفاده از هوش مصنوعی'
    }
  ]
})
</script>

<template>
  <div>
    <!-- Hero Section with Video -->
    <section class="relative h-screen">
      <video
          ref="videoRef"
          class="absolute inset-0 w-full h-full object-cover"
          autoplay
          loop
          muted
          playsinline
          @loadeddata="handleVideoLoaded"
      >
        <source src="/videos/ai-beauty.mp4" type="video/mp4" />
        <!-- Fallback image if video fails -->
        <img src="/images/hero-fallback.jpg" alt="AI Beauty" class="absolute inset-0 w-full h-full object-cover" />
      </video>
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div class="relative h-full flex items-center justify-center text-center">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
            آینده زیبایی با هوش مصنوعی
          </h1>
          <p class="text-xl md:text-2xl text-gray-200 mb-8">
            هلمیز، اولین برند آرایشی و بهداشتی هوشمند در ایران
          </p>
          <div class="flex justify-center space-x-4 space-x-reverse">
            <NuxtLink
                to="/products"
                class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              مشاهده محصولات
            </NuxtLink>
            <a
                href="#about"
                class="bg-white bg-opacity-20 text-white px-8 py-3 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              درباره ما
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            چرا هلمیز را انتخاب کنید؟
          </h2>
          <p class="text-lg text-gray-600">
            ترکیب هوش مصنوعی و زیبایی برای تجربه‌ای منحصر به فرد
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-xl shadow-sm">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              فناوری پیشرفته
            </h3>
            <p class="text-gray-600">
              استفاده از هوش مصنوعی برای تشخیص و پیشنهاد بهترین محصولات متناسب با پوست شما
            </p>
          </div>

          <div class="bg-white p-8 rounded-xl shadow-sm">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              کیفیت تضمین شده
            </h3>
            <p class="text-gray-600">
              تمامی محصولات ما دارای استانداردهای بین‌المللی و تأییدیه‌های بهداشتی معتبر هستند
            </p>
          </div>

          <div class="bg-white p-8 rounded-xl shadow-sm">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              قیمت مناسب
            </h3>
            <p class="text-gray-600">
              ارائه محصولات با کیفیت در بازه‌های قیمتی مختلف برای تمامی سلیقه‌ها
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            محصولات پرطرفدار
          </h2>
          <p class="text-lg text-gray-600">
            محبوب‌ترین محصولات ما را ببینید
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="i in 4" :key="i" class="group">
            <div class="relative aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
              <img
                  src="/images/placeholder.png"
                  alt="Product image"
                  class="h-full w-full object-cover object-center group-hover:opacity-75"
              />
            </div>
            <div class="mt-4">
              <h3 class="text-lg font-medium text-gray-900">نام محصول</h3>
              <p class="text-sm text-gray-500">توضیحات کوتاه محصول</p>
              <p class="mt-2 text-lg font-semibold text-blue-600">۲۵۰,۰۰۰ تومان</p>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <NuxtLink
              to="/products"
              class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            مشاهده همه محصولات
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-6">
              داستان هلمیز
            </h2>
            <p class="text-lg text-gray-600 mb-6">
              هلمیز با هدف ارائه محصولات آرایشی و بهداشتی هوشمند و با کیفیت، فعالیت خود را آغاز کرد. ما با استفاده از هوش مصنوعی و تکنولوژی‌های پیشرفته، محصولاتی را ارائه می‌دهیم که متناسب با نیازهای فردی هر مشتری است.
            </p>
            <p class="text-lg text-gray-600">
              تیم متخصص ما متشکل از کارشناسان زیبایی، متخصصان پوست و دانشمندان هوش مصنوعی است که با همکاری یکدیگر، بهترین راهکارهای زیبایی را برای شما فراهم می‌کنند.
            </p>
          </div>
          <div class="relative h-96">
            <img
                src="/images/about.png"
                alt="About Helmis"
                class="absolute inset-0 w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="py-20 bg-blue-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">
          عضویت در خبرنامه
        </h2>
        <p class="text-lg text-blue-100 mb-8">
          برای اطلاع از آخرین محصولات و تخفیف‌های ویژه، در خبرنامه ما عضو شوید
        </p>
        <form class="max-w-md mx-auto">
          <div class="flex gap-4">
            <input
                type="email"
                placeholder="ایمیل خود را وارد کنید"
                class="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button
                type="submit"
                class="bg-white text-blue-900 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              عضویت
            </button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>