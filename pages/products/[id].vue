<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHead, useRoute } from '#imports'
import { useProductStore } from '~/stores/product'
import { useMotion } from '@vueuse/motion'
import AddToCartButton from '~/components/AddToCartButton.vue'
import LoginModal from '~/components/LoginModal.vue'

const route = useRoute()
const store = useProductStore()

const selectedImage = ref(0)
const isHovering = ref(false)
const zoomFactor = 2.5
const isLoaded = ref(false)

const mainImageUrl = computed(() => {
  if (!store.currentProduct?.media?.length) return ''
  return store.currentProduct.media[selectedImage.value]?.url || ''
})

const leftColumn = ref(null)
const rightColumn = ref(null)
const mainImageRef = ref(null)
const thumbnails = ref(null)
const titleSection = ref(null)
const specsSection = ref(null)

const { apply: applyLeftColumn } = useMotion(leftColumn, {
  initial: { x: -50, opacity: 0 },
  enter: { x: 0, opacity: 1, transition: { duration: 500 } }
})

const { apply: applyRightColumn } = useMotion(rightColumn, {
  initial: { x: 50, opacity: 0 },
  enter: { x: 0, opacity: 1, transition: { duration: 500 } }
})

const { apply: applyMainImage } = useMotion(mainImageRef, {
  initial: { scale: 0.95, opacity: 0 },
  enter: { scale: 1, opacity: 1, transition: { duration: 400, delay: 200 } }
})

const { apply: applyThumbnails } = useMotion(thumbnails, {
  initial: { y: 20, opacity: 0 },
  enter: { y: 0, opacity: 1, transition: { duration: 400, delay: 400 } }
})

const { apply: applyTitleSection } = useMotion(titleSection, {
  initial: { y: -20, opacity: 0 },
  enter: { y: 0, opacity: 1, transition: { duration: 400, delay: 200 } }
})

const { apply: applySpecsSection } = useMotion(specsSection, {
  initial: { y: 20, opacity: 0 },
  enter: { y: 0, opacity: 1, transition: { duration: 400, delay: 300 } }
})

const zoomBoxVisible = ref(false)
const zoomPosition = ref({ x: 0, y: 0 })
const lensPosition = ref({ x: 0, y: 0 })
const lensSize = 150

const handleMouseMove = (e: MouseEvent) => {
  const image = e.target as HTMLElement
  const rect = image.getBoundingClientRect()
  
  // Calculate mouse position relative to the image (RTL-aware)
  const mouseX = rect.width - (e.clientX - rect.left)
  const mouseY = e.clientY - rect.top
  
  // Calculate lens position (centered on mouse)
  const lensX = mouseX - lensSize / 2
  const lensY = mouseY - lensSize / 2
  
  // Constrain lens position within image bounds
  const maxX = rect.width - lensSize
  const maxY = rect.height - lensSize
  const boundedX = Math.max(0, Math.min(maxX, lensX))
  const boundedY = Math.max(0, Math.min(maxY, lensY))
  
  // Update lens position
  lensPosition.value = {
    x: boundedX,
    y: boundedY
  }
  
  // Calculate zoom position (percentage)
  const zoomX = (boundedX / maxX) * 100
  const zoomY = (boundedY / maxY) * 100
  
  // Update zoom position
  zoomPosition.value = {
    x: zoomX,
    y: zoomY
  }
}

const zoomBackgroundStyle = computed(() => {
  if (!mainImageUrl.value) return {}
  return {
    backgroundImage: `url(${mainImageUrl.value})`,
    backgroundPosition: `${zoomPosition.value.x}% ${zoomPosition.value.y}%`,
    backgroundSize: `${zoomFactor * 100}%`,
    backgroundRepeat: 'no-repeat',
    transition: 'background-position 0.05s ease-out'
  }
})

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
  
  // Set loaded state after a short delay
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})

onUnmounted(() => {
  // Remove the scroll event listener
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
    <div v-if="store.currentProduct" class="flex flex-col lg:flex-row gap-8 justify-between items-start w-full">
      <!-- Column 1: Product Images (50% width) -->
      <div 
        v-motion
        :initial="{ x: -50, opacity: 0 }"
        :enter="{ x: 0, opacity: 1, transition: { duration: 500 } }"
        class="w-full lg:w-1/2"
      >
        <div class="space-y-6">
          <!-- Main Image -->
          <div
            v-motion
            :initial="{ scale: 0.95, opacity: 0 }"
            :enter="{ scale: 1, opacity: 1, transition: { duration: 400, delay: 200 } }"
            class="relative aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100"
            @mousemove="handleMouseMove"
            @mouseenter="isHovering = true; zoomBoxVisible = true"
            @mouseleave="isHovering = false; zoomBoxVisible = false"
          >
            <img
              :src="mainImageUrl"
              :alt="store.currentProduct.name"
              class="h-full w-full object-cover object-center"
              draggable="false"
            />
            <!-- Lens -->
            <div
              v-show="isHovering"
              class="absolute bg-white/30 border-2 border-blue-400 backdrop-blur-sm pointer-events-none"
              :style="{
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
          <div 
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { duration: 400, delay: 400 } }"
            class="grid grid-cols-4 gap-4"
          >
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

      <!-- Column 2: Product Info and Shopping Cart (50% width) -->
      <div 
        v-motion
        :initial="{ x: 50, opacity: 0 }"
        :enter="{ x: 0, opacity: 1, transition: { duration: 500 } }"
        class="w-full lg:w-1/2"
      >
        <div class="space-y-6">
          <!-- Title Section -->
          <div 
            v-motion
            :initial="{ y: -20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { duration: 400, delay: 200 } }"
            class="border-b border-gray-200 pb-6"
          >
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ store.currentProduct.name }}</h1>
            <p class="text-lg text-gray-500">{{ store.currentProduct.category.name }}</p>
          </div>

          <!-- Specifications Section -->
          <div 
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { duration: 400, delay: 300 } }"
            class="mt-8"
          >
            <h2 class="text-xl font-semibold mb-4">مشخصات محصول</h2>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="(spec, index) in store.currentProduct.specifications" :key="index" 
                   class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500 mb-1">{{ spec.specification_type?.name || spec.specification_type }}</div>
                <div class="font-medium">
                  {{ Array.isArray(spec.value) ? spec.value.join('، ') : spec.value }}
                </div>
                <div v-if="spec.specification_type?.group" class="text-xs text-gray-400 mt-1">
                  {{ spec.specification_type.group.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- Shopping Cart Section -->
          <div class="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">قیمت:</span>
                <span class="text-2xl font-bold text-gray-900">{{ formatPrice(store.currentProduct.price) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">موجودی:</span>
                <span class="text-lg font-semibold" :class="store.currentProduct.stock > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ store.currentProduct.stock > 0 ? 'موجود' : 'ناموجود' }}
                </span>
              </div>
              <AddToCartButton 
                :product-id="store.currentProduct.id"
                @show-login="showLogin = true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Description and Card Components -->
    <div class="mt-12">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Description Content -->
        <div class="lg:w-2/3">
          <div class="prose max-w-none" v-html="store.currentProduct?.description"></div>
        </div>
        
        <!-- Sticky Shopping Cart -->
        <div v-if="store.currentProduct" class="lg:w-1/3">
          <div class="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">قیمت:</span>
                <span class="text-2xl font-bold text-gray-900">{{ formatPrice(store.currentProduct.price) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">موجودی:</span>
                <span class="text-lg font-semibold" :class="store.currentProduct.stock > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ store.currentProduct.stock > 0 ? 'موجود' : 'ناموجود' }}
                </span>
              </div>
              <AddToCartButton 
                :product-id="store.currentProduct.id"
                @show-login="showLogin = true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <LoginModal v-if="showLogin" @close="showLogin = false" @login-success="handleLoginSuccess" />
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

/* Improve lens and zoom box styles */
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

/* Ensure smooth transitions for zoom box */
.fixed {
  position: fixed;
  transition: all 0.3s ease;
}

/* Improve image container */
.aspect-w-1 {
  position: relative;
  overflow: hidden;
}

/* Ensure lens stays within bounds */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Sticky cart styles */
.sticky {
  position: sticky;
  top: 1rem;
  z-index: 10;
  transition: all 0.3s ease;
}

@media (min-width: 1024px) {
  .sticky {
    top: 2rem;
  }
}

/* Add transition utilities */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-500 {
  transition-duration: 500ms;
}

/* Add transform utilities */
.translate-x-0 {
  transform: translateX(0);
}

.translate-x-8 {
  transform: translateX(2rem);
}

.-translate-x-8 {
  transform: translateX(-2rem);
}

.translate-y-0 {
  transform: translateY(0);
}

.translate-y-8 {
  transform: translateY(2rem);
}

.-translate-y-8 {
  transform: translateY(-2rem);
}

.scale-100 {
  transform: scale(1);
}

.scale-95 {
  transform: scale(0.95);
}
</style>
