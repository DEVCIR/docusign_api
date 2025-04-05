"use client"

import { useState, useRef, useEffect } from "react" // Add useEffect import
import { ChevronDown, ChevronUp, MoreVertical, Upload, Info, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"

interface Document {
  id: string;
  title: string;
  pages: number;
  size: number;
  type: string;
  templatesApplied?: number;
  previewText?: string;
  previewUrl?: string;
}

const DocumentUploadPage = () => {
  const navigate = useNavigate()
  const [recipientsOpen, setRecipientsOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [envelopeType, setEnvelopeType] = useState("...Select...")
  const [reminderFrequency, setReminderFrequency] = useState("Every 0 days")
  const [isOnlySigner, setIsOnlySigner] = useState(false)
  const [isMessageOnlySigner, setIsMessageOnlySigner] = useState(false)
  const [setSigningOrder, setSetSigningOrder] = useState(true)
  const [messageSetSigningOrder, setMessageSetSigningOrder] = useState(true)
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "sms" | "both">("email")
  const [showIdentityNotice, setShowIdentityNotice] = useState(true)
  
  // New state for uploaded documents
  const [documents, setDocuments] = useState<Document[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add state for upload dropdown
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  
  // Add ref for the dropdown container
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  // Add effect to handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUploadDropdown(false);
      }
    }
    
    // Attach the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  // Function to handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const filesArray = Array.from(e.target.files);
    const newDocuments = filesArray.map(file => {
      // Generate preview text for text files
      let previewText = "";
      if (file.type.includes('text/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            previewText = e.target.result.substring(0, 500);
          }
        };
        reader.readAsText(file);
      }
      
      // Create preview URL for images and PDFs
      const previewUrl = file.type.startsWith('image/') || file.type === 'application.pdf' 
        ? URL.createObjectURL(file) 
        : undefined;
      
      return {
        id: `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: file.name,
        pages: 1, // Default, would need API to determine actual pages
        size: file.size,
        type: file.type,
        templatesApplied: 0,
        previewText,
        previewUrl
      } as Document;
    });
    
    setDocuments([...documents, ...newDocuments]);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const newDocuments = filesArray.map(file => {
        return {
          id: `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          title: file.name,
          pages: 1,
          size: file.size,
          type: file.type,
          templatesApplied: 0,
          previewUrl: file.type.startsWith('image/') || file.type === 'application.pdf' 
            ? URL.createObjectURL(file) 
            : undefined
        } as Document;
      });
      
      setDocuments([...documents, ...newDocuments]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Toggle upload dropdown
  const toggleUploadDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUploadDropdown(!showUploadDropdown);
  };
  
  // Handle single file upload option
  const handleSingleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.multiple = false;
      fileInputRef.current.click();
      setShowUploadDropdown(false);
    }
  };

  // Handle the main button click (default multi-file upload)
  const handleMainUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.multiple = true;
      fileInputRef.current.click();
    }
  };
  
  // Function to remove a document
  const removeDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocuments);
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Render document preview based on file type
  const renderPreview = (doc: Document) => {
    if (doc.previewUrl) {
      if (doc.type === 'application/pdf') {
        return (
          <iframe
            src={`${doc.previewUrl}#page=1&view=FitH&toolbar=0&navpanes=0`}
            className="w-full h-full border-0"
            style={{ overflow: "hidden" }}
            title={doc.title}
          />
        );
      } else if (doc.type.startsWith('image/')) {
        return (
          <img 
            src={doc.previewUrl} 
            alt={doc.title} 
            className="w-full h-full object-contain"
          />
        );
      }
    }
    
    // Default to text preview
    return (
      <div className="p-4 text-xs text-gray-600 h-full overflow-hidden">
        <p className="text-[10px] leading-tight whitespace-pre-line">
          {doc.previewText || `[No preview available for ${doc.type}]`}
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-6">Add Documents</h2>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              {/* 3x3 Grid for documents with upload block at the end */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Render uploaded documents - Updated to match NewDocumentPage styling */}
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="bg-white border border-gray-200 rounded-md overflow-hidden w-full" 
                    style={{ height: "429px", maxWidth: "360px" }}
                  >
                    {/* Preview area with enhanced scrollbar hiding */}
                    <div 
                      className="w-full h-[280px] bg-gray-100 flex items-center justify-center" 
                      style={{ 
                        overflow: "hidden",
                        scrollbarWidth: "none", /* Firefox */
                        msOverflowStyle: "none" /* IE and Edge */
                      }}
                    >
                      {renderPreview(doc)}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">Name</div>
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="text-gray-500 hover:text-red-600"
                          aria-label="Remove document"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      {/* Improved file name display with proper truncation */}
                      <div className="flex items-center mb-4 w-full">
                        <div className="flex-1 min-w-0"> {/* Use min-width: 0 to make truncation work */}
                          <p className="text-gray-900 truncate" title={doc.title}>{doc.title}</p>
                        </div>
                      </div>
                      
                      {/* 3-column grid for metadata display */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Pages</div>
                          <div className="text-gray-900">{doc.pages || "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Size</div>
                          <div className="text-gray-900">{formatFileSize(doc.size)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Type</div>
                          <div className="text-gray-900">{doc.type.split('/')[1]?.toUpperCase() || doc.type}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Upload block - updated to match document card size */}
                <div
                  className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer"
                  style={{ 
                    backgroundColor: "#D0D5DD38", 
                    height: "429px", 
                    maxWidth: "360px",
                    width: "100%",
                    borderWidth: "1px",
                    borderRadius: "12px" 
                  }}
                  onClick={triggerFileInput}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Upload className="text-gray-600" size={24} />
                  </div>
                  <p className="text-gray-600 text-sm text-center">Drop your files here or</p>
                  
                  {/* Upload button with dropdown - revised with separated click areas */}
                  <div className="relative mt-2" ref={dropdownRef}>
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
                    >
                      {/* Main upload area */}
                      <span 
                        className="pr-2 border-r border-blue-500 cursor-pointer"
                        onClick={handleMainUpload}
                      >
                        Upload
                      </span>
                      
                      {/* Dropdown toggle area */}
                      <span 
                        className="pl-2 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUploadDropdown(e);
                        }}
                      >
                        <ChevronDown size={16} />
                      </span>
                    </button>
                    
                    {showUploadDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <ul className="py-1">
                          <li>
                            <button 
                              onClick={handleSingleUpload}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Upload Single File
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                </div>
              </div>

              {/* Add Recipients Section */}
              <div className="mt-6 border border-gray-200 rounded-md">
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setRecipientsOpen(!recipientsOpen)}
                >
                  <span className="font-medium">Add recipients</span>
                  {recipientsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {recipientsOpen && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="mb-4">
                      {/* I'm the only signer checkbox - outside any section */}
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="onlySigner"
                          checked={isOnlySigner}
                          onChange={() => setIsOnlySigner(!isOnlySigner)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="onlySigner" className="ml-2 text-sm text-gray-700">
                          I'm the only signer
                        </label>
                        <button className="ml-1 text-gray-400">
                          <Info size={14} />
                        </button>
                      </div>

                      {/* Set signing order checkbox - outside any section */}
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="signingOrder"
                          checked={setSigningOrder}
                          onChange={() => setSetSigningOrder(!setSigningOrder)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="signingOrder" className="ml-2 text-sm text-gray-700">
                          Set signing order
                        </label>
                        <button className="ml-2 text-blue-600 text-sm">View</button>
                        <div className="mx-2 text-gray-400">|</div>
                        <button className="text-blue-600 text-sm flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M7 10L12 15L17 10"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15V3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Import bulk list
                        </button>
                      </div>

                      {/* All form fields in a single bordered container */}
                      <div className="border border-gray-200 rounded-md p-4 mb-4">
                        {/* Name field - Updated with consistent button styling */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Name*
                            </label>
                            <div 
                              className="flex items-center"
                              style={{ width: "302px", height: "24px", gap: "16px" }}
                            >
                              <button className="text-[#344054] text-sm flex items-center">
                                Needs to Sign
                                <ChevronDown size={14} className="ml-1 text-[#344054]" />
                              </button>
                              <button className="text-[#344054] text-sm flex items-center">
                                Customize
                                <ChevronDown size={14} className="ml-1 text-[#344054]" />
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            id="name"
                            placeholder="Enter your name"
                            className="block rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            style={{ 
                              width: "450px",
                              height: "44px",
                              paddingTop: "10px",
                              paddingRight: "14px",
                              paddingBottom: "10px",
                              paddingLeft: "14px"
                            }}
                          />
                        </div>

                        {/* Delivery method fields */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery*</label>
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="email"
                                checked={deliveryMethod === "email" || deliveryMethod === "both"}
                                onChange={() => {
                                  if (deliveryMethod === "email") setDeliveryMethod("sms")
                                  else if (deliveryMethod === "both") setDeliveryMethod("sms")
                                  else setDeliveryMethod("both")
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                              <label htmlFor="email" className="ml-2 text-sm text-gray-700">
                                Email
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="sms"
                                checked={deliveryMethod === "sms" || deliveryMethod === "both"}
                                onChange={() => {
                                  if (deliveryMethod === "sms") setDeliveryMethod("email")
                                  else if (deliveryMethod === "both") setDeliveryMethod("email")
                                  else setDeliveryMethod("both")
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                              <label htmlFor="sms" className="ml-2 text-sm text-gray-700">
                                SMS (Text)
                              </label>
                              <button className="ml-1 text-gray-400">
                                <Info size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Contact Info fields - Updated with reduced width */}
                          <div className="space-y-4">
                            <div>
                              <input
                                type="email"
                                id="email-input"
                                placeholder="Email*"
                                className={`block rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                  (deliveryMethod === "sms") ? 
                                  "bg-[#F5F6F8] cursor-not-allowed shadow-[0px_1px_2px_0px_#1018280D]" : ""
                                }`}
                                style={{ 
                                  width: "450px",
                                  height: "44px",
                                  paddingTop: "10px",
                                  paddingRight: "14px",
                                  paddingBottom: "10px",
                                  paddingLeft: "14px"
                                }}
                                disabled={deliveryMethod === "sms"}
                              />
                            </div>
                            <div>
                              <input
                                type="tel"
                                id="phone-input"
                                placeholder="+1 Phone number"
                                className={`block rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                  (deliveryMethod === "email") ? 
                                  "bg-[#F5F6F8] cursor-not-allowed shadow-[0px_1px_2px_0px_#1018280D]" : ""
                                }`}
                                style={{ 
                                  width: "450px",
                                  height: "44px",
                                  paddingTop: "10px",
                                  paddingRight: "14px",
                                  paddingBottom: "10px",
                                  paddingLeft: "14px"
                                }}
                                disabled={deliveryMethod === "email"}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Identity Verification Notice */}
                        {showIdentityNotice && (
                          <div className="flex items-start bg-blue-50 p-3 rounded-md">
                            <div className="flex-shrink-0 mt-0.5">
                              <svg
                                className="h-5 w-5 text-blue-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 16V12"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 8H12.01"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm text-blue-700">
                                Identity Verification protects your agreements.{" "}
                                <a href="#" className="underline">
                                  Learn more
                                </a>
                              </p>
                            </div>
                            <button className="flex-shrink-0 ml-2" onClick={() => setShowIdentityNotice(false)}>
                              <X size={16} className="text-gray-500" />
                            </button>
                          </div>
                        )}
                      </div>

                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                        Add Recipient
                        <ChevronDown size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Message Section */}
              <div className="mt-6 border border-gray-200 rounded-md">
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setMessageOpen(!messageOpen)}
                >
                  <span className="font-medium">Add message</span>
                  {messageOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {messageOpen && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="mb-4">
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="messageOnlySigner"
                          checked={isMessageOnlySigner}
                          onChange={() => setIsMessageOnlySigner(!isMessageOnlySigner)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="messageOnlySigner" className="ml-2 text-sm text-gray-700">
                          I'm the only signer
                        </label>
                        <button className="ml-1 text-gray-400">
                          <Info size={14} />
                        </button>
                      </div>

                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="messageSigningOrder"
                          checked={messageSetSigningOrder}
                          onChange={() => setMessageSetSigningOrder(!messageSetSigningOrder)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="messageSigningOrder" className="ml-2 text-sm text-gray-700">
                          Set signing order
                        </label>
                        <button className="ml-2 text-blue-600 text-sm">View</button>
                        <div className="mx-2 text-gray-400">|</div>
                        <button className="text-blue-600 text-sm flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M7 10L12 15L17 10"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15V3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Import bulk list
                        </button>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Subject
                        </label>
                        <input
                          type="text"
                          id="emailSubject"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="emailMessage" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Message
                        </label>
                        <textarea
                          id="emailMessage"
                          rows={5}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Envelope Types */}
              <div className="mt-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Envelope Types</label>
                  <div className="relative">
                    <select
                      value={envelopeType}
                      onChange={(e) => setEnvelopeType(e.target.value)}
                      className="block px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none gap-2"
                      style={{ width: "292px", height: "44px" }}
                    >
                      <option value="...Select...">...Select...</option>
                      <option value="Standard">Standard</option>
                      <option value="Certified">Certified</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                    <button className="absolute inset-y-0 right-8 flex items-center">
                      <Info size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Frequency of reminders */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency of reminders</label>
                  <div className="relative">
                    <select
                      value={reminderFrequency}
                      onChange={(e) => setReminderFrequency(e.target.value)}
                      className="block border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none gap-4"
                      style={{ 
                        width: "241px", 
                        height: "44px", 
                        paddingTop: "10px",
                        paddingRight: "14px",
                        paddingBottom: "10px",
                        paddingLeft: "14px" 
                      }}
                    >
                      <option value="Every 0 days">Every 0 days</option>
                      <option value="Every 1 day">Every 1 day</option>
                      <option value="Every 2 days">Every 2 days</option>
                      <option value="Every 3 days">Every 3 days</option>
                      <option value="Every 7 days">Every 7 days</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                    <button className="absolute inset-y-0 right-8 flex items-center">
                      <Info size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => navigate("/next-step")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentUploadPage

