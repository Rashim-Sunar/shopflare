import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import UserLayout from './components/Layout/UserLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import CollectionPage from './pages/CollectionPage'
import ProductDetails from './components/Products/ProductDetails'
import Checkout from './components/Cart/Checkout'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import MyOrdersPage from './pages/MyOrdersPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import AdminLayout from './components/Admin/AdminLayout'
import AdminHomePage from './pages/AdminHomePage'
import UserManagement from './components/Admin/UserManagement'
import ProductManagement from './components/Admin/ProductManagement'
import EditProductPage from './components/Admin/EditProductPage'
import OrderManagement from './components/Admin/OrderManagement'

import { Provider } from 'react-redux';

function App() {
  return (
   <BrowserRouter>
   <Routes>
      <Route path='/' element={<UserLayout/>}>
           {/* User Layout */}
           <Route index element={<Home/>}/>
           <Route path="/login" element={<Login/>} />
           <Route path="/signup" element={<Signup/>} />
           <Route path='/profile' element={<Profile/>}/>
           <Route path='/collections/:collection' element={<CollectionPage/>}/>
           <Route path='/product/:id' element = {<ProductDetails/>}/>
           <Route path='/checkout' element = {<Checkout/>}/>
           <Route path='/order-confirmation' element={<OrderConfirmationPage/>}/>
           <Route path='/my-orders' element = {<MyOrdersPage/>} /> 
           <Route path='order/:id' element = {<OrderDetailsPage/>} />
      </Route>
      <Route path='/admin' element = { <AdminLayout/> } >
        {/* Admin Layout */}
        <Route index element = { <AdminHomePage/> }/>
        <Route path='users' element = { <UserManagement/> }/>
        <Route path='products' element = {<ProductManagement/>} />
        <Route path='products/:id/edit' element = {<EditProductPage/>}/>
        <Route path='orders' element = {<OrderManagement/>}/>
      </Route>
   </Routes>
   </BrowserRouter>
  )
}

export default App
