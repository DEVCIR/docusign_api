import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import {
  CButton,
  CContainer,
  CFormInput,
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
  CRow,
} from '@coreui/react'
import { apiUrl } from 'src/components/Config/Config'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SendModal from 'src/views/document/SendModal'
import { toast, Toaster } from 'sonner'
import * as pdfjsLib from 'pdfjs-dist'
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
import mammoth from 'mammoth'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

const INITIAL_INPUT_SIZE = { width: 150, height: 30 }
const INITIAL_SIGNATURE_SIZE = { width: 200, height: 100 }

const renderPDFPage = async (page, canvas, width, height) => {
  try {
    const viewport = page.getViewport({ scale: 1 })
    const scale = Math.min(width / viewport.width, height / viewport.height)
    const scaledViewport = page.getViewport({ scale })

    canvas.height = scaledViewport.height
    canvas.width = scaledViewport.width

    const renderContext = {
      canvasContext: canvas.getContext('2d'),
      viewport: scaledViewport,
    }
    await page.render(renderContext).promise
  } catch (error) {
    console.error('Error rendering PDF page:', error)
  }
}

const clampBoxPosition = (box, containerWidth, containerHeight) => ({
  ...box,
  left: Math.max(0, Math.min(box.left, containerWidth - (box.width || INITIAL_INPUT_SIZE.width))),
  top: Math.max(0, Math.min(box.top, containerHeight - (box.height || INITIAL_INPUT_SIZE.height))),
  width: Math.min(box.width || INITIAL_INPUT_SIZE.width, containerWidth - box.left),
  height: Math.min(box.height || INITIAL_INPUT_SIZE.height, containerHeight - box.top),
})

const List = () => {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [sendModalVisible, setSendModalVisible] = useState(false)
  const [currentDocument, setCurrentDocument] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', author: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [emailQuery, setEmailQuery] = useState('')
  const [users, setUsers] = useState([])
  const [inputBoxes, setInputBoxes] = useState({})
  const [signatureBoxes, setSignatureBoxes] = useState({})
  const [draggedElement, setDraggedElement] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pdfPages, setPdfPages] = useState([])
  const [documentPageCount, setDocumentPageCount] = useState(0)
  const [focusedBox, setFocusedBox] = useState(null)
  const [pdfDocument, setPdfDocument] = useState(null)
  const [docxContent, setDocxContent] = useState('')
  const [pageToRender, setPageToRender] = useState(null)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [startPosition, setStartPosition] = useState(null)
  const containerRef = useRef(null)
  const mainCanvasRef = useRef(null)
  const navigate = useNavigate()
  const [thumbnailForceUpdate, setThumbnailForceUpdate] = useState(0)

  useEffect(() => {
    fetchDocuments()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (pdfLoaded && pdfPages.length > 0) {
      setPageToRender({
        page: pdfPages[0],
        pageNumber: 1,
        containerWidth: containerRef.current?.offsetWidth || 800,
      })
    }
  }, [pdfLoaded, pdfPages])

  useEffect(() => {
    if (pageToRender && mainCanvasRef.current) {
      renderPage(pageToRender.pageNumber, pageToRender.page)
    }
  }, [pageToRender, mainCanvasRef.current])

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        type ? `${apiUrl}/api/documents/?type=agreement` : `${apiUrl}/api/documents/`,
      )
      setDocuments(response.data.document)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/user`)
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleViewDocument = ($id) => {
    navigate(`/document/view/${$id}`)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await axios.delete(`${apiUrl}/api/documents/${id}/`)
        setDocuments(documents.filter((document) => document.id !== id))
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }
  }

  const handleEdit = async (document) => {
    if (!document) {
      console.error('No document provided to handleEdit')
      return
    }
    try {
      const response = await axios.get(`${apiUrl}/api/documents/pending/${document.id}/`)
      const doc = response.data.document[0]
      setCurrentDocument(doc)
      setFormData({
        title: doc.name || '',
        description: doc.description || '',
        author: doc.author || '',
      })
      const inputBoxesFromServer = doc.input_boxes ? JSON.parse(doc.input_boxes) : []
      const signatureBoxesFromServer = doc.signature_boxes ? JSON.parse(doc.signature_boxes) : []

      const inputBoxesByPage = {}
      inputBoxesFromServer.forEach((box) => {
        inputBoxesByPage[box.page] = [
          ...(inputBoxesByPage[box.page] || []),
          { ...box, isExpanded: false },
        ]
      })

      const signatureBoxesByPage = {}
      signatureBoxesFromServer.forEach((box) => {
        signatureBoxesByPage[box.page] = [
          ...(signatureBoxesByPage[box.page] || []),
          { ...box, isExpanded: false },
        ]
      })

      setInputBoxes(inputBoxesByPage)
      setSignatureBoxes(signatureBoxesByPage)
      setEditModalVisible(true)
      setPdfLoaded(false)
      setDocxContent('')
      const fileExtension = doc.path.split('.').pop().toLowerCase()
      if (fileExtension === 'pdf') {
        await loadPDF(doc.path)
      } else if (fileExtension === 'docx') {
        await loadDOCX(doc.path)
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      toast.error('Error loading document', { duration: 3000, position: 'top-right' })
    }
  }

  const handleSend = (document) => {
    setCurrentDocument(document)
    setSendModalVisible(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleUpdate = async () => {
    try {
      const allInputBoxes = Object.entries(inputBoxes).flatMap(([page, boxes]) =>
        boxes.map((box) => ({
          ...box,
          page: parseInt(page),
          isExpanded: undefined,
        })),
      )

      const allSignatureBoxes = Object.entries(signatureBoxes).flatMap(([page, boxes]) =>
        boxes.map((box) => ({
          ...box,
          page: parseInt(page),
          isExpanded: undefined,
        })),
      )

      const updatedData = {
        document_name: formData.title,
        input_boxes: JSON.stringify(allInputBoxes),
        signature_boxes: JSON.stringify(allSignatureBoxes),
        type: type || null,
      }

      await axios.post(`${apiUrl}/api/documents/${currentDocument.id}/editDocument`, updatedData)
      await fetchDocuments()
      setEditModalVisible(false)
      toast.success('Document updated successfully!', { duration: 3000, position: 'top-right' })
    } catch (error) {
      console.error('Error updating document:', error)
      toast.error('Failed to update document. Please try again.', {
        duration: 3000,
        position: 'top-right',
      })
    }
  }

  const handleSearchChange = (e) => setSearchQuery(e.target.value)

  const handleEmailChange = (e) => {
    const emails = e.target.value.split(',').map((email) => email.trim())
    setEmailQuery(emails)
  }

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleSendViaEmail = async (email) => {
    try {
      if (!email || email.length === 0) {
        toast.error('Please enter at least one email address.', {
          duration: 3000,
          position: 'top-right',
        })
        return false
      }
      if (Array.isArray(email)) {
        const invalidEmails = email.filter((e) => !validateEmail(e.trim()))
        if (invalidEmails.length > 0) {
          toast.error(`Invalid email format: ${invalidEmails.join(', ')}`, {
            duration: 3000,
            position: 'top-right',
          })
          return false
        }
      } else if (!validateEmail(email.trim())) {
        toast.error('Invalid email format', { duration: 3000, position: 'top-right' })
        return false
      }
      const response = await axios.post(
        type
          ? `${apiUrl}/api/documents/${currentDocument.id}/submitToEmail?type=agreement`
          : `${apiUrl}/api/documents/${currentDocument.id}/submitToEmail`,
        {
          email,
          status: 'pending',
          data: { document_id: currentDocument.id, document_name: currentDocument.name },
        },
      )
      console.log(`Document ${currentDocument.id} sent to email ${email}:`, response.data)
      toast.success('Document sent successfully!', { duration: 3000, position: 'top-right' })
      return true
    } catch (error) {
      console.error('Email send error:', error)
      toast.error('Failed to send via email. Please try again.', {
        duration: 3000,
        position: 'top-right',
      })
    }
  }

  const handleSendToUser = async (userId) => {
    try {
      const response = await axios.post(
        type
          ? `${apiUrl}/api/documents/${currentDocument.id}/submit?type=agreement`
          : `${apiUrl}/api/documents/${currentDocument.id}/submit`,
        {
          user_id: userId,
          status: 'pending',
          data: { document_id: currentDocument.id, document_name: currentDocument.name },
        },
      )
      console.log(`Document ${currentDocument.id} sent to user ${userId}:`, response.data)
      toast.success('Document sent successfully!', { duration: 3000, position: 'top-right' })
    } catch (error) {
      console.error('Send error:', error.message)
      if (error.response && error.response.status === 409) {
        toast.error('User already has this document.', { duration: 3000, position: 'top-right' })
      } else {
        toast.error('Failed to send to user. Please try again.', {
          duration: 3000,
          position: 'top-right',
        })
      }
    } finally {
      return true
    }
  }

  const loadPDF = async (path) => {
    try {
      const pdfUrl = `${apiUrl}/public/storage/${path}`
      const loadingTask = pdfjsLib.getDocument(pdfUrl)
      const pdf = await loadingTask.promise
      setPdfDocument(pdf)
      setDocumentPageCount(pdf.numPages)
      const pagePromises = []
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pagePromises.push(pdf.getPage(pageNum))
      }
      const pages = await Promise.all(pagePromises)
      setPdfPages(pages)
      setPdfLoaded(true)

      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight

      // Clamp existing boxes to container
      setInputBoxes((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([page, boxes]) => [
            page,
            boxes.map((box) => clampBoxPosition(box, containerWidth, containerHeight)),
          ]),
        ),
      )

      setSignatureBoxes((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([page, boxes]) => [
            page,
            boxes.map((box) => clampBoxPosition(box, containerWidth, containerHeight)),
          ]),
        ),
      )
    } catch (error) {
      console.error('Error loading PDF:', error)
      toast.error('Error loading PDF document', { duration: 3000, position: 'top-right' })
    }
  }

  const loadDOCX = async (path) => {
    try {
      const docxUrl = `${apiUrl}/my/${path}`
      const response = await fetch(docxUrl)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const arrayBuffer = await response.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      setDocxContent(result.value)
      setDocumentPageCount(1)
      setCurrentPage(1)
    } catch (error) {
      console.error('Error loading DOCX:', error)
      toast.error('Error loading DOCX document', { duration: 3000, position: 'top-right' })
    }
  }

  const renderPage = async (pageNumber, page) => {
    if (!mainCanvasRef.current || !containerRef.current) return
    const containerWidth = pageToRender?.containerWidth || containerRef.current.offsetWidth
    const viewport = page.getViewport({ scale: 1 })
    const scale = containerWidth / viewport.width
    const scaledViewport = page.getViewport({ scale })
    const canvas = mainCanvasRef.current
    const context = canvas.getContext('2d')
    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height
    try {
      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise
      setCurrentPage(pageNumber)
    } catch (error) {
      console.error('Error rendering page:', error)
      toast.error('Failed to render PDF page.', { duration: 3000, position: 'top-right' })
    }
  }

  const handleMouseDown = (index, type, page) => (e) => {
    e.preventDefault()
    // Check if the click is on the checkbox or close button
    if (e.target.type === 'checkbox' || e.target.classList.contains('close-button')) {
      return
    }
    const box = type === 'input' ? inputBoxes[page][index] : signatureBoxes[page][index]
    const isFocused =
      focusedBox &&
      focusedBox.index === index &&
      focusedBox.type === type &&
      focusedBox.page === page

    const containerRect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - containerRect.left
    const clickY = e.clientY - containerRect.top

    // Check if resizing
    const isResizeHandle = e.target.classList.contains('resize-handle')
    const resizeDirection = isResizeHandle ? e.target.dataset.direction : null

    if (isResizeHandle && isFocused) {
      setDraggedElement({
        index,
        type,
        page,
        isResizing: true,
        resizeDirection,
        startWidth: box.width || 150,
        startHeight: box.height || 30,
        startX: clickX,
        startY: clickY,
      })
      setDragging(true)
      return
    }

    if (isFocused) {
      const updatedBoxes = type === 'input' ? { ...inputBoxes } : { ...signatureBoxes }
      updatedBoxes[page][index] = {
        ...box,
        left: clickX - 25,
        top: clickY - 25,
      }

      if (type === 'input') {
        setInputBoxes(updatedBoxes)
      } else {
        setSignatureBoxes(updatedBoxes)
      }
    }

    setDraggedElement({
      index,
      type,
      page,
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
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height

    const box =
      draggedElement.type === 'input'
        ? inputBoxes[draggedElement.page][draggedElement.index]
        : signatureBoxes[draggedElement.page][draggedElement.index]

    // Handle resizing
    if (draggedElement.isResizing) {
      const currentX = e.clientX - containerRect.left
      const currentY = e.clientY - containerRect.top

      const updatedBoxes =
        draggedElement.type === 'input' ? { ...inputBoxes } : { ...signatureBoxes }
      const newBox = { ...box }

      // Store original right and bottom positions
      const originalRight = box.left + box.width
      const originalBottom = box.top + box.height

      switch (draggedElement.resizeDirection) {
        case 'nw': // Top-left
          {
            // Calculate new dimensions based on mouse position
            const newLeft = Math.min(currentX, originalRight - 50)
            const newTop = Math.min(currentY, originalBottom - 30)
            const newWidth = originalRight - newLeft
            const newHeight = originalBottom - newTop

            // Apply new dimensions if they meet minimum requirements
            if (newWidth >= 50) {
              newBox.left = newLeft
              newBox.width = newWidth
            }
            if (newHeight >= 30) {
              newBox.top = newTop
              newBox.height = newHeight
            }
          }
          break

        case 'ne': // Top-right
          {
            const newRight = Math.max(currentX, box.left + 50)
            const newTop = Math.min(currentY, originalBottom - 30)
            const newWidth = newRight - box.left
            const newHeight = originalBottom - newTop

            if (newWidth >= 50) {
              newBox.width = newWidth
            }
            if (newHeight >= 30) {
              newBox.top = newTop
              newBox.height = newHeight
            }
          }
          break

        case 'sw': // Bottom-left
          {
            const newLeft = Math.min(currentX, originalRight - 50)
            const newBottom = Math.max(currentY, box.top + 30)
            const newWidth = originalRight - newLeft
            const newHeight = newBottom - box.top

            if (newWidth >= 50) {
              newBox.left = newLeft
              newBox.width = newWidth
            }
            if (newHeight >= 30) {
              newBox.height = newHeight
            }
          }
          break

        case 'se': // Bottom-right
          {
            const newWidth = Math.max(50, currentX - box.left)
            const newHeight = Math.max(30, currentY - box.top)
            newBox.width = newWidth
            newBox.height = newHeight
          }
          break

        default:
          break
      }

      // Final position constraints with container bounds
      newBox.left = Math.max(0, Math.min(newBox.left, containerWidth - newBox.width))
      newBox.top = Math.max(0, Math.min(newBox.top, containerHeight - newBox.height))
      newBox.width = Math.min(newBox.width, containerWidth - newBox.left)
      newBox.height = Math.min(newBox.height, containerHeight - newBox.top)

      updatedBoxes[draggedElement.page][draggedElement.index] = newBox

      if (draggedElement.type === 'input') {
        setInputBoxes(updatedBoxes)
      } else {
        setSignatureBoxes(updatedBoxes)
      }
      return
    }

    let newLeft = e.clientX - containerRect.left - draggedElement.offsetX
    let newTop = e.clientY - containerRect.top - draggedElement.offsetY

    const maxLeft = containerRect.width - 50
    const maxTop = containerRect.height - 50

    newLeft = Math.max(0, Math.min(newLeft, maxLeft))
    newTop = Math.max(0, Math.min(newTop, maxTop))

    const updatedBoxes = draggedElement.type === 'input' ? { ...inputBoxes } : { ...signatureBoxes }
    updatedBoxes[draggedElement.page][draggedElement.index] = { ...box, left: newLeft, top: newTop }

    if (draggedElement.type === 'input') {
      setInputBoxes(updatedBoxes)
    } else {
      setSignatureBoxes(updatedBoxes)
    }
  }

  const handleMouseUp = (index, type, page) => (e) => {
    e.preventDefault()
    // Check if the click is on the checkbox or close button
    if (e.target.type === 'checkbox' || e.target.classList.contains('close-button')) {
      return
    }
    if (dragging && draggedElement) {
      // Clear resize state first
      if (draggedElement.isResizing) {
        setDraggedElement(null)
        setDragging(false)
        setStartPosition(null)
        return
      }

      // Existing click handling logic
      const dx = Math.abs(e.clientX - startPosition.x)
      const dy = Math.abs(e.clientY - startPosition.y)
      const threshold = 5

      if (dx <= threshold && dy <= threshold) {
        setFocusedBox((prevFocus) =>
          prevFocus?.index === index && prevFocus?.type === type && prevFocus?.page === page
            ? null
            : { index, type, page },
        )
      }
    }
    setDragging(false)
    setDraggedElement(null)
    setStartPosition(null)
  }

  const addInputBox = (fieldType) => {
    const newPage = currentPage
    const containerWidth = containerRef.current.offsetWidth
    const containerHeight = containerRef.current.offsetHeight

    setInputBoxes((prevBoxes) => ({
      ...prevBoxes,
      [newPage]: [
        ...(prevBoxes[newPage] || []),
        clampBoxPosition(
          {
            fieldType,
            top: 100,
            left: 100,
            page: newPage,
            required: false,
            ...INITIAL_INPUT_SIZE,
          },
          containerWidth,
          containerHeight,
        ),
      ],
    }))
  }

  const addSignatureBox = (fieldType) => {
    const newPage = currentPage
    const containerWidth = containerRef.current.offsetWidth
    const containerHeight = containerRef.current.offsetHeight

    setSignatureBoxes((prevBoxes) => ({
      ...prevBoxes,
      [newPage]: [
        ...(prevBoxes[newPage] || []),
        clampBoxPosition(
          {
            fieldType,
            top: 100,
            left: 100,
            page: newPage,
            required: false,
            ...INITIAL_SIGNATURE_SIZE,
          },
          containerWidth,
          containerHeight,
        ),
      ],
    }))
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

  const renderBoxes = (boxType) => {
    const boxes =
      boxType === 'input' ? inputBoxes[currentPage] || [] : signatureBoxes[currentPage] || []

    return boxes.map((box, index) => {
      const isDraggingThisBox =
        dragging && draggedElement?.index === index && draggedElement?.type === boxType
      const isFocused =
        focusedBox?.index === index &&
        focusedBox?.type === boxType &&
        focusedBox?.page === currentPage
      const showIcon = (isDraggingThisBox && !draggedElement?.isResizing) || !isFocused
      const initialSize = boxType === 'input' ? INITIAL_INPUT_SIZE : INITIAL_SIGNATURE_SIZE

      const boxStyle = {
        position: 'absolute',
        top: `${box.top}px`,
        left: `${box.left}px`,
        width: showIcon ? '50px' : `${box.width || initialSize.width}px`,
        height: showIcon ? '50px' : `${box.height || initialSize.height}px`,
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
        minWidth: initialSize.width + 'px',
        minHeight: initialSize.height + 'px',
        borderRadius: '8px',
      }

      return (
        <div
          key={index}
          className={boxType === 'input' && !showIcon ? 'bg-white p-2 rounded shadow-sm' : ''}
          style={boxStyle}
          onMouseDown={handleMouseDown(index, boxType, currentPage)}
          onMouseUp={handleMouseUp(index, boxType, currentPage)}
          tabIndex={0}
        >
          {/* Close button */}
          <span
            className="fs-3 text-secondary text-end cursor-pointer close-button"
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
              zIndex: 1001,
              pointerEvents: 'auto',
            }}
          >
            ×
          </span>

          {/* Resize handles */}
          {isFocused && (
            <>
              <div
                className="resize-handle"
                data-direction="nw"
                style={{
                  position: 'absolute',
                  left: -4,
                  top: -4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#007bff',
                  cursor: 'nwse-resize',
                  pointerEvents: 'auto',
                }}
              />
              <div
                className="resize-handle"
                data-direction="ne"
                style={{
                  position: 'absolute',
                  right: -4,
                  top: -4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#007bff',
                  cursor: 'nesw-resize',
                  pointerEvents: 'auto',
                }}
              />
              <div
                className="resize-handle"
                data-direction="sw"
                style={{
                  position: 'absolute',
                  left: -4,
                  bottom: -4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#007bff',
                  cursor: 'nesw-resize',
                  pointerEvents: 'auto',
                }}
              />
              <div
                className="resize-handle"
                data-direction="se"
                style={{
                  position: 'absolute',
                  right: -4,
                  bottom: -4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#007bff',
                  cursor: 'nwse-resize',
                  pointerEvents: 'auto',
                }}
              />
            </>
          )}

          {showIcon ? (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center">
              {getIconForFieldType(box.fieldType)}
            </div>
          ) : boxType === 'input' ? (
            <div
              className="position-relative mt-2 text-secondary w-100"
              style={{ pointerEvents: 'none' }}
            >
              {box.fieldType === 'checkbox' ? (
                <label className="form-check-label" style={{ pointerEvents: 'auto' }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    disabled
                    style={{ pointerEvents: 'auto' }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </label>
              ) : (
                <input
                  type="text"
                  className="form-control ps-5 pe-3 py-2 border shadow-sm rounded"
                  placeholder={getPlaceholder(box.fieldType)}
                  disabled
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              )}
              <div
                className="d-flex flex-row gap-3 mt-2 justify-content-center w-100"
                style={{ pointerEvents: 'auto' }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={box.required || false}
                  style={{ pointerEvents: 'auto' }}
                  onChange={(e) => toggleRequired(index, boxType, currentPage)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
                <p className="fs-6 text-muted mb-0">Required</p>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100px', padding: '5px', pointerEvents: 'none' }}>
              <canvas
                width="180"
                height="80"
                style={{
                  width: '100%',
                  height: '35%',
                  border: '1px dashed #ccc',
                  borderRadius: '4px',
                  pointerEvents: 'auto',
                }}
                onMouseDown={(e) => e.stopPropagation()}
              />
              <div
                className="d-flex flex-row gap-3 mt-2 justify-content-center w-100"
                style={{ pointerEvents: 'auto' }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={box.required || false}
                  style={{ pointerEvents: 'auto' }}
                  onChange={(e) => toggleRequired(index, boxType, currentPage)}
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
            width: '100px',
            height: 'auto',
            cursor: 'pointer',
            margin: '5px',
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
    [currentPage],
  )

  const thumbnails = useMemo(() => {
    if (currentDocument?.path?.toLowerCase().endsWith('.pdf') && pdfPages.length) {
      return pdfPages.map((page, index) => renderThumbnail(page, index))
    }
    return null
  }, [currentDocument?.path, pdfPages.length, renderThumbnail])

  // const renderFieldsOnDocument = async (document, inputBoxes, signatureBoxes) => {
  //   if (!document || (!document.file && !document.path)) {
  //     throw new Error('Invalid document or missing file path')
  //   }

  //   const filePath = document.file || document.path
  //   const response = await fetch(`${apiUrl}/public/storage/${filePath}`)
  //   const blob = await response.blob()

  //   if (filePath.toLowerCase().endsWith('.pdf')) {
  //     const pdfDoc = await pdfjsLib.getDocument(URL.createObjectURL(blob)).promise
  //     const canvas = document.createElement('canvas')
  //     const ctx = canvas.getContext('2d')

  //     // For each page in the PDF
  //     for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
  //       const page = await pdfDoc.getPage(pageNum)
  //       const viewport = page.getViewport({ scale: 1 })

  //       canvas.width = viewport.width
  //       canvas.height = viewport.height

  //       // Render PDF page
  //       await page.render({
  //         canvasContext: ctx,
  //         viewport: viewport,
  //       }).promise

  //       // Draw input fields for this page
  //       const pageInputs = inputBoxes[pageNum] || []
  //       const pageSignatures = signatureBoxes[pageNum] || []

  //       ;[...pageInputs, ...pageSignatures].forEach((box) => {
  //         ctx.save()
  //         ctx.strokeStyle = '#000'
  //         ctx.strokeRect(box.left, box.top, box.fieldType === 'checkbox' ? 20 : 150, 30)
  //         ctx.restore()
  //       })
  //     }

  //     return new Promise((resolve) => {
  //       canvas.toBlob((blob) => resolve(blob), 'application/pdf')
  //     })
  //   } else if (filePath.toLowerCase().endsWith('.docx')) {
  //     // For DOCX handling remains the same
  //     const result = await mammoth.convertToHtml(blob)
  //     let html = result.value

  //     Object.entries(inputBoxes).forEach(([page, boxes]) => {
  //       boxes.forEach((box) => {
  //         const marker = `<div style="position:absolute;left:${box.left}px;top:${box.top}px;border:1px solid black;width:150px;height:30px"></div>`
  //         html += marker
  //       })
  //     })

  //     return new Blob([html], {
  //       type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //     })
  //   }
  // }

  // const handleDownload = async (document) => {
  //   try {
  //     if (!document?.id) {
  //       console.error('No document ID provided')
  //       toast.error('Document not found')
  //       return
  //     }

  //     // First fetch the document details including input/signature boxes
  //     const response = await axios.get(`${apiUrl}/api/documents/pending/${document.id}/`)
  //     const doc = response.data.document[0]

  //     // Parse the input and signature boxes from the server
  //     const inputBoxesFromServer = doc.input_boxes ? JSON.parse(doc.input_boxes) : []
  //     const signatureBoxesFromServer = doc.signature_boxes ? JSON.parse(doc.signature_boxes) : []

  //     // Organize boxes by page
  //     const inputBoxesByPage = {}
  //     inputBoxesFromServer.forEach((box) => {
  //       inputBoxesByPage[box.page] = [
  //         ...(inputBoxesByPage[box.page] || []),
  //         { ...box, isExpanded: false },
  //       ]
  //     })

  //     const signatureBoxesByPage = {}
  //     signatureBoxesFromServer.forEach((box) => {
  //       signatureBoxesByPage[box.page] = [
  //         ...(signatureBoxesByPage[box.page] || []),
  //         { ...box, isExpanded: false },
  //       ]
  //     })

  //     // Now render the document with the boxes
  //     const modifiedBlob = await renderFieldsOnDocument(doc, inputBoxesByPage, signatureBoxesByPage)

  //     if (!modifiedBlob) {
  //       throw new Error('Failed to generate document blob')
  //     }

  //     const url = URL.createObjectURL(modifiedBlob)
  //     const a = document.createElement('a')
  //     a.href = url
  //     a.download = doc.name || 'document'
  //     document.body.appendChild(a)
  //     a.click()
  //     document.body.removeChild(a)
  //     URL.revokeObjectURL(url)

  //     toast.success('Document downloaded successfully!')
  //   } catch (error) {
  //     console.error('Error downloading document:', error)
  //     toast.error('Failed to download document: ' + error.message)
  //   }
  // }
  const renderFieldsOnDocument = async (docment, inputBoxes, signatureBoxes) => {
    if (typeof window === 'undefined' || typeof docment === 'undefined') {
      console.error('This function should only be called in a browser environment')
      return
    }

    if (!docment || (!docment.file && !docment.path)) {
      throw new Error('Invalid document or missing file path')
    }

    const filePath = docment.file || docment.path
    const response = await fetch(`${apiUrl}/public/storage/${filePath}`)
    const blob = await response.blob()

    if (filePath.toLowerCase().endsWith('.pdf')) {
      const pdfDoc = await pdfjsLib.getDocument(URL.createObjectURL(blob)).promise
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1 })

        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise

        const pageInputs = inputBoxes[pageNum] || []
        const pageSignatures = signatureBoxes[pageNum] || []

        ;[...pageInputs, ...pageSignatures].forEach((box) => {
          ctx.save()
          ctx.strokeStyle = '#000'
          ctx.strokeRect(box.left, box.top, box.fieldType === 'checkbox' ? 20 : 150, 30)
          ctx.restore()
        })
      }

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create PDF blob'))
          }
        }, 'application/pdf')
      })
    } else if (filePath.toLowerCase().endsWith('.docx')) {
      const arrayBuffer = await blob.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      let html = result.value

      Object.entries(inputBoxes).forEach(([page, boxes]) => {
        boxes.forEach((box) => {
          const marker = `<div style="position:absolute;left:${box.left}px;top:${box.top}px;border:1px solid black;width:150px;height:30px"></div>`
          html += marker
        })
      })

      return new Blob([html], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    }
  }

  const handleDownload = async (doc) => {
    // Renamed parameter to avoid shadowing
    try {
      if (!doc?.id) {
        console.error('No document ID provided')
        toast.error('Document not found')
        return
      }

      const response = await axios.get(`${apiUrl}/api/documents/pending/${doc.id}/`)
      const documentData = response.data.document[0]

      const inputBoxesFromServer = documentData.input_boxes
        ? JSON.parse(documentData.input_boxes)
        : []
      const signatureBoxesFromServer = documentData.signature_boxes
        ? JSON.parse(documentData.signature_boxes)
        : []

      const inputBoxesByPage = {}
      inputBoxesFromServer.forEach((box) => {
        inputBoxesByPage[box.page] = [
          ...(inputBoxesByPage[box.page] || []),
          { ...box, isExpanded: false },
        ]
      })

      const signatureBoxesByPage = {}
      signatureBoxesFromServer.forEach((box) => {
        signatureBoxesByPage[box.page] = [
          ...(signatureBoxesByPage[box.page] || []),
          { ...box, isExpanded: false },
        ]
      })

      const modifiedBlob = await renderFieldsOnDocument(
        documentData,
        inputBoxesByPage,
        signatureBoxesByPage,
      )

      if (!modifiedBlob) {
        throw new Error('Failed to generate document blob')
      }

      const url = URL.createObjectURL(modifiedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = documentData.name || 'document'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Document downloaded successfully!')
    } catch (error) {
      console.log(doc)
      console.error('Error downloading document:', error)
      toast.error('Failed to download document: ' + error.message)
    }
  }

  return (
    <CContainer>
      <Toaster />
      <h1>Document List</h1>
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
              {documents.map((document, index) => (
                <CTableRow key={document.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{document.name}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="primary"
                      onClick={() => {
                        setCurrentDocument(document)
                        handleDownload(document)
                      }}
                      className="me-2"
                    >
                      Download with Fields
                    </CButton>
                    <a
                      className="btn btn-outline-secondary"
                      href={`${apiUrl}/public/storage/${document.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Original
                    </a>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="warning"
                      size="sm"
                      onClick={() => handleEdit(document)}
                      className="me-2"
                    >
                      Edit
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(document.id)}
                      className="me-2"
                    >
                      Delete
                    </CButton>
                    <CButton color="info" size="sm" onClick={() => handleSend(document)}>
                      Send
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} size="xl">
            <CModalHeader>
              <CModalTitle>Edit Document</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <div style={{ display: 'flex', marginTop: '20px' }}>
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
                  {currentDocument?.path?.toLowerCase().endsWith('.pdf') && (
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
                  {currentDocument?.path?.toLowerCase().endsWith('.docx') && (
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        padding: '20px',
                        backgroundColor: 'white',
                        overflowY: 'auto',
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
                    // height: '600px',
                    height: 'fit-content',
                    overflowY: 'auto',
                    boxShadow: '0px 0px 5px rgb(65 26 70)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                  }}
                >
                  <div className="mb-3">
                    <label className="form-label">Document Name</label>
                    <CFormInput
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <CRow
                    style={{
                      marginTop: '20px',
                      display: 'flex',
                      gap: '10px',
                      flexDirection: 'column',
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                    {thumbnails}
                  </div>
                </div>
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
                Close
              </CButton>
              <CButton color="primary" onClick={handleUpdate}>
                Save Changes
              </CButton>
            </CModalFooter>
          </CModal>
          <SendModal
            isVisible={sendModalVisible}
            onClose={() => setSendModalVisible(false)}
            document={currentDocument}
            onSendToUser={handleSendToUser}
            onSendViaEmail={handleSendViaEmail}
          />
        </>
      )}
    </CContainer>
  )
}

export default List
