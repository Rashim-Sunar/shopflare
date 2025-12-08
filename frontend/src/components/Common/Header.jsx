import React from 'react'
import Topbar from '../Layout/Topbar'
import Navbar from './Navbar'

const Header = () => {
  return (
    <div>
      {/* Topbar  */}
      <Topbar/>
      {/* navbar */}
      <Navbar/>
      {/* Cart Drawer  */}
    </div>
  )
}

export default Header
