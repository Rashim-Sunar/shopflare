import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const MyOrdersPage = () => {
  
    const navigate = useNavigate();
    const { orders, loading } = useSelector((state) => state.orders);

    const handleRowClick = (orderId) => {
        navigate(`/order/${orderId}`);
    }

    if(loading.list) return <div> Loading orders.....</div>

  return (
    <div className="lg:col-span-2 p-2">
        <h2 className="text-2xl font-semibold mb-6 lg:py-0 py-6">My Orders</h2>

        <div className="overflow-x-auto bg-white shadow-md rounded-xl ">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-gray-800 text-md text-left">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Shipping Address</th>
                <th className="py-3 px-4">Payment</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={ () => handleRowClick(order._id) }
                  className="border-b-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  {/* Image */}
                  <td className="py-3 px-4">
                    <img
                      src={order.orderedItems?.[0]?.image}
                      alt="product"
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  </td>

                  {/* Order ID */}
                  <td className="py-3 px-4 text-black font-semibold">{order._id}</td>

                  {/* Date */}
                  <td className="py-3 px-4">
                     {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  {/* Qty */}
                  <td className="py-3 px-4">
                    {order.orderedItems.reduce(
                      (sum, item) => sum + item.quantity, 0
                    )}
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4">${order.totalPrice}</td>


                  {/* Shipping */}
                  <td className="py-3 px-4 text-gray-700">
                    {order.shippingAddress?.country}, {order.shippingAddress?.city}
                  </td>

                  {/* Payment Status */}
                  <td
                    className={`py-3 px-4 ${
                      order.isPaid ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {order.paymentStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  )
}

export default MyOrdersPage
