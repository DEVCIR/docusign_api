import { Rnd } from 'react-rnd'

const DraggableField = ({
  id,
  type,
  fieldType,
  position,
  size,
  onDragStop,
  onResizeStop,
  onDelete,
  isSelected,
  onSelect,
  required,
  onToggleRequired,
  containerRef,
  page,
  currentPage,
}) => {
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

  const handleRequiredClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onToggleRequired()
  }

  if (page !== currentPage) return null

  return (
    <Rnd
      position={{ x: position.left, y: position.top }}
      size={{ width: size.width || 150, height: size.height || 30 }}
      minWidth={50}
      minHeight={30}
      bounds="parent"
      onDragStop={(e, d) => {
        onDragStop(id, { left: d.x, top: d.y })
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResizeStop(id, {
          left: position.x,
          top: position.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        })
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
      style={{
        border: isSelected
          ? '2px solid #007bff'
          : type === 'signature'
            ? '1px solid black'
            : '1px dashed gray',
        backgroundColor: type === 'signature' && !isSelected ? '#fff' : 'transparent',
        zIndex: isSelected ? 1000 : 10,
      }}
      enableResizing={isSelected}
      disableDragging={!isSelected}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        {/* Close button */}
        <span
          className="fs-3 text-secondary text-end cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(id)
          }}
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            lineHeight: '0.5',
            marginBottom: '10px',
            cursor: 'pointer',
            zIndex: 1001,
          }}
        >
          ×
        </span>

        {isSelected ? (
          <div className="w-100 h-100 position-relative">
            <div className="placeholder-text w-100 h-100 d-flex align-items-center justify-content-center">
              {type === 'input' ? (
                <span style={{ fontSize: '0.8em' }}>{getPlaceholder(fieldType)}</span>
              ) : (
                <div className="signature-preview" />
              )}
            </div>
            <span
              onClick={(e) => {
                e.stopPropagation()
                onToggleRequired()
              }}
              style={{
                position: 'absolute',
                bottom: '2px',
                left: '2px',
                cursor: 'pointer',
                zIndex: 1001,
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                padding: '2px 4px',
                borderRadius: '4px',
                boxShadow: '0px 0px 2px rgba(0,0,0,0.3)',
              }}
            >
              <input
                type="checkbox"
                checked={required}
                readOnly
                style={{ marginRight: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8em', userSelect: 'none' }}>Required</span>
            </span>
          </div>
        ) : (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center">
            {getIconForFieldType(fieldType)}
          </div>
        )}
      </div>
    </Rnd>
  )
}

const DocumentList = ({
  loading,
  documents,
  handleDownload,
  handleEdit,
  handleDelete,
  editModalVisible,
  setEditModalVisible,
  currentDocument,
  // ... other props
}) => {
  const [selectedField, setSelectedField] = useState(null)
  const containerRef = useRef(null)
  const [inputBoxes, setInputBoxes] = useState({})
  const [signatureBoxes, setSignatureBoxes] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  const handleFieldDragStop = (id, type, newPosition) => {
    if (type === 'input') {
      setInputBoxes((prev) => ({
        ...prev,
        [currentPage]: prev[currentPage].map((box) =>
          box.id === id ? { ...box, ...newPosition } : box,
        ),
      }))
    } else {
      setSignatureBoxes((prev) => ({
        ...prev,
        [currentPage]: prev[currentPage].map((box) =>
          box.id === id ? { ...box, ...newPosition } : box,
        ),
      }))
    }
  }

  const handleFieldResizeStop = (id, type, newDimensions) => {
    if (type === 'input') {
      setInputBoxes((prev) => ({
        ...prev,
        [currentPage]: prev[currentPage].map((box) =>
          box.id === id ? { ...box, ...newDimensions } : box,
        ),
      }))
    } else {
      setSignatureBoxes((prev) => ({
        ...prev,
        [currentPage]: prev[currentPage].map((box) =>
          box.id === id ? { ...box, ...newDimensions } : box,
        ),
      }))
    }
  }

  const addInputBox = (fieldType) => {
    const newBox = {
      id: Date.now().toString(),
      fieldType,
      left: 100,
      top: 100,
      width: 150,
      height: 30,
      required: false,
      page: currentPage,
    }

    setInputBoxes((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newBox],
    }))
  }

  const addSignatureBox = (fieldType) => {
    const newBox = {
      id: Date.now().toString(),
      fieldType,
      left: 100,
      top: 100,
      width: 150,
      height: 30,
      required: false,
      page: currentPage,
    }

    setSignatureBoxes((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newBox],
    }))
  }

  const toggleFieldRequired = (id, type) => {
    if (type === 'input') {
      setInputBoxes((prev) => ({
        ...prev,
        [currentPage]: (prev[currentPage] || []).map((box) =>
          box.id === id ? { ...box, required: !box.required } : box,
        ),
      }))
    } else {
      setSignatureBoxes((prev) => ({
        ...prev,
        [currentPage]: (prev[currentPage] || []).map((box) =>
          box.id === id ? { ...box, required: !box.required } : box,
        ),
      }))
    }
  }

  const deleteField = (id, type) => {
    if (type === 'input') {
      setInputBoxes((prev) => ({
        ...prev,
        [currentPage]: prev[currentPage].filter((box) => box.id !== id),
      }))
    } else {
      setSignatureBoxes((prev) => ({
        ...prev,
        [currentPage]: prev[currentPage].filter((box) => box.id !== id),
      }))
    }
    if (selectedField === id) {
      setSelectedField(null)
    }
  }

  // ... rest of your component code ...

  return (
    <CContainer>
      <Toaster />
      <h1>Document List</h1>
      {loading ? (
        <CSpinner color="primary" />
      ) : (
        <>
          {/* ... your existing table code ... */}

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
                    overflow: 'hidden',
                  }}
                  onClick={() => setSelectedField(null)}
                >
                  {/* Your PDF/DOCX rendering code */}

                  {/* Render input boxes */}
                  {Object.entries(inputBoxes).map(([page, boxes]) =>
                    boxes.map((box) => (
                      <DraggableField
                        key={box.id}
                        id={box.id}
                        type="input"
                        fieldType={box.fieldType}
                        position={{ left: box.left, top: box.top }}
                        size={{ width: box.width, height: box.height }}
                        onDragStop={(id, pos) => handleFieldDragStop(id, 'input', pos)}
                        onResizeStop={(id, dims) => handleFieldResizeStop(id, 'input', dims)}
                        onDelete={(id) => deleteField(id, 'input')}
                        isSelected={selectedField === box.id}
                        onSelect={setSelectedField}
                        required={box.required}
                        onToggleRequired={() => toggleFieldRequired(box.id, 'input')}
                        containerRef={containerRef}
                        page={parseInt(page)}
                        currentPage={currentPage}
                      />
                    )),
                  )}

                  {/* Render signature boxes */}
                  {Object.entries(signatureBoxes).map(([page, boxes]) =>
                    boxes.map((box) => (
                      <DraggableField
                        key={box.id}
                        id={box.id}
                        type="signature"
                        fieldType={box.fieldType}
                        position={{ left: box.left, top: box.top }}
                        size={{ width: box.width, height: box.height }}
                        onDragStop={(id, pos) => handleFieldDragStop(id, 'signature', pos)}
                        onResizeStop={(id, dims) => handleFieldResizeStop(id, 'signature', dims)}
                        onDelete={(id) => deleteField(id, 'signature')}
                        isSelected={selectedField === box.id}
                        onSelect={setSelectedField}
                        required={box.required}
                        onToggleRequired={() => toggleFieldRequired(box.id, 'signature')}
                        containerRef={containerRef}
                        page={parseInt(page)}
                        currentPage={currentPage}
                      />
                    )),
                  )}
                </div>

                {/* Sidebar with field buttons */}
                <div style={{ width: '25%', padding: '20px' }}>
                  {/* ... your existing sidebar code ... */}
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
        </>
      )}
    </CContainer>
  )
}

export default DocumentList
