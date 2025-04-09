import React, {useEffect, useState} from "react"
import Sidebar from "../../components/Sidebar"
import Header from "../../components/Header"
import Button from "../../components/Button"
import {Search} from "lucide-react"
import axios from "axios"
import {apiUrl} from "../../config/api"
import {toast} from "sonner";
import Layout from "../../components/Layout";

interface User {
    id: number
    name: string
    email: string
}

const List = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({name: "", email: "", password: ""});
    const [searchQuery, setSearchQuery] = useState("");
    const [VerifyingUsers, setVerifyingUsers] = useState({});
    type VerifyingUsersState = Record<number, boolean>;

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

    // const sendVerificationEmail = async (userId: number) => {
    //     try {
    //         setVerifyingUsers((prev) => ({...prev, [userId]: true}))
    //
    //         const response = await axios.post(`${apiUrl}/api/admin/users/${userId}/send-verification`)
    //         toast.success(`${response.data.message}`, {
    //             duration: 3000,
    //             position: 'top-right',
    //         })
    //         fetchUsers()
    //     } catch (err: unknown) {
    //         toast.error(`${err.response?.data?.message || 'Failed to send verification email'}`, {
    //             duration: 3000,
    //             position: 'top-right',
    //         })
    //         console.error(err)
    //     } finally {
    //         setVerifyingUsers((prev) => ({...prev, [userId]: false}))
    //     }
    // }

    const sendVerificationEmail = async (userId: number) => {
        try {
            // Assuming setVerifyingUsers is typed to expect a userId number as a key
            setVerifyingUsers((prev) => ({...prev, [userId]: true}));

            // Making the POST request
            const response = await axios.post(`${apiUrl}/api/admin/users/${userId}/send-verification`);

            console.log(response.data);

            // Toast notification on success
            toast.success(response.data.message, {
                duration: 3000,
                position: 'top-right',
            });

            // Fetch users after sending verification
            fetchUsers();
        } catch (err: unknown) {
            // Ensure to cast err as AxiosError for proper error handling
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || 'Failed to send verification email', {
                    duration: 3000,
                    position: 'top-right',
                });
            } else {
                toast.error('An unexpected error occurred', {
                    duration: 3000,
                    position: 'top-right',
                });
            }
            console.error(err);
        } finally {
            // Reset the verifying state for the user
            setVerifyingUsers((prev) => ({...prev, [userId]: false}));
        }
    };


    // const markUserVerified = async (userId) => {
    //     try {
    //         setMarkingVerifiedUsers((prev) => ({...prev, [userId]: true}))
    //
    //         const response = await axios.post(`${apiUrl}/api/admin/users/${userId}/mark-verified`)
    //         toast.success(`User marked as verified successfully`, {
    //             duration: 3000,
    //             position: 'top-right',
    //         })
    //
    //         fetchUsers()
    //     } catch (err) {
    //         toast.error(`${err.response?.data?.message || 'Failed to mark user as verified'}`, {
    //             duration: 3000,
    //             position: 'top-right',
    //         })
    //         console.error(err)
    //     } finally {
    //         setMarkingVerifiedUsers((prev) => ({...prev, [userId]: false}))
    //     }
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
        setFormData({name: user.name, email: user.email, password: ""})
        setEditModalVisible(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setFormData((prev) => ({...prev, [name]: value}))
    }

    const handleUpdate = async () => {
        if (!currentUser) return

        try {
            await axios.put(`${apiUrl}/api/user/${currentUser.id}/`, formData)
            fetchUsers().then(r => setEditModalVisible(false))
        } catch (error) {
            console.error("Error updating user:", error)
        }
    }

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    console.log(filteredUsers);
    return (
        <Layout>
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header/>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={16}/>
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
                            <div
                                className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"/>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white shadow rounded-md text-center">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4">#</th>
                                    <th className="py-2 px-4">Name</th>
                                    <th className="py-2 px-4">Email</th>
                                    {/*<th className="py-2 px-4">Verified</th>*/}
                                    {/*<th className="py-2 px-4">Verification</th>*/}
                                    <th className="py-2 px-4">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id} className="border-t">
                                        <td className="py-2 px-4">{index + 1}</td>
                                        <td className="py-2 px-4">{user.name}</td>
                                        <td className="py-2 px-4">{user.email}</td>
                                        {/*<td className="py-2 px-4 space-x-2">*/}
                                        {/*    <Button text="Verify" onClick={() => sendVerificationEmail(user.id)}*/}
                                        {/*            variant="primary"/>*/}
                                        {/*    <Button text="Mark Verified" onClick={() => handleEdit(user)}*/}
                                        {/*            variant="secondary"/>*/}
                                        {/*</td>*/}
                                        <td className="py-2 px-4 space-x-2">
                                            <Button text="Edit" onClick={() => handleEdit(user)} variant="warning"/>
                                            <Button text="Delete" onClick={() => handleDelete(user.id)}
                                                    variant="danger"/>

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

        </Layout>
    )
}

export default List
