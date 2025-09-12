export interface Category {
  id: string
  name: string
  slug: string
  description: string
  count: number
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
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
  seo?: {
    title: string
    metaDesc: string
    opengraphTitle: string
    opengraphDescription: string
    opengraphImage?: {
      sourceUrl: string
    }
  }
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
