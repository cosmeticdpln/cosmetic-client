import { defineStore } from 'pinia'
import { api } from '~/services/api'
import type { Product } from '~/types'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    currentProduct: null as Product | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchProducts(params?: Record<string, string>) {
      this.loading = true
      this.error = null
      try {
        const response = await api.getProducts(params)
        this.products = response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch products'
        console.error('Error fetching products:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchProduct(id: string | number) {
      this.loading = true
      this.error = null
      try {
        const response = await api.getProduct(id)
        this.currentProduct = response.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch product'
        console.error('Error fetching product:', err)
      } finally {
        this.loading = false
      }
    },
  },

  getters: {
    getProductById: (state) => {
      return (id: number) => state.products.find(p => p.id === id)
    },
  },
}) 