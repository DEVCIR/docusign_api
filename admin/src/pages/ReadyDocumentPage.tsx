"use client"

import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"

const ReadyDocumentPage = () => {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="border border-dashed border-gray-300 rounded-md p-12 flex flex-col items-center justify-center">
              <div className="mb-6">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-8BOtG8ixRJLU8T1mfDNsDISpiissBC.png"
                  alt="Document illustration"
                  className="h-48 w-auto"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=192&width=192&text=Document+Illustration"
                  }}
                />
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">Your document is on its way.</h2>
              <p className="text-gray-600 mb-4">It's your turn to sign.</p>
              <button
                onClick={() => navigate("/sign-document")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sign Now
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ReadyDocumentPage

