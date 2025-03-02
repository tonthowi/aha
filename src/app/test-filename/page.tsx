"use client";

import { useState } from 'react';
import { generateSecureFilename } from '@/lib/utils/fileUtils';

export default function TestFilenamePage() {
  const [originalFilename, setOriginalFilename] = useState('example.jpg');
  const [secureFilename, setSecureFilename] = useState('');
  const [isValid, setIsValid] = useState(false);

  const testFilename = () => {
    const generated = generateSecureFilename(originalFilename);
    setSecureFilename(generated);
    
    // Test against the pattern used in firebaseUtils.ts
    const secureFilenamePattern = /^\d+_[a-z0-9]+\.[a-z0-9]+$/i;
    setIsValid(secureFilenamePattern.test(generated));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Filename Format Test</h1>
      
      <div className="mb-6">
        <p className="mb-2">
          This page tests the secure filename generation to ensure it matches the expected pattern.
        </p>
        <p className="mb-4 text-sm text-gray-600">
          Expected pattern: timestamp_randomstring.extension
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Original Filename</label>
        <input
          type="text"
          value={originalFilename}
          onChange={(e) => setOriginalFilename(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        onClick={testFilename}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
      >
        Generate & Test Filename
      </button>
      
      {secureFilename && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p><strong>Generated Secure Filename:</strong> {secureFilename}</p>
          <p className="mt-2">
            <strong>Validation Result:</strong> 
            <span className={isValid ? "text-green-600" : "text-red-600"}>
              {isValid ? "Valid" : "Invalid"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
} 