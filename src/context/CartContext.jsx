import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [enrichedCart, setEnrichedCart] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setEnrichedCart([]);
      return;
    }
    try {
      const { data } = await api.get('/cart');
      if (data.success) {
        setEnrichedCart(data.items);
      }
    } catch (err) {
      console.error('Fetch cart failed', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) return;
    try {
      await api.post('/cart', { productId, quantity });
      await fetchCart();
    } catch (err) {
      console.error('Add to cart failed', err);
    }
  }, [isAuthenticated, fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!isAuthenticated || quantity < 1) return;
    try {
      await api.put(`/cart/${productId}`, { quantity });
      await fetchCart();
    } catch (err) {
      console.error('Update cart quantity failed', err);
    }
  }, [isAuthenticated, fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    if (!isAuthenticated) return;
    try {
      await api.delete(`/cart/${productId}`);
      await fetchCart();
    } catch (err) {
      console.error('Remove from cart failed', err);
    }
  }, [isAuthenticated, fetchCart]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      await api.delete('/cart');
      setEnrichedCart([]);
    } catch (err) {
      console.error('Clear cart failed', err);
    }
  }, [isAuthenticated]);

  const cartCount = enrichedCart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = enrichedCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Backwards compatibility for components that might still use cartItems
  const cartItems = enrichedCart.map(item => ({ productId: item.productId, quantity: item.quantity }));

  return (
    <CartContext.Provider value={{ cartItems, enrichedCart, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
