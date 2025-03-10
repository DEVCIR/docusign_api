import React, { useState, useEffect, useRef } from 'react'
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
} from '@coreui/react'
import { apiUrl } from '../../../components/Config/Config'
import { useSearchParams } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import axios from 'axios'
import { toast, Toaster } from 'sonner'

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
        type ? `${apiUrl}/api/submissions?type=agreement` : `${apiUrl}/api/submissions`,
      )
      // console.log(response.data.submissions)
      setSubmissions(response.data.submissions)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setLoading(false)
    }
  }

  const handleViewSubmission = async (submission, userID) => {
    try {
      // ;(url = `${apiUrl}/api/submissions${user ? `/${userID}` : ''}?type=${type ? type : 'template'}`),
      setViewLoading((prevState) => ({ ...prevState, [submission.id]: true }))
      const userId = submission.user?.id
      // const userId = submission.user?.id
      const response = await axios.get(
        type
          ? `${apiUrl}/api/submissions2/${submission.document_id}/${userId}?type=agreement`
          : `${apiUrl}/api/submissions2/${submission.document_id}/${userId}`,
      )

      const documentData = response.data[0].document
      const submissionDetails = response.data[0].data
      // const pdfpath = documentData.path // original pdf
      const pdfpath = submission.pdfpath // pdf with fields
      console.log(submission)

      setCurrentSubmission({
        ...submission,
        documentData,
        submissionDetails,
        pdfpath,
      })

      await loadPdf2(pdfpath)
      setViewModalVisible(true)
    } catch (error) {
      console.error('Error fetching submission details:', error)
      toast.error('Failed to load submission')
    } finally {
      setViewLoading((prevState) => ({ ...prevState, [submission.id]: false }))
    }
  }

  const loadPdf = (path) => {
    setIsPdfLoading(true)
    const pdfUrl = `${apiUrl}/public/storage/${path}`
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
                  setIsPdfLoading(false)
                }
              })
          })
        }
      })
      .catch((err) => {
        console.error('Error loading PDF:', err)
        setIsPdfLoading(false)
        toast.error('Failed to load PDF')
      })
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
      pdfContainerRef.current.innerHTML = ''
      pdfPages.forEach((canvas) => {
        pdfContainerRef.current.appendChild(canvas)
      })
    }
  }, [pdfPages])

  const handleCloseModal = () => {
    setViewModalVisible(false)
    setCurrentSubmission(null)
    setPdfPages([])
  }

  const handleDownload = (submission) => {
    const url = `${apiUrl}/my/${submission.document.path}`
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', submission.document.name || 'download') // Ensures a download prompt
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <CContainer>
      <Toaster />
      <h1>Submission Submit</h1>
      {loading ? (
        <CSpinner color="primary" />
      ) : (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                <CTableHeaderCell scope="col">File</CTableHeaderCell>
                <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {submissions.map((submission, index) => (
                <CTableRow key={submission.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{submission.document.name}</CTableDataCell>
                  <CTableDataCell>
                    <button
                      onClick={() =>
                        window.open(`${apiUrl}/storage/${submission.pdfpath}`, '_blank')
                      }
                      className="btn btn-outline-dark"
                    >
                      Download
                    </button>
                  </CTableDataCell>
                  <CTableDataCell>
                    {submission.status !== 'pending' && (
                      <CButton
                        color="info"
                        size="sm"
                        onClick={() => handleViewSubmission(submission)}
                        className="me-2"
                        disabled={viewLoading[submission.id]}
                      >
                        {viewLoading[submission.id] ? <CSpinner size="sm" /> : 'View'}
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          <CModal visible={viewModalVisible} onClose={handleCloseModal} size="xl">
            <CModalHeader>
              <CModalTitle>View Submission</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {currentSubmission ? (
                <>
                  {isPdfLoading ? (
                    <div className="text-center">
                      <CSpinner color="primary" /> {/* Show spinner while PDF is loading */}
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
              <CButton color="secondary" onClick={handleCloseModal}>
                Close
              </CButton>
              <CButton
                color="primary"
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
