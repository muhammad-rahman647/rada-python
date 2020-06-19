const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const catchAsync = require('../utils/catchAsync');

const Employee = require('../models/employee');
const Attendence = require('../models/attendence');

exports.check = (req, res, next) => {

   if (!req.query.month || !req.query.year) {
      req.flash('error_msg', 'Please select month or date');
      return res.redirect('/user/dashboard');
   }
   next();
}

exports.attendence = catchAsync(async (req, res, next) => {

   const employee = await Employee.findById(req.params.id);

   if (!employee) {
      req.flash('error_msg', 'No document found this ID');
      return res.redirect('/user/dashboard');
   }

   const attendence = await Attendence.aggregate([{
         $match: {
            _employeeId: employee.trainId
         }
      },
      {
         $project: {
            month: {
               $month: "$date"
            },
            year: {
               $year: "$date"
            },
            date: 1
         }
      },
      {
         $match: {
            month: +req.query.month,
            year: +req.query.year
         }
      }
   ]);

   if (attendence.length === 0) {
      req.flash('error_msg', 'selected year or month data not found.');
      return res.redirect('/user/dashboard');
   }

   const attendenceName = 'attendence-' + employee._id + '.pdf';
   const invoicePath = path.join('data', 'attendences', attendenceName);

   const pdfDoc = new PDFDocument();
   res.setHeader('Content-Type', 'application/pdf');
   res.setHeader(
      'Content-Disposition',
      'inline; filename="' + attendenceName + '"'
   );
   pdfDoc.pipe(fs.createWriteStream(invoicePath));
   pdfDoc.pipe(res);

   pdfDoc.fontSize(26).text('Attendence', {
      underline: true,
   });
   pdfDoc.text('-----------------------');
   pdfDoc.fontSize(24).text('Employee Details');
   pdfDoc.text('-----------------------');

   pdfDoc.fontSize(22).text(`name ${employee.name}`);
   pdfDoc.text('-----------------------');

   pdfDoc.fontSize(24).text('Attendence Details');

   attendence.forEach((atten) => {
      pdfDoc
         .fontSize(16)
         .text(
            employee.name +
            ' ---- ' +
            atten.date
         );
   });

   pdfDoc.end();

   // res.status(200).json({
   //    status: 'success',
   //    data: {
   //       employee,
   //       attendence
   //    }
   // });
});