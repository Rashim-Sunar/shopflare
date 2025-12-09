import React from 'react'
import { AiOutlineDelete } from "react-icons/ai";

const CartContents = () => {
    const cartProducts = [
        {
            productId: 1,
            name: "T-shirt",
            size: "M",
            color: "Red",
            quantity: 1,
            price: 15,
            image: "https://picsum.photos/200/300?random=1"
        },
         {
            productId: 2,
            name: "Jeans",
            size: "M",
            color: "Blue",
            quantity: 1,
            price: 10,
            image: "https://picsum.photos/200/300?random=2"
        },
         {
            productId: 3,
            name: "T-shirt",
            size: "L",
            color: "Black",
            quantity: 2,
            price: 20,
            image: "https://picsum.photos/200/300?random=3"
        },
         {
            productId: 4,
            name: "Shirt",
            size: "L",
            color: "White",
            quantity: 1,
            price: 30,
            image: "https://picsum.photos/200/300?random=4"
        },
        {
            productId: 5,
            name: "Shirt",
            size: "L",
            color: "White",
            quantity: 1,
            price: 10,
            image: "https://picsum.photos/200/300?random=5"
        },
    ]

  return (
    <div>
      {
        cartProducts.map((product, index) => (
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
                    <AiOutlineDelete className='h-5 w-5 text-red-700'/>
                </div>

            </div>
        ))
      }
    </div>
  )
}

export default CartContents
