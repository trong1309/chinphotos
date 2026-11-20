import React from 'react';
import { Seo } from '../components/seo/Seo';

export const Blog: React.FC = () => {
  return (
    <>
      <Seo title="Journal" description="Stories, essays and guides on photography and life." />
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl font-light mb-4">The Journal</h1>
        <p className="text-neutral-500 text-sm uppercase tracking-widest">Stories & Reflections · Task 9</p>
      </div>
    </>
  );
};

export default Blog;
