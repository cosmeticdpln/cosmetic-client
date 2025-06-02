<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHead, useRoute } from '#imports'
import { useProductStore } from '~/stores/product'

const route = useRoute()
const store = useProductStore()

const selectedImage = ref(0)
const isHovering = ref(false)

const mainImage = computed(() => {
  if (!store.currentProduct?.media?.length) return ''
  return store.currentProduct.media[selectedImage.value]?.url || ''
})

// Zoom logic
const zoomBoxVisible = ref(false)
const zoomPosition = ref({ x: 0, y: 0 })
const lensPosition = ref({ x: 0, y: 0 })
const lensSize = 150

const handleMouseMove = (e: MouseEvent) => {
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  // Set zoom background position (% of image)
  zoomPosition.value = {
    x: (offsetX / rect.width) * 100,
    y: (offsetY / rect.height) * 100
  }

  // Set lens position in actual pixels (no RTL flipping!)
  lensPosition.value = {
    x: offsetX - lensSize / 2,
    y: offsetY - lensSize / 2
  }
}



const zoomBackgroundStyle = computed(() => {
  if (!mainImage.value) return {}
  return {
    backgroundImage: `url(${mainImage.value})`,
    backgroundPosition: `${zoomPosition.value.x}% ${zoomPosition.value.y}%`,
    backgroundSize: '200%',
    backgroundRepeat: 'no-repeat'
  }
})

onMounted(async () => {
  await store.fetchProduct(route.params.id as string)
})

const formatPrice = (price: string) => {
  return new Intl.NumberFormat('fa-IR').format(parseInt(price)) + ' تومان'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fa-IR')
}

useHead(() => ({
  title: store.currentProduct?.name || 'جزئیات محصول',
  htmlAttrs: {
    dir: 'rtl',
    lang: 'fa'
  },
  meta: [
    {
      name: 'description',
      content: store.currentProduct?.description?.replace(/<[^>]*>/g, '') || 'توضیحات محصول'
    }
  ]
}))
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-vazir">
    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">در حال بارگذاری...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center text-red-600">
        <p class="text-xl mb-2">خطا در بارگذاری محصول</p>
        <p class="text-sm">لطفاً دوباره تلاش کنید</p>
      </div>
    </div>

    <!-- ✅ Zoom Box -->
    <div
        v-if="zoomBoxVisible"
        class="fixed top-10 left-10 w-[700px] h-[700px] border-2 border-blue-500 z-50 rounded shadow-lg hidden md:block"
        :style="zoomBackgroundStyle"
    ></div>

    <!-- Product Content -->
    <div v-if="store.currentProduct" class="relative">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Left: Image -->
        <div class="space-y-4">
          <div
              class="w-full aspect-w-1 aspect-h-1 relative overflow-hidden rounded-lg"
              @mouseenter="isHovering = true; zoomBoxVisible = true"
              @mouseleave="isHovering = false; zoomBoxVisible = false"
              @mousemove="handleMouseMove"
          >
            <img
                :src="mainImage"
                :alt="store.currentProduct.name"
                class="w-full h-full object-cover transition-opacity duration-300"
                :class="{ 'opacity-70': isHovering }"
            />

            <!-- ✅ Lens -->
            <div
                v-if="isHovering"
                class="absolute bg-white/30 border-2 border-blue-400 backdrop-blur-sm pointer-events-none"
                :style="{
                width: lensSize + 'px',
                height: lensSize + 'px',
                top: lensPosition.y + 'px',
                left: lensPosition.x + 'px',
                borderRadius: '0.5rem',
              }"
            ></div>
          </div>

          <!-- Thumbnails -->
          <div class="grid grid-cols-4 gap-4">
            <button
                v-for="(image, index) in store.currentProduct.media"
                :key="image.id"
                @click="selectedImage = index"
                class="relative aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100 transition-all duration-200 hover:opacity-80"
                :class="{ 'ring-2 ring-blue-500': selectedImage === index }"
            >
              <img
                  :src="image.url"
                  :alt="`${store.currentProduct.name} - تصویر ${index + 1}`"
                  class="h-full w-full object-cover object-center"
              />
            </button>
          </div>
        </div>

        <!-- Right: Info -->
        <div class="flex flex-col">
          <div class="border-b border-gray-200 pb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ store.currentProduct.name }}</h1>
            <p class="text-lg text-gray-500">{{ store.currentProduct.category.name }}</p>
          </div>

          <div class="py-6 space-y-6">
            <div class="flex items-center">
              <span class="text-3xl font-bold text-gray-900">{{ formatPrice(store.currentProduct.price) }}</span>
              <span v-if="store.currentProduct.compare_at_price" class="mr-4 text-lg text-gray-500 line-through">
                {{ formatPrice(store.currentProduct.compare_at_price) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm text-gray-600">وضعیت موجودی:</span>
                <div :class="store.currentProduct.stock > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ store.currentProduct.stock > 0 ? 'موجود' : 'ناموجود' }}
                  <span v-if="store.currentProduct.stock > 0">({{ store.currentProduct.stock }} عدد)</span>
                </div>
              </div>

              <div v-if="store.currentProduct.volume" class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm text-gray-600">حجم:</span>
                <div class="text-gray-900">{{ store.currentProduct.volume }}</div>
              </div>

              <div v-if="store.currentProduct.sku" class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm text-gray-600">کد محصول:</span>
                <div class="text-gray-900 font-mono">{{ store.currentProduct.sku }}</div>
              </div>

              <div v-if="store.currentProduct.expiry_date" class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm text-gray-600">تاریخ انقضا:</span>
                <div class="text-gray-900">{{ formatDate(store.currentProduct.expiry_date) }}</div>
              </div>
            </div>

            <div v-if="store.currentProduct.tags?.length" class="flex flex-wrap gap-2">
              <span
                  v-for="tag in store.currentProduct.tags"
                  :key="tag.id"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {{ tag.name }}
              </span>
            </div>

            <button
                class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                :disabled="store.currentProduct.stock <= 0"
            >
              افزودن به سبد خرید
            </button>
          </div>
        </div>
      </div>

      <!-- Description and Specifications -->
      <div class="space-y-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">توضیحات محصول</h2>
          <div class="prose prose-blue max-w-none" v-html="store.currentProduct.description"></div>
        </div>

        <div v-if="store.currentProduct.specifications?.length" class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">مشخصات محصول</h2>
          <div class="space-y-6">
            <div v-for="spec in store.currentProduct.specifications" :key="spec.id" class="bg-gray-50 rounded-lg p-4">
              <div class="font-medium text-gray-900 mb-2">{{ spec.type.group.name }}</div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ spec.type.name }}:</span>
                <span class="text-gray-900">
                  {{ Array.isArray(spec.value) ? spec.value.join('، ') : spec.value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Back Button -->
      <div class="mt-8">
        <NuxtLink
            to="/products"
            class="inline-flex items-center justify-center px-4 py-3 text-base font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          ← بازگشت به لیست محصولات
        </NuxtLink>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="flex justify-center items-center min-h-[400px]">
      <div class="text-center text-gray-600">
        <p class="text-xl mb-2">محصول یافت نشد</p>
        <NuxtLink to="/products" class="text-blue-600 hover:underline">
          بازگشت به لیست محصولات
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap');

.font-vazir {
  font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif;
}

.prose {
  direction: rtl;
  text-align: justify;
}

img {
  user-drag: none;
}
</style>
