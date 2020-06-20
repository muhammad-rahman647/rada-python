const fs = require('fs');
const path = require('path');
const fastcsv = require('fast-csv');
const catchAsync = require('../utils/catchAsync');

const Employee = require('../models/employee');
const Attendence = require('../models/attendence');

exports.check = (req, res, next) => {
  if (!req.query.month || !req.query.year) {
    req.flash('error_msg', 'Please select month or date');
    return res.redirect('/user/dashboard');
  }
  next();
};

exports.attendence = catchAsync(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    req.flash('error_msg', 'No document found this ID');
    return res.redirect('/user/dashboard');
  }

  const attendence = await Attendence.aggregate([{
      $match: {
        _employeeId: employee.trainId,
      },
    },
    {
      $project: {
        month: {
          $month: '$date',
        },
        year: {
          $year: '$date',
        },
        day: {
          $dayOfMonth: '$date',
        },
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date',
            timezone: '+05:00',
          },
        },
        time: {
          $dateToString: {
            format: '%H:%M:%S:%L%z',
            date: '$date',
            timezone: '+05:00',
          },
        },
      },
    },
    {
      $match: {
        month: +req.query.month,
        year: +req.query.year,
      },
    },
    {
      $project: {
        date: 1,
        time: 1,
      },
    },
  ]);

  if (attendence.length === 0) {
    req.flash('error_msg', 'selected year or month data not found.');
    return res.redirect('/user/dashboard');
  }

  const attendenceName = 'attendence-' + employee._id + '.csv';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="' + attendenceName + '"'
  );
  fastcsv.write(attendence, {
    headers: true
  }).pipe(res);

  // res.status(200).json({
  //    status: 'success',
  //    data: {
  //       employee,
  //       attendence
  //    }
  // });
});