import React, { useEffect } from 'react'
import { HiMiniXMark } from "react-icons/hi2";
import CartContents from '../Cart/CartContents';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCart } from '../../redux/slices/cartSlice';

const CartDrawer = ({ openDrawer, toggleOpenDrawer }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, guestId } = useSelector((state) => state.auth);

  useEffect(() => {
    if(openDrawer){
      dispatch(fetchCart({
        userId: user?._id,
        guestId,
      }));

    }
  }, [dispatch, user, guestId, openDrawer]);

  const handleCheckout = () => {
    toggleOpenDrawer();
    navigate("/checkout");
  }

  return (
    <>
      {/* Drawer */}
      <div
        className={`fixed shadow-lg bg-white top-0 right-0 flex flex-col z-50
        w-6/7 sm:w-1/2 md:w-[35rem] h-full
        transform transition-transform duration-600 ease-in-out
        ${openDrawer ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Close xMark  */}
        <div className='flex justify-end '>
          <button onClick={toggleOpenDrawer} className="p-3">
            <HiMiniXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Cart contents with scrollable area */}
        <div className='flex-grow p-4 overflow-y-auto'>
          <h2 className='text-lg font-semibold pb-2'>
            Your Cart
          </h2>

          {/*  Component for Cart Contents */}
          <CartContents/>
        </div>

        {/* Checkout button fixed at the bottom */}
        <div className='p-4 sticky bg-white bottom-0'>
          <button className='bg-black w-full border-lg rounded-lg p-2 font-semibold text-white hover:bg-gray-800'
          onClick={handleCheckout}>
            Checkout
          </button>
          <p className='text-sm text-center text-gray-500 tracking-lighter mt-2'>
            Shipping, taxes, and discount codes calculated at checkout.
          </p>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
