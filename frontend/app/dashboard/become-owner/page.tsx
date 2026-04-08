'use client';

import { useState, useEffect } from 'react';
import { submitOwnerRequest, checkPendingOwnerRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function BecomeOwnerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user already has a pending request
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await checkPendingOwnerRequest();
        setHasPendingRequest(result.data.has_pending);
      } catch (err) {
        console.error('Error checking pending request:', err);
        // Continue anyway
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, []);

  const handleSubmitRequest = async () => {
    if (hasPendingRequest) {
      setError('You already have a pending owner request. Please wait for admin review.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await submitOwnerRequest();
      setSuccess(true);
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit request';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Checking your status...</p>
        </div>
      </div>
    );
  }

  if (hasPendingRequest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-900 mb-4">Pending Owner Request</h1>
          <p className="text-yellow-700 mb-6">
            You already have a pending owner request. Our admin team will review your request and get back to you soon.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Become an Owner</h1>
        <p className="text-gray-600 mb-8">
          Ready to list your properties? Submit a request to become an owner and start managing your listings.
        </p>

        {/* Benefits Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Owner Benefits</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">✓</span>
              <span className="text-gray-700">Create and manage your own property listings</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">✓</span>
              <span className="text-gray-700">Publish, archive, and update listings anytime</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">✓</span>
              <span className="text-gray-700">Track your listings and manage your portfolio</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">✓</span>
              <span className="text-gray-700">Access owner-only features and analytics</span>
            </li>
          </ul>
        </div>

        {/* Responsibilities Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Responsibilities</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-gray-500 font-bold mr-3">•</span>
              <span className="text-gray-700">Maintain accurate and up-to-date property information</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 font-bold mr-3">•</span>
              <span className="text-gray-700">Follow all platform guidelines and policies</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 font-bold mr-3">•</span>
              <span className="text-gray-700">Respond promptly to inquiries and communication</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 font-bold mr-3">•</span>
              <span className="text-gray-700">Ensure compliance with local rental laws and regulations</span>
            </li>
          </ul>
        </div>

        {/* Process Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next</h2>
          <ol className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-3">1</span>
              <span className="text-gray-700">Submit your owner request below</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-3">2</span>
              <span className="text-gray-700">Our admin team will review your request</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-3">3</span>
              <span className="text-gray-700">You&apos;ll be notified once approved</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-3">4</span>
              <span className="text-gray-700">Start creating listings immediately</span>
            </li>
          </ol>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">
              Request submitted successfully! Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmitRequest}
            disabled={isLoading || success}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Submitting...' : 'Submit Request to Become Owner'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>

        {/* Note */}
        <p className="text-sm text-gray-500 mt-6 text-center">
          By submitting this request, you agree to our Terms of Service and Owner Agreement
        </p>
      </div>
    </div>
  );
}
