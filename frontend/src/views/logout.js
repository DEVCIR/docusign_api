import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../components/Config/Config'
import { CSpinner, CContainer } from '@coreui/react'

const Logout = () => {
  useEffect(() => {
    const performLogout = async () => {
      try {
        await axios.post(`${apiUrl}/api/logout`)
        localStorage.removeItem('token')
        window.location.href = '/login'
      } catch (err) {
        console.error('Logout failed:', err)
      }
    }

    performLogout()
  }, [])

  return (
    <CContainer
      className="d-flex justify-content-center align-items-center"
      style={{ height: '100vh' }}
    >
      <div className="text-center">
        <CSpinner color="primary" />
        <p className="mt-3">Logging out...</p>
      </div>
    </CContainer>
  )
}

export default Logout
