const fs = require('fs');
const util = require('util');
const directoryCreator = util.promisify(fs.exists);
const {
   spawn
} = require('child_process');
const crypto = require('crypto');
const sharp = require('sharp');

const User = require('../models/user');
const Employee = require('../models/employee');
const factory = require('./factory');
const catchAsync = require('../utils/catchAsync');
const {
   exist
} = require('@hapi/joi');

const EMPLOYEES_PER_PAGE = 50;

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
         companyName: req.user.companyName,
         path: '/user/dashboard',
         pathLink: '/user/add-Employee',
         name: 'Employee',
         groupType: req.user.name,
         link: '/user/employees',
         employees: employees,
      });
   } catch (error) {
      next(error);
   }
};

exports.getUserAllEmployees = async (req, res, next) => {
   const page = +req.query.page || 1;
   let totalItems;

   Employee.countDocuments()
      .then((countEmployees) => {
         totalItems = countEmployees;
         return Employee.find({
               _user: req.user._id,
            })
            .skip((page - 1) * EMPLOYEES_PER_PAGE)
            .limit(EMPLOYEES_PER_PAGE);
      })
      .then((employees) => {
         res.render('user/employees', {
            pageTitle: 'Dashboard',
            email: req.user.email,
            path: '/user/dashboard',
            companyName: req.user.companyName,
            pathLink: '/user/add-Employee',
            name: 'Employee',
            groupType: req.user.name,
            link: '/user/employees',
            employees: employees,
            currentPage: page,
            hasNextPage: EMPLOYEES_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1 ? true : false,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / EMPLOYEES_PER_PAGE),
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
      groupType: req.user.name,
      link: '/user/employees',
      _user: req.user._id,
      _userId: req.user.userId,
   });
};

exports.verifyName = async (req, res, next) => {
   try {
      const employee = await Employee.findOne({
         name: req.body.name,
      });
      if (employee) {
         return res.render('user/add-employee', {
            pageTitle: 'Adding Employee',
            email: req.user.email,
            path: '/user/dashboard',
            pathLink: '/user/add-Employee',
            name: 'Employee',
            hasError: true,
            name: req.body.name,
            groupType: req.user.name,
            link: '/user/employees',
            _user: req.user._id,
            _userId: req.user.userId,
            error_msg: 'name is already in use please another name...',
         });
      }
      next();
   } catch (error) {
      next(error);
   }
};

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
         groupType: req.user.name,
         link: '/user/employees',
         _user: req.user._id,
         _userId: req.user.userId,
         error_msg: 'Please provide an images or name....',
      });
   }
   next();
};

exports.createEmployee = async (req, res, next) => {
   let trainId = '';
   const randomDir = Date.now();
   const dir = `images/${randomDir}`;
   req.body.photos = [];
   req.body.dir = dir;

   directoryCreator(dir).then((exist) => {
      if (!exist) {
         fs.mkdir(dir, (err) => console.log(err));
      }
   });

   await Promise.all(
      req.files.map(async (file, i) => {
         const filename = `employee-${Date.now()}-${i + 1}.jpeg`;

         await sharp(file.buffer)
            .toFormat('jpeg')
            .jpeg({
               quality: 100,
            })
            .toFile(`${dir}/${filename}`);

         req.body.photos.push(filename);
      })
   );

   const newEmployee = new Employee(req.body);

   if (!newEmployee) {
      const error = new Error(
         'Something is going wrong please try age later....'
      );
      return next(error);
   }

   const python = spawn('python', [
      'train.py',
      `${req.body._userId}`,
      `${req.body.name}`,
      `./${req.body.dir}`,
   ]);

   python.stdout.on('data', function (data) {
      console.log('Pipe data from python script ...');
      trainId = data.toString();
   });

   python.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);

      if (code === 1) {
         const error = new Error('Something wrong...');
         error.statusCode = 500;
         return next(error);
      }

      // send data to browse;
      newEmployee.trainId = trainId.trim();
      newEmployee.save().then(() => {
         req.flash('success_msg', 'Successfully Added.....');
         return res.redirect('/user/add-Employee');
      });
   });
};

exports.createUser = async (req, res, next) => {
   const {
      email,
      name,
      password,
      companyName
   } = req.body;
   try {
      const findOne = await User.findOne({
         email,
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
               companyName: req.body.companyName,
            },
            error_msg: 'Please add another email its already resgistered....',
         });
      }
      const user = new User({
         email,
         name,
         password,
         companyName,
         _admin: req.body._admin,
      });

      user.userId = 'rada' + user._id;

      await user.save();

      if (!user) {
         res.render('admin/add-user', {});
      }

      req.flash('success_msg', 'Successfully Added.....');
      res.redirect('/admin/dashboard');
   } catch (error) {
      next(error);
   }
};

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
            $gt: Date.now(),
         },
      });

      if (!user) {
         return res.render('user/reset-password', {
            pageTitle: 'Reset Password',
            userId: '',
            error_msg: 'Token is not verified....',
            resetToken: '',
         });
      }
      res.status(200).render('user/reset-password', {
         pageTitle: 'Reset Password',
         userId: user._id,
         resetToken: hashedToken,
      });
   } catch (error) {
      console.log(error);
      next(error);
   }
};

exports.resetPassword = factory.resetPasswordOne(
   User,
   'user/reset-password',
   '/user/login'
);