"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        
        const fetchData = async () => {
            try {
                console.log("Fetching data...");
                const res = await fetch("/api/dashboard/portfolio");
                console.log("Response status:", res.status);
                
                if (res.ok) {
                    const json = await res.json();
                    console.log("Data received:", json);
                    setData(json);
                } else {
                    const errorText = await res.text();
                    console.error("API error:", errorText);
                    setError(`API Error: ${res.status} - ${errorText}`);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setError(error instanceof Error ? error.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isClient]);

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Test Page - Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Test Page - API Connection</h1>
                
                {loading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-800">Loading...</p>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-800 font-semibold">Error:</p>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}
                
                {data && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-green-800 font-semibold">Success!</p>
                        <p className="text-green-600">API returned {data.rows?.length || 0} projects</p>
                        <pre className="mt-4 text-xs bg-white p-2 rounded border overflow-auto max-h-64">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
                
                <div className="bg-gray-100 rounded-lg p-4">
                    <h2 className="font-semibold mb-2">Environment Info:</h2>
                    <p>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
                    <p>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR'}</p>
                    <p>Timestamp: {new Date().toISOString()}</p>
                </div>
            </div>
        </div>
    );
}
