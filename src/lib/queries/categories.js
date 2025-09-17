export const GET_CATEGORIES = `
  query GetCategories($first: Int = 100) {
    categories(first: $first) {
      nodes {
        id
        name
        slug
        description
        count
      }
    }
  }
`

export const GET_CATEGORY_BY_SLUG = `
  query GetCategoryBySlug($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      posts(first: 10) {
        nodes {
          id
          title
          slug
          excerpt
          date
          author {
            node {
              name
            }
          }
        }
      }
    }
  }
`
