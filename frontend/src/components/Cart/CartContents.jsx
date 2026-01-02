import React from 'react'
import { AiOutlineDelete } from "react-icons/ai";
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { removeFromCart, fetchCart } from '../../redux/slices/cartSlice';

const CartContents = () => {
    const { cart, loading, error} = useSelector((state) => state.cart);
    const { user, guestId } = useSelector((state) => state.auth);

    const dispatch = useDispatch();

    const handleCartItemDelete = async(productId, size, color) => {
      dispatch(removeFromCart({
        productId,
        size,
        color,
        userId: user?._id,
        guestId
      })).then(() => {
        toast.success("Item removed from cart successfully", {
          duration: 800
        })
      }).finally(() => {
        dispatch(fetchCart({userId: user?._id, guestId}));
      });
    }

    if(loading.fetch){
        return <div>Fetching the cart items.....</div>
    }

    if(error){
        return <div>Error fetching the cart items.</div>
    }

  return (
    <div>
      {
        cart?.products?.map((product, index) => (
            <div key={index} className='flex items-start border-gray-400 border-b py-4 justify-between pr-1'>
                <div className='flex flex-start'>
                    <img src={product.image} alt={product.name} className='w-20 h-24 object-cover mr-4 rounded'/>
                     <div className='flex flex-start flex-col'>
                        <h2>{product.name}</h2>
                        <p className='text-sm text-gray-500'>
                          size: {product.size} | color: {product.color}
                        </p>

                        {/* Increment Decrement Button */}
                        <div className='flex items-center mt-3 space-x-3'>
                            <button className='rounded text-lg font-medium px-2 py-1 rounded bg-slate-100'> - </button>
                            <p className='text-sm'>{product.quantity}</p>
                            <button className='rounded text-lg font-medium px-2 py-1 rounded bg-slate-100'> + </button>
                        </div>
                    </div>
                </div>
                <div>
                    <p className='text-gray-700 font-medium'>${product.price}</p>
                    <AiOutlineDelete className='h-5 w-5 text-red-700 ' onClick={() => handleCartItemDelete(product.productId, product.size, product.color)}/>
                </div>

            </div>
        ))
      }
    </div>
  )
}

export default CartContents
