const { postUsersService, loginService, becomeOwnerService, getUserProfileService, updateUserProfileService, getAllUsersService, updateUserRoleService, deleteUserService } = require('../services/users.service');

async function postUsers(req, res, next){
  try {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
    }
    console.log(newUser);
    const user = await postUsersService(newUser);
    const result = {
      email: user.email,
      id: user.id,
      role: user.role,
      created_at: user.created_at
    }
    res.status(201).json({
      status: 'success',
      data: result
    });
  }catch (error) {
    next(error);
  }
}

async function userLogin(req, res, next){
  const loginDetails = {
    email: req.body.email,
    password: req.body.password
  }
  try {
    const user = await loginService(loginDetails);
    res.status(200).json({
      status: 'success',
      token: user
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
    const result = await becomeOwnerService(actor);
    res.status(200).json({
      status: 'success',
      message: `User with email ${result.email} has been promoted to owner.`
    })
  } catch (error) {
    next(error);
  }
}

async function getUserProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await getUserProfileService(userId);
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    const updatedUser = await updateUserProfileService(userId, updateData);
    res.status(200).json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const role = req.query.role || null;
    const search = req.query.search || null;

    const result = await getAllUsersService(page, limit, role, search);

    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        status: 'error',
        message: 'Role is required'
      });
    }

    const updatedUser = await updateUserRoleService(userId, role);

    res.status(200).json({
      status: 'success',
      message: `User role updated to ${role}`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = req.params.id;
    const deletedUser = await deleteUserService(userId);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: deletedUser
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  postUsers,
  userLogin,
  becomeOwner,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  deleteUser
};
