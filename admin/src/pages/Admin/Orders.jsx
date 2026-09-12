import  { useContext } from 'react';
import { OrderContext } from '../../context/OrderContext';
import {
  DollarSign,
  Package,
  Check,
  X,
  Calendar,
  User,
  Mail,
  Phone,
  CreditCard,
  Banknote
} from 'lucide-react';

const Orders = () => {
  const { orders, cancelAdminOrder, totalEarnings, completeOrder } = useContext(OrderContext);

  const getStatusBadge = (item) => {
    if (!item.orderPlaced) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Cancelled</span>;
    }
    if (item.orderDelivered) {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Completed</span>;
    }
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Pending</span>;
  };

  const getPaymentBadge = (paymentStatus) => {
    return paymentStatus ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-blue-300 text-blue-700 gap-1.5">
        <CreditCard className="w-4 h-4" /> Online
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-gray-300 text-gray-700 gap-1.5">
        <Banknote className="w-4 h-4" /> Cash
      </span>
    );
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-gradient-to-b from-gray-50 to-gray-100 p-3 font-sans sm:p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-lg shadow-sm p-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Orders Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage customer orders efficiently</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className="text-sm font-medium text-gray-600">Total Revenue: </span>
            <span className="text-lg font-semibold text-green-600">₹{totalEarnings}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-100 rounded-full">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Earnings</h3>
            <p className="text-2xl font-bold text-green-600">₹{totalEarnings}</p>
            <p className="text-xs text-gray-500">All-time revenue</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 rounded-full">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
            <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            <p className="text-xs text-gray-500">All orders placed</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Calendar className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Pending Orders</h3>
            <p className="text-2xl font-bold text-yellow-600">{orders.filter(order => order.orderPlaced && !order.orderDelivered).length}</p>
            <p className="text-xs text-gray-500">Awaiting completion</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Package className="h-5 w-5" /> All Orders
          </h3>
        </div>
        <div className="p-4 overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No Orders Available</p>
              <p className="text-gray-500 text-sm">Orders will appear here when customers place them</p>
            </div>
          ) : (
            <table className="min-w-[768px] w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Medicine</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Order Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.slice().reverse().map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {item.medData?.image ? (
                            <img src={item.medData.image} alt={item.medData.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400 mx-auto my-3" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.medData?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">₹{item.medData?.price || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{item.userData?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-4 h-4" /> {item.userData?.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-4 h-4" /> {item.userData?.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getPaymentBadge(item.paymentStatus)}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(item)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {item.orderPlaced && !item.orderDelivered ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                          <button onClick={() => completeOrder(item._id)} className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md text-sm font-medium">
                            <Check className="w-4 h-4 mr-1" /> Complete
                          </button>
                          <button onClick={() => cancelAdminOrder(item._id)} className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md text-sm font-medium">
                            <X className="w-4 h-4 mr-1" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
