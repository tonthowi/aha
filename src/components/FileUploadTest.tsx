import { useState, useRef, ChangeEvent } from 'react';
import { validateFile, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/utils/fileUtils';
import { uploadFile } from '@/lib/firebase/firebaseUtils';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';

export const FileUploadTest: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadResult(null);
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const selectedFile = files[0];
    
    // Validate file
    const validation = validateFile(selectedFile, {
      maxSize: MAX_FILE_SIZE,
      allowedTypes: ALLOWED_IMAGE_TYPES,
    });
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('No file selected');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setUploadResult(null);
    
    try {
      // Test upload
      const path = `test/uploads/${Date.now()}_${file.name}`;
      const metadata = { 
        userId: user?.uid || 'anonymous',
        contentType: file.type,
        originalFilename: file.name,
        isTest: true
      };
      
      const url = await uploadFile(file, path, metadata);
      setUploadResult(url);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">File Upload Security Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Max file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
        </p>
        <p className="text-sm text-gray-600 mb-2">
          Allowed types: {ALLOWED_IMAGE_TYPES.map(t => t.replace('image/', '')).join(', ')}
        </p>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Select File
        </button>
        
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            !file || isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Uploading...' : 'Test Upload'}
        </button>
      </div>
      
      {file && (
        <div className="mb-4 p-2 bg-gray-100 rounded">
          <p><strong>Selected file:</strong> {file.name}</p>
          <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          <p><strong>Type:</strong> {file.type}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {uploadResult && (
        <div className="mb-4">
          <p><strong>Upload successful!</strong></p>
          <p className="text-sm text-gray-600 break-all">{uploadResult}</p>
          <div className="mt-2 max-w-xs">
            <img 
              src={uploadResult} 
              alt="Uploaded file" 
              className="max-w-full h-auto rounded border"
            />
          </div>
        </div>
      )}
    </div>
  );
}; 