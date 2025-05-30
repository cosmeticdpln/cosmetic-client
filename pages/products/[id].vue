<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead, useRoute } from '#imports'
import { useProductStore } from '~/stores/product'

const route = useRoute()
const store = useProductStore()
const selectedImage = ref(0)

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
    <!-- Loading State -->
    <div v-if="store.loading" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">در حال بارگذاری...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center text-red-600">
        <p class="text-xl mb-2">خطا در بارگذاری محصول</p>
        <p class="text-sm">لطفاً دوباره تلاش کنید</p>
      </div>
    </div>

    <!-- Product Content -->
    <div v-else-if="store.currentProduct" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Product Images -->
      <div class="space-y-4">
        <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
          <img 
            v-if="store.currentProduct.media?.length"
            :src="store.currentProduct.media[selectedImage].url"
            :alt="store.currentProduct.name"
            class="h-full w-full object-cover object-center"
          />
        </div>
        <div class="grid grid-cols-4 gap-4">
          <button
            v-for="(image, index) in store.currentProduct.media"
            :key="image.id"
            @click="selectedImage = index"
            class="relative aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100"
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

      <!-- Product Info -->
      <div class="flex flex-col">
        <div class="border-b border-gray-200 pb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ store.currentProduct.name }}</h1>
          <p class="text-lg text-gray-500">{{ store.currentProduct.category.name }}</p>
        </div>

        <div class="py-6 space-y-6">
          <!-- Price -->
          <div class="flex items-center">
            <span class="text-3xl font-bold text-gray-900">{{ formatPrice(store.currentProduct.price) }}</span>
            <span v-if="store.currentProduct.compare_at_price" class="mr-4 text-lg text-gray-500 line-through">
              {{ formatPrice(store.currentProduct.compare_at_price) }}
            </span>
          </div>

          <!-- Description -->
          <div class="prose prose-blue max-w-none" v-html="store.currentProduct.description"></div>

          <!-- Specifications -->
          <div v-if="store.currentProduct.specifications?.length" class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">مشخصات محصول</h3>
            <div class="space-y-6">
              <div v-for="spec in store.currentProduct.specifications" :key="spec.id" class="bg-gray-50 rounded-lg p-4">
                <div class="font-medium text-gray-900 mb-2">{{ spec.type.group.name }}</div>
                <div class="grid grid-cols-1 gap-4">
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

          <!-- Product Details -->
          <div class="border-t border-gray-200 pt-6">
            <div class="grid grid-cols-2 gap-4">
              <!-- Stock Status -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm text-gray-600">وضعیت موجودی:</span>
                <div :class="store.currentProduct.stock > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ store.currentProduct.stock > 0 ? 'موجود' : 'ناموجود' }}
                  <span v-if="store.currentProduct.stock > 0">
                    ({{ store.currentProduct.stock }} عدد)
                  </span>
                </div>
              </div>

              <!-- Volume -->
              <div v-if="store.currentProduct.volume" class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm text-gray-600">حجم:</span>
                <div class="text-gray-900">{{ store.currentProduct.volume }}</div>
              </div>

              <!-- SKU -->
              <div v-if="store.currentProduct.sku" class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm text-gray-600">کد محصول:</span>
                <div class="text-gray-900 font-mono">{{ store.currentProduct.sku }}</div>
              </div>

              <!-- Expiry Date -->
              <div v-if="store.currentProduct.expiry_date" class="bg-gray-50 p-4 rounded-lg">
                <span class="text-sm text-gray-600">تاریخ انقضا:</span>
                <div class="text-gray-900">{{ formatDate(store.currentProduct.expiry_date) }}</div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="store.currentProduct.tags?.length" class="flex flex-wrap gap-2">
            <span 
              v-for="tag in store.currentProduct.tags" 
              :key="tag.id"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <!-- Back Button -->
        <div class="mt-8">
          <NuxtLink 
            to="/products" 
            class="inline-flex items-center justify-center w-full px-4 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-150 ease-in-out"
          >
            بازگشت به لیست محصولات
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- No Product Found -->
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

/* Fix RTL layout issues */
.prose {
  direction: rtl;
  text-align: right;
}

.prose img {
  margin: 2rem auto;
  border-radius: 0.5rem;
}
</style> 