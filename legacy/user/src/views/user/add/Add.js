import React, { useState } from 'react';
import { CContainer, CButton, CFormInput, CForm, CRow } from '@coreui/react';
import { apiUrl } from "../../../components/Config/Config";
import axios from 'axios';
const Add = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('User registered successfully');
        setError('');
      } else {
        setError('Failed to register. Please try again.');
        setSuccess('');
      }
    } catch (error) {
      setError('An error occurred during registration');
      setSuccess('');
    }
  };

  return (
    <CContainer>
      <h1>User Registration</h1>
      <CForm onSubmit={handleSubmit}>
        <CRow>
          <CFormInput
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </CRow>
        <br></br>
        <CRow>
          <CFormInput
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </CRow>
        <br></br>
        <CRow>
          <CFormInput
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </CRow>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <CButton type="submit" color="primary" style={{ marginTop: '10px' }}>
          Register
        </CButton>
      </CForm>
    </CContainer>
  );
};

export default Add;
