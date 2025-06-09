import { ref } from 'vue'

interface ProductMedia {
  id: number
  original_url: string
  preview_url: string
}

interface Product {
  id: number
  name: string
  slug: string
  price: string
  media: ProductMedia[]
}

export interface CartItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_price: number
  quantity: number
  total: number
  product: Product
}

export interface Cart {
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
  items: CartItem[]
  coupon: {
    code: string
    discount: number
  } | null
}

const cart = ref<Cart>({
  id: 0,
  user_id: 0,
  status: 'cart',
  coupon_id: null,
  subtotal: 0,
  discount: 0,
  total: 0,
  shipping_amount: 0,
  paid_at: null,
  meta: null,
  created_at: '',
  updated_at: '',
  items: [],
  coupon: null
})

export function useCart() {
  const loading = ref(false)
  const error = ref('')

  const getToken = () => {
    if (process.client) {
      return localStorage.getItem('access_token')
    }
    return null
  }

  async function fetchCart() {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch('http://localhost:8000/api/v1/orders/cart', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch cart')
      const data = await response.json()
      cart.value = data
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function addToCart(productId: number, quantity: number = 1) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch('http://localhost:8000/api/v1/orders/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ product_id: productId, quantity })
      })
      if (!response.ok) throw new Error('Failed to add item to cart')
      await fetchCart()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function removeFromCart(productId: number) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch('http://localhost:8000/api/v1/orders/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ product_id: productId })
      })
      if (!response.ok) throw new Error('Failed to remove item from cart')
      await fetchCart()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function applyCoupon(code: string) {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch('http://localhost:8000/api/v1/orders/cart/coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ code })
      })
      if (!response.ok) throw new Error('Failed to apply coupon')
      await fetchCart()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function removeCoupon() {
    loading.value = true
    error.value = ''
    try {
      const response = await fetch('http://localhost:8000/api/v1/orders/cart/remove-coupon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
      if (!response.ok) throw new Error('Failed to remove coupon')
      await fetchCart()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    removeFromCart,
    applyCoupon,
    removeCoupon
  }
} 