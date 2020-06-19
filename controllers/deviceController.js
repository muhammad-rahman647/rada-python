const fs = require('fs');
const {
   spawn
} = require('child_process');
const catchAsync = require('../utils/catchAsync');

const Attendence = require('../models/attendence');


exports.receiveRequest = catchAsync(async (req, res, next) => {

   if (!req.body.userId || !req.body.temperature) {
      const error = new Error('Please provide the user ID');
      error.statusCode = 404;
      return next(error);
   }

   let employeeId;

   const filePath = req.file.path;

   const python = spawn('python', [
      'inference.py',
      `${req.body.userId}`,
      `./${filePath}`
   ]);

   python.stdout.on('data', function (data) {
      console.log('Pipe data from python script ...');
      employeeId = data.toString();
   });

   python.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);

      if (!id) {
         const error = new Error('Please provide the user ID');
         error.statusCode = 404;
         return next(error);
      }

      let id = employeeId.replace(/[\[\]']+/g, '');

      id = id.replace(/\r?\n|\r/g, "");


      const attendence = new Attendence({
         temperature: req.body.temperature,
         _employeeId: id
      });
      attendence.save().then(() => {

         fs.rmdir(`./${req.file.destination}`, {
            recursive: true
         }, (err) => {
            if (err) {
               throw err;
            }

            console.log(`file is deleted!`);
         });

         if (code === 0) {
            res.status(200).send({
               status: 'success',
               data: {}
            });
         }

      }).catch(err => console.log(err));

      // send data to browse;
      if (code === 1) {
         return res.status(404).json({
            status: 'fail',
            data: {
               message: 'No found User!'
            }
         });
      }
   });

});