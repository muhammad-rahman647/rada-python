const moment = require('moment');
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
      $lookup: {
        from: 'employees',
        localField: '_employeeId',
        foreignField: 'trainId',
        as: 'name',
      }
    },
    {
      $unwind: "$checkInTime"
    },
    {
      $unwind: "$checkOutTime"
    },
    {
      $project: {
        month: {
          $month: '$date',
        },
        year: {
          $year: '$date',
        },
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date',
            timezone: '+05:00',
          },
        },
        inTime: {
          $dateToString: {
            format: '%H:%M:%S:%L%z',
            date: '$checkInTime.time',
            timezone: '+05:00',
          },
        },
        outTime: {
          $dateToString: {
            format: '%H:%M:%S:%L%z',
            date: '$checkOutTime.time',
            timezone: '+05:00',
          },
        },
        inTemperature: "$checkInTime.temperature",
        outTemperature: "$checkOutTime.temperature",
        name: {
          $mergeObjects: '$name',
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
        inTemperature: 1,
        outTemperature: 1,
        inTime: 1,
        outTime: 1,
        name: "$name.name",
      },
    }
  ]);

  if (attendence.length === 0) {
    req.flash('error_msg', 'selected year or month data not found.');
    return res.redirect('/user/dashboard');
  }

  attendence.push({
    total_attendence: attendence.length
  });

  const attendenceName = 'attendence-' + employee._id + '.csv';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="' + attendenceName + '"'
  );
  fastcsv
    .write(attendence, {
      headers: true,
    })
    .pipe(res);
});

exports.getByDate = catchAsync(async (req, res, next) => {
  if (!req.query.date) {
    req.flash('error_msg', 'Please select date');
    return res.redirect('/user/dashboard');
  }
  const momentObj = moment(`${req.query.date}`);

  const year = momentObj.year();
  const month = momentObj.month() + 1;
  const day = momentObj.date();

  const employees = await Attendence.aggregate([{
      $lookup: {
        from: 'employees',
        localField: '_employeeId',
        foreignField: 'trainId',
        as: 'name',
      }
    },
    {
      $unwind: "$checkInTime"
    },
    {
      $unwind: "$checkOutTime"
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
          $dayOfMonth: "$date"
        },
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date',
            timezone: '+05:00',
          },
        },
        inTime: {
          $dateToString: {
            format: '%H:%M:%S:%L%z',
            date: '$checkInTime.time',
            timezone: '+05:00',
          },
        },
        outTime: {
          $dateToString: {
            format: '%H:%M:%S:%L%z',
            date: '$checkOutTime.time',
            timezone: '+05:00',
          },
        },
        inTemperature: "$checkInTime.temperature",
        outTemperature: "$checkOutTime.temperature",
        name: {
          $mergeObjects: '$name',
        },
      },
    },
    {
      $match: {
        month: +month,
        year: +year,
        day: +day
      },
    },
    {
      $project: {
        date: 1,
        inTemperature: 1,
        outTemperature: 1,
        inTime: 1,
        outTime: 1,
        name: "$name.name"
      },
    },
  ]);

  if (employees.length === 0) {
    req.flash('error_msg', 'selected date data not found.');
    return res.redirect('/user/dashboard');
  }

  const attendence = 'attendence-' + Date.now() + '.csv';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'inline; filename="' + attendence + '"');
  fastcsv
    .write(employees, {
      headers: true,
    })
    .pipe(res);
});

exports.getCurrentDateAttendence = catchAsync(async (req, res, next) => {
  const year = moment().year();
  const month = moment().month() + 1;
  const date = moment().date();

  const employees = await Attendence.aggregate([{
      $lookup: {
        from: 'employees',
        localField: '_employeeId',
        foreignField: 'trainId',
        as: 'name',
      }
    },
    {
      $unwind: "$checkInTime"
    },
    {
      $unwind: "$checkOutTime"
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
          $dayOfMonth: "$date"
        },
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date',
            timezone: '+05:00',
          },
        },
        inTime: {
          $dateToString: {
            format: '%H:%M:%S:%L%z',
            date: '$checkInTime.time',
            timezone: '+05:00',
          },
        },
        outTime: {
          $dateToString: {
            format: '%H:%M:%S:%L%z',
            date: '$checkOutTime.time',
            timezone: '+05:00',
          },
        },
        inTemperature: "$checkInTime.temperature",
        outTemperature: "$checkOutTime.temperature",
        name: {
          $mergeObjects: '$name',
        },
      },
    },
    {
      $match: {
        month: +month,
        year: +year,
        day: +date
      },
    },
    {
      $project: {
        date: 1,
        inTemperature: 1,
        outTemperature: 1,
        inTime: 1,
        outTime: 1,
        name: "$name.name"
      },
    },
  ]);


  if (employees.length === 0) {
    req.flash('error_msg', 'data not found.');
    return res.redirect('/user/dashboard');
  }

  const attendence = 'attendence-' + Date.now() + '.csv';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'inline; filename="' + attendence + '"');
  fastcsv
    .write(employees, {
      headers: true,
    })
    .pipe(res);
});