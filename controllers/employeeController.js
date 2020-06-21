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
        temperature: 1,
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
        temperature: 1,
      },
    },
  ]);

  if (attendence.length === 0) {
    req.flash('error_msg', 'selected year or month data not found.');
    return res.redirect('/user/dashboard');
  }

  const newData = attendence.map(el => {
    return {
      ...el,
      employee_name: employee.name
    }
  })

  const attendenceName = 'attendence-' + employee._id + '.csv';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="' + attendenceName + '"'
  );
  fastcsv
    .write(newData, {
      headers: true,
    })
    .pipe(res);

});

exports.getByDate = catchAsync(async (req, res, next) => {
  if (!req.query.date) {
    req.flash('error_msg', 'Please select date');
    return res.redirect('/user/dashboard');
  }
  const year = moment().year();

  const employees = await Attendence.aggregate([{
      $lookup: {
        from: "employees",
        localField: "_employeeId",
        foreignField: "trainId",
        as: "name"
      }
    },
    {
      $project: {
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
        temperature: 1,
        name: {
          $mergeObjects: "$name"
        }
      },
    },
    {
      $match: {
        year: year,
        day: +req.query.date
      },
    },
    {
      $project: {
        _id: 0,
        "name.name": 1,
        time: 1,
        date: 1,
        temperature: 1,
      }
    }
  ]);

  if (employees.length === 0) {
    req.flash('error_msg', 'selected date data not found.');
    return res.redirect('/user/dashboard');
  }

  const changedEmployee = employees.map(el => {
    return {
      ...el,
      name: el.name.name
    }
  });

  const attendence = 'attendence-' + Date.now() + '.csv';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="' + attendence + '"'
  );
  fastcsv
    .write(changedEmployee, {
      headers: true,
    })
    .pipe(res);
});

exports.getCurrentDateAttendence = catchAsync(async (req, res, next) => {
  const year = moment().year();
  const month = moment().month();
  const date = moment().date();

  const employees = await Attendence.aggregate([{
      $lookup: {
        from: "employees",
        localField: "_employeeId",
        foreignField: "trainId",
        as: "name"
      }
    },
    {
      $project: {
        year: {
          $year: '$date',
        },
        day: {
          $dayOfMonth: '$date',
        },
        month: {
          $month: "$date"
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
        temperature: 1,
        name: {
          $mergeObjects: "$name"
        }
      },
    },
    {
      $match: {
        year: year,
        month: month,
        day: date
      },
    },
    {
      $project: {
        _id: 0,
        "name.name": 1,
        time: 1,
        date: 1,
        temperature: 1,
      }
    }
  ]);

  if (employees.length === 0) {
    req.flash('error_msg', 'data not found.');
    return res.redirect('/user/dashboard');
  }

  const changedEmployee = employees.map(el => {
    return {
      ...el,
      name: el.name.name
    }
  });

  const attendence = 'attendence-' + Date.now() + '.csv';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="' + attendence + '"'
  );
  fastcsv
    .write(changedEmployee, {
      headers: true,
    })
    .pipe(res);
});