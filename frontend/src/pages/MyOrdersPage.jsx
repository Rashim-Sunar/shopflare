import React from 'react'
import { useNavigate } from 'react-router-dom';

  // Mock order data
const orders = [
    {
      id: "ORD12345",
      image: "https://picsum.photos/200/200?random=1",
      createdAt: "2025-01-15",
      shippingAddress: "Kathmandu, Nepal",
      qty: 2,
      price: 120,
      paymentStatus: "Paid",
    },
    {
      id: "ORD67890",
      image: "https://picsum.photos/200/200?random=2",
      createdAt: "2025-02-01",
      shippingAddress: "Pokhara, Nepal",
      qty: 1,
      price: 60,
      paymentStatus: "Pending",
    },
];

const MyOrdersPage = () => {

    const navigate = useNavigate();
  
    const handleRowClick = (orderId) => {
        navigate(`/order/${orderId}`);
    }

  return (
    <div className="lg:col-span-2 p-6">
        <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

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
                  key={order.id}
                  onClick={ () => handleRowClick(order.id) }
                  className="border-b-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  {/* Image */}
                  <td className="py-3 px-4">
                    <img
                      src={order.image}
                      alt="product"
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  </td>

                  {/* Order ID */}
                  <td className="py-3 px-4 text-black font-semibold">{order.id}</td>

                  {/* Date */}
                  <td className="py-3 px-4">{order.createdAt}</td>

                  {/* Qty */}
                  <td className="py-3 px-4">{order.qty}</td>

                  {/* Price */}
                  <td className="py-3 px-4">${order.price}</td>


                  {/* Shipping */}
                  <td className="py-3 px-4 text-gray-700">
                    {order.shippingAddress}
                  </td>

                  {/* Payment Status */}
                  <td
                    className={`py-3 px-4 ${
                      order.paymentStatus === "Paid"
                        ? "text-green-600"
                        : "text-yellow-600"
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
