import React from 'react';
import { useWooCommerce } from '../../context/WooCommerceContext';
import { FullPageLoader } from './ModernLoader';

export default function GlobalLoader() {
  const { loading } = useWooCommerce();

  if (!loading) return null;

  return (
    <FullPageLoader 
      title="Processing Your Request"
      subtitle="Please wait while we prepare everything for you"
      loaderType="gradient"
    />
  );
}
