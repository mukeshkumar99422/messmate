import React from 'react'
import {Outlet} from 'react-router-dom';
import Navbar from '../../components/accountant/Navbar';
import Footer from '../../components/common/Footer';

function AccountantLayout() {
  return (
    <>
      <Navbar/>
      <Outlet/>
      <Footer/>
    </>
  )
}

export default AccountantLayout