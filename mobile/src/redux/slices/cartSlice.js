import { createSlice } from '@reduxjs/toolkit';

// Cart is keyed by productId; each line stores a snapshot of the product plus
// the total grams the customer wants. Adding/removing works in gram deltas so
// the same veg can be topped up from its card without duplicate lines.
const initialState = {
  items: {}, // { [productId]: { productId, name, emoji, pricePerKg, grams } }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { product, grams } = action.payload;
      const existing = state.items[product.id];
      if (existing) {
        existing.grams += grams;
      } else {
        state.items[product.id] = {
          productId: product.id,
          name: product.name,
          emoji: product.emoji,
          pricePerKg: product.pricePerKg,
          grams,
        };
      }
    },
    // Decrease a line by `grams`; removes the line when it hits zero.
    decrementItem(state, action) {
      const { productId, grams } = action.payload;
      const existing = state.items[productId];
      if (!existing) return;
      existing.grams -= grams;
      if (existing.grams <= 0) delete state.items[productId];
    },
    removeItem(state, action) {
      delete state.items[action.payload];
    },
    clearCart(state) {
      state.items = {};
    },
  },
});

export const { addToCart, decrementItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// ----- selectors -----
export const selectCartItems = (state) => Object.values(state.cart.items);
export const selectCartGrams = (productId) => (state) => state.cart.items[productId]?.grams || 0;
export const selectCartProductCount = (state) => Object.keys(state.cart.items).length;
export const selectCartTotal = (state) =>
  Object.values(state.cart.items).reduce((sum, i) => sum + (i.grams / 1000) * i.pricePerKg, 0);
