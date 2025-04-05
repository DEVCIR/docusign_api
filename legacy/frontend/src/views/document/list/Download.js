const renderFieldsOnDocument = async (document, inputBoxes, signatureBoxes) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.error('This function should only be called in a browser environment')
    return
  }

  if (!document || (!document.file && !document.path)) {
    throw new Error('Invalid document or missing file path')
  }

  const filePath = document.file || document.path
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
    console.error('Error downloading document:', error)
    toast.error('Failed to download document: ' + error.message)
  }
}
