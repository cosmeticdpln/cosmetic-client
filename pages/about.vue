<template>
  <div class="py-16 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">درباره هلمیز</h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          هلمیز، برند پیشرو در صنعت لوازم آرایشی و بهداشتی، با تعهد به کیفیت و نوآوری، محصولات طبیعی و با کیفیت را به مشتریان خود ارائه می‌دهد
        </p>
      </div>

      <!-- Our Story Section -->
      <div class="mb-20">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <h2 class="text-3xl font-bold text-gray-900">داستان ما</h2>
            <p class="text-gray-600">
              هلمیز در سال ۱۴۰۴ با هدف ارائه هوشمندانه محصولات آرایشی و بهداشتی متناسب با نیاز مشتریان تاسیس شد. ما با بهره‌گیری از هوش مصنوعی پیشرفته و تحلیل ویژگی‌های فردی مشتریان، بهترین محصولات را برای هر فرد پیشنهاد می‌دهیم.
            </p>
            <p class="text-gray-600">
              امروز، هلمیز به یکی از نوآورترین پلتفرم‌های خرید لوازم آرایشی در ایران تبدیل شده است که با استفاده از تکنولوژی هوش مصنوعی، تجربه‌ای شخصی‌سازی شده در انتخاب و خرید محصولات آرایشی را برای مشتریان فراهم می‌کند.
            </p>
          </div>
          <div class="relative h-96 rounded-xl overflow-hidden">
            <img
              src="/images/about-story.jpg"
              alt="داستان هلمیز"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <!-- Values Section -->
      <div class="mb-20">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">ارزش‌های ما</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-xl shadow-sm text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">کیفیت برتر</h3>
            <p class="text-gray-600">تعهد ما به استفاده از بهترین برند ها و استانداردها</p>
          </div>

          <div class="bg-white p-8 rounded-xl shadow-sm text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">مسئولیت اجتماعی</h3>
            <p class="text-gray-600">احترام به محیط زیست و تولید محصولات سازگار با طبیعت</p>
          </div>

          <div class="bg-white p-8 rounded-xl shadow-sm text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">نوآوری</h3>
            <p class="text-gray-600">پیشگام در ارائه فرمولاسیون‌های جدید و محصولات نوآورانه</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'درباره ما - هلمیز',
  meta: [
    {
      name: 'description',
      content: 'درباره هلمیز - آشنایی با برند پیشرو در صنعت لوازم آرایشی و بهداشتی'
    }
  ]
})
</script> 