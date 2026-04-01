const { postUsersService, loginService, becomeOwnerService } = require('../services/users.service');

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

module.exports = {
  postUsers,
  userLogin,
  becomeOwner
};