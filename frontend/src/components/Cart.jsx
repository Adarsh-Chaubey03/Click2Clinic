import { useCart } from "../context/CartContext";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const Cart = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { token, userData } = useContext(AppContext);
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    if (!token || !userData) {
      toast.error("Please login to place an order");
      navigate("/login");
      onClose();
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout", { state: { cart } });
    window.scrollTo(0, 0);
    onClose();
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      toast.success("Cart cleared successfully");
    }
  };

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty <= 0) removeFromCart(itemId);
    else updateQuantity(itemId, newQty);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 tracking-tight">
                Shopping Cart
              </h2>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close cart"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── Items ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                  <svg className="w-14 h-14 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">Your cart is empty</p>
                  <button
                    onClick={() => { onClose(); navigate("/store"); }}
                    className="mt-1 text-sm font-semibold text-teal-600 hover:underline"
                  >
                    Browse medicines →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/60"
                    >
                      {/* Image */}
                      <div className="w-[60px] h-[60px] flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate leading-tight">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">
                          {item.category}
                        </p>
                        <p className="text-xs font-semibold text-teal-600 mt-1">
                          ₹ {item.price} × {item.quantity} ={" "}
                          <span className="text-teal-700">₹{item.price * item.quantity}</span>
                        </p>
                      </div>

                      {/* Qty + Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors text-sm leading-none"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-semibold text-gray-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors text-sm leading-none"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="ml-1 w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 px-5 pt-4 pb-5 space-y-3">
                {/* Per-item breakdown */}
                <div className="space-y-1.5">
                  {cart.map((item) => (
                    <div key={item._id} className="flex justify-between items-center text-xs text-gray-500">
                      <span className="truncate max-w-[60%]">
                        {item.name} (Qty: {item.quantity})
                      </span>
                      <span className="font-semibold text-teal-600 whitespace-nowrap">
                        ₹ {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-800">Total:</span>
                  <span className="text-sm font-bold text-teal-600">₹ {getCartTotal()}</span>
                </div>

                {/* Actions */}
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-3 rounded-xl bg-[#009f9a] hover:bg-[#00888a] active:bg-[#007a7c] text-white text-sm font-semibold transition-colors duration-200 shadow-sm"
                >
                  Place Order
                </button>
                <button
                  onClick={handleClearCart}
                  className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 text-sm font-medium transition-colors duration-200"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
