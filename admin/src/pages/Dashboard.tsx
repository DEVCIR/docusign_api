"use client"

import { useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import Sidebar from "../components/Sidebar"
import MetricCard from "../components/MetricCard"
import Header from "../components/Header"
import TemplateTable from "../components/TemplateTable"
import { getTemplates } from "../data/mockData"

const Dashboard = () => {
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("This Month")

  const timePeriods = ["Today", "This Week", "This Month", "This Quarter", "This Year"]

  // Use the shared mock data but limit to 6 items for the dashboard
  const templates = getTemplates(6)

  const handleTemplateAction = (action: string, templateId: number) => {
    console.log(`Action ${action} performed on template ${templateId}`);
    // Handle different actions here
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header component */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Agreement Reports Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Agreement Reports</h2>
              <div className="relative">
                <button 
                  className="flex items-center text-sm text-gray-600 bg-white px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                  onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                >
                  <span>{selectedTimePeriod}</span>
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {isTimeDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <ul className="py-1">
                      {timePeriods.map((period) => (
                        <li key={period}>
                          <button
                            className={`w-full text-left px-4 py-2 text-sm ${
                              period === selectedTimePeriod 
                                ? "bg-blue-50 text-blue-600" 
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              setSelectedTimePeriod(period);
                              setIsTimeDropdownOpen(false);
                            }}
                          >
                            {period}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <MetricCard title="Action Required" value={650} color="amber" />
              <MetricCard title="Waiting for others" value={730} color="blue" />
              <MetricCard title="Completed" value={450} color="green" />
              <MetricCard title="Expiring Soon" value={580} color="red" />
            </div>
          </div>

          {/* Call to Action Box - Updated with new background color */}
          <div className="border border-dashed border-gray-300 rounded-md p-8 mb-6 flex flex-col items-center justify-center" 
               style={{ backgroundColor: "#D0D5DD38" }}>
            <p className="text-gray-600 mb-4">Sign or get signature</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Start
            </button>
          </div>

          {/* Table Section */}
          <div>
            {/* Table Header with Search and Filters */}
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-md flex justify-between items-center mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                  <span>Start</span>
                  <ChevronDown size={16} className="ml-1" />
                </button>
                <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                  <span>Label</span>
                </button>
                <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Use the shared TemplateTable component */}
            <TemplateTable 
              templates={templates} 
              limit={6} 
              onAction={handleTemplateAction}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard

