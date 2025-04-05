import React, { useEffect, useState } from 'react'
import {
  CButton,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { apiUrl } from 'src/components/Config/Config'

const SendModal = ({ isVisible, onClose, currentDocument, onSendToUser, onSendViaEmail }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingUsers, setLoadingUsers] = useState({})
  const [emailQuery, setEmailQuery] = useState('')
  const [users, setUsers] = useState([])
  const [emailSending, setEmailSending] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user`)
        setUsers(response.data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    if (isVisible) fetchUsers()
  }, [isVisible])

  const handleSearchChange = (e) => setSearchQuery(e.target.value)

  const handleEmailChange = (e) => {
    const emails = e.target.value.split(',').map((email) => email.trim())
    setEmailQuery(emails)
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendToUser = async (userId) => {
    setLoadingUsers((prev) => ({ ...prev, [userId]: true }))
    try {
      await onSendToUser(userId)
    } finally {
      setLoadingUsers((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleSendViaEmail = async (emails) => {
    setEmailSending(true)
    try {
      await onSendViaEmail(emails)
    } finally {
      setEmailSending(false)
    }
  }

  return (
    <CModal visible={isVisible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Send Document</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormInput type="email" placeholder="Send via Email" onChange={handleEmailChange} />
        <CButton
          color="success"
          size="sm"
          className="mt-2"
          onClick={() => handleSendViaEmail(emailQuery)}
          disabled={emailSending}
        >
          {emailSending ? <CSpinner size="sm" /> : 'Send via Email'}
        </CButton>

        <hr className="my-4" />

        <CFormInput
          type="text"
          placeholder="Search Users"
          value={searchQuery}
          onChange={handleSearchChange}
          className="mb-3"
        />
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredUsers.map((user, index) => (
              <CTableRow key={user.id}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{user.name}</CTableDataCell>
                <CTableDataCell>
                  {loadingUsers[user.id] ? (
                    <CSpinner />
                  ) : (
                    <CButton color="success" size="sm" onClick={() => handleSendToUser(user.id)}>
                      Send
                    </CButton>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CModalBody>
    </CModal>
  )
}

export default SendModal
