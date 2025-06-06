export interface Media {
  id: number
  name: string
  file_name: string
  mime_type: string
  size: number
  url: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  type: string
}

export interface SpecificationType {
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

export interface Specification {
  id: number
  value: string | string[]
  type: SpecificationType
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  parent_id?: number | null
  children?: Category[]
}

export interface ProductSpecification {
  id: number
  value: string | number | boolean | string[]
  specification_type: SpecificationType
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: string
  compare_at_price: string
  stock: number
  sku: string
  is_visible: boolean
  featured: boolean
  volume: string
  expiry_date: string
  category_id: number
  category: Category
  specifications: ProductSpecification[]
  media: Array<{
    id: number
    url: string
    type: string
  }>
  tags: Tag[]
  created_at: string
  updated_at: string
} 