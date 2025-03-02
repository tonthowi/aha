import { useState, useRef, ChangeEvent } from 'react';
import { validateFile, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/utils/fileUtils';
import { uploadFile } from '@/lib/firebase/firebaseUtils';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import { validateMinimumWords } from '@/lib/middleware/validateContent';

export const SecurityTest: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<{
    clientSide: boolean;
    serverSide: boolean;
  }>({
    clientSide: false,
    serverSide: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Test client-side validation
  const testClientSideValidation = () => {
    setError(null);
    
    // Test content validation
    const contentValid = validateMinimumWords(content);
    
    // Test file validation
    let fileValid = false;
    if (file) {
      const validation = validateFile(file, {
        maxSize: MAX_FILE_SIZE,
        allowedTypes: ALLOWED_IMAGE_TYPES,
      });
      fileValid = validation.valid;
      
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
      }
    }
    
    setValidationResults({
      ...validationResults,
      clientSide: contentValid && (file ? fileValid : true)
    });
    
    if (contentValid) {
      toast.success('Client-side content validation passed');
    } else {
      toast.error('Client-side content validation failed');
    }
    
    if (file) {
      if (fileValid) {
        toast.success('Client-side file validation passed');
      } else {
        toast.error('Client-side file validation failed');
      }
    }
  };
  
  // Test server-side validation
  const testServerSideValidation = async () => {
    if (!file && content.trim() === '') {
      setError('Please provide a file or content to test');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setUploadResult(null);
    
    try {
      // Test server-side validation
      let serverSideValid = true;
      
      // Test file upload if a file is selected
      if (file) {
        try {
          // Handle SVG files specifically
          let contentType = file.type;
          if (file.type === 'image/svg+xml') {
            // Ensure content type is correctly set for SVG files
            contentType = 'image/svg+xml';
          }
          
          // Attempt to upload an invalid file (bypass client validation)
          const path = `test/security/${Date.now()}_test.${file.name.split('.').pop()}`;
          const metadata = { 
            // Missing userId to test server-side validation
            contentType: contentType,
            isTest: true
          };
          
          await uploadFile(file, path, metadata);
          
          // If we get here, server-side validation failed
          serverSideValid = false;
          toast.error('Server-side validation failed to catch missing userId');
        } catch (error) {
          // Expected error - server-side validation worked
          console.log('Expected error (good):', error);
          toast.success('Server-side validation correctly blocked invalid upload');
        }
      }
      
      setValidationResults({
        ...validationResults,
        serverSide: serverSideValid
      });
      
    } catch (error) {
      console.error('Test error:', error);
      setError(error instanceof Error ? error.message : 'Test failed');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadResult(null);
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setFile(files[0]);
  };
  
  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Security Validation Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          This component tests both client-side and server-side validation.
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Content (for word count validation)</label>
        <textarea
          value={content}
          onChange={handleContentChange}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Enter at least 3 words to pass validation"
        />
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Select File
        </button>
      </div>
      
      {file && (
        <div className="mb-4 p-2 bg-gray-100 rounded">
          <p><strong>Selected file:</strong> {file.name}</p>
          <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          <p><strong>Type:</strong> {file.type}</p>
        </div>
      )}
      
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={testClientSideValidation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Client-Side Validation
        </button>
        
        <button
          type="button"
          onClick={testServerSideValidation}
          disabled={isUploading}
          className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Testing...' : 'Test Server-Side Validation'}
        </button>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Validation Results:</h3>
        <div className="p-2 bg-gray-100 rounded">
          <p>
            <span className="font-medium">Client-side validation:</span> 
            <span className={validationResults.clientSide ? 'text-green-600' : 'text-red-600'}>
              {validationResults.clientSide ? 'Passed' : 'Not tested or failed'}
            </span>
          </p>
          <p>
            <span className="font-medium">Server-side validation:</span> 
            <span className={validationResults.serverSide ? 'text-green-600' : 'text-red-600'}>
              {validationResults.serverSide ? 'Passed' : 'Not tested or failed'}
            </span>
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
    </div>
  );
}; 