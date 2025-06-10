<template>
  <div 
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { duration: 300 } }"
    class="bg-white rounded-3xl shadow-xl p-6"
  >
    <h2 
      v-motion
      :initial="{ y: -20, opacity: 0 }"
      :enter="{ y: 0, opacity: 1, transition: { delay: 100 } }"
      class="text-2xl font-bold mb-6 text-gray-800"
    >
      سبد خرید
    </h2>
    
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div 
        v-motion
        :initial="{ scale: 0 }"
        :enter="{ scale: 1, transition: { type: 'spring', stiffness: 200 } }"
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <div 
      v-else-if="error" 
      v-motion
      :initial="{ y: 20, opacity: 0 }"
      :enter="{ y: 0, opacity: 1 }"
      class="text-red-600 bg-red-50 p-4 rounded-xl mb-4"
    >
      {{ error }}
    </div>

    <div v-else>
      <div 
        v-if="!cart.items?.length" 
        v-motion
        :initial="{ y: 20, opacity: 0 }"
        :enter="{ y: 0, opacity: 1, transition: { delay: 200 } }"
        class="text-center py-8 text-gray-500"
      >
        سبد خرید شما خالی است
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="(item, index) in cart.items" 
          :key="item.id"
          v-motion
          :initial="{ x: -20, opacity: 0 }"
          :enter="{ x: 0, opacity: 1, transition: { delay: 200 + index * 100 } }"
          class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
        >
          <img 
            v-motion
            :initial="{ scale: 0 }"
            :enter="{ scale: 1, transition: { type: 'spring', stiffness: 200, delay: 300 + index * 100 } }"
            :src="getProductImage(item)" 
            :alt="item.product_name" 
            class="w-20 h-20 object-cover rounded-lg"
          >
          <div class="flex-1">
            <h3 
              v-motion
              :initial="{ y: 20, opacity: 0 }"
              :enter="{ y: 0, opacity: 1, transition: { delay: 400 + index * 100 } }"
              class="font-medium text-gray-800"
            >
              {{ item.product_name }}
            </h3>
            <div 
              v-motion
              :initial="{ y: 20, opacity: 0 }"
              :enter="{ y: 0, opacity: 1, transition: { delay: 500 + index * 100 } }"
              class="flex items-center gap-2 mt-1"
            >
              <span class="text-gray-600">{{ formatPrice(item.product_price) }} تومان</span>
              <span class="text-gray-400">×</span>
              <span class="text-gray-600">{{ item.quantity }}</span>
            </div>
            <div 
              v-if="item.discount > 0"
              v-motion
              :initial="{ y: 20, opacity: 0 }"
              :enter="{ y: 0, opacity: 1, transition: { delay: 600 + index * 100 } }"
              class="mt-1"
            >
              <span class="text-green-600">تخفیف: {{ formatPrice(item.discount) }} تومان</span>
              <span class="text-gray-400 mx-2">|</span>
              <span class="text-gray-800">قیمت نهایی: {{ formatPrice(item.final_price) }} تومان</span>
            </div>
          </div>
          <button 
            v-motion
            :initial="{ scale: 0 }"
            :enter="{ scale: 1, transition: { type: 'spring', stiffness: 200, delay: 700 + index * 100 } }"
            :hover="{ scale: 1.1 }"
            :tap="{ scale: 0.9 }"
            @click="removeFromCart(item.product_id)"
            class="text-red-500 hover:text-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <!-- Coupon Section -->
        <div 
          v-motion
          :initial="{ y: 20, opacity: 0 }"
          :enter="{ y: 0, opacity: 1, transition: { delay: 800 } }"
          class="border-t pt-4 mt-4"
        >
          <div v-if="cart.coupon" class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-green-600">کد تخفیف:</span>
              <span class="font-medium">{{ cart.coupon.code }}</span>
            </div>
            <button 
              v-motion
              :hover="{ scale: 1.05 }"
              :tap="{ scale: 0.95 }"
              @click="removeCoupon"
              class="text-red-500 hover:text-red-600 transition-colors text-sm"
            >
              حذف کد تخفیف
            </button>
          </div>
          <div v-else class="flex gap-2">
            <input
              v-motion
              :initial="{ x: -20, opacity: 0 }"
              :enter="{ x: 0, opacity: 1, transition: { delay: 900 } }"
              v-model="couponCode"
              type="text"
              placeholder="کد تخفیف"
              class="flex-1 border-2 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="applyingCoupon"
            />
            <button
              v-motion
              :initial="{ x: 20, opacity: 0 }"
              :enter="{ x: 0, opacity: 1, transition: { delay: 1000 } }"
              :hover="{ scale: 1.05 }"
              :tap="{ scale: 0.95 }"
              @click="handleApplyCoupon"
              class="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] flex items-center justify-center"
              :disabled="!couponCode || applyingCoupon"
            >
              <span v-if="applyingCoupon" class="animate-spin mr-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </span>
              <span v-else>اعمال</span>
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div 
          v-motion
          :initial="{ y: 20, opacity: 0 }"
          :enter="{ y: 0, opacity: 1, transition: { delay: 1100 } }"
          class="border-t pt-4 mt-4 space-y-2"
        >
          <div class="flex justify-between text-gray-600">
            <span>جمع کل:</span>
            <span>{{ formatPrice(cart.subtotal) }} تومان</span>
          </div>
          <div 
            v-if="cart.discount > 0" 
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { delay: 1200 } }"
            class="flex justify-between text-green-600"
          >
            <span>تخفیف:</span>
            <span>{{ formatPrice(cart.discount) }} تومان</span>
          </div>
          <div 
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { delay: 1300 } }"
            class="flex justify-between text-lg font-bold text-gray-800"
          >
            <span>مبلغ قابل پرداخت:</span>
            <span>{{ formatPrice(cart.total) }} تومان</span>
          </div>
        </div>

        <!-- Checkout Button -->
        <button
          v-motion
          :initial="{ y: 20, opacity: 0 }"
          :enter="{ y: 0, opacity: 1, transition: { delay: 1400 } }"
          :hover="{ scale: 1.02 }"
          :tap="{ scale: 0.98 }"
          @click="handleCheckout"
          class="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl mt-6"
          :disabled="loading"
        >
          ادامه فرآیند خرید
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCart } from '~/services/cart'
import { useRouter } from 'vue-router'

const router = useRouter()
const { cart, loading, error, fetchCart, removeFromCart, applyCoupon, removeCoupon } = useCart()
const couponCode = ref('')
const applyingCoupon = ref(false)

onMounted(() => {
  fetchCart()
})

const handleApplyCoupon = async () => {
  if (!couponCode.value) return
  applyingCoupon.value = true
  try {
    await applyCoupon(couponCode.value)
    couponCode.value = ''
  } finally {
    applyingCoupon.value = false
  }
}

const handleCheckout = () => {
  router.push('/checkout')
}

const formatPrice = (price: number | undefined) => {
  if (price === undefined || price === null) return '0'
  return price.toLocaleString('fa-IR')
}

const getProductImage = (item: any) => {
  if (item.product?.media?.length > 0) {
    return item.product.media[0].original_url
  }
  return '/images/placeholder.jpg'
}
</script> 