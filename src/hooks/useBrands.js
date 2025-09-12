import { useState, useEffect } from 'react';

export function useBrands(params = {}) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 8
  });

  useEffect(() => {
    async function fetchBrands() {
      try {
        console.log('🔍 useBrands: Starting to fetch brands');
        setLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams({
          page: params.page || 1,
          per_page: params.per_page || 8,
          orderby: params.orderby || 'name',
          order: params.order || 'asc'
        });
        
        const response = await fetch(`/api/brands?${queryParams}`);
        console.log('🔍 useBrands: API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 useBrands: Brands data received:', {
          brands: data.brands?.length || 0,
          total: data.total,
          totalPages: data.totalPages
        });
        
        setBrands(data.brands || []);
        setPagination({
          currentPage: data.currentPage || parseInt(params.page) || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
          perPage: data.perPage || parseInt(params.per_page) || 8
        });
      } catch (err) {
        console.error('🔍 useBrands: Error fetching brands:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log('🔍 useBrands: Loading completed');
      }
    }

    fetchBrands();
  }, [params.page, params.per_page, params.orderby, params.order]);

  return { brands, loading, error, pagination };
}

export function useBrandProducts(brandSlug, params = {}) {
  const [products, setProducts] = useState([]);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 12
  });

  useEffect(() => {
    async function fetchBrandProducts() {
      if (!brandSlug) return;

      try {
        console.log('🔍 useBrandProducts: Starting to fetch products for brand:', brandSlug);
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
        
        const response = await fetch(`/api/brands/${brandSlug}?${queryParams}`);
        console.log('🔍 useBrandProducts: API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 useBrandProducts: Data received:', {
          brand: data.brand?.name,
          products: data.products?.length || 0,
          total: data.total
        });
        
        setProducts(data.products || []);
        setBrand(data.brand);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
          perPage: data.perPage || 12
        });
      } catch (err) {
        console.error('🔍 useBrandProducts: Error fetching brand products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log('🔍 useBrandProducts: Loading completed');
      }
    }

    fetchBrandProducts();
  }, [brandSlug, params.page, params.per_page, params.orderby, params.order, params.min_price, params.max_price, params.on_sale, params.featured]);

  return { products, brand, loading, error, pagination };
}
