<script setup>
const router = useRouter()
onMounted(() => {
  router.push('/products')
})
</script>

<template>
  <div>
    Redirecting to products...
  </div>
</template> 