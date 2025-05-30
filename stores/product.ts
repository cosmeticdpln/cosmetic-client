import { defineStore } from 'pinia'
import { api } from '~/services/api'
import type { Product, Category } from '~/types'

interface ProductState {
  products: Product[]
  categories: Category[]
  currentProduct: Product | null
  loading: boolean
  error: string | null
  filters: {
    category: number | null
    search: string
    sort: string
    order: 'asc' | 'desc'
  }
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
  }
}

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    categories: [],
    currentProduct: null,
    loading: false,
    error: null,
    filters: {
      category: null,
      search: '',
      sort: 'created_at',
      order: 'desc'
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      perPage: 12
    }
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        let queryParams: Record<string, string> = {
          page: this.pagination.currentPage.toString()
        }

        // Add sort parameter
        queryParams.sort = `${this.filters.order === 'desc' ? '-' : ''}${this.filters.sort}`

        // Add category filter
        if (this.filters.category) {
          queryParams['filter[category]'] = this.filters.category.toString()
        }

        // Add search filter
        if (this.filters.search) {
          queryParams['filter[name]'] = this.filters.search
        }

        const response = await api.getProducts(queryParams)
        this.products = response.data
        
        // Update pagination info if available in response meta
        if ('meta' in response) {
          const meta = response.meta as { total: number; per_page: number }
          this.pagination.totalItems = meta.total
          this.pagination.perPage = meta.per_page
          this.pagination.totalPages = Math.ceil(meta.total / meta.per_page)
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'خطا در دریافت محصولات'
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
        this.error = err instanceof Error ? err.message : 'خطا در دریافت محصول'
        console.error('Error fetching product:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const response = await api.getCategories()
        this.categories = response.data
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    },

    // Filter actions
    setCategory(categoryId: number | null) {
      this.filters.category = categoryId
      this.pagination.currentPage = 1
      this.fetchProducts()
    },

    setSearch(query: string) {
      this.filters.search = query
      this.pagination.currentPage = 1
      this.fetchProducts()
    },

    setSort(sort: string) {
      this.filters.sort = sort
      this.fetchProducts()
    },

    setSortOrder(order: 'asc' | 'desc') {
      this.filters.order = order
      this.fetchProducts()
    },

    setPage(page: number) {
      this.pagination.currentPage = page
      this.fetchProducts()
    },

    resetFilters() {
      this.filters = {
        category: null,
        search: '',
        sort: 'created_at',
        order: 'desc'
      }
      this.pagination.currentPage = 1
      this.fetchProducts()
    }
  },

  getters: {
    getProductById: (state) => {
      return (id: number) => state.products.find(p => p.id === id)
    },
    
    hasFiltersApplied: (state) => {
      return state.filters.category !== null || 
             state.filters.search !== '' || 
             state.filters.sort !== 'created_at' ||
             state.filters.order !== 'desc'
    }
  }
}) 