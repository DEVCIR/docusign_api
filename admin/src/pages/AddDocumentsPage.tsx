"use client"

import { useState, useEffect, useRef } from "react"
import { MoreVertical, ChevronLeft, ChevronRight, Upload, X, Check } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"

interface Document {
  id: string
  title: string
  pages: number
  preview: string
  templatesApplied?: number
  type?: string
}

// Add FileInfo interface to match the data from NewDocumentPage
interface FileInfo {
  name: string
  size: number
  type: string
  pages?: number
  preview?: string | null
}

const AddDocumentsPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(5)
  const [documents, setDocuments] = useState<Document[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewError, setPreviewError] = useState(false)

  // Load files from sessionStorage on component mount
  useEffect(() => {
    const storedFiles = sessionStorage.getItem('uploadedFiles');
    
    if (storedFiles) {
      try {
        const uploadedFiles = JSON.parse(storedFiles) as FileInfo[];
        
        // Convert FileInfo objects to Document objects
        const formattedDocuments = uploadedFiles.map((file, index) => ({
          id: `file-${index}`,
          title: file.name,
          pages: file.pages || 1, // Default to 1 page if not specified
          preview: file.preview || "/placeholder.svg?height=200&width=150&text=Document+Preview",
          type: file.type
        }));
        
        setDocuments(formattedDocuments);
      } catch (error) {
        console.error("Error parsing uploaded files:", error);
        // Fallback to empty array if parsing fails
        setDocuments([]);
      }
    }
  }, []);

  // File handling functions similar to NewDocumentPage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => {
        const isPdf = file.type === "application/pdf"
        const isImage = file.type.startsWith("image/")

        return {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: file.name,
          size: file.size,
          pages: isPdf ? 2 : 1, // Default to 2 pages for PDFs, 1 for others
          preview: isImage || isPdf ? URL.createObjectURL(file) : "/placeholder.svg?height=200&width=150&text=Document+Preview",
          type: isPdf ? "PDF" : file.type.split("/")[1]?.toUpperCase() || "Unknown",
        }
      })

      setDocuments([...documents, ...newFiles])
      
      // Update sessionStorage with the new complete list
      const updatedFiles = [...documents, ...newFiles].map(doc => ({
        name: doc.title,
        size: 0, // We don't have this info for existing docs
        type: doc.type || "",
        pages: doc.pages,
        preview: doc.preview
      }));
      
      sessionStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => {
        const isPdf = file.type === "application/pdf"
        const isImage = file.type.startsWith("image/")

        return {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: file.name,
          size: file.size,
          pages: isPdf ? 2 : 1,
          preview: isImage || isPdf ? URL.createObjectURL(file) : "/placeholder.svg?height=200&width=150&text=Document+Preview",
          type: isPdf ? "PDF" : file.type.split("/")[1]?.toUpperCase() || "Unknown",
        }
      })

      setDocuments([...documents, ...newFiles])
      
      // Update sessionStorage
      const updatedFiles = [...documents, ...newFiles].map(doc => ({
        name: doc.title,
        size: 0,
        type: doc.type || "",
        pages: doc.pages,
        preview: doc.preview
      }));
      
      sessionStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocuments);
    
    // Update sessionStorage
    const updatedFiles = updatedDocuments.map(doc => ({
      name: doc.title,
      size: 0,
      type: doc.type || "",
      pages: doc.pages,
      preview: doc.preview
    }));
    
    sessionStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []

    // Previous button
    items.push(
      <button
        key="prev"
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
      >
        <span className="sr-only">Previous</span>
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        <span className="ml-1">Previous</span>
      </button>,
    )

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        items.push(
          <button 
            key={i} 
            className="relative inline-flex items-center px-4 py-2 border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600 z-10"
            style={{ marginLeft: '0px' }}  // Override the negative margin from -space-x-px
          >
            {i}
          </button>,
        )
      } else if (i <= 3 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        items.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            {i}
          </button>,
        )
      } else if (items[items.length - 1].key !== "ellipsis" && i < totalPages) {
        items.push(
          <span key="ellipsis" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            ...
          </span>,
        )
      }
    }

    // Next button
    items.push(
      <button
        key="next"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
      >
        <span className="mr-1">Next</span>
        <span className="sr-only">Next</span>
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>,
    )

    return items
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-xl font-medium text-gray-800 mb-6">Add Documents</h1>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Display existing documents */}
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white border border-gray-200 rounded-md overflow-hidden">
                  <div className="h-48 overflow-hidden border-b border-gray-200">
                    {doc.preview ? (
                      // If there's a preview URL, attempt to show it
                      <div className="h-full flex items-center justify-center bg-gray-50">
                        {doc.type === "PDF" ? (
                          // For PDFs we use an iframe with parameters to hide controls
                          <iframe 
                            src={`${doc.preview}#page=1&view=FitH&toolbar=0&navpanes=0`}
                            className="w-full h-full border-0"
                            style={{ overflow: "hidden" }}
                          />
                        ) : doc.type?.match(/(JPG|JPEG|PNG|GIF)/i) ? (
                          // For images, show the image directly
                          <img
                            src={doc.preview}
                            alt={doc.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          // For other file types, show the text preview as in the original
                          <div className="p-4 text-xs text-gray-600 h-full overflow-hidden">
                            <div className="font-medium mb-1">Heading</div>
                            <p className="text-[10px] leading-tight">
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                              labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                            </p>
                            <div className="font-medium mt-2 mb-1">Another Heading</div>
                            <p className="text-[10px] leading-tight">
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                              labore et dolore magna aliqua.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Fallback to text preview if no preview URL
                      <div className="p-4 text-xs text-gray-600 h-full overflow-hidden">
                        <div className="font-medium mb-1">Heading</div>
                        <p className="text-[10px] leading-tight">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                          labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h3>
                        <div className="text-xs text-gray-500 mt-1">{doc.pages} pages</div>
                        {doc.templatesApplied && (
                          <div className="text-xs text-gray-500 mt-0.5">{doc.templatesApplied} Template Applied</div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => removeDocument(doc.id)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Remove document"
                        >
                          <X size={16} />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add upload block at the end of the grid */}
              <div
                className="bg-white border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer"
                style={{ backgroundColor: "#D0D5DD38", height: "429px" }}
                onClick={triggerFileInput}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Upload className="text-gray-600" size={24} />
                </div>
                <p className="text-gray-600 text-sm">Upload or drop more files here</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
              </div>
            </div>
          ) : (
            // Show a message when no files are uploaded
            <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
              <p className="text-gray-600">No documents uploaded. Please upload files from the Add Files page.</p>
              <button 
                onClick={() => window.location.href = '/new-document'}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Upload Files
              </button>
            </div>
          )}

          {documents.length > 0 && (
            <div className="mt-8 flex justify-between items-center">
              {/* Empty div to balance the layout */}
              <div className="w-24"></div>
              
              {/* Centered pagination but remove the -space-x-px class */}
              <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
                {renderPaginationItems()}
              </nav>
              
              {/* Next button stays on the right */}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddDocumentsPage

