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
  CFormTextarea,
  CFormSelect,
} from '@coreui/react'
import { apiUrl } from '../../../components/Config/Config'
import axios from 'axios'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

const List = () => {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [sendModalVisible, setSendModalVisible] = useState(false)
  const [currentDocument, setCurrentDocument] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', author: '', file: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('pending') // Added status for document submission
  const navigate = useNavigate()

  const handleViewDocument = ($id) => {
    console.log(`/document/view/${$id}`)
    navigate(`/document/view/${$id}`)
  }

  useEffect(() => {
    fetchDocuments()
    fetchUsers() // Fetch users to display in send modal
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        type ? `${apiUrl}/api/user/documents/?type=agreement` : `${apiUrl}/api/user/documents/`,
      )
      setDocuments(response.data.document)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/user`)
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await axios.delete(`${apiUrl}/api/documents/${id}/`)
        setDocuments(documents.filter((document) => document.id !== id))
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }
  }

  const handleEdit = (document) => {
    setCurrentDocument(document)
    setFormData({
      title: document.name,
      description: document.description,
      author: document.author,
      file: document.file,
    })
    setEditModalVisible(true)
  }

  const handleSend = (document) => {
    setCurrentDocument(document)
    setSendModalVisible(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`${apiUrl}/api/documents/${currentDocument.id}/`, formData)
      fetchDocuments()
      setEditModalVisible(false)
    } catch (error) {
      console.error('Error updating document:', error)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSendToUser = async (userId) => {
    try {
      // Send document_id and user_id to the API
      const response = await axios.post(`${apiUrl}/api/documents/${currentDocument.id}/submit`, {
        user_id: userId,
        status: status, // Using the status input field or set value
        data: formData, // Assuming data to be sent is the formData (can be adjusted as needed)
      })

      console.log(`Document ${currentDocument.id} sent to user ${userId}:`, response.data)
      alert('Document sent successfully!')
      setSendModalVisible(false) // Close the modal after successful send
    } catch (error) {
      // Check if error has a response (i.e., the request was made and the server responded)
      if (error.response) {
        const errorMessage =
          error.response.data.message || 'Something went wrong. Please try again.'
        console.error('Error sending document:', errorMessage)
        alert(`Error: ${errorMessage}`)
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error sending document: No response received from the server')
        alert('Error: No response received from the server')
      } else {
        // Something else happened while setting up the request
        console.error('Error sending document:', error.message)
        alert(`Error: ${error.message}`)
      }
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <CContainer>
      <h1>Document List</h1>
      {loading ? (
        <CSpinner color='primary' />
      ) : (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope='col'>#</CTableHeaderCell>
                <CTableHeaderCell scope='col'>Name</CTableHeaderCell>
                <CTableHeaderCell scope='col'>Status</CTableHeaderCell>
                <CTableHeaderCell scope='col'>File</CTableHeaderCell>
                <CTableHeaderCell scope='col'>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {documents.map((document, index) => (
                <CTableRow key={document.document.id}>
                  <CTableHeaderCell scope='row'>{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{document.document.name}</CTableDataCell>
                  <CTableDataCell>{document.status}</CTableDataCell>
                  <CTableDataCell>
                    <a
                      className='btn btn-info text-white'
                      href={apiUrl + '/storage/' + document.document.file}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Download
                    </a>
                  </CTableDataCell>
                  <CTableDataCell>
                    <a
                      href='#'
                      className='btn btn-success  text-white'
                      onClick={(e) => {
                        e.preventDefault() // Prevent the default anchor link behavior
                        handleViewDocument(document.document.id)
                      }}
                      rel='noopener noreferrer'
                    >
                      Submit
                    </a>
                    {/* <CButton
                      color="warning"
                      size="sm"
                      onClick={() => handleEdit(document.document)}
                      className="me-2"
                    >
                      Edit
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(document.id)}
                      className="me-2"
                    >
                      Delete
                    </CButton>
                    <CButton
                      color="info"
                      size="sm"
                      onClick={() => handleSend(document)}
                    >
                      Send
                    </CButton> */}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* Send Modal */}
          <CModal visible={sendModalVisible} onClose={() => setSendModalVisible(false)}>
            <CModalHeader>
              <CModalTitle>Send Document</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CFormInput
                type='text'
                placeholder='Search Users'
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope='col'>#</CTableHeaderCell>
                    <CTableHeaderCell scope='col'>Name</CTableHeaderCell>
                    <CTableHeaderCell scope='col'>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredUsers.map((user, index) => (
                    <CTableRow key={user.id}>
                      <CTableHeaderCell scope='row'>{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{user.name}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color='success'
                          size='sm'
                          onClick={() => handleSendToUser(user.id)}
                        >
                          Send
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CModalBody>
            <CModalFooter>
              <CButton color='secondary' onClick={() => setSendModalVisible(false)}>
                Close
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      )}
    </CContainer>
  )
}

export default List
