export default function PostMeta({ post }) {
  return (
    <div className="text-sm text-gray-500 mb-6">
      <span>{post.date}</span>
      {post.author && (
        <>
          <span className="mx-2">•</span>
          <span>By {post.author}</span>
        </>
      )}
      {post.categories && post.categories.length > 0 && (
        <>
          <span className="mx-2">•</span>
          <span>In {post.categories.join(', ')}</span>
        </>
      )}
    </div>
  )
}
