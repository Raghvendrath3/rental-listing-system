'use client';

import ListingForm from '@/components/forms/ListingForm';

export default function NewListingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
        <p className="text-gray-600 mt-2">Fill in the details below to create a new rental listing</p>
      </div>
      <ListingForm />
    </div>
  );
}
