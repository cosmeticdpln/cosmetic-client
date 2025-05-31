<script setup lang="ts">
import { onMounted } from 'vue'
import { useHead } from '#imports'
import { useProductStore } from '~/stores/product'
import { storeToRefs } from 'pinia'

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

const formatPrice = (price: string) => {
  return new Intl.NumberFormat('fa-IR').format(parseInt(price)) + ' تومان'
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
  <div class="bg-gray-50 min-h-screen py-12 font-vazir">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="text-center mb-12">
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
        <div class="mb-8 bg-white rounded-xl shadow-sm p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
              <input
                v-model="filters.search"
                type="text"
                placeholder="نام محصول را وارد کنید..."
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @input="store.setSearch($event.target.value)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">دسته‌بندی</label>
              <select
                v-model="filters.category"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @change="store.setCategory($event.target.value ? Number($event.target.value) : null)"
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
                @change="store.setSort($event.target.value)"
              >
                <option value="created_at">جدیدترین</option>
                <option value="price">قیمت</option>
                <option value="name">نام</option>
              </select>
            </div>
          </div>

          <!-- Active Filters -->
          <div v-if="store.hasFiltersApplied" class="mt-6 flex items-center gap-4">
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
        <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="product in products"
            :key="product.id"
            :to="`/products/${product.id}`"
            class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden">
              <img
                v-if="product.media?.length"
                :src="product.media[0].url"
                :alt="product.name"
                class="h-full w-full object-cover object-center group-hover:opacity-75"
              />
              <div v-else class="h-full w-full bg-gray-200 flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-lg font-medium text-gray-900">{{ product.name }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ product.category?.name }}</p>
              <div class="mt-3 flex justify-between items-center">
                <p class="text-lg font-bold text-blue-600">{{ formatPrice(product.price) }}</p>
                <p v-if="product.compare_at_price" class="text-sm text-gray-500 line-through">
                  {{ formatPrice(product.compare_at_price) }}
                </p>
              </div>
              <div class="mt-2 flex items-center space-x-2 space-x-reverse">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    product.stock > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ product.stock > 0 ? 'موجود' : 'ناموجود' }}
                </span>
                <span v-if="product.tags?.length" class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {{ product.tags[0] }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- No Products Found -->
        <div v-else class="bg-white rounded-xl shadow-sm p-12 text-center">
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
</style> 