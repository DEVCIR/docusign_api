import React, { useEffect, useState } from 'react'
import {
  CButton,
  CContainer,
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
import { apiUrl } from 'src/components/Config/Config'
import axios from 'axios'
import { useSearchParams } from 'react-router-dom'

const Submit = () => {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentSubmission, setCurrentSubmission] = useState(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        type ? `${apiUrl}/api/user/submissions?type=agreement` : `${apiUrl}/api/user/submissions`,
      )
      setSubmissions(response.data.submissions)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setLoading(false)
    }
  }

  const handleViewSubmission = async (submission) => {
    try {
      // Fetch specific submission data using the documentId
      const response = await axios.get(
        type
          ? `${apiUrl}/api/user/submissions/${submission.document_id}?type=agreement`
          : `${apiUrl}/api/user/submissions/${submission.document_id}`,
      )

      // Set the fetched document and submission data to display in the modal
      const documentData = response.data[0].document
      const submissionDetails = response.data[0].data // Assuming the first submission is the one to show
      console.log('submissionDetails', submissionDetails)
      setCurrentSubmission({
        ...submission,
        documentData: documentData,
        submissionDetails: submissionDetails,
      })
      await setViewModalVisible(true)
    } catch (error) {
      console.error('Error fetching submission details:', error)
    }
  }

  const handleCloseModal = () => {
    setViewModalVisible(false)
    setCurrentSubmission(null) // Reset the submission data
  }
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
  return (
    <CContainer>
      <h1>Submission Submit</h1>
      {loading ? (
        <CSpinner color='primary' />
      ) : (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope='col'>#</CTableHeaderCell>
                <CTableHeaderCell scope='col'>Name</CTableHeaderCell>
                <CTableHeaderCell scope='col'>File</CTableHeaderCell>
                <CTableHeaderCell scope='col'>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {submissions.map((submission, index) => (
                <CTableRow key={submission.id}>
                  <CTableHeaderCell scope='row'>{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{submission.document.name}</CTableDataCell>
                  <CTableDataCell>
                    <a
                      href={apiUrl + '/public/storage/' + submission.file}
                      className='btn btn-outline-dark'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Download
                    </a>
                  </CTableDataCell>
                  <CTableDataCell>
                    {submission.status !== 'pending' && (
                      <CButton
                        color='info'
                        size='sm'
                        onClick={() => handleViewSubmission(submission)}
                        className='me-2'
                      >
                        View
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* View Modal */}
          {/* <CModal visible={viewModalVisible} onClose={handleCloseModal}>
            <CModalHeader>
              <CModalTitle>View Submission</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {currentSubmission ? (
                <>
                  <p><strong>Document Title:</strong> {currentSubmission.documentData.name}</p>
                  <p><strong>Description:</strong> {currentSubmission.documentData.description || 'N/A'}</p>
                  <p><strong>Author:</strong> {currentSubmission.documentData.author || 'N/A'}</p>
                  <p><strong>Status:</strong> {currentSubmission.submissionDetails.status}</p>
                  <p><strong>Signature:</strong>
                    <img
                      src={currentSubmission.submissionDetails.signature}
                      alt="Signature"
                      style={{ width: '200px', height: 'auto' }}
                    />
                  </p>
                  <p><strong>File:</strong>
                    <a href={apiUrl + "/public/storage/" + currentSubmission.documentData.path} target="_blank" rel="noopener noreferrer">
                      Download PDF
                    </a>
                  </p>
                </>
              ) : (
                <p>No submission data available.</p>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={handleCloseModal}>
                Close
              </CButton>
            </CModalFooter>
          </CModal> */}

          <CModal visible={viewModalVisible} onClose={handleCloseModal}>
            <CModalHeader>
              <CModalTitle>View Submission</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {currentSubmission ? (
                <>
                  {Object.keys(currentSubmission.submissionDetails).map((key) =>
                    key !== 'status' &&
                    key !== 'signature' &&
                    key !== 'undefined' &&
                    key !== 'null' ? (
                      <p key={key}>
                        <strong>{capitalizeFirstLetter(key)}:</strong>{' '}
                        {currentSubmission.submissionDetails[key] || 'N/A'}
                      </p>
                    ) : null,
                  )}

                  {currentSubmission.submissionDetails.signature && (
                    <p>
                      <strong>Signature:</strong>
                      <img
                        src={currentSubmission.submissionDetails.signature}
                        alt='Signature'
                        style={{ width: '200px', height: 'auto' }}
                      />
                    </p>
                  )}
                  <p>
                    <strong>File:</strong>
                    <a
                      href={apiUrl + '/public/storage/' + currentSubmission.documentData.path}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Download PDF
                    </a>
                  </p>
                </>
              ) : (
                <p>No submission data available.</p>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color='secondary' onClick={handleCloseModal}>
                Close
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      )}
    </CContainer>
  )
}

export default Submit
