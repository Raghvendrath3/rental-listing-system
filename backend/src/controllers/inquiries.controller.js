const inquiriesService = require('../services/inquiries.service');

async function postInquiry(req, res, next) {
  try {
    const actor = {
      id: req.user.id,
      role: req.user.role
    };
    const data = {
      listingId: req.body.listing_id,
      message: req.body.message
    };
    const result = await inquiriesService.createInquiry(actor, data);
    res.status(201).json({
      status: 'success',
      message: 'Inquiry sent successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getInquiries(req, res, next) {
  try {
    const actor = {
      id: req.user.id,
      role: req.user.role
    };
    const result = await inquiriesService.getTenantInquiries(actor);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getOwnerInquiries(req, res, next) {
  try {
    const actor = {
      id: req.user.id,
      role: req.user.role
    };
    const result = await inquiriesService.getOwnerInquiries(actor);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  postInquiry,
  getInquiries,
  getOwnerInquiries
};
