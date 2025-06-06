import type { Product, Category, SpecificationType } from '~/types'

class ApiService {
  private baseURL: string = 'http://localhost:8000/api/v1'

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  // Products
  async getProducts(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : ''
    return this.request<{ data: Product[] }>(`/products${queryString}`)
  }

  async getProduct(id: string | number) {
    return this.request<{ data: Product }>(`/products/${id}`)
  }

  // Categories
  async getCategories() {
    return this.request<{ data: Category[] }>('/categories')
  }

  async getCategory(id: string | number) {
    return this.request<{ data: Category }>(`/categories/${id}`)
  }

  // Specifications
  async getSpecificationTypes() {
    return this.request<{ data: SpecificationType[] }>('/specification-types')
  }
}

export const api = new ApiService() 