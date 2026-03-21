import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const isRegularUser = isAuthenticated && user?.role === 'user';
  const [enrichedCart, setEnrichedCart] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!isRegularUser) {
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
  }, [isRegularUser]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isRegularUser) return;
    try {
      await api.post('/cart', { productId, quantity });
      await fetchCart();
    } catch (err) {
      console.error('Add to cart failed', err);
    }
  }, [isRegularUser, fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!isRegularUser || quantity < 1) return;
    try {
      await api.put(`/cart/${productId}`, { quantity });
      await fetchCart();
    } catch (err) {
      console.error('Update cart quantity failed', err);
    }
  }, [isRegularUser, fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    if (!isRegularUser) return;
    try {
      await api.delete(`/cart/${productId}`);
      await fetchCart();
    } catch (err) {
      console.error('Remove from cart failed', err);
    }
  }, [isRegularUser, fetchCart]);

  const clearCart = useCallback(async () => {
    if (!isRegularUser) return;
    try {
      await api.delete('/cart');
      setEnrichedCart([]);
    } catch (err) {
      console.error('Clear cart failed', err);
    }
  }, [isRegularUser]);

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
