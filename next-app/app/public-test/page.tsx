"use client";

import { useState } from "react";

export default function PublicTestPage() {
    const [testResult, setTestResult] = useState<string>("Not tested");

    const testAPI = async () => {
        setTestResult("Testing...");
        try {
            const response = await fetch("/api/test-db");
            const data = await response.json();
            setTestResult(`Success: ${JSON.stringify(data)}`);
        } catch (error) {
            setTestResult(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Public Test Page</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Frontend Test</h2>
                    <p className="text-gray-600 mb-4">
                        This page tests basic frontend functionality without authentication.
                    </p>
                    
                    <button
                        onClick={testAPI}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Test API Connection
                    </button>
                    
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Test Result:</h3>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                            {testResult}
                        </pre>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
                    <ul className="space-y-2 text-gray-600">
                        <li>✅ React is working</li>
                        <li>✅ Next.js is working</li>
                        <li>✅ Tailwind CSS is working</li>
                        <li>✅ Page routing is working</li>
                        <li>⏳ API connection: Click button to test</li>
                    </ul>
                </div>
                
                <div className="mt-6 text-center">
                    <a href="/login" className="text-blue-500 hover:underline">
                        Go to Login Page →
                    </a>
                </div>
            </div>
        </div>
    );
}
