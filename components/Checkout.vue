<template>
  <div class="bg-white rounded-3xl shadow-xl p-6">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">تکمیل خرید</h2>
    
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="text-red-600 bg-red-50 p-4 rounded-xl mb-4">
      {{ error }}
    </div>

    <div v-else class="space-y-6">
      <!-- Order Summary -->
      <div class="bg-gray-50 rounded-xl p-4">
        <h3 class="font-bold text-gray-800 mb-4">خلاصه سفارش</h3>
        <div class="space-y-2">
          <div v-for="item in orderPreview.items" :key="item.id" class="flex justify-between text-gray-600">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>{{ item.price.toLocaleString() }} تومان</span>
          </div>
          <div class="border-t pt-2 mt-2">
            <div class="flex justify-between text-gray-600">
              <span>جمع کل:</span>
              <span>{{ orderPreview.total.toLocaleString() }} تومان</span>
            </div>
            <div v-if="orderPreview.discount > 0" class="flex justify-between text-green-600">
              <span>تخفیف:</span>
              <span>{{ orderPreview.discount.toLocaleString() }} تومان</span>
            </div>
            <div class="flex justify-between text-lg font-bold text-gray-800 mt-2">
              <span>مبلغ قابل پرداخت:</span>
              <span>{{ orderPreview.finalTotal.toLocaleString() }} تومان</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Shipping Information -->
      <div>
        <h3 class="font-bold text-gray-800 mb-4">اطلاعات ارسال</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">آدرس</label>
            <textarea
              v-model="shippingAddress"
              rows="3"
              class="w-full border-2 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="آدرس کامل خود را وارد کنید"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">کد پستی</label>
            <input
              v-model="postalCode"
              type="text"
              class="w-full border-2 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="کد پستی ۱۰ رقمی"
              maxlength="10"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">شماره تماس</label>
            <input
              v-model="phone"
              type="text"
              class="w-full border-2 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="شماره موبایل"
              maxlength="11"
            />
          </div>
        </div>
      </div>

      <!-- Payment Method -->
      <div>
        <h3 class="font-bold text-gray-800 mb-4">روش پرداخت</h3>
        <div class="space-y-2">
          <label class="flex items-center gap-2 p-4 border-2 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
            <input type="radio" v-model="paymentMethod" value="online" class="w-4 h-4 text-blue-600">
            <span>پرداخت آنلاین</span>
          </label>
          <label class="flex items-center gap-2 p-4 border-2 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
            <input type="radio" v-model="paymentMethod" value="cash" class="w-4 h-4 text-blue-600">
            <span>پرداخت در محل</span>
          </label>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        @click="submitOrder"
        class="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        :disabled="loading || !isFormValid"
      >
        ثبت سفارش
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const orderPreview = ref<any>(null)

const shippingAddress = ref('')
const postalCode = ref('')
const phone = ref('')
const paymentMethod = ref('online')

const isFormValid = computed(() => {
  return shippingAddress.value.trim() &&
         postalCode.value.length === 10 &&
         phone.value.length === 11 &&
         paymentMethod.value
})

async function fetchOrderPreview() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch('http://localhost:8000/api/v1/orders/preview', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch order preview')
    orderPreview.value = await response.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function submitOrder() {
  if (!isFormValid.value) return
  
  loading.value = true
  error.value = ''
  try {
    const response = await fetch('http://localhost:8000/api/v1/orders/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        shipping_address: shippingAddress.value,
        postal_code: postalCode.value,
        phone: phone.value,
        payment_method: paymentMethod.value
      })
    })
    if (!response.ok) throw new Error('Failed to submit order')
    const data = await response.json()
    
    if (paymentMethod.value === 'online') {
      // Redirect to payment gateway
      window.location.href = data.payment_url
    } else {
      // Show success message and redirect to orders page
      router.push('/orders')
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrderPreview()
})
</script> 