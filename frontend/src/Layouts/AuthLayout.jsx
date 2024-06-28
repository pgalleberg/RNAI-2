import React from 'react'
import { Outlet } from 'react-router-dom'
import { Protected } from '../components/Protected'
import DashboardLayout from './Dashboard/DasboardLayout'

const AuthLayout = () => {
  return (
    <Protected>
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    </Protected>
  )
}

export default AuthLayout