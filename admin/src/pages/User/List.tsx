"use client"

import React, { useEffect, useState } from "react"
import Sidebar from "../../components/Sidebar"
import Header from "../../components/Header"
import { Search } from "lucide-react"
import axios from "axios"
import { apiUrl } from "../../config/api"

interface User {
  id: number
  name: string
  email: string
}

const List = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/user/`)
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  // const handleAction = (var1,var2)=>{
  //   console.log("Action triggered")
  // }
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${apiUrl}/api/user/${id}/`)
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleEdit = (user: User) => {
    setCurrentUser(user)
    setFormData({ name: user.name, email: user.email, password: "" })
    setEditModalVisible(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async () => {
    if (!currentUser) return

    try {
      await axios.put(`${apiUrl}/api/user/${currentUser.id}/`, formData)
      fetchUsers()
      setEditModalVisible(false)
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="users" activeSubPage="list" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search User"
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">#</th>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="border-t">
                      <td className="py-2 px-4">{index + 1}</td>
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4">{user.email}</td>
                      <td className="py-2 px-4 space-x-2">
                        <button
                          className="bg-yellow-400 text-white px-3 py-1 rounded text-sm"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                            <button 
                            className="text-red-500 hover:text-red-600"
                            // onClick={() => handleAction('delete', template.id)}
                            >
                            {/*<Trash2 size={16} />*/}
                            </button>
                            <div className="relative"
                                 // ref={setMenuRef(template.id)}
                            >
                            <button 
                                className="text-gray-400 hover:text-gray-500" 
                                // onClick={(e) => toggleMenu(template.id, e)}
                            >
                                {/*<MoreVertical size={16} />*/}
                            </button>
                            {/*{openMenuId === template.id && (*/}
                                <div 
                                // className={`absolute ${isBottomRow(template.id) ? 'bottom-full right-0 mb-2' : 'right-0 mt-2'} w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200`}
                                >
                                <div className="py-1">
                                    <button 
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    // onClick={() => handleAction('edit', template.id)}
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
                                </div>
                                </div>
                            {/*)}*/}
                            </div>
                        </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Modal */}
          {editModalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white rounded-md w-full max-w-md shadow-lg p-6">
                <div className="mb-4 border-b pb-2">
                  <h3 className="text-lg font-semibold">Edit User</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      placeholder="Leave blank if not changing"
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={() => setEditModalVisible(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={handleUpdate}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default List
