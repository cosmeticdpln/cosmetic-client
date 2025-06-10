<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits(['close', 'success'])
const step = ref(1)
const phone = ref('')
const codeArray = ref(['', '', '', '', '', ''])
const name = ref('')
const error = ref('')
const successMsg = ref('')
const user = ref<any>(null)
const accessToken = ref('')
const loading = ref(false)
const autoVerifying = ref(false)
const codeInputs = ref<HTMLInputElement[]>([])

// Watch for changes in codeArray and update the code value
watch(codeArray, (newValue) => {
  code.value = newValue.join('')
}, { deep: true })

const code = ref('')

function handleCodeInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const value = input.value
  
  // Only allow numbers
  if (!/^\d*$/.test(value)) {
    codeArray.value[index] = ''
    return
  }

  // Convert to Persian digits
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const persianValue = value.replace(/\d/g, d => persianDigits[parseInt(d)])
  codeArray.value[index] = persianValue

  // Move to next input if current input is filled
  if (value && index > 0) {
    codeInputs.value[index - 1]?.focus()
  }

  // Auto verify when all digits are entered
  if (codeArray.value.every(digit => digit !== '')) {
    verifyCode()
  }
}

function handleKeyDown(event: KeyboardEvent, index: number) {
  // Handle backspace
  if (event.key === 'Backspace') {
    if (!codeArray.value[index] && index < 5) {
      // If current input is empty and backspace is pressed, go to next input
      codeInputs.value[index + 1]?.focus()
    } else {
      // Clear current input
      codeArray.value[index] = ''
    }
  }
}

async function requestCode() {
  error.value = ''
  successMsg.value = ''
  loading.value = true
  try {
    await fetch('http://localhost:8000/api/v1/sms/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone.value })
    })
    successMsg.value = 'کد تایید ارسال شد.'
    step.value = 2
    // Focus rightmost input after a short delay
    setTimeout(() => {
      codeInputs.value[5]?.focus()
    }, 100)
  } catch (e: any) {
    error.value = e.message || 'خطا در ارسال کد'
  } finally {
    loading.value = false
  }
}

async function verifyCode() {
  if (codeArray.value.some(digit => digit === '')) return
  
  // Convert Persian digits back to English for API
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const code = [...codeArray.value].reverse().join('') // Reverse the array to maintain correct order
  const englishCode = code.split('').map(d => {
    const index = persianDigits.indexOf(d)
    return index !== -1 ? englishDigits[index] : d
  }).join('')

  error.value = ''
  successMsg.value = ''
  loading.value = true
  autoVerifying.value = true
  try {
    const res = await fetch('http://localhost:8000/api/v1/sms/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone.value, code: englishCode })
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'کد اشتباه است')
    }
    const data = await res.json()
    user.value = data.user
    accessToken.value = data.access_token
    if (process.client) {
      localStorage.setItem('access_token', data.access_token)
    }
    if (!user.value.name || user.value.name.startsWith('User_')) {
      step.value = 3
      successMsg.value = ''
      return
    }
    successMsg.value = 'ورود موفقیت‌آمیز بود!'
    emit('success', data)
    setTimeout(() => emit('close'), 1000)
  } catch (e: any) {
    error.value = e.message || 'خطا در ورود'
  } finally {
    loading.value = false
    autoVerifying.value = false
  }
}

async function submitName() {
  error.value = ''
  successMsg.value = ''
  loading.value = true
  try {
    const res = await fetch('http://localhost:8000/api/v1/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.value}`
      },
      body: JSON.stringify({ name: name.value })
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'خطا در ثبت نام')
    }
    user.value.name = name.value
    successMsg.value = 'نام شما با موفقیت ثبت شد!'
    emit('success', { user: user.value, access_token: accessToken.value })
    setTimeout(() => emit('close'), 1000)
  } catch (e: any) {
    error.value = e.message || 'خطا در ثبت نام'
  } finally {
    loading.value = false
  }
}

const validateLoginForm = () => {
  if (step.value === 1) {
    if (!phone.value) {
      error.value = 'شماره موبایل الزامی است'
      return false
    } else if (phone.value.length !== 11) {
      error.value = 'شماره موبایل باید ۱۱ رقم باشد'
      return false
    }
  } else if (step.value === 2) {
    if (codeArray.value.some(digit => !digit)) {
      error.value = 'کد تایید الزامی است'
      return false
    }
  } else if (step.value === 3) {
    if (!name.value) {
      error.value = 'نام و نام خانوادگی الزامی است'
      return false
    }
  }
  error.value = ''
  return true
}

const handleSubmit = async () => {
  if (!validateLoginForm()) return

  loading.value = true
  error.value = ''

  try {
    if (step.value === 1) {
      await requestCode()
    } else if (step.value === 2) {
      await verifyCode()
    } else if (step.value === 3) {
      await submitName()
    }
  } catch (e: any) {
    error.value = e.message || 'خطا در ثبت‌نام'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div 
      v-motion
      :initial="{ scale: 0.95, opacity: 0 }"
      :enter="{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200 } }"
      :leave="{ scale: 0.95, opacity: 0 }"
      class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative transition-all"
    >
      <button 
        v-motion
        :initial="{ rotate: 0 }"
        :hover="{ rotate: 90 }"
        :tap="{ scale: 0.9 }"
        class="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors" 
        @click="$emit('close')"
      >
        <span class="sr-only">بستن</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 
        v-motion
        :initial="{ y: -20, opacity: 0 }"
        :enter="{ y: 0, opacity: 1, transition: { delay: 100 } }"
        class="text-3xl font-bold mb-8 text-center text-blue-700"
      >
        ورود / ثبت‌نام با شماره موبایل
      </h2>
      <div class="flex justify-center mb-8">
        <div class="flex gap-3">
          <span 
            v-motion
            :initial="{ scale: 0 }"
            :enter="{ scale: 1, transition: { type: 'spring', stiffness: 200, delay: 200 } }"
            :class="['w-4 h-4 rounded-full transition-all duration-300', step === 1 ? 'bg-blue-600 scale-110' : 'bg-gray-300']"
          ></span>
          <span 
            v-motion
            :initial="{ scale: 0 }"
            :enter="{ scale: 1, transition: { type: 'spring', stiffness: 200, delay: 300 } }"
            :class="['w-4 h-4 rounded-full transition-all duration-300', step === 2 ? 'bg-blue-600 scale-110' : 'bg-gray-300']"
          ></span>
        </div>
      </div>
      <form @submit.prevent="handleSubmit()">
        <div v-if="step === 1">
          <label 
            v-motion
            :initial="{ x: -20, opacity: 0 }"
            :enter="{ x: 0, opacity: 1, transition: { delay: 400 } }"
            class="block mb-3 text-sm font-medium text-gray-700"
          >
            شماره موبایل
          </label>
          <input
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { delay: 500 } }"
            v-model="phone"
            type="text"
            class="w-full border-2 rounded-xl px-4 py-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center tracking-widest transition-all"
            placeholder="مثلاً 09123456789"
            required
            maxlength="11"
            autofocus
          />
          <button 
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { delay: 600 } }"
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
            type="submit" 
            class="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl" 
            :disabled="loading"
          >
            <span v-if="loading" class="animate-spin mr-2">
              <svg class="inline w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </span>
            دریافت کد
          </button>
        </div>
        <div v-else-if="step === 2">
          <label 
            v-motion
            :initial="{ x: -20, opacity: 0 }"
            :enter="{ x: 0, opacity: 1, transition: { delay: 400 } }"
            class="block mb-3 text-sm font-medium text-gray-700"
          >
            کد تایید
          </label>
          <div 
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { delay: 500 } }"
            class="flex gap-3 justify-center mb-6"
          >
            <input
              v-for="(digit, index) in 6"
              :key="index"
              v-motion
              :initial="{ scale: 0 }"
              :enter="{ scale: 1, transition: { type: 'spring', stiffness: 200, delay: 500 + index * 100 } }"
              v-model="codeArray[index]"
              type="text"
              class="w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-vazirmatn"
              maxlength="1"
              @input="handleCodeInput($event, index)"
              @keydown="handleKeyDown($event, index)"
              ref="codeInputs"
              dir="rtl"
            />
          </div>
          <button 
            v-if="!autoVerifying" 
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { delay: 1200 } }"
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
            type="submit" 
            class="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl" 
            :disabled="loading"
          >
            <span v-if="loading" class="animate-spin mr-2">
              <svg class="inline w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </span>
            تایید و ورود
          </button>
          <button 
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { delay: 1300 } }"
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
            type="button" 
            class="w-full mt-4 text-blue-600 hover:text-blue-700 transition-colors" 
            @click="step = 1"
          >
            ویرایش شماره
          </button>
        </div>
        <div v-else>
          <label 
            v-motion
            :initial="{ x: -20, opacity: 0 }"
            :enter="{ x: 0, opacity: 1, transition: { delay: 400 } }"
            class="block mb-3 text-sm font-medium text-gray-700"
          >
            نام شما
          </label>
          <input 
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { delay: 500 } }"
            v-model="name" 
            type="text" 
            class="w-full border-2 rounded-xl px-4 py-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all" 
            placeholder="نام خود را وارد کنید" 
            required 
          />
          <button 
            v-motion
            :initial="{ y: 20, opacity: 0 }"
            :enter="{ y: 0, opacity: 1, transition: { delay: 600 } }"
            :hover="{ scale: 1.02 }"
            :tap="{ scale: 0.98 }"
            type="submit" 
            class="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl" 
            :disabled="loading"
          >
            <span v-if="loading" class="animate-spin mr-2">
              <svg class="inline w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </span>
            ثبت نام
          </button>
        </div>
      </form>
      <transition name="fade">
        <div 
          v-if="error" 
          v-motion
          :initial="{ y: 20, opacity: 0 }"
          :enter="{ y: 0, opacity: 1 }"
          class="text-red-600 mt-6 text-center flex items-center justify-center gap-2 bg-red-50 p-4 rounded-xl"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ error }}
        </div>
      </transition>
      <transition name="fade">
        <div 
          v-if="successMsg" 
          v-motion
          :initial="{ y: 20, opacity: 0 }"
          :enter="{ y: 0, opacity: 1 }"
          class="text-green-600 mt-6 text-center flex items-center justify-center gap-2 bg-green-50 p-4 rounded-xl"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ successMsg }}
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Add smooth transitions for all interactive elements */
button, input {
  transition: all 0.2s ease-in-out;
}

/* Add a subtle hover effect to the modal */
.bg-white {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Add Persian font for code inputs */
@font-face {
  font-family: 'Vazirmatn';
  src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
}

.font-vazirmatn {
  font-family: 'Vazirmatn', sans-serif;
}

/* Ensure inputs are right-to-left */
input[type="text"] {
  direction: rtl;
  text-align: center;
  font-family: 'Vazirmatn', sans-serif;
}
</style>