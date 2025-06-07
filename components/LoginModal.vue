<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative">
      <button class="absolute top-2 left-2 text-gray-400 hover:text-gray-600" @click="$emit('close')">
        <span class="sr-only">بستن</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 class="text-xl font-bold mb-4 text-center">ورود / ثبت‌نام با شماره موبایل</h2>
      <form @submit.prevent="step === 1 ? requestCode() : step === 2 ? verifyCode() : submitName()">
        <div v-if="step === 1">
          <label class="block mb-2 text-sm font-medium">شماره موبایل</label>
          <input v-model="phone" type="text" class="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring" placeholder="مثلاً 09123456789" required />
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">دریافت کد</button>
        </div>
        <div v-else-if="step === 2">
          <label class="block mb-2 text-sm font-medium">کد تایید</label>
          <input v-model="code" type="text" class="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring" placeholder="کد ۶ رقمی" required />
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">تایید و ورود</button>
          <button type="button" class="w-full mt-2 text-blue-600 hover:underline" @click="step = 1">ویرایش شماره</button>
        </div>
        <div v-else>
          <label class="block mb-2 text-sm font-medium">نام شما</label>
          <input v-model="name" type="text" class="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring" placeholder="نام خود را وارد کنید" required />
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">ثبت نام</button>
        </div>
      </form>
      <div v-if="error" class="text-red-600 mt-4 text-center">{{ error }}</div>
      <div v-if="successMsg" class="text-green-600 mt-4 text-center">{{ successMsg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '~/services/api'

const emit = defineEmits(['close', 'success'])
const step = ref(1)
const phone = ref('')
const code = ref('')
const error = ref('')
const successMsg = ref('')
const user = ref<any>(null)
const name = ref('')
const accessToken = ref('')

async function requestCode() {
  error.value = ''
  try {
    await fetch('http://localhost:8000/api/v1/sms/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone.value })
    })
    successMsg.value = 'کد تایید ارسال شد.'
    step.value = 2
  } catch (e: any) {
    error.value = e.message || 'خطا در ارسال کد'
  }
}

async function verifyCode() {
  error.value = ''
  try {
    const res = await fetch('http://localhost:8000/api/v1/sms/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone.value, code: code.value })
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'کد اشتباه است')
    }
    const data = await res.json()
    user.value = data.user
    accessToken.value = data.access_token
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
  }
}

async function submitName() {
  error.value = ''
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
  }
}
</script> 