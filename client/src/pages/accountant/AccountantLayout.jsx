import React from 'react'
import {Outlet} from 'react-router-dom';
import Navbar from '../../components/accountant/Navbar';

function AccountantLayout() {
  return (
    <>
      <Navbar/>
      <Outlet/>
    </>
  )
}

export default AccountantLayout