import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { apiUrl } from '../../../components/Config/Config'
import { toast, Toaster } from 'sonner'

const Login = () => {
  const [email, setEmail] = useState('ahsan@gmail.com')
  const [password, setPassword] = useState('12345678')
  const [loading, setLoading] = useState(false)
  // const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post(
        `${apiUrl}/api/user/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true, // Include credentials in the request
        },
      )

      // Success path
      localStorage.setItem('token', response.data.access_token)
      // Store API key if provided in the response
      if (response.data.api_key) {
        localStorage.setItem('api_key', response.data.api_key)
      }
      toast.success('Login successful!', {
        duration: 3000,
        position: 'top-right',
      })
      navigate('/dashboard') // Redirect to the dashboard or another page on success
    } catch (err) {
      console.error('Login error:', err)

      // Handle different types of errors
      if (err.response) {
        const { status, data } = err.response

        // Handle email verification error (from backend 403 response)
        if (status === 403 && data.verified === false) {
          toast.error('Please verify your email address before logging in.', {
            duration: 5000,
            position: 'top-right',
          })
          console.log('Email verification required for:', data.email)
          // Could add additional handling here for resending verification
        }
        // Handle access denied (role is not 'user')
        else if (status === 403) {
          toast.error('Access denied. You do not have permission to access this resource.', {
            duration: 4000,
            position: 'top-right',
          })
        }
        // Authentication error - invalid credentials
        else if (status === 401) {
          toast.error('The provided credentials are incorrect.', {
            duration: 4000,
            position: 'top-right',
          })
        }
        // Validation errors
        else if (status === 422) {
          console.log('Validation errors:', data.errors)
          // Get specific validation errors if available
          const errorMessages = []
          if (data.errors) {
            Object.values(data.errors).forEach((fieldErrors) => {
              fieldErrors.forEach((error) => errorMessages.push(error))
            })
          }

          // Display specific errors or fallback to general message
          if (errorMessages.length > 0) {
            errorMessages.forEach((error) => {
              toast.error(error, {
                duration: 4000,
                position: 'top-right',
              })
            })
          } else {
            toast.error(data.message || 'Validation error. Please check your inputs.', {
              duration: 4000,
              position: 'top-right',
            })
          }
        }
        // Server error
        else if (status === 500) {
          toast.error('An error occurred during login. Please try again later.', {
            duration: 4000,
            position: 'top-right',
          })
        }
        // Other status codes
        else {
          toast.error(`Error: ${data.message || 'Something went wrong'}`, {
            duration: 4000,
            position: 'top-right',
          })
        }
      }
      // Network error - no response received
      else if (err.request) {
        toast.error('Network error. Please check your connection and try again.', {
          duration: 4000,
          position: 'top-right',
        })
        console.log('Network error - no response received')
      }
      // Setup error
      else {
        toast.error('An unexpected error occurred. Please try again later.', {
          duration: 4000,
          position: 'top-right',
        })
        console.log('Error message:', err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-body-tertiary min-vh-100 d-flex flex-row align-items-center'>
      <CContainer>
        <Toaster />
        <CRow className='justify-content-center'>
          <CCol md={8}>
            <CCardGroup>
              <CCard className='p-4'>
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className='text-body-secondary'>Sign In to your account</p>
                    {/* {error && <div className='text-danger mb-3'>{error}</div>} */}
                    <CInputGroup className='mb-3'>
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder='Username'
                        autoComplete='username'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className='mb-4'>
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type='password'
                        placeholder='Password'
                        autoComplete='current-password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color='primary' className='px-4' type='submit' disabled={loading}>
                          {loading ? 'Loading...' : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className='text-right'>
                        <CButton color='link' className='px-0'>
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
