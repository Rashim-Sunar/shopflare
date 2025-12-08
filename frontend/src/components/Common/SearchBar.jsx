import React, { useState } from 'react'
import { MdSearch } from "react-icons/md";
import { HiMiniXMark } from "react-icons/hi2";

const SearchBar = () => {
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ isOpen, setIsOpen ] = useState(false);

    const handleSeachToggle = () => {
        setIsOpen(!isOpen);
    }

  return (
    <div className= {`flex items-center justify-center w-full transition-all duration-300 
    ${isOpen ? 'absolute bg-white top-0 left-0 h-24 z-50' : 'w-auto'}`}>
      { isOpen ? 
        <form className='relative flex items-center justify-center w-full'>
            <div className='relative w-1/2'>
                <input type='text' placeholder='Search'
                    className='bg-slate-100 py-2 px-4 rounded-lg w-full placeholder:text-gray-500'
                >
                </input>
                <button onClick={handleSeachToggle} >
                    <MdSearch className='absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 hover:text-gray-800'/>
                </button>
            </div>
            <button className='absolute right-4 top-1/2 transition-all duration-300 transform -translate-1/2 hover:bg-gray-100 p-1 rounded-full'
            onClick={handleSeachToggle}>
                <HiMiniXMark className='h-5 w-5'/>
            </button>
        </form> : 
        <>
            <MdSearch onClick={handleSeachToggle} className='w-5 h-5 text-gray-700 hover:text-black'/>
        </>
      }
    </div>
  )
}

export default SearchBar
