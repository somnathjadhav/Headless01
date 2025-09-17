import React from 'react';
import Head from 'next/head';
import DesignSystemDemo from '../components/ui/DesignSystemDemo';

export default function DesignSystemPage() {
  return (
    <>
      <Head>
        <title>Design System - Your Store</title>
        <meta name="description" content="Global design system for consistent UI components" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <DesignSystemDemo />
      </div>
    </>
  );
}
