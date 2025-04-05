import { Bell, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
  userName?: string
}

const Header = ({ userName = "Olivia" }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Welcome back, {userName}</h1>
        <div className="flex items-center space-x-4">
          {/* Start Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
            >
              <span>Start</span>
              <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  {/* Envelope Templates with submenu */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setOpenSubmenu('envelope')}
                    onMouseLeave={() => setOpenSubmenu(null)}
                  >
                    <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12H16L14 15H10L8 12H2" />
                        <path d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z" />
                      </svg>
                      <span>Envelope Templates</span>
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </button>
                    
                    {openSubmenu === 'envelope' && (
                      <div className="absolute right-full top-0 mr-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                        <div className="py-1">
                          <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create a Template</span>
                          </button>
                          <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" />
                              <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" />
                            </svg>
                            <span>Template Library</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Web Forms with submenu */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setOpenSubmenu('webforms')}
                    onMouseLeave={() => setOpenSubmenu(null)}
                  >
                    <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2.25278V21.7472M12 2.25278C10.8325 1.47686 9.34649 1 7.8 1C4.6268 1 2 3.13401 2 5.85C2 9.75164 12 15.15 12 15.15C12 15.15 22 9.75164 22 5.85C22 3.13401 19.3732 1 16.2 1C14.6535 1 13.1675 1.47686 12 2.25278Z" />
                      </svg>
                      <span>Web Forms</span>
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </button>
                    
                    {openSubmenu === 'webforms' && (
                      <div className="absolute right-full top-0 mr-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                        <div className="py-1">
                          <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New Web Form</span>
                          </button>
                          <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" />
                              <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" />
                            </svg>
                            <span>Form Library</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button className="text-gray-500 hover:text-gray-700">
              <Bell size={20} />
            </button>
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </div>

          {/* User Avatar */}
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <span>{userName.charAt(0)}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header