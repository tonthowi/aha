"use client";

import { FileUploadTest } from '@/components/FileUploadTest';

export default function TestUploadPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">File Upload Security Test Page</h1>
      <FileUploadTest />
    </div>
  );
} 