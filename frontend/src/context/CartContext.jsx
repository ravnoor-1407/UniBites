import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Cart items stored as { [dishId]: { item, quantity } }
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('unibites_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Current active outlet for the cart
  const [activeOutlet, setActiveOutlet] = useState(() => {
    try {
      const saved = localStorage.getItem('unibites_cart_outlet');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Conflict modal state when adding from a different outlet
  const [conflictModal, setConflictModal] = useState(null);

  // Scheduled pickup slot
  const [pickupSlot, setPickupSlot] = useState('Now (~10 mins)');

  // Dining Mode: 'Takeaway' | 'Dine-in'
  const [diningMode, setDiningMode] = useState('Takeaway');

  // Selected seats for academic canteen dine-in
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Group order state
  const [isGroupOrder, setIsGroupOrder] = useState(false);
  const [groupCode, setGroupCode] = useState(null);

  useEffect(() => {
    localStorage.setItem('unibites_cart', JSON.stringify(cartItems));
    if (Object.keys(cartItems).length === 0) {
      setActiveOutlet(null);
      localStorage.removeItem('unibites_cart_outlet');
    } else if (activeOutlet) {
      localStorage.setItem('unibites_cart_outlet', JSON.stringify(activeOutlet));
    }
  }, [cartItems, activeOutlet]);

  // Add dish to cart with single outlet check
  const addToCart = (item, outlet) => {
    // Check if adding from different outlet
    if (activeOutlet && activeOutlet.id !== outlet.id && Object.keys(cartItems).length > 0) {
      // Trigger conflict prompt
      setConflictModal({
        newItem: item,
        newOutlet: outlet,
      });
      return false;
    }

    if (!activeOutlet) {
      setActiveOutlet(outlet);
    }

    setCartItems(prev => {
      const existing = prev[item.id];
      const newQty = (existing?.quantity || 0) + 1;
      return {
        ...prev,
        [item.id]: {
          item: {
            ...item,
            outletId: outlet.id,
            outletName: outlet.name,
          },
          quantity: newQty,
        },
      };
    });
    return true;
  };

  // Replace cart with item from new outlet
  const replaceCartWithNewOutlet = () => {
    if (!conflictModal) return;
    const { newItem, newOutlet } = conflictModal;
    setActiveOutlet(newOutlet);
    setCartItems({
      [newItem.id]: {
        item: {
          ...newItem,
          outletId: newOutlet.id,
          outletName: newOutlet.name,
        },
        quantity: 1,
      },
    });
    setConflictModal(null);
  };

  const removeFromCart = (dishId) => {
    setCartItems(prev => {
      const updated = { ...prev };
      delete updated[dishId];
      return updated;
    });
  };

  const updateQuantity = (dishId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(dishId);
      return;
    }
    setCartItems(prev => {
      if (!prev[dishId]) return prev;
      return {
        ...prev,
        [dishId]: {
          ...prev[dishId],
          quantity: newQty,
        },
      };
    });
  };

  const clearCart = () => {
    setCartItems({});
    setActiveOutlet(null);
    setSelectedSeats([]);
    localStorage.removeItem('unibites_cart');
    localStorage.removeItem('unibites_cart_outlet');
  };

  const getItemQuantity = (dishId) => {
    return cartItems[dishId]?.quantity || 0;
  };

  // Authoritative calculations
  const itemsList = Object.values(cartItems);
  const totalItemCount = itemsList.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = itemsList.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
  const platformFee = itemsList.length > 0 ? 5 : 0;
  const grandTotal = subtotal + platformFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsList,
        activeOutlet,
        totalItemCount,
        subtotal,
        platformFee,
        grandTotal,
        pickupSlot,
        setPickupSlot,
        diningMode,
        setDiningMode,
        selectedSeats,
        setSelectedSeats,
        isGroupOrder,
        setIsGroupOrder,
        groupCode,
        setGroupCode,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        conflictModal,
        setConflictModal,
        replaceCartWithNewOutlet,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
