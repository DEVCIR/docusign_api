import {
  CButton,
  CContainer,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'
import axios from 'axios'
import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiUrl } from 'src/components/Config/Config'
import SendModal from 'src/views/document/SendModal'
import { toast, Toaster } from 'sonner'
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaTag,
  FaTextHeight,
  FaCalendar,
  FaCheck,
  FaPen,
} from 'react-icons/fa'
import { renderAsync } from 'docx-preview';
import DocViewer, { DocViewerRenderers } from "react-doc-viewer"; // Assumes you're using a library like react-doc-viewer

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

const Create = () => {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const [fileType, setFileType] = useState('')
  const [sendModalVisible, setSendModalVisible] = useState(false)
  const [currentDocument, setCurrentDocument] = useState(null)
  const [docxContent, setDocxContent] = useState('')
  const [inputBoxes, setInputBoxes] = useState({})
  const [signatureBoxes, setSignatureBoxes] = useState({})
  const [draggedElement, setDraggedElement] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [pdfDocument, setPdfDocument] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(false)
  const [documentName, setDocumentName] = useState('')
  const [fileName, setFileName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pdfPages, setPdfPages] = useState([])
  const [documentPageCount, setDocumentPageCount] = useState(0)
  const [focusedBox, setFocusedBox] = useState(null)
  const [pageToRender, setPageToRender] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [startPosition, setStartPosition] = useState(null)
  const [thumbnailForceUpdate, setThumbnailForceUpdate] = useState(0)

  const containerRef = useRef(null)
  const mainCanvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const renderedThumbnails = useRef({})
  const currentPageRef = useRef(null)

  const renderPDFPage = useCallback(async (page, canvas, width, height) => {
    if (!canvas) return
    const context = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height

    try {
      await page.render({
        canvasContext: context,
        viewport: page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width }),
      }).promise
    } catch (error) {
      console.error('Error rendering page:', error)
      toast.error('Failed to render PDF page.')
    }
  }, [])

  useEffect(() => {
    if (uploadedFile && pdfPages.length > 0 && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      setPageToRender({
        page: pdfPages[0],
        pageNumber: 1,
        containerWidth,
      })
    }
  }, [uploadedFile, pdfPages])

  useEffect(() => {
    if (!pageToRender || !mainCanvasRef.current) return

    const { page, pageNumber } = pageToRender
    const viewport = page.getViewport({ scale: 1 })
    const scale = pageToRender.containerWidth / viewport.width
    const scaledViewport = page.getViewport({ scale })

    renderPDFPage(page, mainCanvasRef.current, scaledViewport.width, scaledViewport.height)
    setCurrentPage(pageNumber)
  }, [pageToRender, renderPDFPage, currentPage])

  const renderThumbnail = useCallback(
    (page, index) => {
      const containerWidth = 100
      const viewport = page.getViewport({ scale: 1 })
      const scale = containerWidth / viewport.width
      const scaledViewport = page.getViewport({ scale })

      return (
        <div
          key={index}
          onClick={() => {
            if (currentPage !== index + 1) {
              setPageToRender({
                page,
                pageNumber: index + 1,
                containerWidth: containerRef.current?.offsetWidth,
              })
              setCurrentPage(index + 1)
              setThumbnailForceUpdate((prev) => prev + 1)
            }
          }}
          style={{
            boxShadow: '0px 0px 3px rgba(0,0,0,0.5)',
            margin: '5px',
            cursor: 'pointer',
            width: 'fit-content',
            backgroundColor: currentPage === index + 1 ? '#e9ecef' : 'transparent',
          }}
        >
          <canvas
            ref={(node) => {
              if (node) {
                renderPDFPage(page, node, scaledViewport.width, scaledViewport.height)
              }
            }}
            style={{ width: '100px', height: 'auto' }}
          />
          <div style={{ textAlign: 'center' }}>Page {index + 1}</div>
        </div>
      )
    },
    [renderPDFPage, currentPage],
  )

  const thumbnails = useMemo(() => {
    if (fileType === 'pdf' && pdfPages.length) {
      return pdfPages.map((page, index) => renderThumbnail(page, index))
    } else if (fileType === 'docx') {
      return (
        <div
          key="docx-preview"
          style={{
            boxShadow: '0px 0px 3px rgba(0,0,0,0.5)',
            margin: '5px',
            cursor: 'pointer',
            width: 'fit-content',
          }}
        >
          <div style={{ width: '100px', height: 'auto', backgroundColor: '#f0f0f0' }}>
            <div style={{ textAlign: 'center', padding: '8px' }}>DOCX Preview</div>
          </div>
          <div style={{ textAlign: 'center', background: '#421a47', color: 'white' }}>1 Page</div>
        </div>
      )
    }
    return null
  }, [fileType, pdfPages.length, renderThumbnail, thumbnailForceUpdate])

  const toggleRequired = (index, type, page) => {
    if (type === 'input') {
      setInputBoxes((prevBoxes) => ({
        ...prevBoxes,
        [page]:
          prevBoxes[page]?.map((box, i) =>
            i === index
              ? { ...box, required: (box.required ?? false) ? !box.required : true }
              : box,
          ) || [],
      }))
    } else if (type === 'signature') {
      setSignatureBoxes((prevBoxes) => ({
        ...prevBoxes,
        [page]:
          prevBoxes[page]?.map((box, i) =>
            i === index
              ? { ...box, required: (box.required ?? false) ? !box.required : true }
              : box,
          ) || [],
      }))
    }
  }

  const reset = () => {
    setFileType('')
    setDocxContent('')
    setInputBoxes({})
    setSignatureBoxes({})
    setDraggedElement(null)
    setDragging(false)
    setPdfDocument(null)
    setModalVisible(false)
    setUploadedFile(false)
    setDocumentName('')
    setFileName('')
    setCurrentPage(1)
    setPdfPages([])
    setDocumentPageCount(0)
    setFocusedBox(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [docs, setDocs] = useState([]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    const fileType = file.name.split('.').pop().toLowerCase()

    if (fileType === 'pdf') {
      setFileType('pdf')
    } else if (fileType === 'docx') {
      setUploadedFile(true);
      setIsCanvasReady(true);
      setFileType('docx')
    }

    if (!file || (fileType !== 'pdf' && fileType !== 'docx')) {
      toast.error('Please upload a valid PDF or DOCX file.', {
        duration: 3000,
        position: 'top-right',
      })
      reset()
      return
    }
    const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.')
    setFileName(nameWithoutExtension)
    setDocumentName(nameWithoutExtension)
    setModalVisible(true)
    if (fileType === 'pdf') {
      setFileType('pdf')
      loadPDF(file)
    } else if (fileType === 'docx') {

      const getdocurl= await getDocUrl();
      // const newDoc = { uri: 'https://demo1.devcir.co/1.docx' };
      const newDoc = { uri: `${apiUrl}/public/storage/${getdocurl}` };
    setDocs([newDoc]);
      setTimeout(function(){
        loadDOCX(file)
      },1500);
    }
  }

  // Make the getDocUrl function return a Promise
const getDocUrl = async () => {
  const formData = new FormData();
  const fileInput = fileInputRef.current;
  formData.append('file', fileInput.files[0]);

  try {
    const response = await axios.post(
      type ? `${apiUrl}/api/upload-file2` : `${apiUrl}/api/upload-file2`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    console.log(response.data);
    return response.data.document; // return the document URL
  } catch (error) {
    if (error.response && error.response.status === 409) {
      toast.error('File already exists');
    } else {
      toast.error('Something went wrong');
    }
    throw error; // rethrow the error so it can be caught in handleFileChange
  }
};

  const loadPDF = (file) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result)
        const loadedPDF = await pdfjsLib.getDocument(typedArray).promise
        setPdfDocument(loadedPDF)
        setDocumentPageCount(loadedPDF.numPages)
        const pagePromises = []
        for (let pageNum = 1; pageNum <= loadedPDF.numPages; pageNum++) {
          pagePromises.push(loadedPDF.getPage(pageNum))
        }
        const pages = await Promise.all(pagePromises)
        setPdfPages(pages)
      } catch (error) {
        console.error('Error loading PDF:', error)
        toast.error('Failed to load PDF. Please try again.')
      }
    }
    reader.readAsArrayBuffer(file)
  }
  // const docs = [
  //   { uri: "https://url-to-my-pdf.pdf" },
  // ];

  const loadDOCX = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
  
      try {
        const container = document.createElement('div'); // Temporary container to hold DOCX content
  
        // Extract text and images using mammoth
        const { value: text, messages } = await mammoth.extractRawText({ arrayBuffer });
  
        // Create an off-screen canvas to calculate the content dimensions
        const offScreenCanvas = document.createElement('canvas');
        const offScreenCtx = offScreenCanvas.getContext('2d');
        offScreenCtx.font = '16px Arial'; // Default text font size
  
        // Split the DOCX text into lines and render text to off-screen canvas
        const textLines = text.split('\n');
        let currentY = 0;
  
        // Calculate the height required for text
        textLines.forEach((line) => {
          offScreenCtx.fillText(line, 0, currentY);
          currentY += 20; // Line height adjustment
        });
  
        // Handle images (if any) within the DOCX
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
        container.innerHTML = html; // Render DOCX content into HTML
  
        // Process images within the DOCX and draw them onto the off-screen canvas
        const imagePromises = Array.from(container.querySelectorAll('img')).map((img) => {
          return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
              offScreenCanvas.width = Math.max(offScreenCanvas.width, img.width);
              offScreenCanvas.height = img.height + currentY;
              offScreenCtx.drawImage(image, 0, currentY);
              currentY += image.height;
              resolve();
            };
            image.src = img.src;
          });
        });
  
        await Promise.all(imagePromises);
  
        // Convert the off-screen canvas to an image
        const imageUrl = offScreenCanvas.toDataURL('image/png');
  
        // Now draw this image on the main canvas
        const canvas = document.querySelector("#mainCanvasRef");
        const ctx = canvas.getContext('2d');
  
        if (!ctx) {
          console.error('Canvas context not available');
          toast.error('Failed to load DOCX. Please try again.');
          return;
        }
  
        // Clear the canvas before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        // Create an image element to render the off-screen canvas image
        const docImage = new Image();
        docImage.onload = () => {
          // Calculate scale to fit the canvas
          const scaleX = canvas.width / docImage.width;
          const scaleY = canvas.height / docImage.height;
          const scale = Math.min(scaleX, scaleY); // Use the smaller scale factor
  
          // Apply scaling and draw the image onto the canvas
          ctx.scale(scale, scale);
          ctx.drawImage(docImage, 0, 0);
        };
        docImage.src = imageUrl;
      } catch (error) {
        console.error('Error loading DOCX:', error);
        toast.error('Failed to load DOCX. Please try again.');
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const handleMouseDown = (index, type) => (e) => {
    e.preventDefault()
    const box =
      type === 'input' ? inputBoxes[currentPage][index] : signatureBoxes[currentPage][index]
    const isFocused =
      focusedBox &&
      focusedBox.index === index &&
      focusedBox.type === type &&
      focusedBox.page === currentPage

    const containerRect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - containerRect.left
    const clickY = e.clientY - containerRect.top

    const newLeft = isFocused ? clickX - 25 : box.left
    const newTop = isFocused ? clickY - 25 : box.top

    if (isFocused) {
      const updatedBoxes =
        type === 'input' ? [...inputBoxes[currentPage]] : [...signatureBoxes[currentPage]]
      updatedBoxes[index] = { ...box, left: newLeft, top: newTop }
      if (type === 'input') {
        setInputBoxes((prevBoxes) => ({
          ...prevBoxes,
          [currentPage]: updatedBoxes,
        }))
      } else {
        setSignatureBoxes((prevBoxes) => ({
          ...prevBoxes,
          [currentPage]: updatedBoxes,
        }))
      }
    }

    setDraggedElement({
      index,
      type,
      offsetX: 25,
      offsetY: 25,
      isFocused,
    })
    setDragging(true)
    setStartPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    if (!dragging || !draggedElement) return

    const containerRect = containerRef.current.getBoundingClientRect()

    const newLeft = e.clientX - containerRect.left - draggedElement.offsetX
    const newTop = e.clientY - containerRect.top - draggedElement.offsetY

    const maxLeft = containerRect.width - 50
    const maxTop = containerRect.height - 50

    const boundedLeft = Math.max(0, Math.min(newLeft, maxLeft))
    const boundedTop = Math.max(0, Math.min(newTop, maxTop))

    const updatedBoxes =
      draggedElement.type === 'input'
        ? [...inputBoxes[currentPage]]
        : [...signatureBoxes[currentPage]]
    updatedBoxes[draggedElement.index] = {
      ...updatedBoxes[draggedElement.index],
      top: boundedTop,
      left: boundedLeft,
    }

    if (draggedElement.type === 'input') {
      setInputBoxes((prevBoxes) => ({
        ...prevBoxes,
        [currentPage]: updatedBoxes,
      }))
    } else {
      setSignatureBoxes((prevBoxes) => ({
        ...prevBoxes,
        [currentPage]: updatedBoxes,
      }))
    }
  }

  const handleMouseUp = (index, type) => (e) => {
    e.preventDefault()
    if (dragging && draggedElement) {
      const dx = Math.abs(e.clientX - startPosition.x)
      const dy = Math.abs(e.clientY - startPosition.y)
      const threshold = 5

      if (dx <= threshold && dy <= threshold) {
        setFocusedBox((prevFocus) =>
          prevFocus?.index === index && prevFocus?.type === type && prevFocus?.page === currentPage
            ? null
            : { index, type, page: currentPage },
        )
      }
    }
    setDragging(false)
    setDraggedElement(null)
    setStartPosition(null)
  }

  const addInputBox = (fieldType) => {
    const newPage = currentPage
    setInputBoxes((prevBoxes) => ({
      ...prevBoxes,
      [newPage]: [
        ...(prevBoxes[newPage] || []),
        {
          top: 100,
          left: 50,
          id: (prevBoxes[newPage] || []).length,
          fieldType,
          required: false,
          page: newPage,
        },
      ],
    }))
  }

  const addSignatureBox = (fieldType) => {
    const newPage = currentPage
    setSignatureBoxes((prevBoxes) => ({
      ...prevBoxes,
      [newPage]: [
        ...(prevBoxes[newPage] || []),
        {
          top: 200,
          left: 50,
          id: (prevBoxes[newPage] || []).length,
          fieldType,
          page: newPage,
          required: false,
        },
      ],
    }))
  }

  const getPlaceholder = (fieldType) => {
    switch (fieldType) {
      case 'name':
        return 'Enter Name here'
      case 'email':
        return 'Enter Email here'
      case 'company':
        return 'Enter Company name'
      case 'title':
        return 'Enter Title here'
      case 'date':
        return 'Select Date'
      case 'initial':
        return 'Enter Initials'
      default:
        return 'Enter text here'
    }
  }

  const removeBox = (index, type, page) => {
    if (type === 'input') {
      setInputBoxes((prevBoxes) => ({
        ...prevBoxes,
        [page]: prevBoxes[page]?.filter((_, i) => i !== index) || [],
      }))
    } else {
      setSignatureBoxes((prevBoxes) => ({
        ...prevBoxes,
        [page]: prevBoxes[page]?.filter((_, i) => i !== index) || [],
      }))
    }
    if (
      focusedBox &&
      focusedBox.index === index &&
      focusedBox.type === type &&
      focusedBox.page === page
    ) {
      setFocusedBox(null)
    }
  }

  const handleModalSubmit = () => {
    setModalVisible(false)
    setUploadedFile(true)
  }

  const handleSubmit = () => {
    setIsLoading(true)
    const formData = new FormData()
    const fileInput = fileInputRef.current
    formData.append('file', fileInput.files[0])
    formData.append('document_name', documentName)

    const allInputBoxes = Object.values(inputBoxes).flat()
    const allSignatureBoxes = Object.values(signatureBoxes).flat()

    formData.append('input_boxes', JSON.stringify(allInputBoxes))
    formData.append('signature_boxes', JSON.stringify(allSignatureBoxes))
    formData.append('page_count', documentPageCount)

    axios
      .post(
        type ? `${apiUrl}/api/upload-file?type=agreement` : `${apiUrl}/api/upload-file`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((response) => {
        console.log(response.data)
        setCurrentDocument(response.data.document)
        setSendModalVisible(true)
        toast.success('Save Document', { duration: 3000, position: 'top-right' })
      })
      .catch((error) => {
        if (error.response && error.response.status === 409) {
          toast.error('file already exists')
        } else {
          toast.error('Something went wrong')
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const getIconForFieldType = (fieldType) => {
    switch (fieldType) {
      case 'name':
        return <FaUser size={30} />
      case 'email':
        return <FaEnvelope size={30} />
      case 'company':
        return <FaBuilding size={30} />
      case 'title':
        return <FaTag size={30} />
      case 'text':
        return <FaTextHeight size={30} />
      case 'date':
        return <FaCalendar size={30} />
      case 'initial':
        return <FaCheck size={30} />
      case 'checkbox':
        return <FaCheck size={30} />
      case 'signature':
        return <FaPen size={30} />
      default:
        return <FaTextHeight size={30} />
    }
  }

  const renderBoxes = (boxType) => {
    const boxes =
      boxType === 'input' ? inputBoxes[currentPage] || [] : signatureBoxes[currentPage] || []
    return boxes.map((box, index) => {
      const isDraggingThisBox =
        dragging && draggedElement?.index === index && draggedElement?.type === boxType
      const isFocused =
        focusedBox &&
        focusedBox.index === index &&
        focusedBox.type === boxType &&
        focusedBox.page === currentPage
      const showIcon = isDraggingThisBox || !isFocused

      const boxStyle = {
        position: 'absolute',
        top: `${box.top}px`,
        left: `${box.left}px`,
        maxWidth: boxType === 'input' && !showIcon ? '350px' : '200px',
        width: showIcon ? '50px' : undefined,
        height: showIcon ? '50px' : undefined,
        cursor: isDraggingThisBox ? 'grabbing' : 'grab',
        zIndex: isDraggingThisBox ? 1000 : isFocused ? 100 : 10,
        border: boxType === 'signature' && !showIcon ? '1px solid black' : '1px dashed gray',
        backgroundColor: boxType === 'signature' && !showIcon ? '#fff' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        transition: isDraggingThisBox ? 'none' : 'all 0.2s ease',
        opacity: isDraggingThisBox ? 0.9 : 1,
      }

      return (
        <div
          key={index}
          className={boxType === 'input' && !showIcon ? 'bg-white p-2 rounded shadow-sm' : ''}
          style={boxStyle}
          onMouseDown={handleMouseDown(index, boxType)}
          onMouseUp={handleMouseUp(index, boxType)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setFocusedBox(null)
            }
          }}
          tabIndex={0}
        >
          <span
            className="fs-3 text-secondary text-end cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              removeBox(index, boxType, currentPage)
            }}
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              lineHeight: '0.5',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >
            ×
          </span>
          {showIcon ? (
            <div style={{ fontSize: '30px' }}>{getIconForFieldType(box.fieldType)}</div>
          ) : boxType === 'input' ? (
            <div
              className="position-relative mt-2 text-secondary w-100"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {box.fieldType === 'checkbox' ? (
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </label>
              ) : (
                <input
                  type="text"
                  className="form-control ps-5 pe-3 py-2 border shadow-sm"
                  placeholder={getPlaceholder(box.fieldType)}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              )}
              <div className="d-flex flex-row gap-3 mt-2 justify-content-center w-100">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={box.required || false}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleRequired(index, boxType, currentPage)
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
                <p className="fs-6 text-muted mb-0">Required</p>
              </div>
            </div>
          ) : (
            <div
              style={{ width: '100%', height: '100px', padding: '5px' }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <canvas
                width="180"
                height="80"
                style={{
                  width: '100%',
                  height: '35%',
                  border: '1px dashed #ccc',
                  borderRadius: '4px',
                }}
                onMouseDown={(e) => e.stopPropagation()}
              />
              <div className="d-flex flex-row gap-3 mt-2 justify-content-center w-100">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={box.required || false}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleRequired(index, boxType, currentPage)
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
                <p className="fs-6 text-muted mb-0">Required</p>
              </div>
            </div>
          )}
        </div>
      )
    })
  }

  const handleSendToUser = async (userId) => {
    try {
      setIsButtonLoading(true)
      const response = await axios.post(
        type
          ? `${apiUrl}/api/documents/${currentDocument.id}/submit?type=agreement`
          : `${apiUrl}/api/documents/${currentDocument.id}/submit`,
        {
          user_id: userId,
          status: 'pending',
          data: {
            document_id: currentDocument.id,
            input_boxes: inputBoxes[currentPage] || [],
            signature_boxes: signatureBoxes[currentPage] || [],
            document_name: documentName,
          },
        },
      )
      console.log(`Document ${currentDocument.id} sent to user ${userId}:`, response.data)
      toast.success('Document sent successfully!')
    } catch (error) {
      console.error('Send error:', error.message)
      if (error.response && error.response.status === 409) {
        toast.error('User already has this document.', { duration: 3000, position: 'top-right' })
      } else {
        toast.error('Failed to send via email. Please try again.', {
          duration: 3000,
          position: 'top-right',
        })
      }
    } finally {
      setIsButtonLoading(false)
      return true
    }
  }

  const handleSendViaEmail = async (email) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/documents/${currentDocument.id}/submitToEmail`,
        {
          email: email,
          status: 'pending',
          data: {
            document_id: currentDocument.id,
            input_boxes: inputBoxes[currentPage] || [],
            signature_boxes: signatureBoxes[currentPage] || [],
            document_name: documentName,
          },
        },
      )
      console.log(`Document ${currentDocument.id} sent to email ${email}:`, response.data)
      toast.success('Document sent successfully!', { duration: 3000, position: 'top-right' })
      return true
    } catch (error) {
      console.error('Send error:', error.message)
      if (error.response && error.response.status === 409) {
        toast.error('User already has this document.', { duration: 3000, position: 'top-right' })
      } else {
        toast.error('Failed to send via email. Please try again.', {
          duration: 3000,
          position: 'top-right',
        })
      }
    } finally {
      return true
    }
  }

  return (
    <CContainer>
      <Toaster />
      <h1>Upload PDF or DOCX and Annotate</h1>
      <CFormInput ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      <CModal visible={modalVisible}>
        <CModalHeader>
          <CModalTitle>Enter Document Name</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Document Name"
          />
        </CModalBody>
        <CModalFooter>
          <CButton
            color="primary"
            onClick={handleModalSubmit}
            disabled={fileType === 'pdf' && pdfPages.length === 0}
          >
            Submit
            {fileType === 'pdf' && pdfPages.length === 0 && <CSpinner size="sm" className="ms-2" />}
          </CButton>
        </CModalFooter>
      </CModal>
      {uploadedFile && (
        <div style={{ display: 'flex', marginTop: '20px', flexDirection: 'column' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 'auto',
              marginRight: '20px',
              display: 'flex',
              marginBottom: '20px',
            }}
          >
            {thumbnails}
          </div>
          <div
            style={{
              display: 'flex',
              position: 'relative',
              width: '100%',
              height: 'auto',
            }}
          >
            <div
              ref={containerRef}
              style={{
                position: 'relative',
                width: '70%',
                minHeight: '800px',
                backgroundColor: '#f9f9f9',
                marginRight: '20px',
                boxShadow: '0px 0px 5px rgb(65 26 70)',
                overflow: 'auto',
              }}
              onMouseMove={handleMouseMove}
              onClick={(e) => {
                if (!e.target.closest('.bg-white') && !e.target.closest('div[tabIndex="0"]')) {
                  setFocusedBox(null)
                }
              }}
            >
              {fileType === 'pdf' && (
                <canvas
                  ref={mainCanvasRef}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    zIndex: 1,
                  }}
                />
              )}
              {/* {fileType === 'docx' && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    padding: '20px',
                    overflowY: 'auto',
                  }}
                  dangerouslySetInnerHTML={{ __html: docxContent }}
                />
              )} */}
              {fileType === 'docx' && (

<>
<DocViewer documents={docs} pluginRenderers={DocViewerRenderers} theme={{
    disableThemeScrollbar: false,
  }} style={{height: "100%"}} config={{
    header: {
     disableHeader: false,
     disableFileName: false,
     retainURLParams: false
    }
   }}/>
  {/* <canvas
    ref={mainCanvasRef}
    id="mainCanvasRef"
    style={{
      display: 'block',
      width: '100%',
      height: 'auto',
      zIndex: 1,
    }}
  /> */}
  </>
)}



              {renderBoxes('input')}
              {renderBoxes('signature')}
            </div>
            <div
              style={{
                width: '25%',
                height: '600px',
                overflowY: 'auto',
                boxShadow: '0px 0px 5px rgb(65 26 70)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <CRow
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                }}
              >
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox('name')}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaUser style={{ marginRight: '5px' }} /> Add Name
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox('email')}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaEnvelope style={{ marginRight: '5px' }} /> Add Email
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox('company')}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaBuilding style={{ marginRight: '5px' }} /> Add Company
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox('title')}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaTag style={{ marginRight: '5px' }} /> Add Title
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox('text')}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaTextHeight style={{ marginRight: '5px' }} /> Add Text
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox('date')}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaCalendar style={{ marginRight: '5px' }} /> Add Date Signed
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox('initial')}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaCheck style={{ marginRight: '5px' }} /> Add Initial
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox('checkbox')}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaCheck style={{ marginRight: '5px' }} /> Add Checkbox
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addSignatureBox('signature')}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaPen style={{ marginRight: '5px' }} /> Add Signature
                </CButton>
              </CRow>
            </div>
          </div>
          <div>
            <CButton className="my-3" color="primary" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <CSpinner size="sm" className="me-2" /> : 'Save Submit'}
            </CButton>
          </div>
        </div>
      )}
      <SendModal
        isVisible={sendModalVisible}
        onClose={() => setSendModalVisible(false)}
        document={currentDocument}
        onSendToUser={handleSendToUser}
        onSendViaEmail={handleSendViaEmail}
      />
    </CContainer>
  )
}

export default Create
