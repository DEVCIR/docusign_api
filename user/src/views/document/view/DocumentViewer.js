import React, { useEffect, useRef, useState, memo } from 'react'
import { CButton, CForm, CFormInput, CFormLabel, CModal, CSpinner } from '@coreui/react'
import axios, { AxiosError } from 'axios'
import './document.css'
import html2canvas from 'html2canvas'
import { apiUrl } from '../../../components/Config/Config'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import * as pdfjsLib from 'pdfjs-dist'
import { useParams, useSearchParams } from 'react-router-dom'
import mammoth from 'mammoth'
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer'
import { toast, Toaster } from 'sonner'
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

// Memoized Document Component
// Memoize DocViewer to prevent unnecessary rerenders

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
  const type = searchParams.get('type') ?? 'template'
  const isPublic = !!token && !!email
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [currentSignatureField, setCurrentSignatureField] = useState(null)
  // New state for storing uploaded signature images
  const [signatureUploads, setSignatureUploads] = useState({})

  const { documentid, id } = useParams()
  const documentId = isPublic ? id : documentid
  const MemoizedDocViewer = memo(DocViewer)
  const [documentData, setDocumentData] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [signatureMethods, setSignatureMethods] = useState({})
  const [selectedFonts, setSelectedFonts] = useState({})
  const [signatureTexts, setSignatureTexts] = useState({})
  const [savedSignatures, setSavedSignatures] = useState([])
  const [selectedSignature, setSelectedSignature] = useState(null)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [docs, setDocs] = useState([])

  const signatureCanvasRefs = useRef({})
  const fontSignatureRefs = useRef({})
  const canvasRef = useRef(null)
  const didFetch = useRef(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchSavedSignatures = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/get-signatures`)
      if (response.status === 200) {
        setSavedSignatures(response.data.signatures)
      }
    } catch (error) {
      console.error('Error fetching saved signatures:', error)
    }
  }

  useEffect(() => {
    if (showSignatureModal) {
      fetchSavedSignatures()
    }
  }, [showSignatureModal])

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
        let url = isPublic
          ? `${apiUrl}/api/documents/public/${documentId}/${email}/${token}`
          : `${apiUrl}/api/documents/pending/${documentId}/`
        url = type ? `${url}?type=agreement` : url

        const response = await axios.get(url)
        const doc = response.data.document[0]
        setDocumentData(doc)
        initializeFormData(doc)

        const fileExtension = doc.path.split('.').pop().toLowerCase()
        if (fileExtension === 'pdf') {
          loadPdf(doc.path)
        } else if (fileExtension === 'docx') {
          const newDoc = { uri: `${apiUrl}/public/storage/${doc.path}` }
          setDocs([newDoc])
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
    const pdfUrl = `${apiUrl}/my/${path}`
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
    return [{ uri: docxUrl }]
  }

  const renderPage = (pageNumber, pdf) => {
    pdf.getPage(pageNumber).then((page) => {
      const scale = 1
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    let allFieldsValid = true
    const errorMessages = []

    documentData.boxes.forEach((box) => {
      const fieldType = box.field_type
      if (box.required && !formData[fieldType]) {
        errorMessages.push(`${fieldType}`)
        allFieldsValid = false
      }
    })

    if (!allFieldsValid) {
      toast.error(`Please fill out the required field: ${errorMessages.join(', ')}`, {
        duration: 3000,
        position: 'top-right',
      })
      setIsSubmitting(false)
      return
    }

    try {
      const updatedFormData = { ...formData }
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

      await axios
        .post(url, {
          data: moreUpdatedFormData,
          status: 'pending',
          ...(isPublic && { token, email }),
        })
        .then((response) => {
          toast.info(response.data.message, {
            duration: 3000,
            position: 'top-right',
          })
        })
    } catch (error) {
      const status = error.response?.status
      if (status == 409 || status == '409') {
        toast.error('Document Already Submitted by the User', {
          duration: 3000,
          position: 'top-right',
        })
      } else {
        console.error('Error during submission:', error)
        toast.error('Submission failed. Please try again.', {
          duration: 3000,
          position: 'top-right',
        })
      }
    } finally {
      setIsSubmitting(false)
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
      <Toaster />
      <style>
        {`
        #proxy-renderer{
          // overflow: hidden !important;
          overflow-y: hidden !important;
        }
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
      <div className='d-flex p-4 gap-4' style={{ height: '100vh', overflow: 'auto' }}>
        {/* Document Viewer */}
        <div className='flex-grow-1 h-100' style={{ overflow: 'auto' }}>
          {/* <h1>{documentData.name}</h1> */}

          <div
            className='document-container border bg-light'
            style={{
              position: 'relative',
              minHeight: '800px',
              // overflow: 'hidden !Important',
              overflow: 'hidden',
              // minHeight: "800px",
              scrollbarWidth: 'none !Important',
              // overflow: "hidden"
            }}
          >
            {/* Input Fields Preview */}
            {documentData.boxes
              .filter((box) => box.type === 'input')
              .map((box, index) => (
                <div
                  key={index}
                  style={{
                    // position: 'absolute',
                    // top: `${box.top}px`,
                    // left: `${box.left}px`,
                    // zIndex: 1,
                    // backgroundColor: 'white',
                    // padding: '2px 5px',
                    // border: '1px dashed #000',
                    // width: box.width ? `${box.width}px` : '350px', // Set width from the box data
                    // height: box.height ? `${box.height}px` : '50px', // Set height from the box data
                    // fontSize: `${Math.min( box.width, box.height )* 5}px !Important`, // Dynamic font size
                    // overflow: 'hidden', // Ensures text doesn't overflow
                    // textAlign: 'center',
                    // display: 'flex',
                    // alignItems: 'center',
                    // justifyContent: 'center',
                    position: 'absolute',
                    top: `${box.top}px`,
                    left: `${box.left}px`,
                    zIndex: 1,
                    padding: '2px 5px',
                    border: '1px dashed #000',
                    width: box.width ? `${box.width}px` : '350px', // Set width from the box data
                    height: box.height ? `${box.height}px` : '50px', // Set height from the box data
                    fontSize: `${Math.min(box.width / 10, box.height / 2)}px`, // Dynamic font size
                    overflow: 'hidden', // Ensures text doesn't overflow
                    textAlign: 'center',
                    backgroundColor: 'White',
                    // fontSize: 2rem,// Dynamic font size
                    // display: 'flex',
                    // alignItems: 'center',
                    // justifyContent: 'center',
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
                    backgroundColor: 'white',
                    border: '1px solid #000',
                  }}
                >
                  {formData[box.field_type] ? (
                    <img
                      src={formData[box.field_type]}
                      alt='Signature'
                      style={{
                        width: `${box.width}px`,
                        height: `${box.height}px`,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: `${box.width}px`,
                        height: `${box.height}px`,
                        border: '1px dashed #000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        backgroundColor: 'white',
                      }}
                    >
                      <sub>signature</sub>
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
                backgroundColor: 'white !important',
                // overflow: 'scroll'
              }}
            />
            {documentData?.path?.endsWith('.docx') && (
              <MemoizedDocViewer
                documents={docs}
                pluginRenderers={DocViewerRenderers}
                theme={{ disableThemeScrollbar: true }}
                style={{ minHeight: '800px', overflow: 'hidden !important' }}
                config={{
                  header: {
                    disableHeader: false,
                    disableFileName: false,
                    retainURLParams: false,
                  },
                }}
              />
            )}
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
        <div className='flex-shrink-0 h-100' style={{ width: 'fit-content', overflowY: 'auto' }}>
          <h3>Fill Document</h3>

          <CForm className='gap-3' noValidate={false} onSubmit={handleSubmit}>
            {documentData.boxes.map((box, index) => {
              if (box.type === 'input') {
                return (
                  <div key={`input-${index}`} className='mb-3'>
                    <CFormLabel>
                      {box.field_type}{' '}
                      {box.required === 1 ? (
                        <span className='fw-200'>
                          <em style={{ color: '#5856d6' }}>(*)</em>
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
                          <CButton
                            color={
                              signatureMethods[box.field_type] === 'saved' ? 'secondary' : 'primary'
                            }
                            onClick={() => {
                              setSignatureMethods((prev) => ({
                                ...prev,
                                [box.field_type]: 'saved',
                              }))
                            }}
                          >
                            Saved
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
                        ) : signatureMethods[box.field_type] === 'saved' ? (
                          <div>
                            <h5>Saved Signatures</h5>
                            <div
                              className='d-flex gap-2'
                              style={{
                                flexDirection: 'column',
                                flexWrap: 'nowrap',
                                alignContent: 'left',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              {savedSignatures.map((signature) => (
                                <div
                                  key={signature.sign_id}
                                  className='mt-2'
                                  style={{ border: 'solid 1px lightgray', width: '100%' }}
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      [currentSignatureField]: signature.signature_data,
                                    }))
                                  }}
                                >
                                  <span>{signature.sign_id}</span>
                                  <img
                                    src={signature.signature_data}
                                    alt='Selected saved signature'
                                    style={{ width: '100%', height: '90px', objectFit: 'contain' }}
                                  />
                                </div>
                              ))}
                            </div>
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
                                      fontSize: '3rem',
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
                          let signatureData = ''
                          if (signatureMethods[currentSignatureField] === 'draw') {
                            const canvas = signatureCanvasRefs.current[currentSignatureField]
                            if (canvas && !canvas.isEmpty()) {
                              const signatureDataUrl = canvas.toDataURL()
                              signatureData = canvas.toDataURL()

                              setFormData((prev) => ({
                                ...prev,
                                [currentSignatureField]: signatureDataUrl,
                              }))
                            }
                          } else if (signatureMethods[currentSignatureField] === 'upload') {
                            const uploadedImage = signatureUploads[currentSignatureField]
                            if (uploadedImage) {
                              const signatureDataUrl = uploadedImage
                              signatureData = uploadedImage
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
                              signatureData = canvas.toDataURL('image/png')
                              setFormData((prev) => ({
                                ...prev,
                                [currentSignatureField]: signatureDataUrl,
                              }))
                              return
                            }
                          }
                          setShowSignatureModal(false)
                          if (signatureMethods[currentSignatureField] === 'saved') {
                            return
                          }

                          try {
                            // Make a POST request using axios
                            const response = await axios.post(`${apiUrl}/api/save-signature`, {
                              signatureData, // The signature data you want to send
                            })

                            if (response.status === 200) {
                              console.log('Signature saved successfully:', response.data)
                              // Optionally update form data or close the modal
                              setShowSignatureModal(false) // Close modal after saving
                            } else {
                              console.error('Error saving signature:', response.data)
                            }
                          } catch (error) {
                            console.error('Error during API call:', error)
                          }
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
            <CButton color='primary' className='w-100 mt-4' type='submit' disabled={isSubmitting}>
              {isSubmitting ? <CSpinner size='sm' /> : 'Submit Document'}
            </CButton>
          </CForm>
        </div>
      </div>
    </>
  )
}

export default React.memo(DocumentViewer)
