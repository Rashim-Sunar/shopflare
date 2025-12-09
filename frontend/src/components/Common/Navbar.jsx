import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineUser, HiOutlineShoppingBag} from "react-icons/hi";
import { HiBars3BottomRight } from "react-icons/hi2";
import { HiMiniXMark } from "react-icons/hi2";
import SearchBar from './SearchBar';
import CartDrawer from '../Layout/CartDrawer';

const Navbar = () => {
  const [ openDrawer, setOpenDrawer ] = useState(false);
  const [ navDrawer, setNavDrawer ] = useState(false);
  
  const toggleOpenDrawer = () => {
    setOpenDrawer(!openDrawer);
  }

  const toggleNavDrawer = () => {
    setNavDrawer(!navDrawer);
  }
  return (
    <>
      <nav className='container mx-auto flex items-center justify-between py-4 px-6'>
        {/* Left Logo */}
        <div>
            <Link to='/' className='text-xl font-medium'>
                Logo
            </Link>
        </div>

        {/* Center - Navigation Links */}
        <div className='hidden sm:flex items-center justify-center space-x-6'>
            <Link to='#' className='text-gray-700 hover:text-black text-sm font-medium uppercase'>Men</Link>
            <Link to='#' className='text-gray-700 hover:text-black text-sm font-medium uppercase'>Women</Link>
            <Link to='#' className='text-gray-700 hover:text-black text-sm font-medium uppercase'>Top Wear</Link>
            <Link to='#' className='text-gray-700 hover:text-black text-sm font-medium uppercase'>Bottom Wear</Link>
        </div>
        {/*  Right icons */}
        <div className='flex items-center space-x-4 lg:mr-8'>
            <Link to='/profile'>
                <HiOutlineUser className='h-5 w-5 text-gray-700 hover:text-black'/>
            </Link>
            {/* cart icon */}
            <button className='relative' onClick={toggleOpenDrawer}>
                <HiOutlineShoppingBag className='h-5 w-5 text-gray-700 hover:text-black'/>
                <span className='absolute bg-red-500 -top-2 text-xs text-white rounded-full px-1.5 py-0.5'>4</span>
            </button>
            {/* Search  */}
            <SearchBar/>

           <button className='md:hidden' onClick={toggleNavDrawer}>
                <HiBars3BottomRight />
           </button>
        </div>
      </nav>
       <CartDrawer openDrawer={openDrawer} toggleOpenDrawer={toggleOpenDrawer}/>

       {/* Mobile  Navigation */}
       <div className={`fixed top-0 left-0 z-50 bg-white h-full w-2/3 sm:w-1/2 md:w-1/3 transform transition-transform duration-300
        ${navDrawer ? "translate-x-0" : "-translate-x-full"}`}>
          <div className='flex justify-end p-4'>
            <button onClick={toggleNavDrawer} className='hover:bg-gray-100 p-1 rounded-full'>
              <HiMiniXMark className='h-6 w-6'/>
            </button>
          </div>
          <div className='p-4'>
            <h2 className='text-xl font-semibold mb-2'>Menu</h2>
            <nav className='space-y-2'>
              <Link to='#' className='block text-md text-gray-600 hover:text-black'>
                Men
              </Link>
              <Link to='#' className='block text-gray-600 hover:text-black'>
                Women
              </Link>
              <Link to='#' className='block text-gray-600 hover:text-black'>
                Top Wear
              </Link>
              <Link to='#' className='block text-gray-600 hover:text-black'>
                Bottom Wear
              </Link>
            </nav>
          </div>
       </div>
    </>
  )
}

export default Navbar
