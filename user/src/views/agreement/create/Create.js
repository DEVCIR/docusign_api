import React, { useState, useRef, useEffect } from 'react'
import {
  CContainer,
  CButton,
  CFormInput,
  CRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import { apiUrl } from '../../../components/Config/Config'
import axios from 'axios'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

const Create = () => {
  const [fileType, setFileType] = useState('')
  const [docxContent, setDocxContent] = useState('')
  const [inputBoxes, setInputBoxes] = useState([])
  const [signatureBoxes, setSignatureBoxes] = useState([])
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

  const containerRef = useRef(null)
  const mainCanvasRef = useRef(null)
  const mainContextRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (mainCanvasRef.current) {
      const canvas = mainCanvasRef.current
      const context = canvas.getContext('2d')
      if (context) {
        mainContextRef.current = context
      }
    }
  }, [fileType])

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    const fileType = file.name.split('.').pop().toLowerCase()
    const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.')

    setFileName(nameWithoutExtension)
    setDocumentName(nameWithoutExtension)
    setModalVisible(true)

    if (fileType === 'pdf') {
      setFileType('pdf')
      loadPDF(file)
    } else if (fileType === 'docx') {
      setFileType('docx')
      loadDOCX(file)
    } else {
      alert('Please upload a valid PDF or DOCX file.')
    }
  }

  const loadPDF = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const typedArray = new Uint8Array(e.target.result)
      pdfjsLib.getDocument(typedArray).promise.then((loadedPDF) => {
        setPdfDocument(loadedPDF)
        setDocumentPageCount(loadedPDF.numPages)

        const pagePromises = []
        for (let pageNum = 1; pageNum <= loadedPDF.numPages; pageNum++) {
          pagePromises.push(loadedPDF.getPage(pageNum))
        }

        Promise.all(pagePromises).then((pages) => {
          setPdfPages(pages)
          renderPage(1, loadedPDF, pages[0])
        })
      })
    }
    reader.readAsArrayBuffer(file)
  }

  const loadDOCX = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target.result
      mammoth.convertToHtml({ arrayBuffer }).then((resultObject) => {
        setDocxContent(resultObject.value)
        setDocumentPageCount(1)
      })
    }
    reader.readAsArrayBuffer(file)
  }

  const renderPage = (pageNumber, pdfDoc, page) => {
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = mainCanvasRef.current
    const context = mainContextRef.current

    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }

    page.render(renderContext)
    setCurrentPage(pageNumber)
  }

  const renderThumbnails = () => {
    if (fileType === 'pdf' && pdfPages.length) {
      return pdfPages.map((page, index) => {
        const thumbnailScale = 0.2
        const viewport = page.getViewport({ scale: thumbnailScale })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        }

        page.render(renderContext)

        return (
          <div
            key={index}
            onClick={() => renderPage(index + 1, pdfDocument, page)}
            style={{
              border: currentPage === index + 1 ? '2px solid blue' : '1px solid gray',
              margin: '5px',
              cursor: 'pointer',
              width: 'fit-content',
            }}
          >
            <img
              src={canvas.toDataURL()}
              alt={`Page ${index + 1}`}
              style={{ width: '100px', height: 'auto' }}
            />
            <div style={{ textAlign: 'center' }}>Page {index + 1}</div>
          </div>
        )
      })
    } else if (fileType === 'docx') {
      // For DOCX, show a placeholder thumbnail (or first paragraph/content preview)
      return (
        <div
          key='docx-preview'
          style={{
            border: '1px solid gray',
            margin: '5px',
            cursor: 'pointer',
            width: 'fit-content',
          }}
        >
          <div style={{ width: '100px', height: 'auto', backgroundColor: '#f0f0f0' }}>
            {/* Render a simple preview or placeholder */}
            <div style={{ textAlign: 'center', padding: '20px' }}>DOCX Preview</div>
          </div>
          <div style={{ textAlign: 'center' }}>1 Page</div>
        </div>
      )
    }
    return null
  }

  const handleMouseDown = (index, type) => (e) => {
    e.preventDefault()
    setDraggedElement({ index, type })
    setDragging(true)
    setFocusedBox({ index, type })
  }

  // const handleMouseUp = () => {
  //   setDragging(false);
  //   setDraggedElement(null);
  // };

  // const handleMouseMove = (e) => {
  //   if (!dragging || !draggedElement) return;

  //   const containerRect = containerRef.current.getBoundingClientRect();
  //   const mouseX = e.clientX - containerRect.left;
  //   const mouseY = e.clientY - containerRect.top;

  //   const updatedBoxes = draggedElement.type === 'input' ? [...inputBoxes] : [...signatureBoxes];
  //   const box = updatedBoxes[draggedElement.index];

  //   const newLeft = Math.max(0, Math.min(mouseX - 50, containerRect.width - 100));
  //   const newTop = Math.max(0, Math.min(mouseY - 15, containerRect.height - 30));

  //   updatedBoxes[draggedElement.index] = {
  //     ...box,
  //     top: newTop,
  //     left: newLeft,
  //     page: currentPage
  //   };

  //   if (draggedElement.type === 'input') {
  //     setInputBoxes(updatedBoxes);
  //   } else {
  //     setSignatureBoxes(updatedBoxes);
  //   }
  // };

  const handleMouseUp = () => {
    setDragging(false)
    setDraggedElement(null)
  }

  const handleMouseMove = (e) => {
    if (!dragging || !draggedElement) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - containerRect.left
    const mouseY = e.clientY - containerRect.top

    const updatedBoxes = draggedElement.type === 'input' ? [...inputBoxes] : [...signatureBoxes]
    const box = updatedBoxes[draggedElement.index]

    const newLeft = Math.max(0, Math.min(mouseX - 50, containerRect.width - 100)) // Box size 100x30
    const newTop = Math.max(0, Math.min(mouseY - 15, containerRect.height - 30))

    updatedBoxes[draggedElement.index] = { ...box, top: newTop, left: newLeft }

    if (draggedElement.type === 'input') {
      setInputBoxes(updatedBoxes)
    } else {
      setSignatureBoxes(updatedBoxes)
    }
  }

  const addInputBox = (fieldType) => {
    const newInputBox = {
      top: 100,
      left: 50,
      id: inputBoxes.length,
      fieldType,
      page: currentPage,
    }
    setInputBoxes([...inputBoxes, newInputBox])
  }

  const addSignatureBox = () => {
    const newSignatureBox = {
      top: 200,
      left: 50,
      id: signatureBoxes.length,
      fieldType: 'signature',
      page: currentPage,
    }
    setSignatureBoxes([...signatureBoxes, newSignatureBox])
  }

  // Handle removing a box
  const removeBox = (index, type) => {
    if (type === 'input') {
      const updatedInputBoxes = inputBoxes.filter((box, i) => i !== index)
      setInputBoxes(updatedInputBoxes)
    } else {
      const updatedSignatureBoxes = signatureBoxes.filter((box, i) => i !== index)
      setSignatureBoxes(updatedSignatureBoxes)
    }
    setFocusedBox(null) // Remove focus after removing the box
  }

  const handleModalSubmit = () => {
    setModalVisible(false)
    setUploadedFile(true)
  }

  const handleSubmit = () => {
    const formData = new FormData()
    const fileInput = fileInputRef.current

    formData.append('file', fileInput.files[0])
    formData.append('document_name', documentName)
    formData.append('input_boxes', JSON.stringify(inputBoxes))
    formData.append('signature_boxes', JSON.stringify(signatureBoxes))
    formData.append('page_count', documentPageCount)

    axios
      .post(
        `${apiUrl}/api/upload-file`,

        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      .then((response) => {
        console.log(response.data)
        // Handle success
        alert('Save Document')
      })
      .catch((error) => {
        console.error(error)
        // Handle error
      })
  }

  const renderBoxes = (boxType) => {
    const boxes = boxType === 'input' ? inputBoxes : signatureBoxes
    return boxes
      .filter((box) => box.page === currentPage)
      .map((box, index) => (
        <div
          key={index}
          onMouseDown={handleMouseDown(index, boxType)}
          style={{
            position: 'absolute',
            top: `${box.top}px`,
            left: `${box.left}px`,
            width:
              boxType === 'input' ? (box.fieldType === 'checkbox' ? '30px' : '200px') : '200px',
            height: boxType === 'input' ? '30px' : '100px',
            border: '1px solid #ccc',
            backgroundColor: boxType === 'input' ? 'lightblue' : 'white',
            cursor: 'move',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {boxType === 'input' && renderInputField(box.fieldType)}
          {boxType === 'signature' && <canvas style={{ width: '100%', height: '100%' }} />}

          {focusedBox && focusedBox.index === index && focusedBox.type === boxType && (
            <button onClick={() => removeBox(index, boxType)} style={{ marginLeft: '5px' }}>
              Remove
            </button>
          )}
        </div>
      ))
  }

  const renderInputField = (fieldType) => {
    switch (fieldType) {
      case 'text':
        return <input type='text' placeholder='Text Input' style={{ width: '90%' }} />
      case 'name':
        return <input type='text' placeholder='Name' style={{ width: '90%' }} />
      case 'email':
        return <input type='email' placeholder='Email' style={{ width: '90%' }} />
      case 'company':
        return <input type='text' placeholder='Company' style={{ width: '90%' }} />
      case 'title':
        return <input type='text' placeholder='Title' style={{ width: '90%' }} />
      case 'date':
        return <input type='date' style={{ width: '90%' }} />
      case 'checkbox':
        return <input type='checkbox' />
      case 'initial':
        return <input type='text' placeholder='Initial' style={{ width: '90%' }} />
      default:
        return null
    }
  }

  return (
    <CContainer>
      <h1>Upload PDF or DOCX and Annotate</h1>
      <CFormInput ref={fileInputRef} type='file' accept='.pdf,.docx' onChange={handleFileChange} />

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Enter Document Name</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type='text'
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder='Document Name'
          />
        </CModalBody>
        <CModalFooter>
          <CButton color='primary' onClick={handleModalSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Conditional rendering for uploaded file */}
      {uploadedFile && (
        <div style={{ display: 'flex', marginTop: '20px' }}>
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '70%',
              height: 'auto',
              border: '1px solid #ccc',
              // overflow: 'auto',
              backgroundColor: '#f9f9f9',
              marginRight: '20px',
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {fileType === 'pdf' && (
              <canvas
                ref={mainCanvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            )}

            {fileType === 'docx' && (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                }}
                dangerouslySetInnerHTML={{ __html: docxContent }}
              />
            )}

            {renderBoxes('input')}
            {renderBoxes('signature')}
          </div>

          <div
            style={{
              width: '25%',
              height: '600px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {fileType === 'pdf' && renderThumbnails()}
            {fileType === 'docx' && renderThumbnails()}
          </div>
        </div>
      )}

      <CRow style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <CButton
          className='btn-info'
          onClick={() => addInputBox('name')}
          style={{ width: '300px' }}
        >
          Add Name
        </CButton>
        <CButton
          className='btn-info'
          onClick={() => addInputBox('email')}
          style={{ width: '300px' }}
        >
          Add Email
        </CButton>
        <CButton
          className='btn-info'
          onClick={() => addInputBox('company')}
          style={{ width: '300px' }}
        >
          Add Company
        </CButton>
        <CButton
          className='btn-info'
          onClick={() => addInputBox('title')}
          style={{ width: '300px' }}
        >
          Add Title
        </CButton>
        <CButton
          className='btn-info'
          onClick={() => addInputBox('text')}
          style={{ width: '300px' }}
        >
          Add Text
        </CButton>
        <CButton
          className='btn-info'
          onClick={() => addInputBox('date')}
          style={{ width: '300px' }}
        >
          Add Date Signed
        </CButton>
        <CButton
          className='btn-info'
          onClick={() => addInputBox('initial')}
          style={{ width: '300px' }}
        >
          Add Initial
        </CButton>
        <CButton
          className='btn-info'
          onClick={() => addInputBox('checkbox')}
          style={{ width: '300px' }}
        >
          Add Checkbox
        </CButton>
        <CButton className='btn-info' onClick={() => addSignatureBox()} style={{ width: '300px' }}>
          Add Signature
        </CButton>

        <CButton color='primary' onClick={handleSubmit}>
          Save Submit
        </CButton>
      </CRow>
    </CContainer>
  )
}

export default Create
