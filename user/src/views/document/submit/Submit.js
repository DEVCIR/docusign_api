import React, { useEffect, useState, useRef } from 'react'
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
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css' // Optional CSS for better rendering

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

const Submit = () => {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentSubmission, setCurrentSubmission] = useState(null)
  const [pdfPages, setPdfPages] = useState([])
  const [isPdfLoading, setIsPdfLoading] = useState(false) // State for PDF loading spinner
  const [viewLoading, setViewLoading] = useState({}) // State for "View" button spinner
  const pdfContainerRef = useRef(null) // Ref to hold the container for PDF pages

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
      // Set the viewLoading state for this submission to true
      setViewLoading((prevState) => ({ ...prevState, [submission.id]: true }))

      // Fetch specific submission data using the documentId
      const response = await axios.get(
        type
          ? `${apiUrl}/api/user/submissions/${submission.document_id}?type=agreement`
          : `${apiUrl}/api/user/submissions/${submission.document_id}`,
      )

      // Set the fetched document and submission data to display in the modal
      const documentData = response.data[0].document
      const submissionDetails = response.data[0].data
      const pdfpath = submission.pdfpath

      setCurrentSubmission({
        ...submission,
        documentData: documentData,
        submissionDetails: submissionDetails,
        pdfpath: pdfpath,
      })

      // Load and render the PDF
      await loadPdf2(pdfpath)
      setViewModalVisible(true)
    } catch (error) {
      console.error('Error fetching submission details:', error)
    } finally {
      // Set the viewLoading state for this submission to false
      setViewLoading((prevState) => ({ ...prevState, [submission.id]: false }))
    }
  }

  const loadPdf2 = (path) => {
    setIsPdfLoading(true) // Show spinner in modal while PDF is loading
    const pdfUrl = `${apiUrl}/my/${path}`
    pdfjsLib
      .getDocument(pdfUrl)
      .promise.then((pdf) => {
        const pages = []
        for (let i = 1; i <= pdf.numPages; i++) {
          pdf.getPage(i).then((page) => {
            const viewport = page.getViewport({ scale: 1.5 })
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            canvas.height = viewport.height
            canvas.width = viewport.width

            page
              .render({
                canvasContext: context,
                viewport: viewport,
              })
              .promise.then(() => {
                pages.push(canvas)
                if (pages.length === pdf.numPages) {
                  setPdfPages(pages)
                  setIsPdfLoading(false) // Hide spinner after PDF is loaded
                }
              })
          })
        }
      })
      .catch((err) => {
        console.error('Error loading PDF:', err)
        setIsPdfLoading(false) // Hide spinner on error
      })
  }

  useEffect(() => {
    if (pdfPages.length > 0 && pdfContainerRef.current) {
      // Clear the container before appending new canvases
      pdfContainerRef.current.innerHTML = ''
      pdfPages.forEach((canvas) => {
        pdfContainerRef.current.appendChild(canvas)
      })
    }
  }, [pdfPages])

  const handleCloseModal = () => {
    setViewModalVisible(false)
    setCurrentSubmission(null) // Reset the submission data
    setPdfPages([]) // Clear the PDF pages
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
                    <button
                      onClick={() =>
                        window.open(`${apiUrl}/storage/${submission.pdfpath}`, '_blank')
                      }
                      className='btn btn-outline-dark'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Download
                    </button>
                  </CTableDataCell>
                  <CTableDataCell>
                    {submission.status !== 'pending' && (
                      <CButton
                        color='info'
                        size='sm'
                        onClick={() => handleViewSubmission(submission)}
                        className='me-2'
                        disabled={viewLoading[submission.id]} // Disable button while loading
                      >
                        {viewLoading[submission.id] ? <CSpinner size='sm' /> : 'View'}
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <CModal visible={viewModalVisible} onClose={handleCloseModal} size='xl'>
            <CModalHeader>
              <CModalTitle>View Submission</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {currentSubmission ? (
                <>
                  {isPdfLoading ? (
                    <div className='text-center'>
                      <CSpinner color='primary' /> {/* Show spinner while PDF is loading */}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }} ref={pdfContainerRef}></div>
                  )}
                </>
              ) : (
                <p>No submission data available.</p>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color='secondary' onClick={handleCloseModal}>
                Close
              </CButton>
              <CButton
                color='primary'
                onClick={() =>
                  window.open(`${apiUrl}/storage/${currentSubmission.pdfpath}`, '_blank')
                }
              >
                Download PDF
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      )}
    </CContainer>
  )
}

export default Submit
