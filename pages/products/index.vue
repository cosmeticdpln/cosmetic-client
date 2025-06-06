<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useHead } from '#imports'
import { useProductStore } from '~/stores/product'
import { storeToRefs } from 'pinia'
import { useMotion } from '@vueuse/motion'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

const store = useProductStore()
const isFilterOpen = ref(false)
const tempFilters = ref({
  search: '',
  category: null as number | null,
  sort: 'created_at'
})

// Use storeToRefs to maintain reactivity
const { 
  products, 
  categories, 
  loading, 
  error,
  filters,
  pagination,
} = storeToRefs(store)

// Define motion variants
const motionVariants = {
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
  visible: {
    once: true
  }
}

// Function to create staggered delay for products
const getProductDelay = (index: number) => ({
  initial: motionVariants.initial,
  enter: {
    ...motionVariants.enter,
    transition: {
      duration: 600,
      delay: index * 100,
    },
  },
  visible: motionVariants.visible
})

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

// Initialize tempFilters with current store filters
onMounted(() => {
  tempFilters.value = {
    search: filters.value.search,
    category: filters.value.category,
    sort: filters.value.sort
  }
  store.fetchProducts()
  store.fetchCategories()
})

// Watch for filter panel open/close
watch(isFilterOpen, (newValue) => {
  if (newValue) {
    // When opening, sync with current store filters
    tempFilters.value = {
      search: filters.value.search,
      category: filters.value.category,
      sort: filters.value.sort
    }
  }
})

// Function to apply filters
const applyFilters = () => {
  console.log('Applying filters:', tempFilters.value)
  store.setFilters({
    search: tempFilters.value.search,
    category: tempFilters.value.category,
    sort: tempFilters.value.sort
  })
  isFilterOpen.value = false
}

// Reset filters
const resetAllFilters = () => {
  tempFilters.value = {
    search: '',
    category: null,
    sort: 'created_at'
  }
  store.resetFilters()
  isFilterOpen.value = false
}

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
  <div class="min-h-screen bg-gray-50 font-vazir">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <p class="text-xl mb-2">{{ error }}</p>
          <button 
            @click="store.fetchProducts()"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>

      <template v-else>
        <!-- Filter Toggle Button -->
        <button
          @click="isFilterOpen = !isFilterOpen"
          class="w-full mb-4 flex items-center justify-between px-6 py-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          :initial="{ opacity: 0, y: -20 }"
          :enter="{ opacity: 1, y: 0 }"
          :delay="200"
        >
          <span class="text-lg font-medium text-gray-900">فیلترها</span>
          <svg
            class="w-5 h-5 transform transition-transform duration-300"
            :class="{ 'rotate-180': isFilterOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Filters Panel -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div v-show="isFilterOpen" class="mb-8">
            <div class="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <!-- Search Filter -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">جستجو در محصولات</label>
                <div class="relative">
                  <input
                    v-model="tempFilters.search"
                    type="text"
                    placeholder="نام محصول را وارد کنید..."
                    class="w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                  <svg
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <!-- Categories Filter -->
              <Disclosure v-slot="{ open }" defaultOpen>
                <DisclosureButton class="flex w-full justify-between items-center text-right">
                  <span class="text-sm font-medium text-gray-700">دسته‌بندی‌ها</span>
                  <svg
                    class="w-5 h-5 transform transition-transform duration-300"
                    :class="{ 'rotate-180': open }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </DisclosureButton>

                <DisclosurePanel class="mt-4">
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <button
                      v-for="category in categories"
                      :key="category.id"
                      @click="tempFilters.category = category.id"
                      class="px-4 py-2 rounded-lg text-sm transition-all duration-300"
                      :class="[
                        tempFilters.category === category.id
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      ]"
                    >
                      {{ category.name }}
                    </button>
                  </div>
                </DisclosurePanel>
              </Disclosure>

              <!-- Sort Filter -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">مرتب‌سازی</label>
                <select
                  v-model="tempFilters.sort"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="created_at">جدیدترین</option>
                  <option value="price">قیمت</option>
                  <option value="name">نام</option>
                </select>
              </div>

              <!-- Filter Actions -->
              <div class="flex items-center justify-between pt-4 border-t">
                <button
                  @click="resetAllFilters"
                  class="text-sm text-red-600 hover:text-red-800 transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  پاک کردن فیلترها
                </button>

                <button
                  @click="() => {
                    applyFilters();
                    isFilterOpen = false;
                  }"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  اعمال فیلترها
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Products Grid -->
        <div v-if="products.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(product, index) in products"
            :key="product.id"
            class="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            :initial="motionVariants.initial"
            :enter="getProductDelay(index)"
            :visible="motionVariants.visible"
          >
            <!-- Product Image Container -->
            <div class="relative">
              <!-- Product Link -->
              <NuxtLink
                :to="`/products/${product.id}`"
                class="block relative overflow-hidden cursor-pointer"
              >
                <Transition
                  mode="out-in"
                  enter-active-class="transition-opacity duration-300"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition-opacity duration-300"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <div class="relative aspect-[4/5] w-full">
                    <img
                      v-if="product.media?.length"
                      :key="currentImageIndexes[product.id] || 0"
                      :src="product.media[currentImageIndexes[product.id] || 0]?.url || product.media[0].url"
                      :alt="product.name"
                      class="h-full w-full object-cover object-center"
                    />
                    <div v-else class="h-full w-full bg-gray-200 flex items-center justify-center">
                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </Transition>
              </NuxtLink>

              <!-- Image Navigation Overlay -->
              <div
                v-if="product.media?.length > 1"
                class="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <!-- Previous Button -->
                <button
                  @click.stop="prevImage(product.id, product.media.length)"
                  class="z-20 p-2 mx-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg transform hover:scale-105 hover:bg-blue-50"
                >
                  <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <!-- Next Button -->
                <button
                  @click.stop="nextImage(product.id, product.media.length)"
                  class="z-20 p-2 mx-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg transform hover:scale-105 hover:bg-blue-50"
                >
                  <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <!-- Image Counter -->
                <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-20">
                  {{ (currentImageIndexes[product.id] || 0) + 1 }} / {{ product.media.length }}
                </div>
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-4">
              <h3 class="text-lg font-bold text-gray-900">{{ product.name }}</h3>
              <div class="mt-2 flex justify-between items-center">
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
          </div>
        </div>

        <!-- No Products Found -->
        <div
          v-else
          class="bg-white shadow-sm p-12 text-center rounded-lg"
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1 }"
        >
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">محصولی یافت نشد</h3>
          <p class="mt-2 text-gray-500">لطفاً فیلترهای خود را تغییر دهید یا دوباره تلاش کنید.</p>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination.totalPages > 1"
          class="mt-8 flex justify-center gap-2"
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0 }"
          :delay="500"
        >
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

/* Add hover effects */
.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.02);
}
</style> 