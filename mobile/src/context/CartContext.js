import React, { createContext, useState, useContext, useEffect } from 'react';
import { AppContext } from './AppContext';
import axios from 'axios';
import { Alert } from 'react-native';

export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
    const { backendUrl, token } = useContext(AppContext);

    // Calculate total
    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Get cart count
    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    // Add to cart
    const addToCart = async (medicine, quantity = 1) => {
        if (!token) {
            Alert.alert('Login Required', 'Please login to add items to cart');
            return false;
        }

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/add-cart`,
                { medicineId: medicine._id, quantity },
                { headers: { token } }
            );

            if (data.success) {
                // Update local cart
                const existingItem = cart.find(item => item._id === medicine._id);
                if (existingItem) {
                    setCart(cart.map(item =>
                        item._id === medicine._id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    ));
                } else {
                    setCart([...cart, { ...medicine, quantity }]);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.log('Add to cart error:', error);
            return false;
        }
    };

    // Update quantity
    const updateQuantity = (medicineId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(medicineId);
            return;
        }
        setCart(cart.map(item =>
            item._id === medicineId ? { ...item, quantity: newQuantity } : item
        ));
    };

    // Remove from cart
    const removeFromCart = async (medicineId) => {
        try {
            if (token) {
                await axios.post(
                    `${backendUrl}/api/user/cancel-item`,
                    { medicineId },
                    { headers: { token } }
                );
            }
            setCart(cart.filter(item => item._id !== medicineId));
        } catch (error) {
            console.log('Remove from cart error:', error);
        }
    };

    // Get cart data from server
    const getCartData = async () => {
        if (!token) return;
        setCartLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/get-cart`, {
                headers: { token }
            });
            if (data.success && data.cartData) {
                setCart(data.cartData);
            }
        } catch (error) {
            console.log('Get cart error:', error);
        } finally {
            setCartLoading(false);
        }
    };

    // Clear cart
    const clearCart = () => {
        setCart([]);
    };

    // Load cart data when token changes (user logs in)
    useEffect(() => {
        if (token) {
            getCartData();
        } else {
            setCart([]);
        }
    }, [token]);

    // Auto-load cart from server when token is available
    useEffect(() => {
        if (token) {
            getCartData();
        } else {
            setCart([]);
        }
    }, [token]);

    const value = {
        cart,
        setCart,
        cartLoading,
        getCartTotal,
        getCartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        getCartData,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
