<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useHead } from '#imports'
import { useProductStore } from '~/stores/product'
import { storeToRefs } from 'pinia'
import { useMotion } from '@vueuse/motion'

const store = useProductStore()

// Use storeToRefs to maintain reactivity
const { 
  products, 
  categories, 
  loading, 
  error,
  filters,
  pagination,
} = storeToRefs(store)

// Animation variants
const productCardVariants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 600,
    },
  },
}

const imageHoverVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
}

// Function to create staggered delay for products
const getProductDelay = (index: number) => {
  return {
    enter: {
      ...productCardVariants.enter,
      transition: {
        duration: 600,
        delay: index * 100,
      },
    },
  }
}

// Add currentImageIndexes to track current image for each product
const currentImageIndexes = ref<{ [key: number]: number }>({})

const formatPrice = (price: string) => {
  return new Intl.NumberFormat('fa-IR').format(parseInt(price)) + ' تومان'
}

const nextImage = (productId: number, totalImages: number) => {
  if (!currentImageIndexes.value[productId]) {
    currentImageIndexes.value[productId] = 0
  }
  currentImageIndexes.value[productId] = (currentImageIndexes.value[productId] + 1) % totalImages
}

const prevImage = (productId: number, totalImages: number) => {
  if (!currentImageIndexes.value[productId]) {
    currentImageIndexes.value[productId] = 0
  }
  currentImageIndexes.value[productId] = (currentImageIndexes.value[productId] - 1 + totalImages) % totalImages
}

onMounted(() => {
  store.fetchProducts()
  store.fetchCategories()
})

useHead({
  title: 'محصولات - فروشگاه لوازم آرایشی',
  htmlAttrs: {
    dir: 'rtl',
    lang: 'fa'
  },
  meta: [
    {
      name: 'description',
      content: 'مشاهده و خرید محصولات آرایشی و بهداشتی'
    },
    {
      property: 'og:title',
      content: 'محصولات - فروشگاه لوازم آرایشی'
    },
    {
      property: 'og:description',
      content: 'مشاهده و خرید محصولات آرایشی و بهداشتی'
    }
  ]
})
</script>

<template>
  <div class="min-h-screen font-vazir">
    <div class="w-full">
      <!-- Page Header -->
      <div 
        class="text-center mb-12 py-12 bg-gray-50"
        v-motion
        :initial="{ opacity: 0, y: -50 }"
        :enter="{ opacity: 1, y: 0 }"
        :delay="100"
      >
        <h1 class="text-3xl font-bold text-gray-900 mb-4">محصولات هلمیز</h1>
        <p class="text-lg text-gray-600">
          مجموعه کامل محصولات آرایشی و بهداشتی با کیفیت
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !products.length" class="flex justify-center items-center min-h-[400px]">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600">در حال بارگذاری محصولات...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex justify-center items-center min-h-[400px]">
        <div class="text-center text-red-600">
          <p class="text-xl mb-2">خطا در بارگذاری محصولات</p>
          <p class="text-sm">لطفاً دوباره تلاش کنید</p>
        </div>
      </div>

      <template v-else>
        <!-- Filters Section -->
        <div 
          class="mb-8 bg-white shadow-sm p-6"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0 }"
          :delay="300"
        >
          <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
              <input
                v-model="filters.search"
                type="text"
                placeholder="نام محصول را وارد کنید..."
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @input="(e) => store.setSearch((e.target as HTMLInputElement).value)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">دسته‌بندی</label>
              <select
                v-model="filters.category"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @change="(e) => store.setCategory((e.target as HTMLSelectElement).value ? Number((e.target as HTMLSelectElement).value) : null)"
              >
                <option :value="null">همه دسته‌بندی‌ها</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">مرتب‌سازی</label>
              <select
                v-model="filters.sort"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @change="(e) => store.setSort((e.target as HTMLSelectElement).value)"
              >
                <option value="created_at">جدیدترین</option>
                <option value="price">قیمت</option>
                <option value="name">نام</option>
              </select>
            </div>
          </div>

          <!-- Active Filters -->
          <div v-if="store.hasFiltersApplied" class="mt-6 flex items-center gap-4 max-w-7xl mx-auto">
            <span class="text-sm text-gray-500">فیلترهای فعال:</span>
            <button
              @click="store.resetFilters()"
              class="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              پاک کردن همه فیلترها
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-if="products.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          <div
            v-for="(product, index) in products"
            :key="product.id"
            class="group relative border-b border-r border-gray-100"
            v-motion
            :initial="productCardVariants.initial"
            :enter="getProductDelay(index)"
            :visible="{ once: true } as any"
          >
            <!-- Product Name Header - Always Visible -->
            <div class="p-6 text-right">
              <h3 
                class="text-xl font-bold text-gray-900"
                v-motion
                :initial="{ opacity: 0, x: -20 }"
                :enter="{ opacity: 1, x: 0 }"
                :delay="index * 100 + 200"
              >
                {{ product.name }}
              </h3>
              <div 
                class="mt-2 flex justify-between items-center"
                v-motion
                :initial="{ opacity: 0 }"
                :enter="{ opacity: 1 }"
                :delay="index * 100 + 300"
              >
                <span
                  :class="[
                    'inline-block px-3 py-1 text-sm rounded-full',
                    product.stock > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ product.stock > 0 ? `موجودی: ${product.stock}` : 'ناموجود' }}
                </span>
                <p class="text-lg font-bold text-gray-900">{{ formatPrice(product.price) }}</p>
              </div>
            </div>

            <!-- Product Image and Hover Content -->
            <NuxtLink
              :to="`/products/${product.id}`"
              class="block relative overflow-hidden"
            >
              <div class="relative aspect-[4/5] w-full">
                <!-- Product Images -->
                <div 
                  class="relative w-full h-full"
                  v-motion
                  :initial="imageHoverVariants.initial"
                  :hover="imageHoverVariants.hover"
                >
                  <img
                    v-if="product.media?.length"
                    :src="product.media[currentImageIndexes[product.id] || 0]?.url || product.media[0].url"
                    :alt="product.name"
                    class="h-full w-full object-cover object-center transition-all duration-300"
                  />
                  <div v-else class="h-full w-full bg-gray-200 flex items-center justify-center">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <!-- Navigation Arrows -->
                <div 
                  v-if="product.media?.length > 1" 
                  class="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  v-motion
                  :initial="{ opacity: 0 }"
                  :hover="{ opacity: 1 }"
                >
                  <button 
                    class="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors z-10"
                    @click.prevent="nextImage(product.id, product.media.length)"
                  >
                    <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    class="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors z-10"
                    @click.prevent="prevImage(product.id, product.media.length)"
                  >
                    <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <!-- Hover Info -->
                <div 
                  class="absolute inset-0 bg-white/90 backdrop-blur-sm p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 text-right"
                  v-motion
                  :initial="{ opacity: 0, y: 20 }"
                  :hover="{ opacity: 1, y: 0 }"
                >
                  <div class="flex flex-col gap-3">
                    <p class="text-sm text-gray-600">{{ product.category?.name }}</p>
                    <div class="mt-auto">
                      <p v-if="product.compare_at_price" class="text-sm text-gray-500 line-through mb-1">
                        {{ formatPrice(product.compare_at_price) }}
                      </p>
                      <p class="text-lg font-bold text-blue-600">مشاهده جزئیات محصول</p>
                    </div>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- No Products Found -->
        <div v-else class="bg-white shadow-sm p-12 text-center max-w-7xl mx-auto">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">محصولی یافت نشد</h3>
          <p class="mt-2 text-gray-500">لطفاً فیلترهای خود را تغییر دهید یا دوباره تلاش کنید.</p>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center gap-2">
          <button
            v-for="page in pagination.totalPages"
            :key="page"
            @click="store.setPage(page)"
            :class="[
              'px-4 py-2 rounded-lg transition-colors duration-200',
              pagination.currentPage === page
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            {{ new Intl.NumberFormat('fa-IR').format(page) }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap');

.font-vazir {
  font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif;
}

/* Fix RTL layout issues */
.space-x-reverse > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}

/* Smooth transitions */
.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Prevent image drag */
img {
  user-select: none;
  -webkit-user-drag: none;
}

/* Add smooth image transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Smooth transitions for all animated elements */
.v-motion {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Add a nice shadow effect on hover */
.group:hover {
  z-index: 10;
}
</style> 