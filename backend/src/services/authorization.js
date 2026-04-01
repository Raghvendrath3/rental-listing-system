const AppError = require('../errors/AppErrors');

function assertOwnerOrAdmin(resource, actor, resourceName = 'resource') {
  if (actor.role === 'admin') return;

  if (resource.owner_id !== actor.id) {
    throw new AppError(`You do not own this ${resourceName}`, 403);
  }
}

function assertRole(actor, allowedRoles) {
  if (!allowedRoles.includes(actor.role)) {
    throw new AppError('Forbidden', 403);
  }
}

module.exports = {
  assertOwnerOrAdmin,
  assertRole
};
