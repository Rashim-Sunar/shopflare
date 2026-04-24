import React from 'react'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { Outlet } from 'react-router-dom'
import FloatingAiAssistant from '../Common/FloatingAiAssistant'

const UserLayout = () => {
  return (
    <header>
       {/* Header */}
       <Header/>
       {/* Main content */}
       <main>
          <Outlet/>
       </main>
       <FloatingAiAssistant />
       {/* Footer  */}
       <Footer/>
    </header>
  )
}

export default UserLayout
