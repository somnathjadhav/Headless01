export interface Category {
  id: string
  name: string
  slug: string
  description: string
  count: number
}

export interface PostPreview {
  id: string
  title: string
  slug: string
  excerpt: string
  date: string
  author: {
    node: {
      name: string
    }
  }
  categories: {
    nodes: Category[]
  }
}

export interface CategoryWithPosts extends Category {
  posts: {
    nodes: PostPreview[]
  }
}
