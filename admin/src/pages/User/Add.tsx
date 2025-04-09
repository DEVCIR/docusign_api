"use client"
import React, {ChangeEvent, FormEvent, useState} from 'react';
import {apiUrl} from '../../config/api'; // Adjust the import path as needed
import Button from '../../components/Button';
import {Toaster} from "sonner";
import {error, success} from "../../config/notify";
import axios from "../../config/axiosInstance";
import Layout from "../../components/Layout"; // Adjust the import path as needed

interface FormData {
    name: string;
    email: string;
    password: string;
}

const Add: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
    });


    // Handle input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${apiUrl}/api/register`, formData);

            if (response.status === 201) {
                success('User registered successfully');
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                });
            } else {
                if (response.status === 422) {
                    const data = await response.data;
                    error(data.message || 'Validation error');
                } else {
                    error('Failed to register. Please try again.');
                }
            }
        } catch (err: unknown) {
            error('An error occurred during registration');
            console.log(`Unexpected Error:  ${err}`);
        }
    };

    return (
        <Layout>
            <div className="flex-1 flex flex-col overflow-hidden px-48">
                <Toaster/>
                <h1 className="text-4xl font-bold my-6">User Registration</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="mt-4">
                        <Button
                            text="Register"
                            onClick={() => {
                            }} // Empty handler since form submit will handle it
                            variant="primary"
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Add;