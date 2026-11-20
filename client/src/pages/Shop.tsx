import React from 'react';
import { Seo } from '../components/seo/Seo';

export const Shop: React.FC = () => {
  return (
    <>
      <Seo title="Print Store & Books" description="Fine art prints, books, presets and gear." />
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl font-light mb-4">Print Store</h1>
        <p className="text-neutral-500 text-sm uppercase tracking-widest">Fine Art Prints & Goods · Task 10</p>
      </div>
    </>
  );
};

export default Shop;
