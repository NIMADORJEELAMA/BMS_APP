import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: {[key: string]: CartItem};
}

const initialState: CartState = {
  items: {},
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    updateCartQuantity: (
      state,
      action: PayloadAction<{item: any; delta: number}>,
    ) => {
      const {item, delta} = action.payload; // Extracting item and delta from payload

      if (!item) return; // Guard clause

      const existingItem = state.items[item.id];

      if (existingItem) {
        const newQty = existingItem.quantity + delta;
        if (newQty <= 0) {
          delete state.items[item.id];
        } else {
          state.items[item.id].quantity = newQty;
        }
      } else if (delta > 0) {
        state.items[item.id] = {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        };
      }
    },
    clearCart: state => {
      state.items = {};
    },
  },
});

export const {updateCartQuantity, clearCart} = cartSlice.actions;
export default cartSlice.reducer;
