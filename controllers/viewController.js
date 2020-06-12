exports.getAdminLogin = (req, res) =>
   res.render('admin/login', {
      pageTitle: 'Admin Login',
      bg_color: 'bg-gradient-primary'
   });

exports.getAdminForget = (req, res) =>
   res.render('admin/forgot-password', {
      pageTitle: 'Forgot Password',
      bg_color: 'bg-gradient-primary'
   });

exports.getAdminDashboard = (req, res) => {
   let email = req.session.passport.user.details.email
   return res.render('admin/dashboard', {
      pageTitle: 'Dashboard',
      bg_color: '',
      email: email
   });
};

exports.getUserLogin = (req, res) =>
   res.render('user/login', {
      pageTitle: 'User login',
      bg_color: 'bg-gradient-primary'
   });

exports.getUserDashboard = (req, res) => {
   return res.render('user/dashboard', {
      pageTitle: 'Dashboard',
      bg_color: '',
      email: req.user.email
   });
};

exports.getAddUser = (req, res) => {
   return res.render('admin/add-user', {
      pageTitle: 'Add User',
      bg_color: '',
      email: req.user.email,
      _admin: req.user._id,
      hasError: false
   });
}

exports.getUserForget = (req, res) =>
   res.render('user/forgot-password', {
      pageTitle: 'Forgot Password',
      bg_color: 'bg-gradient-primary'
   });

exports.getUserReset = (req, res) =>
   res.render('user/reset-password', {
      pageTitle: 'Reset Password',
      bg_color: 'bg-gradient-primary'
   });