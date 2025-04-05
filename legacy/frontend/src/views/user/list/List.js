import React, { useState, useEffect } from 'react'
import {
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CContainer,
  CSpinner,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CButtonGroup,
} from '@coreui/react'
import { apiUrl } from '../../../components/Config/Config'
import axios from 'axios'
import { toast, Toaster } from 'sonner'

const List = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [verifyingUsers, setVerifyingUsers] = useState({})
  const [markingVerifiedUsers, setMarkingVerifiedUsers] = useState({})
  const [updatingUser, setUpdatingUser] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/user`)
      const data = await response.json()
      setUsers(data)
      console.log(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${apiUrl}/api/user/${id}`)
        setUsers(users.filter((user) => user.id !== id))
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleEdit = (user) => {
    setCurrentUser(user)
    setFormData({ name: user.name, email: user.email, password: '' })
    setEditModalVisible(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleUpdate = async () => {
    try {
      setUpdatingUser(true)

      await axios.put(`${apiUrl}/api/user/${currentUser.id}`, formData)
      fetchUsers() // Refresh the user list
      setEditModalVisible(false)

      toast.success('User updated successfully', {
        duration: 3000,
        position: 'top-right',
      })
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(`${error.response?.data?.message || 'Failed to update user'}`, {
        duration: 3000,
        position: 'top-right',
      })
    } finally {
      setUpdatingUser(false)
    }
  }

  const sendVerificationEmail = async (userId) => {
    try {
      setVerifyingUsers((prev) => ({ ...prev, [userId]: true }))

      const response = await axios.post(`${apiUrl}/api/admin/users/${userId}/send-verification`)
      toast.success(`${response.data.message}`, {
        duration: 3000,
        position: 'top-right',
      })

      fetchUsers()
    } catch (err) {
      toast.error(`${err.response?.data?.message || 'Failed to send verification email'}`, {
        duration: 3000,
        position: 'top-right',
      })
      console.error(err)
    } finally {
      setVerifyingUsers((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const markUserVerified = async (userId) => {
    try {
      setMarkingVerifiedUsers((prev) => ({ ...prev, [userId]: true }))

      const response = await axios.post(`${apiUrl}/api/admin/users/${userId}/mark-verified`)
      toast.success(`User marked as verified successfully`, {
        duration: 3000,
        position: 'top-right',
      })

      fetchUsers()
    } catch (err) {
      toast.error(`${err.response?.data?.message || 'Failed to mark user as verified'}`, {
        duration: 3000,
        position: 'top-right',
      })
      console.error(err)
    } finally {
      setMarkingVerifiedUsers((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <CContainer>
      <Toaster />
      <h1>User List</h1>
      {loading ? (
        <CSpinner color="primary" />
      ) : (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                <CTableHeaderCell scope="col">Verified</CTableHeaderCell>
                <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map((user, index) => (
                <CTableRow key={user.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{user.name}</CTableDataCell>
                  <CTableDataCell>{user.email}</CTableDataCell>
                  <CTableDataCell>{user.email_verified_at ? 'Yes' : 'No'}</CTableDataCell>
                  <CTableDataCell>
                    <CButtonGroup>
                      {!user?.email_verified_at && (
                        <>
                          <CButton
                            className="rounded me-2"
                            color="success"
                            size="sm"
                            onClick={() => sendVerificationEmail(user.id)}
                            disabled={verifyingUsers[user.id]}
                          >
                            {verifyingUsers[user.id] ? (
                              <>
                                <CSpinner size="sm" component="span" aria-hidden="true" />
                              </>
                            ) : (
                              'Verify'
                            )}
                          </CButton>
                          <CButton
                            className="rounded me-2"
                            color="info"
                            size="sm"
                            onClick={() => markUserVerified(user.id)}
                            disabled={markingVerifiedUsers[user.id]}
                          >
                            {markingVerifiedUsers[user.id] ? (
                              <>
                                <CSpinner size="sm" component="span" aria-hidden="true" />
                              </>
                            ) : (
                              'Mark Verified'
                            )}
                          </CButton>
                        </>
                      )}
                      <CButton
                        className="rounded me-2"
                        color="warning"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </CButton>
                      <CButton
                        className="rounded me-2"
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </CButton>
                    </CButtonGroup>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* Edit Modal */}
          <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
            <CModalHeader>
              <CModalTitle>Edit User</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CForm>
                <div className="mb-3">
                  <CFormLabel htmlFor="name">Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="email">Email</CFormLabel>
                  <CFormInput
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="password">Password</CFormLabel>
                  <CFormInput
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank if you don't want to change"
                  />
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => setEditModalVisible(false)}
                disabled={updatingUser}
              >
                Close
              </CButton>
              <CButton color="primary" onClick={handleUpdate} disabled={updatingUser}>
                {updatingUser ? (
                  <>
                    <CSpinner size="sm" component="span" aria-hidden="true" className="me-1" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      )}
    </CContainer>
  )
}

export default List
