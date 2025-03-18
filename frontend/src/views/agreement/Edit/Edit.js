import React, { useEffect, useRef, useState, useCallback, memo } from 'react'
import { CButton, CContainer, CFormInput, CSpinner, CRow } from '@coreui/react'
import axios from 'axios'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import { useNavigate, useParams } from 'react-router-dom'
import { apiUrl } from 'src/components/Config/Config'
import { toast, Toaster } from 'sonner'
import
{
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaTag,
  FaTextHeight,
  FaCalendar,
  FaCheck,
  FaPen,
} from 'react-icons/fa'
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer'
import PropTypes from 'prop-types'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

// const INITIAL_INPUT_SIZE = { width: 150, height: 30 }
const INITIAL_SIGNATURE_SIZE = { width: 12, height: 0.4 }
const MIN_SIZE = 20

// Replace the existing clampBoxPosition function
const clampBoxPosition = ( box, containerWidth, containerHeight ) =>
{
  // Ensure numeric values for position and size
  const left = typeof box.left === 'number' ? box.left : 0
  const top = typeof box.top === 'number' ? box.top : 0

  console.log( '' )

  const width =
    typeof box.width === 'number'
      ? box.width
      : box.type === 'signature'
        ? INITIAL_SIGNATURE_SIZE.width
        : 30
  const height =
    typeof box.height === 'number'
      ? box.height
      : box.type === 'signature'
        ? INITIAL_SIGNATURE_SIZE.height
        : 30

  // Log the coordinates for debugging
  // console.log('Clamping box:', {
  //   original: { ...box },
  //   container: { containerWidth, containerHeight },
  // })
  // console.clear();
  console.log( box )
  return {
    ...box,
    left: Math.max( 0, Math.min( left, containerWidth - width ) ),
    top: Math.max( 0, Math.min( top, containerHeight - height ) ),
    width: Math.max( 0, Math.min( width, containerHeight - left ) ),
    height: Math.max( 0, Math.min( height, containerHeight - top ) ),
    // width: Math.max( MIN_SIZE, Math.min( width, containerWidth - left ) ),
    // width: 100,
    // height: Math.max( MIN_SIZE, Math.min( height, containerHeight - top ) ),
    // height: 100,
  }
}

const Document = memo( ( { containerRef, fileType, docs, pdfPages, renderPDFPage } ) =>
{
  const canvasRefs = useRef( [] )
  const renderTasks = useRef( [] )

  useEffect( () =>
  {
    canvasRefs.current = pdfPages.map( ( _, i ) => canvasRefs.current[ i ] || React.createRef() )
    renderTasks.current = pdfPages.map( () => null )
  }, [ pdfPages ] )

  useEffect( () =>
  {
    if ( fileType !== 'pdf' || !pdfPages.length ) return

    pdfPages.forEach( ( page, index ) =>
    {
      const canvas = canvasRefs.current[ index ]?.current
      if ( !canvas ) return

      if ( renderTasks.current[ index ] )
      {
        renderTasks.current[ index ].cancel()
      }

      const viewport = page.getViewport( { scale: 1 } )
      canvas.width = viewport.width
      canvas.height = viewport.height

      const task = renderPDFPage( page, canvas, viewport.width, viewport.height )
      renderTasks.current[ index ] = task
    } )

    return () =>
    {
      renderTasks.current.forEach( ( task ) => task && task.cancel() )
    }
  }, [ fileType, pdfPages, renderPDFPage ] )

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {fileType === 'pdf' &&
        pdfPages.map( ( _, index ) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <div
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
              ref={canvasRefs.current[ index ]}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                border: '1px solid #ccc',
              }}
            />
          </div>
        ) )}
      {fileType === 'docx' && (
        <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          style={{ height: '100%', overflow: 'hidden' }}
        />
      )}
    </div>
  )
} )

Document.displayName = 'Document'

Document.propTypes = {
  containerRef: PropTypes.shape( { current: PropTypes.instanceOf( Element ) } ).isRequired,
  fileType: PropTypes.string.isRequired,
  docs: PropTypes.arrayOf(
    PropTypes.shape( {
      uri: PropTypes.string.isRequired,
    } ),
  ).isRequired,
  pdfPages: PropTypes.array.isRequired,
  renderPDFPage: PropTypes.func.isRequired,
}

const Edit = () =>
{
  const { documentid } = useParams()
  const navigate = useNavigate()
  const [ currentDocument, setCurrentDocument ] = useState( null )
  const [ formData, setFormData ] = useState( { title: '', description: '', author: '' } )
  const [ inputBoxes, setInputBoxes ] = useState( {} )
  const [ signatureBoxes, setSignatureBoxes ] = useState( {} )
  const [ draggedElement, setDraggedElement ] = useState( null )
  const [ resizingElement, setResizingElement ] = useState( null )
  const [ dragging, setDragging ] = useState( false )
  const [ resizing, setResizing ] = useState( false )
  const [ currentPage, setCurrentPage ] = useState( 0 ) // Zero-based to match backend
  const [ pdfPages, setPdfPages ] = useState( [] )
  const [ documentPageCount, setDocumentPageCount ] = useState( 0 )
  const [ focusedBox, setFocusedBox ] = useState( null )
  const [ pdfLoaded, setPdfLoaded ] = useState( false )
  const [ isLoading, setIsLoading ] = useState( false )
  const [ lastClickPosition, setLastClickPosition ] = useState( { x: 0, y: 0 } )
  const containerRef = useRef( null )

  useEffect( () =>
  {
    if ( !documentid || documentid === 'undefined' )
    {
      toast.error( 'Invalid document ID' )
      return
    }
    fetchDocument()
  }, [ documentid ] )

  useEffect( () =>
  {
    if ( ( pdfLoaded || currentDocument?.path?.endsWith( '.docx' ) ) && containerRef.current )
    {
      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight

      console.log( 'Container dimensions for positioning:', { containerWidth, containerHeight } )

      // Function to check if a box's position needs fixing (if outside container)
      const needsPositionFix = ( box ) =>
      {
        return (
          box.left < 0 ||
          box.left > containerWidth ||
          box.top < 0 ||
          box.top > containerHeight ||
          !box.width ||
          !box.height
        )
      }

      setInputBoxes( ( prevBoxes ) =>
      {
        const newBoxes = { ...prevBoxes }
        let fixedAny = false

        Object.keys( newBoxes ).forEach( ( page ) =>
        {
          newBoxes[ page ] = newBoxes[ page ].map( ( box ) =>
          {
            // Only fix boxes that need fixing
            if ( needsPositionFix( box ) )
            {
              fixedAny = true
              return clampBoxPosition(
                {
                  ...box,
                  // Ensure width/height are valid
                  width: box.width,
                  height: box.height,
                },
                containerWidth,
                containerHeight,
              )
            }
            return box
          } )
        } )

        if ( fixedAny )
        {
          console.log( 'Fixed input box positions' )
        }

        return newBoxes
      } )

      setSignatureBoxes( ( prevBoxes ) =>
      {
        const newBoxes = { ...prevBoxes }
        let fixedAny = false

        Object.keys( newBoxes ).forEach( ( page ) =>
        {
          newBoxes[ page ] = newBoxes[ page ].map( ( box ) =>
          {
            // Only fix boxes that need fixing
            if ( needsPositionFix( box ) )
            {
              fixedAny = true
              return clampBoxPosition(
                {
                  ...box,
                  // Ensure width/height are valid
                  width: box.width,
                  height: box.height,
                },
                containerWidth,
                containerHeight,
              )
            }
            return box
          } )
        } )

        if ( fixedAny )
        {
          console.log( 'Fixed signature box positions' )
        }

        return newBoxes
      } )
    }
  }, [ pdfLoaded, currentDocument ] )
  // Add this function to the component
  const logBoxPositions = () =>
  {
    console.log( 'Container dimensions:', {
      width: containerRef.current?.offsetWidth || 800,
      height: containerRef.current?.offsetHeight || 800,
    } )
    console.log( 'Input boxes:', inputBoxes )
    console.log( 'Signature boxes:', signatureBoxes )
  }

  const fetchDocument = async () =>
  {
    try
    {
      setIsLoading( true )
      const response = await axios.get( `${apiUrl}/api/documents/pending/${documentid}` )
      const doc = response.data.document[ 0 ]
      setCurrentDocument( doc )
      setFormData( {
        title: doc.name || '',
        description: doc.description || '',
        author: doc.author || '',
      } )

      const inputBoxesFromServer = doc.input_boxes ? JSON.parse( doc.input_boxes ) : []
      const signatureBoxesFromServer = doc.signature_boxes ? JSON.parse( doc.signature_boxes ) : []

      const inputBoxesByPage = {}
      inputBoxesFromServer.forEach( ( box, index ) =>
      {
        // Convert all position and size values to numbers and ensure they exist
        console.log( `Input Boxes from Server ${index}`, box.width )
        const boxWithDimensions = {
          ...box,
          // width: typeof box.width === 'number' ? box.width : INITIAL_INPUT_SIZE.width,
          // height: typeof box.height === 'number' ? box.height : INITIAL_INPUT_SIZE.height,
          // left: typeof box.left === 'number' ? box.left : 0,
          // top: typeof box.top === 'number' ? box.top : 0,
          width: box.width,
          height: box.height,
          left: box.left,
          top: box.top,
        }
        inputBoxesByPage[ box.page ] = [ ...( inputBoxesByPage[ box.page ] || [] ), boxWithDimensions ]
      } )

      const signatureBoxesByPage = {}
      signatureBoxesFromServer.forEach( ( box, index ) =>
      {
        console.log( `Input Boxes from Server Signatureee ${index}`, box.width )

        const boxWithDimensions = {
          ...box,
          width: box.width,
          height: box.height,
          left: box.left,
          top: box.top,
        }
        console.log( 'DImenSIONAL SIgnaTue: ', boxWithDimensions )
        signatureBoxesByPage[ box.page ] = [
          ...( signatureBoxesByPage[ box.page ] || [] ),
          {
            ...box,
            width: box.width,
            height: box.height,
            left: box.left,
            top: box.top,
          },
        ]
        console.log( `Box with Dimensions Signatureee 2342324`, signatureBoxesByPage )
      } )
      // Get container dimensions
      const containerWidth = containerRef.current?.offsetWidth || 800
      const containerHeight = containerRef.current?.offsetHeight || 600

      // Apply clampBoxPosition to each box
      Object.keys( inputBoxesByPage ).forEach( ( page ) =>
      {
        inputBoxesByPage[ page ] = inputBoxesByPage[ page ].map( ( box ) =>
          // console.log("ahsan",box)
          clampBoxPosition( box, containerWidth, containerHeight ),
        )
      } )

      Object.keys( signatureBoxesByPage ).forEach( ( page ) =>
      {
        signatureBoxesByPage[ page ] = signatureBoxesByPage[ page ].map( ( box ) =>
          // console.log("ahsan",box)
          clampBoxPosition( box, containerWidth, containerHeight ),
        )
      } )

      console.log( 'UPDATEDDDD => ', inputBoxesByPage )
      setInputBoxes( inputBoxesByPage )
      setSignatureBoxes( signatureBoxesByPage )
      logBoxPositions()

      const fileExtension = doc.path.split( '.' ).pop().toLowerCase()
      if ( fileExtension === 'pdf' )
      {
        await loadPDF( doc.path )
      } else if ( fileExtension === 'docx' )
      {
        await loadDOCX( doc.path )
      }
    } catch ( error )
    {
      console.error( 'Error fetching document:', error )
      toast.error( 'Failed to load document' )
    } finally
    {
      setIsLoading( false )
    }
  }

  const renderPDFPage = useCallback( ( page, canvas, width, height ) =>
  {
    if ( !canvas ) return null
    const context = canvas.getContext( '2d' )
    canvas.width = width
    canvas.height = height

    const renderContext = {
      canvasContext: context,
      viewport: page.getViewport( { scale: width / page.getViewport( { scale: 1 } ).width } ),
    }

    const task = page.render( renderContext )
    task.promise.catch( ( error ) =>
    {
      if ( error.name === 'RenderingCancelledException' ) return
      console.error( 'Error rendering page:', error )
      toast.error( 'Failed to render PDF page.' )
    } )

    return task
  }, [] )

  const loadPDF = async ( path ) =>
  {
    try
    {
      const pdfUrl = `${apiUrl}/my/${path}`
      const loadingTask = pdfjsLib.getDocument( pdfUrl )
      const pdf = await loadingTask.promise
      setDocumentPageCount( pdf.numPages )
      const pagePromises = []
      for ( let pageNum = 1; pageNum <= pdf.numPages; pageNum++ )
      {
        pagePromises.push( pdf.getPage( pageNum ) )
      }
      const pages = await Promise.all( pagePromises )
      setPdfPages( pages )
      setPdfLoaded( true )
    } catch ( error )
    {
      console.error( 'Error loading PDF:', error )
      toast.error( 'Error loading PDF document' )
    }
  }

  const loadDOCX = async ( path ) =>
  {
    try
    {
      const docxUrl = `${apiUrl}/public/storage/${path}`
      const response = await fetch( docxUrl )
      if ( !response.ok ) throw new Error( `HTTP error! status: ${response.status}` )
      const arrayBuffer = await response.arrayBuffer()
      const result = await mammoth.convertToHtml( { arrayBuffer } )
      setDocxContent( result.value )
      setDocumentPageCount( 1 )
      setCurrentPage( 0 ) // Zero-based
    } catch ( error )
    {
      console.error( 'Error loading DOCX:', error )
      toast.error( 'Error loading DOCX document' )
    }
  }

  const handleInputChange = ( e ) =>
  {
    const { name, value } = e.target
    setFormData( { ...formData, [ name ]: value } )
  }

  const handleUpdate = async () =>
  {
    try
    {
      setIsLoading( true )
      const allInputBoxes = Object.entries( inputBoxes ).flatMap( ( [ page, boxes ] ) =>
        boxes.map( ( box ) => ( {
          ...box,
          page: parseInt( page ),
        } ) ),
      )

      const allSignatureBoxes = Object.entries( signatureBoxes ).flatMap( ( [ page, boxes ] ) =>
        boxes.map( ( box ) => ( {
          ...box,
          page: parseInt( page ),
        } ) ),
      )

      const updatedData = {
        document_name: formData.title,
        input_boxes: JSON.stringify( allInputBoxes ),
        signature_boxes: JSON.stringify( allSignatureBoxes ),
      }

      await axios.post( `${apiUrl}/api/documents/${documentid}/editDocument`, updatedData )
      toast.success( 'Document updated successfully!' )
    } catch ( error )
    {
      console.error( 'Error updating document:', error )
      toast.error( 'Failed to update document.' )
    } finally
    {
      setIsLoading( false )
    }
  }

  const handleMouseDown = ( index, type, page ) => ( e ) =>
  {
    e.preventDefault()
    if (
      e.target.type === 'checkbox' ||
      e.target.classList.contains( 'close-button' ) ||
      e.target.classList.contains( 'resize-handle' )
    )
      return

    const box = type === 'input' ? inputBoxes[ page ][ index ] : signatureBoxes[ page ][ index ]
    const containerRect = containerRef.current.getBoundingClientRect()

    // Calculate the offset from the mouse position to the box's position
    setDraggedElement( {
      index,
      type,
      page,
      startX: e.clientX - containerRect.left - box.left * ( containerRect.width / 100 ),
      startY: e.clientY - containerRect.top - box.top * ( containerRect.height / 100 ),
    } )
    setDragging( true )
    setFocusedBox( { index, type, page } )
  }

  const handleResizeMouseDown = ( index, type, page, direction ) => ( e ) =>
  {
    e.preventDefault()
    e.stopPropagation()
    const box = type === 'input' ? inputBoxes[ page ][ index ] : signatureBoxes[ page ][ index ]
    const containerRect = containerRef.current.getBoundingClientRect()

    // Capture the initial size and position
    setResizingElement( {
      index,
      type,
      page,
      direction,
      startX: e.clientX - containerRect.left,
      startY: e.clientY - containerRect.top,
      originalWidth: box.width,
      originalHeight: box.height,
      originalLeft: box.left,
      originalTop: box.top,
    } )
    setResizing( true )
    setFocusedBox( { index, type, page } )
  }

  const handleMouseMove = useCallback(
    ( e ) =>
    {
      if ( !containerRef.current ) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      const currentX = e.clientX - containerRect.left
      const currentY = e.clientY - containerRect.top

      if ( dragging && draggedElement )
      {
        const box =
          draggedElement.type === 'input'
            ? inputBoxes[ draggedElement.page ][ draggedElement.index ]
            : signatureBoxes[ draggedElement.page ][ draggedElement.index ]

        // Calculate new left and top based on the initial offset
        const newLeft = Math.max(
          0,
          Math.min(
            ( ( currentX - draggedElement.startX ) / containerWidth ) * 100,
            100 - ( box.width || 0 ),
          ),
        )
        const newTop = Math.max(
          0,
          Math.min(
            ( ( currentY - draggedElement.startY ) / containerHeight ) * 100,
            100 - ( box.height || 0 ),
          ),
        )

        const updatedBoxes =
          draggedElement.type === 'input' ? { ...inputBoxes } : { ...signatureBoxes }
        updatedBoxes[ draggedElement.page ][ draggedElement.index ] = {
          ...box,
          left: newLeft,
          top: newTop,
        }

        if ( draggedElement.type === 'input' )
        {
          setInputBoxes( updatedBoxes )
        } else
        {
          setSignatureBoxes( updatedBoxes )
        }
      }

      if ( resizing && resizingElement )
      {
        const box =
          resizingElement.type === 'input'
            ? inputBoxes[ resizingElement.page ][ resizingElement.index ]
            : signatureBoxes[ resizingElement.page ][ resizingElement.index ]

        // Calculate new width and height based on mouse movement
        let newWidth = Math.max(
          0,
          Math.min(
            resizingElement.originalWidth +
            ( ( currentX - resizingElement.startX ) / containerWidth ) * 100,
            100,
          ),
        )
        let newHeight = Math.max(
          0,
          Math.min(
            resizingElement.originalHeight +
            ( ( currentY - resizingElement.startY ) / containerHeight ) * 100,
            100,
          ),
        )

        const updatedBoxes =
          resizingElement.type === 'input' ? { ...inputBoxes } : { ...signatureBoxes }
        updatedBoxes[ resizingElement.page ][ resizingElement.index ] = clampBoxPosition(
          {
            ...box,
            width: newWidth,
            height: newHeight,
          },
          100,
          100,
        )

        if ( resizingElement.type === 'input' )
        {
          setInputBoxes( updatedBoxes )
        } else
        {
          setSignatureBoxes( updatedBoxes )
        }
      }
    },
    [ dragging, draggedElement, resizing, resizingElement, inputBoxes, signatureBoxes ],
  )

  const handleMouseUp = useCallback( () =>
  {
    if ( dragging )
    {
      setDragging( false )
      setDraggedElement( null )
    }
    if ( resizing )
    {
      setResizing( false )
      setResizingElement( null )
    }
  }, [ dragging, resizing ] )

  useEffect( () =>
  {
    const handleGlobalMouseMove = ( e ) =>
    {
      if ( dragging || resizing )
      {
        handleMouseMove( e )
      }
    }

    const handleGlobalMouseUp = () =>
    {
      handleMouseUp()
    }

    window.addEventListener( 'mousemove', handleGlobalMouseMove )
    window.addEventListener( 'mouseup', handleGlobalMouseUp )

    return () =>
    {
      window.removeEventListener( 'mousemove', handleGlobalMouseMove )
      window.removeEventListener( 'mouseup', handleGlobalMouseUp )
    }
  }, [ dragging, resizing, handleMouseMove, handleMouseUp ] )

  const handleContainerClick = ( e ) =>
  {
    if ( !e.target.closest( 'div[tabIndex="0"]' ) && !e.target.closest( '.btn-info' ) )
    {
      setFocusedBox( null )
    }
    const containerRect = containerRef.current.getBoundingClientRect()
    setLastClickPosition( {
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    } )
  }

  const addInputBox = ( fieldType ) => ( e ) =>
  {
    const containerWidth = containerRef.current?.offsetWidth || 800
    const containerHeight = containerRef.current?.offsetHeight || 600
    const { x, y } = lastClickPosition

    setInputBoxes( ( prevBoxes ) => ( {
      ...prevBoxes,
      [ currentPage ]: [
        ...( prevBoxes[ currentPage ] || [] ),
        clampBoxPosition(
          {
            fieldType,
            top: y,
            left: x,
            page: currentPage,
            required: false,
            width: INITIAL_SIGNATURE_SIZE.width,
            height: INITIAL_SIGNATURE_SIZE.height,
          },
          containerWidth,
          containerHeight,
        ),
      ],
    } ) )
  }

  const addSignatureBox = ( fieldType ) => ( e ) =>
  {
    const containerWidth = containerRef.current?.offsetWidth || 800
    const containerHeight = containerRef.current?.offsetHeight || 600
    const { x, y } = lastClickPosition

    setSignatureBoxes( ( prevBoxes ) => ( {
      ...prevBoxes,
      [ currentPage ]: [
        ...( prevBoxes[ currentPage ] || [] ),
        clampBoxPosition(
          {
            fieldType,
            top: y,
            left: x,
            page: currentPage,
            required: false,
            width: INITIAL_SIGNATURE_SIZE.width,
            height: INITIAL_SIGNATURE_SIZE.height,
          },
          containerWidth,
          containerHeight,
        ),
      ],
    } ) )
  }

  const toggleRequired = ( index, type, page ) =>
  {
    if ( type === 'input' )
    {
      setInputBoxes( ( prevBoxes ) => ( {
        ...prevBoxes,
        [ page ]: prevBoxes[ page ].map( ( box, i ) =>
          i === index ? { ...box, required: !box.required } : box,
        ),
      } ) )
    } else if ( type === 'signature' )
    {
      setSignatureBoxes( ( prevBoxes ) => ( {
        ...prevBoxes,
        [ page ]: prevBoxes[ page ].map( ( box, i ) =>
          i === index ? { ...box, required: !box.required } : box,
        ),
      } ) )
    }
  }

  const removeBox = ( index, type, page ) =>
  {
    if ( type === 'input' )
    {
      setInputBoxes( ( prevBoxes ) => ( {
        ...prevBoxes,
        [ page ]: prevBoxes[ page ].filter( ( _, i ) => i !== index ),
      } ) )
    } else
    {
      setSignatureBoxes( ( prevBoxes ) => ( {
        ...prevBoxes,
        [ page ]: prevBoxes[ page ].filter( ( _, i ) => i !== index ),
      } ) )
    }
    if ( focusedBox?.index === index && focusedBox?.type === type && focusedBox?.page === page )
    {
      setFocusedBox( null )
    }
  }

  const renderBoxes = ( boxType ) =>
  {
    const boxes =
      boxType === 'input' ? inputBoxes[ currentPage ] || [] : signatureBoxes[ currentPage ] || []
    const initialSize = boxType === 'input' ? 150 : 160
    // console.log("INPUT BOXESSS => ", inputBoxes)
    return boxes.map( ( box, index ) =>
    {
      const isDraggingThisBox =
        dragging && draggedElement?.index === index && draggedElement?.type === boxType
      const isResizingThisBox =
        resizing && resizingElement?.index === index && resizingElement?.type === boxType
      const isFocused =
        focusedBox?.index === index &&
        focusedBox?.type === boxType &&
        focusedBox?.page === currentPage

      const boxStyle = {
        position: 'absolute',
        top: `${box.top}%`,
        left: `${box.left}%`,
        width: `${box.width || initialSize.width}%`,
        height: `${box.height || initialSize.height}%`,
        cursor: isDraggingThisBox ? 'grabbing' : 'grab',
        zIndex: isDraggingThisBox || isResizingThisBox ? 1000 : isFocused ? 100 : 10,
        border: '1px solid black',
        backgroundColor: boxType === 'signature' ? '#10a827' : '#e6b905',
        userSelect: 'none',
        transition: isDraggingThisBox || isResizingThisBox ? 'none' : 'all 0.2s ease',
        opacity: isDraggingThisBox || isResizingThisBox ? 0.9 : 1,
        borderRadius: '8px',
      }

      return (
        <div
          key={index}
          style={boxStyle}
          onMouseDown={handleMouseDown( index, boxType, currentPage )}
          tabIndex={0}
        >
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {box.fieldType}
          </span>
          {isFocused && (
            <>
              <span style={{ display: 'flex', fontSize: '12px', padding: '2px' }}>
                <input
                  type="checkbox"
                  checked={box.required || false}
                  onChange={() => toggleRequired( index, boxType, currentPage )}
                  onMouseDown={( e ) => e.stopPropagation()}
                  onClick={( e ) => e.stopPropagation()}
                />
                Required
              </span>
              <span
                className="fs-3 text-secondary cursor-pointer close-button"
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  lineHeight: '1',
                }}
                onClick={( e ) =>
                {
                  e.stopPropagation()
                  removeBox( index, boxType, currentPage )
                }}
              >
                ×
              </span>
              <div
                className="resize-handle"
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  background: 'white',
                  border: '1px solid black',
                  bottom: '-4px',
                  right: '-4px',
                  cursor: 'nwse-resize',
                }}
                onMouseDown={handleResizeMouseDown( index, boxType, currentPage, 'bottom-right' )}
              />
            </>
          )}
        </div>
      )
    } )
  }

  const handlePageChange = ( newPage ) =>
  {
    if ( newPage >= 0 && newPage < documentPageCount )
    {
      setCurrentPage( newPage )
    }
  }

  return (
    <CContainer>
      <Toaster />
      <h1>Edit Document</h1>
      {isLoading ? (
        <CSpinner color="primary" />
      ) : (
        <div className="d-flex flex-column mt-4">
          <div className="d-flex position-relative w-100">
            <div
              ref={containerRef}
              className="position-relative bg-light me-2"
              style={{
                minWidth: '945px',
                maxWidth: '945px',
                width: '80%',
                minHeight: '1222.46px',
                boxShadow: '0px 0px 5px rgb(65 26 70)',
              }}
              onClick={handleContainerClick}
            >
              {currentDocument && (
                <Document
                  containerRef={containerRef}
                  fileType={currentDocument?.path?.endsWith( '.pdf' ) ? 'pdf' : 'docx'}
                  docs={[ { uri: `${apiUrl}/public/storage/${currentDocument?.path}` } ]}
                  pdfPages={pdfPages}
                  renderPDFPage={renderPDFPage}
                />
              )}
              {renderBoxes( 'input' )}
              {renderBoxes( 'signature' )}
            </div>
            <div
              style={{
                width: '20%',
                height: '600px',
                overflowY: 'auto',
                boxShadow: '0px 0px 5px rgb(65 26 70)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'sticky',
                top: '25%',
              }}
            >
              <div className="mb-3 w-100 px-3">
                <label className="form-label">Document Name</label>
                <CFormInput
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <CRow style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <CButton
                  className="btn-info"
                  onClick={addInputBox( 'name' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaUser style={{ marginRight: '5px' }} /> Add Name
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={addInputBox( 'email' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaEnvelope style={{ marginRight: '5px' }} /> Add Email
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={addInputBox( 'company' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaBuilding style={{ marginRight: '5px' }} /> Add Company
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={addInputBox( 'title' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaTag style={{ marginRight: '5px' }} /> Add Title
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={addInputBox( 'text' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaTextHeight style={{ marginRight: '5px' }} /> Add Text
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={addInputBox( 'date' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaCalendar style={{ marginRight: '5px' }} /> Add Date
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={addInputBox( 'initial' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaCheck style={{ marginRight: '5px' }} /> Add Initial
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={addSignatureBox( 'signature' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaPen style={{ marginRight: '5px' }} /> Add Signature
                </CButton>
              </CRow>
            </div>
          </div>
          {/* <div className="my-3">
            <CButton
              color="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="me-2"
            >
              Previous Page
            </CButton>
            <span>Page {currentPage + 1} of {documentPageCount}</span>
            <CButton
              color="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === documentPageCount - 1}
              className="ms-2"
            >
              Next Page
            </CButton>
          </div> */}
          <div>
            <CButton className="my-3" color="primary" onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? <CSpinner size="sm" className="me-2" /> : 'Save Changes'}
            </CButton>
            <CButton
              className="my-3 ms-2"
              color="secondary"
              onClick={() => navigate( '/document/list' )}
            >
              Cancel
            </CButton>
          </div>
        </div>
      )}
    </CContainer>
  )
}

// Placeholder for setDocxContent if not defined elsewhere
const setDocxContent = ( content ) => console.log( 'DOCX content:', content )

export default Edit
