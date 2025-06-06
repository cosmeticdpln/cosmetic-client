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
    priceRange: {
      min: number | null
      max: number | null
    }
    inStock: boolean
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
      order: 'desc',
      priceRange: {
        min: null,
        max: null
      },
      inStock: false
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
        console.log('Fetching products with filters:', this.filters)
        const queryParams: Record<string, string> = {
          page: this.pagination.currentPage.toString()
        }

        // Add sort parameter
        queryParams.sort = `${this.filters.order === 'desc' ? '-' : ''}${this.filters.sort}`

        // Add category filter
        if (this.filters.category !== null) {
          queryParams['filter[category]'] = this.filters.category.toString()
        }

        // Add search filter
        if (this.filters.search && this.filters.search.trim()) {
          queryParams['filter[name]'] = this.filters.search.trim()
        }

        console.log('API query params:', queryParams)

        const response = await api.getProducts(queryParams)
        
        if ('data' in response) {
          this.products = response.data
          console.log('Received products:', response.data.length)
        }
        
        if ('meta' in response) {
          const meta = response.meta as { total: number; per_page: number }
          this.pagination.totalItems = meta.total
          this.pagination.perPage = meta.per_page
          this.pagination.totalPages = Math.ceil(meta.total / meta.per_page)
        }
      } catch (err) {
        console.error('Error fetching products:', err)
        this.error = err instanceof Error ? err.message : 'خطا در دریافت محصولات'
      } finally {
        this.loading = false
      }
    },

    async fetchProduct(id: string) {
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

    setSearch(search: string) {
      this.filters.search = search
      this.pagination.currentPage = 1
      this.fetchProducts()
    },

    setCategory(categoryId: number | null) {
      this.filters.category = categoryId
      this.pagination.currentPage = 1
      this.fetchProducts()
    },

    setSort(sort: string) {
      this.filters.sort = sort
      this.pagination.currentPage = 1
      this.fetchProducts()
    },

    setPriceRange(min: number | null, max: number | null) {
      this.filters.priceRange = { min, max }
      this.pagination.currentPage = 1
      this.fetchProducts()
    },

    toggleInStock() {
      this.filters.inStock = !this.filters.inStock
      this.pagination.currentPage = 1
      this.fetchProducts()
    },

    setPage(page: number) {
      this.pagination.currentPage = page
      this.fetchProducts()
    },

    setFilters(newFilters: { search?: string; category?: number | null; sort?: string }) {
      console.log('Setting new filters:', newFilters)
      
      if (typeof newFilters.search !== 'undefined') {
        this.filters.search = newFilters.search
      }
      if (typeof newFilters.category !== 'undefined') {
        this.filters.category = newFilters.category
      }
      if (typeof newFilters.sort !== 'undefined') {
        this.filters.sort = newFilters.sort
      }

      this.pagination.currentPage = 1
      this.fetchProducts()
    },

    resetFilters() {
      console.log('Resetting filters')
      this.filters = {
        category: null,
        search: '',
        sort: 'created_at',
        order: 'desc',
        priceRange: {
          min: null,
          max: null
        },
        inStock: false
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
             state.filters.order !== 'desc' ||
             state.filters.priceRange.min !== null ||
             state.filters.priceRange.max !== null ||
             state.filters.inStock
    }
  }
}) 