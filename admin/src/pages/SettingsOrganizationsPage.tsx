"use client"

import { useState } from "react"
import Sidebar from "../components/Sidebar"
import SettingsSidebar from "../components/SettingsSidebar"
import Header from "../components/Header"

const SettingsOrganizationsPage = () => {
  const [orgType, setOrgType] = useState<"business" | "academic">("business")
  const [orgName, setOrgName] = useState("")
  const [orgUrl, setOrgUrl] = useState("")

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="settings" activeSubPage="organizations" />

      <div className="flex flex-1 overflow-hidden">
        <SettingsSidebar activeItem="organizations" />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6 bg-white rounded-md border border-gray-200 p-6">
              <h1 className="text-xl font-semibold text-gray-800">Create New Organization</h1>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    id="org-name"
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Organization"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="org-url" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Organization's URL: dochub.com/
                  </label>
                  <input
                    id="org-url"
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={orgUrl}
                    onChange={(e) => setOrgUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Organization Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border rounded-md p-4 cursor-pointer ${
                        orgType === "business" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setOrgType("business")}
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${
                            orgType === "business" ? "border-blue-500" : "border-gray-400"
                          }`}
                        >
                          {orgType === "business" && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                        </div>
                        <span className="font-medium">Business/Professional</span>
                      </div>
                      <p className="text-sm text-gray-600">A group for jointly sharing documents, billing and more</p>
                    </div>

                    <div
                      className={`border rounded-md p-4 cursor-pointer ${
                        orgType === "academic" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setOrgType("academic")}
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${
                            orgType === "academic" ? "border-blue-500" : "border-gray-400"
                          }`}
                        >
                          {orgType === "academic" && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                        </div>
                        <span className="font-medium">Academic</span>
                      </div>
                      <p className="text-sm text-gray-600">A group for universities, schools, teachers and students</p>
                    </div>
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

export default SettingsOrganizationsPage

