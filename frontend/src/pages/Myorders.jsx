import { useContext, useEffect, useState } from "react";
import { AppContext } from '../context/AppContext';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { FaBox, FaMapMarkerAlt, FaClock, FaRupeeSign } from 'react-icons/fa'; // Added icons for better UI

const MyOrders = () => {
  const { backendUrl, token, getMedicineData } = useContext(AppContext);
  const navigate = useNavigate();

  const [orders, setOrder] = useState([]);

  const getUserOrder = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/userOrder', { headers: { token } });
      if (data.success) {
        // Sort by createdAt timestamp (newest first)
        const sorted = data.order.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrder(sorted);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-order', { orderId }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        getUserOrder();
        getMedicineData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Medicine Order Payment",
      description: "Payment for medicine order",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);
        try {
          const { data } = await axios.post(backendUrl + '/api/user/verify-medOrderRazorpay', response, { headers: { token } });
          if (data.success) {
            getUserOrder();
            navigate('/my-orders');
            toast.success(data.message);
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const orderRazorpay = async (orderId) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-orderRazorpay', { orderId }, { headers: { token } });
      if (data.success) {
        console.log(data.order);
        initPay(data.order);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      getUserOrder();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-700 mb-6 border-b-2 border-cyan-200 pb-2">
          My Orders
        </h1>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
            <FaBox className="text-5xl text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">No orders found.</p>
            <button
              onClick={() => navigate('/store')}
              className="mt-4 bg-cyan-700 text-white px-6 py-2 rounded-full font-medium hover:bg-cyan-600 transition-all duration-300"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-lg transition-shadow duration-300"
              >
                {/* Medicine Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                  <img
                    className="w-full h-full object-cover rounded-md border border-gray-200"
                    src={item.medData.image}
                    alt={item.medData.name}
                  />
                </div>

                {/* Order Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaBox className="text-cyan-700 text-lg" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {item.medData.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <FaRupeeSign className="text-cyan-600" />
                    <p>₹{item.medData.price} × {item.quantity || 1} = ₹{item.totalPrice || item.medData.price}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <FaMapMarkerAlt className="text-cyan-600" />
                    <p>{item.address}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaClock className="text-cyan-600" />
                    <p>{item.orderDate}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {item.orderPlaced && item.paymentStatus && !item.orderDelivered && (
                    <button className="w-full sm:w-48 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-md border border-indigo-200 hover:bg-indigo-100 transition-colors duration-200">
                      Paid
                    </button>
                  )}
                  {item.orderPlaced && !item.paymentStatus && !item.orderDelivered && (
                    <button
                      onClick={() => orderRazorpay(item._id)}
                      className="w-full sm:w-48 py-2 bg-cyan-700 text-white font-medium rounded-md hover:bg-cyan-600 transition-colors duration-200"
                    >
                      Pay Online
                    </button>
                  )}
                  {item.orderPlaced && !item.orderDelivered && (
                    <button
                      onClick={() => cancelOrder(item._id)}
                      className="w-full sm:w-48 py-2 bg-red-50 text-red-600 font-medium rounded-md border border-red-200 hover:bg-red-100 transition-colors duration-200"
                    >
                      Cancel Order
                    </button>
                  )}
                  {!item.orderPlaced && (
                    <button className="w-full sm:w-48 py-2 bg-red-50 text-red-600 font-medium rounded-md border border-red-200">
                      Order Cancelled
                    </button>
                  )}
                  {item.orderDelivered && (
                    <button className="w-full sm:w-48 py-2 bg-green-50 text-green-600 font-medium rounded-md border border-green-200">
                      Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;