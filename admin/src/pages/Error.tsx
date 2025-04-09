import React, {JSX} from 'react'

const Error404 = (): JSX.Element => {
    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
                <h1 className="text-9xl font-extrabold text-gray-500">404</h1>
                <h4 className="text-xl font-semibold text-gray-700 mt-4">Oops! You{"'"}re lost.</h4>
                <p className="text-gray-500 mt-2">The page you are looking for was not found.</p>

                <div className="mt-6 flex justify-center items-center space-x-2">
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                            onClick={() => window.location.href = localStorage.getItem("token") ? "/dashboard" : "/login"}>
                        Homepage
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Error404;