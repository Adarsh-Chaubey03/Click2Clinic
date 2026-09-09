import { useCart } from "../context/CartContext";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaRupeeSign, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";

const Cart = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { token, userData } = useContext(AppContext);
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    if (!token || !userData) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }
    
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Navigate to checkout page with cart data
    navigate("/checkout", { state: { cart } });
    window.scrollTo(0,0)
    onClose();
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      toast.success("Cart cleared successfully");
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FaShoppingCart className="text-4xl mb-4" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm mb-4">Add some items to get started</p>
              <button
                onClick={() => {
                  onClose();
                  navigate("/store");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {/* Item Image */}
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                    <div className="flex items-center gap-1 text-blue-600 font-semibold">
                      <FaRupeeSign className="text-xs" />
                      <span>₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                    >
                      <FaMinus className="text-xs" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            {/* Item Breakdown */}
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{item.name} (Qty: {item.quantity})</span>
                  <div className="flex items-center gap-1 text-blue-600 font-semibold">
                    <FaRupeeSign className="text-xs" />
                    <span>{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="border-t border-gray-200 pt-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <div className="flex items-center gap-1 text-blue-600 font-semibold text-lg">
                  <FaRupeeSign />
                  <span>{getCartTotal()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Place Order
              </button>
              <button
                onClick={handleClearCart}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 