"use client"

import { useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import Sidebar from "../../components/Sidebar"
import Header from "../../components/Header"
import TemplateTable from "../../components/TemplateTable"
import {mockTemplates, Template} from "../../data/mockData"

const Add = () => {
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Use the shared mock data
  const templates:Template[] = mockTemplates;

  const handleTemplateAction = (action: string, templateId: number) => {
    console.log(`Template action: ${action} on template ${templateId}`);
    // Implement action handling here
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="templates" activeSubPage="my-templates" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header component */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">My Templates</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search Template"
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                <span>Start</span>
                <ChevronDown size={16} className="ml-1" />
              </button>
              <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                <span>Sort By</span>
              </button>
              <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1"
                >
                  <path
                    d="M3 4H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 12H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 20H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Use the shared TemplateTable component */}
          <TemplateTable 
            templates={templates} 
            onAction={handleTemplateAction}
            tableTitle="My Templates"
          />
        </main>
      </div>
    </div>
  )
}

export default Add

