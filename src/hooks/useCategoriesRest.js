import { useState, useEffect } from 'react';

export function useCategoriesRest() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log('🔍 useCategoriesRest: Starting to fetch categories');
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/categories');
        console.log('🔍 useCategoriesRest: API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 useCategoriesRest: Categories data received:', data.categories?.length || 0, 'categories');
        console.log('🔍 useCategoriesRest: First category:', data.categories?.[0]);
        setCategories(data.categories || []);
      } catch (err) {
        console.error('🔍 useCategoriesRest: Error fetching categories:', err);
        setError(err.message);
        // Set fallback categories on error
        setCategories([]);
      } finally {
        setLoading(false);
        console.log('🔍 useCategoriesRest: Loading completed');
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useCategoryProducts(categoryId, params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 12
  });

  useEffect(() => {
    async function fetchCategoryProducts() {
      if (!categoryId) return;

      try {
        console.log('🔍 useCategoryProducts: Starting to fetch products for category:', categoryId);
        setLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams({
          page: params.page || 1,
          per_page: params.per_page || 12,
          orderby: params.orderby || 'date',
          order: params.order || 'desc',
          category: categoryId,
          ...(params.min_price && { min_price: params.min_price }),
          ...(params.max_price && { max_price: params.max_price }),
          ...(params.on_sale && { on_sale: params.on_sale }),
          ...(params.featured && { featured: params.featured })
        });
        
        const response = await fetch(`/api/products?${queryParams}`);
        console.log('🔍 useCategoryProducts: API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 useCategoryProducts: Data received:', {
          products: data.products?.length || 0,
          total: data.total
        });
        
        setProducts(data.products || []);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
          perPage: data.perPage || 12
        });
      } catch (err) {
        console.error('🔍 useCategoryProducts: Error fetching category products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log('🔍 useCategoryProducts: Loading completed');
      }
    }

    fetchCategoryProducts();
  }, [categoryId, params.page, params.per_page, params.orderby, params.order, params.min_price, params.max_price, params.on_sale, params.featured]);

  return { products, loading, error, pagination };
}
