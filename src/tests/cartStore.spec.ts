import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../stores/cartStore';

describe('CartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should add products to the cart', () => {
    const store = useCartStore();
    const product = { id: 1, barcode: '111', name: 'Test Product', price: 100 };
    
    store.addToCart(product);
    
    expect(store.cart).toHaveLength(1);
    expect(store.cart[0].quantity).toBe(1);
  });

  it('should increase quantity of existing product', () => {
    const store = useCartStore();
    const product = { id: 1, barcode: '111', name: 'Test Product', price: 100 };
    
    store.addToCart(product);
    store.addToCart(product);
    
    expect(store.cart).toHaveLength(1);
    expect(store.cart[0].quantity).toBe(2);
  });

  it('should calculate subtotal correctly', () => {
    const store = useCartStore();
    const product = { id: 1, barcode: '111', name: 'Test Product', price: 100 };
    
    store.addToCart(product);
    store.addToCart(product);
    
    expect(store.subtotal).toBe(200);
  });
});
