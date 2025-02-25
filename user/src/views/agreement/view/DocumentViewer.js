import React, { useEffect, useRef, useState } from 'react'
import { CButton, CForm, CFormInput, CFormLabel, CModal, CSpinner } from '@coreui/react'
import axios from 'axios'
import './document.css'
import html2canvas from 'html2canvas'
import { apiUrl } from '../../../components/Config/Config'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import * as pdfjsLib from 'pdfjs-dist'
import { useParams, useSearchParams } from 'react-router-dom'
import mammoth from 'mammoth'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

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
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [currentSignatureField, setCurrentSignatureField] = useState(null)
  // New state for storing uploaded signature images
  const [signatureUploads, setSignatureUploads] = useState({})

  const { documentid, id } = useParams()
  const documentId = isPublic ? id : documentid

  const [documentData, setDocumentData] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [signatureMethods, setSignatureMethods] = useState({})
  const [selectedFonts, setSelectedFonts] = useState({})
  const [signatureTexts, setSignatureTexts] = useState({})
  const [fontsLoaded, setFontsLoaded] = useState(false)

  const signatureCanvasRefs = useRef({})
  const fontSignatureRefs = useRef({})
  const canvasRef = useRef(null)
  const didFetch = useRef(false)

  // 1. Combine related state
  const [signatureState, setSignatureState] = useState({
    methods: {},
    texts: {},
    uploads: {},
    selectedFonts: {},
  })

  // 2. Add loading states for different operations
  const [loadingStates, setLoadingStates] = useState({
    submission: false,
    signatureSave: false,
    pageLoad: false,
  })

  // 3. Add proper form validation state
  const [formValidation, setFormValidation] = useState({
    errors: {},
    isValid: false,
  })

  useEffect(() => {
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fonts
      .map((font) => font.replace(/ /g, '+'))
      .join('&family=')}&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    document.fonts.ready.then(() => setFontsLoaded(true))
  }, [])

  useEffect(() => {
    const fetchDocument = async () => {
      if (didFetch.current) return
      didFetch.current = true
      try {
        setLoading(true)
        const url = isPublic
          ? `${apiUrl}/api/documents/public/${documentId}/${email}/${token}`
          : `${apiUrl}/api/documents/pending/${documentId}/`
        // url = type ? `${url}?type=agreement` : url

        const response = await axios.get(url)
        const doc = response.data.document[0]
        setDocumentData(doc)
        initializeFormData(doc)

        const fileExtension = doc.path.split('.').pop().toLowerCase()
        if (fileExtension === 'pdf') {
          loadPdf(doc.path)
        } else if (fileExtension === 'docx') {
          loadDocx(doc.path)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [])

  useEffect(() => {
    if (signatureCanvasRefs.current) {
      // Attach isEmpty method to canvas prototype
      HTMLCanvasElement.prototype.isEmpty = function () {
        const context = this.getContext('2d')
        const pixelBuffer = new Uint32Array(
          context.getImageData(0, 0, this.width, this.height).data.buffer,
        )
        return !pixelBuffer.some((color) => color !== 0)
      }
    }
  }, [])

  const initializeFormData = (document) => {
    const initialData = {}
    document.boxes.forEach((box) => {
      initialData[box.field_type] = ''
    })
    setFormData(initialData)
  }

  const loadPdf = (path) => {
    const pdfUrl = `${apiUrl}/public/storage/${path}`
    pdfjsLib
      .getDocument(pdfUrl)
      .promise.then((pdf) => {
        setNumPages(pdf.numPages)
        renderPage(pageNumber, pdf)
      })
      .catch((err) => setError(err.message))
  }

  const loadDocx = (path) => {
    const docxUrl = `${apiUrl}/my/${path}`
    fetch(docxUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        mammoth
          .convertToHtml({ arrayBuffer })
          .then((result) => {
            document.getElementById('docx-container').innerHTML = result.value
          })
          .catch((err) => setError(err.message))
      })
      .catch((err) => setError(err.message))
  }

  const renderPage = (pageNumber, pdf) => {
    pdf.getPage(pageNumber).then((page) => {
      const scale = 1.5
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      page.render({ canvasContext: context, viewport })
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const startDrawing = (e, field_type) => {
    const canvas = signatureCanvasRefs.current[field_type]
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2
    ctx.strokeStyle = '#000000'
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
  }

  const drawSignature = (e, field_type) => {
    if (e.buttons === 1) {
      const canvas = signatureCanvasRefs.current[field_type]
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      ctx.stroke()
    }
  }

  const clearSignature = (field_type) => {
    const method = signatureMethods[field_type] || 'draw'
    if (method === 'draw') {
      const canvas = signatureCanvasRefs.current[field_type]
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    } else if (method === 'font') {
      setSignatureTexts((prev) => ({ ...prev, [field_type]: 'Your Name' }))
      setSelectedFonts((prev) => ({ ...prev, [field_type]: fonts[0] }))
    } else if (method === 'upload') {
      setSignatureUploads((prev) => ({ ...prev, [field_type]: null }))
    }
  }

  const handleSubmit = async () => {
    try {
      const updatedFormData = { ...formData }
      let allFieldsValid = true // Flag to track validation
      // Check for required fields
      documentData.boxes.forEach((box) => {
        const fieldType = box.field_type
        if (box.required && !updatedFormData[fieldType]) {
          alert(`Please fill out the required field: ${fieldType}`)
          allFieldsValid = false
        }
      })
      await Promise.all(
        documentData.boxes
          .filter((b) => b.type === 'signature')
          .map(async (box) => {
            const field_type = box.field_type
            let signatureDataUrl = ''

            if (signatureMethods[field_type] === 'draw') {
              const canvas = signatureCanvasRefs.current[field_type]
              if (canvas && !canvas.isEmpty()) {
                signatureDataUrl = canvas.toDataURL()
              }
            } else if (signatureMethods[field_type] === 'upload') {
              const uploadedImage = signatureUploads[field_type]
              if (uploadedImage) {
                signatureDataUrl = uploadedImage
              }
            } else {
              const fontPreview = fontSignatureRefs.current[field_type]
              if (fontPreview) {
                const canvas = await html2canvas(fontPreview, { useCORS: true })
                signatureDataUrl = canvas.toDataURL('image/png')
              }
            }

            if (signatureDataUrl) {
              updatedFormData[field_type] = signatureDataUrl
            }
          }),
      )

      const url = isPublic
        ? `${apiUrl}/api/user/documents/${documentId}/public/submit`
        : `${apiUrl}/api/user/documents/${documentId}/submit`

      const moreUpdatedFormData = (({ null: removedValue, ...rest }) => ({
        ...rest,
        signature: removedValue,
      }))(updatedFormData)

      await axios.post(url, {
        data: moreUpdatedFormData,
        status: 'pending',
        ...(isPublic && { token, email }),
      })

      alert('Document submitted successfully!')
    } catch (err) {
      console.error(`Submission failed: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center vh-100'>
        <CSpinner color='primary' />
      </div>
    )
  }

  if (error) {
    return <div className='alert alert-danger mx-3 my-5'>Error loading document: {error}</div>
  }
  const validInputTypes = [
    'text',
    'number',
    'email',
    'password',
    'date',
    'checkbox',
    'radio',
    'file',
  ]

  return (
    <>
      <style>
        {`
          .font-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1rem;
            max-height: 300px;
            overflow-y: auto;
            padding: 10px;
          }

          .font-option {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .font-option:hover {
            background-color: #f8f9fa;
          }

          .font-option.selected {
            border-color: #3c4b64;
            background-color: #ebedef;
          }

          .signature-preview-text {
            font-size: 1.4rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .font-name {
            font-size: 0.8rem;
            color: #6c757d;
            margin-top: 5px;
          }

          .document-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .form-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .font-option {
            transition: background-color 0.2s;
          }

          .font-option:hover {
            background-color: #f8f9fa;
          }

          .font-option.selected {
            background-color: #e9ecef;
          }

          .signature-preview-text {
            white-space: nowrap;
          }
        `}
      </style>
      <div className='d-flex p-4 gap-4' style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Document Viewer */}
        <div className='flex-grow-1 h-100' style={{ maxWidth: '70%', overflow: 'auto' }}>
          <h1>{documentData.name}</h1>

          <div
            className='document-container border bg-light'
            style={{
              position: 'relative',
              minHeight: '800px',
              overflow: 'hidden',
            }}
          >
            {/* Input Fields Preview */}
            {documentData.boxes
              .filter((box) => box.type === 'input')
              .map((box, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: `${box.top}px`,
                    left: `${box.left}px`,
                    zIndex: 1,
                    backgroundColor: 'white',
                    padding: '2px 5px',
                    border: '1px dashed #000',
                  }}
                >
                  {formData[box.field_type]}
                </div>
              ))}

            {/* Signature Fields Preview */}
            {documentData.boxes
              .filter((box) => box.type === 'signature')
              .map((box, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: `${box.top}px`,
                    left: `${box.left}px`,
                    zIndex: 1,
                  }}
                >
                  {formData[box.field_type] ? (
                    <img
                      src={formData[box.field_type]}
                      alt='Signature'
                      style={{
                        width: '300px',
                        height: '150px',
                        border: '1px solid #000',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '300px',
                        height: '150px',
                        border: '1px dashed #000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                      }}
                    >
                      Signature Required
                    </div>
                  )}
                </div>
              ))}
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 'auto',
                display: documentData?.path?.endsWith('.pdf') ? 'block' : 'none',
              }}
            />
            <div
              id='docx-container'
              style={{
                display: documentData?.path?.endsWith('.docx') ? 'block' : 'none',
                padding: '2rem',
              }}
            />
          </div>

          <div className='mt-3'>
            <CButton
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
            >
              Previous
            </CButton>
            <CButton
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
              className='ms-2'
            >
              Next
            </CButton>
          </div>
        </div>

        {/* Form Fields */}
        <div className='flex-shrink-0 h-100' style={{ width: '400px', overflowY: 'auto' }}>
          <h3>Fill Document</h3>

          <CForm className='gap-3' noValidate={false}>
            {documentData.boxes.map((box, index) => {
              if (box.type === 'input') {
                return (
                  <div key={`input-${index}`} className='mb-3'>
                    <CFormLabel>
                      {box.field_type}{' '}
                      {box.required === 1 ? (
                        <span className='fw-200'>
                          <em>(required)</em>
                        </span>
                      ) : null}
                    </CFormLabel>
                    <CFormInput
                      name={box.field_type}
                      value={formData[box.field_type]}
                      onChange={handleInputChange}
                      placeholder={`Enter ${box.field_type}`}
                      required={box.required === 1 ? true : undefined}
                      type={validInputTypes.includes(box.field_type) ? box.field_type : 'text'}
                    />
                  </div>
                )
              } else if (box.type === 'signature') {
                return (
                  <div key={`signature-${index}`} className='mb-4 border-top pt-3'>
                    <CButton
                      onClick={(event) => {
                        event.preventDefault()
                        setCurrentSignatureField(box.field_type)
                        if (!signatureMethods[box.field_type]) {
                          setSignatureMethods((prev) => ({ ...prev, [box.field_type]: 'draw' }))
                        }
                        setShowSignatureModal(true)
                      }}
                      color={signatureMethods[box.field_type] === 'font' ? 'secondary' : 'primary'}
                    >
                      Signature
                    </CButton>
                    <CModal
                      visible={showSignatureModal}
                      onClose={() => {
                        setShowSignatureModal(false)
                      }}
                    >
                      <div className='mb-4 border-top p-3'>
                        <CFormLabel>{box.field_type}</CFormLabel>
                        <div className='d-flex gap-2 mb-3'>
                          <CButton
                            color={
                              signatureMethods[box.field_type] === 'draw' ? 'secondary' : 'primary'
                            }
                            onClick={() => {
                              setSignatureMethods((prev) => ({
                                ...prev,
                                [box.field_type]: 'draw',
                              }))
                            }}
                          >
                            Draw
                          </CButton>
                          <CButton
                            color={
                              signatureMethods[box.field_type] === 'font' ? 'secondary' : 'primary'
                            }
                            onClick={() => {
                              setSignatureMethods((prev) => ({
                                ...prev,
                                [box.field_type]: 'font',
                              }))
                            }}
                          >
                            Type
                          </CButton>
                          <CButton
                            color={
                              signatureMethods[box.field_type] === 'upload'
                                ? 'secondary'
                                : 'primary'
                            }
                            onClick={() => {
                              setSignatureMethods((prev) => ({
                                ...prev,
                                [box.field_type]: 'upload',
                              }))
                            }}
                          >
                            Upload
                          </CButton>
                        </div>
                        {signatureMethods[box.field_type] === 'draw' ? (
                          <div>
                            <canvas
                              ref={(el) => (signatureCanvasRefs.current[box.field_type] = el)}
                              width={300}
                              height={150}
                              className='border bg-white'
                              onMouseDown={(e) => startDrawing(e, box.field_type)}
                              onMouseMove={(e) => drawSignature(e, box.field_type)}
                            />
                            <CButton
                              color='danger'
                              size='sm'
                              className='mt-2'
                              onClick={() => {
                                clearSignature(box.field_type)
                              }}
                            >
                              Clear
                            </CButton>
                          </div>
                        ) : signatureMethods[box.field_type] === 'upload' ? (
                          <div>
                            <CFormInput
                              type='file'
                              accept='image/*'
                              onChange={(e) => {
                                const file = e.target.files[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onload = (event) => {
                                    const dataUrl = event.target.result
                                    setSignatureUploads((prev) => ({
                                      ...prev,
                                      [box.field_type]: dataUrl,
                                    }))
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                            {signatureUploads[box.field_type] && (
                              <img
                                src={signatureUploads[box.field_type]}
                                alt='Uploaded signature'
                                style={{
                                  width: '300px',
                                  height: '150px',
                                  border: '1px solid #000',
                                  objectFit: 'contain',
                                  marginTop: '10px',
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          <div>
                            <CFormInput
                              value={signatureTexts[box.field_type] || ''}
                              onChange={(e) => {
                                setSignatureTexts((prev) => ({
                                  ...prev,
                                  [box.field_type]: e.target.value,
                                }))
                              }}
                              className='mb-3'
                              placeholder='Enter signature text'
                            />
                            <div
                              className='font-picker border p-2 bg-white'
                              style={{ height: '200px', overflowY: 'auto', position: 'relative' }}
                            >
                              {fonts.map((font) => (
                                <div
                                  key={font}
                                  className={`font-option mb-2 p-2 ${selectedFonts[box.field_type] === font ? 'bg-light' : ''}`}
                                  onClick={() => {
                                    setSelectedFonts((prev) => ({
                                      ...prev,
                                      [box.field_type]: font,
                                    }))
                                  }}
                                >
                                  <div
                                    ref={(el) => {
                                      if (selectedFonts[box.field_type] === font) {
                                        fontSignatureRefs.current[box.field_type] = el
                                      }
                                    }}
                                    style={{
                                      fontFamily: `'${font}', cursive`,
                                      fontSize: '1.2em',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {signatureTexts[box.field_type] || 'Signature'}
                                  </div>
                                  <small className='text-muted'>{font}</small>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <CButton
                        color='primary'
                        onClick={async () => {
                          console.log('Saving signature')
                          if (signatureMethods[currentSignatureField] === 'draw') {
                            const canvas = signatureCanvasRefs.current[currentSignatureField]
                            if (canvas && !canvas.isEmpty()) {
                              const signatureDataUrl = canvas.toDataURL()
                              setFormData((prev) => ({
                                ...prev,
                                [currentSignatureField]: signatureDataUrl,
                              }))
                            }
                          } else if (signatureMethods[currentSignatureField] === 'upload') {
                            const uploadedImage = signatureUploads[currentSignatureField]
                            if (uploadedImage) {
                              setFormData((prev) => ({
                                ...prev,
                                [currentSignatureField]: uploadedImage,
                              }))
                            }
                          } else {
                            const fontPreview = fontSignatureRefs.current[currentSignatureField]
                            if (fontPreview) {
                              const canvas = await html2canvas(fontPreview, { useCORS: true })
                              const signatureDataUrl = canvas.toDataURL('image/png')
                              setFormData((prev) => ({
                                ...prev,
                                [currentSignatureField]: signatureDataUrl,
                              }))
                            }
                          }
                          setShowSignatureModal(false)
                        }}
                      >
                        Save Signature
                      </CButton>
                    </CModal>
                  </div>
                )
              } else {
                return null
              }
            })}
            <CButton color='primary' className='w-100 mt-4' onClick={handleSubmit}>
              Submit Document
            </CButton>
          </CForm>
        </div>
      </div>
    </>
  )
}

export default React.memo(DocumentViewer)
