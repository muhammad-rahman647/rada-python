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

exports.getUserForget = (req, res) =>
   res.render('user/forgot-password', {
      pageTitle: 'Forgot Password',
   });