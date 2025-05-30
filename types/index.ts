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
  group: {
    id: number
    name: string
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
  description: string
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
  category: Category
  specifications: Specification[]
  media: Media[]
  tags: Tag[]
} 