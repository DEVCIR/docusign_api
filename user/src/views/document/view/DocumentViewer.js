import React, { useEffect, useRef, useState, memo, useCallback, useMemo } from 'react'
import { CButton, CForm, CFormInput, CFormLabel, CModal, CSpinner } from '@coreui/react'
import axios from 'axios'
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

const SignatureField = ({ box, formData, setFormData, fonts, savedSignatures }) => {
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureMethod, setSignatureMethod] = useState('draw')
  const [signatureUpload, setSignatureUpload] = useState(null)
  const [signatureText, setSignatureText] = useState('Your Name')
  const [selectedFont, setSelectedFont] = useState(fonts[0])
  const signatureCanvasRef = useRef(null)
  const fontSignatureRef = useRef(null)
  const [savedSignatures2, setSavedSignatures2] = useState([])
  const [randomNumber, setRandomNumber] = useState('') // State to store the random number
  const randomNumberRef = useRef(null) // Ref to hold the random number div

  // Generate a 16-digit random number
  const generateRandomNumber = () => {
    const number = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString()
    setRandomNumber(number) // Set the random number in state
    return number
  }

  const startDrawing = (e) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2
    ctx.strokeStyle = '#000000'
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
  }

  const drawSignature = (e) => {
    if (e.buttons === 1) {
      const canvas = signatureCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      ctx.stroke()
    }
  }

  const clearSignature = () => {
    if (signatureMethod === 'draw') {
      const canvas = signatureCanvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    } else if (signatureMethod === 'font') {
      setSignatureText('Your Name')
      setSelectedFont(fonts[0])
    } else if (signatureMethod === 'upload') {
      setSignatureUpload(null)
    }
    setRandomNumber('') // Clear the random number when clearing the signature
    if (randomNumberRef.current) {
      randomNumberRef.current.remove() // Remove the random number div
    }
  }

  const saveSignature = async () => {
    let signatureData = ''
    const randomNumber = generateRandomNumber() // Generate and set the random number

    if (signatureMethod === 'draw') {
      const canvas = signatureCanvasRef.current
      if (canvas) {
        signatureData = canvas.toDataURL()

        // Create a div to display the random number below the canvas
        const randomNumberDiv = document.createElement('div')
        randomNumberDiv.textContent = `Random Number: ${randomNumber}`
        randomNumberDiv.style.marginTop = '10px'
        randomNumberDiv.style.fontSize = '16px'
        randomNumberDiv.style.textAlign = 'center'
        randomNumberRef.current = randomNumberDiv // Store the div in the ref

        console.log(canvas)
        console.log(canvas.parentNode)
        canvas.parentNode.appendChild(randomNumberDiv) // Append the div after the canvas
      }
    } else if (signatureMethod === 'upload') {
      signatureData = signatureUpload

      // Create a div to display the random number below the uploaded image
      const randomNumberDiv = document.createElement('div')
      randomNumberDiv.textContent = `Random Number: ${randomNumber}`
      randomNumberDiv.style.marginTop = '10px'
      randomNumberDiv.style.fontSize = '16px'
      randomNumberDiv.style.textAlign = 'center'
      randomNumberRef.current = randomNumberDiv // Store the div in the ref
      const uploadContainer = document.querySelector('.upload-container')
      if (uploadContainer) {
        uploadContainer.appendChild(randomNumberDiv) // Append the div after the uploaded image
      }
    } else {
      const fontPreview = fontSignatureRef.current
      if (fontPreview) {
        const canvas = await html2canvas(fontPreview, { useCORS: true })
        signatureData = canvas.toDataURL('image/png')

        // Create a div to display the random number below the font preview
        const randomNumberDiv = document.createElement('div')
        randomNumberDiv.textContent = `Random Number: ${randomNumber}`
        randomNumberDiv.style.marginTop = '10px'
        randomNumberDiv.style.fontSize = '24px'
        randomNumberDiv.style.textAlign = 'center'
        randomNumberRef.current = randomNumberDiv // Store the div in the ref
        fontPreview.parentNode.appendChild(randomNumberDiv) // Append the div after the font preview
      }
    }

    if (signatureData) {
      setFormData((prev) => ({
        ...prev,
        [box.id]: signatureData,
      }))

      setFormData((prev) => ({
        ...prev,
        [box.id + 'key']: randomNumber,
      }))
    }

    setShowSignatureModal(false)

    try {
      const response = await axios.post(`${apiUrl}/api/save-signature`, {
        signatureData,
        randomNumber, // Send the random number to the API
      })

      if (response.status === 200) {
        console.log('Signature saved successfully:', response.data)
      } else {
        console.error('Error saving signature:', response.data)
      }
    } catch (error) {
      console.error('Error during API call:', error)
    }
  }

  const fetchSavedSignatures2 = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/get-signatures`)
      if (response.status === 200) {
        setSavedSignatures2(response.data.signatures)
      }
    } catch (error) {
      console.error('Error fetching saved signatures:', error)
    }
  }

  useEffect(() => {
    if (showSignatureModal) {
      fetchSavedSignatures2()
    }
  }, [showSignatureModal])

  return (
    <div key={`signature-${box.id}`} className='mb-4 border-top pt-3'>
      <CButton
        onClick={(event) => {
          event.preventDefault()
          setShowSignatureModal(true)
        }}
        color={signatureMethod === 'font' ? 'secondary' : 'primary'}
      >
        Signature
      </CButton>
      <CModal visible={showSignatureModal} onClose={() => setShowSignatureModal(false)}>
        <div className='mb-4 border-top p-3'>
          <CFormLabel>{box.id}</CFormLabel>
          <div className='d-flex gap-2 mb-3'>
            <CButton
              color={signatureMethod === 'draw' ? 'secondary' : 'primary'}
              onClick={() => setSignatureMethod('draw')}
            >
              Draw
            </CButton>
            <CButton
              color={signatureMethod === 'font' ? 'secondary' : 'primary'}
              onClick={() => setSignatureMethod('font')}
            >
              Type
            </CButton>
            <CButton
              color={signatureMethod === 'upload' ? 'secondary' : 'primary'}
              onClick={() => setSignatureMethod('upload')}
            >
              Upload
            </CButton>
            <CButton
              color={signatureMethod === 'saved' ? 'secondary' : 'primary'}
              onClick={() => setSignatureMethod('saved')}
            >
              Saved
            </CButton>
          </div>
          {signatureMethod === 'draw' ? (
            <div>
              <canvas
                ref={signatureCanvasRef}
                width={300}
                height={150}
                className='border bg-white'
                onMouseDown={startDrawing}
                onMouseMove={drawSignature}
              />
              <CButton color='danger' size='sm' className='mt-2' onClick={clearSignature}>
                Clear
              </CButton>
            </div>
          ) : signatureMethod === 'upload' ? (
            <div className='upload-container'>
              <CFormInput
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setSignatureUpload(event.target.result)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
              {signatureUpload && (
                <img
                  src={signatureUpload}
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
          ) : signatureMethod === 'saved' ? (
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
                {savedSignatures2.map((signature) => (
                  <div
                    key={signature.sign_id}
                    className='mt-2'
                    style={{ border: 'solid 1px lightgray', width: '100%' }}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        [box.id]: signature.signature_data,
                      }))

                      setFormData((prev) => ({
                        ...prev,
                        [box.id + 'key']: signature.sign_id,
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
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
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
                    className={`font-option mb-2 p-2 ${selectedFont === font ? 'bg-light' : ''}`}
                    onClick={() => setSelectedFont(font)}
                  >
                    <div
                      ref={fontSignatureRef}
                      style={{
                        fontFamily: `'${font}', cursive`,
                        fontSize: '3rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {signatureText || 'Signature'}
                    </div>
                    <small className='text-muted'>{font}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <CButton color='primary' onClick={saveSignature}>
          Save Signature
        </CButton>
      </CModal>
    </div>
  )
}

const Document = memo(({ containerRef, fileType = 'pdf', docs, pdfPages, renderPDFPage }) => {
  const MemoizedDocViewer = memo(DocViewer)
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {fileType === 'pdf' &&
        pdfPages.map((page, index) => {
          // Unique ID for each canvas
          const canvasId = `pdf-canvas-${index}`
          return (
            <div key={index} style={{ marginBottom: '20px' }} className='pdf_canvas_load'>
              <div
                className='pdf_canvas_seperate'
                style={{
                  textAlign: 'center',
                  margin: '10px 0',
                  position: 'absolute',
                  left: '0',
                  background: 'red',
                  padding: '10px',
                }}
              >
                Page {index + 1}
              </div>
              <canvas
                id={canvasId}
                className=''
                ref={(node) => {
                  if (node) {
                    const viewport = page.getViewport({ scale: 1 })
                    node.width = viewport.width
                    node.height = viewport.height
                    renderPDFPage(page, node, viewport.width, viewport.height)
                  }
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  border: '1px solid #ccc',
                }}
              />
            </div>
          )
        })}
      {fileType === 'docx' && (
        <MemoizedDocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          style={{ height: '100%', overflow: 'hidden' }}
        />
      )}
    </div>
  )
})

const DocumentViewer = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const type = searchParams.get('type') ?? 'template'
  const isPublic = !!token && !!email
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [currentSignatureField, setCurrentSignatureField] = useState(null)
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
  const [savedSignatures, setSavedSignatures] = useState([])
  const [selectedSignature, setSelectedSignature] = useState(null)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [docs, setDocs] = useState([])
  const [pdfPages, setPdfPages] = useState([])

  const signatureCanvasRefs = useRef({})
  const fontSignatureRefs = useRef({})
  const containerRef = useRef(null)
  const mainCanvasRef = useRef(null)
  const didFetch = useRef(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Memoize the PDF rendering to prevent re-renders on input changes
  const renderPDFPage = useCallback((page, canvas, width, height) => {
    const viewport = page.getViewport({ scale: 1 })
    const context = canvas.getContext('2d')
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }
    page.render(renderContext).promise.then(() => {
      console.log(`Page rendered on canvas: ${canvas.id}`)
    })
  }, [])

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
        setError( err.message )
      }
    }

    fetchDocument()
    // setLoading( false )
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
        const pages = []
        for (let i = 1; i <= pdf.numPages; i++) {
          pdf.getPage(i).then((page) => {
            pages.push(page)
            if (pages.length === pdf.numPages) {
              setPdfPages(pages)
            }
          })
        }
        setLoading( false )
      })
      .catch((err) => setError(err.message))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    e.preventDefault()
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

  const captureAllCanvases = async () => {
    const screenshots = []

    // Get the .aDocument div
    const aDocumentDiv = document.querySelector('.aDocument')
    if (!aDocumentDiv) {
      console.error('.aDocument div not found')
      return screenshots
    }

    // Select all elements with class 'removeborderclass'
    const elements = document.querySelectorAll('.removeborderclass')

    // Loop through each element and remove the border
    elements.forEach((element) => {
      element.style.border = 'unset' // or you can use 'none' to completely remove the border
    })

    const elementscanvas = document.querySelectorAll('.aDocument canvas')

    // Loop through each element and remove the border
    elementscanvas.forEach((element) => {
      element.style.border = 'unset' // or you can use 'none' to completely remove the border
    })

    // Select all elements with class 'removeborderclass'
    const pdf_canvas_seperate = document.querySelectorAll('.pdf_canvas_seperate')

    // Loop through each element and remove the border
    pdf_canvas_seperate.forEach((element) => {
      element.remove() // or you can use 'none' to completely remove the border
    })

    // Get the height of the first PDF page canvas
    const firstCanvas = document.querySelector('.pdf_canvas_load canvas')
    if (!firstCanvas) {
      console.error('No PDF canvas found')
      return screenshots
    }
    // const pageHeight = firstCanvas.height; // Height of one PDF page
    const computedStyle = window.getComputedStyle(firstCanvas)
    const pageHeight = parseFloat(computedStyle.height) // Height in pixels
    // Calculate the number of pages based on the height of .aDocument
    const totalHeight = aDocumentDiv.scrollHeight
    const numPages = Math.ceil(totalHeight / pageHeight)

    // Capture each page section
    for (let i = 0; i < numPages; i++) {
      try {
        console.log('pageHeight', pageHeight)
        // Calculate the top and height of the current page section
        const top = i * pageHeight
        const height = pageHeight
        console.log('top', top)
        console.log('height', height)
        // Wait for the content to fully render (if necessary)
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Use html2canvas to capture the current page section
        const screenshot = await html2canvas(aDocumentDiv, {
          logging: true, // Enable logging for debugging
          useCORS: true, // Enable CORS for external resources
          allowTaint: true, // Allow tainted canvases (if using external images without CORS)
          scale: 2, // Increase scale for better quality
          backgroundColor: '#FFFFFF', // Set background color to white
          width: aDocumentDiv.scrollWidth, // Set width to match the div
          height: height, // Set height to match the page height
          x: 0, // Start from the left edge
          y: top, // Start from the top of the current page
          scrollX: 0, // Ensure no horizontal scroll offset
          scrollY: top, // Set the vertical scroll offset to the top of the current page
        })

        // Add the screenshot to the array
        screenshots.push(screenshot.toDataURL('image/png'))
      } catch (error) {
        console.error(`Error capturing page ${i + 1}:`, error)
      }
    }

    return screenshots
  }

  const [screenshots, setScreenshots] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    let allFieldsValid = true
    const errorMessages = []

    documentData.boxes.forEach((box) => {
      const fieldType = box.id
      if (box.required && !formData[fieldType]) {
        errorMessages.push(`${fieldType}`)
        allFieldsValid = false
      }
    })
    console.log(formData)
    console.log(allFieldsValid)
    // return false;
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

      const screenshots = await captureAllCanvases()
      setScreenshots(screenshots)

      // You can now handle the screenshots as needed, e.g., send them to a server
      screenshots.forEach((screenshot, index) => {
        console.log(`Screenshot of canvas ${index + 1}:`, screenshot)
        // Send the screenshot to your server or handle it as needed
      })

      console.log(screenshots)

      const url = isPublic
        ? `${apiUrl}/api/user/documents/${documentId}/public/submit`
        : `${apiUrl}/api/user/documents/${documentId}/submit`

      // const updatedFormData = { ...formData }; // Your existing form data
      const moreUpdatedFormData = (({ null: removedValue, ...rest }) => ({
        ...rest,
        signature: removedValue,
      }))(updatedFormData)

      await axios
        .post(url, {
          data: moreUpdatedFormData,
          status: 'pending',
          screenshots: screenshots,
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

  // const MemoizedDocument = memo(Document)
  return loading ? (
    <div className='d-flex justify-content-center align-items-center vh-100'>
      <CSpinner color='primary' />
    </div>
  ) : (
    <>
      <Toaster />
      <style>
        {`
        #proxy-renderer{
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
      <div className='d-flex p-4 gap-4' style={{}}>
        <div
          className=''
          style={{
            minWidth: '945px',
            height: 'max-content',
            minHeight: '1222.46px',
            maxWidth: '945px',
            position: 'relative',
            minHeight: '800px',
          }}
        >
          <div style={{}} className='aDocument'>
            {documentData.boxes
              .filter((box) => box.type === 'input')
              .map((box, index) => (
                <div
                  key={index}
                  className='removeborderclass'
                  style={{
                    position: 'absolute',
                    top: `${parseFloat(box.top)}%`,
                    left: `${parseFloat(box.left)}%`,
                    zIndex: 1,
                    padding: '2px 5px',
                    border: '1px dashed #000',
                    width: box.width ? `${parseFloat(box.width)}%` : '350px',
                    height: box.height ? `${parseFloat(box.height)}%` : '50px',
                    // fontSize: `${Math.min(parseFloat(box.width+"%") / 10, parseFloat(box.height+"%") / 1)}rem`,
                    fontSize: `${Math.min(parseFloat(box.width + '%') / 10, parseFloat(box.height + '%') / 2)}rem`,
                    overflow: 'hidden',
                    textAlign: 'center',
                    backgroundColor: 'White',
                  }}
                >
                  {formData[box.id]}
                </div>
              ))}

            {documentData.boxes
              .filter((box) => box.type === 'signature')
              .map((box, index) => (
                <div
                  key={index}
                  className='removeborderclass'
                  style={{
                    position: 'absolute',
                    top: `${parseFloat(box.top)}%`,
                    left: `${parseFloat(box.left)}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                    zIndex: 1,
                    backgroundColor: 'white',
                    border: '1px solid #000',
                  }}
                >
                  {formData[box.id] ? (
                    <img
                      src={formData[box.id]}
                      alt='Signature'
                      style={{
                        width: `100%`,
                        height: `100%`,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: `100%`,
                        height: `100%`,
                        border: '1px dashed #000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        backgroundColor: 'white',
                      }}
                    >
                      {/* <sub>signature</sub> */}
                    </div>
                  )}
                  <span key={index + 'key'}>{formData[box.id + 'key']}</span>
                </div>
              ))}
            <Document
              containerRef={containerRef}
              fileType={'pdf'}
              docs={docs}
              mainCanvasRef={mainCanvasRef}
              pdfPages={pdfPages}
              renderPDFPage={renderPDFPage} // Pass the memoized function
            />
          </div>
        </div>

        <div
          className='h-100'
          style={{
            width: 'fit-content',
            overflowY: 'hidden',
            position: 'sticky',
            top: '25%',
          }}
        >
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
                      name={box.id} // Use the id as the name
                      value={formData[box.id] || ''} // Use the id to get the value
                      onChange={handleInputChange}
                      placeholder={`Enter ${box.field_type}`}
                      required={box.required === 1 ? true : undefined}
                      type={validInputTypes.includes(box.field_type) ? box.field_type : 'text'}
                    />
                  </div>
                )
              } else if (box.type === 'signature') {
                console.log(savedSignatures)
                return (
                  <SignatureField
                    key={`signature-${box.id}`}
                    box={box}
                    formData={formData}
                    setFormData={setFormData}
                    fonts={fonts}
                    savedSignatures={savedSignatures}
                  />
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

export default memo(DocumentViewer)
