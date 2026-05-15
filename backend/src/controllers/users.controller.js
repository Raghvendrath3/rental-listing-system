const { postUsersService, loginService } = require('../services/users.service');
const { submitOwnerRequestService, getUserOwnerRequestStatus } = require('../services/requests.service');

async function postUsers(req, res, next) {
  try {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
    };
    const user = await postUsersService(newUser);
    const result = {
      email: user.email,
      id: user.id,
      role: user.role,
      created_at: user.created_at
    };
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    // Fix: PostgreSQL unique violation (code 23505) was bubbling as unhandled 500
    if (error.code === '23505') {
      return res.status(409).json({ status: 'fail', message: 'Email already in use' });
    }
    next(error);
  }
}

async function userLogin(req, res, next) {
  const loginDetails = {
    email: req.body.email,
    password: req.body.password
  };
  try {
    const { token, id, role } = await loginService(loginDetails); // Fix: loginService now returns object not pipe-string
    res.status(200).json({
      status: 'success',
      token,
      data: { id, role }
    });
  } catch (error) {
    next(error);
  }
}

async function becomeOwner(req, res, next) {
  try {
    const actor = {
      id: req.user.id,
      role: req.user.role
    };
    const result = await submitOwnerRequestService(actor);
    res.status(201).json({
      status: 'success',
      message: 'Owner request submitted successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getOwnerStatus(req, res, next) {
  try {
    const result = await getUserOwnerRequestStatus(req.user.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  postUsers,
  userLogin,
  becomeOwner,
  getOwnerStatus
};