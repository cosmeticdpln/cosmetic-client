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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-vazir">
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
      <!-- Filters and Search -->
      <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <input
            v-model="filters.search"
            type="text"
            placeholder="جستجوی محصولات..."
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="store.setSearch($event.target.value)"
          />
        </div>

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

      <!-- Active Filters -->
      <div v-if="store.hasFiltersApplied" class="mb-6 flex items-center gap-4">
        <span class="text-sm text-gray-500">فیلترهای فعال:</span>
        <button
          @click="store.resetFilters()"
          class="text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
        >
          پاک کردن همه فیلترها
        </button>
      </div>

      <!-- Products Grid -->
      <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="product in products"
          :key="product.id"
          :to="`/products/${product.id}`"
          class="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200"
        >
          <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
            <img
              v-if="product.media?.length"
              :src="product.media[0].url"
              :alt="product.name"
              class="h-full w-full object-cover object-center group-hover:opacity-75"
            />
          </div>
          <div class="p-4">
            <h3 class="text-lg font-medium text-gray-900 mb-1">{{ product.name }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ product.category?.name }}</p>
            <div class="flex justify-between items-center">
              <p class="text-lg font-bold text-blue-600">{{ formatPrice(product.price) }}</p>
              <p v-if="product.compare_at_price" class="text-sm text-gray-500 line-through">
                {{ formatPrice(product.compare_at_price) }}
              </p>
            </div>
            <div class="mt-2 flex items-center space-x-2 space-x-reverse">
              <span v-if="product.stock > 0" class="text-sm text-green-600">موجود</span>
              <span v-else class="text-sm text-red-600">ناموجود</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- No Products Found -->
      <div v-else class="flex justify-center items-center min-h-[200px] bg-gray-50 rounded-lg">
        <p class="text-gray-500">محصولی یافت نشد</p>
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
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ new Intl.NumberFormat('fa-IR').format(page) }}
        </button>
      </div>
    </template>
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