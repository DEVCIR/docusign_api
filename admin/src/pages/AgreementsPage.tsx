"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, MoreHorizontal, Search } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"

const AgreementsPage = () => {
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  // Add new state for filter dropdowns and selections
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string}>({
    period: "Last 6 months",
    status: "",
    sender: "",
    advanced: "",
    start: ""
  })

  // In the component, add a reference system for the dropdown menus
  const menuRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  // Callback ref function for menu items
  const setMenuRef = (id: number) => (el: HTMLDivElement | null) => {
    menuRefs.current[id] = el;
  };

  // Effect to close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const menuRef = menuRefs.current[openMenuId];
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Helper function to check if a row is closer to the bottom of the screen
  const isBottomRow = (id: number) => {
    return id > agreements.length - 3;
  };

  // Toggle filter dropdown
  const toggleFilter = (filterId: string) => {
    setOpenFilter(openFilter === filterId ? null : filterId)
  }

  // Select a filter option
  const selectFilterOption = (filterId: string, option: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: option
    }))
    setOpenFilter(null)
  }

  // Reset filters
  const clearFilters = () => {
    setSelectedFilters({
      period: "",
      status: "",
      sender: "",
      advanced: "",
      start: ""
    })
  }

  // Toggle menu open/closed
  const toggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (openMenuId === id) {
      setOpenMenuId(null)
    } else {
      setOpenMenuId(id)
    }
  }

  // Mock data for the table
  const agreements = [
    {
      id: 1,
      name: "Template Name",
      status: "Completed",
      lastChangeDate: "12/01/2025",
      lastChangeTime: "9:15 AM",
      action: "Download",
    },
    {
      id: 2,
      name: "Template Name",
      status: "Need to sign",
      lastChangeDate: "12/01/2025",
      lastChangeTime: "9:15 AM",
      action: "Sign",
    },
    {
      id: 3,
      name: "Template Name",
      status: "Completed",
      lastChangeDate: "12/01/2025",
      lastChangeTime: "9:15 AM",
      action: "Download",
    },
    {
      id: 4,
      name: "Template Name",
      status: "Voided",
      lastChangeDate: "12/01/2025",
      lastChangeTime: "9:15 AM",
      action: "Copy",
    },
    {
      id: 5,
      name: "Template Name",
      status: "Voided",
      lastChangeDate: "12/01/2025",
      lastChangeTime: "9:15 AM",
      action: "Copy",
    },
    {
      id: 6,
      name: "Template Name",
      status: "Completed",
      lastChangeDate: "12/01/2025",
      lastChangeTime: "9:15 AM",
      action: "Download",
    },
    {
      id: 7,
      name: "Template Name",
      status: "Voided",
      lastChangeDate: "12/01/2025",
      lastChangeTime: "9:15 AM",
      action: "Copy",
    },
    {
      id: 8,
      name: "Template Name",
      status: "Completed",
      lastChangeDate: "12/01/2025",
      lastChangeTime: "9:15 AM",
      action: "Download",
    },
    {
      id: 9,
      name: "Template Name",
      status: "Completed",
      lastChangeDate: "12/01/2025",
      lastChangeTime: "9:15 AM",
      action: "Download",
    },
    {
      id: 10,
      name: "Template Name",
      status: "Completed",
      lastChangeDate: "12/01/2025",
      lastChangeTime: "9:15 AM",
      action: "Download",
    },
  ]

  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === agreements.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(agreements.map((agreement) => agreement.id))
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let color = ""
    let icon = null
    let content: React.ReactNode = null
  
    switch (status) {
      case "Completed":
        color = "text-gray-700"
        icon = (
          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7" fill="#2752E7" stroke="#2752E7" strokeWidth="2" />
            <path
              d="M5 8L7 10L11 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
        content = status
        break;
      case "Need to sign":
        // New progress bar design for "Need to sign"
        return (
          <div className="flex flex-col items-start">
            <div className="w-32 h-1 bg-gray-200 rounded-full mb-2">
              <div className="h-full bg-[#225CFF] rounded-full" style={{ width: '35%' }}></div>
            </div>
            <span className="text-sm text-gray-600">{status}</span>
          </div>
        );
      case "Voided":
        color = "text-gray-600"
        icon = (
          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M5 5L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
        content = status
        break;
      default:
        color = "text-gray-600"
        content = status
    }
    
    return (
      <div className={`flex items-center ${color}`}>
        {icon}
        {typeof content === 'string' ? <span>{content}</span> : content}
      </div>
    );
  }

  // Action button component
  const ActionButton = ({ action }: { action: string }) => {
    // Apply common styling to all buttons including width and center alignment
    const baseStyles = "px-5 py-1.5 text-sm font-medium rounded-full w-24 text-center flex items-center justify-center"
    
    switch (action) {
      case "Download":
        return (
          <button className={`${baseStyles} border border-gray-300 text-[#667085] hover:bg-gray-50`}>
            Download
          </button>
        )
      case "Sign":
        return (
          <button className={`${baseStyles} bg-blue-600 text-white hover:bg-blue-700`}>
            Sign
          </button>
        )
      case "Copy":
        return (
          <button className={`${baseStyles} border border-gray-300 text-[#667085] hover:bg-gray-50`}>
            Copy
          </button>
        )
      default:
        return (
          <button className={`${baseStyles} border border-gray-300 text-[#667085] hover:bg-gray-50`}>
            {action}
          </button>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="agreements" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Replace custom header with Header component */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Agreements</h2>

          {/* Filters and Search */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3 w-full">
              <div className="relative max-w-xs w-64"> {/* Reduced width */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Period Filter */}
                <div className="relative">
                  <button 
                    onClick={() => toggleFilter('period')} 
                    className={`flex items-center px-3 py-2 border rounded-md ${
                      selectedFilters.period 
                        ? "border-[#2752E7] bg-[#2752E7] text-white" 
                        : "border-gray-300 bg-white text-gray-700"
                    } hover:bg-gray-50 hover:text-gray-700`}
                  >
                    <span>{selectedFilters.period || "Last 6 months"}</span>
                    <ChevronDown size={16} className="ml-2" />
                  </button>
                  {openFilter === 'period' && (
                    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                      <ul className="py-1">
                        <li><button onClick={() => selectFilterOption('period', 'Last 30 days')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Last 30 days</button></li>
                        <li><button onClick={() => selectFilterOption('period', 'Last 6 months')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Last 6 months</button></li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <button 
                    onClick={() => toggleFilter('status')} 
                    className={`flex items-center px-3 py-2 border rounded-md ${
                      selectedFilters.status 
                        ? "border-[#2752E7] bg-[#2752E7] text-white" 
                        : "border-gray-300 bg-white text-gray-700"
                    } hover:bg-gray-50 hover:text-gray-700`}
                  >
                    <span>{selectedFilters.status || "Status"}</span>
                    <ChevronDown size={16} className="ml-2" />
                  </button>
                  {openFilter === 'status' && (
                    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                      <ul className="py-1">
                        <li><button onClick={() => selectFilterOption('status', 'Completed')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Completed</button></li>
                        <li><button onClick={() => selectFilterOption('status', 'Need to sign')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Need to sign</button></li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Sender Filter */}
                <div className="relative">
                  <button 
                    onClick={() => toggleFilter('sender')} 
                    className={`flex items-center px-3 py-2 border rounded-md ${
                      selectedFilters.sender 
                        ? "border-[#2752E7] bg-[#2752E7] text-white" 
                        : "border-gray-300 bg-white text-gray-700"
                    } hover:bg-gray-50 hover:text-gray-700`}
                  >
                    <span>{selectedFilters.sender || "Sender"}</span>
                    <ChevronDown size={16} className="ml-2" />
                  </button>
                  {openFilter === 'sender' && (
                    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                      <ul className="py-1">
                        <li><button onClick={() => selectFilterOption('sender', 'Me')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Me</button></li>
                        <li><button onClick={() => selectFilterOption('sender', 'Others')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Others</button></li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Advanced Filter */}
                <div className="relative">
                  <button 
                    onClick={() => toggleFilter('advanced')} 
                    className={`flex items-center px-3 py-2 border rounded-md ${
                      selectedFilters.advanced 
                        ? "border-[#2752E7] bg-[#2752E7] text-white" 
                        : "border-gray-300 bg-white text-gray-700"
                    } hover:bg-gray-50 hover:text-gray-700`}
                  >
                    <span>{selectedFilters.advanced || "Advanced search"}</span>
                    <ChevronDown size={16} className="ml-2" />
                  </button>
                  {openFilter === 'advanced' && (
                    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                      <ul className="py-1">
                        <li><button onClick={() => selectFilterOption('advanced', 'By name')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">By name</button></li>
                        <li><button onClick={() => selectFilterOption('advanced', 'By date')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">By date</button></li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Start Filter */}
                <div className="relative">
                  <button 
                    onClick={() => toggleFilter('start')} 
                    className={`flex items-center px-3 py-2 border rounded-md ${
                      selectedFilters.start 
                        ? "border-[#2752E7] bg-[#2752E7] text-white" 
                        : "border-gray-300 bg-white text-gray-700"
                    } hover:bg-gray-50 hover:text-gray-700`}
                  >
                    <span>{selectedFilters.start || "Start"}</span>
                    <ChevronDown size={16} className="ml-2" />
                  </button>
                  {openFilter === 'start' && (
                    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                      <ul className="py-1">
                        <li><button onClick={() => selectFilterOption('start', 'New Agreement')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">New Agreement</button></li>
                        <li><button onClick={() => selectFilterOption('start', 'Upload Document')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Upload Document</button></li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Clear Button - No dropdown */}
                <button 
                  onClick={clearFilters}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            {/* Table */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={selectedItems.length === agreements.length}
                        onChange={toggleSelectAll}
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Name</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      Last Change
                      <ChevronDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agreements.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={selectedItems.includes(agreement.id)}
                          onChange={() => toggleSelectItem(agreement.id)}
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{agreement.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={agreement.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agreement.lastChangeDate}</div>
                      <div className="text-sm text-gray-500">{agreement.lastChangeTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        <ActionButton action={agreement.action} />
                        <div className="relative" ref={setMenuRef(agreement.id)}>
                          <button 
                            onClick={(e) => toggleMenu(agreement.id, e)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {openMenuId === agreement.id && (
                            <div 
                              className={`absolute ${
                                isBottomRow(agreement.id) ? 'bottom-full right-0 mb-2' : 'top-full right-0 mt-2'
                              } w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200`}
                            >
                              <div className="py-1">
                                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <svg className="mr-3 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.523 19 3.732 16.057 2.458 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  View Details
                                </button>
                                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <svg className="mr-3 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Download PDF
                                </button>
                                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <svg className="mr-3 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Send Reminder
                                </button>
                                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <svg className="mr-3 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Share
                                </button>
                                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <svg className="mr-3 h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 13C10 13.5304 9.78929 14.0391 9.41421 14.4142C9.03914 14.7893 8.53043 15 8 15C7.46957 15 6.96086 14.7893 6.58579 14.4142C6.21071 14.0391 6 13.5304 6 13C6 12.4696 6.21071 11.9609 6.58579 11.5858C6.96086 11.2107 7.46957 11 8 11C8.53043 11 9.03914 11.2107 9.41421 11.5858C9.78929 11.9609 10 12.4696 10 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10 5C10 5.53043 9.78929 6.03914 9.41421 6.41421C9.03914 6.78929 8.53043 7 8 7C7.46957 7 6.96086 6.78929 6.58579 6.41421C6.21071 6.03914 6 5.53043 6 5C6 4.46957 6.21071 3.96086 6.58579 3.58579C6.96086 3.21071 7.46957 3 8 3C8.53043 3 9.03914 3.21071 9.41421 3.58579C9.78929 3.96086 10 4.46957 10 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M18 9C18 9.53043 17.7893 10.0391 17.4142 10.4142C17.0391 10.7893 16.5304 11 16 11C15.4696 11 14.9609 10.7893 14.5858 10.4142C14.2107 10.0391 14 9.53043 14 9C14 8.46957 14.2107 7.96086 14.5858 7.58579C14.9609 7.21071 15.4696 7 16 7C16.5304 7 17.0391 7.21071 17.4142 7.58579C17.7893 7.96086 18 8.46957 18 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10.5858 11.5858L15.4142 9.41421" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10.5858 6.41421L15.4142 8.58579" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Copy Link
                                </button>
                                <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                  <svg className="mr-3 h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AgreementsPage

