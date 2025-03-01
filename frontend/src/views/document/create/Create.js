/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import
  {
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
import React, { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiUrl } from 'src/components/Config/Config'
import SendModal from 'src/views/document/SendModal'
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
import { renderAsync } from 'docx-preview'
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer'
import { MdOutlineWidgets } from 'react-icons/md'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

// Memoized Document Component
const Document = memo( ( { containerRef, fileType, docs, pdfPages, renderPDFPage } ) =>
{
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {fileType === 'pdf' &&
        pdfPages.map( ( page, index ) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', margin: '10px 0' }}>Page {index + 1}</div>
            <canvas
              ref={( node ) =>
              {
                if ( node )
                {
                  const viewport = page.getViewport( { scale: 1 } );
                  node.width = viewport.width;
                  node.height = viewport.height;
                  renderPDFPage( page, node, viewport.width, viewport.height );
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
        ) )}
      {fileType === 'docx' && (
        <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          style={{ height: '100%', overflow: 'hidden' }}
        />
      )}
    </div>
  );
} );
// const Document = memo( ( { containerRef, fileType, docs, mainCanvasRef, pdfPages, renderPDFPage } ) =>
// {
//   // Memoize DocViewer to prevent unnecessary rerenders
//   const MemoizedDocViewer = memo( DocViewer )

//   return (
//     <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
//       {fileType === 'pdf' && pdfPages.map( ( page, index ) => (
//         <div key={index}>
//           <div style={{ textAlign: 'center', margin: '10px 0' }}>
//             Page {index + 1}
//           </div>
//           <canvas
//             ref={( node ) =>
//             {
//               if ( node )
//               {
//                 const viewport = page.getViewport( { scale: 1 } );
//                 node.width = viewport.width;
//                 node.height = viewport.height;
//                 renderPDFPage( page, node, viewport.width, viewport.height );
//               }
//             }}
//             style={{
//               display: 'block',
//               width: '100%',
//               height: 'auto',
//               zIndex: 1,
//             }}
//           />
//           {/* <hr style={{ height: "20px", backgroundColor: 'black' }} /> */}
//         </div>
//       ) )}
//       {fileType === 'docx' && (
//         <>
//           <MemoizedDocViewer
//             documents={docs}
//             pluginRenderers={DocViewerRenderers}
//             theme={{ disableThemeScrollbar: false }}
//             style={{ height: '100%', overflow: 'hidden !important' }}
//             config={{
//               header: {
//                 disableHeader: false,
//                 disableFileName: false,
//                 retainURLParams: false,
//               },
//             }}
//           />
//           <style>
//             {`
//             .hysiap {
//                 overflow: hidden !important;
//             }

//             #proxy-renderer.hysiap {
//                 overflow: hidden !important;
//             }
//             `}
//           </style>
//         </>
//       )}
//     </div>
//   )
// } )

const INITIAL_INPUT_SIZE = { width: 25, height: 25 }
const INITIAL_SIGNATURE_SIZE = { width: 25, height: 25 }

const clampBoxPosition = ( box, containerWidth, containerHeight ) => ( {
  ...box,
  left: Math.max( 0, Math.min( box.left, containerWidth - ( box.width || INITIAL_INPUT_SIZE.width ) ) ),
  top: Math.max( 0, Math.min( box.top, containerHeight - ( box.height || INITIAL_INPUT_SIZE.height ) ) ),
  width: Math.min( box.width || INITIAL_INPUT_SIZE.width, containerWidth - box.left ),
  height: Math.min( box.height || INITIAL_INPUT_SIZE.height, containerHeight - box.top ),
} )

/**
 * This is the main component for creating a document. It handles the state of the document creation process.
 * @returns {JSX.Element} The Create component
 */
const Create = () =>
{
  const [ searchParams ] = useSearchParams()
  const type = searchParams.get( 'type' )
  const [ fileType, setFileType ] = useState( '' )
  const [ sendModalVisible, setSendModalVisible ] = useState( false )
  const [ currentDocument, setCurrentDocument ] = useState( null )
  const [ docxContent, setDocxContent ] = useState( '' )
  const [ inputBoxes, setInputBoxes ] = useState( {} )
  const [ signatureBoxes, setSignatureBoxes ] = useState( {} )
  const [ draggedElement, setDraggedElement ] = useState( null )
  const [ dragging, setDragging ] = useState( false )
  const [ pdfDocument, setPdfDocument ] = useState( null )
  const [ modalVisible, setModalVisible ] = useState( false )
  const [ uploadedFile, setUploadedFile ] = useState( false )
  const [ documentName, setDocumentName ] = useState( '' )
  const [ fileName, setFileName ] = useState( '' )
  const [ currentPage, setCurrentPage ] = useState( 1 )
  const [ pdfPages, setPdfPages ] = useState( [] )
  const [ documentPageCount, setDocumentPageCount ] = useState( 0 )
  const [ focusedBox, setFocusedBox ] = useState( null )
  const [ pageToRender, setPageToRender ] = useState( null )
  const [ isLoading, setIsLoading ] = useState( false )
  const [ isButtonLoading, setIsButtonLoading ] = useState( false )
  const [ startPosition, setStartPosition ] = useState( null )
  const [ thumbnailForceUpdate, setThumbnailForceUpdate ] = useState( 0 )

  const containerRef = useRef( null )
  const mainCanvasRef = useRef( null )
  const fileInputRef = useRef( File )
  const renderedThumbnails = useRef( {} )
  const currentPageRef = useRef( null )

  const [ docs, setDocs ] = useState( [] )

  /**
   * This function is used to render a PDF page.
   * @param {Page} page The PDF page to render
   * @param {HTMLCanvasElement} canvas The canvas to render the page on
   * @param {number} width The width of the canvas
   * @param {number} height The height of the canvas
   */
  const renderPDFPage = useCallback( async ( page, canvas, width, height ) =>
  {
    if ( !canvas ) return
    const context = canvas.getContext( '2d' )
    canvas.width = width
    canvas.height = height

    try
    {
      await page.render( {
        canvasContext: context,
        viewport: page.getViewport( { scale: width / page.getViewport( { scale: 1 } ).width } ),
      } ).promise
    } catch ( error )
    {
      console.error( 'Error rendering page:', error )
      toast.error( 'Failed to render PDF page.' )
    }
  }, [] )

  useEffect( () =>
  {
    if ( uploadedFile && pdfPages.length > 0 && containerRef.current )
    {
      const containerWidth = containerRef.current.offsetWidth
      setPageToRender( {
        page: pdfPages[ 0 ],
        pageNumber: 1,
        containerWidth,
      } )
    }
  }, [ uploadedFile, pdfPages ] )

  useEffect( () =>
  {
    if ( !pageToRender || !mainCanvasRef.current ) return

    const { page, pageNumber } = pageToRender
    const viewport = page.getViewport( { scale: 1 } )
    const scale = pageToRender.containerWidth / viewport.width
    const scaledViewport = page.getViewport( { scale } )

    renderPDFPage( page, mainCanvasRef.current, scaledViewport.width, scaledViewport.height )
    setCurrentPage( pageNumber )
  }, [ pageToRender, renderPDFPage, currentPage ] )

  /**
   * Render a single page of the PDF as a thumbnail.
   *
   * @param {PDFPage} page - The page to render.
   * @param {number} index - The index of the page.
   * @returns {React.ReactElement} A React element representing the thumbnail.
   */
  const renderThumbnail = useCallback(
    ( page, index ) =>
    {
      const containerWidth = 100
      const viewport = page.getViewport( { scale: 1 } )
      const scale = containerWidth / viewport.width
      const scaledViewport = page.getViewport( { scale } )

      return (
        <>
          <style>
            {`
          #proxy-renderer.hysiap{
          overflow: hidden !important;
          overflow-y: hidden !important;
            }
        `}
          </style>
          <div
            key={index}
            onClick={() =>
            {
              if ( currentPage !== index + 1 )
              {
                setPageToRender( {
                  page,
                  pageNumber: index + 1,
                  containerWidth: containerRef.current?.offsetWidth,
                } )
                setCurrentPage( index + 1 )
                setThumbnailForceUpdate( ( prev ) => prev + 1 )
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
              ref={( node ) =>
              {
                if ( node )
                {
                  renderPDFPage( page, node, scaledViewport.width, scaledViewport.height )
                }
              }}
              style={{ width: '100px', height: 'auto' }}
            />
            <div style={{ textAlign: 'center' }}>Page {index + 1}</div>
          </div>
        </>
      )
    },
    [ renderPDFPage, currentPage ],
  )

  /**
   * Render all pages of the PDF as thumbnails.
   *
   * @returns {React.JSX.Element[]|React.JSX.Element|null} An array of React elements representing the thumbnails.
   */
  const thumbnails = useMemo( () =>
  {
    if ( fileType === 'pdf' && pdfPages.length )
    {
      return pdfPages.map( ( page, index ) => renderThumbnail( page, index ) )
    } else if ( fileType === 'docx' )
    {
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
  }, [ fileType, pdfPages.length, renderThumbnail, thumbnailForceUpdate ] )

  /**
   * Toggles the required state of a form element.
   *
   * @param {number} index The index of the element to toggle.
   * @param {string} type The type of element to toggle: 'input' or 'signature'.
   * @param {number} page The page number of the element to toggle.
   * @returns {void}
   */
  const toggleRequired = ( index, type, page ) =>
  {
    if ( type === 'input' )
    {
      setInputBoxes( ( prevBoxes ) => ( {
        ...prevBoxes,
        [ page ]:
          prevBoxes[ page ]?.map( ( box, i ) =>
            i === index
              ? { ...box, required: ( box.required ?? false ) ? !box.required : true }
              : box,
          ) || [],
      } ) )
    } else if ( type === 'signature' )
    {
      setSignatureBoxes( ( prevBoxes ) => ( {
        ...prevBoxes,
        [ page ]:
          prevBoxes[ page ]?.map( ( box, i ) =>
            i === index
              ? { ...box, required: ( box.required ?? false ) ? !box.required : true }
              : box,
          ) || [],
      } ) )
    }
  }

  const reset = () =>
  {
    setFileType( '' )
    setDocxContent( '' )
    setInputBoxes( {} )
    setSignatureBoxes( {} )
    setDraggedElement( null )
    setDragging( false )
    setPdfDocument( null )
    setModalVisible( false )
    setUploadedFile( false )
    setDocumentName( '' )
    setFileName( '' )
    setCurrentPage( 1 )
    setPdfPages( [] )
    setDocumentPageCount( 0 )
    setFocusedBox( null )
    if ( fileInputRef.current )
    {
      fileInputRef.current.value = ''
    }
  }
  const [ isCanvasReady, setIsCanvasReady ] = useState( false )

  // This function is called when a file is selected for upload.
  const handleFileChange = async ( event ) =>
  {
    let file = event.target.files[ 0 ]
    let file2 = ''
    const fileType = file.name.split( '.' ).pop().toLowerCase()

    if ( fileType === 'pdf' )
    {
      setFileType( 'pdf' )
    } else if ( fileType === 'docx' )
    {
      setUploadedFile( true )
      try
      {
        const getdocurl = await getDocUrl()
        file2 = `${apiUrl}/public/storage/${getdocurl}`
      } catch ( error )
      {
        toast.error( 'Failed to load document' )
      }

      setIsCanvasReady( true )
      setFileType( 'pdf' )
    }

    if ( !file || ( fileType !== 'pdf' && fileType !== 'docx' ) )
    {
      toast.error( 'Please upload a valid PDF or DOCX file.', {
        duration: 3000,
        position: 'top-right',
      } )
      reset()
      return
    }
    const nameWithoutExtension = file.name.split( '.' ).slice( 0, -1 ).join( '.' )
    setFileName( nameWithoutExtension )
    setDocumentName( nameWithoutExtension )
    setModalVisible( true )
    if ( fileType === 'pdf' )
    {
      setFileType( 'pdf' )
      loadPDF( file )
    } else if ( fileType === 'docx' )
    {
      loadPDFFromURL( file2 )
    }
  }

  // Make the getDocUrl function return a Promise
  const getDocUrl = async () =>
  {
    const formData = new FormData()
    const fileInput = fileInputRef.current
    formData.append( 'file', fileInput.files[ 0 ] )

    try
    {
      const response = await axios.post(
        type ? `${apiUrl}/api/upload-file2` : `${apiUrl}/api/upload-file2`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      console.log( response.data )
      return response.data.pdf // return the document URL
    } catch ( error )
    {
      if ( error.response && error.response.status === 409 )
      {
        toast.error( 'File already exists' )
      } else
      {
        toast.error( 'Something went wrong' )
      }
      throw error // rethrow the error so it can be caught in handleFileChange
    }
  }

  const loadPDFFromURL = async ( url ) =>
  {
    try
    {
      const response = await fetch( url )
      if ( !response.ok )
      {
        throw new Error( 'Failed to fetch the PDF from the URL' )
      }

      const arrayBuffer = await response.arrayBuffer()
      const typedArray = new Uint8Array( arrayBuffer )

      // Load the PDF document from the typed array
      const loadedPDF = await pdfjsLib.getDocument( typedArray ).promise
      setPdfDocument( loadedPDF )
      setDocumentPageCount( loadedPDF.numPages )

      const pagePromises = []
      for ( let pageNum = 1; pageNum <= loadedPDF.numPages; pageNum++ )
      {
        pagePromises.push( loadedPDF.getPage( pageNum ) )
      }

      const pages = await Promise.all( pagePromises )
      setPdfPages( pages )
    } catch ( error )
    {
      console.error( 'Error loading PDF from URL:', error )
      toast.error( 'Failed to load PDF from URL. Please try again.' )
    }
  }

  // This function is used to load a PDF file.
  const loadPDF = ( file ) =>
  {
    const reader = new FileReader()
    reader.onload = async ( e ) =>
    {
      try
      {
        const typedArray = new Uint8Array( e.target.result )
        const loadedPDF = await pdfjsLib.getDocument( typedArray ).promise
        setPdfDocument( loadedPDF )
        setDocumentPageCount( loadedPDF.numPages )
        const pagePromises = []
        for ( let pageNum = 1; pageNum <= loadedPDF.numPages; pageNum++ )
        {
          pagePromises.push( loadedPDF.getPage( pageNum ) )
        }
        const pages = await Promise.all( pagePromises )
        setPdfPages( pages )
      } catch ( error )
      {
        console.error( 'Error loading PDF:', error )
        toast.error( 'Failed to load PDF. Please try again.' )
      }
    }
    reader.readAsArrayBuffer( file )
  }

  // This function is used to load a DOCX file.
  const loadDOCX = ( file ) =>
  {
    const reader = new FileReader()
    reader.onload = async ( e ) =>
    {
      const arrayBuffer = e.target.result

      try
      {
        const container = document.createElement( 'div' ) // Temporary container to hold DOCX content

        // Extract text and images using mammoth
        const { value: text, messages } = await mammoth.extractRawText( { arrayBuffer } )

        // Create an off-screen canvas to calculate the content dimensions
        const offScreenCanvas = document.createElement( 'canvas' )
        const offScreenCtx = offScreenCanvas.getContext( '2d' )
        offScreenCtx.font = '16px Arial' // Default text font size

        // Split the DOCX text into lines and render text to off-screen canvas
        const textLines = text.split( '\n' )
        let currentY = 0

        // Calculate the height required for text
        textLines.forEach( ( line ) =>
        {
          offScreenCtx.fillText( line, 0, currentY )
          currentY += 20 // Line height adjustment
        } )

        // Handle images (if any) within the DOCX
        const { value: html } = await mammoth.convertToHtml( { arrayBuffer } )
        container.innerHTML = html // Render DOCX content into HTML

        // Process images within the DOCX and draw them onto the off-screen canvas
        const imagePromises = Array.from( container.querySelectorAll( 'img' ) ).map( ( img ) =>
        {
          return new Promise( ( resolve ) =>
          {
            const image = new Image()
            image.onload = () =>
            {
              offScreenCanvas.width = Math.max( offScreenCanvas.width, img.width )
              offScreenCanvas.height = img.height + currentY
              offScreenCtx.drawImage( image, 0, currentY )
              currentY += image.height
              resolve()
            }
            image.src = img.src
          } )
        } )

        await Promise.all( imagePromises )

        // Convert the off-screen canvas to an image
        const imageUrl = offScreenCanvas.toDataURL( 'image/png' )

        // Now draw this image on the main canvas
        const canvas = document.querySelector( '#mainCanvasRef' )
        const ctx = canvas.getContext( '2d' )

        if ( !ctx )
        {
          console.error( 'Canvas context not available' )
          toast.error( 'Failed to load DOCX. Please try again.' )
          return
        }

        // Clear the canvas before drawing
        ctx.clearRect( 0, 0, canvas.width, canvas.height )

        // Create an image element to render the off-screen canvas image
        const docImage = new Image()
        docImage.onload = () =>
        {
          // Calculate scale to fit the canvas
          const scaleX = canvas.width / docImage.width
          const scaleY = canvas.height / docImage.height
          const scale = Math.min( scaleX, scaleY ) // Use the smaller scale factor

          // Apply scaling and draw the image onto the canvas
          ctx.scale( scale, scale )
          ctx.drawImage( docImage, 0, 0 )
        }
        docImage.src = imageUrl
      } catch ( error )
      {
        console.error( 'Error loading DOCX:', error )
        toast.error( 'Failed to load DOCX. Please try again.' )
      }
    }
    reader.readAsArrayBuffer( file )
  }

  // This function is used to handle the drag and drop of input and signature boxes.
  const handleDrag = useCallback(
    ( e ) =>
    {
      // ... existing code ...
    },
    [ dragging, draggedElement, containerRef.current ]
  )

  const handleMouseDown = ( index, type, page ) => ( e ) =>
  {
    e.preventDefault()
    if ( e.target.type === 'checkbox' || e.target.classList.contains( 'close-button' ) ) return

    const isResizeHandle = e.target.classList.contains( 'resize-handle' )
    const resizeDirection = isResizeHandle ? e.target.dataset.direction : null

    if ( isResizeHandle )
    {
      const box = type === 'input' ? inputBoxes[ page ][ index ] : signatureBoxes[ page ][ index ]
      const containerRect = containerRef.current.getBoundingClientRect()
      setDraggedElement( {
        index,
        type,
        page,
        isResizing: true,
        resizeDirection,
        startWidth: box.width || INITIAL_INPUT_SIZE.width,
        startHeight: box.height || INITIAL_INPUT_SIZE.height,
        startX: e.clientX - containerRect.left,
        startY: e.clientY - containerRect.top,
      } )
      setDragging( true )
      return
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const box = type === 'input' ? inputBoxes[ page ][ index ] : signatureBoxes[ page ][ index ]

    setDraggedElement( {
      index,
      type,
      page,
      startX: e.clientX - containerRect.left - box.left,
      startY: e.clientY - containerRect.top - box.top,
    } )
    setDragging( true )
    setFocusedBox( { index, type, page } )
  }

  // This function is used to handle the mouse move event on a box.
  const handleMouseMove = useCallback(
    ( e ) =>
    {
      if ( !dragging || !draggedElement || !containerRef.current ) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      const currentX = e.clientX - containerRect.left
      const currentY = e.clientY - containerRect.top

      const box =
        draggedElement.type === 'input'
          ? inputBoxes[ draggedElement.page ][ draggedElement.index ]
          : signatureBoxes[ draggedElement.page ][ draggedElement.index ]

      if ( draggedElement.isResizing )
      {
        const deltaX = currentX - draggedElement.startX
        const deltaY = currentY - draggedElement.startY
        const updatedBoxes =
          draggedElement.type === 'input' ? { ...inputBoxes } : { ...signatureBoxes }
        const newBox = { ...box }

        switch ( draggedElement.resizeDirection )
        {
          case 'se':
            newBox.width = Math.max( 50, draggedElement.startWidth + deltaX )
            newBox.height = Math.max( 30, draggedElement.startHeight + deltaY )
            break
          case 'sw':
            newBox.width = Math.max( 50, draggedElement.startWidth - deltaX )
            newBox.height = Math.max( 30, draggedElement.startHeight + deltaY )
            newBox.left = draggedElement.startLeft + deltaX
            break
          case 'ne':
            newBox.width = Math.max( 50, draggedElement.startWidth + deltaX )
            newBox.height = Math.max( 30, draggedElement.startHeight - deltaY )
            newBox.top = draggedElement.startTop + deltaY
            break
          case 'nw':
            newBox.width = Math.max( 50, draggedElement.startWidth - deltaX )
            newBox.height = Math.max( 30, draggedElement.startHeight - deltaY )
            newBox.left = draggedElement.startLeft + deltaX
            newBox.top = draggedElement.startTop + deltaY
            break
        }

        // Apply constraints
        newBox.left = Math.max( 0, Math.min( newBox.left, containerWidth - newBox.width ) )
        newBox.top = Math.max( 0, Math.min( newBox.top, containerHeight - newBox.height ) )
        newBox.width = Math.min( newBox.width, containerWidth - newBox.left )
        newBox.height = Math.min( newBox.height, containerHeight - newBox.top )


        // Convert pixel values to percentages
        let newBox2 = ( newBox.left / containerWidth ) * 100;
        let newBox3 = ( newBox.top / containerHeight ) * 100;
        let newBox4 = ( newBox.width / containerWidth ) * 100;
        let newBox5 = ( newBox.height / containerHeight ) * 100;
        console.clear();
        console.log( "newBox.left", newBox.left );
        console.log( "newBox2", newBox2 );
        console.log( "newBox.top", newBox.top );
        console.log( "newBox3", newBox3 );
        updatedBoxes[ draggedElement.page ][ draggedElement.index ] = newBox


        if ( draggedElement.type === 'input' )
        {
          setInputBoxes( updatedBoxes )
        } else
        {
          setSignatureBoxes( updatedBoxes )
        }
      } else
      {
        const newLeft = currentX - draggedElement.startX
        const newTop = currentY - draggedElement.startY

        const updatedBoxes =
          draggedElement.type === 'input' ? { ...inputBoxes } : { ...signatureBoxes }
        const newBox = { ...box }

        // Apply constraints
        newBox.left = Math.max( 0, Math.min( newLeft, containerWidth - newBox.width ) )
        newBox.top = Math.max( 0, Math.min( newTop, containerHeight - newBox.height ) )
        let newBox2 = ( newBox.left / containerWidth ) * 100;
        let newBox3 = ( newBox.top / containerHeight ) * 100;
        // newBox.left=newBox2;
        // newBox.top=newBox3;
        console.clear();
        console.log( "newBox.left", newBox.left );
        console.log( "newBox2", newBox2 );
        console.log( "containerWidth", containerWidth );
        console.log( "newBox.top", newBox.top );
        console.log( "newBox3", newBox3 );
        console.log( "containerHeight", containerHeight );

        updatedBoxes[ draggedElement.page ][ draggedElement.index ] = newBox

        if ( draggedElement.type === 'input' )
        {
          setInputBoxes( updatedBoxes )
        } else
        {
          setSignatureBoxes( updatedBoxes )
        }
      }
    },
    [ dragging, draggedElement, inputBoxes, signatureBoxes ],
  )

  const handleMouseUp = useCallback( () =>
  {
    setDragging( false )
    setDraggedElement( null )
    setStartPosition( null )
  }, [] )

  const addInputBox = ( fieldType ) =>
  {
    const newPage = currentPage
    const containerWidth = containerRef.current?.offsetWidth || 800
    const containerHeight = containerRef.current?.offsetHeight || 600

    setInputBoxes( ( prevBoxes ) => ( {
      ...prevBoxes,
      [ newPage ]: [
        ...( prevBoxes[ newPage ] || [] ),
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
    } ) )
  }

  const addSignatureBox = ( fieldType ) =>
  {
    const newPage = currentPage
    const containerWidth = containerRef.current?.offsetWidth || 800
    const containerHeight = containerRef.current?.offsetHeight || 600

    setSignatureBoxes( ( prevBoxes ) => ( {
      ...prevBoxes,
      [ newPage ]: [
        ...( prevBoxes[ newPage ] || [] ),
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
    } ) )
  }

  const getPlaceholder = ( fieldType ) =>
  {
    switch ( fieldType )
    {
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

  const removeBox = ( index, type, page ) =>
  {
    if ( type === 'input' )
    {
      setInputBoxes( ( prevBoxes ) => ( {
        ...prevBoxes,
        [ page ]: prevBoxes[ page ]?.filter( ( _, i ) => i !== index ) || [],
      } ) )
    } else
    {
      setSignatureBoxes( ( prevBoxes ) => ( {
        ...prevBoxes,
        [ page ]: prevBoxes[ page ]?.filter( ( _, i ) => i !== index ) || [],
      } ) )
    }
    if (
      focusedBox &&
      focusedBox.index === index &&
      focusedBox.type === type &&
      focusedBox.page === page
    )
    {
      setFocusedBox( null )
    }
  }

  const handleModalSubmit = () =>
  {
    setModalVisible( false )
    setUploadedFile( true )
  }

  const handleSubmit = () =>
  {
    setIsLoading( true )
    const formData = new FormData()
    const fileInput = fileInputRef.current
    formData.append( 'file', fileInput.files[ 0 ] )
    formData.append( 'document_name', documentName )

    // Collect all input and signature boxes with their collapsed states
    const allInputBoxes = Object.values( inputBoxes )
      .flat()
      .map( ( box ) => ( {
        ...box,
      } ) )
    const allSignatureBoxes = Object.values( signatureBoxes )
      .flat()
      .map( ( box ) => ( {
        ...box,
      } ) )

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    allInputBoxes.forEach( ( box ) =>
    {
      // Convert pixel values to percentages
      box.left = ( box.left / containerWidth ) * 100;
      box.top = ( box.top / containerHeight ) * 100;
      box.width = ( box.width / containerWidth ) * 100;
      box.height = ( box.height / containerHeight ) * 100;
    } );
    allSignatureBoxes.forEach( ( box ) =>
    {
      // Convert pixel values to percentages
      box.left = ( box.left / containerWidth ) * 100;
      box.top = ( box.top / containerHeight ) * 100;
      box.width = ( box.width / containerWidth ) * 100;
      box.height = ( box.height / containerHeight ) * 100;
    } );

    formData.append( 'input_boxes', JSON.stringify( allInputBoxes ) )
    formData.append( 'signature_boxes', JSON.stringify( allSignatureBoxes ) )
    formData.append( 'page_count', documentPageCount )
    console.log( [ ...formData ] )
    console.log( allInputBoxes )



    // Log the updated allInputBoxes
    axios
      .post(
        type ? `${apiUrl}/api/upload-file?type=agreement` : `${apiUrl}/api/upload-file`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then( ( response ) =>
      {
        console.log( response.data )
        setCurrentDocument( response.data.document )
        setSendModalVisible( true )
        toast.success( 'Save Document', { duration: 3000, position: 'top-right' } )
      } )
      .catch( ( error ) =>
      {
        if ( error.response && error.response.status === 409 )
        {
          toast.error( 'file already exists' )
        } else
        {
          toast.error( 'Something went wrong' )
        }
      } )
      .finally( () =>
      {
        setIsLoading( false )
      } )
  }

  const getIconForFieldType = ( fieldType ) =>
  {
    switch ( fieldType )
    {
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

  const renderBoxes = ( boxType ) =>
  {
    const boxes =
      boxType === 'input' ? inputBoxes[ currentPage ] || [] : signatureBoxes[ currentPage ] || []

    return boxes.map( ( box, index ) =>
    {
      const isDraggingThisBox =
        dragging && draggedElement?.index === index && draggedElement?.type === boxType
      const isFocused =
        focusedBox?.index === index &&
        focusedBox?.type === boxType &&
        focusedBox?.page === currentPage
      const showIcon = false
      const initialSize = boxType === 'input' ? INITIAL_INPUT_SIZE : INITIAL_SIGNATURE_SIZE


      // Get the parent container's dimensions
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Apply constraints
      // newBox.left = Math.max( 0, Math.min( newBox.left, containerWidth - newBox.width ) )
      // newBox.top = Math.max( 0, Math.min( newBox.top, containerHeight - newBox.height ) )
      // newBox.width = Math.min( newBox.width, containerWidth - newBox.left )
      // newBox.height = Math.min( newBox.height, containerHeight - newBox.top )

      // Convert pixel values to percentages
      const topPercentage = ( box.top / containerHeight ) * 100;
      const leftPercentage = ( box.left / containerWidth ) * 100;
      const widthPercentage = ( ( box.width || initialSize.width ) / containerWidth ) * 100;
      const heightPercentage = ( ( box.height || initialSize.height ) / containerHeight ) * 100;

      const boxStyle = {
        position: 'absolute',
        // top: `${box.top}px`,
        // left: `${box.left}px`,
        // width: `${box.width || initialSize.width}px`,
        // height: `${box.height || initialSize.height}px`,

        // top: `${box.top}%`,
        // left: `${box.left}%`,
        // width: `${box.width || initialSize.width}%`,
        // height: `${box.height || initialSize.height}%`,

        top: `${topPercentage}%`,
        left: `${leftPercentage}%`,
        width: `${widthPercentage}%`,
        height: `${heightPercentage}%`,
        // width:  `${box.width}px`,
        // height: `${box.height}px`,
        padding: '0px !important',
        // border: 'none',
        // position: 'absolute',
        boxSizing: 'content-box',
        cursor: isDraggingThisBox ? 'grabbing' : 'grab',
        zIndex: isDraggingThisBox ? 1000 : isFocused ? 100 : 10,
        // border: boxType === 'signature' && '1px solid black',
        border: '1px solid black',
        backgroundColor: boxType === 'signature'? '#fff':'#e6b905',
        // backgroundColor: '#e6b905',
        // display: 'flex',
        // alignItems: 'start',
        // justifyContent: 'start',
        // padding: '2px',
        userSelect: 'none',
        transition: isDraggingThisBox ? 'none' : 'all 0.2s ease',
        opacity: isDraggingThisBox ? 0.9 : 1,
        // minWidth: initialSize.width + 'px',
        // minHeight: initialSize.height + 'px',
        borderRadius: '8px',
        // minWidth: '50px',
        // minHeight: '50px',
      }

      return (
        <div
          key={index}
          className={boxType === 'input' && 'rounded shadow-sm'}
          style={boxStyle}
          onMouseDown={handleMouseDown( index, boxType, currentPage )}
          onMouseUp={handleMouseUp}
          tabIndex={0}
        >

          {isFocused && (
            <div style={{ display: `${!isFocused ? "none" : 'flex'}`, }}>
              <input
                type="checkbox"
                className="form-check-input position-relative top-0 start-0"
                checked={box.required || false}
                onChange={( e ) =>
                {
                  e.stopPropagation()
                  toggleRequired( index, boxType, currentPage )
                }}  
                onMouseDown={( e ) => e.stopPropagation()}
                onClick={( e ) => e.stopPropagation()}
              />
              <span
                style={{
                  width: '20000%',
                  alignItems:'end',
                  lineHeight: '0.5',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  zIndex: 1001,
                  pointerEvents: 'auto',
                }}
                className="fs-3 text-secondary text-end cursor-pointer close-button"
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
              <div
                className="position-relative mt-2 text-secondary w-100  justify-content-start align-items-start"
                style={{ pointerEvents: 'auto' }}
              >
              </div>
            </div>
          )}
        </div>
      )
    } )
  }

  const handleSendToUser = async ( userId ) =>
  {
    try
    {
      setIsButtonLoading( true )
      const response = await axios.post(
        type
          ? `${apiUrl}/api/documents/${currentDocument.id}/submit?type=agreement`
          : `${apiUrl}/api/documents/${currentDocument.id}/submit`,
        {
          user_id: userId,
          status: 'pending',
          data: {
            document_id: currentDocument.id,
            input_boxes: inputBoxes[ currentPage ] || [],
            signature_boxes: signatureBoxes[ currentPage ] || [],
            document_name: documentName,
          },
        },
      )
      console.log( `Document ${currentDocument.id} sent to user ${userId}:`, response.data )
      toast.success( 'Document sent successfully!' )
    } catch ( error )
    {
      console.error( 'Send error:', error.message )
      if ( error.response && error.response.status === 409 )
      {
        toast.error( 'User already has this document.', { duration: 3000, position: 'top-right' } )
      } else
      {
        toast.error( 'Failed to send via email. Please try again.', {
          duration: 3000,
          position: 'top-right',
        } )
      }
    } finally
    {
      setIsButtonLoading( false )
      return true
    }
  }

  const handleSendViaEmail = async ( email ) =>
  {
    try
    {
      const response = await axios.post(
        `${apiUrl}/api/documents/${currentDocument.id}/submitToEmail`,
        {
          email: email,
          status: 'pending',
          data: {
            document_id: currentDocument.id,
            input_boxes: inputBoxes[ currentPage ] || [],
            signature_boxes: signatureBoxes[ currentPage ] || [],
            document_name: documentName,
          },
        },
      )
      console.log( `Document ${currentDocument.id} sent to email ${email}:`, response.data )
      toast.success( 'Document sent successfully!', { duration: 3000, position: 'top-right' } )
      return true
    } catch ( error )
    {
      console.error( 'Send error:', error.message )
      if ( error.response && error.response.status === 409 )
      {
        toast.error( 'User already has this document.', { duration: 3000, position: 'top-right' } )
      } else
      {
        toast.error( 'Failed to send via email. Please try again.', {
          duration: 3000,
          position: 'top-right',
        } )
      }
    } finally
    {
      return true
    }
  }

  // Add useEffect for global mouse events with resize handling
  useEffect( () =>
  {
    const handleGlobalMouseUp = () =>
    {
      if ( dragging )
      {
        setDragging( false )
        setDraggedElement( null )
        setStartPosition( null )
      }
    }

    const handleGlobalMouseMove = ( e ) =>
    {
      if ( dragging && draggedElement )
      {
        if ( draggedElement.isResizing )
        {
          handleResize( e )
        } else
        {
          handleMouseMove( e )
        }
      }
    }

    window.addEventListener( 'mousemove', handleGlobalMouseMove )
    window.addEventListener( 'mouseup', handleGlobalMouseUp )

    return () =>
    {
      window.removeEventListener( 'mousemove', handleGlobalMouseMove )
      window.removeEventListener( 'mouseup', handleGlobalMouseUp )
    }
  }, [ dragging, draggedElement, handleMouseMove ] )

  // Add handleResize function
  const handleResize = ( e ) =>
  {
    if ( !containerRef.current || !draggedElement ) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height

    const box =
      draggedElement.type === 'input'
        ? inputBoxes[ draggedElement.page ][ draggedElement.index ]
        : signatureBoxes[ draggedElement.page ][ draggedElement.index ]

    const currentX = e.clientX - containerRect.left
    const currentY = e.clientY - containerRect.top

    const updatedBoxes = draggedElement.type === 'input' ? { ...inputBoxes } : { ...signatureBoxes }

    const newBox = { ...box }
    const originalRight = box.left + box.width
    const originalBottom = box.top + box.height

    switch ( draggedElement.resizeDirection )
    {
      case 'nw':
        newBox.left = Math.min( currentX, originalRight - INITIAL_INPUT_SIZE.width )
        newBox.top = Math.min( currentY, originalBottom - INITIAL_INPUT_SIZE.height )
        newBox.width = originalRight - newBox.left
        newBox.height = originalBottom - newBox.top
        break
      case 'ne':
        newBox.width = Math.max( INITIAL_INPUT_SIZE.width, currentX - box.left )
        newBox.top = Math.min( currentY, originalBottom - INITIAL_INPUT_SIZE.height )
        newBox.height = originalBottom - newBox.top
        break
      case 'sw':
        newBox.left = Math.min( currentX, originalRight - INITIAL_INPUT_SIZE.width )
        newBox.height = Math.max( INITIAL_INPUT_SIZE.height, currentY - box.top )
        newBox.width = originalRight - newBox.left
        break
      case 'se':
        newBox.width = Math.max( INITIAL_INPUT_SIZE.width, currentX - box.left )
        newBox.height = Math.max( INITIAL_INPUT_SIZE.height, currentY - box.top )
        break
    }

    // Apply constraints
    newBox.left = Math.max( 0, Math.min( newBox.left, containerWidth - newBox.width ) )
    newBox.top = Math.max( 0, Math.min( newBox.top, containerHeight - newBox.height ) )
    newBox.width = Math.min( newBox.width, containerWidth - newBox.left )
    newBox.height = Math.min( newBox.height, containerHeight - newBox.top )

    updatedBoxes[ draggedElement.page ][ draggedElement.index ] = newBox

    if ( draggedElement.type === 'input' )
    {
      setInputBoxes( updatedBoxes )
    } else
    {
      setSignatureBoxes( updatedBoxes )
    }
  }

  // This is the main render function for the Create component.
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
            onChange={( e ) => setDocumentName( e.target.value )}
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
        <div className='d-flex flex-column mt-4'
        // style={{ display: 'flex', marginTop: '20px', flexDirection: 'column' }}
        >
          {/* <div
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
          </div> */}
          <div
            className='d-flex position-relative w-100'
          // style={{
          //   display: 'flex',
          //   position: 'relative',
          //   width: '100%',
          //   height: 'auto',
          // }}
          >
            <div
              ref={containerRef}
              className="position-relative bg-light me-2"
              style={{
                // position: 'relative',
                // minHeight: '800px',
                // backgroundColor: '#f9f9f9',
                // marginRight: '20px',
                minWidth: "945px",
                height: "100%",
                maxWidth: "945px",
                width: '80%',
                height: 'max-content',
                boxShadow: '0px 0px 5px rgb(65 26 70)',
                // overflow: 'hidden !important',
              }}
              onMouseMove={handleMouseMove}
              onClick={( e ) =>
              {
                if ( !e.target.closest( '.bg-white' ) && !e.target.closest( 'div[tabIndex="0"]' ) )
                {
                  setFocusedBox( null )
                }
              }}
            >
              <Document
                containerRef={containerRef}
                fileType={fileType}
                docs={docs}
                mainCanvasRef={mainCanvasRef}
                pdfPages={pdfPages}
                renderPDFPage={renderPDFPage}
              />
              {renderBoxes( 'input' )}
              {renderBoxes( 'signature' )}
            </div>
            <div
              style={{
                width: '20%',
                height: '600px',
                overflowY: 'auto',
                position: 'sticky',
                top: '0',
                boxShadow: '0px 0px 5px rgb(65 26 70)',
                alignSelf: 'start',
                // display: 'flex',
                // flexDirection: 'column',
                // alignItems: 'start',
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
                  onClick={() => addInputBox( 'name' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaUser style={{ marginRight: '5px' }} /> Add Name
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox( 'email' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaEnvelope style={{ marginRight: '5px' }} /> Add Email
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox( 'company' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaBuilding style={{ marginRight: '5px' }} /> Add Company
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox( 'title' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaTag style={{ marginRight: '5px' }} /> Add Title
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox( 'text' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaTextHeight style={{ marginRight: '5px' }} /> Add Text
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox( 'date' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaCalendar style={{ marginRight: '5px' }} /> Add Date Signed
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox( 'initial' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaCheck style={{ marginRight: '5px' }} /> Add Initial
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addInputBox( 'checkbox' )}
                  style={{ width: '90%', margin: '0 auto' }}
                >
                  <FaCheck style={{ marginRight: '5px' }} /> Add Checkbox
                </CButton>
                <CButton
                  className="btn-info"
                  onClick={() => addSignatureBox( 'signature' )}
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
        onClose={() => setSendModalVisible( false )}
        document={currentDocument}
        onSendToUser={handleSendToUser}
        onSendViaEmail={handleSendViaEmail}
      />
    </CContainer>
  )
}

export default Create