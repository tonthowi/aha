"use client";

import { SecurityTest } from '@/components/SecurityTest';

export default function SecurityTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Security Validation Test Page</h1>
      <p className="mb-6 text-gray-600">
        This page tests the security measures implemented to prevent client-side validation bypass.
      </p>
      <SecurityTest />
    </div>
  );
}