import { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { FaRupeeSign, FaMapMarkerAlt, FaPhone, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, backendUrl, userData } = useContext(AppContext);
  const { cart, getCartTotal, clearCart } = useCart();
  
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get cart from location state or use current cart
  const checkoutCart = location.state?.cart || cart;

  useEffect(() => {
    if (!token) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }

    if (checkoutCart.length === 0) {
      toast.error("Your cart is empty");
      navigate("/store");
      return;
    }
  }, [token, checkoutCart, navigate]);

  const getCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!address.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      // Create orders for each item in cart
      const orderPromises = checkoutCart.map(async (item) => {
        const orderData = {
          mg: item.category === "tablet" || item.category === "capsule" ? item.quantity : 0,
          ml: item.category === "syrup" ? item.quantity : 0,
          quantity: item.quantity, // Send the actual quantity
          address: address.trim(),
          phone: Number(phone),
          medData: {
            _id: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            available: item.available
          },
          orderDate: getCurrentDateTime(),
        };

        console.log("Sending order data:", orderData);

        return axios.post(
          `${backendUrl}/api/user/order`,
          orderData,
          { 
            headers: { 
              token,
              'Content-Type': 'application/json'
            } 
          }
        );
      });

      const results = await Promise.all(orderPromises);
      
      // Check if all orders were successful
      const successfulOrders = results.filter(result => result.data.success);
      const failedOrders = results.filter(result => !result.data.success);
      
      if (successfulOrders.length === checkoutCart.length) {
        toast.success(`All ${checkoutCart.length} orders placed successfully!`);
        clearCart();
        navigate("/my-orders");
      } else if (successfulOrders.length > 0) {
        toast.warning(`${successfulOrders.length} orders placed successfully, ${failedOrders.length} failed.`);
        clearCart();
        navigate("/my-orders");
      } else {
        // Log failed orders for debugging
        failedOrders.forEach((result, index) => {
          console.error(`Order ${index + 1} failed:`, result.data.message);
        });
        toast.error("Failed to place orders. Please try again.");
      }
    } catch (error) {
      console.error("Error placing orders:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(`Order failed: ${error.response.data.message || 'Unknown error'}`);
      } else {
        toast.error("Failed to place orders. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (checkoutCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate("/store")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              <FaArrowLeft />
              Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Checkout
            </h1>
          </div>
          <button
            onClick={() => navigate("/store")}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium transition-colors duration-200 hover:bg-blue-700 sm:w-auto"
          >
            Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
            <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {checkoutCart.map((item) => (
                <div key={item._id} className="flex min-w-0 items-center gap-4 rounded-lg bg-gray-50 p-3">
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
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 text-blue-600 font-semibold">
                        <FaRupeeSign className="text-xs" />
                        <span>{item.price}</span>
                      </div>
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="border-t border-gray-200 mt-6 pt-4">
              <div className="space-y-2">
                {checkoutCart.map((item) => (
                  <div key={item._id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{item.name} (Qty: {item.quantity})</span>
                    <div className="flex items-center gap-1 text-blue-600 font-semibold">
                      <FaRupeeSign className="text-xs" />
                      <span>{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total:</span>
                    <div className="flex items-center gap-1 text-blue-600 font-semibold text-lg">
                      <FaRupeeSign />
                      <span>{getCartTotal()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Details Form */}
            <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Details</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Delivery Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete delivery address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                  isLoading
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 
