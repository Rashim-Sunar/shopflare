import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import UserLayout from './components/Layout/UserLayout'

function App() {
  return (
   <BrowserRouter>
   <Routes>
      <Route path='/' element={<UserLayout/>}>
           {/* User Layout */}
      </Route>

      <Route> </Route>
   </Routes>
   </BrowserRouter>
  )
}

export default App
