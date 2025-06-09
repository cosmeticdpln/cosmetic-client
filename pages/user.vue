<script setup lang="ts">
import { ref, onMounted } from 'vue'

const user = ref<any>(null)

onMounted(async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return
  try {
    const res = await fetch('http://localhost:8000/api/v1/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (res.ok) {
      const data = await res.json()
      user.value = data.data.user || data.user || data.data || data
    }
  } catch (e) {
    // handle error
  }
})
</script>

<template>
  <div class="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
    <h1 class="text-2xl font-bold mb-4">اطلاعات کاربری</h1>
    <div v-if="!user">
      <p class="text-red-600">برای مشاهده اطلاعات کاربری ابتدا وارد شوید.</p>
    </div>
    <div v-else>
      <div class="mb-2"><span class="font-semibold">نام:</span> {{ user.name }}</div>
      <div class="mb-2"><span class="font-semibold">شماره موبایل:</span> {{ user.phone_number }}</div>
      <div v-if="user.email" class="mb-2"><span class="font-semibold">ایمیل:</span> {{ user.email }}</div>
      <div v-if="user.email_verified_at" class="mb-2"><span class="font-semibold">وضعیت تایید:</span> تایید شده</div>
      <div v-else class="mb-2"><span class="font-semibold">وضعیت تایید:</span> تایید نشده</div>
    </div>
  </div>
</template>