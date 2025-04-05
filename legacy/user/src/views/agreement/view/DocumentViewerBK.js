import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import axios from 'axios'
import './document.css'
import html2canvas from 'html2canvas'
import { apiUrl } from '../../../components/Config/Config'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import * as pdfjsLib from 'pdfjs-dist'
import { useParams, useSearchParams } from 'react-router-dom'
import mammoth from 'mammoth'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

// Fonts for signature styles
const fonts = [
  'Dancing Script',
  'Great Vibes',
  'Pacifico',
  'Alex Brush',
  'Allura',
  'Arizonia',
  'Bad Script',
  'Bilbo',
  'Cedarville Cursive',
  'Clicker Script',
  'Cookie',
  'Courgette',
  'Damion',
  'Dawning of a New Day',
  'Euphoria Script',
  'Felipa',
  'Herr Von Muellerhoff',
  'Italianno',
  'Jim Nightshade',
  'Kaushan Script',
  'Kristi',
  'Leckerli One',
  'Lobster',
  'Marck Script',
  'Meddon',
  'Meie Script',
  'Merienda',
  'Monsieur La Doulaise',
  'Mr Bedfort',
  'Mr Dafoe',
  'Norican',
  'Nothing You Could Do',
  'Over the Rainbow',
  'Parisienne',
  'Patrick Hand',
  'Pinyon Script',
  'Quintessential',
  'Raleway Dots',
  'Reenie Beanie',
  'Rochester',
  'Rock Salt',
  'Rouge Script',
  'Satisfy',
  'Seaweed Script',
  'Shadows Into Light',
  'Short Stack',
  'Sofia',
  'Special Elite',
  'Spirax',
  'Stalemate',
  'Sue Ellen Francisco',
  'Tangerine',
  'The Girl Next Door',
  'Vibur',
  'Waiting for the Sunrise',
  'Walter Turncoat',
  'Wire One',
  'Yellowtail',
  'Yesteryear',
  'Zeyada',
]

const DocumentViewer = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const isPublic = !!token && !!email

  const { documentid, id } = useParams()
  const documentId = isPublic ? id : documentid

  const [documentData, setDocumentData] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(null)
  const [formData, setFormData] = useState({})
  const canvasRef = useRef(null)
  const signatureCanvasRef = useRef(null)
  const signatureContextRef = useRef(null)

  // Signature modal and font states
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureMethod, setSignatureMethod] = useState('draw') // 'draw' or 'font'
  const [selectedFont, setSelectedFont] = useState(fonts[0])
  const [signatureText, setSignatureText] = useState('Your Name')
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const fontSignatureRef = useRef(null)

  // Load fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fonts
      .map((font) => font.replace(/ /g, '+'))
      .join('&family=')}&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    document.fonts.ready.then(() => {
      setFontsLoaded(true)
    })
  }, [])

  // Fetch document
  useEffect(() => {
    fetchDocument()
  }, [])

  // Initialize canvas context
  useEffect(() => {
    if (signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current
      const context = canvas.getContext('2d')
      context.lineWidth = 2
      context.lineCap = 'round'
      context.strokeStyle = '#000'
      signatureContextRef.current = context
    }
  }, [showSignatureModal]) // Initialize context when modal opens

  const fetchDocument = async () => {
    try {
      if (didFetch.current) return
      didFetch.current = true
      const url = isPublic
        ? `${apiUrl}/api/documents/public/${documentId}/${email}/${token}`
        : `${apiUrl}/api/documents/pending/${documentId}/`

      const response = await axios.get(url)
      const document = response.data.document[0]
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

  const loadDocx = (path) => {
    const docxUrl = `${apiUrl}/my/${path}`
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

  const captureFontSignature = async () => {
    if (fontSignatureRef.current) {
      const canvas = await html2canvas(fontSignatureRef.current)
      return canvas.toDataURL('image/png')
    }
    return null
  }

  const handleSubmit = async () => {
    try {
      let signatureDataUrl

      if (signatureMethod === 'draw') {
        signatureDataUrl = signatureCanvasRef.current.toDataURL()
      } else {
        signatureDataUrl = await captureFontSignature()
      }

      const dataToSubmit = {
        data: {
          ...formData,
          signature: signatureDataUrl,
        },
        status: 'pending',
        ...(isPublic && { token, email }),
      }

      const url = isPublic
        ? `${apiUrl}/api/user/documents/${documentId}/public/submit`
        : `${apiUrl}/api/user/documents/${documentId}/submit`

      const response = await axios.post(url, dataToSubmit)
      console.log(response.data)
      alert('Data submitted successfully!')
    } catch (error) {
      console.error('Error submitting data:', error)
      alert('An error occurred while submitting the data.')
    }
  }

  const startDrawing = (e) => {
    if (signatureContextRef.current) {
      signatureContextRef.current.beginPath()
      signatureContextRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    }
  }

  const drawSignature = (e) => {
    if (signatureContextRef.current && e.buttons === 1) {
      signatureContextRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      signatureContextRef.current.stroke()
    }
  }

  const stopDrawing = () => {
    if (signatureContextRef.current) {
      signatureContextRef.current.closePath()
    }
  }

  const clearSignature = () => {
    if (signatureMethod === 'draw' && signatureContextRef.current) {
      signatureContextRef.current.clearRect(
        0,
        0,
        signatureCanvasRef.current.width,
        signatureCanvasRef.current.height,
      )
    } else {
      setSignatureText('Your Name')
      setSelectedFont(fonts[0])
    }
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
        <canvas ref={canvasRef} />
        <div
          id="docx-container"
          style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0' }}
        ></div>

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
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <CFormLabel>Signature</CFormLabel>

              <CButton onClick={() => setShowSignatureModal(true)}>Add Signature</CButton>
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

      {/* Signature Modal */}
      <CModal visible={showSignatureModal} onClose={() => setShowSignatureModal(false)}>
        <CModalHeader>
          <CModalTitle>Add Signature</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="signature-method-toggle mb-3">
            <CButton
              color={signatureMethod === 'draw' ? 'primary' : 'secondary'}
              onClick={() => setSignatureMethod('draw')}
            >
              Draw Signature
            </CButton>
            <CButton
              color={signatureMethod === 'font' ? 'primary' : 'secondary'}
              onClick={() => setSignatureMethod('font')}
              className="ms-2"
            >
              Select Font Style
            </CButton>
          </div>

          {signatureMethod === 'draw' ? (
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
          ) : (
            <div className="font-signature-preview">
              {!fontsLoaded ? (
                <CSpinner color="primary" />
              ) : (
                <div className="font-signature-selector">
                  <CFormInput
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Enter signature text"
                    className="mb-2"
                  />
                  <div className="font-grid">
                    {fonts.map((font, index) => (
                      <div
                        key={index}
                        className={`font-option ${selectedFont === font ? 'selected' : ''}`}
                        onClick={() => setSelectedFont(font)}
                      >
                        <div
                          ref={selectedFont === font ? fontSignatureRef : null}
                          style={{ fontFamily: `'${font}', cursive` }}
                          className="signature-preview-text"
                        >
                          {signatureText}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <CButton onClick={clearSignature} color="danger" className="mt-3">
            Clear Signature
          </CButton>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowSignatureModal(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={() => setShowSignatureModal(false)}>
            Save Signature
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default DocumentViewer
