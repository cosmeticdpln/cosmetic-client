import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface CartItem {
  id: number
  name: string
  price: string
  quantity: number
  image: string
  product_id: number
}

export interface Order {
  id: number
  user_id: number
  status: string
  coupon_id: number | null
  subtotal: number
  discount: number
  total: number
  shipping_amount: number
  paid_at: string | null
  meta: any
  created_at: string
  updated_at: string
  items: {
    id: number
    order_id: number
    product_id: number
    product_name: string
    product_price: number
    quantity: number
    total: number
    discount: number
    final_price: number
    product: {
      id: number
      name: string
      price: string
      media: Array<{
        id: number
        original_url: string
      }>
    }
  }[]
  coupon?: {
    id: number
    code: string
    type: string
    value: string
    min_purchase_amount: string
    max_uses: number
    used_times: number
    starts_at: string
    expires_at: string
    is_active: boolean
  }
}

const getStoredCart = (): CartItem[] => {
  if (process.client) {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]')
    } catch (e) {
      return []
    }
  }
  return []
}

const saveCart = (items: CartItem[]) => {
  if (process.client) {
    localStorage.setItem('cart', JSON.stringify(items))
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(getStoredCart())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const order = ref<Order | null>(null)

  // Watch for changes in items and save to localStorage
  watch(items, (newItems) => {
    saveCart(newItems)
  }, { deep: true })

  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity)
    }, 0)
  })

  const fetchOrder = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/order')
      if (!response.ok) throw new Error('Failed to fetch order')
      const data = await response.json()
      order.value = data
      // Update cart items from order
      items.value = data.items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product_name,
        price: item.product_price.toString(),
        quantity: item.quantity,
        image: item.product.media[0]?.original_url || ''
      }))
    } catch (err: any) {
      error.value = err.message || 'خطا در دریافت اطلاعات سفارش'
    } finally {
      loading.value = false
    }
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`/api/order/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      })
      if (!response.ok) throw new Error('Failed to update quantity')
      await fetchOrder() // Refresh order data
    } catch (err: any) {
      error.value = err.message || 'خطا در بروزرسانی تعداد'
    } finally {
      loading.value = false
    }
  }

  const removeFromCart = async (itemId: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`/api/order/items/${itemId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to remove item')
      await fetchOrder() // Refresh order data
    } catch (err: any) {
      error.value = err.message || 'خطا در حذف محصول'
    } finally {
      loading.value = false
    }
  }

  const addToCart = async (product: any) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/order/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      })
      if (!response.ok) throw new Error('Failed to add item')
      await fetchOrder() // Refresh order data
    } catch (err: any) {
      error.value = err.message || 'خطا در افزودن به سبد خرید'
    } finally {
      loading.value = false
    }
  }

  const applyCoupon = async (code: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/orders/coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })
      if (!response.ok) throw new Error('Failed to apply coupon')
      await fetchOrder() // Refresh order data
    } catch (err: any) {
      error.value = err.message || 'خطا در اعمال کد تخفیف'
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    order,
    totalItems,
    totalPrice,
    fetchOrder,
    updateQuantity,
    removeFromCart,
    addToCart,
    applyCoupon
  }
}) 