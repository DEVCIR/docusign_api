import React, { useState, useEffect, useRef } from 'react'
import { CButton, CFormInput, CForm, CFormLabel } from '@coreui/react'
import axios from 'axios'
import { apiUrl } from '../../../components/Config/Config'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { useSearchParams } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import { useParams } from 'react-router-dom'
import mammoth from 'mammoth'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

const View = () => {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const { documentid } = useParams()
  const documentId = documentid
  const [documentData, setDocumentData] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(null)
  const [formData, setFormData] = useState({})
  const canvasRef = useRef(null)
  const signatureCanvasRef = useRef(null)
  const signatureContextRef = useRef(null)

  useEffect(() => {
    fetchDocument()
  }, [])

  useEffect(() => {
    if (documentData && signatureCanvasRef.current) {
      signatureContextRef.current = signatureCanvasRef.current.getContext('2d')
    }
  }, [documentData, signatureCanvasRef])

  const fetchDocument = async () => {
    try {
      const response = await axios.get(
        type
          ? `${apiUrl}/api/documents/${documentId}/?type=agreement`
          : `${apiUrl}/api/documents/${documentId}/`,
      )
      const document = response.data.document[0]
      console.log(document)
      setDocumentData(document)
      initializeFormData(document)

      const fileExtension = document.path.split('.').pop().toLowerCase()
      if (fileExtension === 'pdf') {
        loadPdf(document.path)
      } else if (fileExtension === 'docx') {
        loadDocx(document.path)
      }
    } catch (error) {
      console.error('Error fetching document:', error)
    }
  }

  const initializeFormData = (document) => {
    const initialData = {}
    document.boxes.forEach((box) => {
      initialData[box.fieldType] = ''
    })
    initialData['signature'] = ''
    setFormData(initialData)
  }

  const loadPdf = (path) => {
    const pdfUrl = `${apiUrl}/storage/${path}`
    pdfjsLib
      .getDocument(pdfUrl)
      .promise.then((pdf) => {
        setNumPages(pdf.numPages)
        renderPage(pageNumber, pdf)
      })
      .catch((error) => {
        console.error('Error loading PDF:', error)
      })
  }

  const loadDocx22 = (path) => {
    const docxUrl = `${apiUrl}/storage/${path}`
    fetch(docxUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.arrayBuffer()
      })
      .then((arrayBuffer) => {
        mammoth
          .convertToHtml({ arrayBuffer })
          .then((result) => {
            document.getElementById('docx-container').innerHTML = result.value
          })
          .catch((error) => console.error('Error converting DOCX to HTML:', error))
      })
      .catch((error) => console.error('Error loading DOCX:', error))
  }

  const loadDocx = (path) => {
    const docxUrl = `${apiUrl}/my/${path}`
    // const docxUrl = `https://devcir.co/document.docx`;

    // Using fetch to get the DOCX file as an ArrayBuffer
    fetch(docxUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.arrayBuffer() // Convert response to ArrayBuffer
      })
      .then((arrayBuffer) => {
        mammoth
          .convertToHtml({ arrayBuffer: arrayBuffer }) // Convert DOCX to HTML
          .then((result) => {
            const docxContent = result.value // The HTML content from DOCX
            document.getElementById('docx-container').innerHTML = docxContent // Render DOCX content
          })
          .catch((error) => {
            console.error('Error converting DOCX to HTML:', error)
          })
      })
      .catch((error) => {
        console.error('Error loading DOCX file:', error)
      })
  }

  const renderPage = (pageNumber, pdf) => {
    pdf.getPage(pageNumber).then((page) => {
      const scale = 1.5
      const viewport = page.getViewport({ scale })

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      page.render({
        canvasContext: context,
        viewport,
      })
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async () => {
    try {
      const signatureDataUrl = signatureCanvasRef.current.toDataURL()
      const dataToSubmit = {
        data: {
          ...formData,
          signature: signatureDataUrl,
        },
        status: 'pending',
      }

      const response = await axios.post(
        type
          ? `${apiUrl}/api/documents/${documentId}/submit`
          : `${apiUrl}/api/documents/${documentId}/submit`,
        dataToSubmit,
      )
      console.log(response.data)
      alert('Data submitted successfully!')
    } catch (error) {
      console.error('Error submitting data:', error)
      alert('An error occurred while submitting the data.')
    }
  }

  const startDrawing = (e) => {
    signatureContextRef.current.beginPath()
    signatureContextRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
  }

  const drawSignature = (e) => {
    if (e.buttons === 1) {
      signatureContextRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      signatureContextRef.current.stroke()
    }
  }

  const stopDrawing = () => {
    signatureContextRef.current.closePath()
  }

  const clearSignature = () => {
    signatureContextRef.current.clearRect(
      0,
      0,
      signatureCanvasRef.current.width,
      signatureCanvasRef.current.height,
    )
  }

  const handlePageChange = (newPageNumber) => {
    if (newPageNumber > 0 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber)
      loadPdf(documentData.path)
    }
  }

  if (!documentData) return <p>Loading...</p>

  return (
    <div>
      <h1>{documentData.name}</h1>

      <div
        style={{
          position: 'relative',
          width: '800px',
          height: '100vh',
          border: '1px solid #ccc',
          marginTop: '20px',
          overflow: 'hidden',
          backgroundColor: '#f9f9f9',
        }}
      >
        {/* PDF Rendering */}
        <canvas ref={canvasRef} />

        {/* DOCX Container */}
        <div
          id="docx-container"
          style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0' }}
        ></div>
        {/* Render input fields */}
        {documentData.boxes
          .filter((box) => box.type === 'input')
          .map((box, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                position: 'absolute',
                top: `${box.top}px`,
                left: `${box.left}px`,
              }}
            >
              <CFormLabel htmlFor={box.field_type}>{box.field_type}</CFormLabel>
              <CFormInput
                type="text"
                id={box.field_type}
                name={box.field_type}
                value={formData[box.field_type]}
                onChange={handleInputChange}
              />
            </div>
          ))}

        {/* Render signature box */}
        {documentData.boxes
          .filter((box) => box.type === 'signature')
          .map((box, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                position: 'absolute',
                top: `${box.top}px`,
                left: `${box.left}px`,
              }}
            >
              <CFormLabel htmlFor="signature">Signature</CFormLabel>
              <canvas
                ref={signatureCanvasRef}
                width={300}
                height={150}
                style={{ border: '1px solid #000' }}
                onMouseDown={startDrawing}
                onMouseMove={drawSignature}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
              />
              <CButton onClick={clearSignature}>Clear Signature</CButton>
            </div>
          ))}
      </div>

      <div>
        <CButton onClick={() => handlePageChange(pageNumber - 1)}>Previous</CButton>
        <CButton onClick={() => handlePageChange(pageNumber + 1)}>Next</CButton>
      </div>

      <CForm>
        <CButton onClick={handleSubmit}>Submit Data</CButton>
      </CForm>
    </div>
  )
}

export default View
