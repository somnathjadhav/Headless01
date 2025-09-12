import { useState, useEffect } from 'react';

export function useTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        console.log('🔍 useTags: Starting to fetch tags');
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/tags');
        console.log('🔍 useTags: API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 useTags: Tags data received:', data.tags?.length || 0, 'tags');
        setTags(data.tags || []);
      } catch (err) {
        console.error('🔍 useTags: Error fetching tags:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log('🔍 useTags: Loading completed');
      }
    }

    fetchTags();
  }, []);

  return { tags, loading, error };
}

export function useTagProducts(tagSlug, params = {}) {
  const [products, setProducts] = useState([]);
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 12
  });

  useEffect(() => {
    async function fetchTagProducts() {
      if (!tagSlug) return;

      try {
        console.log('🔍 useTagProducts: Starting to fetch products for tag:', tagSlug);
        setLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams({
          page: params.page || 1,
          per_page: params.per_page || 12,
          orderby: params.orderby || 'date',
          order: params.order || 'desc',
          ...(params.min_price && { min_price: params.min_price }),
          ...(params.max_price && { max_price: params.max_price }),
          ...(params.on_sale && { on_sale: params.on_sale }),
          ...(params.featured && { featured: params.featured })
        });
        
        const response = await fetch(`/api/tags/${tagSlug}?${queryParams}`);
        console.log('🔍 useTagProducts: API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 useTagProducts: Data received:', {
          tag: data.tag?.name,
          products: data.products?.length || 0,
          total: data.total
        });
        
        setProducts(data.products || []);
        setTag(data.tag);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
          perPage: data.perPage || 12
        });
      } catch (err) {
        console.error('🔍 useTagProducts: Error fetching tag products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log('🔍 useTagProducts: Loading completed');
      }
    }

    fetchTagProducts();
  }, [tagSlug, params.page, params.per_page, params.orderby, params.order, params.min_price, params.max_price, params.on_sale, params.featured]);

  return { products, tag, loading, error, pagination };
}
