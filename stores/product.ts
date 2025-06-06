import { defineStore } from 'pinia'
import { api } from '~/services/api'
import type { Product, Category } from '~/types'

interface SpecificationType {
  id: number
  name: string
  slug: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect'
  options: string[]
  is_visible: boolean
  is_required: boolean
  sort_order: number
  group: {
    id: number
    name: string
    sort_order: number
  }
}

interface ProductSpecification {
  id: number
  value: string | number | boolean | string[]
  specification_type: SpecificationType
}

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
    specifications: Record<string, any>
    priceRange: {
      min: number | null
      max: number | null
    }
    inStock: boolean
  }
  specificationTypes: SpecificationType[]
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
    specificationTypes: [],
    filters: {
      category: null,
      search: '',
      sort: 'created_at',
      order: 'desc',
      specifications: {},
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

        // Add specification filters
        Object.entries(this.filters.specifications).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
              // Handle multiselect values
              queryParams[`filter[specifications.${key}]`] = value.join(',')
            } else {
              queryParams[`filter[specifications.${key}]`] = value.toString()
            }
          }
        })

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

    async fetchSpecificationTypes() {
      try {
        const response = await api.getSpecificationTypes()
        if ('data' in response) {
          this.specificationTypes = response.data
        }
      } catch (err) {
        console.error('Error fetching specification types:', err)
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

    setSpecificationFilter(slug: string, value: any) {
      this.filters.specifications[slug] = value
      this.pagination.currentPage = 1
      this.fetchProducts()
    },

    setFilters(newFilters: { 
      search?: string
      category?: number | null
      sort?: string
      specifications?: Record<string, any>
    }) {
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
      if (typeof newFilters.specifications !== 'undefined') {
        this.filters.specifications = { ...this.filters.specifications, ...newFilters.specifications }
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
        specifications: {},
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