'use client';

import React, { useState } from 'react';

export default function TestDebugPage() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('🚀 Test button clicked!');
    setCount(count + 1);
  };

  const handleAPI = async () => {
    console.log('🚀 Testing API call...');
    try {
      const response = await fetch('http://localhost:8080/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('🚀 API Response:', response);
    } catch (error) {
      console.error('❌ API Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Debug Test Page</h1>
        
        <div className="space-y-4">
          <div>
            <p>Count: {count}</p>
            <button 
              onClick={handleClick}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Button (Click me)
            </button>
          </div>
          
          <div>
            <button 
              onClick={handleAPI}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test API Call
            </button>
          </div>
          
          <div>
            <button 
              onClick={() => {
                console.log('🚀 Direct console test');
                alert('Direct test - check console');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Direct Console Test
            </button>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="text-sm space-y-1">
            <li>1. Open browser console (F12)</li>
            <li>2. Click the buttons above</li>
            <li>3. Check if console logs appear</li>
            <li>4. If no logs appear, there&apos;s a JavaScript error</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
