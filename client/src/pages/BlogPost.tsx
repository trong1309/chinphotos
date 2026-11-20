import React from 'react';
import { useParams } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <>
      <Seo title={`Article: ${slug || 'Journal'}`} description="Read full journal article." type="article" />
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl font-light mb-4">Journal Entry</h1>
        <p className="text-neutral-500 text-sm font-mono">{slug}</p>
      </div>
    </>
  );
};

export default BlogPost;
