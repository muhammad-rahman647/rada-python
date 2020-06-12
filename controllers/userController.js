const User = require('../models/user');

exports.createUser = async (req, res, next) => {
   const {
      email,
      password,
      companyName,
      _admin
   } = req.body;
   try {
      const findOne = await User.findOne({
         email: email
      });
      if (findOne) {
         return res.render('admin/add-user', {
            pageTitle: 'Add User',
            bg_color: '',
            email: req.user.email,
            _admin: req.user._id,
            hasError: true,
            user: {
               email: req.body.name,
               password: req.body.password,
               companyName: req.body.companyName
            },
            error_msg: 'Please add another email its already resgistered....'
         });
      }
      const user = new User({
         email,
         password,
         companyName,
         _admin: req.body._admin
      });

      await user.save();

      console.log(user);

      if (!user) {
         res.render('admin/add-user', {});
      }

      res.redirect('/admin/add-user');
      req.flash(
         'success_msg',
         'Successfully Added.....'
      );

   } catch (error) {
      console.log(error);
   }
}