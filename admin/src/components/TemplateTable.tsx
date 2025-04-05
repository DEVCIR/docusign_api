import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, MoreVertical, Trash2 } from "lucide-react"
import Avatar from "./Avatar"
import { Template } from "../data/mockData"

interface TemplateTableProps {
  templates: Template[]
  limit?: number
  onAction?: (action: string, templateId: number) => void
  tableTitle?: string
}

const TemplateTable = ({ templates, limit, onAction, tableTitle = "Templates" }: TemplateTableProps) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  
  // Create a ref to track menu buttons and dropdown content
  const menuRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  // Use a limited number of templates if limit is specified
  const displayTemplates = limit ? templates.slice(0, limit) : templates

  // Callback ref function that properly handles the ref assignment
  const setMenuRef = (id: number) => (el: HTMLDivElement | null) => {
    menuRefs.current[id] = el;
  };

  // Toggle menu open/closed
  const toggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the document click handler from firing
    if (openMenuId === id) {
      setOpenMenuId(null)
    } else {
      setOpenMenuId(id)
    }
  }

  // Add click handler to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If a menu is open and the click is outside of any menu
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

  // Determine if a row is in the bottom part of the table
  const isBottomRow = (id: number) => {
    // Consider the last 3 rows as "bottom" rows
    return id > displayTemplates.length - 3;
  };

  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === displayTemplates.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(displayTemplates.map((template) => template.id))
    }
  }

  const handleAction = (action: string, templateId: number) => {
    if (onAction) {
      onAction(action, templateId);
    }
  };

  return (
    <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
      {/* Table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={selectedItems.length === displayTemplates.length}
                  onChange={toggleSelectAll}
                />
                <span className="ml-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span>
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Owner
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              PowerForms
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Created Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Last Change
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Folders
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Action
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayTemplates.map((template) => (
            <tr key={template.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={selectedItems.includes(template.id)}
                    onChange={() => toggleSelectItem(template.id)}
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Avatar name={template.owner} size="md" className="mr-2" />
                  <div className="text-sm text-gray-900">{template.owner}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.powerForms}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{template.createdDate}</div>
                <div className="text-sm text-gray-500">{template.createdTime}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{template.lastChange}</div>
                <div className="text-sm text-gray-500">{template.lastChangeTime}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.folders}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button 
                    className="px-4 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                    onClick={() => handleAction('use', template.id)}
                  >
                    Use
                  </button>
                  <button 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleAction('delete', template.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div 
                    className="relative" 
                    ref={setMenuRef(template.id)}
                  >
                    <button 
                      className="text-gray-400 hover:text-gray-500" 
                      onClick={(e) => toggleMenu(template.id, e)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === template.id && (
                      <div 
                        className={`absolute ${
                          isBottomRow(template.id) ? 'bottom-full right-0 mb-2' : 'right-0 mt-2'
                        } w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200`}
                      >
                        <div className="py-1">
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => handleAction('edit', template.id)}
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
                            Edit
                          </button>
                          {/* Additional menu items - keeping the same as original */}
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => handleAction('move', template.id)}
                          >
                            <svg
                              className="mr-3 h-4 w-4 text-gray-500"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 9L2 12L5 15"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {/* ...existing path data... */}
                            </svg>
                            Move
                          </button>
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => handleAction('share', template.id)}
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
                            Share to Folders
                          </button>
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => handleAction('copy', template.id)}
                          >
                            <svg
                              className="mr-3 h-4 w-4 text-gray-500"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Copy
                          </button>
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => handleAction('download', template.id)}
                          >
                            <svg
                              className="mr-3 h-4 w-4 text-gray-500"
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
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {/* Empty cell for spacing */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="px-6 py-4 flex items-center justify-center border-t border-gray-200">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            <span className="ml-1">Previous</span>
          </button>
          <button
            onClick={() => setCurrentPage(1)}
            className={`relative inline-flex items-center px-4 py-2 border ${
              currentPage === 1
                ? "bg-blue-50 border-blue-500 text-blue-600 z-10"
                : "border-gray-300 bg-white text-gray-500"
            } text-sm font-medium hover:bg-gray-50`}
            style={currentPage === 1 ? { marginLeft: '0px' } : {}}
          >
            1
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`relative inline-flex items-center px-4 py-2 border ${
              currentPage === 2
                ? "bg-blue-50 border-blue-500 text-blue-600 z-10"
                : "border-gray-300 bg-white text-gray-500"
            } text-sm font-medium hover:bg-gray-50`}
            style={currentPage === 2 ? { marginLeft: '0px' } : {}}
          >
            2
          </button>
          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            ...
          </span>
          <button
            onClick={() => setCurrentPage(5)}
            className={`relative inline-flex items-center px-4 py-2 border ${
              currentPage === 5
                ? "bg-blue-50 border-blue-500 text-blue-600 z-10"
                : "border-gray-300 bg-white text-gray-500"
            } text-sm font-medium hover:bg-gray-50`}
            style={currentPage === 5 ? { marginLeft: '0px' } : {}}
          >
            5
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="mr-1">Next</span>
            <span className="sr-only">Next</span>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  )
}

export default TemplateTable
