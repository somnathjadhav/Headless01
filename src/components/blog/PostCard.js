import React from 'react';
import Link from 'next/link';

export default function PostCard({ post }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
            {post.title.rendered}
          </Link>
        </h3>
        <div className="text-gray-600 mb-4" 
             dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString()}
          </span>
          <Link 
            href={`/blog/${post.slug}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
}
