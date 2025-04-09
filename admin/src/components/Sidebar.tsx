"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {ChevronDown, ChevronRight} from "lucide-react"
import {useLocation, useNavigate} from "react-router-dom"

interface SidebarProps {
    activePage?: string
    activeSubPage?: string
}

const Sidebar = ({activePage = "dashboard", activeSubPage = ""}: SidebarProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
        const items = new Set<string>()
        // Pre-expand active sections
        switch (true) {
            case activePage === "user/list" || activeSubPage?.startsWith("user"):
                items.add("user");
                items.add("user/list");
                break;

            case activePage === "templates" || activeSubPage?.startsWith("envelope-"):
                items.add("templates");
                items.add("envelope-templates");
                break;

            case activePage === "folders" || activeSubPage?.startsWith("folder-"):
                items.add("folders");
                break;

            case activePage === "agreements":
                items.add("agreements");
                break;

            case activePage === "settings":
                items.add("settings");
                break;
        }

        return items
    })

    const [showAllEnvelopeItems, setShowAllEnvelopeItems] = useState(true)
    const [showAllAgreementItems, setShowAllAgreementItems] = useState(true)

    // Update expanded items when active page changes
    useEffect(() => {
        if (activePage === "settings") {
            setExpandedItems((prev) => new Set(prev).add("settings"))
        }
    }, [activePage])

    const toggleExpand = (item: string, e?: React.MouseEvent) => {
        e?.stopPropagation()
        setExpandedItems((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(item)) {
                newSet.delete(item)
            } else {
                newSet.add(item)
            }
            return newSet
        })
    }

    const navigateTo = (path: string, page: string, subPage = "") => {
        navigate(path)
    }

    const handleItemClick = (path: string, page: string, subPage = "", e?: React.MouseEvent) => {
        e?.stopPropagation()
        navigateTo(path, page, subPage)
    }

    const handleTemplatesClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        // Ensure both dropdowns stay open when navigating to templates
        setExpandedItems((prev) => new Set(prev).add("templates").add("envelope-templates"))
        navigate("/templates")
    }

    const isExpanded = (item: string) => expandedItems.has(item)
    const isActive = (page: string, subPage = "") => activePage === page && (!subPage || activeSubPage === subPage)

    const isSettingsActive = (subPage: string) => activePage === "settings" && activeSubPage === subPage

    return (
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Logo */}
            <div className="p-4">
                <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-600 text-white flex items-center justify-center rounded">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M20 8.5V13.5C20 17.5 18 19.5 14 19.5H10C6 19.5 4 17.5 4 13.5V8.5"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M16 2H8C6.34 2 5 3.34 5 5V6.5H19V5C19 3.34 17.66 2 16 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>
                    <span className="ml-2 text-sm text-blue-600 font-medium">Logo Here</span>
                </div>
            </div>

            {/* New Document Button */}
            <div className="px-4 mb-4">
                <button
                    onClick={() => navigate("/new-document")}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white transition-colors hover:bg-[#2752E71A] hover:text-[#2752E7] hover:border-[#2752E7]"
                >
                    <span className="mr-2">+</span> New Document
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-2">
                <ul className="space-y-1">
                    {/* Dashboard */}
                    <li>
                        <button
                            onClick={() => navigateTo("/dashboard", "dashboard")}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                isActive("dashboard") ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="mr-3">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor"
                                          strokeWidth="2"/>
                                    <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor"
                                          strokeWidth="2"/>
                                    <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor"
                                          strokeWidth="2"/>
                                    <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor"
                                          strokeWidth="2"/>
                                </svg>
                            </div>
                            Dashboard
                        </button>
                    </li>

                    {/* User */}
                    <li>
                        <button
                            onClick={(e) => toggleExpand("User", e)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                                isActive("User") ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="flex items-center">
                                <div className="mr-3">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                        <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                </div>
                                User
                            </div>
                            <ChevronDown
                                size={16}
                                className={`transition-transform ${isExpanded("User") ? "rotate-180" : ""}`}
                            />
                        </button>

                        {isExpanded("User") && (
                            <ul className="mt-1 space-y-1">
                                {/* Envelope Templates dropdown */}
                                <li>
                                    <button
                                        onClick={(e) =>
                                            handleItemClick("/user/add", "templates", "envelope-deleted", e)
                                        }
                                        className={`w-full flex items-center pl-8 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                            isActive("templates", "envelope-deleted")
                                                ? "text-blue-600"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    > Add
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={(e) =>
                                            handleItemClick("/user/list", "templates", "envelope-deleted", e)
                                        }
                                        className={`w-full flex items-center pl-8 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                            isActive("templates", "envelope-deleted")
                                                ? "text-blue-600"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    > List
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Templates */}
                    <li>
                        <button
                            onClick={(e) => toggleExpand("templates", e)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                                isActive("templates") ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="flex items-center">
                                <div className="mr-3">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                        <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                </div>
                                Templates
                            </div>
                            <ChevronDown
                                size={16}
                                className={`transition-transform ${isExpanded("templates") ? "rotate-180" : ""}`}
                            />
                        </button>

                        {isExpanded("templates") && (
                            <ul className="mt-1 space-y-1">
                                {/* Envelope Templates dropdown */}
                                <li>
                                    <button
                                        onClick={(e) => toggleExpand("envelope-templates", e)}
                                        className={`w-full flex items-center justify-between pl-10 pr-3 py-2 text-sm font-medium rounded-md ${
                                            isExpanded("envelope-templates") || activeSubPage?.startsWith("envelope-")
                                                ? "bg-gray-100 text-blue-600"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="flex items-center">
                      <span className="mr-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 12H16L14 15H10L8 12H2" stroke="currentColor" strokeWidth="2"/>
                          <path
                              d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 17.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z"
                              stroke="currentColor"
                              strokeWidth="2"
                          />
                        </svg>
                      </span>
                                            Envelope Templates
                                        </div>
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform ${isExpanded("envelope-templates") ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {/* Envelope Templates dropdown items */}
                                    {isExpanded("envelope-templates") && (
                                        <ul className="pl-8 mt-1 space-y-1">
                                            <li>
                                                <button
                                                    onClick={handleTemplatesClick}
                                                    className={`w-full flex items-center pl-8 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                                        isActive("templates", "my-templates") ? "text-blue-600" : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    My Templates
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={(e) =>
                                                        handleItemClick("/templates/envelope/shared", "templates", "envelope-shared", e)
                                                    }
                                                    className={`w-full flex items-center pl-8 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                                        isActive("templates", "envelope-shared")
                                                            ? "text-blue-600"
                                                            : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    Shared with Me
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={(e) =>
                                                        handleItemClick("/templates/envelope/favorites", "templates", "envelope-favorites", e)
                                                    }
                                                    className={`w-full flex items-center pl-8 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                                        isActive("templates", "envelope-favorites")
                                                            ? "text-blue-600"
                                                            : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    Favorites
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setShowAllEnvelopeItems(!showAllEnvelopeItems)
                                                    }}
                                                    className="w-full flex items-center pl-8 pr-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                                                >
                                                    {showAllEnvelopeItems ? "Show Less" : "Show More"}
                                                </button>
                                            </li>

                                            {showAllEnvelopeItems && (
                                                <>
                                                    <li>
                                                        <button
                                                            onClick={(e) =>
                                                                handleItemClick("/templates/envelope/all", "templates", "envelope-all", e)
                                                            }
                                                            className={`w-full flex items-center pl-8 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                                                isActive("templates", "envelope-all")
                                                                    ? "text-blue-600"
                                                                    : "text-gray-700 hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            All Templates
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            onClick={(e) =>
                                                                handleItemClick("/templates/envelope/deleted", "templates", "envelope-deleted", e)
                                                            }
                                                            className={`w-full flex items-center pl-8 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                                                isActive("templates", "envelope-deleted")
                                                                    ? "text-blue-600"
                                                                    : "text-gray-700 hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            Deleted
                                                        </button>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    )}
                                </li>

                                {/* Restore Folders section */}
                                <li>
                                    <button
                                        onClick={(e) => toggleExpand("folders", e)}
                                        className={`w-full flex items-center justify-between pl-10 pr-3 py-2 text-sm font-medium rounded-md ${
                                            isExpanded("folders") && (activePage === "folders" || activeSubPage?.startsWith("folder-"))
                                                ? "bg-gray-100 text-blue-600"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="flex items-center">
                      <span className="mr-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                              d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z"
                              stroke="currentColor"
                              strokeWidth="2"
                          />
                        </svg>
                      </span>
                                            Folders
                                        </div>
                                        {isExpanded("folders") ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                                    </button>

                                    {isExpanded("folders") && (
                                        <ul className="pl-8 mt-1 space-y-1">
                                            <li>
                                                <button
                                                    onClick={(e) => handleItemClick("/folders/shared", "folders", "shared-folders", e)}
                                                    className={`w-full flex items-center pl-8 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                                        isActive("folders", "shared-folders")
                                                            ? "text-blue-600 font-medium"
                                                            : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                            <span className="mr-3">
                              <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                    d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                              </svg>
                            </span>
                                                        Shared Folders
                                                    </div>
                                                    <ChevronRight size={16}/>
                                                </button>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Agreements */}
                    <li>
                        <button
                            onClick={(e) => {
                                toggleExpand("agreements", e)
                                navigateTo("/agreements", "agreements")
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                                isActive("agreements") ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="flex items-center">
                                <div className="mr-3">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M9 15H15" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M9 11H15" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M9 7H15" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                </div>
                                Agreements
                            </div>
                            <ChevronDown
                                size={16}
                                className={`transition-transform ${isExpanded("agreements") ? "rotate-180" : ""}`}
                            />
                        </button>

                        {isExpanded("agreements") && (
                            <ul className="mt-1 space-y-1">
                                <li>
                                    <button
                                        onClick={(e) => handleItemClick("/agreements/inbox", "agreements", "inbox", e)}
                                        className={`w-full flex items-center pl-10 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                            isActive("agreements", "inbox") ? "text-blue-600" : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <svg
                                            className="mr-3 h-4 w-4 text-gray-500"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M22 12H16L14 15H10L8 12H2"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        Inbox
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={(e) => handleItemClick("/agreements/sent", "agreements", "sent", e)}
                                        className={`w-full flex items-center pl-10 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                            isActive("agreements", "sent") ? "text-blue-600" : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <svg
                                            className="mr-3 h-4 w-4 text-gray-500"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M22 2L11 13"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M22 2L15 22L11 13L2 9L22 2Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        Sent
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={(e) => handleItemClick("/agreements/completed", "agreements", "completed", e)}
                                        className={`w-full flex items-center pl-10 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                            isActive("agreements", "completed") ? "text-blue-600" : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <svg
                                            className="mr-3 h-4 w-4 text-gray-500"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M22 4L12 14.01L9 11.01"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        Completed
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={(e) => handleItemClick("/agreements/action-required", "agreements", "action-required", e)}
                                        className={`w-full flex items-center pl-10 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                            isActive("agreements", "action-required") ? "text-blue-600" : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <svg
                                            className="mr-3 h-4 w-4 text-gray-500"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12 8V12L15 15"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        Action Required
                                    </button>
                                </li>

                                {/* Add Show More/Less toggle button */}
                                <li>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setShowAllAgreementItems(!showAllAgreementItems)
                                        }}
                                        className="w-full flex items-center pl-10 pr-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        {showAllAgreementItems ? "Show Less" : "Show More"}
                                    </button>
                                </li>

                                {showAllAgreementItems && (
                                    <>
                                        <li>
                                            <button
                                                onClick={(e) => handleItemClick("/agreements/drafts", "agreements", "drafts", e)}
                                                className={`w-full flex items-center pl-10 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                                    isActive("agreements", "drafts") ? "text-blue-600" : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                            >
                                                <svg
                                                    className="mr-3 h-4 w-4 text-gray-500"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                Drafts
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={(e) => handleItemClick("/agreements/deleted", "agreements", "deleted", e)}
                                                className={`w-full flex items-center pl-10 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                                    isActive("agreements", "deleted") ? "text-blue-600" : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                            >
                                                <svg
                                                    className="mr-3 h-4 w-4 text-gray-500"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M3 6H5H21"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                Deleted
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={(e) => handleItemClick("/agreements/waiting", "agreements", "waiting", e)}
                                                className={`w-full flex items-center pl-10 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                                    isActive("agreements", "waiting") ? "text-blue-600" : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                            >
                                                <svg
                                                    className="mr-3 h-4 w-4 text-gray-500"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                Waiting
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={(e) => handleItemClick("/agreements/folders", "agreements", "folders", e)}
                                                className={`w-full flex items-center pl-10 pr-3 py-1.5 text-sm font-medium rounded-md ${
                                                    isActive("agreements", "folders") ? "text-blue-600" : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                            >
                                                <svg
                                                    className="mr-3 h-4 w-4 text-gray-500"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                Folders
                                            </button>
                                        </li>
                                    </>
                                )}
                            </ul>
                        )}
                    </li>

                    {/* Admin */}
                    <li>
                        <button
                            onClick={() => navigateTo("/admin", "admin")}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                isActive("admin") ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="mr-3">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>
                            Admin
                        </button>
                    </li>

                    {/* Add Folders */}
                    <li>
                        <button
                            onClick={() => navigateTo("/add-folders", "add-folders")}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                isActive("add-folders") ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="mr-3">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path d="M12 11V17" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M9 14H15" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            Add Folders
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Bottom Navigation */}
            <div className="border-t border-gray-200 p-2 mt-auto">
                <ul className="space-y-1">
                    {/* Settings */}
                    <li>
                        <button
                            onClick={(e) => {
                                toggleExpand("settings", e)
                                // Update to route to organizations-list
                                navigateTo("/settings/organizations-list", "settings", "organizations")
                            }}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                isActive("settings") ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="mr-3">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71L19.73 19.77C19.4995 20.0005 19.3448 20.2998 19.286 20.6242C19.2272 20.9486 19.2669 21.2832 19.4 21.5849"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M4.6 15C4.73307 15.3016 4.77285 15.6362 4.71401 15.9606C4.65517 16.285 4.50053 16.5843 4.27 16.82L4.21 16.88C4.02397 17.0657 3.87647 17.2863 3.77586 17.5291C3.67526 17.7719 3.62341 18.0322 3.62341 18.295C3.62341 18.5578 3.67526 18.8181 3.77586 19.0609C3.87647 19.3037 4.02397 19.5243 4.21 19.71L4.27 19.77C4.50053 20.0005 4.65517 20.2998 4.71401 20.6242C4.77285 20.9486 4.73307 21.2832 4.6 21.5849"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path d="M2 9H22" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            Settings
                        </button>
                    </li>

                    {/* Support */}
                    <li>
                        <button
                            onClick={() => navigateTo("/support", "support")}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                isActive("support") ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="mr-3">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path d="M9.09 9A3 3 0 0 1 14.91 14.91" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 6V6.01" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            Support
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Sidebar

