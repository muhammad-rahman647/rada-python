const User = require('../models/user');

const USERS_PER_PAGE = 50;

exports.getAdminDashboard = async (req, res, next) => {
  try {
    const users = await User.find({
      _admin: req.user._id,
    }).populate('employees').limit(20);

    if (!users) {
      const error = new Error('Something gone wrong...');
      next(error);
    }

    return res.render('admin/dashboard', {
      pageTitle: 'Dashboard',
      email: req.user.email,
      users: users,
      path: '/admin/dashboard',
      pathLink: '/admin/add-users',
      name: 'Users',
      groupType: 'Admin',
      link: '/admin/users',
    });
  } catch (error) {
    next(error);
  }
};

exports.getAddUser = (req, res) => {
  return res.render('admin/add-user', {
    pageTitle: 'Add User',
    email: req.user.email,
    _admin: req.user._id,
    hasError: false,
    path: '/admin/dashboard',
    pathLink: '/admin/add-users',
    name: 'Users',
    groupType: 'Admin',
    link: '/admin/users',
  });
};

exports.getAdminAllUsers = async (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  User.countDocuments()
    .then((countUser) => {
      totalItems = countUser;

      return User.find({
          _admin: req.user._id,
        }).populate('employees')
        .skip((page - 1) * USERS_PER_PAGE)
        .limit(USERS_PER_PAGE);
    })
    .then((users) => {
      res.render('admin/users', {
        pageTitle: 'Dashboard',
        email: req.user.email,
        path: '/admin/dashboard',
        pathLink: '/admin/add-users',
        name: 'Users',
        groupType: 'Admin',
        link: '/admin/users',
        users: users,
        currentPage: page,
        hasNextPage: USERS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1 ? true : false,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / USERS_PER_PAGE)
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};