const crypto = require('crypto');
const multer = require('multer');

const User = require('../models/user');
const Employee = require('../models/employee');
const factory = require('./factory');

const EMPLOYEES_PER_PAGE = 10;

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'images')
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
   }
});

const fileFilter = (req, file, cb) => {
   if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
   ) {
      cb(null, true);
   } else {
      cb(null, false);
   }
};


const upload = multer({
   storage: storage,
   fileFilter: fileFilter
});

exports.uploadOne = upload.array('photos', 3);

exports.getUserDashboard = async (req, res, next) => {
   try {
      const employees = await Employee.find({
         _user: req.user._id,
      }).limit(20);

      if (!employees) {
         const error = new Error('Something gone wrong...');
         next(error);
      }
      return res.render('user/dashboard', {
         pageTitle: 'Dashboard',
         email: req.user.email,
         path: '/user/dashboard',
         pathLink: '/user/add-Employee',
         name: 'Employee',
         groupType: 'User',
         link: '/user/employees',
         employees: employees
      });
   } catch (error) {
      next(error);
   }
};

exports.getUserAllEmployees = async (req, res, next) => {
   const page = +req.query.page || 1;
   let totalItems;

   Employee.countDocuments().then(countEmployees => {
         totalItems = countEmployees;
         return Employee.find({
               _user: req.user._id,
            })
            .skip((page - 1) * EMPLOYEES_PER_PAGE)
            .limit(EMPLOYEES_PER_PAGE);
      }).then((employees) => {
         res.render('user/employees', {
            pageTitle: 'Dashboard',
            email: req.user.email,
            path: '/user/dashboard',
            pathLink: '/user/add-Employee',
            name: 'Employee',
            groupType: 'User',
            link: '/user/employees',
            employees: employees,
            currentPage: page,
            hasNextPage: EMPLOYEES_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1 ? true : false,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / EMPLOYEES_PER_PAGE)
         });
      })
      .catch((err) => {
         const error = new Error(err);
         error.httpStatusCode = 500;
         return next(error);
      });
};

exports.getAddEmployeeUser = (req, res) => {
   return res.render('user/add-employee', {
      pageTitle: 'Adding Employee',
      email: req.user.email,
      path: '/user/dashboard',
      pathLink: '/user/add-Employee',
      name: 'Employee',
      groupType: 'User',
      link: '/user/employees',
      _user: req.user._id
   });
};

exports.verifyName = async (req, res, next) => {
   console.log(req.body);
   try {
      const employee = await Employee.findOne({
         name: req.body.name
      });
      console.log(employee);
      if (employee) {
         return res.render('user/add-employee', {
            pageTitle: 'Adding Employee',
            email: req.user.email,
            path: '/user/dashboard',
            pathLink: '/user/add-Employee',
            name: 'Employee',
            hasError: true,
            name: req.body.name,
            groupType: 'User',
            link: '/user/employees',
            _user: req.user._id,
            error_msg: 'name is already in use please another name...'
         });
      }
      next();
   } catch (error) {
      next(error);
   }
}

exports.verifyImages = (req, res, next) => {
   if (req.files.length === 0 || !req.body.name) {
      return res.render('user/add-employee', {
         pageTitle: 'Adding Employee',
         email: req.user.email,
         path: '/user/dashboard',
         pathLink: '/user/add-Employee',
         name: 'Employee',
         hasError: true,
         name: req.body.name,
         groupType: 'User',
         link: '/user/employees',
         _user: req.user._id,
         error_msg: 'Please provide an images or name....'
      });
   }
   next();
}

exports.createEmployee = async (req, res, next) => {
   req.body.photos = [];
   req.files.forEach(file => req.body.photos.push(file.filename));
   try {
      const newEmployee = new Employee(req.body);

      await newEmployee.save();

      if (!newEmployee) {
         const error = new Error('Something is going wrong please try age later....');
         return next(error)
      }

      req.flash(
         'success_msg',
         'Successfully Added.....'
      );
      res.redirect('/user/add-Employee');

   } catch (error) {
      next(error);
   }
}

exports.createUser = async (req, res, next) => {
   const {
      email,
      name,
      password,
      companyName,
      _admin
   } = req.body;
   try {
      const findOne = await User.findOne({
         email
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
         name,
         password,
         companyName,
         _admin: req.body._admin
      });

      await user.save();

      if (!user) {
         res.render('admin/add-user', {});
      }

      req.flash(
         'success_msg',
         'Successfully Added.....'
      );
      res.redirect('/admin/dashboard');

   } catch (error) {
      console.log(error);
   }
}

exports.forgotPassword = factory.forgotPasswordOne(User, 'user', 'user');

exports.getUserReset = async (req, res, next) => {
   try {
      const hashedToken = crypto
         .createHash('sha256')
         .update(req.params.token)
         .digest('hex');

      const user = await User.findOne({
         resetPasswordToken: hashedToken,
         resetPasswordExpires: {
            $gt: Date.now()
         },
      });

      if (!user) {
         return res.render('user/reset-password', {
            pageTitle: 'Reset Password',
            userId: '',
            error_msg: 'Token is not verified....',
            resetToken: ''
         });
      }
      res.status(200).render('user/reset-password', {
         pageTitle: 'Reset Password',
         bg_color: 'bg-gradient-primary',
         userId: user._id,
         resetToken: hashedToken
      })
   } catch (error) {
      console.log(error);
      next(error);
   }
};

exports.resetPassword = factory.resetPasswordOne(User, 'user/reset-password', '/user/login');