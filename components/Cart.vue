<template>
  <div class="bg-white rounded-3xl shadow-xl p-6">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">سبد خرید</h2>
    
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="text-red-600 bg-red-50 p-4 rounded-xl mb-4">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="!cart.items?.length" class="text-center py-8 text-gray-500">
        سبد خرید شما خالی است
      </div>

      <div v-else class="space-y-4">
        <div v-for="item in cart.items" :key="item.id" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <img :src="getProductImage(item)" :alt="item.product_name" class="w-20 h-20 object-cover rounded-lg">
          <div class="flex-1">
            <h3 class="font-medium text-gray-800">{{ item.product_name }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-gray-600">{{ formatPrice(item.product_price) }} تومان</span>
              <span class="text-gray-400">×</span>
              <span class="text-gray-600">{{ item.quantity }}</span>
            </div>
          </div>
          <button 
            @click="removeFromCart(item.product_id)"
            class="text-red-500 hover:text-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <!-- Coupon Section -->
        <div class="border-t pt-4 mt-4">
          <div v-if="cart.coupon" class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-green-600">کد تخفیف:</span>
              <span class="font-medium">{{ cart.coupon.code }}</span>
            </div>
            <button 
              @click="removeCoupon"
              class="text-red-500 hover:text-red-600 transition-colors text-sm"
            >
              حذف کد تخفیف
            </button>
          </div>
          <div v-else class="flex gap-2">
            <input
              v-model="couponCode"
              type="text"
              placeholder="کد تخفیف"
              class="flex-1 border-2 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              @click="handleApplyCoupon"
              class="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              :disabled="!couponCode"
            >
              اعمال
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div class="border-t pt-4 mt-4 space-y-2">
          <div class="flex justify-between text-gray-600">
            <span>جمع کل:</span>
            <span>{{ formatPrice(cart.subtotal) }} تومان</span>
          </div>
          <div v-if="cart.discount > 0" class="flex justify-between text-green-600">
            <span>تخفیف:</span>
            <span>{{ formatPrice(cart.discount) }} تومان</span>
          </div>
          <div class="flex justify-between text-lg font-bold text-gray-800">
            <span>مبلغ قابل پرداخت:</span>
            <span>{{ formatPrice(cart.total) }} تومان</span>
          </div>
        </div>

        <!-- Checkout Button -->
        <button
          @click="handleCheckout"
          class="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
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

onMounted(() => {
  fetchCart()
})

const handleApplyCoupon = async () => {
  if (!couponCode.value) return
  await applyCoupon(couponCode.value)
  couponCode.value = ''
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