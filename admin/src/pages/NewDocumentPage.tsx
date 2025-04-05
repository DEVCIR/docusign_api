"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import { Upload, ChevronRight, X, Check } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { useNavigate } from "react-router-dom"

interface FileInfo {
  name: string
  size: number
  type: string
  pages?: number
  preview?: string | null
}

const NewDocumentPage = () => {
    
  const navigate = useNavigate()
  const [files, setFiles] = useState<FileInfo[]>([])
  const [optionsOpen, setOptionsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [previewError, setPreviewError] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => {
        // For PDF files, we'd normally use a PDF.js library to get page count
        // For this demo, we'll just set a static value for PDFs
        const isPdf = file.type === "application/pdf"
        const isImage = file.type.startsWith("image/")

        return {
          name: file.name,
          size: file.size,
          type: isPdf ? "PDF" : file.type.split("/")[1]?.toUpperCase() || "Unknown",
          pages: isPdf ? 2 : undefined,
          preview: isImage || isPdf ? URL.createObjectURL(file) : null,
        }
      })

      setFiles([...files, ...newFiles])
      setSelectedFileIndex(files.length) // Set to first new file
      setPreviewError(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => {
        const isPdf = file.type === "application/pdf"
        const isImage = file.type.startsWith("image/")

        return {
          name: file.name,
          size: file.size,
          type: isPdf ? "PDF" : file.type.split("/")[1]?.toUpperCase() || "Unknown",
          pages: isPdf ? 2 : undefined,
          preview: isImage || isPdf ? URL.createObjectURL(file) : null,
        }
      })

      setFiles([...files, ...newFiles])
      setSelectedFileIndex(files.length) // Set to first new file
      setPreviewError(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]

    // Release the object URL to avoid memory leaks
    if (newFiles[index].preview && typeof newFiles[index].preview === 'string') {
      URL.revokeObjectURL(newFiles[index].preview as string)
    }

    newFiles.splice(index, 1)
    setFiles(newFiles)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " kb"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleCreateDocument = () => {
    // Save files to sessionStorage before navigating
    sessionStorage.setItem('uploadedFiles', JSON.stringify(files));
    
    navigate("/add-documents")
  }

  const renderPreview = (file: FileInfo) => {
    if (previewError) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <p>Preview not available</p>
        </div>
      )
    }

    // For PDF files - show the first page as preview
    if (file.type === "PDF" && file.preview) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <iframe
            src={`${file.preview}#page=1&view=FitH&scrollbar=0&toolbar=0&navpanes=0`}
            className="w-full h-full border-none"
            style={{ 
              overflow: "hidden",
              scrollbarWidth: "none", /* Firefox */
              msOverflowStyle: "none" /* IE and Edge */
            }}
          />
        </div>
      )
    }

    // For images
    if (file.preview && file.type.match(/(JPG|JPEG|PNG|GIF)/i)) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={file.preview}
            alt=""
            className="max-w-full max-h-full object-contain"
            onError={() => setPreviewError(true)}
          />
        </div>
      )
    }

    // For other document types that we can't preview
    return (
      <div className="flex flex-col items-center justify-center text-gray-500">
        <p className="text-sm">{file.type} preview not available</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-xl font-medium text-gray-800 mb-2">Add Files</h1>
          <p className="text-sm text-gray-600 mb-6">Upload one or more files to get started</p>

          {files.length > 0 ? (
            // When files exist, show grid with files and upload box in same row
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {files.map((file, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-md overflow-hidden w-full" style={{ height: "429px", maxWidth: "360px" }}>
                  {/* Preview area with enhanced scrollbar hiding */}
                  <div 
                    className="w-full h-[280px] bg-gray-100 flex items-center justify-center" 
                    style={{ 
                      overflow: "hidden",
                      scrollbarWidth: "none", /* Firefox */
                      msOverflowStyle: "none" /* IE and Edge */
                    }}
                  >
                    {renderPreview(file)}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Name</div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Remove file"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    {/* Improved file name display with proper truncation to prevent overflow */}
                    <div className="flex items-center mb-4 w-full">
                      <div className="flex-1 min-w-0"> {/* Use min-width: 0 to make truncation work */}
                        <p className="text-gray-900 truncate" title={file.name}>{file.name}</p>
                      </div>
                      <span className="ml-2 flex-shrink-0 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center">
                        <Check size={12} />
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Pages</div>
                        <div className="text-gray-900">{file.pages || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Size</div>
                        <div className="text-gray-900">{formatFileSize(file.size)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Type</div>
                        <div className="text-gray-900">{file.type}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Upload area - made identical to file cards */}
              <div
                className="bg-white border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer"
                style={{ backgroundColor: "#D0D5DD38", height: "429px", maxWidth: "360px", width: "100%" }}
                onClick={triggerFileInput}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Upload className="text-gray-600" size={24} />
                </div>
                <p className="text-gray-600 text-sm">Upload or drop files here</p>
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
            // When no files exist, show larger centered upload box
            <div className="flex justify-center mb-6">
              <div
                className="border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-6 cursor-pointer"
                style={{ backgroundColor: "#D0D5DD38", height: "336px", width: "609px" }}
                onClick={triggerFileInput}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Upload className="text-gray-600" size={24} />
                </div>
                <p className="text-gray-600 text-sm">Upload or drop files here</p>
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
          )}

          {/* Options and Buttons Section */}
          {files.length > 0 && (
            <>
              <div className="mt-6 border border-gray-200 rounded-md">
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setOptionsOpen(!optionsOpen)}
                >
                  <div className="flex items-center">
                    <ChevronRight size={20} className={`mr-2 transition-transform ${optionsOpen ? "rotate-90" : ""}`} />
                    <span className="font-medium">Options</span>
                  </div>
                  
                  {/* Confirmation text moved to right side of Options button */}
                  <div className="flex items-center text-sm text-green-500">
                    <div className="w-5 h-5 text-green-500 mr-2 flex-shrink-0">
                      <Check size={20} />
                    </div>
                    <span>This file will be imported to your account as a document.</span>
                  </div>
                </button>
                
                {optionsOpen && (
                  <div className="p-4 border-t border-gray-200">
                    {/* Removed confirmation text from here */}
                    {/* Additional options would go here */}
                    <p className="text-gray-600">Additional options for document processing</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCreateDocument}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  Create Document
                  <ChevronRight size={16} className="ml-2" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewDocumentPage