import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem('cx_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Fetch wishlist from server on login, clear on logout
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/wishlist').then(res => {
        if (res.data.success) {
          const ids = res.data.products.map(p => p._id);
          setWishlist(ids);
          localStorage.setItem('cx_wishlist', JSON.stringify(ids));
        }
      }).catch(err => console.error('Fetch wishlist failed', err));
    } else {
      setWishlist([]);
      localStorage.removeItem('cx_wishlist');
    }
  }, [isAuthenticated]);

  const toggleWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.post('/wishlist/toggle', { productId });
      if (data.success) {
        setWishlist(data.products);
        localStorage.setItem('cx_wishlist', JSON.stringify(data.products));
      }
    } catch (err) {
      console.error('Toggle wishlist failed', err);
    }
  }, [isAuthenticated]);

  const addToWishlist = useCallback(async (productId) => {
    if (wishlist.includes(productId)) return;
    await toggleWishlist(productId);
  }, [wishlist, toggleWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!wishlist.includes(productId)) return;
    await toggleWishlist(productId);
  }, [wishlist, toggleWishlist]);

  const isInWishlist = (productId) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, wishlistCount: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
