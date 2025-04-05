"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, SettingsIcon } from "lucide-react"
import Sidebar from "../components/Sidebar"
import SettingsSidebar from "../components/SettingsSidebar"
import Header from "../components/Header"

// Rename from SettingsOrganizationsPage to OrganizationsListPage
const OrganizationsListPage = () => {
  const [searchSettingValue, setSearchSettingValue] = useState("")
  const [searchUserValue, setSearchUserValue] = useState("")
  const [selectedUserFilter, setSelectedUserFilter] = useState("Name")
  // Add state for Type dropdown
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [selectedType, setSelectedType] = useState("All")
  // Add active filters count state
  const [activeFilters, setActiveFilters] = useState(1)
  // Add state for all filters dropdown
  const [showAllFiltersDropdown, setShowAllFiltersDropdown] = useState(false)
  // Add ref for the filter button container
  const filterButtonRef = useRef<HTMLDivElement | null>(null)
  const [showUserFilterDropdown, setShowUserFilterDropdown] = useState(false)
  const userFilterRef = useRef<HTMLDivElement | null>(null)
  
  // Options for the user filter dropdown
  const userFilterOptions = ["Name", "Email", "Role", "Department"]
  
  // Toggle user filter dropdown
  const toggleUserFilterDropdown = () => {
    setShowUserFilterDropdown(!showUserFilterDropdown)
  }
  
  // Select user filter option
  const selectUserFilter = (option: string) => {
    setSelectedUserFilter(option)
    setShowUserFilterDropdown(false)
  }
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userFilterRef.current && 
        !userFilterRef.current.contains(event.target as Node) &&
        showUserFilterDropdown
      ) {
        setShowUserFilterDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserFilterDropdown])

  // Type filter options
  const typeOptions = ["All", "Documents", "Templates", "Forms"]

  // Toggle type dropdown
  const toggleTypeDropdown = () => {
    setShowTypeDropdown(!showTypeDropdown)
  }

  // Select type option
  const selectType = (type: string) => {
    setSelectedType(type)
    setShowTypeDropdown(false)
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedType("All")
    setActiveFilters(0)
  }

  // Toggle all filters dropdown
  const toggleAllFiltersDropdown = () => {
    setShowAllFiltersDropdown(!showAllFiltersDropdown)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterButtonRef.current && 
        !filterButtonRef.current.contains(event.target as Node) &&
        showAllFiltersDropdown
      ) {
        setShowAllFiltersDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAllFiltersDropdown])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="settings" activeSubPage="organizations" />

      <div className="flex flex-1 overflow-hidden">
        <SettingsSidebar activeItem="organizations" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <div className="flex-1 overflow-y-auto p-6">
            {/* Find a Setting or User Section */}
            <div className="bg-white rounded-md border border-gray-200 mb-6">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-800">Find a Setting or User</h2>
              </div>

              <div className="p-6">
                {/* Find a Setting */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Find a Setting</h3>
                  <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Enter key word"
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchSettingValue}
                      onChange={(e) => setSearchSettingValue(e.target.value)}
                    />
                  </div>
                </div>

                {/* Find a User */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Find a User</h3>
                  <div className="flex max-w-xl">
                    {/* Dropdown - Updated with connected styling and actual dropdown */}
                    <div className="relative" ref={userFilterRef}>
                      <button
                        className="flex items-center justify-between px-3 py-2 border border-gray-300 border-r-0 rounded-l-md bg-white text-gray-700 hover:bg-gray-50 w-40"
                        onClick={toggleUserFilterDropdown}
                      >
                        <span>{selectedUserFilter}</span>
                        <ChevronDown size={16} />
                      </button>
                      
                      {/* Dropdown menu for Name selector */}
                      {showUserFilterDropdown && (
                        <div className="absolute left-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <ul className="py-1">
                            {userFilterOptions.map((option) => (
                              <li key={option}>
                                <button
                                  onClick={() => selectUserFilter(option)}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    option === selectedUserFilter 
                                      ? "bg-blue-50 text-blue-600" 
                                      : "text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  {option}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Input field - Now with constrained width, removed focus ring */}
                    <div className="w-64">
                      <input
                        type="text"
                        placeholder={`Enter ${selectedUserFilter.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300"
                        value={searchUserValue}
                        onChange={(e) => setSearchUserValue(e.target.value)}
                      />
                    </div>
                    
                    {/* Search button */}
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-200">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-md border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-800">Notifications</h2>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Updated Type All button with dropdown */}
                    <div className="relative">
                      <button 
                        onClick={toggleTypeDropdown}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                      >
                        <span>Type {selectedType}</span>
                        <ChevronDown size={16} className="ml-2" />
                      </button>
                      
                      {/* Dropdown menu for Type All */}
                      {showTypeDropdown && (
                        <div className="absolute left-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <ul className="py-1">
                            {typeOptions.map((type) => (
                              <li key={type}>
                                <button
                                  onClick={() => selectType(type)}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    type === selectedType 
                                      ? "bg-blue-50 text-blue-600" 
                                      : "text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  {type}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Filter counter and filter button - Fixed positioning */}
                    <div className="relative" ref={filterButtonRef}>
                      <div className="flex items-center space-x-1">
                        {/* Filter counter badge - Removed blue background */}
                        {activeFilters > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-600">
                            +{activeFilters}
                          </span>
                        )}
                        {/* Combined button with icon and text */}
                        <button 
                          onClick={toggleAllFiltersDropdown}
                          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 py-1 px-2 rounded-md hover:bg-gray-100"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M4 6H20M4 12H20M4 18H20"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>All Filters</span>
                        </button>
                      </div>
                      
                      {/* Properly positioned dropdown */}
                      {showAllFiltersDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                          <ul className="py-1">
                            <li><button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Date</button></li>
                            <li><button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Type</button></li>
                            <li><button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Status</button></li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <button 
                      className="text-gray-500 hover:text-gray-700"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700">
                    <SettingsIcon size={20} />
                  </button>
                </div>

                {/* Notifications content would go here */}
                <div className="mt-6 flex items-center justify-center h-40 border border-dashed border-gray-300 rounded-md">
                  <div className="text-center text-gray-500">
                    <p>No notifications to display</p>
                    <p className="text-sm">Notifications will appear here when available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationsListPage

