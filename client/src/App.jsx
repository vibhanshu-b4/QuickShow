import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import SeatLayout from './pages/SeatLayout'
import Mybookings from './pages/Mybookings'
import Favourite from './pages/Favourite'
import MovieDetails from './pages/MovieDetails'
import Movies from './pages/Movies'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import {Toaster} from 'react-hot-toast'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
const App = () => {


  const isAdminRoute= useLocation().pathname.startsWith('/admin')
  return (
    <>
    <Toaster/>
      {!isAdminRoute && <Navbar/>}
      <Routes>
        <Route path='/' element= {<Home/>}/> 
        <Route path='/movies' element={<Movies/>}/>
        <Route path ='/movies/:id' element={<MovieDetails/>}/>
        <Route path ='/movies/:id/:date' element={<SeatLayout/>}/>
        <Route path='/my-bookings' element={<Mybookings/>}/>
        <Route path ='/favourites' element={<Favourite/>}/>
        <Route path='/payment/success' element={<PaymentSuccess/>}/>
        <Route path='/payment/cancel' element={<PaymentCancel/>}/>
        <Route path='/admin/*' element={<Layout/>}>
        <Route index element={<Dashboard/>}/>  
        <Route path='add-shows' element={<AddShows/>}/>  
        <Route path='list-shows' element={<ListShows/>}/>  
        <Route path='list-bookings' element={<ListBookings/>}/>  
        </Route>

      </Routes>
      {!isAdminRoute && <Footer/>}
    </>
  )
}

export default App
