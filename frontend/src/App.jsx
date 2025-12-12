import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import UserLayout from './components/Layout/UserLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
   <BrowserRouter>
   <Routes>
      <Route path='/' element={<UserLayout/>}>
           {/* User Layout */}
           <Route index element={<Home/>}/>
           <Route path="/login" element={<Login/>} />
           <Route path="/signup" element={<Signup/>} />
      </Route>
      <Route>
        {/* Admin Layout */}
      </Route>
   </Routes>
   </BrowserRouter>
  )
}

export default App
