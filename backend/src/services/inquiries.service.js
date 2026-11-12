const inquiriesRepository = require('../repositories/inquiries.repository');
const { findById } = require('../repositories/owner.repository');
const AppError = require('../errors/AppErrors');

async function createInquiry(actor, data) {
  const { listingId, message } = data;

  // 1. Service Layer validation & role checks
  if (actor.role !== 'user') {
    throw new AppError('Only standard users (tenants) can create inquiries', 403);
  }

  const parsedListingId = Number(listingId);
  if (isNaN(parsedListingId) || parsedListingId <= 0) {
    throw new AppError('Invalid Listing ID', 400);
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new AppError('Inquiry message is required', 400);
  }

  // 2. Fetch the listing
  const listing = await findById(parsedListingId, actor.role);
  if (!listing) {
    throw new AppError('Listing does not exist', 404);
  }

  // 3. Service Layer re-validation before DB write
  // - Listing must be published
  if (listing.status !== 'published') {
    throw new AppError('Inquiries can only be made on published listings', 400);
  }

  // - Tenant cannot be the owner of the listing
  if (listing.owner_id === actor.id) {
    throw new AppError('You cannot send an inquiry on your own listing', 400);
  }

  const result = await inquiriesRepository.createInquiry(actor.id, parsedListingId, message.trim());
  return result;
}

async function getTenantInquiries(actor) {
  if (actor.role !== 'user') {
    throw new AppError('Only tenants can view their inquiries', 403);
  }
  const result = await inquiriesRepository.findInquiriesByTenantId(actor.id);
  return result;
}

async function getOwnerInquiries(actor) {
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    throw new AppError('Only owners can view received inquiries', 403);
  }
  const result = await inquiriesRepository.findInquiriesByOwnerId(actor.id);
  return result;
}

module.exports = {
  createInquiry,
  getTenantInquiries,
  getOwnerInquiries
};
