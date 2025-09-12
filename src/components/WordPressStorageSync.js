import { useWordPressStorage } from '../hooks/useWordPressStorage';

/**
 * Component to handle automatic WordPress storage synchronization
 * This component doesn't render anything but handles the sync logic
 */
export default function WordPressStorageSync() {
  // This hook automatically handles syncing cart and wishlist with WordPress
  useWordPressStorage();
  
  // This component doesn't render anything
  return null;
}

