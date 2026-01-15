import { useEffect, useRef } from 'react';
import { useFeedStore } from '../../stores/feedStore';
import FeedItem from './FeedItem';
import gsap from 'gsap';

export default function FeedList() {
  const { posts, loadMore, hasMore, fetchFeed, loading, error } = useFeedStore();
  const observerRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement[]>([]);

  // Fetch initial data when component mounts
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadMore, loading]);

  // Animate posts on load
  useEffect(() => {
    postsRef.current.forEach((post, index) => {
      if (post) {
        gsap.fromTo(
          post,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            delay: index * 0.08,
            ease: 'power2.out',
          }
        );
      }
    });
  }, [posts]);

  if (error) {
    return (
      <div className="pt-4 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => fetchFeed()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="pt-4 text-center text-neutral-500">
        <p>No posts available</p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={(el) => {
            if (el) postsRef.current[index] = el;
          }}
        >
          <FeedItem post={post} />
        </div>
      ))}
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      <div ref={observerRef} className="h-4" />
    </div>
  );
}