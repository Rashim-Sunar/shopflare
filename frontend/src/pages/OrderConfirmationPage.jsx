import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';

const OrderConfirmationPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
        const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/orders/${id}`,
            {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
            }
        );
        setOrder(res.data.order);
        };

        fetchOrder();
    }, [id]);

    const calculateEstimatedDelivery = (createdAt) => {
        const orderDate = new Date(createdAt);
        orderDate.setDate(orderDate.getDate() + 10); // Add 10 days to the order date
        return orderDate.toLocaleDateString();
    }

    if (!order) return <p>Loading...</p>;

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white'>
      <h1 className='text-4xl font-bold text-center text-emerald-700 mb-8'>
        Thank You for Your Order!
      </h1>

      { order && 
       (
         <div className='p-6 rounded-lg border'>
            <div className='flex justify-between mb-20'>
               <div>
                 {/* OrderId and data */}
                <h2 className='text-lg font-semibold'>
                    Order ID: {order._id}
                </h2>
                <p className='text-gray-500'>
                    Order data: {new Date(order.createdAt).toLocaleDateString()}
                </p>
               </div>

               {/* Estimated Delivery */}
                <div>
                    <p className='text-emerald-700 text-sm'>
                        Estimated Delivery : {calculateEstimatedDelivery(order.createdAt)}
                    </p>
                </div>
            </div>

            {/* Ordered Items */}
            <div className='mb-20'>
                {order?.orderItems?.map((item) => (
                    <div key={item?.productId} className='flex items-center mb-4'>
                        <img 
                          src={item?.image}
                          alt={item?.name} 
                          className='w-16 h-16 object-cover rounded-md mr-4'
                        />
                        <div>
                            <h4 className='text-md font-semibold'>
                                {item?.name}
                            </h4>
                            <p className='text-sm text-gray-500'>
                                {item?.color} | {item?.size}
                            </p>
                        </div>
                        <div className='ml-auto text-right'>
                            <p className='text-md'> ${item?.price}</p>
                            <p className='text-sm text-gray-500'>Qty: {item?.quantity}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment and Delivery Information */}
            <div className='grid grid-cols-2 gap-8'>
                {/* Payment Information */}
                <div>
                    <h4 className='text-lg font-semibold mb-2'> Payment</h4>
                    <p className='text-gray-600'>PayPal</p>
                </div>

                {/* Delivery Information */}
                <div>
                    <h4 className='text-lg font-semibold mb-2'>Delivery</h4>
                    <p className='text-gray-600'>
                        {order?.shippingAddress?.address}
                    </p>
                    <p className='text-gray-600'>
                        {order?.shippingAddress?.city}, {order?.shippingAddress?.country}
                    </p>
                </div>

            </div>
            
        </div>
       )
      }
    </div>
  )
}

export default OrderConfirmationPage
