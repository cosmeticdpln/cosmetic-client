<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHead, useRoute } from '#imports'
import { useProductStore } from '~/stores/product'
import AddToCartButton from '~/components/AddToCartButton.vue'
import LoginModal from '~/components/LoginModal.vue'

const route = useRoute()
const store = useProductStore()

const selectedImage = ref(0)
const isHovering = ref(false)
const zoomFactor = 2.5

const mainImage = computed(() => {
  if (!store.currentProduct?.media?.length) return ''
  return store.currentProduct.media[selectedImage.value]?.url || ''
})

const zoomBoxVisible = ref(false)
const zoomPosition = ref({ x: 0, y: 0 })
const lensPosition = ref({ x: 0, y: 0 })
const lensSize = 150

const handleMouseMove = (e: MouseEvent) => {
  const image = e.target as HTMLElement
  const rect = image.getBoundingClientRect()
  const mouseX = rect.width - (e.clientX - rect.left)
  const mouseY = e.clientY - rect.top
  const maxX = rect.width - lensSize
  const maxY = rect.height - lensSize
  const boundedX = Math.max(0, Math.min(maxX, mouseX - lensSize / 2))
  const boundedY = Math.max(0, Math.min(maxY, mouseY - lensSize / 2))
  lensPosition.value = {x: boundedX, y: boundedY}
  const zoomX = ((rect.width - mouseX) / rect.width) * 100
  const zoomY = (mouseY / rect.height) * 100
  zoomPosition.value = {
    x: Math.max(0, Math.min(100, zoomX)),
    y: Math.max(0, Math.min(100, zoomY))
  }
}

const zoomBackgroundStyle = computed(() => {
  if (!mainImage.value) return {}
  return {
    backgroundImage: `url(${mainImage.value})`,
    backgroundPosition: `${zoomPosition.value.x}% ${zoomPosition.value.y}%`,
    backgroundSize: '250%',
    backgroundRepeat: 'no-repeat',
    transition: 'background-position 0.05s ease-out'
  }
})

// Add scroll handling for shopping cart
const handleScroll = () => {
  const cart = document.getElementById('shopping-cart')
  if (!cart) return

  const cartRect = cart.getBoundingClientRect()
  const shouldStick = window.scrollY > cartRect.top

  if (shouldStick) {
    cart.classList.add('sticky')
  } else {
    cart.classList.remove('sticky')
  }
}

onMounted(async () => {
  await store.fetchProduct(route.params.id as string)
  // Map type to specification_type for compatibility
  if (store.currentProduct && Array.isArray(store.currentProduct.specifications)) {
    store.currentProduct.specifications = store.currentProduct.specifications.map(spec => {
      const s = spec as any
      if (s.type && !s.specification_type) {
        s.specification_type = s.type
      }
      return s
    })
  }
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const formatPrice = (price: string) => {
  return new Intl.NumberFormat('fa-IR').format(parseInt(price)) + ' تومان'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fa-IR')
}

useHead(() => {
  const name = store.currentProduct?.name || 'جزئیات محصول'
  const description = store.currentProduct?.description?.replace(/<[^>]*>/g, '') || 'توضیحات محصول'
  const image = store.currentProduct?.media?.[0]?.url || '/default.jpg'
  const price = store.currentProduct?.price || ''
  const url = `http://localhost/products/${route.params.id}`
  const stock = store.currentProduct?.stock ?? 0

  return {
    title: name,
    htmlAttrs: { dir: 'rtl', lang: 'fa' },
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: name },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:type', content: 'product' },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: name },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'robots', content: 'index, follow' }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name,
          image: [image],
          description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'IRR',
            price: price,
            availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url
          }
        })
      }
    ],
    __dangerouslyDisableSanitizersByTagID: {
      'ld-product': ['innerHTML']
    }
  }
})

const isHome = computed(() => route.path === '/')
const isScrolled = ref(false)
const showLogin = ref(false)
const userName = ref('')

function handleLoginSuccess(data: any) {
  if (data && data.access_token) {
    localStorage.setItem('access_token', data.access_token)
    if (data.user && data.user.name) {
      localStorage.setItem('user_name', data.user.name)
      userName.value = data.user.name
    }
    showLogin.value = false
  }
}

</script>

<template>
  <div class="w-[80vw] max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-vazir">
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
        class="fixed top-10 left-10 w-[700px] h-[700px] border-2 border-blue-500 z-50 rounded shadow-lg hidden md:block overflow-hidden"
        :style="zoomBackgroundStyle"
    ></div>

    <!-- Product Content -->
    <div v-if="store.currentProduct" class="flex flex-col lg:flex-row gap-0 justify-between items-stretch w-full">
      <!-- Column 1: Product Images -->
      <div class="w-full lg:w-[35%] min-w-[300px]">
        <div class="space-y-6">
          <!-- Main Image -->
          <div
            class="relative aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100"
            @mousemove="handleMouseMove"
            @mouseenter="isHovering = true; zoomBoxVisible = true"
            @mouseleave="isHovering = false; zoomBoxVisible = false"
          >
            <img
              :src="mainImage"
              :alt="store.currentProduct.name"
              class="h-full w-full object-cover object-center"
              draggable="false"
            />
            <!-- Lens -->
            <div
                v-show="isHovering"
                class="absolute bg-white/30 border-2 border-blue-400 backdrop-blur-sm pointer-events-none"
                :style="{
                  position: 'absolute',
                  width: `${lensSize}px`,
                  height: `${lensSize}px`,
                  right: `${lensPosition.x}px`,
                  top: `${lensPosition.y}px`,
                  borderRadius: '0.5rem',
                  zIndex: 10
                }"
            ></div>
          </div>

          <!-- Thumbnail Images -->
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
      </div>

      <!-- Column 2: Shopping Cart -->
      <div class="w-full lg:w-[20%] min-w-[220px] max-w-[320px]">
        <div class="space-y-6">
          <!-- Title Section -->
          <div class="border-b border-gray-200 pb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ store.currentProduct.name }}</h1>
            <p class="text-lg text-gray-500">{{ store.currentProduct.category.name }}</p>
          </div>

          <!-- Shopping Cart Section -->
          <div id="shopping-cart" class="bg-white rounded-lg shadow-sm p-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">قیمت:</span>
                <span class="text-lg font-bold text-gray-900">{{ formatPrice(store.currentProduct.price) }}</span>
              </div>
              <div v-if="store.currentProduct.compare_at_price" class="flex justify-between items-center">
                <span class="text-gray-600">قیمت قبلی:</span>
                <span class="text-gray-500 line-through">{{ formatPrice(store.currentProduct.compare_at_price) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">وضعیت:</span>
                <span :class="(store.currentProduct?.stock ?? 0) > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ (store.currentProduct?.stock ?? 0) > 0 ? 'موجود' : 'ناموجود' }}
                </span>
              </div>
              <AddToCartButton
                  :product-id="store.currentProduct.id"
                  class="w-full"
                  @show-login="showLogin = true"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Column 3: Product Specifications -->
      <div class="w-full lg:w-[35%] min-w-[300px]">
        <div class="space-y-6">
          <div v-if="store.currentProduct.specifications?.length" class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">مشخصات محصول</h2>
            <div class="space-y-4">
              <div v-for="spec in store.currentProduct.specifications" :key="spec.id" class="bg-gray-50 rounded-lg p-4">
                <div v-if="spec.specification_type && spec.specification_type.group" class="font-medium text-gray-900 mb-2">
                  {{ spec.specification_type.group.name }}
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ spec.specification_type?.name || '---' }}:</span>
                  <span class="text-gray-900">
                    {{ Array.isArray(spec.value) ? spec.value.join('، ') : spec.value }}
                  </span>
                </div>
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

    <!-- ✅ Sticky Cart in Description Section -->
    <div v-if="store.currentProduct?.description" class="mt-12 bg-white rounded-lg shadow-sm p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">توضیحات محصول</h2>
        <div class="prose prose-blue max-w-none" v-html="store.currentProduct.description"></div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-8 bg-white shadow-lg p-6 rounded-lg">
          <h2 class="text-lg font-bold mb-4 text-gray-800">سبد خرید</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">قیمت:</span>
              <span class="text-lg font-bold text-gray-900">{{ formatPrice(store.currentProduct.price) }}</span>
            </div>
            <div v-if="store.currentProduct.compare_at_price" class="flex justify-between items-center">
              <span class="text-gray-600">قیمت قبلی:</span>
              <span class="text-gray-500 line-through">{{ formatPrice(store.currentProduct.compare_at_price) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">وضعیت:</span>
              <span :class="(store.currentProduct?.stock ?? 0) > 0 ? 'text-green-600' : 'text-red-600'">
                {{ (store.currentProduct?.stock ?? 0) > 0 ? 'موجود' : 'ناموجود' }}
              </span>
            </div>
            <AddToCartButton
                :product-id="store.currentProduct.id"
                class="w-full"
                @show-login="showLogin = true"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-if="!store.loading && !store.error && !store.currentProduct" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center text-gray-600">
        <p class="text-xl mb-2">محصول یافت نشد</p>
        <NuxtLink to="/products" class="text-blue-600 hover:underline">
          بازگشت به لیست محصولات
        </NuxtLink>
      </div>
    </div>

    <LoginModal v-if="showLogin" @close="showLogin = false" @success="handleLoginSuccess" />
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
  user-select: none;
  -webkit-user-drag: none;
}

/* Improve lens movement */
.pointer-events-none {
  pointer-events: none;
  user-select: none;
}

.relative {
  position: relative;
  z-index: 1;
}

.absolute {
  position: absolute;
}
</style>
