import React, { useState } from 'react'
import { CContainer, CButton, CFormInput, CForm, CRow, CSpinner } from '@coreui/react'
import { apiUrl } from '../../../components/Config/Config'
import axios from 'axios'
import { toast, Toaster } from 'sonner'

const Add = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Add validation function
  const validateForm = () => {
    const errors = {}

    // Name validation
    if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters long'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('User registered successfully', {
          duration: 3000,
          position: 'top-right',
        })
        setValidationErrors({})
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to register. Please try again.', {
          duration: 3000,
          position: 'top-right',
        })
        setValidationErrors({})
      }
    } catch (error) {
      toast.error('An error occurred during registration', {
        duration: 3000,
        position: 'top-right',
      })
      setValidationErrors({})
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CContainer>
      <Toaster />
      <h1>User Registration</h1>
      <CForm onSubmit={handleSubmit}>
        <CRow>
          <CFormInput
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleInputChange}
            invalid={!!validationErrors.name}
            feedback={validationErrors.name}
            required
          />
        </CRow>
        <br />
        <CRow>
          <CFormInput
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            invalid={!!validationErrors.email}
            feedback={validationErrors.email}
            required
          />
        </CRow>
        <br />
        <CRow>
          <CFormInput
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            invalid={!!validationErrors.password}
            feedback={validationErrors.password}
            required
          />
        </CRow>

        <CButton type="submit" color="primary" style={{ marginTop: '10px' }} disabled={isLoading}>
          {isLoading ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Registering...
            </>
          ) : (
            'Register'
          )}
        </CButton>
      </CForm>
    </CContainer>
  )
}

export default Add
